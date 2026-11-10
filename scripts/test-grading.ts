// Sends 3 deliberately wrong answers through the real AI coach and checks the feedback contract.
// Run: npm run test:grading   (uses AI_PROVIDER + keys from .env.local; set AI_PROVIDER=mock to dry-run)
import { gradeAnswer } from "@/lib/ai";
import { getExercise } from "@/lib/exercises";

const cases = [
  {
    name: "Logic day 7, Wason selection: classic confirmation error (E and 4)",
    exercise: getExercise("logic", 7)!,
    answer: "E and 4",
    reasoning:
      "The rule is about vowels and even numbers, so I flip the vowel and the even number to check they match.",
    confidence: 90,
    expect: (v: string) => v !== "correct",
  },
  {
    name: "Logic day 18, base rates: answers 90%",
    exercise: getExercise("logic", 18)!,
    answer: "About 90%",
    reasoning:
      "The test is 90% accurate, so if I test positive there's a 90% chance I have it.",
    confidence: 85,
    expect: (v: string) => v === "incorrect",
  },
  {
    name: "Critical day 9, Simpson's paradox: picks hospital A",
    exercise: getExercise("critical", 9)!,
    answer: "Hospital A",
    reasoning:
      "A has 90% survival vs 67.6% for B, so A is clearly the better hospital.",
    confidence: 80,
    expect: (v: string) => v === "incorrect",
  },
];

async function main() {
  let failed = 0;
  for (const c of cases) {
    const fb = await gradeAnswer({
      exercise: c.exercise,
      answer: c.answer,
      reasoning: c.reasoning,
      confidence: c.confidence,
      pastPatterns: [],
    });
    const ok = c.expect(fb.verdict) && fb.score <= 5;
    if (!ok) failed++;
    console.log(`\n${ok ? "PASS" : "FAIL"} · ${c.name}`);
    console.log(
      `  verdict=${fb.verdict} score=${fb.score} pattern="${fb.thinking_pattern}"`,
    );
    console.log(
      `  went wrong: ${fb.where_your_thinking_went_wrong.slice(0, 220)}`,
    );
    console.log(`  lesson: ${fb.transferable_lesson}`);
  }
  console.log(
    `\n${cases.length - failed}/${cases.length} wrong answers were graded as wrong.`,
  );
  process.exit(failed ? 1 : 0);
}

main();
