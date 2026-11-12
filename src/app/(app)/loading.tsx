// Shown instantly on every navigation while the server prepares the next page.
export default function Loading() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center" role="status" aria-live="polite">
      <div className="flex flex-col items-center gap-4">
        <svg viewBox="0 0 48 48" width="52" height="52" className="animate-spin [animation-duration:2.4s]" aria-hidden>
          <path d="M24 3l18.2 10.5v21L24 45 5.8 34.5v-21z" fill="none" stroke="#6fe7ff" strokeOpacity="0.25" strokeWidth="1.5" />
          <path d="M24 3l18.2 10.5" fill="none" stroke="#6fe7ff" strokeWidth="2" strokeLinecap="square" />
          <path d="M5.8 34.5L24 45" fill="none" stroke="#ff3dbb" strokeWidth="2" strokeLinecap="square" />
          <circle cx="24" cy="24" r="3" fill="#6fe7ff" />
        </svg>
        <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-neon/70">Syncing cortex…</p>
      </div>
    </div>
  );
}
