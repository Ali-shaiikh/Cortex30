"use client";

import { useEffect, useRef } from "react";

const COLORS = ["#5b9cff", "#2ec4a0", "#ff8a4c", "#c77dff", "#6fe7ff"];
const GRAB_RADIUS = 34; // px around a neuron that picks it up
const SPRING = 70; // spring stiffness pulling a neuron back to where it belongs
const DAMPING = 7; // < 2·√SPRING, so it overshoots a little and wobbles into place
// Anything the user might actually want to click keeps priority over grabbing neurons.
const INTERACTIVE = "a,button,input,textarea,select,label,summary,[role=tab],[role=dialog],.glass,.glass-strong,.focus-panel,canvas[data-engine]";

type Neuron = {
  x: number; // drifting "home" position
  y: number;
  vx: number;
  vy: number;
  r: number;
  phase: number;
  ox: number; // offset from home (dragging / springing back)
  oy: number;
  ovx: number;
  ovy: number;
  tx: number; // target offset (non-zero only for neighbours of a dragged neuron)
  ty: number;
};
type Signal = { a: number; b: number; t: number; speed: number; color: string };

/**
 * Full-screen animated neural network: drifting neurons, synapses and signals flowing between them.
 * Neurons can be grabbed and dragged with the mouse; neighbours stretch along, and everything springs back on release.
 */
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
    let dragging = -1;

    const px = (n: Neuron) => n.x + n.ox;
    const py = (n: Neuron) => n.y + n.oy;

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
        ox: 0, oy: 0, ovx: 0, ovy: 0, tx: 0, ty: 0,
      }));
      dragging = -1;
    }

    function nearest(x: number, y: number): number {
      let best = -1, bestD = GRAB_RADIUS;
      neurons.forEach((n, i) => {
        const d = Math.hypot(px(n) - x, py(n) - y);
        if (d < bestD) {
          bestD = d;
          best = i;
        }
      });
      return best;
    }

    const blocked = (target: EventTarget | null) => target instanceof Element && Boolean(target.closest(INTERACTIVE));

    function spawnSignal() {
      const a = Math.floor(Math.random() * neurons.length);
      let best = -1, bestD = Infinity;
      for (let i = 0; i < neurons.length; i++) {
        if (i === a) continue;
        const d = Math.hypot(px(neurons[i]) - px(neurons[a]), py(neurons[i]) - py(neurons[a]));
        if (d < link && d < bestD && Math.random() < 0.7) {
          bestD = d;
          best = i;
        }
      }
      if (best >= 0) signals.push({ a, b: best, t: 0, speed: 0.6 + Math.random() * 0.8, color: COLORS[Math.floor(Math.random() * COLORS.length)] });
    }

    function physics(dt: number) {
      const held = dragging >= 0 ? neurons[dragging] : null;
      if (held) {
        held.ox = mouse.x - held.x;
        held.oy = mouse.y - held.y;
        held.ovx = held.ovy = 0;
      }
      for (let i = 0; i < neurons.length; i++) {
        const n = neurons[i];
        n.x += n.vx * dt;
        n.y += n.vy * dt;
        if (n.x < -20) n.x = w + 20;
        if (n.x > w + 20) n.x = -20;
        if (n.y < -20) n.y = h + 20;
        if (n.y > h + 20) n.y = -20;
        if (i === dragging) continue;
        // Elastic web: neighbours of the held neuron are tugged part of the way.
        if (held) {
          const d = Math.hypot(n.x - held.x, n.y - held.y);
          const pull = d < link * 1.4 ? 0.45 * (1 - d / (link * 1.4)) : 0;
          n.tx = held.ox * pull;
          n.ty = held.oy * pull;
        } else {
          n.tx = n.ty = 0;
        }
        n.ovx += (SPRING * (n.tx - n.ox) - DAMPING * n.ovx) * dt;
        n.ovy += (SPRING * (n.ty - n.oy) - DAMPING * n.ovy) * dt;
        n.ox += n.ovx * dt;
        n.oy += n.ovy * dt;
      }
    }

    function frame(now: number) {
      const dt = Math.min(0.033, (now - last) / 1000);
      last = now;
      ctx.clearRect(0, 0, w, h);
      const time = now / 1000;
      physics(dt);

      // Synapses
      ctx.lineWidth = 1;
      for (let i = 0; i < neurons.length; i++) {
        const a = neurons[i];
        const ax = px(a), ay = py(a);
        for (let j = i + 1; j < neurons.length; j++) {
          const b = neurons[j];
          const bx = px(b), by = py(b);
          const d = Math.hypot(ax - bx, ay - by);
          const maxD = i === dragging || j === dragging ? link * 1.6 : link;
          if (d > maxD) continue;
          const near = Math.max(0, 1 - Math.hypot((ax + bx) / 2 - mouse.x, (ay + by) / 2 - mouse.y) / 220);
          const alpha = (1 - d / maxD) * (0.22 + near * 0.4);
          ctx.strokeStyle = `rgba(111,231,255,${alpha})`;
          ctx.beginPath();
          ctx.moveTo(ax, ay);
          ctx.lineTo(bx, by);
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
        const ax = px(a), ay = py(a), bx = px(b), by = py(b);
        s.t += dt * s.speed * (160 / Math.max(40, Math.hypot(bx - ax, by - ay)));
        const x = ax + (bx - ax) * s.t;
        const y = ay + (by - ay) * s.t;
        const tail = Math.max(0, s.t - 0.35);
        const grad = ctx.createLinearGradient(ax + (bx - ax) * tail, ay + (by - ay) * tail, x, y);
        grad.addColorStop(0, "rgba(0,0,0,0)");
        grad.addColorStop(1, s.color);
        ctx.strokeStyle = grad;
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.moveTo(ax + (bx - ax) * tail, ay + (by - ay) * tail);
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
              if (Math.hypot(px(neurons[k]) - bx, py(neurons[k]) - by) < link && Math.random() < 0.5) {
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
      neurons.forEach((n, i) => {
        const held = i === dragging;
        const flash = held ? 1 : Math.max(0, 1 - (time * 3 - n.phase) / 2);
        const pulse = reduced ? 0.6 : 0.5 + 0.3 * Math.sin(time * 1.5 + n.phase);
        ctx.fillStyle = held ? "#ffffff" : `rgba(160,235,255,${Math.min(1, pulse + flash)})`;
        if (flash > 0.05) {
          ctx.shadowColor = held ? "#ff3dbb" : "#6fe7ff";
          ctx.shadowBlur = (held ? 22 : 14) * flash;
        }
        ctx.beginPath();
        ctx.arc(px(n), py(n), n.r * 1.25 + flash * (held ? 3 : 1.5), 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      if (!reduced || dragging >= 0 || neurons.some((n) => Math.abs(n.ox) + Math.abs(n.oy) > 0.5)) raf = requestAnimationFrame(frame);
    }

    const kick = () => {
      cancelAnimationFrame(raf);
      last = performance.now();
      raf = requestAnimationFrame(frame);
    };

    const onMove = (e: PointerEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      if (dragging >= 0) return;
      // Hint that neurons in empty space can be grabbed.
      const over = !blocked(e.target) && nearest(e.clientX, e.clientY) >= 0;
      document.documentElement.style.cursor = over ? "grab" : "";
    };
    const onDown = (e: PointerEvent) => {
      // Mouse/pen only: on touch screens a finger near a neuron must still scroll the page.
      if (e.pointerType === "touch" || e.button !== 0 || blocked(e.target)) return;
      const i = nearest(e.clientX, e.clientY);
      if (i < 0) return;
      e.preventDefault(); // no text selection while dragging
      dragging = i;
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      document.documentElement.style.cursor = "grabbing";
      if (reduced) kick();
    };
    const onUp = () => {
      if (dragging < 0) return;
      dragging = -1;
      document.documentElement.style.cursor = "";
      if (reduced) kick();
    };
    const onVisibility = () => {
      cancelAnimationFrame(raf);
      if (document.visibilityState === "visible") kick();
    };

    resize();
    raf = requestAnimationFrame(frame);
    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerdown", onDown);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      cancelAnimationFrame(raf);
      document.documentElement.style.cursor = "";
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [density]);

  return <canvas ref={ref} aria-hidden className={className} />;
}
