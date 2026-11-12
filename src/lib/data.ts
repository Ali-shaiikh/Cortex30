import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { createClient } from "./supabase/server";
import { currentDay, rawProgramDay } from "./day";
import { buildPlan, type Plan } from "./plan";
import type { Profile, Report, Submission } from "./types";

export type UserData = {
  profile: Profile;
  submissions: Submission[];
  reports: Report[];
  today: number;
  rawDay: number;
  plan: Plan;
};

/** Signed-in user's id from the verified JWT, or null. */
export const getUserId = cache(async (): Promise<string | null> => {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  return (data?.claims?.sub as string | undefined) ?? null;
});

async function fetchUserData(supabase: Awaited<ReturnType<typeof createClient>>, userId: string): Promise<UserData | null> {
  const [profileRes, subsRes, reportsRes] = await Promise.all([
    supabase.from("profiles").select("id, username, start_date, created_at").eq("id", userId).single(),
    supabase.from("submissions").select("*").eq("user_id", userId).order("created_at", { ascending: true }),
    supabase.from("reports").select("*").eq("user_id", userId).order("created_at", { ascending: false }),
  ]);
  if (!profileRes.data) return null;
  const profile = profileRes.data as Profile;
  const submissions = ((subsRes.data ?? []) as Submission[]).map((s) => ({ ...s, score: Number(s.score) }));
  return {
    profile,
    submissions,
    plan: buildPlan(profile.id, submissions),
    reports: (reportsRes.data ?? []) as Report[],
    today: currentDay(profile.start_date),
    rawDay: rawProgramDay(profile.start_date),
  };
}

/** For pages: loads everything for the signed-in user or redirects to /login. */
export const requireUserData = cache(async (): Promise<UserData> => {
  const userId = await getUserId();
  if (!userId) redirect("/login");
  const data = await fetchUserData(await createClient(), userId);
  if (!data) redirect("/login");
  return data;
});

/** For route handlers: returns the client + data, or null when signed out. */
export async function loadForApi() {
  const supabase = await createClient();
  const { data: claims } = await supabase.auth.getClaims();
  const userId = claims?.claims?.sub as string | undefined;
  if (!userId) return null;
  const data = await fetchUserData(supabase, userId);
  if (!data) return null;
  return { supabase, userId, ...data };
}
