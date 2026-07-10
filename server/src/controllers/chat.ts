import { Request, Response } from "express";
import { runChatAgent } from "../ai/chatAgent";

interface ChatRequest {
    message: string;
    history?: Array<{ role: "user" | "assistant"; content: string }>;
}

export const handleChatMessage = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        const { message, history } = req.body as ChatRequest;

        if (!message || typeof message !== "string" || message.trim().length === 0) {
            res.status(400).json({ error: "Message is required and must be a non-empty string." });
            return;
        }

        // Limit message length to prevent abuse
        if (message.length > 1000) {
            res.status(400).json({ error: "Message is too long. Please keep it under 1000 characters." });
            return;
        }

        // Validate history format if provided
        const validHistory = Array.isArray(history)
            ? history
                .filter(
                    (h) =>
                        h &&
                        typeof h.role === "string" &&
                        typeof h.content === "string" &&
                        (h.role === "user" || h.role === "assistant")
                )
                .slice(-10) // Only keep last 10 messages for context
            : [];

        const reply = await runChatAgent(message.trim(), validHistory, req.user);

        // Log who is using the chat endpoint and what they are asking
        console.log(`[Chat Log] User: ${req.user?.name} (Mobile: ${req.user?.mobile}, ID: ${req.user?._id}) asked: "${message.trim()}"`);

        res.status(200).json({ reply });
    } catch (error) {
        console.error("Error in chat controller:", error);
        res.status(500).json({
            error: "An internal error occurred while processing your message.",
        });
    }
};
