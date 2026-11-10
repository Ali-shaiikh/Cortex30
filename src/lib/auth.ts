import { z } from "zod";

export const USERNAME_RE = /^[a-z0-9_]{3,20}$/;

export const credentialsSchema = z.object({
  username: z
    .string()
    .trim()
    .toLowerCase()
    .regex(USERNAME_RE, "Username must be 3-20 characters: lowercase letters, numbers or _"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

/** Supabase Auth requires an email, so usernames map onto a fake, never-mailed address. */
export function usernameToEmail(username: string): string {
  return `${username.toLowerCase()}@users.mindgym.local`;
}
