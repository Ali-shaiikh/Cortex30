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
const gemini: Provider = {
  name: "gemini",
  async complete({ system, prompt, json, maxTokens = 4096 }) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) throw new AIError("GEMINI_API_KEY is not set", 500);
    const model = process.env.GEMINI_MODEL || "gemini-flash-latest";
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": key },
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
    if (res.status === 429) throw new AIError("The free Gemini quota is busy. Try again in a minute.", 429);
    if (!res.ok) throw new AIError(`Gemini error ${res.status}: ${(await res.text()).slice(0, 300)}`);
    const data = await res.json();
    const text: string = (data?.candidates?.[0]?.content?.parts ?? [])
      .filter((p: { text?: string; thought?: boolean }) => p.text && !p.thought)
      .map((p: { text: string }) => p.text)
      .join("");
    if (!text) throw new AIError("Gemini returned an empty response");
    return text;
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
