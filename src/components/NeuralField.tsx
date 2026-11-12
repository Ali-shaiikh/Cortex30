"use client";

import { useEffect, useRef } from "react";

const COLORS = ["#5b9cff", "#2ec4a0", "#ff8a4c", "#c77dff", "#6fe7ff"];

type Neuron = { x: number; y: number; vx: number; vy: number; r: number; phase: number };
type Signal = { a: number; b: number; t: number; speed: number; color: string };

/** Full-screen animated neural network: drifting neurons, synapses, and signals flowing between them. */
export function NeuralField({ className = "", density = 1 }: { className?: string; density?: number }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current!;
    const ctx = canvas.getContext("2d")!;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let w = 0, h = 0, dpr = 1, link = 150;
    let neurons: Neuron[] = [];
    const signals: Signal[] = [];
    let raf = 0;
    let last = performance.now();
    const mouse = { x: -9999, y: -9999 };

    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      link = Math.max(110, Math.min(170, Math.sqrt(w * h) / 7));
      const count = Math.round(Math.min(110, Math.max(30, (w * h) / 14000)) * density);
      neurons = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 12,
        vy: (Math.random() - 0.5) * 12,
        r: 1 + Math.random() * 1.8,
        phase: Math.random() * Math.PI * 2,
      }));
    }

    function spawnSignal() {
      const a = Math.floor(Math.random() * neurons.length);
      let best = -1, bestD = Infinity;
      for (let i = 0; i < neurons.length; i++) {
        if (i === a) continue;
        const d = Math.hypot(neurons[i].x - neurons[a].x, neurons[i].y - neurons[a].y);
        if (d < link && d < bestD && Math.random() < 0.7) {
          bestD = d;
          best = i;
        }
      }
      if (best >= 0) signals.push({ a, b: best, t: 0, speed: 0.6 + Math.random() * 0.8, color: COLORS[Math.floor(Math.random() * COLORS.length)] });
    }

    function frame(now: number) {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      ctx.clearRect(0, 0, w, h);
      const time = now / 1000;

      for (const n of neurons) {
        n.x += n.vx * dt;
        n.y += n.vy * dt;
        if (n.x < -20) n.x = w + 20;
        if (n.x > w + 20) n.x = -20;
        if (n.y < -20) n.y = h + 20;
        if (n.y > h + 20) n.y = -20;
      }

      // Synapses
      ctx.lineWidth = 1;
      for (let i = 0; i < neurons.length; i++) {
        const a = neurons[i];
        for (let j = i + 1; j < neurons.length; j++) {
          const b = neurons[j];
          const d = Math.hypot(a.x - b.x, a.y - b.y);
          if (d > link) continue;
          const near = Math.max(0, 1 - Math.hypot((a.x + b.x) / 2 - mouse.x, (a.y + b.y) / 2 - mouse.y) / 220);
          const alpha = (1 - d / link) * (0.22 + near * 0.4);
          ctx.strokeStyle = `rgba(111,231,255,${alpha})`;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }

      // Signals travelling along synapses, chaining onwards when they arrive.
      if (!reduced && signals.length < neurons.length / 2 && Math.random() < 0.35) spawnSignal();
      for (let i = signals.length - 1; i >= 0; i--) {
        const s = signals[i];
        const a = neurons[s.a], b = neurons[s.b];
        if (!a || !b) {
          signals.splice(i, 1);
          continue;
        }
        s.t += dt * s.speed * (160 / Math.max(40, Math.hypot(b.x - a.x, b.y - a.y)));
        const x = a.x + (b.x - a.x) * s.t;
        const y = a.y + (b.y - a.y) * s.t;
        const tail = Math.max(0, s.t - 0.35);
        const grad = ctx.createLinearGradient(a.x + (b.x - a.x) * tail, a.y + (b.y - a.y) * tail, x, y);
        grad.addColorStop(0, "rgba(0,0,0,0)");
        grad.addColorStop(1, s.color);
        ctx.strokeStyle = grad;
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.moveTo(a.x + (b.x - a.x) * tail, a.y + (b.y - a.y) * tail);
        ctx.lineTo(x, y);
        ctx.stroke();
        ctx.fillStyle = s.color;
        ctx.shadowColor = s.color;
        ctx.shadowBlur = 12;
        ctx.beginPath();
        ctx.arc(x, y, 2.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
        if (s.t >= 1) {
          signals.splice(i, 1);
          if (Math.random() < 0.6) {
            // Fire onward from the receiving neuron.
            let next = -1;
            for (let k = 0; k < neurons.length; k++) {
              if (k === s.a || k === s.b) continue;
              if (Math.hypot(neurons[k].x - b.x, neurons[k].y - b.y) < link && Math.random() < 0.5) {
                next = k;
                break;
              }
            }
            if (next >= 0) signals.push({ a: s.b, b: next, t: 0, speed: s.speed, color: s.color });
          }
          neurons[s.b].phase = time * 3; // flash on arrival
        }
      }

      // Neurons
      for (const n of neurons) {
        const flash = Math.max(0, 1 - (time * 3 - n.phase) / 2);
        const pulse = reduced ? 0.6 : 0.5 + 0.3 * Math.sin(time * 1.5 + n.phase);
        ctx.fillStyle = `rgba(160,235,255,${Math.min(1, pulse + flash)})`;
        if (flash > 0.05) {
          ctx.shadowColor = "#6fe7ff";
          ctx.shadowBlur = 14 * flash;
        }
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r * 1.25 + flash * 1.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      if (!reduced) raf = requestAnimationFrame(frame);
    }

    const onMove = (e: PointerEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };
    const onVisibility = () => {
      cancelAnimationFrame(raf);
      if (document.visibilityState === "visible" && !reduced) {
        last = performance.now();
        raf = requestAnimationFrame(frame);
      }
    };

    resize();
    raf = requestAnimationFrame(frame);
    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", onMove);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [density]);

  return <canvas ref={ref} aria-hidden className={className} />;
}
