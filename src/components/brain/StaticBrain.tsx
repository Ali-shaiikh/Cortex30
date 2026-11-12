// Static SVG brain: used on auth pages and as the fallback when WebGL is unavailable.
export function StaticBrain({ className = "", glow = true }: { className?: string; glow?: boolean }) {
  return (
    <svg viewBox="0 0 400 300" className={className} role="img" aria-label="Cortex30 brain">
      <defs>
        <radialGradient id="sb-core" cx="50%" cy="45%" r="55%">
          <stop offset="0%" stopColor="#1b2b5e" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#07090f" stopOpacity="0" />
        </radialGradient>
        <filter id="sb-blur">
          <feGaussianBlur stdDeviation="6" />
        </filter>
      </defs>
      <ellipse cx="200" cy="150" rx="190" ry="140" fill="url(#sb-core)" />
      {[-1, 1].map((side) => (
        <g key={side} transform={`translate(${200 + side * 52} 150) scale(${side} 1)`}>
          <path
            d="M-6 -108 C 60 -118 128 -78 132 -12 C 136 46 104 96 46 108 C 18 114 -2 104 -6 92 Z"
            fill="#0c1430"
            stroke="#6fe7ff"
            strokeOpacity="0.55"
            strokeWidth="1.5"
          />
          {[
            "M10 -90 C 40 -70 30 -40 60 -30",
            "M20 -50 C 50 -50 70 -70 100 -55",
            "M8 -10 C 40 0 60 -20 100 -5",
            "M30 30 C 60 20 80 40 115 30",
            "M15 70 C 40 55 60 80 85 78",
            "M60 -95 C 70 -70 95 -70 110 -40",
          ].map((d) => (
            <path key={d} d={d} fill="none" stroke="#6fe7ff" strokeOpacity="0.28" strokeWidth="1.2" strokeLinecap="round" />
          ))}
        </g>
      ))}
      {glow &&
        [
          { x: 120, y: 95, c: "#5b9cff" },
          { x: 110, y: 185, c: "#2ec4a0" },
          { x: 280, y: 95, c: "#ff8a4c" },
          { x: 290, y: 185, c: "#c77dff" },
        ].map((n) => (
          <g key={n.c}>
            <circle cx={n.x} cy={n.y} r="16" fill={n.c} opacity="0.35" filter="url(#sb-blur)" />
            <circle cx={n.x} cy={n.y} r="4" fill={n.c} />
          </g>
        ))}
    </svg>
  );
}
