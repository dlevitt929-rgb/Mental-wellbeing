# Ebb

*I'm here with you until this passes.*

Ebb is an in-the-moment mental health companion — not a meditation app, not a journal, not a
habit tracker. It exists for the minutes when someone is panicking, can't sleep, can't stop
thinking, or just doesn't want to be alone, and needs to feel safer in the next few minutes,
not eventually.

Built with Expo (React Native) + TypeScript, mobile-first, works on iOS, Android, and web.

## Running it

```
npm install
npm run web      # fastest way to preview (or: npm run ios / npm run android)
```

All ambient audio in `assets/audio/` is procedurally synthesized (see
`scripts/generate-audio.js`) — no licensed samples. Regenerate with:

```
node scripts/generate-audio.js
```

## What's here

- **Home** (`app/home.tsx`) — "What's happening right now?" with one-tap access to every flow.
- **Panic Mode** (`app/panic.tsx`) — immediate reassurance, a tiny adaptive "Calming Path"
  questionnaire, an auto-chosen breathing technique, interactive grounding, and optional
  reassurance/cognitive-distancing — driven by `src/engines/calmingPath.ts`.
- **Stay With Me** (`app/stay-with-me.tsx`) — paced reassurance loop, plus a constrained,
  rule-based AI companion (`src/engines/aiCompanion.ts`) that only ever gives short, calm
  replies and hands off to `/crisis` on any self-harm/medical red flag
  (`src/engines/safety.ts`).
- **Night mode** (`app/sleep/`) — "What woke you up?", body scan / PMR / cognitive shuffle /
  counting, and **Nothing To Solve Tonight** — worries get set down into a "Tomorrow" box
  (`src/components/players/NothingToSolveTonight.tsx`) and gently resurface on Home the next day.
- **Empty My Head** (`app/racing-thoughts.tsx`) — thoughts as cards you categorize and release.
- **I don't know what I'm feeling** (`app/unsure.tsx`) — a few gentle branching questions, never
  a diagnosis.
- **The Toolkit** (`app/toolkit/`) — breathing, grounding, PMR, body scan, guided imagery,
  cognitive defusion, sensory grounding, movement, self-compassion, worry postponement, and
  "Riding the wave" — an interactive anxiety-shape visualization
  (`src/components/AnxietyShape.tsx`) that shrinks as you breathe.
- **Camera grounding** (`app/camera-grounding.tsx`) — live camera view only, nothing captured
  or uploaded.
- **My Calm Plan** and **Letters from calm you** (`app/calm-plan/`, `app/letters/`) — written
  while calm, surfaced automatically during a panic session's reassurance step.
- **Human connection** (`app/connection.tsx`, `app/contacts.tsx`) — one tap to call/text someone
  trusted, with a prewritten message.
- **Crisis & safety** (`app/crisis.tsx`) — always one tap away, careful non-diagnostic medical
  language, real crisis line numbers.
- **Settings & privacy** (`app/settings/`) — everything is stored on-device only (AsyncStorage);
  full data clear available.

No streaks, no badges, no scores anywhere. Progress is phrased gently and only after enough
history exists to say something true (`src/engines/insights.ts`).

## Architecture

- `app/` — Expo Router file-based routes (screens/flows).
- `src/theme/` — four mode palettes (`calm` / `panic` / `night` / `reflect`) that visually
  re-skin the whole app depending on what's happening, plus the Inter/Fraunces type system.
- `src/store/` — Zustand stores, persisted to AsyncStorage (sessions, calm plan, contacts,
  letters, worries, settings). Nothing leaves the device.
- `src/engines/` — the actual "intelligence": breathing technique selection, the adaptive
  Calming Path, the rule-based AI companion, safety/crisis detection, sound engine, insights.
- `src/components/` — reusable primitives (BreathingOrb, AnxietyShape, MessageBeat,
  GroundingSequence, CalmButton, Screen) and technique players.
