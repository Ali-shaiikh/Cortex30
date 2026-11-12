"use client";

import { usePathname } from "next/navigation";
import type { BrainData } from "@/lib/brainData";
import { NeuralField } from "./NeuralField";
import { BrainStage } from "./brain/BrainStage";
import { useCelebration } from "./brain/store";

/** Full-screen brain + neural network behind the UI (the profile page renders its own interactive brain). */
export function BrainBackground({ data }: { data: BrainData }) {
  const pathname = usePathname();
  const celebrating = Boolean(useCelebration());
  const profile = pathname === "/profile";
  const home = pathname === "/";
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-0">
      {!profile && <BrainStage data={data} className="absolute inset-0" />}
      <NeuralField className="absolute inset-0 h-full w-full mix-blend-screen" density={home ? 0.8 : 0.55} />
      {!profile && (
        <div
          className="absolute inset-0 transition-opacity duration-1000"
          style={{
            opacity: celebrating ? 0.3 : 1,
            background: home
              ? "radial-gradient(ellipse at 50% 45%, rgba(5,7,13,0) 0%, rgba(5,7,13,0.25) 55%, rgba(5,7,13,0.85) 100%)"
              : "linear-gradient(180deg, rgba(5,7,13,0.7) 0%, rgba(5,7,13,0.84) 50%, rgba(5,7,13,0.94) 100%)",
          }}
        />
      )}
    </div>
  );
}
