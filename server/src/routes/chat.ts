import { Router, Request, Response } from "express";
import { handleChatMessage } from "../controllers/chat";

const router = Router();

// ─── Simple In-Memory Rate Limiter ───────────────────────────────────

interface RateLimitEntry {
    count: number;
    resetTime: number;
}

const rateLimitMap = new Map<string, RateLimitEntry>();
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 20; // 20 requests per minute per IP

// Clean up old entries periodically (every 5 minutes)
setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of rateLimitMap.entries()) {
        if (now > entry.resetTime) {
            rateLimitMap.delete(key);
        }
    }
}, 5 * 60 * 1000);

const rateLimiter = (req: Request, res: Response, next: Function): void => {
    const ip = req.ip || req.socket.remoteAddress || "unknown";
    const now = Date.now();

    let entry = rateLimitMap.get(ip);

    if (!entry || now > entry.resetTime) {
        // New window
        entry = {
            count: 1,
            resetTime: now + RATE_LIMIT_WINDOW_MS,
        };
        rateLimitMap.set(ip, entry);
        next();
        return;
    }

    entry.count++;

    if (entry.count > RATE_LIMIT_MAX_REQUESTS) {
        const retryAfterSeconds = Math.ceil((entry.resetTime - now) / 1000);
        res.status(429).json({
            error: `Too many requests. Please try again in ${retryAfterSeconds} seconds.`,
        });
        return;
    }

    next();
};

// ─── Routes ──────────────────────────────────────────────────────────

router.post("/message", rateLimiter, handleChatMessage);

export default router;
