// Model client. Reads .env (MODEL_BASE_URL, MODEL_API_KEY, MODEL_NAME, MODEL_FALLBACK),
// calls an OpenAI-compatible chat/completions endpoint with retry/backoff and a
// fallback model chain. Designed around observed 503 flakiness.

import { readFileSync, existsSync } from "node:fs";

export interface ModelConfig {
  baseUrl: string;
  apiKey: string;
  model: string;
  fallback?: string;
}

export interface ChatResult {
  content: string;
  model: string;
  usage?: unknown;
}

export function loadModelConfig(envPath = ".env"): ModelConfig | null {
  if (!existsSync(envPath)) return null;
  const kv: Record<string, string> = {};
  for (const line of readFileSync(envPath, "utf8").split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Za-z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m) kv[m[1]] = m[2];
  }
  if (!kv.MODEL_BASE_URL || !kv.MODEL_API_KEY || !kv.MODEL_NAME) return null;
  return {
    baseUrl: kv.MODEL_BASE_URL.replace(/\/+$/, ""),
    apiKey: kv.MODEL_API_KEY,
    model: kv.MODEL_NAME,
    fallback: kv.MODEL_FALLBACK || undefined,
  };
}

const RETRIES_PER_MODEL = 3;
const RETRY_DELAY_MS = 5000;
const REQUEST_TIMEOUT_MS = 120_000;

export async function chat(
  cfg: ModelConfig,
  messages: Array<{ role: string; content: string }>,
  maxTokens = 4096,
): Promise<ChatResult> {
  const models = [cfg.model, ...(cfg.fallback ? [cfg.fallback] : [])];
  let lastError: unknown;

  for (const model of models) {
    for (let attempt = 1; attempt <= RETRIES_PER_MODEL; attempt++) {
      try {
        const res = await fetch(`${cfg.baseUrl}/chat/completions`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${cfg.apiKey}`,
          },
          body: JSON.stringify({ model, messages, max_tokens: maxTokens }),
          signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
        });
        if (!res.ok) {
          const body = await res.text();
          throw new Error(`HTTP ${res.status} from ${model}: ${body.slice(0, 300)}`);
        }
        const json = (await res.json()) as {
          choices?: Array<{ message?: { content?: string } }>;
          usage?: unknown;
        };
        const content = json.choices?.[0]?.message?.content;
        if (typeof content !== "string" || content.length === 0) {
          throw new Error(`Empty completion from ${model}`);
        }
        return { content, model, usage: json.usage };
      } catch (err) {
        lastError = err;
        if (attempt < RETRIES_PER_MODEL) {
          await new Promise((r) => setTimeout(r, RETRY_DELAY_MS * attempt));
        }
      }
    }
  }

  throw lastError instanceof Error ? lastError : new Error(String(lastError));
}
