import { BrainStage } from "@/components/brain/BrainStage";
import { NeuralField } from "@/components/NeuralField";
import { demoBrainData } from "@/lib/brainData";
import { CATEGORIES, CATEGORY_META } from "@/lib/types";

export default function AuthLayout({ children }: LayoutProps<"/">) {
  const brain = demoBrainData();
  return (
    <main className="relative min-h-dvh overflow-hidden">
      {/* Layer 1: the rotating 3D brain */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 lg:right-[38%] lg:[mask-image:linear-gradient(to_right,black_75%,transparent)]"
      >
        <BrainStage data={brain} className="absolute inset-0" />
      </div>

      {/* Layer 2: neural network flowing across the whole screen. It sits above the brain in
          "screen" blend mode: the WebGL canvas's glow doesn't composite over another canvas below it. */}
      <NeuralField className="pointer-events-none fixed inset-0 h-full w-full mix-blend-screen" />

      {/* Layer 3: vignette so the form stays readable */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0"
        style={{ background: "radial-gradient(ellipse at 35% 50%, rgba(7,9,15,0) 0%, rgba(7,9,15,0.35) 55%, rgba(7,9,15,0.9) 100%)" }}
      />

      <div className="relative z-10 mx-auto grid min-h-dvh max-w-6xl items-center gap-10 px-4 py-10 lg:grid-cols-[1fr_400px]">
        <section className="text-center lg:self-end lg:pb-16 lg:text-left">
          <p className="font-mono text-[11px] tracking-[0.35em] text-rim/80">30 DAYS · 4 SKILLS · 120 REPS</p>
          <h1 className="mt-3 bg-gradient-to-r from-white via-[#bfefff] to-rim bg-clip-text text-5xl font-semibold tracking-tight text-transparent sm:text-6xl">
            Mind Gym
          </h1>
          <p className="mx-auto mt-3 max-w-md text-white/70 [text-shadow:0_1px_12px_#07090f] lg:mx-0">
            Train how you think. Every answer is graded by an AI coach, and every rep lights a new neuron.
          </p>
          <div className="mt-5 flex flex-wrap justify-center gap-2 lg:justify-start">
            {CATEGORIES.map((c) => (
              <span
                key={c}
                className="rounded-full border bg-black/30 px-3 py-1 text-xs font-medium backdrop-blur"
                style={{ borderColor: `${CATEGORY_META[c].color}66`, color: CATEGORY_META[c].color }}
              >
                {CATEGORY_META[c].label}
              </span>
            ))}
          </div>
        </section>
        <div className="flex justify-center lg:justify-end">{children}</div>
      </div>
    </main>
  );
}
