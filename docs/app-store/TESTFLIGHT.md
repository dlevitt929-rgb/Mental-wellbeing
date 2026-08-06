# TestFlight readiness — Ebb

## Prerequisites (things only you can do)

1. An active Apple Developer Program membership ($99/year), enrolled under
   the legal name that will own this app.
2. An Expo account, with this project connected: `eas login`, then from
   the project root `eas init` (or `eas build:configure`) — this writes a
   real `extra.eas.projectId` into `app.json`, which doesn't exist yet in
   this repo. Nothing in this pass could generate that value; it's minted
   by Expo's servers against your account.
3. In App Store Connect, create the app record with bundle identifier
   `app.ebb.calm` (already set in `app.json` — see `RELEASE_CHECKLIST.md`
   for whether to keep or change it) matching a bundle ID registered to
   your Apple Developer account.

## Build commands

```bash
# One-time setup, after eas login:
eas init

# Development build (installs a debug client you can load JS into via `expo start`):
eas build --platform ios --profile development

# Internal testing build (release-mode JS bundle, internal distribution):
eas build --platform ios --profile preview

# Production build (what actually goes to TestFlight / the App Store):
eas build --platform ios --profile production
```

The `eas.json` in this repo already defines all three profiles.
`appVersionSource: "remote"` plus `autoIncrement: true` on the production
profile means EAS manages the build number for you — each production build
automatically increments past the last one, so you don't need to hand-edit
`ios.buildNumber` in `app.json` before every submission (see
`RELEASE_CHECKLIST.md` for the manual-edit fallback if you ever need it).

## Submitting to TestFlight

```bash
eas submit --platform ios --profile production
```

This requires an App Store Connect API key or your Apple ID credentials —
EAS will prompt for whichever you haven't configured yet. Once submitted,
the build appears in App Store Connect → TestFlight, typically within
10–30 minutes after Apple's automated processing finishes.

## Before inviting external testers

- [ ] Install the build via internal TestFlight first, on at least one
      real device — nothing in this pass was verified on real hardware
      (see the "requires real-device verification" list in
      `RELEASE_CHECKLIST.md`)
- [ ] On a real device: grant microphone access, record a memory, play it
      back, delete it — confirm the recording is actually gone (not just
      the list row)
- [ ] On a real device: deny microphone access, confirm the "Write it
      instead" fallback works and Settings → Open Settings actually opens
      the app's iOS Settings page
- [ ] On a real device: grant camera access for grounding, confirm the
      live preview works and the camera indicator (the OS-level green
      dot) disappears when you leave the screen
- [ ] Test with a real pair of headphones — the ambient audio/breathing
      cue work in this pass was verified via automated web-based testing,
      not human ears in a physical space
- [ ] Confirm the app icon and splash screen look right on an actual
      device home screen and during a real cold launch (a real device's
      launch storyboard behaves differently from a simulator/emulator in
      subtle ways)
- [ ] Fill in App Store Connect's "What to Test" notes for TestFlight
      testers, summarizing what changed since the last build

## Collecting feedback and crash reports

TestFlight collects crash reports and tester feedback automatically once a
build is distributed — visible in App Store Connect → TestFlight → (your
build) → Crashes / Feedback. Nothing in this codebase currently integrates
a separate crash-reporting SDK (Sentry, Bugsnag, etc.); TestFlight's
built-in crash collection is the only signal you'll get unless you add one.
If you do add a crash-reporting SDK later, make sure journal/letter/memory
text is explicitly excluded from whatever it captures — see the "Known
gaps" section of `DATA_INVENTORY.md`.

## Incrementing the build number for the next upload

With `autoIncrement: true` and `appVersionSource: "remote"` (already set in
`eas.json`), you don't need to do anything manually — just run
`eas build --platform ios --profile production` again and EAS assigns the
next build number itself. To bump the user-facing **version** (e.g.
1.0.0 → 1.0.1), edit `"version"` in `app.json` directly; that one is not
automatic by design, since it's a product decision, not a build mechanic.
