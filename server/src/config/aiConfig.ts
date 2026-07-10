import dotenv from "dotenv";
import fs from "fs";
import path from "path";

// 1. Load .env into process.env for the rest of the application
const envPath = path.resolve(__dirname, "../../.env");
dotenv.config({ path: envPath });

// 2. Parse the .env file directly to get the EXACT values written in it
// This prevents system-level global variables from overriding your .env settings
let parsedEnv: Record<string, string> = {};
try {
    const envFileContent = fs.readFileSync(envPath, 'utf-8');
    parsedEnv = dotenv.parse(envFileContent);
} catch (e) {
    console.warn("Could not read .env file directly for AI config.");
}

// 3. Use getters, strictly preferring the parsed .env file values over process.env
export const aiConfig = {
    get apiKey(): string {
        return parsedEnv.OPENAI_API_KEY || process.env.OPENAI_API_KEY || "";
    },
    get baseURL(): string {
        return parsedEnv.OPENAI_BASE_URL || process.env.OPENAI_BASE_URL || "https://api.openai.com/v1";
    },
    get model(): string {
        return parsedEnv.OPENAI_MODEL || process.env.OPENAI_MODEL || "gpt-4o-mini";
    },
};

export const isAIConfigured = (): boolean => {
    return aiConfig.apiKey.length > 0;
};
