"use client";

import { usePathname } from "next/navigation";
import type { BrainData } from "@/lib/brainData";
import { BrainStage } from "./brain/BrainStage";
import { useCelebration } from "./brain/store";

/** Full-screen brain behind the UI (the profile page renders its own interactive one). */
export function BrainBackground({ data }: { data: BrainData }) {
  const pathname = usePathname();
  const celebrating = Boolean(useCelebration());
  if (pathname === "/profile") return null;
  const home = pathname === "/";
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-0">
      <BrainStage data={data} className="absolute inset-0" />
      <div
        className="absolute inset-0 transition-opacity duration-1000"
        style={{
          opacity: celebrating ? 0.35 : 1,
          background: home
            ? "radial-gradient(ellipse at 50% 40%, rgba(7,9,15,0.25) 0%, rgba(7,9,15,0.7) 60%, rgba(7,9,15,0.92) 100%)"
            : "linear-gradient(180deg, rgba(7,9,15,0.72) 0%, rgba(7,9,15,0.86) 50%, rgba(7,9,15,0.95) 100%)",
        }}
      />
    </div>
  );
}
