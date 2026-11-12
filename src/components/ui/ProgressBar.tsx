export function ProgressBar({ value, color = "#6fe7ff", className = "h-1.5" }: { value: number; color?: string; className?: string }) {
  const pct = Math.max(0, Math.min(100, value));
  return (
    <div className={`w-full overflow-hidden bg-cyan-100/[0.07] ${className}`} role="progressbar" aria-valuenow={Math.round(pct)} aria-valuemin={0} aria-valuemax={100}>
      <div className="h-full transition-[width] duration-700" style={{ width: `${pct}%`, background: color, boxShadow: `0 0 12px ${color}66` }} />
    </div>
  );
}
