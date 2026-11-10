// LOGIC: 30 exercises, difficulty rising. Day 30 revisits day 1.
export default [
  {
    day: 1, title: "Which arguments hold?", concept: "syllogisms", minutes: 5,
    prompt: `Which of these arguments are logically VALID (the conclusion must be true if the premises are true)?

(a) All roses are flowers. Some flowers fade quickly. Therefore some roses fade quickly.
(b) All poets are dreamers. Maya is a poet. Therefore Maya is a dreamer.
(c) No cats are dogs. Some pets are cats. Therefore some pets are not dogs.

Give the valid ones and explain why the others fail.`,
    solution: `Valid: (b) and (c).
(a) is INVALID: the "fast-fading" flowers might be tulips only. "Flowers" is the middle term and it is never covered in full (undistributed middle), so nothing links roses to the fading ones.
(b) is a classic valid syllogism: every member of "poets" is in "dreamers", and Maya is in "poets".
(c) is valid: the pets that are cats can't be dogs, so at least those pets are not dogs.
A quick test: try to build a counter-example world where the premises are true and the conclusion false. If you can (roses never fade, tulips do), the argument is invalid.`,
    rubric: `Correct = identifies exactly (b) and (c) as valid AND explains why (a) fails (middle term not distributed / counter-example). Partial = right set but explanation for (a) is "it's just not true" or appeals to real-world facts about roses rather than structure; or one error in the set. Incorrect = includes (a) or excludes (b)/(c) with no structural reasoning. Reward use of counter-examples or Venn diagrams.`,
  },
  {
    day: 2, title: "Next in the sequence", concept: "pattern finding", minutes: 5,
    prompt: `What comes next: 2, 6, 12, 20, 30, ?

State the rule you found and show how you checked it.`,
    solution: `42. Differences are 4, 6, 8, 10 → next difference 12 → 30 + 12 = 42.
Equivalent closed form: n × (n + 1): 1×2, 2×3, 3×4, 4×5, 5×6, 6×7 = 42.
Good process: look at differences first, then check whether a closed form explains every term, not just the last two.`,
    rubric: `Correct = 42 with a rule that fits ALL terms (differences or n(n+1)). Partial = 42 but the rule is vague ("it grows") or only checked on some terms. Incorrect = any other number. Bonus credit for finding both the difference rule and the closed form.`,
  },
  {
    day: 3, title: "Knights and knaves", concept: "knights and knaves", minutes: 6,
    prompt: `On an island, knights always tell the truth and knaves always lie. You meet A and B.
A says: "We are both knaves."

What are A and B? Show your reasoning.`,
    solution: `A is a knave, B is a knight.
If A were a knight, the statement "we are both knaves" would be true, making A a knave: contradiction. So A is a knave, and the statement is false. "Both knaves" is false while A is a knave, so B must be a knight.
Method: assume each case, follow it to a contradiction or a consistent world.`,
    rubric: `Correct = A knave, B knight, with case analysis showing why A can't be a knight AND why B must be a knight (negating "both"). Partial = right answer but skips the step about B (just asserts it). Incorrect = anything else.`,
  },
  {
    day: 4, title: "Wet ground", concept: "affirming the consequent", minutes: 6,
    prompt: `Rule: "If it rained last night, the ground is wet this morning."

1. The ground is wet. Did it rain?
2. The ground is dry. Did it rain?
3. It didn't rain. Is the ground dry?

For each, say "yes", "no" or "can't tell", and name the logical move.`,
    solution: `1. Can't tell: concluding "it rained" is AFFIRMING THE CONSEQUENT. Sprinklers, dew or a burst pipe also make ground wet.
2. No, it did not rain: MODUS TOLLENS (if P→Q and not Q, then not P). Valid.
3. Can't tell: DENYING THE ANTECEDENT. No rain doesn't rule out other causes of wetness.
Key idea: "If P then Q" only says P is sufficient for Q. It doesn't say P is necessary.`,
    rubric: `Correct = can't tell / no / can't tell, with at least the reasons (other causes of wetness; contrapositive). Naming the fallacies earns full marks but isn't required if the logic is explained. Partial = 2 of 3 right. Incorrect = answers "yes" to 1 or 3 by treating the rule as two-way.`,
  },
  {
    day: 5, title: "Two coins", concept: "conditional probability", minutes: 7,
    prompt: `I flip two fair coins out of sight and tell you truthfully: "At least one of them is heads."

What is the probability that BOTH are heads? Show the outcomes you counted.`,
    solution: `1/3.
Equally likely outcomes for two coins: HH, HT, TH, TT. "At least one heads" removes only TT, leaving HH, HT, TH. Only HH is both heads → 1/3.
Common error: answering 1/2 by imagining "the other coin" as a specific coin. But the statement didn't say which coin is heads, so HT and TH are both still possible.`,
    rubric: `Correct = 1/3 with the sample space listed and TT removed. Partial = 1/3 without justification, or a correct method with an arithmetic slip. Incorrect = 1/2 or 1/4. If they answer 1/2, the feedback must point at the step where they treated the coins as ordered/identified.`,
  },
  {
    day: 6, title: "Four litres", concept: "state-space search", minutes: 8,
    prompt: `You have a 3-litre jug and a 5-litre jug, with no markings, and unlimited water.
How do you measure exactly 4 litres? List each step and the amount in both jugs after it.`,
    solution: `One solution (5L, 3L):
1. Fill 5 → (5,0)
2. Pour 5 into 3 → (2,3)
3. Empty 3 → (2,0)
4. Pour 5 into 3 → (0,2)
5. Fill 5 → (5,2)
6. Pour 5 into 3 until full (needs 1) → (4,3). 4 litres in the big jug.
Alternative: fill 3, pour into 5, fill 3, pour into 5 (5 full, 1 left in 3), empty 5, pour 1 in, fill 3, pour → 4.
Thinking tool: treat it as states (a,b) and moves (fill, empty, pour). Search for a path, and track the state after every move.`,
    rubric: `Correct = a valid sequence that ends with exactly 4 L, with states tracked. Partial = right idea but one step is impossible (e.g. pouring more than fits) or states aren't tracked, so it can't be verified. Incorrect = no valid sequence. Reward explicitly framing it as states and moves.`,
  },
  {
    day: 7, title: "Flip the right cards", concept: "Wason selection", minutes: 7,
    prompt: `Four cards each have a letter on one side and a number on the other. You see: E, K, 4, 7.
Rule: "If a card has a vowel on one side, then it has an even number on the other side."

Which cards MUST you turn over to test whether the rule is true? Explain each choice, including why you skip the others.`,
    solution: `Turn E and 7.
E: if the back is odd, the rule is broken.
7: if the back is a vowel, the rule is broken (vowel with odd).
K: the rule says nothing about consonants.
4: whatever is on the back, the rule survives (an even number is allowed with a consonant too). Turning 4 is the classic CONFIRMATION trap.
Principle: look for cards that could FALSIFY the rule (P and not-Q), not cards that could confirm it.`,
    rubric: `Correct = exactly E and 7, with the falsification reasoning. Partial = E and 7 plus 4 (they half-see it), or right cards but no reason for skipping 4. Incorrect = E and 4 (the classic error) or only E. Feedback must name confirmation-seeking if they picked 4.`,
  },
  {
    day: 8, title: "O, T, T, F, F, S, S, ?", concept: "changing the representation", minutes: 6,
    prompt: `What letter comes next: O, T, T, F, F, S, S, ?

Then explain what made it easy or hard to see the pattern.`,
    solution: `E, for "Eight". The letters are the first letters of One, Two, Three, Four, Five, Six, Seven, Eight.
The lesson: when arithmetic or alphabet patterns fail, change the REPRESENTATION. Ask what else these symbols could stand for (words, positions, shapes, sounds).`,
    rubric: `Correct = E with the number-word explanation. Partial = E by guessing, without the rule. Incorrect = anything else. Reward reflecting on switching representations, or on how long they stayed stuck on the alphabet.`,
  },
  {
    day: 9, title: "Burning ropes", concept: "invariants", minutes: 8,
    prompt: `You have two ropes. Each takes exactly 60 minutes to burn end to end, but they burn UNEVENLY (half a rope does not take 30 minutes). You have a lighter.

How do you measure exactly 45 minutes?`,
    solution: `Light rope A at BOTH ends and rope B at ONE end, at the same time.
Rope A burns out after exactly 30 minutes: two flames together use up 60 minutes of burning, however uneven the rope is.
At that moment rope B has 30 minutes of burning left. Light its other end too: it now finishes in 15 minutes.
Total: 30 + 15 = 45.
Invariant: total burn TIME is fixed even though burn LENGTH isn't. Two ends double the rate, whatever the shape of the rope.`,
    rubric: `Correct = both-ends trick plus lighting B's second end at the 30-minute mark, with a reason why uneven burning doesn't matter. Partial = right procedure, but the explanation relies on "half the rope = half the time" (invalid) or leaves out why the double-ended rope gives exactly 30. Incorrect = cuts the rope or measures by length.`,
  },
  {
    day: 10, title: "What is C?", concept: "case analysis", minutes: 9,
    prompt: `Knights always tell the truth, knaves always lie. You meet A, B and C.
A says: "B is a knave."
B says: "A and C are the same type."

What is C? Can you also determine A and B?`,
    solution: `C is a knave, in every case. A and B can't be determined (they are opposite types).
Case 1: A is a knight → B is a knave → B's claim is false → A and C differ → C is a knave.
Case 2: A is a knave → B is a knight → B's claim is true → A and C are the same → C is a knave.
Both cases give C = knave. When you can't tell which world you are in, check whether your question gets the same answer in all of them.`,
    rubric: `Correct = C knave with BOTH cases worked AND recognising A/B are undetermined (but opposite). Partial = C knave from only one case, or claims to know A's type. Incorrect = C knight or "can't tell".`,
  },
  {
    day: 11, title: "Stay or switch?", concept: "conditional probability", minutes: 9,
    prompt: `A game show has 3 doors. A car is behind one, goats behind two. You pick door 1. The host, who KNOWS where the car is and always opens a goat door you didn't pick, opens door 3 to reveal a goat. He offers you a switch to door 2.

Should you switch? What are your chances each way? Explain why in a way that would convince a sceptic.`,
    solution: `Switch: switching wins with probability 2/3, staying wins with 1/3.
Your first pick is right 1/3 of the time, and nothing the host does changes that. In the other 2/3 of cases the car is in one of the two doors you didn't pick, and the host is FORCED to open the other one, so switching gets the car.
Convincing version: imagine 100 doors. You pick one, the host opens 98 goat doors. Would you stick with your 1-in-100 pick?
Key: the host's action isn't random. It carries information because it depends on where the car is.`,
    rubric: `Correct = switch, 2/3, with a reason that uses the host's knowledge/constraint (enumeration of cases or the 100-door intuition). Partial = "switch, 2/3" asserted without a sound reason, or a correct enumeration with a confused explanation. Incorrect = "50/50, doesn't matter". Feedback must point at the assumption that the two remaining doors are equally likely.`,
  },
  {
    day: 12, title: "What follows from 'no'", concept: "categorical logic", minutes: 8,
    prompt: `Premises: "No reptiles have fur." and "Some pets are reptiles."

Which of these MUST be true?
(a) Some pets do not have fur.
(b) No pets have fur.
(c) Some animals with fur are not pets.
(d) Some reptiles are pets.

Justify each.`,
    solution: `(a) MUST be true: the pets that are reptiles have no fur.
(b) NOT necessarily: furry pets like dogs fit both premises.
(c) NOT necessarily: the premises say nothing about whether furry animals exist outside pets. All furry animals could be pets, or there could be none.
(d) MUST be true: "Some pets are reptiles" converts to "some reptiles are pets" (a particular affirmative converts cleanly).
Tool: draw three circles (pets, reptiles, fur) and shade what the premises rule out. Only conclusions forced in EVERY drawing follow.`,
    rubric: `Correct = (a) and (d) must, (b) and (c) don't, with reasons. Partial = 3 of 4 right. A common slip is accepting (c) because it "sounds true in real life"; feedback must separate real-world truth from logical necessity. Incorrect = 2 or fewer right.`,
  },
  {
    day: 13, title: "The heavy coin", concept: "information per test", minutes: 9,
    prompt: `You have 8 identical-looking coins. One is slightly heavier. You have a balance scale.

What is the MINIMUM number of weighings that guarantees finding the heavy coin? Give the procedure and prove you can't do it in fewer.`,
    solution: `2 weighings.
Weigh 3 vs 3, with 2 aside.
- If one side is heavier: the coin is among those 3. Weigh 1 vs 1: heavier one, or the third if they balance.
- If they balance: it's among the 2 aside. Weigh them against each other.
Lower bound: each weighing has 3 outcomes (left, right, balance), so 1 weighing can tell apart at most 3 cases. 8 > 3, so 1 isn't enough, while 2 weighings give 3² = 9 ≥ 8.
Thinking tool: split into THREE groups, not two, because the scale has three outcomes.`,
    rubric: `Correct = 2 with a working procedure AND an argument for why 1 is impossible (3 outcomes vs 8 possibilities). Partial = 2 with procedure but no lower-bound argument; or the 4-vs-4 approach giving 3 weighings with good reasoning. Incorrect = 3 or more claimed as minimum without seeing the ternary split.`,
  },
  {
    day: 14, title: "Only members", concept: "necessary vs sufficient", minutes: 8,
    prompt: `Sign: "Only members may enter the lounge."

Which follow?
(a) Sam is in the lounge, so Sam is a member.
(b) Ana is a member, so Ana may enter the lounge.
(c) Raj is not a member, so Raj may not enter.
(d) Lee is not in the lounge, so Lee is not a member.

Rewrite the sign as an "if...then" first.`,
    solution: `"Only members may enter" = "If you may enter, then you are a member." Membership is NECESSARY, not SUFFICIENT.
(a) Follows (assuming Sam followed the rules): entering → member.
(b) Doesn't follow: the sign doesn't say members are guaranteed entry (it might also need a ticket, opening hours...).
(c) Follows: the contrapositive, not a member → may not enter.
(d) Doesn't follow: lots of members are simply elsewhere.
"Only X are Y" flips direction: it means "Y → X", not "X → Y".`,
    rubric: `Correct = (a) and (c) follow, (b) and (d) don't, with the correct if-then rewrite. Partial = right rewrite but one mistake, or the right set with a wrong rewrite. Incorrect = treats "only members" as "all members may enter" (accepting b).`,
  },
  {
    day: 15, title: "23 strangers", concept: "complement counting", minutes: 10,
    prompt: `23 random people are in a room. Estimate the probability that at least two share a birthday (ignore leap years). Is it closer to 5%, 25%, 50% or 90%?

Show HOW you would calculate it, even if you don't finish the arithmetic.`,
    solution: `About 50.7%.
Method: compute the COMPLEMENT, the chance that all birthdays are different:
P(all different) = 365/365 × 364/365 × 363/365 × ... × 343/365 ≈ 0.493.
So P(at least one shared) = 1 − 0.493 ≈ 0.507.
Why the intuition fails: we think about "someone sharing MY birthday" (22 chances) instead of PAIRS. 23 people form 23×22/2 = 253 pairs.
Rule of thumb: when "at least one" is hard to count, count "none" and subtract from 1.`,
    rubric: `Correct = ~50% with the complement method (product of decreasing fractions) or the pairs insight. Partial = picks 50% with only the pairs argument and no method, or a correct method with poor arithmetic. Incorrect = 5% or 25% from "23/365"-style reasoning; feedback must point at counting individuals instead of pairs.`,
  },
  {
    day: 16, title: "Bridge at night", concept: "greedy vs optimal", minutes: 10,
    prompt: `Four people must cross a narrow bridge at night with ONE torch. At most two cross at a time, and anyone crossing needs the torch. Crossing times: A = 1 min, B = 2, C = 5, D = 10. A pair walks at the slower person's pace.

What is the minimum total time? Give the schedule.`,
    solution: `17 minutes.
1. A + B cross → 2
2. A returns → 1 (3)
3. C + D cross → 10 (13)
4. B returns → 2 (15)
5. A + B cross → 2 (17)
The GREEDY plan (A escorts everyone and runs the torch back) gives 10+1+5+1+2 = 19.
Insight: send the two SLOWEST together so their times overlap, and use the two fastest for torch runs. Always check a greedy plan against a structural alternative.`,
    rubric: `Correct = 17 with a valid schedule. Partial = 19 (greedy) with a valid schedule and good reasoning, or 17 claimed with a flawed schedule. Incorrect = invalid schedule (e.g. three people crossing, torch teleporting). Feedback for 19 must show the "slow pair together" insight.`,
  },
  {
    day: 17, title: "Who did it?", concept: "consistency checking", minutes: 10,
    prompt: `Exactly one of three suspects broke the vase, and EXACTLY ONE of their statements is true.
A: "I didn't do it."
B: "A did it."
C: "I didn't do it."

Who broke the vase? Show that your answer is the only one that works.`,
    solution: `C did it.
Test each culprit and count the true statements:
- If A: A false, B true, C true → 2 true ✗
- If B: A true, B false, C true → 2 true ✗
- If C: A true, B false, C false → 1 true ✓
Only C gives exactly one true statement.
Method: when there are few possibilities, check EVERY one against EVERY constraint. Don't stop at the first one that seems to fit.`,
    rubric: `Correct = C with all three cases checked. Partial = C with only the C case shown (no proof it's unique). Incorrect = A or B. Point at any case where they counted true statements wrongly.`,
  },
  {
    day: 18, title: "A positive test", concept: "base rates", minutes: 10,
    prompt: `A disease affects 1% of people. A test detects it 90% of the time when it's present, but also gives a false positive for 9% of healthy people.

You test positive. Roughly what's the chance you actually have the disease? Show your working with a concrete population (e.g. 1,000 people).`,
    solution: `About 9%.
Out of 1,000 people: 10 have the disease → 9 test positive.
990 healthy → 9% ≈ 89 false positives.
Positives in total ≈ 98, and only 9 are real → 9/98 ≈ 9.2%.
Most people say ~90% because they confuse P(positive | disease) with P(disease | positive). With a rare condition, false positives from the huge healthy group swamp the true ones.
Tool: convert percentages into natural frequencies over an imaginary crowd.`,
    rubric: `Correct = ~9% (8-10% fine) with a frequency table or Bayes. Partial = right method with an arithmetic error, or a correct answer with no working. Incorrect = 90% or 81%; feedback must name base-rate neglect and show the 1,000-person table.`,
  },
  {
    day: 19, title: "Look and say", concept: "describe, don't compute", minutes: 9,
    prompt: `Find the next term: 1, 11, 21, 1211, 111221, ?

Explain the rule and how you discovered it (what did you try first?).`,
    solution: `312211.
Each term DESCRIBES the previous one aloud: "1" = one 1 → 11; "11" = two 1s → 21; "21" = one 2, one 1 → 1211; "1211" = one 1, one 2, two 1s → 111221; "111221" = three 1s, two 2s, one 1 → 312211.
Lesson: if arithmetic gives nothing, the "numbers" may be strings or descriptions. Read them out loud and change the representation.`,
    rubric: `Correct = 312211 with the look-and-say rule. Partial = correct rule with a transcription error. Incorrect = numeric pattern guesses. Reward honest reflection on how they got unstuck.`,
  },
  {
    day: 20, title: "Hats in a line", concept: "reasoning from others' knowledge", minutes: 11,
    prompt: `Three people stand in a line facing forward. The back person (P3) sees P2 and P1, P2 sees only P1, and P1 sees no one. Hats are drawn from 3 white and 2 black; everyone knows this.

Asked in order, P3 says "I don't know my colour." Then P2 says "I don't know my colour." What colour is P1's hat, and how does P1 know?`,
    solution: `P1's hat is white.
P3 would know only if both P2 and P1 were black (then P3 must be white). P3 doesn't know → P2 and P1 aren't both black.
P2 now knows "not both black". If P2 saw a black hat on P1, P2 would conclude "I'm white". P2 doesn't know → P1 isn't black.
So P1 is white.
Key move: someone saying "I don't know" is INFORMATION. It rules out the worlds where they would have known.`,
    rubric: `Correct = white with both steps (what P3's and P2's ignorance rules out). Partial = white with only one step, or the reasoning skips why P2 would know. Incorrect = black or "can't know".`,
  },
  {
    day: 21, title: "Three houses", concept: "constraint propagation", minutes: 12,
    prompt: `Three houses stand in a row (1 = left, 3 = right). Amir, Bea and Chen each live in one; the houses are red, green and blue; the pets are a cat, a dog and a fish (one each).
1. The fish owner lives directly to the left of the red house.
2. Amir lives in the blue house.
3. Bea does not live in house 1.
4. The dog lives in house 3.
5. The green house is not house 3.
6. Bea owns the cat.

Who owns the fish, and what colour is their house? Show your deductions.`,
    solution: `Chen owns the fish and lives in the green house (house 1).
Dog in 3 (clue 4), so the fish is in 1 or 2, with red right next to it (clue 1).
Case fish in 2 → red is 3, cat is 1. But Bea owns the cat and can't be in house 1 (clues 3, 6). ✗
So the fish is in 1, red is 2, cat is 2. Green isn't 3 (clue 5) → green 1, blue 3. Amir is blue → house 3, dog. Bea has the cat → house 2, red. Chen → house 1, green, fish.
Method: fix the strongest constraint, branch on the few cases left, kill branches by contradiction.`,
    rubric: `Correct = Chen, green, with the elimination of the fish-in-2 case. Partial = correct answer, but one deduction is asserted rather than derived. Incorrect = wrong person or colour.`,
  },
  {
    day: 22, title: "Waiting for a six", concept: "complement & expectation", minutes: 10,
    prompt: `With a fair die:
1. What's the probability of rolling at least one 6 in 4 rolls?
2. On average, how many rolls does it take to get the first 6?
3. Someone says "4 rolls gives 4 × 1/6 = 67%". What's wrong?`,
    solution: `1. 1 − (5/6)^4 = 1 − 625/1296 ≈ 51.8%.
2. 6 rolls on average (geometric distribution: expected waiting time = 1/p).
3. Adding probabilities double-counts the overlap (rolling 6s on several rolls). With 6 rolls that method would give 100%, which is clearly wrong. Use the complement for "at least one".`,
    rubric: `Correct = ~52%, 6, and the double-counting explanation. Partial = two of three, or right numbers without reasons. Incorrect = 67% accepted.`,
  },
  {
    day: 23, title: "The missing log entry", concept: "chained conditionals", minutes: 10,
    prompt: `Facts: "If the alarm was triggered, the guard heard it." "If the guard heard it, he wrote a log entry."

Scenario A: There is NO log entry. What can you conclude about the alarm?
Scenario B: There IS a log entry. What can you conclude about the alarm?
Scenario C: The alarm was NOT triggered. What can you conclude about the log?`,
    solution: `Chain: alarm → heard → log.
A: No log → not heard → alarm NOT triggered (modus tollens applied twice). Valid.
B: Log exists → nothing certain. He may have logged something else (affirming the consequent).
C: No alarm → nothing certain about the log (denying the antecedent).
Only conclusions that go backwards through a NEGATED consequent are safe.`,
    rubric: `Correct = A: not triggered; B and C: can't tell, with reasons. Partial = A right but one of B/C treated as certain. Incorrect = treats the chain as two-way.`,
  },
  {
    day: 24, title: "Twelve coins", concept: "maximising information per test", minutes: 15,
    prompt: `12 coins look identical. Exactly one is counterfeit, either HEAVIER or LIGHTER (you don't know which). Using a balance scale only 3 times, find the fake AND say whether it is heavy or light.

Write the strategy for the first weighing and at least the full branch where the first weighing tips.`,
    solution: `There are 24 possibilities (12 coins × heavy/light) and 3 weighings give 27 outcomes, so it's possible, but only with no wasted weighings.
W1: 1234 vs 5678.
- Balance → fake among 9-12. W2: 9,10,11 vs 1,2,3 (known genuine). Balance → 12; W3: 12 vs 1 tells heavy/light. Tips heavy → one of 9-11 is heavy; W3: 9 vs 10 (heavier is fake, balance → 11). Tips light: same, lighter.
- Left heavy → either one of 1-4 is heavy or one of 5-8 is light. W2: 1,2,5 vs 3,6,9.
  - Balance → 4 heavy, 7 light or 8 light. W3: 7 vs 8: lighter is fake; balance → 4 heavy.
  - Left heavy → 1 or 2 heavy, or 6 light. W3: 1 vs 2: heavier is fake; balance → 6 light.
  - Left light → 5 light or 3 heavy. W3: 3 vs 9: heavy → 3; balance → 5 light.
- Left light: mirror image.
Principle: design every weighing so that its three outcomes split the remaining possibilities as evenly as possible, mixing known-good coins in as references.`,
    rubric: `Grade the structure, not memorisation. Correct = a valid first weighing (4 vs 4) plus a complete, correct "tips" branch that always finishes in 3 weighings and identifies heavy/light. Partial = right first weighing and correct balance branch, but the tips branch is incomplete or needs a 4th weighing in some case. Incorrect = a strategy that can't distinguish heavy from light, or one that obviously needs more weighings. Reward counting possibilities (24 vs 27).`,
  },
  {
    day: 25, title: "Statements about statements", concept: "self-reference", minutes: 11,
    prompt: `A list contains exactly these four statements:
1. Exactly one of these statements is false.
2. Exactly two of these statements are false.
3. Exactly three of these statements are false.
4. Exactly four of these statements are false.

Which statements (if any) are true?`,
    solution: `Only statement 3 is true.
The statements contradict each other, so at most one is true.
If none were true, all four would be false, which would make statement 4 true: contradiction. So exactly one is true and three are false, which is exactly what statement 3 says. Consistent.
Method: for self-referential puzzles, look for the FIXED POINT, the assignment that agrees with itself.`,
    rubric: `Correct = only 3, with the "at most one true" step and ruling out "none true". Partial = 3 without ruling out other options. Incorrect = 4, none, or several.`,
  },
  {
    day: 26, title: "Three boxes", concept: "counting equally likely outcomes", minutes: 11,
    prompt: `Three boxes: one has two gold coins (GG), one two silver (SS), one a gold and a silver (GS). You pick a random box and draw a random coin from it: it's GOLD.

What's the probability that the other coin in the same box is also gold?`,
    solution: `2/3.
Count the COINS, not the boxes. There are three gold coins you could have drawn: two in GG and one in GS. Each is equally likely. In 2 of those 3 cases you're holding a coin from GG, so the other coin is gold.
"It's either GG or GS, so 1/2" treats the boxes as equally likely AFTER the draw. But GG makes a gold draw twice as likely, so seeing gold is evidence for GG.`,
    rubric: `Correct = 2/3 with the coin-counting (or Bayes) argument. Partial = 2/3 with weak reasoning. Incorrect = 1/2; feedback must point at the step where they treated GG and GS as equally likely after seeing gold.`,
  },
  {
    day: 27, title: "Don't trust five terms", concept: "induction limits", minutes: 12,
    prompt: `Put n points on a circle and draw every chord between them, placing the points so that no three chords meet at one point. Count the regions inside the circle:
n=1: 1, n=2: 2, n=3: 4, n=4: 8, n=5: 16.

How many regions for n = 6? Explain why your first guess might be wrong.`,
    solution: `31, not 32.
Regions = 1 + C(n,2) + C(n,4): each chord adds a region, and each crossing point (a set of 4 points) adds one. For n = 6: 1 + 15 + 15 = 31.
Lesson: a pattern that fits the first few cases is a HYPOTHESIS, not a proof. Look for a mechanism that explains why each new term grows, or test one more case by hand.`,
    rubric: `Correct = 31 with a mechanism (chords + intersections) or a careful drawing. Partial = suspects that 32 is wrong and checks, but makes a counting error; or says 31 with no explanation. Incorrect = 32 with no scepticism. The main thing to reward is scepticism about the doubling pattern.`,
  },
  {
    day: 28, title: "Two guards", concept: "nested questions", minutes: 12,
    prompt: `Two doors: one leads to freedom, one to doom. Two guards: one always lies, one always tells the truth, and you don't know which is which. You may ask ONE yes/no or "which door" question to ONE guard.

What do you ask, and how do you act on the answer? Prove it works for both guards.`,
    solution: `Ask either guard: "If I asked the OTHER guard which door leads to freedom, which door would he point to?" Then take the OPPOSITE door.
Ask the truth-teller: he truthfully reports the liar's false answer → points to doom.
Ask the liar: he lies about the truth-teller's true answer → points to doom.
Either way the answer is doom, so go through the other door.
Principle: routing the question through both guards applies exactly one lie, so you know the answer is negated.
Alternative: "If I asked YOU whether the left door leads to freedom, would you say yes?" A double negation gives the truth.`,
    rubric: `Correct = a single question that works for both guards, with verification for each case. Partial = the right question, verified for only one guard. Incorrect = asks two questions or a question whose answer depends on which guard you asked.`,
  },
  {
    day: 29, title: "It matters how you know", concept: "selection effects", minutes: 14,
    prompt: `A family has two children. Compare two situations:

(A) You ask the parent: "Is at least one of your children a boy?" They say yes.
(B) You meet one of their children at random in the park, and it is a boy.

In each case, what's the probability that both children are boys? Why do the answers differ?`,
    solution: `(A) 1/3. Possible families BB, BG, GB, GG are equally likely; "at least one boy" removes GG → BB is 1 of 3.
(B) 1/2. Meeting a random child who is a boy is twice as likely in a BB family as in BG/GB. Weighting by that: BB (2 ways) vs BG (1) + GB (1) → 2/4 = 1/2. Equivalently, the child you didn't meet is just a random child.
Lesson: the same fact ("there's a boy") is different evidence depending on HOW you came to learn it. Always model the process that produced the information.`,
    rubric: `Correct = 1/3 and 1/2 with an explanation of why the selection process differs. Partial = both numbers but a weak explanation, or one number right with sound reasoning. Incorrect = the same answer for both without addressing the process.`,
  },
  {
    day: 30, title: "Which arguments hold? (revisited)", concept: "syllogisms", minutes: 6, revisitOf: 1,
    prompt: `Day 30: you're back where you started. Answer Day 1 again, fresh:

Which of these arguments are logically VALID?
(a) All roses are flowers. Some flowers fade quickly. Therefore some roses fade quickly.
(b) All poets are dreamers. Maya is a poet. Therefore Maya is a dreamer.
(c) No cats are dogs. Some pets are cats. Therefore some pets are not dogs.

Explain your reasoning as thoroughly as you now can.`,
    solution: `Valid: (b) and (c). (a) commits the undistributed middle: the flowers that fade quickly need not include any roses (counter-example world: roses never fade, tulips do). (b) is a direct subset chain. (c) holds because the cat-pets are definitely not dogs.
A strong answer now: build counter-example worlds, name the structure, and check every argument the same way.`,
    rubric: `Same criteria as Day 1, but EXPECT more: counter-examples, structural vocabulary and a systematic check of every argument. Compare explicitly with the Day 1 answer: what's sharper, and what's still missing.`,
  },
];
