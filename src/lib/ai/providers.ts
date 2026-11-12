import "server-only";
import Anthropic from "@anthropic-ai/sdk";

export type CompleteArgs = { system: string; prompt: string; json?: boolean; maxTokens?: number };
export type Provider = { name: string; complete(args: CompleteArgs): Promise<string> };

export class AIError extends Error {
  constructor(message: string, public status = 502) {
    super(message);
  }
}

// --- Google Gemini (default, free tier) via REST ----------------------------------
// The "-latest" aliases are often overloaded (503s, 90 s+ waits), so we pin a fast model, cap each
// attempt with a timeout, and fall back to the lite model when the first one is busy.
const GEMINI_ATTEMPT_TIMEOUT_MS = 35_000;
const RETRYABLE = new Set([404, 429, 500, 503, 504]);

async function geminiOnce(model: string, key: string, { system, prompt, json, maxTokens = 4096 }: CompleteArgs): Promise<string> {
  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-goog-api-key": key },
    signal: AbortSignal.timeout(GEMINI_ATTEMPT_TIMEOUT_MS),
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: system }] },
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.4,
        maxOutputTokens: maxTokens,
        ...(json ? { responseMimeType: "application/json" } : {}),
      },
    }),
  });
  if (!res.ok) {
    const body = (await res.text()).slice(0, 300);
    throw new AIError(res.status === 429 ? "The free Gemini quota is busy. Try again in a minute." : `Gemini error ${res.status}: ${body}`, res.status);
  }
  const data = await res.json();
  const text: string = (data?.candidates?.[0]?.content?.parts ?? [])
    .filter((p: { text?: string; thought?: boolean }) => p.text && !p.thought)
    .map((p: { text: string }) => p.text)
    .join("");
  if (!text) throw new AIError("Gemini returned an empty response");
  return text;
}

const gemini: Provider = {
  name: "gemini",
  async complete(args) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) throw new AIError("GEMINI_API_KEY is not set", 500);
    const models = [process.env.GEMINI_MODEL || "gemini-3.5-flash", process.env.GEMINI_FALLBACK_MODEL || "gemini-3.5-flash-lite"];
    let lastError: AIError = new AIError("Gemini is unavailable");
    for (const model of new Set(models)) {
      try {
        return await geminiOnce(model, key, args);
      } catch (error) {
        const timedOut = error instanceof Error && (error.name === "TimeoutError" || error.name === "AbortError");
        if (timedOut) {
          lastError = new AIError("The coach took too long to answer. Try again.", 504);
          continue;
        }
        if (error instanceof AIError && RETRYABLE.has(error.status)) {
          lastError = error;
          continue;
        }
        throw error;
      }
    }
    throw lastError;
  },
};

// --- Anthropic Claude (optional) via the official SDK --------------------------------
let anthropicClient: Anthropic | null = null;
const claude: Provider = {
  name: "claude",
  async complete({ system, prompt, maxTokens = 8000 }) {
    if (!process.env.ANTHROPIC_API_KEY) throw new AIError("ANTHROPIC_API_KEY is not set", 500);
    anthropicClient ??= new Anthropic();
    try {
      const response = await anthropicClient.beta.messages.create({
        model: process.env.CLAUDE_MODEL || "claude-opus-5-5",
        max_tokens: maxTokens,
        output_config: { effort: "medium" },
        // Server-side refusal fallback: re-runs a declined request on a suitable model.
        betas: ["server-side-fallback-2026-07-01"],
        fallbacks: "default",
        system,
        messages: [{ role: "user", content: prompt }],
      });
      if (response.stop_reason === "refusal") throw new AIError("The coach declined to answer this one.");
      const text = response.content
        .filter((b): b is Anthropic.Beta.BetaTextBlock => b.type === "text")
        .map((b) => b.text)
        .join("");
      if (!text) throw new AIError("Claude returned an empty response");
      return text;
    } catch (error) {
      if (error instanceof AIError) throw error;
      if (error instanceof Anthropic.RateLimitError) throw new AIError("Claude is rate limited. Try again shortly.", 429);
      if (error instanceof Anthropic.AuthenticationError) throw new AIError("ANTHROPIC_API_KEY is invalid", 500);
      if (error instanceof Anthropic.APIError) throw new AIError(`Claude error ${error.status}: ${error.message}`);
      throw error;
    }
  },
};

// --- Mock (local development without any key: AI_PROVIDER=mock) ---------------------
const mock: Provider = {
  name: "mock",
  async complete({ prompt, json }) {
    if (!json) return "Mock coach: what would have to be true for your answer to be wrong? Test that first.";
    if (prompt.includes('"target_pattern"')) {
      return JSON.stringify({
        title: "Mock bonus drill",
        concept: "practice",
        prompt: "Mock bonus: list three assumptions behind your last answer and test one.",
        reference_solution: "Any three explicit assumptions with one test.",
        rubric: "Strong = three clear assumptions and a concrete test.",
      });
    }
    const creative = /CATEGORY: creative/.test(prompt);
    return JSON.stringify({
      verdict: creative ? "developing" : "partially_correct",
      score: 6,
      what_you_got_right: "Mock feedback: you committed to an answer and showed your steps.",
      where_your_thinking_went_wrong: "Mock feedback: set AI_PROVIDER=gemini with a GEMINI_API_KEY for real coaching.",
      how_to_think_about_it: "1. Restate the problem. 2. List the possibilities. 3. Test each one. 4. Sanity-check.",
      thinking_pattern: "stopped too early",
      transferable_lesson: "Check every case before you commit.",
      try_this_next: "Take your answer and spend two minutes trying to break it.",
    });
  },
};

export function getProvider(): Provider {
  const name = (process.env.AI_PROVIDER || "gemini").toLowerCase();
  if (name === "claude") return claude;
  if (name === "mock") return mock;
  return gemini;
}
