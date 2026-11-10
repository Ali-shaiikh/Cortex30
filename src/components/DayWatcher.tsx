"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { currentDay, msUntilNextLocalMidnight } from "@/lib/day";

/** Re-checks the program day every minute (and right at local midnight) and refreshes when it changes. */
export function DayWatcher({ startDate, today }: { startDate: string; today: number }) {
  const router = useRouter();
  useEffect(() => {
    const check = () => {
      if (currentDay(startDate) !== today) router.refresh();
    };
    const interval = setInterval(check, 60_000);
    const midnight = setTimeout(check, msUntilNextLocalMidnight() + 1000);
    const onVisible = () => document.visibilityState === "visible" && check();
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      clearInterval(interval);
      clearTimeout(midnight);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [router, startDate, today]);
  return null;
}
