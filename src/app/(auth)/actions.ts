"use server";

import { redirect } from "next/navigation";
import { credentialsSchema, usernameToEmail } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export type AuthState = { error?: string; username?: string };

/** Where to go after logging in. The home page plays the brain boot sequence (?boot=1). */
function safeNext(next: FormDataEntryValue | null): string {
  const value = typeof next === "string" ? next : "";
  return value.startsWith("/") && !value.startsWith("//") && value !== "/" ? value : "/?boot=1";
}

export async function signup(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const parsed = credentialsSchema.safeParse({
    username: formData.get("username"),
    password: formData.get("password"),
  });
  const username = String(formData.get("username") ?? "");
  if (!parsed.success) return { error: parsed.error.issues[0].message, username };

  const supabase = await createClient();
  const { data: available } = await supabase.rpc("username_available", { name: parsed.data.username });
  if (available === false) return { error: "That username is taken.", username };

  const { data, error } = await supabase.auth.signUp({
    email: usernameToEmail(parsed.data.username),
    password: parsed.data.password,
    options: { data: { username: parsed.data.username } },
  });
  if (error) {
    const msg = /already registered/i.test(error.message) ? "That username is taken." : error.message;
    return { error: msg, username };
  }
  if (!data.session) {
    return {
      error: "Account created, but Supabase wants email confirmation. Turn off “Confirm email” in Supabase (see README), then log in.",
      username,
    };
  }
  redirect("/?boot=1");
}

export async function login(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const parsed = credentialsSchema.safeParse({
    username: formData.get("username"),
    password: formData.get("password"),
  });
  const username = String(formData.get("username") ?? "");
  if (!parsed.success) return { error: "Wrong username or password.", username };

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: usernameToEmail(parsed.data.username),
    password: parsed.data.password,
  });
  if (error) return { error: "Wrong username or password.", username };
  redirect(safeNext(formData.get("next")));
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
