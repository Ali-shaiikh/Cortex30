import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { AIError } from "./ai";
import { localDate } from "./day";

export const AI_DAILY_LIMIT = Number(process.env.AI_DAILY_LIMIT) || 15;

const limitError = () => new AIError(`You've used all ${AI_DAILY_LIMIT} coach calls for today. They reset at midnight (IST).`, 429);

/** Throws a 429 AIError if the signed-in user has no AI calls left today. Does not spend one. */
export async function assertAiQuota(supabase: SupabaseClient, userId: string): Promise<void> {
  const { data, error } = await supabase.from("profiles").select("ai_calls_date, ai_calls_count").eq("id", userId).single();
  if (error) throw new AIError(`Could not check the AI limit: ${error.message}`, 500);
  if (data.ai_calls_date === localDate() && data.ai_calls_count >= AI_DAILY_LIMIT) throw limitError();
}

/** Spends one AI call for the signed-in user (atomic, in Postgres). Throws a 429 AIError when the limit is hit. */
export async function consumeAiCall(supabase: SupabaseClient): Promise<number> {
  const { data, error } = await supabase.rpc("consume_ai_call", { daily_limit: AI_DAILY_LIMIT });
  if (error) throw new AIError(`Could not check the AI limit: ${error.message}`, 500);
  if (data === -1) throw limitError();
  return data as number;
}

/**
 * Runs an AI call against the daily quota: checks first, and only charges the call if the AI
 * actually answered (failed or timed-out requests don't use up the user's quota).
 */
export async function withAiQuota<T>(supabase: SupabaseClient, userId: string, run: () => Promise<T>): Promise<T> {
  await assertAiQuota(supabase, userId);
  const result = await run();
  await consumeAiCall(supabase);
  return result;
}
