import "server-only";
import { NextResponse } from "next/server";
import { z } from "zod";
import { AIError } from "./ai";

export function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

/** Wraps a route handler: parses the JSON body with zod and maps errors to JSON responses. */
export function handler<T>(schema: z.ZodType<T>, fn: (body: T) => Promise<Response>) {
  return async (req: Request) => {
    let body: T;
    try {
      body = schema.parse(await req.json().catch(() => ({})));
    } catch (error) {
      const msg = error instanceof z.ZodError ? error.issues[0]?.message ?? "Invalid request" : "Invalid request";
      return jsonError(msg, 400);
    }
    try {
      return await fn(body);
    } catch (error) {
      if (error instanceof AIError) return jsonError(error.message, error.status);
      console.error(error);
      return jsonError("Something went wrong. Please try again.", 500);
    }
  };
}
