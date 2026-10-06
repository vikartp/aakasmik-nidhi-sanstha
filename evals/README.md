# 🧪 AI Chatbot Evaluations

DeepEval-based evaluation pipeline for the Aakasmik Nidhi Sanstha AI chatbot. Fetches production traces from **Langfuse**, scores them with LLM-as-a-Judge metrics, and pushes results back to Langfuse.

## Quick Start

```bash
cd evals

# 1. Install dependencies (one command)
uv sync

# 2. Set up your environment
cp .env.example .env
# Edit .env with your actual Langfuse & OpenRouter keys

# 3. Run evaluations
uv run python run_evals.py --limit 5 --dry-run    # Preview (no scores pushed)
uv run python run_evals.py                        # Push scores to Langfuse
```

## What's Inside

| File               | Purpose                                                       |
|--------------------|---------------------------------------------------------------|
| `run_evals.py`     | Main pipeline: Langfuse traces → DeepEval metrics → scores   |
| `test_chatbot.py`  | Golden test suite: curated regression tests                   |
| `pyproject.toml`   | Project config & dependencies (uv-compatible)                 |
| `.env.example`     | Template for required environment variables                   |

## Commands

### Evaluate Production Traces

```bash
uv run python run_evals.py                          # Evaluate last 5 traces
uv run python run_evals.py --limit 50               # Evaluate last 50
uv run python run_evals.py --hours 24               # Only last 24 hours
uv run python run_evals.py --tag production          # Filter by Langfuse tag
uv run python run_evals.py --dry-run                 # Don't push scores
```

### Run Golden Test Suite

```bash
uv run python test_chatbot.py                        # Run all regression tests
uv run deepeval test run test_chatbot.py             # Via DeepEval CLI
uv run pytest test_chatbot.py -v                     # Via pytest
```

## Metrics

| Metric              | What it measures                                   |
|---------------------|----------------------------------------------------|
| Answer Relevancy    | Is the response relevant to the user's question?   |
| Toxicity            | Is the response toxic, offensive, or harmful?      |

> **Note:** Faithfulness and Hallucination metrics are available in DeepEval but require `retrieval_context` (e.g., RAG chunks). Since this chatbot uses tool calls rather than a vector DB, those are disabled by default. You can enable them by passing tool results as `retrieval_context` in `run_evals.py`.

## Environment Variables

| Variable              | Required | Description                           |
|-----------------------|----------|---------------------------------------|
| `LANGFUSE_SECRET_KEY` | ✅       | Langfuse project secret key           |
| `LANGFUSE_PUBLIC_KEY` | ✅       | Langfuse project public key           |
| `LANGFUSE_HOST`       |          | Langfuse host (default: cloud)        |
| `OPENAI_API_KEY`      | ✅       | OpenRouter API key (judge model)      |
| `OPENAI_API_BASE`     |          | API base URL (default: OpenRouter)    |
| `DEEPEVAL_MODEL`      |          | Judge model name                      |
| `CHATBOT_MODEL`       |          | Chatbot model for golden tests        |

## CI/CD

A GitHub Actions workflow is set up at `.github/workflows/ai-evals.yml` that runs:
- **Weekly** (Monday 6:00 AM IST)
- **On PRs** touching `server/src/ai/**` or `evals/**`
- **Manually** via GitHub Actions tab

Required repository secrets: `LANGFUSE_SECRET_KEY`, `LANGFUSE_PUBLIC_KEY`, `OPENAI_API_KEY`.
