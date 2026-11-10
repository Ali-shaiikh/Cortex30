// CRITICAL: 30 exercises. Graded on naming the real flaw and asking the right questions.
export default [
  {
    day: 1, title: "Name the flaw", concept: "informal fallacies", minutes: 6,
    prompt: `Identify the main flaw in each argument and say why it fails:

(a) "Don't listen to Priya on the sugar tax. She's always on some diet."
(b) "Either we ban all cars from the city centre or we accept that pollution will kill us."
(c) "My opponent wants to reduce the defence budget. Clearly he wants to leave the country defenceless."`,
    solution: `(a) AD HOMINEM: attacks Priya, not her argument. Her diet doesn't make the case for or against the tax right or wrong.
(b) FALSE DILEMMA: only two options are offered. Low-emission zones, better transit, EV incentives and partial bans exist in between.
(c) STRAW MAN: "reduce" is distorted into "leave defenceless", an easier position to knock down.
Ask each time: does the reason actually bear on whether the CLAIM is true?`,
    rubric: `Correct = all three identified (by name or by an accurate description) with why they fail. Partial = two right, or names without explanation. Incorrect = one or none. Accurate descriptions without labels can still get full credit.`,
  },
  {
    day: 2, title: "Library hours", concept: "correlation vs causation", minutes: 7,
    prompt: `"Students who spend more time in the school library get higher grades. So we should make every student spend 5 hours a week in the library."

What's wrong with this reasoning? Give at least two alternative explanations for the pattern, and say what evidence would actually support the policy.`,
    solution: `The data shows correlation; the policy assumes causation (library → grades).
Alternatives: (1) REVERSE causation: motivated, high-achieving students choose to go to the library; (2) CONFOUNDERS: parental support, a quiet home vs a noisy one, conscientiousness drive both; (3) selection: library users may take different courses.
Forcing unmotivated students into the library may not copy what motivated students do there.
Evidence: a randomised trial (assign some students library hours), or a natural experiment (a new library opens for some classes), measuring the change in grades against a comparison group.`,
    rubric: `Correct = names correlation vs causation with at least two specific alternatives (reverse causation, a named confounder) and proposes a causal test. Partial = says "correlation isn't causation" without specific alternatives, or no test. Incorrect = accepts the policy.`,
  },
  {
    day: 3, title: "Dropout billionaires", concept: "survivorship bias", minutes: 7,
    prompt: `"Many of the world's most successful founders dropped out of college. If you want to build a great company, dropping out is a smart move."

Critique this argument. What data would you need to evaluate the claim properly?`,
    solution: `SURVIVORSHIP BIAS: we only see the dropouts who became famous. The thousands who dropped out and failed are invisible.
Also: the famous dropouts often left elite universities with an opportunity already in hand (selection: the opportunity caused the dropping out, not the reverse).
Data needed: outcomes of ALL dropouts vs all graduates who started companies (success rates, not counts of famous examples); control for background and the type of opportunity.
In fact, studies of founders show most successful ones have degrees, and the average age of high-growth founders is around 40.
Ask: "what does the graveyard look like?"`,
    rubric: `Correct = survivorship bias identified, plus the need for base rates across all dropouts (including failures), ideally reverse causation/selection too. Partial = names survivorship bias with no data plan. Incorrect = agrees or argues only "college is good".`,
  },
  {
    day: 4, title: "Crime doubled!", concept: "relative vs absolute risk", minutes: 7,
    prompt: `Headline: "Burglaries in Green Park DOUBLED this year, up 100%!"

What questions should you ask before getting worried? List at least four, and explain how the answers could change the story.`,
    solution: `Questions:
1. Absolute numbers? 2 → 4 is "100%", but trivial and likely noise.
2. Over what baseline period? Was last year unusually low (regression to the mean)?
3. Has the area's population or housing changed?
4. Did reporting change (a new police app, insurance rules making people report more)?
5. What's the trend over 5-10 years, and in neighbouring areas?
6. Who's publishing, and why (a security company? an election?)
Relative change without the absolute base can make tiny changes look dramatic.`,
    rubric: `Correct = asks for absolute numbers AND at least 3 other relevant questions (reporting changes, longer trend, denominator, source incentives). Partial = 2-3 good questions. Incorrect = takes the headline at face value or only questions the source.`,
  },
  {
    day: 5, title: "The supplement test", concept: "confirmation bias", minutes: 8,
    prompt: `You've started taking a ₹2,000/month "focus" supplement and you feel sharper. Your friend asks if it really works.

How might confirmation bias be fooling you? Design a simple, honest test you could run on yourself.`,
    solution: `How you might be fooled: you notice good-focus days and attribute them to the pill, and write off bad days as "bad sleep"; placebo/expectation effects; you started it during a change (new routine, less stress); you paid for it and want it to work (cost justification).
Test: get identical-looking placebo capsules; have a friend assign pill vs placebo in random 2-week blocks (blinded); track a pre-chosen objective measure every day (e.g. a timed focus task, deep-work hours) and a rating; compare at the end. Decide the success threshold BEFORE starting.
Principle: look for evidence that could prove you WRONG, measured before you know which condition you're in.`,
    rubric: `Correct = names selective attention/attribution and placebo, plus a test with blinding/randomisation, a pre-defined measure and a disconfirming criterion. Partial = a test without blinding or without a pre-defined metric. Incorrect = "just stop and see how you feel".`,
  },
  {
    day: 6, title: "Steelman the other side", concept: "steelmanning", minutes: 9,
    prompt: `Topic: "Smartphones should be banned in schools during the school day."

Decide which side you lean towards. Then write the STRONGEST possible version of the OTHER side's argument, one its smartest supporter would happily sign. End with the one point from it you find hardest to answer.`,
    solution: `A strong steelman:
- represents the other side's best reasons, not weak ones (e.g. FOR a ban: attention research on notifications, social comparison/cyberbullying pressure during school hours, enforcement is easier with a clear rule than "use responsibly", teachers report recovered class time; AGAINST a ban: safety/contact for families, learning to self-regulate needs practice, phones as learning tools/accessibility aids, bans push use underground and erode trust, evidence on outcomes is mixed);
- uses evidence and values they'd recognise;
- concedes something real ("the hardest point for me is...").
Test: would someone on that side say "yes, that's exactly our view, put better"?`,
    rubric: `Strong = the opposing case is charitable, specific, evidence-aware and free of caricature, AND ends with an honest concession. Partial = fair but thin, or slips into rebuttal. Weak = a straw man of the other side. (Use correct / partially_correct / incorrect verdicts.)`,
  },
  {
    day: 7, title: "The first number", concept: "anchoring", minutes: 8,
    prompt: `You're selling a used scooter. A buyer opens with: "I'll give you ₹15,000." You'd hoped for ₹40,000.

Explain how anchoring could affect the rest of the negotiation, for both of you. Then describe two concrete things you'd do to protect yourself from it (here and in future negotiations).`,
    solution: `Anchoring: the first number becomes the reference point, and later offers are judged as adjustments from it (and adjustments are usually too small). If you counter at ₹35,000 and "meet in the middle" at ~₹25,000, the buyer's anchor has pulled the result well below your ₹40,000 value.
It affects the buyer too: they may now see ₹25,000 as generous.
Protection:
1. Set your own value from INDEPENDENT data (listings for the same model/year/condition) and a walk-away price BEFORE talking.
2. Don't counter off their anchor: re-anchor with evidence ("similar scooters list at ₹38-42k; here's why mine is at the top end").
3. Make the first offer yourself when you have good information.
4. Delay: "Let me think and get back to you" breaks the anchor.`,
    rubric: `Correct = explains the adjustment-from-anchor mechanism with this example, plus at least two concrete defences (independent reference, walk-away price, re-anchor, first offer). Partial = defines anchoring generically or offers vague defences. Incorrect = misdescribes anchoring (e.g. as "being stubborn").`,
  },
  {
    day: 8, title: "The online poll", concept: "sampling bias", minutes: 8,
    prompt: `A news website's online poll (12,000 votes) says 78% of people support a 4-day work week. A politician cites it as "the public overwhelmingly wants this".

What's wrong with that conclusion? How would you get a trustworthy estimate?`,
    solution: `Problems:
- SELF-SELECTION: only people who visit that site AND choose to vote; enthusiasts vote more.
- Audience bias: the site's readers aren't the public (age, income, office workers vs shift workers).
- Repeat voting, bots, brigading via social media.
- Wording: "Would you like a 4-day week?" vs "...with lower pay?"
A large sample doesn't fix a biased one: 12,000 biased votes isn't better than 1,000 random ones.
Trustworthy: a random, representative sample (stratified by age, region, job type), neutral and specific wording, a reported margin of error, ideally several pollsters.`,
    rubric: `Correct = self-selection + an unrepresentative audience + "bigger isn't better if biased", plus a sound alternative (random/representative sampling, neutral wording). Partial = mentions only one problem, or no method. Incorrect = accepts 12,000 as enough.`,
  },
  {
    day: 9, title: "The better hospital?", concept: "Simpson's paradox", minutes: 10,
    prompt: `Survival rates after surgery:
- Hospital A: 900 of 1,000 patients survived (90%)
- Hospital B: 676 of 1,000 survived (67.6%)

Broken down by case severity:
- Easy cases: A 870/900 (96.7%), B 196/200 (98%)
- Hard cases: A 30/100 (30%), B 480/800 (60%)

Which hospital would you choose for your own surgery, and why? What general lesson does this teach?`,
    solution: `Choose B: it has the better survival rate for BOTH easy (98% vs 96.7%) and hard (60% vs 30%) cases.
A looks better overall only because 90% of its patients are easy cases, while 80% of B's are hard. B is probably the referral centre for difficult surgery.
This is SIMPSON'S PARADOX: an overall comparison can reverse the subgroup comparisons when groups differ in composition.
Lesson: when comparing rates, ask "are the groups comparable?" and split by the key confounder (severity) before concluding.`,
    rubric: `Correct = chooses B, explains that it wins in each subgroup and that case mix flips the total, and names or describes Simpson's paradox. Partial = chooses B with a weak explanation, or explains the paradox but chooses based on the "overall" numbers. Incorrect = chooses A on the overall rate.`,
  },
  {
    day: 10, title: "The magic coaching", concept: "regression to the mean", minutes: 9,
    prompt: `A cricket coach notices that whenever he shouts at a bowler after a terrible over, the next over is usually better, and whenever he praises a brilliant over, the next is usually worse. He concludes that shouting works and praise makes players complacent.

What's really going on? How could he test his theory?`,
    solution: `REGRESSION TO THE MEAN: performance = skill + luck. A terrible over is usually bad luck as well as skill, so the next over tends to be closer to average. A brilliant over includes good luck, so the next tends to be worse. That happens even if the coach says NOTHING.
The coach's reactions are triggered BY extreme performances, so they line up perfectly with the natural bounce-back.
Test: after extreme overs, randomly choose to shout, praise or stay silent, and compare the next-over changes across the three groups. Silence will show the same "improvement after bad, decline after good".`,
    rubric: `Correct = regression to the mean explained via skill + luck, plus the fact that the reactions are selected by extremes, plus a test with a no-intervention comparison. Partial = names regression without the mechanism, or no test. Incorrect = agrees, or explains it only by "psychology".`,
  },
  {
    day: 11, title: "Two choices only?", concept: "false dilemma & loaded questions", minutes: 8,
    prompt: `Rewrite each into a fair version, and explain the trick:

(a) "Are you still wasting money on rent instead of buying a house?"
(b) "You're either with us on this policy or you don't care about children's safety."
(c) A survey: "Do you agree that the incompetent council should resign?"`,
    solution: `(a) LOADED QUESTION: it presupposes that rent is "waste" (it buys flexibility; buying has interest, maintenance and opportunity costs). Fair: "Have you compared the total costs of renting vs buying for your situation?"
(b) FALSE DILEMMA + emotional framing: you can care about safety and still disagree about this policy's effectiveness. Fair: "Do you think this policy is the best way to improve children's safety? Why or why not?"
(c) LEADING/LOADED survey item: "incompetent" assumes the conclusion. Fair: "How would you rate the council's performance?" (scale) and separately "Should the council resign?"`,
    rubric: `Correct = all three tricks identified (presupposition, false dichotomy, leading wording) with neutral rewrites. Partial = good identification but rewrites still biased, or 2 of 3. Incorrect = misses the presuppositions.`,
  },
  {
    day: 12, title: "The forwarded message", concept: "lateral reading", minutes: 10,
    prompt: `A family WhatsApp group shares: "URGENT: Drinking hot water with lemon every morning kills cancer cells, according to doctors at a top hospital. Share with everyone you love!"

Walk through exactly how you'd evaluate this in 5 minutes. What are the red flags, and what would you check?`,
    solution: `Red flags: urgency and an emotional appeal to share; a vague authority ("doctors at a top hospital", no names, no study); an extraordinary claim (curing cancer) with no evidence; a simple home remedy for a complex disease.
5-minute process (LATERAL READING): leave the message and search for the claim along with "fact check"; check whether the named hospital has said anything (it has often publicly denied such messages); look for the original source (a study? a journal?); check medical bodies (WHO, cancer societies).
Reasoning: lemon water can't change blood pH meaningfully (the body regulates it tightly), and lab results on cells ≠ effects in people.
Respond kindly in the group with a link, not ridicule.`,
    rubric: `Correct = names several red flags AND describes going to OUTSIDE sources (fact-checks, the original source, the hospital's statement) rather than judging from the message itself. Partial = red flags only, or "Google it" with no specifics. Incorrect = treats it as plausible or dismisses it without process.`,
  },
  {
    day: 13, title: "The expensive course", concept: "sunk cost", minutes: 8,
    prompt: `You paid ₹2,00,000 (non-refundable) for a 12-month course. After 4 months you've realised it's teaching outdated material and you're learning more from free resources. Quitting means "wasting" the money. Continuing takes 10 hours a week.

What should you consider, and what should you ignore? Make a recommendation.`,
    solution: `IGNORE the ₹2 lakh: it's spent whether you continue or quit (a SUNK cost). "Not wasting it" is an emotional pull, not a reason.
CONSIDER only the future: the value of the remaining 8 months (the certificate's signalling value? network? any good modules?) vs the opportunity cost of ~350 hours spent on better free resources, work or rest.
Also: can you salvage the value cheaply (attend only the useful sessions, get the certificate with minimal effort)?
Recommendation: unless the certificate or network has real future value, stop or reduce to the useful parts, and spend the time on better learning.
Test question: "If I hadn't paid anything, would I sign up for the remaining 8 months today, at 10 hours/week?"`,
    rubric: `Correct = identifies the sunk cost, focuses on future costs/benefits including opportunity cost, considers salvage value, and makes a clear recommendation. Partial = names the sunk cost but recommends on the basis of "getting my money's worth". Incorrect = continues to avoid waste.`,
  },
  {
    day: 14, title: "Fear of flying", concept: "availability heuristic", minutes: 8,
    prompt: `After seeing news of a plane crash, your friend decides to drive 1,200 km instead of flying. Explain why their risk perception might be off, and how you'd reason about the actual risk.`,
    solution: `AVAILABILITY HEURISTIC: we judge likelihood by how easily examples come to mind. Plane crashes are vivid, rare and heavily covered; car crashes are common and barely reported.
Actual risk: compare deaths per km (or per trip). Commercial flying is roughly 100× safer per km than driving. A 1,200 km drive (fatigue, night driving, highway risk) is usually riskier than a flight of the same distance.
Also: one recent crash doesn't change the underlying risk much.
Reason with base rates and the same unit (per km, per trip), not with recent memories.`,
    rubric: `Correct = names availability/vividness bias and compares the risks with base rates in a common unit. Partial = names the bias without comparing data, or vice versa. Incorrect = agrees driving is safer.`,
  },
  {
    day: 15, title: "Hidden premises", concept: "unstated assumptions", minutes: 9,
    prompt: `"Crime rose 12% last year, so we need to hire 500 more police officers."

List every unstated assumption this argument depends on (aim for at least five). Then say which ONE, if false, would most weaken the argument.`,
    solution: `Assumptions:
1. The 12% rise is real (not a reporting change or better recording).
2. It isn't a one-year blip (regression to the mean).
3. More police reduce crime (and these types of crime specifically).
4. 500 is the right number. The effect scales and it is worth the cost.
5. Police are the most cost-effective option (vs lighting, youth programmes, addressing the specific causes).
6. Officers can actually be recruited and trained in time.
7. The rise is spread across areas where officers would be posted.
Most critical: #3 for these crime types, or #1 (if the rise is a recording artefact, the whole case collapses).`,
    rubric: `Correct = at least 5 distinct and relevant assumptions spanning data validity, causality, cost-effectiveness and alternatives, plus a reasoned pick of the most critical. Partial = 3-4, or no prioritisation. Incorrect = rebuts rather than identifying assumptions.`,
  },
  {
    day: 16, title: "Decision journal", concept: "decision journal", minutes: 12,
    prompt: `Pick a REAL decision you're facing in the next few weeks (career, study, money, health, a relationship, anything). Write a decision-journal entry:

1. The decision and its deadline.
2. The options you considered (at least 3).
3. What you choose (or lean towards) and why.
4. What you expect to happen, with a probability (e.g. "70% I'll be happier in 3 months").
5. Key assumptions this depends on.
6. How you feel right now (tired, anxious, excited...).
7. What evidence would make you change your mind.

On Day 29 you'll review this entry.`,
    solution: `There's no single right answer. A strong entry is SPECIFIC and FALSIFIABLE:
- options include a non-obvious one (not just "do it / don't");
- predictions have probabilities and dates, so they can be checked later;
- assumptions are listed so you can see which one failed;
- current emotions are recorded (they explain later bias);
- there is a "kill criterion": what would make you reverse.
The point: later you can judge the QUALITY of the decision separately from the outcome (avoiding hindsight bias and "resulting").`,
    rubric: `Grade completeness and quality, not the choice itself. Correct = all 7 parts, at least 3 options, at least one probability with a time frame, explicit assumptions and a concrete change-my-mind criterion. Partial = missing probabilities or assumptions, or vague predictions ("it'll be fine"). Incorrect = not a real decision, or most parts missing. In "try_this_next", suggest a checkable prediction to add.`,
  },
  {
    day: 17, title: "The flagged bag", concept: "base-rate neglect", minutes: 11,
    prompt: `An airport scanner catches 95% of real threats and wrongly flags 2% of harmless bags. 1 bag in 10,000 is a real threat. A bag gets flagged.

1. Roughly what's the chance it's a real threat?
2. Does that mean the scanner is useless? What should happen after a flag?`,
    solution: `1. Per 1,000,000 bags: 100 threats → 95 flagged. 999,900 harmless → 2% ≈ 19,998 flagged. P(threat | flag) ≈ 95 / 20,093 ≈ 0.47%, under 1 in 200.
2. Not useless: it raises the probability from 0.01% to ~0.5% (≈47× more likely) and catches 95% of threats. It's a SCREENING test. A flag should trigger a second, more specific check (a manual search), not panic.
Lesson: with rare events, even accurate tests produce mostly false alarms. Always combine test accuracy with the BASE RATE.`,
    rubric: `Correct = ~0.5% (0.3-0.6% fine) via frequencies or Bayes, and the screening insight (useful as a first filter, needs a follow-up). Partial = right method with an arithmetic error, or correct number but calls the scanner useless. Incorrect = 95% or 98%. Feedback must point at ignoring the 1-in-10,000 base rate.`,
  },
  {
    day: 18, title: "Pre-mortem", concept: "pre-mortem", minutes: 12,
    prompt: `Your college club plans to launch an app for the annual fest in 6 weeks (schedules, tickets, maps). Run a PRE-MORTEM: it's the day after the fest and the app was a disaster.

1. Write at least 6 specific reasons it failed (across tech, people, users, timeline).
2. Pick the 2 most likely/damaging and give a concrete prevention for each.`,
    solution: `Example failure reasons:
- Tech: crashed under load at ticket opening; payment integration delayed; the offline map didn't work with no signal in the venue.
- People: the lead developer had exams in week 5; no one owned testing.
- Users: students didn't download it (low awareness), or found the WhatsApp group easier; it needed a sign-up (friction).
- Timeline: scope creep (chat feature) ate the time; app-store review delays.
- Data: schedule changes weren't updated in the app → wrong info → distrust.
Prevention for top 2: (1) app-store/payment risk → submit a basic version by week 3, use a hosted ticketing link as a fallback; (2) stale schedules → one owner with an admin panel, and push updates.
Value: imagining failure as CERTAIN makes people raise risks they'd otherwise keep quiet about.`,
    rubric: `Correct = at least 6 specific, varied failure causes (not generic "bugs"), then prioritised top 2 with concrete, actionable preventions (owners, fallbacks, dates). Partial = generic reasons or no prioritisation. Incorrect = a risk list without the "it already failed" framing, or 3 or fewer reasons.`,
  },
  {
    day: 19, title: "The call-centre metric", concept: "Goodhart's law", minutes: 9,
    prompt: `A call centre starts rewarding agents for keeping "average call duration" under 4 minutes. Three months later, the average is 3.2 minutes, but customer complaints are up 40%.

Explain what happened using Goodhart's law. Propose a better set of measures.`,
    solution: `GOODHART'S LAW: "When a measure becomes a target, it ceases to be a good measure." Agents optimised the number, not the goal (solving problems efficiently): rushing customers, transferring or dropping calls, giving quick but wrong answers → repeat calls and complaints.
Better: a balanced set that is hard to game together:
- first-contact resolution (did the customer call back within 7 days?),
- customer satisfaction after the call,
- call duration as a diagnostic, not a target,
- quality audits of sampled calls.
Also ask: what behaviour does each metric reward, and how could someone game it?`,
    rubric: `Correct = explains gaming of a proxy metric with concrete behaviours, then proposes paired/balanced metrics tied to the real goal (resolution, satisfaction). Partial = names Goodhart but offers a single replacement metric that can also be gamed. Incorrect = blames the agents only.`,
  },
  {
    day: 20, title: "It's natural", concept: "appeal to nature & equivocation", minutes: 9,
    prompt: `Advertisement: "Our herbal pills are 100% natural, made from ancient plants. Unlike chemical medicines, they're completely safe for everyone."

Identify the reasoning flaws and the slippery words. What questions would you ask the company?`,
    solution: `APPEAL TO NATURE: "natural" doesn't mean safe (arsenic, hemlock and many poisonous plants are natural) or effective.
EQUIVOCATION/false contrast: "chemical" is used as if it meant "artificial/harmful", but everything, including herbs, is chemicals.
Overclaim: "completely safe for everyone" (no substance is: allergies, pregnancy, interactions with medicines, liver toxicity of some herbs, dosage).
"Ancient" = appeal to tradition.
Questions: Which compounds, at what dose? Which clinical trials (independent, placebo-controlled)? Known side effects and interactions? Quality control (heavy-metal contamination)? Is it regulated as a medicine?`,
    rubric: `Correct = appeal to nature, the misleading "chemical" contrast/equivocation and the safety overclaim, plus specific evidence-seeking questions. Partial = two of the three, or vague questions. Incorrect = accepts that natural = safe.`,
  },
  {
    day: 21, title: "Coffee and long life", concept: "evaluating research claims", minutes: 11,
    prompt: `Headline: "Study of 500,000 people finds coffee drinkers live longer!"

Before changing your habits, what 6 questions would you ask about the study? For each, say how the answer could change your conclusion.`,
    solution: `1. Observational or randomised? Most are observational → confounding.
2. What was controlled for (income, smoking, exercise, health)? Healthier, wealthier people may drink more coffee, and sick people may stop (reverse causation).
3. How big is the effect, in ABSOLUTE terms? A 10% relative risk reduction might mean 1 fewer death per 1,000 over 10 years.
4. Dose-response: does more coffee mean more benefit, or is it U-shaped?
5. Does it replicate in other populations and studies?
6. Who funded it, and was it pre-registered?
7. How was coffee intake measured (one questionnaire at the start)?
A huge sample makes the estimate precise, NOT unbiased.`,
    rubric: `Correct = at least 6 relevant questions including design/confounding, absolute effect size and replication, each linked to how the answer changes the conclusion. Partial = good questions without the "how it changes the conclusion" step, or fewer than 5. Incorrect = equates a large sample with proof.`,
  },
  {
    day: 22, title: "Follow the incentives", concept: "incentive analysis", minutes: 10,
    prompt: `Three pieces of advice:
(a) A private hospital surgeon recommends knee surgery for your moderate pain.
(b) A financial adviser who earns commission recommends a high-fee insurance-investment plan.
(c) Your friend who works at a startup urges you to join it.

For each: what incentives might shape the advice, how much should that change your trust, and what would you do to get a more reliable view?`,
    solution: `(a) Surgeons are paid per procedure and trained to see surgical solutions. Not necessarily dishonest, but biased. Get a second opinion from a non-surgeon (physiotherapist/sports-medicine doctor); ask about conservative options and the outcomes WITHOUT surgery; ask what the evidence says for your severity.
(b) The commission is directly tied to the product. Ask for fee disclosure in rupees; compare with low-cost alternatives (term insurance + index fund); prefer fee-only advisers.
(c) Referral bonus? Wanting validation of their own choice? Genuine enthusiasm with limited perspective? Talk to ex-employees, check funding/runway, compare the offer objectively.
Principle: incentives don't make advice wrong. They tell you where to look for independent confirmation.`,
    rubric: `Correct = specific incentives for all three, proportionate scepticism (not "everyone lies"), and concrete steps to get independent information. Partial = incentives identified but no verification steps, or cynical blanket dismissal. Incorrect = misses the conflicts of interest.`,
  },
  {
    day: 23, title: "Significant but tiny", concept: "statistical vs practical significance", minutes: 10,
    prompt: `An A/B test on 10 million users: the new checkout button raised conversion from 3.00% to 3.03% (p < 0.001). The design lead says: "Highly significant, a huge win!"

Evaluate that claim. What should the team actually consider before shipping?`,
    solution: `"Statistically significant" means the difference is unlikely to be ZERO, not that it's large. With 10M users even tiny effects reach p < 0.001.
Effect: +0.03 percentage points = +1% relative. Is that meaningful? Translate into money: e.g. 1M checkouts/month × 1% = +10,000 orders. Might be worth it, or not.
Consider: the confidence interval (could it be ~0?); the cost and risk of shipping (very cheap here); side effects on other metrics (refunds, average order value); novelty effects (will it fade?); multiple testing (how many variants were tried?).
Conclusion: probably ship if it's free and has no downsides, but it's a small win, not a huge one.`,
    rubric: `Correct = separates statistical from practical significance, explains the large-N effect, quantifies the absolute/relative effect in business terms, and lists other checks. Partial = makes the distinction but doesn't quantify or check guardrails. Incorrect = agrees it's huge, or dismisses it as worthless with no reasoning.`,
  },
  {
    day: 24, title: "Why the market fell", concept: "hindsight & narrative fallacy", minutes: 10,
    prompt: `Every evening, news anchors explain why the stock market moved that day: "Markets fell on inflation fears" or "Stocks rose as investors shrugged off inflation fears."

What's the reasoning problem here? How should you treat these explanations, and your own explanations of past events?`,
    solution: `NARRATIVE FALLACY + HINDSIGHT BIAS: after the fact, we fit a tidy story to noisy movements. The same cause ("inflation fears") "explains" both rises and falls, which means it explains nothing. Daily moves are largely noise from millions of independent decisions.
Test of a real explanation: would it have PREDICTED the move beforehand? Can it be wrong?
Your own life: we rewrite memories to make outcomes feel inevitable ("I knew it"). Fix: write predictions down BEFORE events (a decision journal), and judge explanations by their predictive record.`,
    rubric: `Correct = names narrative fallacy/hindsight bias, notes that the explanation is unfalsifiable (it explains both directions), proposes predictive tests or prediction logs. Partial = says "it's random" without the falsifiability insight. Incorrect = accepts the narratives.`,
  },
  {
    day: 25, title: "How sure are you?", concept: "calibration", minutes: 12,
    prompt: `For each question, give a range you are 90% sure contains the true answer (don't look anything up):
1. Length of the Ganga river (km)
2. Year the first iPhone was released
3. Height of Mount Everest (m)
4. Population of Australia (2025)
5. Boiling point of water at the top of Everest (°C)

Then reflect: how wide were your ranges, and what does this exercise reveal?`,
    solution: `Answers: 1. ~2,525 km. 2. 2007. 3. 8,849 m. 4. ~27 million. 5. ~70 °C (roughly 68-72).
If your ranges were well calibrated, about 4.5 of the 5 should contain the answer. Most people get 2-3 → OVERCONFIDENCE: their ranges are too narrow.
Better technique: start from what you know (Everest is about the cruising altitude of planes ≈ 9 km), then widen until you'd be genuinely surprised to be wrong at both ends. Ask "what would make the answer much lower/higher?"`,
    rubric: `Grade calibration, not trivia knowledge. Count how many ranges contain the true answer. Correct = 4-5 hits AND a thoughtful reflection on how the ranges were set. Partial = 3 hits, or good hits but no reflection. Incorrect = 0-2 hits with narrow ranges and no recognition of overconfidence (but even then, a sharp reflection can lift it to partial). Mention the true answers in the feedback.`,
  },
  {
    day: 26, title: "The slippery slope", concept: "conjunction of probabilities", minutes: 10,
    prompt: `"If we let students use calculators in class 8, they'll stop learning arithmetic, then they won't understand algebra, then they'll fail science, and eventually we'll have a generation that can't do any maths."

Evaluate this argument. When IS a slippery-slope argument reasonable?`,
    solution: `Each link is uncertain, and the probability of the whole chain is the PRODUCT. Even at 60% per link, 4 links → 0.6^4 ≈ 13%. The conclusion is far less likely than it sounds.
Also: the links can be broken (teach arithmetic before allowing calculators, require mental-maths assessments) and other countries provide evidence.
A slippery slope is reasonable when there's a MECHANISM making each step likely (precedent, incentives, irreversibility) and evidence for the links. Then the question is whether safeguards can stop the slide.`,
    rubric: `Correct = multiplying uncertain links, ways to break the chain, and criteria for when such arguments are valid. Partial = calls it a fallacy without analysing the probabilities, or a blanket dismissal. Incorrect = accepts the chain.`,
  },
  {
    day: 27, title: "Ritika the activist", concept: "conjunction fallacy", minutes: 10,
    prompt: `Ritika is 31, outspoken and very bright. She studied environmental science and as a student she organised climate protests and campaigned against plastic.

Rank these from most to least probable:
(a) Ritika is a bank employee.
(b) Ritika is a bank employee who is active in the environmental movement.
(c) Ritika works for an NGO.

Then explain the logic of your ranking of (a) vs (b).`,
    solution: `(a) must be ranked at least as high as (b): every "bank employee who is an activist" is also a "bank employee". P(A and B) ≤ P(A). Ranking (b) above (a) is the CONJUNCTION FALLACY: the description feels "representative", so the more detailed story feels more likely.
(c) can reasonably be ranked high given the description (but keep base rates in mind: there are many more bank employees than NGO workers in general).
A reasonable ranking: (c) ≥ (a) > (b), or (a) > (b) with (c) placed by your judgement. The one firm rule is (a) ≥ (b).`,
    rubric: `Correct = (a) above or equal to (b) with the subset logic explained; bonus for mentioning base rates for (c). Partial = correct order without the conjunction logic. Incorrect = (b) above (a); feedback must explain representativeness vs probability.`,
  },
  {
    day: 28, title: "Red-team yourself", concept: "red-teaming your own beliefs", minutes: 13,
    prompt: `Pick a belief you hold STRONGLY (about society, health, money, education, anything).

1. State it precisely.
2. Write the strongest case AGAINST it (as a smart opponent would).
3. List what evidence would change your mind, specifically.
4. Rate your confidence before and after (0-100%).`,
    solution: `No single answer. A strong response:
- makes the belief precise and testable ("remote work improves productivity for software teams", not "remote work is good");
- the opposing case uses real mechanisms and evidence, not a straw man;
- the change-my-mind evidence is concrete and observable ("a randomised study showing X", "if Y happens by Z");
- confidence moves at least a little, or there's an honest explanation of why not.
Point: if you can't say what would change your mind, you hold it as identity, not as a belief.`,
    rubric: `Correct = a precise belief, a strong steelmanned counter-case, specific falsifying evidence, and an honest confidence update. Partial = a vague belief or weak counter-case. Incorrect = no real counter-argument, or a strawman. Don't grade the belief itself.`,
  },
  {
    day: 29, title: "Review your decision journal", concept: "resulting (decision vs outcome)", minutes: 15, revisitOf: 16,
    prompt: `Re-read your Day 16 decision journal (it is shown to the coach alongside this answer). Answer:

1. What actually happened so far (or what you now expect)?
2. Which predictions and assumptions held up, and which didn't?
3. Separate DECISION quality from OUTCOME: was it a good decision given what you knew then, regardless of how it turned out?
4. What will you do differently in your next big decision?`,
    solution: `Strong reviews:
- compare predictions with reality honestly (including probabilities: a 70% prediction that failed isn't necessarily a bad call);
- identify which assumption broke, and whether it was knowable at the time;
- avoid RESULTING (judging the decision by its outcome) and HINDSIGHT bias ("I knew it");
- extract a specific process change (e.g. "seek one dissenting opinion", "write the kill criterion first").`,
    rubric: `Compare with the Day 16 entry if provided. Correct = an honest comparison of predictions vs reality, a clear separation of decision quality from outcome, and a concrete process lesson. Partial = describes the outcome but judges the decision only by it, or no lesson. Incorrect = no reference to the original entry. If Day 16 is missing, grade the general reflection and note it.`,
  },
  {
    day: 30, title: "Name the flaw (revisited)", concept: "informal fallacies", minutes: 7, revisitOf: 1,
    prompt: `Day 30: back to Day 1. Identify the main flaw in each, and go deeper than last time: what question would expose it in a live discussion?

(a) "Don't listen to Priya on the sugar tax. She's always on some diet."
(b) "Either we ban all cars from the city centre or we accept that pollution will kill us."
(c) "My opponent wants to reduce the defence budget. Clearly he wants to leave the country defenceless."`,
    solution: `(a) Ad hominem → "Setting Priya aside, what's wrong with her ARGUMENT?"
(b) False dilemma → "What options sit between a full ban and doing nothing?"
(c) Straw man → "Is 'reduce' the same as 'eliminate'? By how much, and on what?"
Expect sharper naming, explanations that would convince someone who made the argument, and practical countering questions.`,
    rubric: `Same as Day 1, plus the expectation of good countering questions. Compare with the Day 1 answer and note specifically what improved.`,
  },
];
