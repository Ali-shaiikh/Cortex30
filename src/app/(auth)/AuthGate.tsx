"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useState, type ReactNode } from "react";
import { CATEGORIES, CATEGORY_META } from "@/lib/types";
import { Icon } from "@/components/ui/Icon";

/** Hero first; the login/signup panel slides in when the visitor starts their journey. */
export function AuthGate({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative z-10 min-h-dvh">
      <motion.section
        className="mx-auto flex min-h-dvh max-w-6xl flex-col justify-end px-4 pb-16 pt-10 text-center sm:justify-center lg:text-left"
        animate={{ x: open ? "-8%" : "0%", opacity: open ? 0.35 : 1, filter: open ? "blur(2px)" : "blur(0px)" }}
        transition={{ type: "spring", stiffness: 120, damping: 20 }}
      >
        <div className="mx-auto max-w-xl lg:mx-0 lg:mt-[38vh]">
          <p className="font-mono text-[11px] tracking-[0.35em] text-neon/80">30 DAYS · 4 CORTICES · 120 SYNAPSES</p>
          <h1 className="display neon glitch mt-3 text-5xl font-black sm:text-7xl">
            Mind<span className="text-magenta [text-shadow:0_0_18px_#ff3dbb]">/</span>Gym
          </h1>
          <p className="mt-4 font-read text-cyan-50/75 [text-shadow:0_1px_12px_#05070d]">
            Rewire how you think. An AI coach dissects every thought, and every rep fires a new neuron in your brain.
          </p>
          <div className="mt-5 flex flex-wrap justify-center gap-2 lg:justify-start">
            {CATEGORIES.map((c) => (
              <span
                key={c}
                className="border bg-black/40 px-3 py-1 font-mono text-[10px] uppercase tracking-widest backdrop-blur"
                style={{ borderColor: `${CATEGORY_META[c].color}66`, color: CATEGORY_META[c].color }}
              >
                {CATEGORY_META[c].label} cortex
              </span>
            ))}
          </div>
          <button onClick={() => setOpen(true)} className="btn btn-primary group mt-8 px-8 py-4 text-sm">
            Begin your journey
            <Icon name="arrowRight" className="transition-transform group-hover:translate-x-1" />
          </button>
          <p className="mt-3 font-mono text-[10px] tracking-widest text-cyan-100/40">FREE · NO EMAIL · 10 MIN A DAY</p>
        </div>
      </motion.section>

      <AnimatePresence>
        {open && (
          <>
            <motion.button
              aria-label="Close"
              className="fixed inset-0 z-20 cursor-default bg-ink/40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
            />
            <motion.div
              className="fixed inset-x-0 bottom-0 z-30 flex justify-center p-3 sm:inset-y-0 sm:left-auto sm:right-0 sm:items-center sm:p-8"
              initial={{ x: "110%", y: 0 }}
              animate={{ x: 0, y: 0 }}
              exit={{ x: "110%" }}
              transition={{ type: "spring", stiffness: 140, damping: 22 }}
            >
              <div className="relative w-full max-w-sm">
                <button
                  onClick={() => setOpen(false)}
                  className="absolute -top-9 right-0 font-mono text-[11px] tracking-widest text-cyan-100/60 hover:text-neon"
                >
                  <Icon name="close" size={11} /> CLOSE
                </button>
                {children}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
