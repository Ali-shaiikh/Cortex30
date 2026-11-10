# Mind Gym

A 30-day, AI-coached thinking program. Every day unlocks four exercises, one each for **Logic**, **Analytical**, **Critical** and **Creative** thinking. You set your confidence, write your answer and your reasoning, and an AI coach tells you whether you're right, where your thinking went wrong, and how an expert would have approached it. As you progress, a glowing mind map grows across a 3D brain.

Everything runs on free tiers. You don't need a credit card.

| Piece | Free service |
| --- | --- |
| Website hosting | Vercel Hobby |
| Login + database | Supabase free tier |
| AI coach | Google Gemini free tier (default) |

---

## Set it up (about 20 minutes)

You need [Node.js](https://nodejs.org) 20.9 or newer (22 recommended) and a free [GitHub](https://github.com) account.

### 1. Create the Supabase project

1. Go to [supabase.com](https://supabase.com), sign up, and click **New project**.
2. Pick any name, set a database password (save it somewhere), choose the region closest to you (e.g. *Mumbai*), and keep the **Free** plan.
3. Wait a minute or two while the project is created.

### 2. Create the database tables

1. In your Supabase project, open **SQL Editor** in the left sidebar, then click **New query**.
2. Open [`supabase/migrations/0001_init.sql`](supabase/migrations/0001_init.sql) from this repo, copy **everything**, paste it into the editor and click **Run**.
3. You should see "Success. No rows returned". This creates the three tables (`profiles`, `submissions`, `reports`), turns on Row Level Security so each user can only see their own rows, and adds the small database functions the app uses.

### 3. Turn off email confirmation

Mind Gym logs in with a **username and password**. There's no email. Behind the scenes each username becomes a fake address like `alex@users.mindgym.local`, which can never receive mail, so Supabase must not try to confirm it.

1. Open **Authentication**, then **Sign In / Providers** (on older dashboards: **Providers**), then **Email**.
2. Make sure **Enable Email provider** is **on** and **Confirm email** is **off**.
3. Click **Save**.

### 4. Get a free Gemini API key

1. Go to [aistudio.google.com/apikey](https://aistudio.google.com/apikey) and sign in with a Google account.
2. Click **Create API key** and copy it.

### 5. Set the environment variables

1. In Supabase, open **Project Settings**, then **API** (or **API Keys**). Copy the **Project URL** and the **anon / publishable** key.
2. In this project folder, copy the example file:

   ```bash
   cp .env.example .env.local
   ```

3. Open `.env.local` and fill it in:

   ```bash
   NEXT_PUBLIC_SUPABASE_URL=https://abcd1234.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...   # the anon/publishable key, NOT the service_role key
   AI_PROVIDER=gemini
   GEMINI_API_KEY=AIza...
   ```

`.env.local` is ignored by git, so your keys never get committed. The AI keys are only ever used on the server.

### 6. Run it on your computer

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and click **Create an account**. Today is your Day 1.

> No Gemini key yet? Set `AI_PROVIDER=mock` to click through the whole app with placeholder feedback.

### 7. Deploy to Vercel (free)

1. Push this folder to a new GitHub repository.
2. Go to [vercel.com](https://vercel.com), sign up with GitHub, click **Add New…**, then **Project**, and import the repository. Vercel detects Next.js automatically.
3. Before clicking **Deploy**, open **Environment Variables** and add the same variables as in your `.env.local`.
4. Click **Deploy**. In a minute you'll get a URL like `mind-gym-yourname.vercel.app`.
5. On your phone, open that URL and choose **Add to Home Screen** to install it as an app.

---

## How it works

**Daily loop.** Your current day is "days since you signed up + 1", using India time (Asia/Kolkata). It unlocks at local midnight and caps at 30. The app re-checks every minute. Future days are locked. Past days stay open, but late answers don't count towards your streak. Inside each skill, an exercise only unlocks once its day has arrived **and** you've finished the previous day's exercise in that skill.

**Each exercise:** read the prompt, set your confidence, write your answer and your reasoning. You can ask for an optional Socratic hint (a guiding question, never the answer; each one costs 1 point). Then you submit, and your answer locks permanently. The coach's feedback appears, you can ask it one follow-up question, and the matching node on the brain ignites.

**The brain.** It's built procedurally from about 9,000 glowing particles on two folded hemispheres, with no 3D model files. Each skill owns a region, and its 30 nodes grow outward along three branches from a core. A node's brightness tracks your score, and wrong answers glow amber. Each region's ambient glow shows that skill's mastery level. Achievements unlock visuals: Perfect Day and "Sharp" skills draw bridges across the hemispheres, a 7-day streak adds a halo ring, and finishing day 30 lights up the whole brain. On `/profile` you can drag, zoom, hover and click nodes.

**AI limits.** Each user gets **15 AI calls per day** (grading, hints, follow-ups, bonus exercises, reports and the summary all count). The count is kept in Postgres and resets at midnight IST. This keeps you inside Gemini's free quota.

| Page | What's there |
| --- | --- |
| `/` | Today's four exercises, streak, overall progress |
| `/day/[n]` | Any unlocked day; Weak Spot bonus after finishing a day |
| `/progress` | Mastery, radar, trend, calibration, thinking fingerprint, achievements, weekly reports, Markdown export |
| `/profile` | The big interactive brain |

---

## Commands

| Command | What it does |
| --- | --- |
| `npm run dev` | Start the app locally |
| `npm run build` / `npm start` | Production build / run it |
| `npm test` | Unit tests: day/midnight rollover, unlock rules, streaks, mastery, achievements |
| `npm run test:grading` | Sends 3 deliberately wrong answers to the real AI coach and checks they're graded wrong (needs `GEMINI_API_KEY`) |
| `npm run build:exercises` | Rebuild `src/data/exercises.json` from `scripts/exercises/*.mjs` |
| `npm run lint` / `npm run typecheck` | Code checks |

## Using Claude instead of Gemini (optional, paid)

Set `AI_PROVIDER=claude` and `ANTHROPIC_API_KEY=...`. The default model is `claude-opus-5-5`. Change it with `CLAUDE_MODEL` (e.g. `claude-haiku-5-5` costs far less). Server-side refusal fallback is turned on for Claude requests. Note: the Anthropic API is **not free**, so this option breaks the "everything free" rule.

## Project layout

```
supabase/migrations/0001_init.sql   tables, RLS, functions (run once)
scripts/exercises/*.mjs             the 120 exercises (source) → src/data/exercises.json
src/proxy.ts                        protects every page except /login and /signup
src/lib/day.ts                      Asia/Kolkata day + unlock logic
src/lib/progress.ts                 streaks, mastery, calibration, fingerprint, achievements, bridges
src/lib/ai.ts                       gradeAnswer, getHint, generateBonus, writeReport, writeSummary
src/lib/ai/providers.ts             Gemini (REST), Claude (SDK), mock
src/app/api/*                       server routes; all AI calls happen here
src/components/brain/*              procedural 3D brain, mind map, SVG fallback
```

## Troubleshooting

- **"Account created, but Supabase wants email confirmation"**: step 3 wasn't saved. Turn off *Confirm email*, then log in.
- **"Email address is invalid" on sign-up**: some Supabase projects reject the `.local` test domain. Change the domain in `src/lib/auth.ts` (`usernameToEmail`) to one you own, e.g. `users.yourname.dev`. Existing accounts would need to be recreated.
- **"You've used all 15 coach calls for today"**: wait until midnight IST, or raise `AI_DAILY_LIMIT` (it must stay within your Gemini quota).
- **"The free Gemini quota is busy"**: the free tier allows a limited number of requests per minute. Wait a moment and retry. You can also try another model with `GEMINI_MODEL`.
- **The brain doesn't appear**: your browser has WebGL turned off, so a static brain is shown instead. On phones and low-end laptops the brain automatically uses fewer particles and no bloom. With "reduce motion" switched on in your OS, it stops spinning.
- **Redirected to `/setup`**: `NEXT_PUBLIC_SUPABASE_URL` or `NEXT_PUBLIC_SUPABASE_ANON_KEY` is missing. Restart `npm run dev` after editing `.env.local`.
