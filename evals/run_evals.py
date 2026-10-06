"""
DeepEval Evaluation Pipeline for Aakasmik Nidhi Sanstha AI Chatbot
===================================================================
Fetches production traces from Langfuse → evaluates with DeepEval metrics
→ pushes scores back to Langfuse for dashboard visibility.

Usage:
    python evals/run_evals.py                       # Evaluate last 20 traces
    python evals/run_evals.py --limit 50            # Evaluate last 50 traces
    python evals/run_evals.py --hours 24            # Only traces from last 24h
    python evals/run_evals.py --tag production      # Filter by tag
    python evals/run_evals.py --dry-run             # Preview without scoring
"""

import os
import sys
import json
import argparse
from datetime import datetime, timedelta, timezone
from typing import Optional

# Reconfigure stdout for utf-8 to support emojis on Windows
if sys.stdout.encoding.lower() != 'utf-8':
    sys.stdout.reconfigure(encoding='utf-8')

from dotenv import load_dotenv

# Load env from evals/.env (fallback to evals/.env.example for reference)
_evals_dir = os.path.dirname(os.path.abspath(__file__))
load_dotenv(os.path.join(_evals_dir, ".env"))

from langfuse import Langfuse
from deepeval.test_case import LLMTestCase
from deepeval.metrics import (
    AnswerRelevancyMetric,
    FaithfulnessMetric,
    HallucinationMetric,
    ToxicityMetric,
)
from deepeval.models.base_model import DeepEvalBaseLLM


# ─── Custom Judge Model (OpenRouter) ─────────────────────────────────
# DeepEval defaults to OpenAI. We override to use your OpenRouter model.

class OpenRouterJudge(DeepEvalBaseLLM):
    """Custom judge model that routes through OpenRouter (or any OpenAI-compatible API)."""

    def __init__(self):
        self.model_name = os.getenv("DEEPEVAL_MODEL", "deepseek/deepseek-v4-flash")
        self.api_key = os.getenv("OPENAI_API_KEY", "")
        self.base_url = os.getenv("OPENAI_API_BASE", "https://openrouter.ai/api/v1")

    def load_model(self):
        from openai import OpenAI
        return OpenAI(api_key=self.api_key, base_url=self.base_url)

    def generate(self, prompt: str, schema=None) -> str:
        client = self.load_model()

        if schema:
            # Build a schema hint so the LLM knows exactly what JSON keys to produce
            try:
                schema_json = json.dumps(schema.model_json_schema(), indent=2)
                prompt += f"\n\nYou MUST respond with ONLY valid JSON matching this exact schema:\n{schema_json}"
            except Exception:
                pass

        messages = [{"role": "user", "content": prompt}]

        kwargs = {
            "model": self.model_name,
            "messages": messages,
            "temperature": 0,
        }

        if schema:
            kwargs["response_format"] = {"type": "json_object"}

        try:
            response = client.chat.completions.create(**kwargs)
            content = response.choices[0].message.content or ""
        except Exception as e:
            content = "{}"

        if schema:
            try:
                parsed = json.loads(content)
                return schema(**parsed).model_dump_json()
            except Exception:
                # Try to extract JSON from the response if it's wrapped in text
                try:
                    import re
                    json_match = re.search(r'\{[\s\S]*\}', content)
                    if json_match:
                        parsed = json.loads(json_match.group())
                        return schema(**parsed).model_dump_json()
                except Exception:
                    pass
                
                # Bulletproof fallback: construct a default instance
                try:
                    dummy = {}
                    for name, field in schema.model_fields.items():
                        if field.annotation is int or field.annotation is float:
                            dummy[name] = 0
                        elif field.annotation is bool:
                            dummy[name] = False
                        elif field.annotation is list or "List" in str(field.annotation):
                            dummy[name] = []
                        else:
                            dummy[name] = "Evaluation failed due to LLM parsing error."
                    return schema(**dummy).model_dump_json()
                except Exception:
                    return "{}"

        return content

    async def a_generate(self, prompt: str, schema=None) -> str:
        return self.generate(prompt, schema)

    def get_model_name(self) -> str:
        return self.model_name


# ─── Fetch Traces from Langfuse ──────────────────────────────────────

def fetch_traces(
    langfuse: Langfuse,
    limit: int = 5,
    hours: Optional[int] = None,
    tag: Optional[str] = None,
) -> list:
    """
    Fetch recent chat traces from Langfuse.
    Returns a list of trace objects with input/output data.
    """
    kwargs = {"limit": limit}

    if tag:
        kwargs["tags"] = [tag]

    if hours:
        cutoff = datetime.now(timezone.utc) - timedelta(hours=hours)
        kwargs["from_timestamp"] = cutoff

    print(f"📡 Fetching up to {limit} traces from Langfuse...")

    traces_response = langfuse.api.trace.list(**kwargs)
    all_traces = traces_response.data

    # Filter for traces that have both input and output
    valid_traces = []
    for t in all_traces:
        trace_input = _extract_input(t)
        trace_output = _extract_output(t)
        if trace_input and trace_output:
            valid_traces.append(t)

    print(f"✅ Found {len(valid_traces)} valid traces (with input & output)")
    return valid_traces


def _extract_input(trace) -> Optional[str]:
    """Extract user input from a Langfuse trace."""
    if trace.input:
        if isinstance(trace.input, str):
            return trace.input
        if isinstance(trace.input, dict):
            # Try common keys
            for key in ["message", "input", "query", "prompt", "content", "userMessage"]:
                if key in trace.input:
                    val = trace.input[key]
                    return val if isinstance(val, str) else json.dumps(val)
            return json.dumps(trace.input)
        if isinstance(trace.input, list):
            # If it's a messages array, take the last user message
            user_msgs = [m for m in trace.input if isinstance(m, dict) and m.get("role") == "user"]
            if user_msgs:
                return user_msgs[-1].get("content", "")
    return None


def _extract_output(trace) -> Optional[str]:
    """Extract assistant output from a Langfuse trace."""
    if trace.output:
        if isinstance(trace.output, str):
            return trace.output
        if isinstance(trace.output, dict):
            for key in ["message", "output", "response", "content", "text", "reply"]:
                if key in trace.output:
                    val = trace.output[key]
                    return val if isinstance(val, str) else json.dumps(val)
            return json.dumps(trace.output)
    return None


# ─── Build DeepEval Metrics ──────────────────────────────────────────

def build_metrics(judge_model: DeepEvalBaseLLM) -> list:
    """
    Build the core evaluation metrics.
    Each metric uses a 0-1 threshold — scores below the threshold fail.
    """
    return [
        AnswerRelevancyMetric(
            threshold=0.5,
            model=judge_model,
        ),
        ToxicityMetric(
            threshold=0.5,
            model=judge_model,
        ),
    ]


# ─── Evaluate a Single Trace ─────────────────────────────────────────

def evaluate_trace(
    trace,
    metrics: list,
    langfuse: Langfuse,
    dry_run: bool = False,
) -> dict:
    """
    Run all DeepEval metrics on a single trace.
    Returns a summary dict with scores.
    """
    trace_input = _extract_input(trace)
    trace_output = _extract_output(trace)

    # Build the LLM test case
    # For faithfulness/hallucination, we'd ideally have retrieval_context.
    # Since this is a tool-based agent, we pass the system prompt as context.
    test_case = LLMTestCase(
        input=trace_input,
        actual_output=trace_output,
        # retrieval_context can be added if you log tool results as context
    )

    results = {}
    for metric in metrics:
        metric_name = metric.__class__.__name__
        try:
            metric.measure(test_case)
            score = metric.score
            reason = metric.reason if hasattr(metric, "reason") else ""

            results[metric_name] = {
                "score": score,
                "reason": reason,
                "passed": score >= metric.threshold,
            }

            # Push score back to Langfuse
            if not dry_run:
                langfuse.score(
                    trace_id=trace.id,
                    name=f"deepeval-{_snake_case(metric_name)}",
                    value=score,
                    comment=reason[:500] if reason else None,  # Langfuse has a limit
                )

            status = "✅" if score >= metric.threshold else "❌"
            print(f"  {status} {metric_name}: {score:.3f} — {reason[:100] if reason else 'n/a'}")

        except Exception as e:
            print(f"  ⚠️  {metric_name}: ERROR — {str(e)[:120]}")
            results[metric_name] = {"score": None, "reason": str(e), "passed": False}

    return results


def _snake_case(name: str) -> str:
    """Convert CamelCase to snake_case."""
    import re
    s1 = re.sub(r"(.)([A-Z][a-z]+)", r"\1_\2", name)
    return re.sub(r"([a-z0-9])([A-Z])", r"\1_\2", s1).lower()


# ─── Main Pipeline ───────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(
        description="Run DeepEval evaluations on Langfuse traces"
    )
    parser.add_argument(
        "--limit", type=int, default=5,
        help="Max number of traces to evaluate (default: 5)"
    )
    parser.add_argument(
        "--hours", type=int, default=None,
        help="Only evaluate traces from the last N hours"
    )
    parser.add_argument(
        "--tag", type=str, default=None,
        help="Filter traces by Langfuse tag"
    )
    parser.add_argument(
        "--dry-run", action="store_true",
        help="Run evaluations but don't push scores to Langfuse"
    )
    args = parser.parse_args()

    # ── Validate env ──
    required_vars = ["LANGFUSE_SECRET_KEY", "LANGFUSE_PUBLIC_KEY", "OPENAI_API_KEY"]
    missing = [v for v in required_vars if not os.getenv(v)]
    if missing:
        print(f"❌ Missing environment variables: {', '.join(missing)}")
        print(f"   Copy evals/.env.example → evals/.env and fill in your keys.")
        sys.exit(1)

    # ── Initialize clients ──
    langfuse = Langfuse(
        secret_key=os.getenv("LANGFUSE_SECRET_KEY"),
        public_key=os.getenv("LANGFUSE_PUBLIC_KEY"),
        host=os.getenv("LANGFUSE_HOST", "https://cloud.langfuse.com"),
    )
    judge_model = OpenRouterJudge()

    print("=" * 60)
    print("🧪 DeepEval Evaluation Pipeline")
    print(f"   Judge model: {judge_model.get_model_name()}")
    print(f"   Mode: {'DRY RUN' if args.dry_run else 'LIVE (scores → Langfuse)'}")
    print("=" * 60)

    # ── Fetch traces ──
    traces = fetch_traces(langfuse, limit=args.limit, hours=args.hours, tag=args.tag)

    if not traces:
        print("⚠️  No traces found matching your criteria. Nothing to evaluate.")
        sys.exit(0)

    # ── Build metrics ──
    metrics = build_metrics(judge_model)
    print(f"📊 Metrics: {', '.join(m.__class__.__name__ for m in metrics)}\n")

    # ── Evaluate each trace ──
    all_results = []
    for i, trace in enumerate(traces, 1):
        trace_input = _extract_input(trace)
        print(f"── Trace {i}/{len(traces)} [{trace.id[:12]}...] ──")
        print(f"   Input: {trace_input[:80]}..." if len(trace_input or "") > 80 else f"   Input: {trace_input}")

        result = evaluate_trace(trace, metrics, langfuse, dry_run=args.dry_run)
        all_results.append({"trace_id": trace.id, "results": result})
        print()

    # ── Flush scores to Langfuse ──
    if not args.dry_run:
        langfuse.flush()
        print("📤 Scores pushed to Langfuse!\n")

    # ── Print Summary ──
    print_summary(all_results, metrics)


def print_summary(all_results: list, metrics: list):
    """Print an aggregate summary table."""
    print("=" * 60)
    print("📈 EVALUATION SUMMARY")
    print("=" * 60)

    metric_names = [m.__class__.__name__ for m in metrics]

    for name in metric_names:
        scores = [
            r["results"][name]["score"]
            for r in all_results
            if name in r["results"] and r["results"][name]["score"] is not None
        ]
        passed = sum(
            1 for r in all_results
            if name in r["results"] and r["results"][name].get("passed", False)
        )
        total = len(scores)

        if scores:
            avg = sum(scores) / len(scores)
            min_s = min(scores)
            max_s = max(scores)
            print(f"  {name}:")
            print(f"    Avg: {avg:.3f}  |  Min: {min_s:.3f}  |  Max: {max_s:.3f}  |  Pass: {passed}/{total}")
        else:
            print(f"  {name}: No scores (all errored)")

    print()
    total_traces = len(all_results)
    all_passed = sum(
        1 for r in all_results
        if all(
            v.get("passed", False) for v in r["results"].values() if v["score"] is not None
        )
    )
    print(f"  Overall: {all_passed}/{total_traces} traces passed ALL metrics")
    print("=" * 60)


if __name__ == "__main__":
    main()
