// Tiny external store for brain celebrations (no extra dependency).
import { useSyncExternalStore } from "react";
import type { Category, Verdict } from "@/lib/types";

export type Celebration = { id: number; category: Category; day: number; score: number; verdict: Verdict; dayComplete: boolean };

let current: Celebration | null = null;
const listeners = new Set<() => void>();

export function celebrate(c: Omit<Celebration, "id">) {
  current = { ...c, id: Date.now() };
  listeners.forEach((l) => l());
}

export function clearCelebration(id: number) {
  if (current?.id !== id) return;
  current = null;
  listeners.forEach((l) => l());
}

export function useCelebration(): Celebration | null {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    () => current,
    () => null,
  );
}

// --- Cinematic effects: "dive" (camera flies into the brain on login) and "intro" (big-bang reveal) ---
type Fx = { dive: boolean; intro: number | null };
let fx: Fx = { dive: false, intro: null };
const fxListeners = new Set<() => void>();
const emitFx = () => fxListeners.forEach((l) => l());

export function startDive() {
  fx = { ...fx, dive: true };
  emitFx();
}
export function stopDive() {
  fx = { ...fx, dive: false };
  emitFx();
}
/** Starts the big-bang reveal: the brain bursts out from a point of light. */
export function startIntro() {
  fx = { dive: false, intro: Date.now() };
  emitFx();
}
export function getFx(): Fx {
  return fx;
}
export function useFx(): Fx {
  return useSyncExternalStore(
    (l) => {
      fxListeners.add(l);
      return () => fxListeners.delete(l);
    },
    () => fx,
    () => fx,
  );
}
