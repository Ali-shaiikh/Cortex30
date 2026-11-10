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
