// Merges scripts/exercises/*.mjs into src/data/exercises.json and validates the result.
// Run: npm run build:exercises
import { writeFileSync, mkdirSync } from "node:fs";
import logic from "./exercises/logic.mjs";
import analytical from "./exercises/analytical.mjs";
import critical from "./exercises/critical.mjs";
import creative from "./exercises/creative.mjs";

const sets = { logic, analytical, critical, creative };
const out = [];

for (const [category, items] of Object.entries(sets)) {
  const days = items.map((e) => e.day).sort((a, b) => a - b);
  if (items.length !== 30 || days.some((d, i) => d !== i + 1)) {
    throw new Error(`${category}: expected days 1-30 exactly once, got ${days.join(",")}`);
  }
  for (const e of items) {
    for (const key of ["title", "concept", "prompt", "solution", "rubric"]) {
      if (!e[key] || typeof e[key] !== "string") throw new Error(`${category} day ${e.day}: missing ${key}`);
    }
    const id = `${category}-${String(e.day).padStart(2, "0")}`;
    out.push({
      id,
      day: e.day,
      category,
      title: e.title,
      prompt: e.prompt.trim(),
      reference_solution: e.solution.trim(),
      rubric: e.rubric.trim(),
      minutes: e.minutes,
      concept: e.concept,
      ...(e.revisitOf ? { revisit_of: `${category}-${String(e.revisitOf).padStart(2, "0")}` } : {}),
    });
  }
}

out.sort((a, b) => a.day - b.day || Object.keys(sets).indexOf(a.category) - Object.keys(sets).indexOf(b.category));
mkdirSync("src/data", { recursive: true });
writeFileSync("src/data/exercises.json", JSON.stringify(out, null, 2) + "\n");
console.log(`Wrote ${out.length} exercises to src/data/exercises.json`);
