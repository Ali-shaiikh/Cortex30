import { BrainStage } from "@/components/brain/BrainStage";
import { NeuralField } from "@/components/NeuralField";
import { demoBrainData } from "@/lib/brainData";
import { AuthGate } from "./AuthGate";

export default function AuthLayout({ children }: LayoutProps<"/">) {
  const brain = demoBrainData();
  return (
    <main className="relative min-h-dvh overflow-hidden">
      {/* Layer 1: the rotating 3D brain */}
      <div aria-hidden className="pointer-events-none fixed inset-x-0 top-0 h-[55dvh] sm:inset-0 sm:h-auto lg:left-[30%] lg:[mask-image:linear-gradient(to_right,transparent,black_25%)]">
        <BrainStage data={brain} className="absolute inset-0" />
      </div>

      {/* Layer 2: neural network flowing across the whole screen. It sits above the brain in
          "screen" blend mode so its lines add light over the brain instead of covering it. */}
      <NeuralField className="pointer-events-none fixed inset-0 h-full w-full mix-blend-screen" />

      {/* Layer 3: vignette so the text stays readable */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0"
        style={{ background: "radial-gradient(ellipse at 60% 45%, rgba(5,7,13,0) 0%, rgba(5,7,13,0.3) 55%, rgba(5,7,13,0.92) 100%)" }}
      />

      <AuthGate>{children}</AuthGate>
    </main>
  );
}
