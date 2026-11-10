// ANALYTICAL: 30 exercises. Graded on structure, assumptions and sanity checks, not on one exact number.
export default [
  {
    day: 1, title: "Chai in Mumbai", concept: "Fermi estimation", minutes: 7,
    prompt: `Estimate how many cups of chai are sold (bought outside the home) in Mumbai on a typical day.

Break it into factors, state each assumption with a number, and give a final range.`,
    solution: `Example structure: people × share who buy chai out × cups per buyer.
- Metro population ≈ 20 million.
- Share who buy at least one cup outside on a given day: ~25-35% (commuters, workers, students) → ~6 million.
- Cups per buyer per day: ~1.5.
→ ~9 million cups/day; a sensible range is 5-15 million.
Cross-check from the supply side: ~30,000-50,000 tea stalls/canteens × ~200-300 cups each ≈ 6-15 million. Agrees.
Fermi skills: decompose, put a number on every assumption, round boldly, cross-check by a second route.`,
    rubric: `Grade structure, not the number. Strong = clear decomposition, explicit numbers for each factor, a final range and ideally a cross-check. Partial = reasonable answer but assumptions hidden or unjustified, or no range. Weak = a bare guess. Anything within ~2-30 million with sound structure is acceptable.`,
  },
  {
    day: 2, title: "Slow café", concept: "5 Whys", minutes: 7,
    prompt: `A café's complaints about slow service doubled this month. Use the 5 Whys to dig for a root cause. Write out each "why" and its answer (you may invent plausible facts), then say what you'd fix and how you'd check it's really the root.`,
    solution: `Example chain:
1. Why slow? Orders take longer to come out.
2. Why? The espresso machine is the queue point.
3. Why? One of its two group heads has been out of action for 3 weeks.
4. Why? The repair wasn't booked.
5. Why? Nobody owns maintenance, so equipment issues have no process.
Root: no maintenance ownership/process (not "lazy staff"). Fix: assign an owner and a weekly equipment checklist, and repair the head.
Validate: does the timing match (complaints rose after the head broke)? Is wait time concentrated on espresso drinks? Do complaints fall after the fix?
Good 5 Whys stop at a PROCESS cause you can change, and get tested with data.`,
    rubric: `Strong = a causal chain where each link really explains the one above it, ending in a fixable process or system cause, plus a way to verify. Partial = chain stops at a symptom ("staff are slow") or jumps without a causal link, or no verification. Weak = blame without a chain.`,
  },
  {
    day: 3, title: "Revenue fell 10%", concept: "driver trees", minutes: 9,
    prompt: `A food delivery app's revenue fell 10% month over month. Build a driver tree (revenue broken into multiplied/added drivers, at least 3 levels deep). Then list the first 3 numbers you'd pull to find the culprit, in order.`,
    solution: `Revenue = Orders × Average order value × Take rate (+ delivery fees + ads).
Orders = Active customers × Orders per customer.
Active customers = Retained + New + Reactivated.
AOV = Items per order × Price per item (− discounts).
Take rate = commission mix across restaurant contracts.
First checks: (1) which top-level driver moved (orders vs AOV vs take rate); (2) whether the drop is concentrated in a city, platform or segment; (3) known events: a promo ending, competitor launch, outage, seasonality, a tracking change.
Method: multiply the drivers back together and check they reproduce revenue, then find which branch explains the 10%.`,
    rubric: `Strong = a MECE, multiplicative tree at least 3 levels deep, plus a prioritised plan that splits top-level drivers first and considers data issues. Partial = a list of causes rather than a tree, or a tree that doesn't multiply back to revenue. Weak = jumps straight to a single cause.`,
  },
  {
    day: 4, title: "Where to move", concept: "weighted decision matrix", minutes: 9,
    prompt: `You're choosing a city. Weights: Cost 40%, Career 35%, Lifestyle 25%. Scores out of 10:
- Pune: Cost 7, Career 6, Lifestyle 7
- Bengaluru: Cost 4, Career 9, Lifestyle 6
- Jaipur: Cost 9, Career 4, Lifestyle 7

1. Compute the weighted scores.
2. How robust is the winner? Test what happens if Career becomes 45% and Cost 30%.`,
    solution: `1. Pune 0.4×7 + 0.35×6 + 0.25×7 = 2.8 + 2.1 + 1.75 = 6.65
Bengaluru 1.6 + 3.15 + 1.5 = 6.25
Jaipur 3.6 + 1.4 + 1.75 = 6.75 → Jaipur wins, narrowly.
2. With weights 30/45/25: Pune 2.1 + 2.7 + 1.75 = 6.55; Bengaluru 1.2 + 4.05 + 1.5 = 6.75; Jaipur 2.7 + 1.8 + 1.75 = 6.25 → Bengaluru wins.
A 10-point weight shift flips the ranking, so the decision is NOT robust. The real question is how much career matters to you. Make the weights explicit and test them.`,
    rubric: `Strong = correct weighted scores, the flip under new weights, AND the conclusion that the result depends on the weights. Partial = arithmetic right but no robustness insight, or the insight with an arithmetic error. Weak = picks by gut feel.`,
  },
  {
    day: 5, title: "Smartphones per year", concept: "stock and flow", minutes: 9,
    prompt: `Estimate how many smartphones are sold in India per year. Use a STOCK (how many in use) and FLOW (how often they're replaced) approach. State assumptions and a range.`,
    solution: `Stock: population ~1.45 billion; smartphone users ~55-65% of people over 10 → roughly 700-800 million phones in use.
Flow: average replacement cycle ~3-4 years → 700M / 3.5 ≈ 200 million replacements + new users (~20-30M/yr).
Estimate: ~150-250 million/year. (Actual shipments are around 150 million; second-hand phones and longer cycles explain the gap.)
Tool: annual sales ≈ installed base ÷ lifetime + growth.`,
    rubric: `Strong = explicit stock × (1/lifetime) logic plus a growth term, numbers for each, and a range. Partial = a reasonable number from a population × share shortcut without the replacement logic. Weak = an unexplained guess. Anything in ~80-400M with sound structure is acceptable.`,
  },
  {
    day: 6, title: "Empty library", concept: "MECE", minutes: 9,
    prompt: `Visits to a public library fell 30% over two years. Lay out possible causes in a MECE structure (mutually exclusive, collectively exhaustive) at two levels. Then pick the branch you'd investigate first and why.`,
    solution: `One MECE split: Demand vs Supply vs Measurement.
- Demand: fewer potential visitors (population moved, students fewer), same people visiting less (moved online, competition from cafés and co-working, changed needs).
- Supply: access (opening hours cut, location/transport, construction), offer (collection outdated, Wi-Fi, seating, events cut), experience (noise, safety, staff).
- Measurement: the counter changed, online visits not counted, a new entrance bypasses the gate.
Start with measurement (cheap, and it invalidates everything else), then any supply changes with dates that match the decline.`,
    rubric: `Strong = branches that don't overlap and cover the space, including measurement error, plus a reasoned first step. Partial = a good list with overlap (e.g. "online" under several branches) or a missing category. Weak = an unstructured list.`,
  },
  {
    day: 7, title: "Which lever matters?", concept: "sensitivity analysis", minutes: 10,
    prompt: `A juice stall: price ₹50 per cup, 400 cups/month, variable cost ₹20 per cup, fixed costs ₹8,000/month.

1. What's the monthly profit?
2. Which 10% adverse change hurts profit most: price −10%, volume −10%, variable cost +10%, or fixed cost +10%?
3. What's the break-even volume?`,
    solution: `1. Profit = 400 × (50 − 20) − 8,000 = 12,000 − 8,000 = ₹4,000.
2. Price −10% → 400 × 25 − 8,000 = ₹2,000 (−50%)
Volume −10% → 360 × 30 − 8,000 = ₹2,800 (−30%)
Variable +10% → 400 × 28 − 8,000 = ₹3,200 (−20%)
Fixed +10% → 12,000 − 8,800 = ₹3,200 (−20%)
Price hurts most: a price change hits the margin on every unit, and profit is a thin slice of revenue.
3. Break-even = 8,000 / 30 ≈ 267 cups.
Tool: shock one input at a time by the same % and rank the impact (a tornado chart).`,
    rubric: `Strong = correct profit, all four shocks computed and ranked, break-even 267, and the reason price dominates. Partial = correct but incomplete (only some shocks) or a correct ranking with arithmetic slips. Weak = ranking by intuition without computing.`,
  },
  {
    day: 8, title: "Is a new member worth it?", concept: "unit economics", minutes: 10,
    prompt: `A gym charges ₹1,500/month. 8% of members cancel each month. Getting a new member costs ₹3,000 in marketing. Gross margin per member is 40%.

Is acquiring members profitable? Compute lifetime value and payback, and say which assumption you'd question first.`,
    solution: `Average lifetime ≈ 1 / 0.08 = 12.5 months.
Lifetime revenue ≈ 12.5 × 1,500 = ₹18,750; lifetime margin ≈ 40% → ₹7,500.
LTV/CAC = 7,500 / 3,000 = 2.5. Payback = 3,000 / (1,500 × 0.4 = ₹600 per month) = 5 months.
Profitable, but only moderately (3+ is the usual comfort level).
Question: is 8% churn constant? New members often churn much faster early on (January joiners), so early-cohort churn could cut lifetime sharply. Also check whether the 40% margin counts the extra cost of busier hours.`,
    rubric: `Strong = correct lifetime, LTV (margin-based), payback and a critical look at the churn or margin assumption. Partial = uses revenue instead of margin for LTV, or no assumption critique. Weak = no calculation.`,
  },
  {
    day: 9, title: "Ratings dropped", concept: "segmentation", minutes: 10,
    prompt: `Your app's average rating fell from 4.5 to 4.1 in a month. Breakdown:
- iOS: 4.6 → 4.6 (ratings volume flat)
- Android: 4.4 → 3.8 (ratings volume up 60%)
Version 2.3 shipped only on Android this month.

What's likely going on? What 3 things would you check next, and what would change your mind?`,
    solution: `The whole drop sits in Android: iOS is flat, Android fell and its share of ratings rose. That points to v2.3 (a bug, crash, performance or UI change), with angry users rating more often (the volume jump).
Check: (1) Android ratings split by app version (2.2 vs 2.3), (2) crash rate / ANRs and the review text for 2.3, (3) device/OS clustering (one manufacturer?).
Would change my mind: if 2.2 users also dropped, look at a shared cause (pricing change, backend outage, policy).
Note: the overall average fell partly because of mix: more Android ratings weigh the average down.`,
    rubric: `Strong = isolates the segment, links it to the release, notices the volume/mix effect, gives concrete next checks and a disconfirming condition. Partial = blames v2.3 without the mix effect or without a falsifying check. Weak = generic ideas ("improve UX").`,
  },
  {
    day: 10, title: "Petrol pumps", concept: "capacity estimation", minutes: 11,
    prompt: `Estimate how many petrol pumps (stations) a city of 10 million people needs. Work from demand (fills per day) and supply (fills one station can handle). Give a range and one sanity check.`,
    solution: `Demand: ~10M people → ~4M vehicles (mostly two-wheelers, ~1M cars). Each fills about once a week → ~570k fills/day; add autos/commercial → ~600-700k.
Supply: a station with ~8 nozzles, ~3 min per fill, 16 busy hours → max ~2,500 fills/day; at ~50-60% utilisation → ~1,400.
Stations ≈ 650k / 1,400 ≈ 450; range 300-800.
Sanity check: big Indian cities have a few hundred stations (≈ one per 20-30k people), which is consistent.`,
    rubric: `Strong = demand and capacity both built from explicit factors, includes a utilisation adjustment and a sanity check. Partial = only demand or only supply modelled, or no utilisation. Weak = a guess. A range of ~150-2,000 with good structure is acceptable.`,
  },
  {
    day: 11, title: "Conversion dip", concept: "hypothesis-driven diagnosis", minutes: 11,
    prompt: `An online store's conversion rate fell from 3.0% to 2.4% starting Tuesday. Build a list of hypotheses grouped by type and ORDER your investigation. Justify the order (consider likelihood, cost to check, and impact).`,
    solution: `Groups:
1. Measurement: tracking tag broken, bot traffic inflating visits, analytics change. Cheap to check, common → check FIRST.
2. Traffic mix: a new campaign brought low-intent visitors (conversion falls while orders hold).
3. Product/site: release on Tuesday, checkout bug, payment gateway failure, slow pages, a device-specific breakage.
4. Offer: price change, out-of-stock items, a promo ended.
5. External: competitor sale, holiday, news.
Order: tracking → did absolute orders fall or just the rate? → segment by source/device/browser → release log and checkout funnel step → offer → external.
Key: split the ratio into numerator (orders) and denominator (visits) right away.`,
    rubric: `Strong = grouped hypotheses including measurement and mix, an explicit order with a cost/likelihood rationale, and splitting the ratio into numerator vs denominator. Partial = good list, weak prioritisation. Weak = jumps to one cause.`,
  },
  {
    day: 12, title: "Sure thing or gamble", concept: "expected value", minutes: 10,
    prompt: `Option A: a guaranteed ₹50,000 bonus. Option B: a 30% chance of ₹2,00,000 (otherwise nothing).

1. Compute the expected value of each.
2. Which should a student with ₹20,000 in savings pick? A company making this choice 1,000 times? Explain.`,
    solution: `EV(A) = ₹50,000; EV(B) = 0.3 × 2,00,000 = ₹60,000.
B has higher EV, but high variance: 70% of the time you get nothing.
Student: if ₹50k changes their life (rent, fees), A is rational. Utility of money is concave, and ruin risk matters.
Company repeating it 1,000 times: B, because the law of large numbers makes the average reliable (≈ ₹60k each).
Lesson: EV is the right tool for repeated, affordable bets. For one-off bets that matter to you, look at the risk too.`,
    rubric: `Strong = correct EVs, distinguishes one-shot vs repeated decisions, mentions variance/utility/risk of ruin. Partial = EVs right but "always pick B" (or always A) with no context. Weak = no calculation.`,
  },
  {
    day: 13, title: "Lunch rush", concept: "bottlenecks", minutes: 11,
    prompt: `A sandwich shop line has 3 stations:
- Ordering: 1 staff, 1 min per customer
- Assembly: 2 staff, each 2.5 min per sandwich
- Payment: 1 staff, 0.75 min per customer
At lunch, 55 customers arrive per hour.

1. What's the shop's maximum throughput, and where's the bottleneck?
2. What happens to the queue at lunch?
3. If you can add ONE person, where, and what's the new bottleneck?`,
    solution: `Capacities per hour: ordering 60, assembly 2 × 24 = 48, payment 80.
1. Throughput = 48/hr; the bottleneck is assembly.
2. Demand 55 > 48 → the queue grows by ~7 customers/hour (it never stabilises during lunch).
3. Add the person to assembly → 72/hr; the bottleneck moves to ordering at 60/hr, which still covers 55 (but with little slack, so waits will be noticeable).
Theory of constraints: the system runs at the speed of its slowest step. Improving anything else does nothing.`,
    rubric: `Strong = correct capacities, bottleneck = assembly, a growing queue, adding to assembly with ordering becoming the new bottleneck. Partial = right bottleneck but a missed step (e.g. doesn't notice the bottleneck moves). Weak = adds staff at ordering or payment.`,
  },
  {
    day: 14, title: "Complaint log", concept: "Pareto analysis", minutes: 9,
    prompt: `Complaints last quarter (800 total): Late delivery 412, Wrong item 198, Cold food 96, Rude driver 41, App crash 33, Missing cutlery 20.

1. What share do the top two categories cover?
2. Which ONE would you attack first, and what else would you want to know before deciding?`,
    solution: `Top two = 610/800 = 76%. Adding cold food → 706 = 88%.
Note that cold food is probably downstream of late delivery, so fixing lateness may fix both (the categories aren't independent).
Before choosing: the COST per complaint (refunds, churn: a wrong item may cost more), how easy each is to fix, and whether app crashes are under-reported (crashing users may not complain at all).
Usually attack late delivery first: it's the biggest volume and has knock-on effects.`,
    rubric: `Strong = correct 76%, spots the late→cold dependency, weighs volume against severity/cost and ease of fixing. Partial = correct share and choice by volume only. Weak = no computation.`,
  },
  {
    day: 15, title: "Paper trees", concept: "triangulation", minutes: 11,
    prompt: `Estimate how many trees' worth of paper a school of 1,000 students uses in a year. Estimate it TWO different ways (e.g. by sheets and by weight) and compare.`,
    solution: `Way 1 (sheets): ~10 sheets per student per school day (notebooks, handouts, exams) × 200 days = 2,000 sheets → 2 million sheets/yr. One tree ≈ 8,000 sheets → ~250 trees.
Way 2 (weight): an A4 sheet ≈ 5 g → 2M × 5 g = 10 tonnes. One pulpwood tree ≈ 40-60 kg of paper → ~170-250 trees.
The two methods agree on roughly 150-300 trees. When independent routes converge, trust the estimate more. When they don't, one assumption is wrong.`,
    rubric: `Strong = two genuinely independent methods with explicit numbers, compared and reconciled. Partial = one method done well, or two methods that share the same key assumption. Weak = one guess.`,
  },
  {
    day: 16, title: "Cheaper tickets", concept: "contribution margin", minutes: 11,
    prompt: `A theatre sells 1,000 tickets at ₹400. Research says at ₹300 it would sell 1,400. Each extra attendee costs ₹100 (staff, cleaning, snacks given away). There are 1,500 seats.

Should they cut the price? Compare revenue and profit, and list two things that could make the research wrong.`,
    solution: `Revenue: ₹400 × 1,000 = ₹4,00,000 vs ₹300 × 1,400 = ₹4,20,000 (+5%).
Contribution (price − ₹100): 300 × 1,000 = ₹3,00,000 vs 200 × 1,400 = ₹2,80,000 (−7%).
So revenue rises but profit FALLS, so don't cut (unless secondary spend on food, merchandise or repeat visits adds more than ₹14 per extra attendee).
Risks: surveys overstate real purchases; cannibalising people who would have paid ₹400; competitor reactions; anchoring the brand at a lower price.`,
    rubric: `Strong = computes both revenue and contribution, concludes against the price cut or makes it conditional on secondary spend, and challenges the research. Partial = only revenue compared (says yes), or a correct calculation without critique. Weak = no numbers.`,
  },
  {
    day: 17, title: "Free buses", concept: "second-order thinking", minutes: 12,
    prompt: `A city makes all public buses free. Map first-, second- and third-order effects (at least 2 per level), then name 3 metrics you'd track to know if it worked.`,
    solution: `1st order: more riders; lower costs for poor households; fare revenue lost.
2nd order: crowding and slower boarding (no fare collection = faster, actually); some car and two-wheeler trips shift (less traffic?), but also many walking/cycling trips shift to bus; budget pressure → fewer routes or a tax increase.
3rd order: land use (people live farther out), retail near stops, political lock-in (hard to reverse), possible decline in maintenance quality if under-funded.
Metrics: share of trips by mode (did CAR trips fall, not just walking?), bus crowding and reliability, cost per new rider, low-income access/employment.
Second-order thinking asks "and then what?" and checks whether the GOAL (less traffic? equity?) is what actually moves.`,
    rubric: `Strong = distinct effects at each level linked causally, includes unintended effects (substitution from walking), and metrics tied to the goal. Partial = good first-order effects, shallow later levels, or metrics that only count riders. Weak = a list of pros and cons.`,
  },
  {
    day: 18, title: "Did the training work?", concept: "experiment design", minutes: 12,
    prompt: `The 10 worst-performing sales branches were sent on a new training course. Next quarter, 8 of them improved. The CEO wants to roll it out everywhere.

Explain why this evidence is weak, then design a better test.`,
    solution: `Why weak: (1) regression to the mean: the worst branches were partly unlucky and would tend to improve anyway; (2) no control group; (3) seasonality or market changes affecting everyone; (4) attention effects (the branches know they're being watched).
Better test: take the bottom 20 branches, RANDOMLY assign 10 to training and 10 to no training (or a delayed start); compare the CHANGE in performance between groups over the same quarter; set the success metric and size of effect in advance; ideally repeat on mid-tier branches too.
The comparison you need is "trained vs not trained", not "before vs after".`,
    rubric: `Strong = names regression to the mean AND lack of a control, then designs a randomised comparison with a pre-defined metric. Partial = names one flaw, or designs a control without randomisation. Weak = accepts the result.`,
  },
  {
    day: 19, title: "Should we run a pilot?", concept: "value of information", minutes: 13,
    prompt: `Launching a product costs ₹10 lakh. There's a 40% chance it succeeds (profit ₹50 lakh before the launch cost) and 60% it fails (₹0 before the launch cost).
A pilot costing ₹2 lakh would tell you PERFECTLY whether it will succeed.

1. What's the expected value of launching now?
2. What's the expected value of piloting first (launch only if the pilot says success)?
3. What's the most you should pay for the pilot?`,
    solution: `1. EV(launch) = 0.4 × 50 − 10 = 20 − 10 = ₹10 lakh.
2. With the pilot: 40% → launch, net 50 − 10 = 40; 60% → don't launch, 0. EV = 0.4 × 40 − 2 = 16 − 2 = ₹14 lakh.
3. Value of perfect information = 16 − 10 = ₹6 lakh. That's the expected loss avoided (0.6 × 10). Pay up to ₹6 lakh.
Insight: information is valuable when it can CHANGE your decision and the wrong decision is expensive.`,
    rubric: `Strong = all three right (10, 14, 6) with the logic that information avoids the 60% × 10 loss. Partial = 1 and 2 right but 3 wrong (e.g. says 4), or a small arithmetic slip. Weak = no decision-tree reasoning.`,
  },
  {
    day: 20, title: "The barber's year", concept: "bottom-up revenue model", minutes: 11,
    prompt: `Estimate the annual revenue of a busy neighbourhood barber shop in an Indian city. Build it bottom-up (chairs, customers, prices, days) and include at least one adjustment for reality (e.g. utilisation, seasonality, services mix).`,
    solution: `3 chairs × ~10 customers per chair per day (out of ~16 possible slots → ~60% utilisation) = 30 customers/day.
Average ticket: haircut ₹200, shave ₹100, some colouring/facials → blended ~₹230.
Days: ~26/month × 12 = 312.
Revenue ≈ 30 × 230 × 312 ≈ ₹21.5 lakh/yr; festival/wedding season spikes, monsoon dips.
Sanity check: ~₹1.8 lakh/month supports 3 barbers' wages plus rent and still leaves a profit. Plausible.`,
    rubric: `Strong = clear capacity × utilisation × price × days, at least one realism adjustment, and a sanity check against costs. Partial = a simple multiplication without utilisation or a check. Weak = a bare number. Anything ~₹8-50 lakh with structure is fine.`,
  },
  {
    day: 21, title: "Solar payback", concept: "scenario analysis", minutes: 12,
    prompt: `A rooftop solar system costs ₹1,20,000 and saves ₹1,500/month on electricity today.

1. Simple payback period?
2. If electricity prices rise 5% per year, roughly when does it pay back?
3. Name two risks that would push payback later, and how you'd stress-test them.`,
    solution: `1. 1,20,000 / 18,000 per year ≈ 6.7 years.
2. Yearly savings with 5% growth: 18,000; 18,900; 19,845; 20,837; 21,879; 22,973 → cumulative 18.0k, 36.9k, 56.7k, 77.6k, 99.5k, 122.4k → payback ≈ 5.9 years.
3. Risks: panel degradation (~0.5-1%/yr), inverter replacement (~₹20-30k around year 8-10), net-metering tariff changes, lower usage, cleaning/maintenance. Stress test: a downside scenario with flat tariffs + degradation + inverter cost (payback ~8+ yrs) next to a base case and an upside case.
Present scenarios, not a single number.`,
    rubric: `Strong = 6.7 yrs, ~5.9 yrs from a year-by-year compounding calculation, concrete risks and a scenario approach. Partial = 6.7 right, compounding done loosely, or generic risks. Weak = no numbers.`,
  },
  {
    day: 22, title: "Funnel math", concept: "relative vs absolute change", minutes: 11,
    prompt: `A funnel: 1,00,000 visits → 5% sign up → 40% of sign-ups activate → 10% of activated users pay.

1. How many paying users?
2. You can raise ONE stage by 1 percentage point. Which gives the most payers?
3. What does this teach about where to focus?`,
    solution: `1. 100,000 × 0.05 × 0.40 × 0.10 = 200.
2. Sign-up 5→6% (+20% relative) → 240.
Activation 40→41% (+2.5%) → 205.
Pay 10→11% (+10%) → 220.
Best: sign-up.
3. In a multiplicative funnel, a fixed POINT gain matters most where the rate is SMALLEST (largest relative change). But compare effort too: a 1-point gain on a 5% rate may be much harder than on a 40% rate.`,
    rubric: `Strong = 200; all three scenarios computed; sign-up is best; explains relative vs absolute and mentions effort/feasibility. Partial = right pick without the relative-change insight. Weak = picks the "last stage" by intuition.`,
  },
  {
    day: 23, title: "What's an active user?", concept: "operational definitions", minutes: 11,
    prompt: `A meditation app reports "2 million monthly active users". Write THREE different definitions of "active user" that would give very different numbers. For each, say what it would overstate or hide, and recommend one for judging whether the app actually helps people.`,
    solution: `1. Opened the app at least once in 30 days → largest number; counts accidental opens and notification taps.
2. Completed ≥1 meditation session in 30 days → mid-sized; still hides one-off use.
3. Completed ≥4 sessions in 30 days (weekly habit) → smallest; closest to real value, but may undercount people who meditate offline after learning.
For "does it help": use the habit definition (#3), plus retention cohorts and maybe a self-reported wellbeing measure.
Lesson: before comparing numbers, ask HOW the metric is defined. Definitions are design choices, and incentives push towards flattering ones.`,
    rubric: `Strong = three definitions that really differ, what each distorts, and a choice justified by the decision it serves. Partial = definitions given without the distortion analysis. Weak = one definition or vague wording.`,
  },
  {
    day: 24, title: "90% busy, 54 minutes waiting", concept: "utilisation & queues", minutes: 13,
    prompt: `A help desk has 1 agent who can resolve 10 tickets/hour on average. Tickets arrive at 9/hour on average (randomly).

1. The agent is busy 90% of the time. Why might average waits still be long?
2. Using the M/M/1 formula Wq = ρ / (μ − λ) (ρ = λ/μ), compute the average wait.
3. What do you expect if you add a second agent? Explain the intuition even if you skip the exact maths.`,
    solution: `1. Randomness: arrivals bunch up. When work arrives in clumps and capacity is barely above demand, queues build in bursts and drain slowly.
2. ρ = 0.9, μ − λ = 1 → Wq = 0.9 hours ≈ 54 minutes.
3. With 2 agents each server is only ~45% busy; using M/M/2 the average wait falls to ~1.5 minutes. A ~97% reduction from doubling capacity.
Insight: waiting time grows non-linearly as utilisation approaches 100%. "Fully utilised" systems feel terrible to the people waiting in them.`,
    rubric: `Strong = explains variability, computes 54 min, and shows that waits collapse with a 2nd agent (any estimate in single-digit minutes with non-linear reasoning). Partial = formula right but the explanation of why is missing, or expects a merely linear (halved) improvement. Weak = "90% is efficient, so waits are fine".`,
  },
  {
    day: 25, title: "Build more roads?", concept: "feedback loops", minutes: 13,
    prompt: `A city keeps widening roads to fix traffic, but congestion returns within a few years. Draw (in words) a causal loop diagram: at least one reinforcing loop and one balancing loop. Then suggest a leverage point.`,
    solution: `Balancing loop (the intended one): congestion ↑ → road building ↑ → capacity ↑ → congestion ↓.
Reinforcing loop (induced demand): capacity ↑ → travel time ↓ → driving becomes more attractive → more car trips and longer commutes, sprawl → congestion ↑ → more pressure for roads.
Another reinforcing loop: more driving → less public transport ridership → lower service frequency → transit worse → more driving.
Leverage: price road use (congestion charging), invest in transit frequency, change land use (mixed-use near transit). These change what makes driving attractive, not just capacity.
Systems lens: when a fix keeps "working then failing", look for the loop that undoes it.`,
    rubric: `Strong = correctly labelled loops (with polarity) including induced demand, and a leverage point that targets demand or incentives. Partial = describes induced demand without a loop structure, or a generic fix ("more buses") without loop logic. Weak = no feedback concept.`,
  },
  {
    day: 26, title: "Dog-walking app", concept: "TAM / SAM / SOM", minutes: 13,
    prompt: `Estimate the market for a paid dog-walking app in Bengaluru. Give TAM (all potential spend), SAM (what your model can serve) and SOM (what you could realistically capture in 3 years). State assumptions.`,
    solution: `TAM: ~14M people → ~4M households; ~6% own a dog → ~240k dogs. If every owner bought daily walks (~25 walks/month × ₹150 = ₹3,750/month) → ~₹1,080 crore/yr theoretical.
SAM: owners who'd actually pay for walks: higher-income, working, in apartments, in areas you cover → ~15% → ~36k dogs, at ~15 walks/month → ~₹100 crore/yr.
SOM: with competitors and local walkers, 5-10% of SAM in 3 years → ₹5-10 crore/yr.
Key sensitivities: walks per month, price, share willing to pay. Check against local walkers' existing rates.`,
    rubric: `Strong = all three levels with explicit, sensible filters at each, a sensitivity mention and a sanity check. Partial = TAM only, or levels with unexplained jumps. Weak = a bare number.`,
  },
  {
    day: 27, title: "Dominated options", concept: "Pareto frontier", minutes: 11,
    prompt: `Five suppliers (cost per unit, quality score out of 10):
A ₹10, 6 · B ₹14, 8 · C ₹15, 7 · D ₹20, 9 · E ₹12, 5

1. Which options are dominated (another is both cheaper and better)?
2. Which lie on the Pareto frontier?
3. How do you choose among the frontier options?`,
    solution: `1. C is dominated by B (₹14 < ₹15 and 8 > 7). E is dominated by A (₹10 < ₹12 and 6 > 5).
2. Frontier: A (₹10, 6), B (₹14, 8), D (₹20, 9).
3. Among them it's a trade-off. Look at the marginal cost of quality: A→B costs ₹4 for +2 (₹2 per point), B→D costs ₹6 for +1 (₹6 per point). Choose by what a quality point is worth to you (defect costs, brand). B is often the sweet spot.
First prune dominated options, THEN apply preferences.`,
    rubric: `Strong = correctly identifies C and E as dominated, the frontier A/B/D, and a marginal trade-off rule for choosing. Partial = right frontier but chooses without trade-off reasoning. Weak = ranks by one dimension.`,
  },
  {
    day: 28, title: "₹1,000 crore earbuds", concept: "sanity checks", minutes: 12,
    prompt: `A startup's plan says: "Our ₹500 earbuds will reach ₹1,000 crore revenue in year 3." Sanity-check this claim in at least two independent ways. Is it plausible?`,
    solution: `Units: ₹1,000 crore / ₹500 = 2 crore = 20 million units per year.
Check 1, market share: India's wireless earbud market is roughly 50-60 million units/yr → 33-40% share in year 3, more than established leaders. Implausible for a new entrant.
Check 2, distribution: 20M units ≈ 55,000 per day. That needs mass online + offline reach, huge marketing spend and working capital.
Check 3, pricing: ₹500 is the most crowded, lowest-margin segment.
Verdict: implausible by roughly 5-10×. A more realistic target is ₹100-200 crore if things go well.
Habit: convert big claims into units/day, market share and per-capita numbers.`,
    rubric: `Strong = converts to units, compares with market size, adds at least one more independent check, and gives a reasoned verdict with a better estimate. Partial = one check only. Weak = accepts or rejects without numbers.`,
  },
  {
    day: 29, title: "Enrolments down 25%", concept: "issue trees", minutes: 15,
    prompt: `A coaching centre's enrolments dropped 25% this year. Structure your analysis end to end: an issue tree, your top hypotheses, the data you'd collect for each, and a first recommendation you'd test within a month.`,
    solution: `Issue: why did enrolments fall 25%, and how do we recover?
Tree: Enrolments = Enquiries × Conversion.
- Enquiries ↓: market shrank (fewer students, exam pattern change), awareness fell (marketing cut, SEO), competition (new online players, a cheaper rival nearby).
- Conversion ↓: price/value (fee hike), results (last year's toppers fewer), experience (faculty left, timings), process (slow follow-up on enquiries).
Hypotheses: (H1) a star teacher left → conversion fell; (H2) an online competitor captured price-sensitive students → enquiries fell in that segment.
Data: enquiry and conversion by month and segment, exit-survey reasons, competitor pricing, faculty changes timeline.
First test: if conversion fell, run fast enquiry follow-up + free demo classes for 4 weeks in one branch vs another branch as control.
Good synthesis: hypotheses first, data to kill them, a small test before a big fix.`,
    rubric: `Strong = a MECE tree (enquiries × conversion or similar), specific testable hypotheses, matching data, and a scoped experiment. Partial = good structure but vague data or a big-bang recommendation. Weak = a list of guesses.`,
  },
  {
    day: 30, title: "Chai in Mumbai (revisited)", concept: "Fermi estimation", minutes: 8, revisitOf: 1,
    prompt: `Day 30: same question as Day 1, fresh eyes.

Estimate how many cups of chai are sold (bought outside the home) in Mumbai on a typical day. Decompose, give every assumption a number, add a range and cross-check it a second way.`,
    solution: `≈ 20M people × ~30% buying × ~1.5 cups ≈ 9M cups/day (range 5-15M). Supply-side cross-check: 30-50k stalls/canteens × 200-300 cups ≈ 6-15M.
By now expect: explicit ranges per assumption, sensitivity (which factor matters most), and two independent routes reconciled.`,
    rubric: `As Day 1, with a higher bar: decomposition, explicit numbers, a range, a cross-check, and a note on the most uncertain factor. Compare with the Day 1 answer: which habits are new?`,
  },
];
