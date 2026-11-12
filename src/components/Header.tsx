"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { logout } from "@/app/(auth)/actions";
import { Icon, type IconName } from "./ui/Icon";

const NAV: { href: string; label: string; icon: IconName }[] = [
  { href: "/", label: "Cortex", icon: "synapse" },
  { href: "/progress", label: "Diagnostics", icon: "chart" },
  { href: "/profile", label: "Neural map", icon: "brain" },
];

function useActive() {
  const pathname = usePathname();
  return (href: string) => (href === "/" ? pathname === "/" || pathname.startsWith("/day") : pathname.startsWith(href));
}

export function Header({ username, day }: { username: string; day: number }) {
  const isActive = useActive();
  return (
    <>
      <header className="sticky top-0 z-30 border-b border-neon/10 bg-ink/75 pt-[env(safe-area-inset-top)] backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-6xl items-center gap-3 px-4">
          <Link href="/" className="display flex items-center gap-2 text-sm font-black">
            <span className="inline-block h-2 w-2 rotate-45 bg-neon shadow-[0_0_12px_#6fe7ff]" />
            <span className="neon">
              Mind<span className="text-magenta">/</span>Gym
            </span>
          </Link>
          <span className="font-mono text-[10px] tracking-widest text-neon/60">S{String(day).padStart(2, "0")}/30</span>
          {/* Desktop nav; phones get the bottom tab bar */}
          <nav className="ml-auto hidden items-center gap-0.5 sm:flex">
            {NAV.map((n) => {
              const active = isActive(n.href);
              return (
                <Link
                  key={n.href}
                  href={n.href}
                  className={`px-3 py-1.5 font-mono text-[11px] uppercase tracking-widest transition ${active ? "text-neon [text-shadow:0_0_10px_#6fe7ff]" : "text-cyan-100/50 hover:text-cyan-50"}`}
                >
                  {active ? `[${n.label}]` : n.label}
                </Link>
              );
            })}
          </nav>
          <span className="ml-auto truncate font-mono text-[11px] text-magenta/80 sm:ml-0 md:inline">@{username}</span>
          <form action={logout}>
            <button className="flex h-10 items-center gap-1 px-1 font-mono text-[10px] uppercase tracking-widest text-cyan-100/50 hover:text-magenta" title="Log out" aria-label="Log out">
              <Icon name="power" size={15} />
              <span className="hidden sm:inline">Disconnect</span>
            </button>
          </form>
        </div>
      </header>

      <nav
        className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-3 border-t border-neon/15 bg-ink/90 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl sm:hidden"
        aria-label="Main"
      >
        {NAV.map((n) => {
          const active = isActive(n.href);
          return (
            <Link
              key={n.href}
              href={n.href}
              className={`flex h-16 flex-col items-center justify-center gap-1 font-mono text-[10px] uppercase tracking-widest ${active ? "text-neon" : "text-cyan-100/45"}`}
              aria-current={active ? "page" : undefined}
            >
              <Icon name={n.icon} size={20} className={active ? "drop-shadow-[0_0_8px_#6fe7ff]" : ""} />
              {n.label}
            </Link>
          );
        })}
      </nav>
    </>
  );
}
