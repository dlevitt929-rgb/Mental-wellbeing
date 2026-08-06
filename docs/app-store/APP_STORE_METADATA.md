# App Store Connect listing — draft metadata

Draft copy for the App Store Connect listing form. Character limits are
Apple's current published limits at time of writing — recheck them in App
Store Connect, since Apple changes these occasionally. Everything here was
written to only claim what the app actually does, per the codebase audit —
see the "why these words" note at the end before changing any of it.

## App name (30 char limit)

Pick one — all are available-length, none currently confirmed as
unclaimed on the App Store (check availability in App Store Connect before
committing):

1. **Ebb — Calm & Grounding**
2. **Ebb: Calm in the Moment**
3. **Ebb — Anxiety & Sleep**

## Subtitle (30 char limit)

- "Breathing, grounding, calm" (27 chars)
- "Support for hard moments" (25 chars)

## Promotional text (170 char limit, editable without a new build)

> When it feels like too much, Ebb meets you exactly where you are —
> breathing, grounding, and a place to write it down. No streaks, no
> pressure to feel better fast.

## Description

```
Ebb is here for the moments that feel too big right now.

One tap opens "I need help right now" — no questions first, no setup,
no account. From there, Ebb offers guided breathing, grounding exercises,
a calming presence to talk to, and simple tools that don't ask you to
explain yourself before they help.

WHAT'S INSIDE

• One Minute With Me — a single guided minute when even choosing what
  to do feels like too much
• Guided breathing with five different rhythms, each with its own gentle
  animated pace
• Grounding exercises, including a camera-based "notice what's actually
  around you" exercise (nothing is ever recorded)
• Stay With Me — a calming presence for when you don't want to be alone,
  with quiet, talk-through, distraction, and understanding modes
• A private, lockable journal with mood tracking and optional PIN or
  Face ID / Touch ID protection
• Calm Memories — save a written or voice memory of a moment that felt
  okay, to return to on a harder day
• Letters from calm you — write something now, for the version of you
  who might need it later
• A personal calm plan and trusted-contacts list, so reaching out is one
  tap instead of a decision
• Sleep tools — ambient sound, guided body scan, and techniques for when
  your mind won't stop at night
• A guidance pace setting (Slower/Standard/Faster) so instructions never
  feel rushed

DESIGNED TO SUPPORT, NOT TO DIAGNOSE

Ebb offers guided calming exercises and may help you feel more grounded
in a hard moment. It is not a medical device, does not diagnose or treat
any condition, and is not a substitute for professional mental health
care or emergency services. Crisis and emergency resources are always one
tap away, never paywalled.

YOUR PRIVACY

Everything you write or record stays on your device. Ebb has no account,
no server, and sends nothing anywhere unless you explicitly choose to
share or export it yourself.
```

## Keywords (100 char limit, comma-separated, no spaces after commas)

```
calm,anxiety,breathing,grounding,panic,sleep,mindfulness,journal,relax,stress,mental health,coping
```
(This is at/near the 100-char limit — trim if App Store Connect rejects it;
prioritize `calm,anxiety,breathing,grounding,panic,sleep,journal`.)

## Categories

- **Primary: Health & Fitness**
- **Secondary: Lifestyle** (or Medical, if you want the stricter medical
  review path — Health & Fitness + Lifestyle is the more common choice for
  self-help/wellness apps without clinical claims, which matches Ebb's
  actual positioning)

## Age rating

Apple's own questionnaire in App Store Connect is authoritative — this is
a starting recommendation, not a substitute for filling it out honestly.
Because the app's crisis-resources screen references suicide/self-harm
crisis lines (supportively, not graphically), select **"Medical/Treatment
Information: Infrequent/Mild"** rather than "None," which will likely put
the app at **12+** rather than 4+. Do not select "None" for that category
just to get a lower age rating — the crisis content is real and the
questionnaire should reflect it.

## Copyright

`© [YEAR] [YOUR LEGAL NAME/ENTITY]. All rights reserved.`

## Support URL / Privacy Policy URL / Marketing URL

Pull these from `src/config/legal.ts` once you've replaced the
placeholders and hosted the actual pages (drafts in this same folder).

## App Review notes (paste into the "Notes" field for reviewers)

```
Ebb is a self-guided mental-wellbeing app with no account system and no
backend — all content is stored locally on-device (see attached privacy
policy). Two permissions are requested, each only at the moment of use:

- Camera: used only for a "notice what's around you" grounding exercise.
  It shows a live camera preview; no photo or video is ever captured,
  saved, or transmitted. Try it via Toolkit → Grounding → the camera
  exercise, or Home → any panic-adjacent flow → grounding.
- Microphone: used only for the optional "record a voice memory" feature
  under Calm Memories. Recordings are saved locally and never uploaded.
  Try it via Home → Calm Memories → "Record your voice." If the simulator
  denies mic access, the app shows a graceful fallback ("Write it
  instead") rather than crashing — this is intentional and testable by
  denying the permission prompt.

The app includes crisis/emergency resources (Home → "I need help right
now," or Settings → "Crisis & emergency resources") for context if
reviewed content includes references to panic, distress, or crisis
support — these are supportive resource listings, not user-generated
content requiring moderation, since there is no social/user-generated-
content surface in the app at all.

Suggested review path: launch → onboarding (skippable) → Home →
"I need help right now" → Panic flow → back → "One Minute With Me" →
Toolkit → Breathing → any technique → Journal → write an entry → Settings
→ review privacy section and data controls.
```

## Why these words (read before rewriting the description)

Per the mandate for this audit: no claims like "treats," "cures,"
"prevents," "clinically proven," or "replaces therapy" appear anywhere
above. Every capability claim ("no photo or video is ever captured,"
"stored locally," "no account") was checked against the actual
implementation during this audit, not assumed from what the feature is
named. If you add a real feature later (e.g. cloud sync, a real LLM-backed
companion), update this copy and the Privacy Policy together — don't let
either one describe a version of the app that no longer exists.
