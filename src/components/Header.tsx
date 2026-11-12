"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { logout } from "@/app/(auth)/actions";
import { Icon } from "./ui/Icon";

const NAV = [
  { href: "/", label: "Cortex" },
  { href: "/progress", label: "Diagnostics" },
  { href: "/profile", label: "Neural map" },
];

export function Header({ username, day }: { username: string; day: number }) {
  const pathname = usePathname();
  return (
    <header className="sticky top-0 z-30 border-b border-neon/10 bg-ink/70 backdrop-blur-xl">
      <div className="mx-auto flex h-14 max-w-6xl items-center gap-3 px-4">
        <Link href="/" className="display flex items-center gap-2 text-sm font-black">
          <span className="inline-block h-2 w-2 rotate-45 bg-neon shadow-[0_0_12px_#6fe7ff]" />
          <span className="neon">
            Mind<span className="text-magenta">/</span>Gym
          </span>
        </Link>
        <span className="hidden font-mono text-[10px] tracking-widest text-neon/60 sm:inline">S{String(day).padStart(2, "0")}/30</span>
        <nav className="ml-auto flex items-center gap-0.5">
          {NAV.map((n) => {
            const active = n.href === "/" ? pathname === "/" || pathname.startsWith("/day") : pathname.startsWith(n.href);
            return (
              <Link
                key={n.href}
                href={n.href}
                className={`px-2 py-1.5 font-mono text-[10px] uppercase tracking-widest transition sm:px-3 sm:text-[11px] ${active ? "text-neon [text-shadow:0_0_10px_#6fe7ff]" : "text-cyan-100/50 hover:text-cyan-50"}`}
              >
                {active ? `[${n.label}]` : n.label}
              </Link>
            );
          })}
        </nav>
        <span className="hidden font-mono text-[11px] text-magenta/80 md:inline">@{username}</span>
        <form action={logout}>
          <button className="px-1 py-1.5 font-mono text-[10px] uppercase tracking-widest text-cyan-100/40 hover:text-magenta" title="Log out">
            <Icon name="power" size={13} />
            <span className="hidden sm:inline"> Disconnect</span>
          </button>
        </form>
      </div>
    </header>
  );
}
