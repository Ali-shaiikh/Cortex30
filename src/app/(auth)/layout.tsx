import { StaticBrain } from "@/components/brain/StaticBrain";

export default function AuthLayout({ children }: LayoutProps<"/">) {
  return (
    <main className="relative flex min-h-dvh flex-col items-center justify-center gap-8 overflow-hidden px-4 py-10">
      <div aria-hidden className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-40">
        <StaticBrain className="w-[min(900px,140vw)]" />
      </div>
      <div className="relative text-center">
        <p className="font-mono text-xs tracking-[0.3em] text-rim/80">30 DAYS · 4 SKILLS · 120 REPS</p>
        <p className="mt-2 text-4xl font-semibold tracking-tight">Mind Gym</p>
      </div>
      <div className="relative flex w-full justify-center">{children}</div>
    </main>
  );
}
