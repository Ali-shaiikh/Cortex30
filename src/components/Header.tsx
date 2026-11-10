"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { logout } from "@/app/(auth)/actions";

const NAV = [
  { href: "/", label: "Today" },
  { href: "/progress", label: "Progress" },
  { href: "/profile", label: "Brain" },
];

export function Header({ username, day }: { username: string; day: number }) {
  const pathname = usePathname();
  return (
    <header className="sticky top-0 z-30 border-b border-white/[0.06] bg-ink/60 backdrop-blur-xl">
      <div className="mx-auto flex h-14 max-w-5xl items-center gap-3 px-4">
        <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight">
          <span className="inline-block h-2.5 w-2.5 rounded-full bg-rim shadow-[0_0_12px_#6fe7ff]" />
          <span className="hidden sm:inline">Mind Gym</span>
        </Link>
        <span className="font-mono text-xs text-white/45">D{day}/30</span>
        <nav className="ml-auto flex items-center gap-1 text-sm">
          {NAV.map((n) => {
            const active = n.href === "/" ? pathname === "/" || pathname.startsWith("/day") : pathname.startsWith(n.href);
            return (
              <Link key={n.href} href={n.href} className={`rounded-lg px-2.5 py-1.5 transition ${active ? "bg-white/10 text-white" : "text-white/60 hover:text-white"}`}>
                {n.label}
              </Link>
            );
          })}
        </nav>
        <span className="hidden font-mono text-xs text-white/60 sm:inline">@{username}</span>
        <form action={logout}>
          <button className="rounded-lg px-2 py-1.5 text-xs text-white/50 hover:text-white" title="Log out">
            Log out
          </button>
        </form>
      </div>
      <div className="mx-auto max-w-5xl px-4 pb-1 sm:hidden">
        <span className="font-mono text-[11px] text-white/50">@{username}</span>
      </div>
    </header>
  );
}
