import OpenAI from "openai";
import { aiConfig, isAIConfigured } from "../config/aiConfig";
import { toolDefinitions, executeTool } from "./chatTools";

// ─── Types ───────────────────────────────────────────────────────────

interface ConversationMessage {
    role: "user" | "assistant";
    content: string;
}

// ─── Build Tools Description for System Prompt ───────────────────────

const buildToolsDescription = (): string => {
    const toolLines = toolDefinitions.map((t) => {
        const fn = t.function;
        const params = fn.parameters.properties || {};
        const paramDesc = Object.entries(params)
            .map(([name, schema]: [string, any]) => `    - ${name} (${schema.type}): ${schema.description || ""}`)
            .join("\n");
        const paramsBlock = paramDesc ? `\n  Parameters:\n${paramDesc}` : "\n  Parameters: none";
        return `- ${fn.name}: ${fn.description}${paramsBlock}`;
    });
    return toolLines.join("\n\n");
};

// ─── System Prompt ───────────────────────────────────────────────────

const SYSTEM_PROMPT = `You are a helpful assistant for "आकस्मिक निधि संस्था" (Aakasmik Nidhi Sanstha), a community-driven emergency fund organization.

Your role:
- Answer questions about the sanstha, its members, contributions, expenses, and fund balance.
- Be friendly, concise, and helpful.
- If the user asks in Hindi, respond in Hindi. If they ask in English, respond in English.
- Format monetary amounts in Indian Rupees (₹).
- When listing data, use clear formatting with bullet points or numbered lists.
- If you don't know something or can't find the data, say so honestly.
- Never reveal sensitive information like passwords, secrets, or tokens.
- For questions outside the scope of the sanstha, politely redirect the user.

Important context:
- This is an emergency fund where members contribute monthly.
- Contributions are verified by admins with payment screenshot proof.
- The fund supports members during emergencies.
- Roles: member, admin, superadmin.

## Available Tools

You have access to the following tools to query the database. To use a tool, respond with EXACTLY this format (and nothing else before or after):

TOOL_CALL: tool_name({"param1": "value1", "param2": "value2"})

If the tool requires no parameters, use:

TOOL_CALL: tool_name({})

Available tools:

${buildToolsDescription()}

IMPORTANT RULES:
1. Use ONLY ONE tool call per response.
2. If you need data, respond with ONLY the TOOL_CALL line — no other text.
3. After receiving tool results, formulate a natural language answer for the user.
4. If no tool is needed, respond directly with helpful text.
5. NEVER fabricate data. Always use tools to get real data from the database.`;

// ─── Agent Configuration ─────────────────────────────────────────────

const MAX_TOOL_ITERATIONS = 5;

// ─── Parse Tool Call from LLM Response ───────────────────────────────

const parseToolCall = (text: string): { toolName: string; args: Record<string, any> } | null => {
    const trimmed = text.trim();
    // Match TOOL_CALL: tool_name({...})
    const match = trimmed.match(/TOOL_CALL:\s*(\w+)\((\{[\s\S]*\})\)/);
    if (match) {
        try {
            const toolName = match[1];
            const args = JSON.parse(match[2]);
            return { toolName, args };
        } catch {
            return null;
        }
    }
    return null;
};

// ─── Run Agent ───────────────────────────────────────────────────────

export const runChatAgent = async (
    userMessage: string,
    conversationHistory: ConversationMessage[] = []
): Promise<string> => {
    if (!isAIConfigured()) {
        return "The AI chatbot is not configured yet. Please ask an admin to set up the OpenAI API key.";
    }

    console.log(`🤖 AI Config → model: "${aiConfig.model}", baseURL: "${aiConfig.baseURL}"`);

    const openai = new OpenAI({
        apiKey: aiConfig.apiKey,
        baseURL: aiConfig.baseURL,
    });

    // Build messages array
    const messages: any[] = [
        { role: "system", content: SYSTEM_PROMPT },
    ];

    // Add recent conversation history (last 10 exchanges to keep context manageable)
    const recentHistory = conversationHistory.slice(-10);
    for (const msg of recentHistory) {
        messages.push({ role: msg.role, content: msg.content });
    }

    // Add the current user message
    messages.push({ role: "user", content: userMessage });

    // Agent loop — keep calling tools until we get a text response
    for (let iteration = 0; iteration < MAX_TOOL_ITERATIONS; iteration++) {
        try {
            const response = await openai.chat.completions.create({
                model: aiConfig.model,
                messages,
            });

            const choice = response.choices[0];
            const assistantText = choice.message.content || "";

            // Check if the LLM wants to call a tool
            const toolCall = parseToolCall(assistantText);

            if (toolCall) {
                console.log(`🔧 Executing tool: ${toolCall.toolName}`, toolCall.args);
                const toolResult = await executeTool(toolCall.toolName, toolCall.args);
                console.log(`✅ Tool result for ${toolCall.toolName}:`, toolResult.substring(0, 200));

                // Add assistant's tool call and tool result to messages
                messages.push({ role: "assistant", content: assistantText });
                messages.push({
                    role: "user",
                    content: `Tool "${toolCall.toolName}" returned the following data:\n${toolResult}\n\nNow please use this data to answer the user's original question in a natural, helpful way.`,
                });

                // Continue the loop to let the LLM process tool results
                continue;
            }

            // No tool call — we have a final text response
            return assistantText || "I'm sorry, I couldn't generate a response. Please try again.";
        } catch (error) {
            console.error("Error in chat agent:", error);
            const errorMessage = (error as Error).message;

            if (errorMessage.includes("401") || errorMessage.includes("Unauthorized")) {
                return "The AI service authentication failed. Please check the API key configuration.";
            }
            if (errorMessage.includes("429") || errorMessage.includes("Rate limit")) {
                return "The AI service is currently rate limited. Please try again in a moment.";
            }
            if (errorMessage.includes("model")) {
                return `The configured AI model "${aiConfig.model}" may not be available. Please check the model configuration.`;
            }

            return "I'm sorry, something went wrong while processing your request. Please try again later.";
        }
    }

    // If we hit the max iterations, return what we have
    return "I needed too many steps to answer your question. Could you try asking in a simpler way?";
};
