"use client";

/** Last-resort error page (replaces the root layout, so it carries its own minimal styling). */
export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, minHeight: "100vh", display: "grid", placeItems: "center", background: "#05070d", color: "#e6f4ff", fontFamily: "system-ui, sans-serif" }}>
        <div style={{ textAlign: "center" }}>
          <h1 style={{ fontWeight: 700, letterSpacing: "0.05em" }}>CORTEX/30 is rebooting</h1>
          <p style={{ opacity: 0.6 }}>An unexpected error occurred.</p>
          <button onClick={reset} style={{ marginTop: 12, padding: "10px 18px", background: "#6fe7ff", color: "#03111a", border: 0, fontWeight: 700, cursor: "pointer" }}>
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
