import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { RichText } from "@/components/ui/RichText";

describe("RichText (coach Markdown)", () => {
  it("renders bold, mixed bullet and numbered lists without raw symbols", () => {
    const html = renderToStaticMarkup(
      <RichText text={"**Invalid Argument:**\n* Premise 1: All sharks are fish.\n* Premise 2: Some fish live in rivers.\n\n1. **Assume** premises are true.\n2. Try to break it."} />,
    );
    expect(html).toContain("<strong");
    expect(html).toContain("<ul");
    expect(html).toContain("<ol");
    expect(html).toContain("<li>Premise 1: All sharks are fish.</li>");
    expect(html).not.toContain("**");
    expect(html).not.toMatch(/<li>\* /);
  });

  it("escapes HTML instead of injecting it", () => {
    const html = renderToStaticMarkup(<RichText text={"<script>alert(1)</script> **ok**"} />);
    expect(html).not.toContain("<script>");
    expect(html).toContain("&lt;script&gt;");
  });
});
