// Minimal Markdown renderer for coach reports (headings, lists, bold, paragraphs).
function inline(text: string) {
  return text.split(/(\*\*[^*]+\*\*)/g).map((part, i) =>
    part.startsWith("**") && part.endsWith("**") ? <strong key={i} className="text-white">{part.slice(2, -2)}</strong> : part,
  );
}

export function Markdown({ text }: { text: string }) {
  const blocks = text.trim().split(/\n{2,}/);
  return (
    <div className="space-y-3 text-[0.95rem] leading-relaxed text-white/80">
      {blocks.map((block, i) => {
        const lines = block.split("\n");
        if (/^#{1,4}\s/.test(lines[0])) {
          return (
            <div key={i} className="space-y-1">
              <h4 className="label pt-1 text-rim">{lines[0].replace(/^#+\s*/, "")}</h4>
              {lines.length > 1 && <Markdown text={lines.slice(1).join("\n")} />}
            </div>
          );
        }
        if (lines.every((l) => /^\s*([-*]|\d+\.)\s/.test(l))) {
          return (
            <ul key={i} className="list-disc space-y-1 pl-5">
              {lines.map((l, j) => (
                <li key={j}>{inline(l.replace(/^\s*([-*]|\d+\.)\s/, ""))}</li>
              ))}
            </ul>
          );
        }
        return <p key={i}>{inline(block)}</p>;
      })}
    </div>
  );
}
