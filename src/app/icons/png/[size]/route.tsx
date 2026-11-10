import { ImageResponse } from "next/og";

const SIZES = new Set([180, 192, 512]);

/** PNG app icons for the PWA manifest and iOS, drawn at request time (no binary assets in the repo). */
export async function GET(_req: Request, { params }: { params: Promise<{ size: string }> }) {
  const size = Number((await params).size);
  if (!SIZES.has(size)) return new Response("Not found", { status: 404 });
  const dot = (left: string, top: string, color: string) => (
    <div style={{ position: "absolute", left, top, width: size * 0.07, height: size * 0.07, borderRadius: 999, background: color, boxShadow: `0 0 ${size * 0.06}px ${color}` }} />
  );
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", background: "radial-gradient(circle at 50% 45%, #1b2b5e, #07090f 70%)", position: "relative" }}>
        <div style={{ position: "absolute", left: size * 0.2, top: size * 0.22, width: size * 0.28, height: size * 0.56, borderRadius: `${size * 0.3}px 0 0 ${size * 0.3}px`, border: `${size * 0.016}px solid #6fe7ff`, borderRight: "none", background: "#0c1430" }} />
        <div style={{ position: "absolute", left: size * 0.52, top: size * 0.22, width: size * 0.28, height: size * 0.56, borderRadius: `0 ${size * 0.3}px ${size * 0.3}px 0`, border: `${size * 0.016}px solid #6fe7ff`, borderLeft: "none", background: "#0c1430" }} />
        {dot("30%", "34%", "#5b9cff")}
        {dot("29%", "56%", "#2ec4a0")}
        {dot("63%", "34%", "#ff8a4c")}
        {dot("64%", "56%", "#c77dff")}
      </div>
    ),
    { width: size, height: size },
  );
}
