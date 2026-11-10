import { supabaseConfigured } from "@/lib/supabase/env";
import { redirect } from "next/navigation";

export default function SetupPage() {
  if (supabaseConfigured) redirect("/");
  return (
    <main className="mx-auto flex min-h-dvh max-w-xl flex-col justify-center gap-4 px-4">
      <h1 className="text-2xl font-semibold">Mind Gym needs a database</h1>
      <p className="text-white/70">
        Supabase isn&apos;t configured yet. Copy <code className="font-mono">.env.example</code> to{" "}
        <code className="font-mono">.env.local</code>, fill in <code className="font-mono">NEXT_PUBLIC_SUPABASE_URL</code> and{" "}
        <code className="font-mono">NEXT_PUBLIC_SUPABASE_ANON_KEY</code>, then restart the dev server. The README walks
        through every step.
      </p>
    </main>
  );
}
