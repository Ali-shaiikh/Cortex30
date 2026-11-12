"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { startIntro } from "./brain/store";

type Props = {
  username: string;
  synapses: number;
  cortex: { label: string; color: string; pct: number }[];
};

const GLYPHS = "0123456789ABCDEF∑∂∇λπΔ≈∫⊕σθμ<>/{}[]";
const DURATION = 4300; // ms of "loading" before the brain bursts into view

/** Post-login cinematic: data rain, live calculations and a typed boot log, then the user's brain big-bangs into view. */
export function BootSequence({ username, synapses, cortex }: Props) {
  const router = useRouter();
  const [phase, setPhase] = useState<"loading" | "reveal" | "done">("loading");
  const [progress, setProgress] = useState(0);
  const reduced = useMemo(() => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches, []);
  const total = reduced ? 900 : DURATION;

  const lines = useMemo(
    () => [
      ["Establishing neural link", "OK"],
      [`Loading brain: @${username}`, "FOUND"],
      ["Analysing neural networks", "120 NODES"],
      ["Mapping synapses", `${synapses} ACTIVE`],
      ["Calibrating cortices", cortex.map((c) => `${c.label.slice(0, 3).toUpperCase()} ${Math.round(c.pct)}%`).join(" · ")],
      ["Running cognitive diagnostics", "OK"],
      [`Brain loaded. Welcome back, @${username}`, ""],
    ],
    [username, synapses, cortex],
  );

  useEffect(() => {
    const start = performance.now();
    let raf = 0;
    const tick = () => {
      const p = Math.min(1, (performance.now() - start) / total);
      setProgress(p);
      if (p < 1) raf = requestAnimationFrame(tick);
      else reveal();
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function reveal() {
    setPhase((p) => {
      if (p !== "loading") return p;
      startIntro();
      setTimeout(() => {
        setPhase("done");
        router.replace("/", { scroll: false });
      }, 900);
      return "reveal";
    });
  }

  const visibleLines = Math.min(lines.length, Math.floor(progress * (lines.length + 0.6)));

  return (
    <AnimatePresence>
      {phase !== "done" && (
        <motion.div
          className="fixed inset-0 z-50 overflow-hidden bg-ink"
          initial={{ opacity: 1 }}
          animate={{ opacity: phase === "reveal" ? 0 : 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8 }}
        >
          {!reduced && <DataRain />}
          {/* Continuation of the login flash */}
          <motion.div className="absolute inset-0 bg-white" initial={{ opacity: 0.9 }} animate={{ opacity: 0 }} transition={{ duration: 0.7 }} />
          {!reduced && <CalcPanels />}

          <div className="relative flex h-full items-center justify-center px-4">
            <div className="glass-strong w-full max-w-xl p-6">
              <div className="mb-4 flex items-center justify-between">
                <span className="display neon text-xs font-bold">Neural boot // v3.0</span>
                <button onClick={reveal} className="font-mono text-[10px] tracking-widest text-cyan-100/50 hover:text-neon">
                  SKIP ›
                </button>
              </div>
              <div className="min-h-48 space-y-1.5 font-mono text-[12px] sm:text-[13px]">
                {lines.slice(0, visibleLines).map(([text, status], i) => (
                  <div key={i} className="flex gap-2">
                    <span className="text-magenta">›</span>
                    <span className={`flex-1 ${i === lines.length - 1 ? "neon font-bold" : "text-cyan-100/85"} ${i === visibleLines - 1 && phase === "loading" ? "caret" : ""}`}>
                      <Typed text={text} />
                    </span>
                    {status && <span className="shrink-0 text-right text-neon">{status}</span>}
                  </div>
                ))}
              </div>
              <div className="mt-5">
                <div className="mb-1 flex justify-between font-mono text-[10px] tracking-widest text-cyan-100/50">
                  <span>{progress < 1 ? "LOADING YOUR BRAIN" : "BRAIN LOADED"}</span>
                  <span>{Math.round(progress * 100)}%</span>
                </div>
                <div className="h-1 w-full bg-neon/10">
                  <div className="h-full bg-gradient-to-r from-neon to-magenta shadow-[0_0_12px_#6fe7ff]" style={{ width: `${progress * 100}%` }} />
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Typed({ text }: { text: string }) {
  const [n, setN] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setN((v) => (v >= text.length ? (clearInterval(id), v) : v + 2)), 18);
    return () => clearInterval(id);
  }, [text]);
  return <>{text.slice(0, n)}</>;
}

/** Falling columns of glyphs and numbers. */
function DataRain() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const c = ref.current!;
    const ctx = c.getContext("2d")!;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const w = (c.width = innerWidth * dpr);
    const h = (c.height = innerHeight * dpr);
    const size = 14 * dpr;
    const cols = Math.ceil(w / size);
    const drops = Array.from({ length: cols }, () => Math.random() * -50);
    let raf = 0;
    const draw = () => {
      ctx.fillStyle = "rgba(5,7,13,0.16)";
      ctx.fillRect(0, 0, w, h);
      ctx.font = `${size}px monospace`;
      for (let i = 0; i < cols; i++) {
        const ch = GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
        ctx.fillStyle = Math.random() < 0.04 ? "#ff3dbb" : Math.random() < 0.5 ? "rgba(111,231,255,0.85)" : "rgba(111,231,255,0.35)";
        ctx.fillText(ch, i * size, drops[i] * size);
        if (drops[i] * size > h && Math.random() > 0.975) drops[i] = 0;
        drops[i] += 0.9;
      }
      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, []);
  return <canvas ref={ref} aria-hidden className="absolute inset-0 h-full w-full opacity-60" />;
}

const CALCS = ["w[%]", "∂L/∂w", "σ(x)", "Σ w·x", "Δsyn", "λ·reg", "∇θ", "p(H|E)"];
const SPOTS = [
  "left-[6%] top-[12%]",
  "right-[8%] top-[16%]",
  "left-[10%] bottom-[18%]",
  "right-[6%] bottom-[14%]",
  "left-[38%] top-[6%]",
  "right-[30%] bottom-[6%]",
];

/** Small HUD boxes with rapidly changing numbers. */
function CalcPanels() {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 70);
    return () => clearInterval(id);
  }, []);
  return (
    <>
      {SPOTS.map((spot, i) => {
        const v = Math.sin(tick * (0.37 + i * 0.11) + i * 5) * Math.cos(tick * 0.07 + i);
        const label = CALCS[(i + Math.floor(tick / 18)) % CALCS.length].replace("%", String((tick * 7 + i * 13) % 999).padStart(3, "0"));
        return (
          <motion.div
            key={i}
            className={`absolute hidden border border-neon/25 bg-ink/70 px-3 py-2 font-mono text-[11px] sm:block ${spot}`}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 + i * 0.25 }}
          >
            <div className="text-cyan-100/50">{label}</div>
            <div className={v < 0 ? "text-magenta" : "text-neon"}>{v.toFixed(6)}</div>
          </motion.div>
        );
      })}
    </>
  );
}
