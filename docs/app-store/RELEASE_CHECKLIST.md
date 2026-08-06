# Release checklist — Ebb

Generated at the end of an App Store readiness pass. Grouped exactly as
requested: what's actually done in the codebase, what only the app owner
can do (Apple/Expo account actions), and what genuinely can't be verified
without a real device.

## ✅ Completed in the codebase

**Microphone / recording (the originally-identified bug, plus a full audit)**
- Fixed `app.json`'s `expo-audio` plugin: real `NSMicrophoneUsageDescription`
  string instead of `microphonePermission: false` (which suppressed the key
  entirely — a guaranteed crash on first recording attempt on a real device)
- Permission requested only when "Start recording" is tapped, never on
  entering the screen or during onboarding
- Denial handled explicitly: distinguishes "can ask again" (Try again) from
  "permanently denied" (Open Settings, via `Linking.openSettings()`), with
  a "Write it instead" fallback in both cases
- `start()`/`stop()` wrapped in try/catch — a native-level failure no longer
  leaves the screen silently stuck
- `setAudioModeAsync({ allowsRecording })` explicitly toggled true on start,
  false on stop/unmount/backgrounding — releases the mic session properly
- A visible pulsing recording indicator (not just text) shows recording state
- AppState listener auto-stops (and offers to save) an in-progress recording
  if the app backgrounds mid-recording, rather than continuing silently or
  leaving state stuck on return
- `startingRef` guard prevents a double-tap from starting two overlapping
  recording sessions
- Confirmed via grep: Calm Memories is the *only* voice-recording flow in
  the app — there was nothing else to audit

**EAS build configuration**
- `eas.json` created with development/preview/production profiles,
  `appVersionSource: "remote"` + `autoIncrement: true` on production
- `.env.example` added (honestly documents that the app currently needs
  zero environment variables — no backend exists)
- `.gitignore` updated to also exclude a bare `.env`, not just `.env*.local`

**App configuration (`app.json`)**
- Removed `NSContactsUsageDescription` — the app has no `expo-contacts`
  dependency and never reads the real device address book; this permission
  was declared but genuinely unused, exactly the kind of thing App Review
  flags
- Discovered and fixed: the `expo-audio` plugin's default options silently
  enabled `enableBackgroundPlayback` (adding `UIBackgroundModes: audio` to
  Info.plist and a foreground media-session service to the Android
  manifest) even though the app's AudioManager deliberately does *not*
  continue playback in the background. Both `enableBackgroundPlayback` and
  `enableBackgroundRecording` are now explicitly `false`, matching actual
  behavior.
- Added `ios.buildNumber: "1"`, `android.versionCode: 1`
- Added `ITSAppUsesNonExemptEncryption: false` (accurate — the app makes no
  network requests and uses no custom encryption beyond a local SHA-256 PIN
  hash)
- Configured the `expo-splash-screen` plugin explicitly (image, dark-mode
  background, resize mode) — previously it ran with zero options, which
  defaults to a **white** background regardless of the app's own dark
  `backgroundColor` setting elsewhere in `app.json`

**App icon and splash screen**
- The previous `icon.png`, `splash-icon.png`, `android-icon-foreground.png`,
  and `android-icon-background.png` were, on inspection, unfinished
  design-tool export templates — visible construction guides, crosshairs,
  and alignment circles baked into the image, on a generic bright-blue
  chevron with no relation to the app's actual brand. All four were
  replaced with a real, on-brand mark (a warm amber-to-violet glowing orb
  on the app's actual dark navy background, echoing the in-app
  `BreathingOrb` component) generated to match `src/theme/tokens.ts`'s real
  palette. `android-icon-monochrome.png` and `favicon.png` were also
  regenerated for consistency.
- Verified correct file formats: `icon.png` is opaque RGB (no alpha, as
  iOS requires), transparency-dependent assets are RGBA.

**Privacy / data hardening**
- Journal PIN hash migrated from plain AsyncStorage to `expo-secure-store`
  (platform Keychain/Keystore) — `expo-secure-store` was already a
  dependency but was never actually used anywhere before this
- Fixed a real race: the PIN hash now loads asynchronously, so the journal
  gate (`useJournalGate`) was changed to fail *closed* while that load is
  in flight, rather than briefly treating "not loaded yet" as "no PIN, so
  unlocked"
- Fixed a real data-hygiene bug: deleting a voice memory (individually, or
  via "Clear all my data") removed the database row but never deleted the
  underlying audio file — recordings were leaking onto disk permanently.
  Both paths now delete the file too.
- Fixed journal export leaving an unbounded number of temp `.txt` files in
  the cache directory (one per export, never cleaned up) — now sweeps
  previous exports before writing a new one (deliberately not deleting the
  *just-shared* file immediately, since iOS resolves the share sheet
  promise before the user finishes with it)
- Wrote `DATA_INVENTORY.md` — a complete, code-verified accounting of every
  store, what it holds, where it lives, and whether it leaves the device
  (nothing does, except explicit user-initiated exports/calls/texts)
- Confirmed: no analytics, no third-party SDKs, no network calls anywhere
  in the codebase (grepped for `fetch`, `axios`, `http`, `process.env` —
  zero matches outside this documentation)

**Crisis / safety**
- Replaced a hardcoded `tel:911` "Call emergency services" button (correct
  only for the US, silently wrong everywhere else) with a best-effort
  locale-derived number (`getLocalEmergencyNumber()` in
  `src/engines/safety.ts`), always paired with an explicit "this is a
  guess, not your real location" caveat and a generic fallback when
  detection isn't possible
- The existing `CRISIS_RESOURCES` list (already multi-region — US, UK,
  Canada, Ireland, Australia) was left as-is; it was already correct

**Removed dead/placeholder behavior**
- Removed a Settings toggle ("Remind me about worries I set aside") that
  was wired to a persisted boolean but never actually scheduled any
  notification — `expo-notifications` isn't even a dependency. Rather than
  ship a control that visibly does nothing (or rush in a real notifications
  feature under this deadline), the dead toggle was removed. Implementing
  real local reminders is a legitimate future feature, not done here.

**Legal/support link plumbing**
- Added `src/config/legal.ts` with clearly-marked `REPLACE-ME` placeholder
  URLs (privacy policy, support, terms, marketing) and a
  `LEGAL_LINKS_ARE_PLACEHOLDERS` flag
- Wired working links into Settings → About Ebb (Privacy policy, Terms of
  use, Support) — they currently point at placeholder URLs until you host
  real pages and update the constants file
- Drafted real content for all of them: `PRIVACY_POLICY.md`,
  `TERMS_OF_USE.md`, `SUPPORT.md`, `DATA_DELETION.md` (this folder) — every
  claim in them was checked against actual app behavior during this audit,
  not written generically

**Demo/screenshot mode**
- `src/data/demoContent.ts` + a "Developer" section in Settings, gated by
  `if (__DEV__)`, to seed/clear clearly-fictional demo content
  (no real names, numbers, or content) for local testing
- Verified this is genuinely absent from a production build: built the app
  with `expo export` (which builds in release mode by default) and grepped
  the output JS bundle for demo-content strings and dev-menu button text —
  neither appears
- Used the same technique (direct-seeded fictional data, not the in-app
  button) to capture 8 real screenshots of actual running screens — see
  `SCREENSHOT_PLAN.md`

**App Store metadata**
- `APP_STORE_METADATA.md`: name options, subtitle, promotional text, full
  description, keywords, category recommendation, age-rating
  recommendation (with reasoning), copyright line, and App Review notes
  including an exact reviewer test path and explicit mic/camera
  explanations
- `SCREENSHOT_PLAN.md`: the 8 captured screens with captions, required
  device sizes, and an explicitly flagged open question about iPad support
- `TESTFLIGHT.md`: exact build/submit commands, prerequisites, and a
  pre-external-testing checklist

**Verification performed**
- `npx tsc --noEmit` — clean, after every change in this pass
- Full 37-route Playwright crawl of the rebuilt web export — zero
  console/page errors
- The existing 5-scenario audio stress-test suite (rapid switching,
  backgrounding mid-crossfade, mute toggling, mid-session navigation,
  rapid restart) re-run against the rebuilt export — still clean
- New targeted checks: crisis screen locale detection (US vs UK), mic
  denial-flow doesn't crash and shows the write-instead fallback, dev-only
  content confirmed absent from production build

## 🔲 I must complete manually

Nothing in this list can be done from inside this environment — all of it
requires your own Apple/Expo accounts, legal judgment, or a payment method.

- [ ] Enroll in the Apple Developer Program ($99/yr) under your chosen
      legal name
- [ ] Confirm the final app name (three options drafted in
      `APP_STORE_METADATA.md`) and check availability in App Store Connect
- [ ] Decide whether to keep bundle identifier `app.ebb.calm` (already set
      consistently in `app.json` for both iOS and Android) or change it —
      it was left as-is since it already looked like a deliberate choice,
      not a placeholder; register/confirm it in your Apple Developer account
      either way
- [ ] Run `eas login` then `eas init` to mint a real EAS project ID (writes
      `extra.eas.projectId` into `app.json` — nothing in this pass could
      generate that value)
- [ ] Create the App Store Connect app record
- [ ] Host `PRIVACY_POLICY.md`, `TERMS_OF_USE.md`, and `SUPPORT.md`
      somewhere public, then replace every `REPLACE-ME` URL in
      `src/config/legal.ts` with the real ones
- [ ] Fill in every `[BRACKETED PLACEHOLDER]` in the drafted legal
      documents (dates, your legal entity name, support email) — have the
      Terms of Use reviewed by someone qualified before publishing
- [ ] Decide the children's-privacy age threshold (13 vs 16) in
      `PRIVACY_POLICY.md` based on your target markets and legal advice
- [ ] Complete App Store Connect's App Privacy questionnaire (the data
      inventory and answers are all in `DATA_INVENTORY.md`/
      `DATA_DELETION.md` — this pass prepared the source of truth, not the
      form itself, since that form only exists inside App Store Connect)
- [ ] Complete the age-rating questionnaire (see the reasoning and
      starting recommendation in `APP_STORE_METADATA.md`)
- [ ] Decide the iPad question — either verify the app actually looks
      right at iPad dimensions and provide iPad screenshots, or set
      `ios.supportsTablet: false` (currently `true`, untested at tablet
      size — see `SCREENSHOT_PLAN.md`)
- [ ] Capture/upload final screenshots at Apple's exact currently-required
      export dimensions (the 8 captured this session are real but at a
      standard phone viewport size, not verified against Apple's current
      exact pixel requirements — see `SCREENSHOT_PLAN.md`)
- [ ] Accept Apple's developer agreements
- [ ] Provide tax/banking details in App Store Connect if you plan to ever
      charge for the app or add in-app purchases (not required for a free
      app with no IAP, which is the app's current state)
- [ ] Run `eas build --platform ios --profile production` and
      `eas submit --platform ios --profile production`
- [ ] Submit for review, with the App Review notes from
      `APP_STORE_METADATA.md` pasted into the Notes field

## 🔲 Requires real-device verification

Nothing here was fabricated or assumed — each item was either not
testable at all in this sandboxed environment, or was only verified via
automated browser-based testing (Playwright against a web export), which
is a real and useful signal but is not the same as a human using a real
iPhone.

- **Microphone recording on a physical iPhone** — the full permission
  flow (grant, deny, deny-permanently → Settings deep link, background
  interruption, double-tap guard) was code-reviewed and exercised via a
  simulated browser environment, not a real iOS mic session
- **Bluetooth/headphone audio routing** — not simulatable in this
  environment at all
- **Actual haptic feel** — haptic *calls* were verified to fire at the
  right times (from the earlier audio/timing audit this session builds
  on); how they actually feel on hardware is unverified
- **VoiceOver / TalkBack behavior** — accessibility labels and timing
  logic exist in the code, but no screen reader was actually run against
  a build this session
- **Cold-start performance on older hardware** — only measurable on real
  devices with real thermal/memory constraints
- **Real App Store receipt/submission behavior** — `eas submit` was never
  actually run (no Apple Developer account is connected to this
  environment); the commands in `TESTFLIGHT.md` are correct per EAS's
  documented behavior but unexercised here
- **The actual sound of the app** (rain, ocean, breathing cues, on
  headphones, in a dark room) — the previous audio-timing audit this
  session builds on verified loop-seam quality objectively (no measurable
  discontinuity) and fixed several real synchronization bugs, but whether
  it genuinely *sounds* calming is a human judgment call that needs an
  actual listen
- **App icon/splash appearance on a real home screen** — generated and
  format-verified (correct opacity, correct dimensions, on-brand color),
  but never seen on an actual iOS home screen grid or during a real
  device's native launch sequence

## Final honesty note

This pass fixed everything identified during the audit that could
genuinely be fixed from inside this environment: a real crash-causing bug
(the mic permission), several real data-hygiene and privacy gaps (PIN
storage, orphaned recording files, an over-broad unused permission, an
accidentally-declared background-audio entitlement), a real safety bug
(the hardcoded 911), broken placeholder brand assets, and a complete set
of build/submission configuration and drafted legal/metadata content. It
did **not** make the app "App Store ready" by itself — the manual and
real-device sections above are not formalities, they're real remaining
work, and the app should not be submitted until they're done.
