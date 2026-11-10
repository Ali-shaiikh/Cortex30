"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import type { BrainData, BrainNode } from "@/lib/brainData";
import type { Category } from "@/lib/types";
import type { SceneOptions } from "./BrainScene";
import { StaticBrain } from "./StaticBrain";

// The three.js bundle is lazy-loaded and never rendered on the server.
const BrainScene = dynamic(() => import("./BrainScene"), { ssr: false });

type Capabilities = { webgl: boolean; lowEnd: boolean; reducedMotion: boolean };

function detect(): Capabilities {
  let webgl = false;
  try {
    const c = document.createElement("canvas");
    webgl = Boolean(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {}
  const nav = navigator as Navigator & { deviceMemory?: number };
  const mobile = /Android|iPhone|iPad|iPod|Mobile/i.test(nav.userAgent) || window.matchMedia("(pointer: coarse)").matches;
  const lowEnd = mobile || (nav.hardwareConcurrency ?? 8) <= 4 || (nav.deviceMemory ?? 8) <= 4;
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  return { webgl, lowEnd, reducedMotion };
}

type Props = {
  data: BrainData;
  interactive?: boolean;
  className?: string;
  filter?: Category | null;
  onHover?: (n: BrainNode | null) => void;
  onSelect?: (n: BrainNode) => void;
  onFilter?: (c: Category | null) => void;
};

export function BrainStage({ data, interactive = false, className = "", ...rest }: Props) {
  const [caps, setCaps] = useState<Capabilities | null>(null);
  useEffect(() => {
    setCaps(detect());
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onChange = () => setCaps(detect());
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  if (!caps) return <div className={className} />;
  if (!caps.webgl) {
    return (
      <div className={`flex items-center justify-center ${className}`}>
        <StaticBrain className="w-[min(720px,110vw)] opacity-70" />
      </div>
    );
  }
  const options: SceneOptions = {
    interactive,
    particles: caps.lowEnd ? 3000 : interactive ? 12000 : 9000,
    bloom: !caps.lowEnd,
    dpr: [1, caps.lowEnd ? 1.5 : 2],
    reducedMotion: caps.reducedMotion,
  };
  return (
    <div className={className}>
      <BrainScene {...options} data={data} {...rest} />
    </div>
  );
}
