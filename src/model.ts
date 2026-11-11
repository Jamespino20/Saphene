// Model client. Reads .env (MODEL_BASE_URL, MODEL_API_KEY, MODEL_NAME, MODEL_FALLBACK,
// plus optional MODEL_FALLBACK_BASE_URL / MODEL_FALLBACK_API_KEY / MODEL_FALLBACK_MODEL),
// calls an OpenAI-compatible chat/completions endpoint with retry/backoff and a
// two-level fallback chain: alternate model name on the primary endpoint, then a
// whole alternate provider endpoint. Primary = Meta, fallback provider = Google.
// Designed around observed 503 flakiness and provider outages.

import { readFileSync, existsSync } from "node:fs";
import { dirname } from "node:path";

export interface ModelConfig {
  baseUrl: string;
  apiKey: string;
  model: string;
  fallback?: string;
  fallbackBaseUrl?: string;
  fallbackApiKey?: string;
  fallbackModel?: string;
}

export interface ChatResult {
  content: string;
  model: string;
  usage?: unknown;
}

function parseEnvFile(envPath: string): Record<string, string> | null {
  if (!existsSync(envPath)) return null;
  const kv: Record<string, string> = {};
  for (const line of readFileSync(envPath, "utf8").split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Za-z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m) kv[m[1]] = m[2];
  }
  return kv;
}

function configFromKv(kv: Record<string, string>): ModelConfig | null {
  const baseUrl = kv.SAPHENE_MODEL_BASE_URL || kv.MODEL_BASE_URL;
  const apiKey = kv.SAPHENE_MODEL_API_KEY || kv.MODEL_API_KEY;
  const model = kv.SAPHENE_MODEL_NAME || kv.MODEL_NAME;
  if (!baseUrl || !apiKey || !model) return null;
  return {
    baseUrl: baseUrl.replace(/\/+$/, ""),
    apiKey,
    model,
    fallback: kv.SAPHENE_MODEL_FALLBACK || kv.MODEL_FALLBACK || undefined,
    fallbackBaseUrl: (kv.SAPHENE_MODEL_FALLBACK_BASE_URL || kv.MODEL_FALLBACK_BASE_URL)?.replace(/\/+$/, "") || undefined,
    fallbackApiKey: kv.SAPHENE_MODEL_FALLBACK_API_KEY || kv.MODEL_FALLBACK_API_KEY || undefined,
    fallbackModel: kv.SAPHENE_MODEL_FALLBACK_MODEL || kv.MODEL_FALLBACK_MODEL || undefined,
  };
}

export function resolveEnvPaths(source?: string, explicit?: string): string[] {
  const paths: string[] = [];
  if (explicit) paths.push(explicit);
  if (process.env.SAPHENE_ENV) paths.push(process.env.SAPHENE_ENV);
  paths.push(".env");
  if (source) {
    try {
      const dir = dirname(source);
      if (dir && dir !== ".") {
        paths.push(`${dir}/.env`);
        paths.push(`${dir}/.saphene/.env`);
      }
    } catch {
      // ignore unparseable source paths
    }
  }
  return [...new Set(paths)];
}

export function loadModelConfig(envPath = ".env", source?: string): ModelConfig | null {
  // SAPHENE_MODEL_* env vars are a full config with no file needed.
  const envOnly: Record<string, string> = {};
  for (const k of [
    "SAPHENE_MODEL_BASE_URL", "SAPHENE_MODEL_API_KEY", "SAPHENE_MODEL_NAME",
    "SAPHENE_MODEL_FALLBACK", "SAPHENE_MODEL_FALLBACK_BASE_URL",
    "SAPHENE_MODEL_FALLBACK_API_KEY", "SAPHENE_MODEL_FALLBACK_MODEL",
  ]) {
    if (process.env[k]) envOnly[k] = process.env[k] as string;
  }
  const fromEnv = configFromKv(envOnly);
  if (fromEnv) return fromEnv;

  for (const path of resolveEnvPaths(source, envPath === ".env" ? undefined : envPath)) {
    const kv = parseEnvFile(path);
    if (!kv) continue;
    const cfg = configFromKv({ ...kv, ...envOnly });
    if (cfg) return cfg;
  }
  return null;
}

const RETRIES_PER_MODEL = 3;
const RETRY_DELAY_MS = 5000;
const REQUEST_TIMEOUT_MS = 120_000;

export async function chat(
  cfg: ModelConfig,
  messages: Array<{ role: string; content: string }>,
  maxTokens = 4096,
): Promise<ChatResult> {
  interface Endpoint {
    baseUrl: string;
    apiKey: string;
    models: string[];
  }
  const endpoints: Endpoint[] = [
    {
      baseUrl: cfg.baseUrl,
      apiKey: cfg.apiKey,
      models: [cfg.model, ...(cfg.fallback ? [cfg.fallback] : [])],
    },
  ];
  if (cfg.fallbackBaseUrl) {
    endpoints.push({
      baseUrl: cfg.fallbackBaseUrl,
      apiKey: cfg.fallbackApiKey ?? cfg.apiKey,
      models: [cfg.fallbackModel ?? cfg.model],
    });
  }
  let lastError: unknown;
  let firstError: unknown;

  const hostOf = (url: string) => {
    try {
      return new URL(url).host;
    } catch {
      return url;
    }
  };

  for (const endpoint of endpoints) {
    for (const model of endpoint.models) {
      for (let attempt = 1; attempt <= RETRIES_PER_MODEL; attempt++) {
        try {
          const res = await fetch(`${endpoint.baseUrl}/chat/completions`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${endpoint.apiKey}`,
            },
            body: JSON.stringify({ model, messages, max_tokens: maxTokens }),
            signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
          });
          if (!res.ok) {
            const body = await res.text();
            throw new Error(`HTTP ${res.status} from ${model} @ ${hostOf(endpoint.baseUrl)}: ${body.slice(0, 300)}`);
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
    if (firstError === undefined) firstError = lastError;
  }

  if (firstError !== undefined && firstError !== lastError) {
    const fmsg = firstError instanceof Error ? firstError.message : String(firstError);
    const lmsg = lastError instanceof Error ? lastError.message : String(lastError);
    throw new Error(`Primary endpoint failed: ${fmsg.slice(0, 300)} | Fallback endpoint failed: ${lmsg.slice(0, 300)}`);
  }
  throw lastError instanceof Error ? lastError : new Error(String(lastError));
}
