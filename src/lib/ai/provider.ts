// Thin server-only wrapper over Azure OpenAI (OpenAI-compatible v1 endpoint).
// Designed to DEGRADE GRACEFULLY: if no key is configured, callers fall back to
// deterministic heuristics so the prototype always works in a demo.
//
// The configured deployment (o4-mini) is a reasoning model: it uses
// `max_completion_tokens` and does NOT accept a `temperature` parameter.

export function hasAI(): boolean {
  return Boolean(process.env.AZURE_OPENAI_API_KEY && process.env.AZURE_OPENAI_BASE_URL);
}

interface GenerateOptions {
  system?: string;
  json?: boolean;
  maxTokens?: number;
  // Use the stronger reasoning deployment (for heavier tasks like roadmaps).
  strong?: boolean;
}

interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

// The stronger deployment (e.g. gpt-5.4-mini) falls back to the default model
// until AZURE_OPENAI_DEPLOYMENT_STRONG is configured.
function modelFor(strong?: boolean): string {
  const base = process.env.AZURE_OPENAI_DEPLOYMENT || "o4-mini";
  if (strong) return process.env.AZURE_OPENAI_DEPLOYMENT_STRONG || base;
  return base;
}

async function chat(
  messages: ChatMessage[],
  opts: { json?: boolean; maxTokens?: number; strong?: boolean } = {},
): Promise<string | null> {
  const base = process.env.AZURE_OPENAI_BASE_URL;
  const key = process.env.AZURE_OPENAI_API_KEY;
  const model = modelFor(opts.strong);
  if (!base || !key) return null;

  const url = `${base.replace(/\/$/, "")}/chat/completions`;

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key": key,
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify({
        model,
        messages,
        // Reasoning models need generous token budget (reasoning + output).
        max_completion_tokens: opts.maxTokens ?? 3000,
        ...(opts.json ? { response_format: { type: "json_object" } } : {}),
      }),
      // Reasoning models can be slow; allow headroom but never hang the demo.
      signal: AbortSignal.timeout(30000),
    });

    if (!res.ok) return null;
    const data = await res.json();
    const text: string | undefined = data?.choices?.[0]?.message?.content;
    return text?.trim() || null;
  } catch {
    return null;
  }
}

export async function generateText(
  prompt: string,
  opts: GenerateOptions = {},
): Promise<string | null> {
  const messages: ChatMessage[] = [];
  if (opts.system) messages.push({ role: "system", content: opts.system });
  messages.push({ role: "user", content: prompt });
  return chat(messages, { json: opts.json, maxTokens: opts.maxTokens, strong: opts.strong });
}

export async function generateJSON<T>(
  prompt: string,
  opts: Omit<GenerateOptions, "json"> = {},
): Promise<T | null> {
  const messages: ChatMessage[] = [];
  if (opts.system) messages.push({ role: "system", content: opts.system });
  // For JSON mode the API requires the word "json" to appear in the messages.
  messages.push({ role: "user", content: `${prompt}\n\nRespond with valid JSON only.` });

  const text = await chat(messages, { json: true, maxTokens: opts.maxTokens, strong: opts.strong });
  if (!text) return null;
  try {
    return JSON.parse(text) as T;
  } catch {
    const match = text.match(/\{[\s\S]*\}/);
    if (match) {
      try {
        return JSON.parse(match[0]) as T;
      } catch {
        return null;
      }
    }
    return null;
  }
}
