import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { AIError } from "./ai";

export const AI_DAILY_LIMIT = Number(process.env.AI_DAILY_LIMIT) || 15;

/** Spends one AI call for the signed-in user. Throws a 429 AIError when today's limit is used up. */
export async function consumeAiCall(supabase: SupabaseClient): Promise<number> {
  const { data, error } = await supabase.rpc("consume_ai_call", { daily_limit: AI_DAILY_LIMIT });
  if (error) throw new AIError(`Could not check the AI limit: ${error.message}`, 500);
  if (data === -1) {
    throw new AIError(`You've used all ${AI_DAILY_LIMIT} coach calls for today. They reset at midnight (IST).`, 429);
  }
  return data as number;
}
