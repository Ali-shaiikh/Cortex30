import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-4 px-4 text-center">
      <p className="font-mono text-xs tracking-[0.35em] text-magenta">ERROR 404</p>
      <h1 className="display neon text-3xl font-black">Synapse not found</h1>
      <p className="max-w-sm font-read text-cyan-50/60">This pathway doesn&apos;t exist in your brain. Yet.</p>
      <Link href="/" className="btn btn-primary mt-2">
        Back to cortex
      </Link>
    </main>
  );
}
