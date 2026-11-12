// Renders the light Markdown the AI coach writes: **bold**, `code`, bullet/numbered lists and
// "## headings", mixed freely within paragraphs. Builds React elements only (no raw HTML).
import type { ReactNode } from "react";

function inline(text: string, keyBase: string): ReactNode[] {
  return text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g).map((part, i) => {
    const key = `${keyBase}-${i}`;
    if (part.startsWith("**") && part.endsWith("**") && part.length > 4) return <strong key={key} className="font-semibold text-white">{part.slice(2, -2)}</strong>;
    if (part.startsWith("`") && part.endsWith("`") && part.length > 2) return <code key={key} className="rounded bg-white/10 px-1 font-mono text-[0.9em]">{part.slice(1, -1)}</code>;
    return part;
  });
}

type Block = { kind: "p"; lines: string[] } | { kind: "ul"; items: string[] } | { kind: "ol"; items: string[] } | { kind: "h"; text: string };

function blocks(text: string): Block[] {
  const out: Block[] = [];
  for (const raw of text.replace(/\r/g, "").split("\n")) {
    const line = raw.trimEnd();
    const bullet = line.match(/^\s*[-*•]\s+(.*)$/);
    const numbered = line.match(/^\s*\d+[.)]\s+(.*)$/);
    const heading = line.match(/^\s*#{1,4}\s+(.*)$/);
    const last = out[out.length - 1];
    if (!line.trim()) {
      out.push({ kind: "p", lines: [] }); // paragraph break
    } else if (heading) {
      out.push({ kind: "h", text: heading[1] });
    } else if (bullet || numbered) {
      const item = (bullet ?? numbered)![1];
      if (bullet && last?.kind === "ul") last.items.push(item);
      else if (!bullet && last?.kind === "ol") last.items.push(item);
      else out.push(bullet ? { kind: "ul", items: [item] } : { kind: "ol", items: [item] });
    } else if (last?.kind === "p") {
      last.lines.push(line);
    } else {
      out.push({ kind: "p", lines: [line] });
    }
  }
  return out.filter((b) => b.kind !== "p" || b.lines.length > 0);
}

export function RichText({ text, className = "" }: { text: string; className?: string }) {
  return (
    <div className={`space-y-2 ${className}`}>
      {blocks(text).map((b, i) => {
        if (b.kind === "h") return <p key={i} className="font-semibold text-white">{inline(b.text, `h${i}`)}</p>;
        if (b.kind === "ul" || b.kind === "ol") {
          const List = b.kind;
          return (
            <List key={i} className={`${b.kind === "ul" ? "list-disc" : "list-decimal"} space-y-1 pl-5`}>
              {b.items.map((it, j) => <li key={j}>{inline(it, `${b.kind}${i}-${j}`)}</li>)}
            </List>
          );
        }
        return (
          <p key={i}>
            {b.lines.map((l, j) => (
              <span key={j}>
                {j > 0 && <br />}
                {inline(l, `p${i}-${j}`)}
              </span>
            ))}
          </p>
        );
      })}
    </div>
  );
}
