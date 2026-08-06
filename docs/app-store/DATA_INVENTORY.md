# Ebb — data inventory

Generated from a direct audit of the codebase (every store in `src/store/`,
every use of `expo-file-system`, `expo-secure-store`, and
`@react-native-async-storage/async-storage`). This is the source of truth
for the App Privacy questionnaire in App Store Connect and for the privacy
policy — update it when the data model changes, not the other way around.

## Headline fact

**Ebb makes no network requests.** There is no backend, no analytics
pipeline, and no third-party SDK anywhere in the dependency tree. Every
store in `src/store/` persists to on-device storage only
(`@react-native-async-storage/async-storage`, wrapped by `src/store/storage.ts`,
except the journal PIN hash — see below). Confirmed by grepping the entire
`src/` and `app/` tree for `fetch(`, `axios`, `http://`, `https://`, and
`process.env` — there are no matches outside this documentation.

## What is collected, and where it lives

| Data | Where | AsyncStorage key | Leaves the device? | User can delete |
|---|---|---|---|---|
| Journal entries (text, mood, timestamp) | `useJournalStore` | `ebb.journal` | Never | Per-entry, or "Delete all journal entries" (Journal → privacy) |
| Journal PIN (SHA-256 hash only — the PIN itself is never stored) | `useJournalSecurityStore` | Keychain/Keystore via `expo-secure-store` (web: AsyncStorage, no OS keychain exists there) | Never | Clearing the PIN, or uninstalling the app |
| Journal lock/biometric preference | `useJournalSecurityStore` | `ebb.journal-security` | Never | Toggle off in Journal → privacy |
| Calm memories — text notes | `useMemoriesStore` | `ebb.memories` | Never | Per-memory "Remove", or "Clear all my data" |
| Calm memories — voice recordings | `useMemoriesStore` (record) + a real audio file on disk | `ebb.memories` (metadata) + a file URI written by `expo-audio` | Never | Per-memory "Remove" deletes the row **and** the underlying file; "Clear all my data" does the same for every recording |
| Letters from calm you (Future Self Messages) | `useLettersStore` | `ebb.letters` | Never | Per-letter "Remove", or "Clear all my data" |
| Trusted contacts (name, phone, manually typed) | `useContactsStore` | `ebb.contacts` | Never — and never read from the device's real Contacts; the app has no Contacts permission or dependency | Per-contact "Remove", or "Clear all my data" |
| Calm plan entries (personal coping plan) | `useCalmPlanStore` | `ebb.calmplan` | Never | "Clear all my data" |
| Worry-postponement entries | `useWorryStore` | `ebb.worries` | Never | "Clear all my data" |
| Session history (which technique, when, for how long) | `useSessionStore` | `ebb.sessions` | Never | "Clear all my data" |
| Sleep-mode memory (last environment/sound, wake reasons) | `useSleepMemoryStore` | `ebb.sleep-memory` | Never | "Clear all my data" (not currently wired to the panic-resume/sleep stores individually — see Known gaps) |
| Panic-mode resume state (in-progress session, for reopening mid-flow) | `usePanicResumeStore` | `ebb.panic-resume` | Never | Clears automatically when a session ends |
| App settings (appearance, sound/haptics toggles, guidance pace, favourite environment, etc.) | `useSettingsStore` | `ebb.settings` | Never | Reset individually in Settings; not covered by "Clear all my data" (these are preferences, not personal content) |
| Journal export file (a plain-text copy, created only when the user taps "Export my journal") | Temp file in the OS cache directory | n/a (filesystem, not AsyncStorage) | Only if the user explicitly shares it via the OS share sheet (Mail, Files, AirDrop, etc.) — Ebb itself never transmits it | Automatically swept on the next export; also cleared whenever the OS clears its cache directory |

## What is *not* collected

- No account, no email address, no name beyond an optional first name typed
  during onboarding (stored the same as everything else, on-device, in
  `useSettingsStore`).
- No device identifiers, no advertising ID, no analytics events. The
  `analyticsOptIn` setting in `useSettingsStore` exists but nothing in the
  codebase currently sends analytics regardless of its value — see Known gaps.
- No location data.
- No photos — the camera-grounding feature (`app/camera-grounding.tsx`) shows
  a live `CameraView` for the user to look at objects around them; it never
  calls `takePictureAsync` and no photo library dependency exists in the
  project at all.
- No data from the device's real Contacts app — trusted contacts are typed
  in manually (`app/contacts.tsx`); there is no Contacts permission and no
  `expo-contacts` dependency.

## The "AI companion" (Stay With Me → Talk to the AI)

`src/engines/aiCompanion.ts` is a small on-device regex-pattern matcher
against a fixed pool of pre-written reassurance lines. It is **not** a
generative model, calls no API, and sends nothing anywhere. Worth being
explicit about this in the App Store description and privacy policy so
"AI" isn't read as a claim about cloud processing — it is not one.

## Known gaps / honest caveats

- **`analyticsOptIn` is a dormant setting.** It defaults to `false` and
  nothing in the app currently reads it to send anything anywhere — but the
  toggle exists in the data model. If analytics is ever added, this is
  where the opt-in check must gate it, and the privacy policy will need a
  real update at that point (not before).
- **Crash reporting is not configured.** If EAS/App Store Connect crash
  reporting or a third-party crash SDK is added later, journal text, letter
  bodies, and memory contents must be explicitly excluded from any crash
  context/breadcrumbs — nothing in the current codebase does this because
  nothing currently collects crash reports at all.
- **"Clear all my data"** (Settings → Your privacy) clears sessions, calm
  plan entries, contacts, letters, worries, journal entries, and memories
  (including deleting voice-memory files). It does not clear
  `useSleepMemoryStore` or app preferences (`useSettingsStore`) — those are
  treated as device configuration rather than personal content, consistent
  with how the confirmation dialog describes the action. If you want "Clear
  all my data" to be maximal rather than content-only, that's a product
  decision to make explicitly, not something inferred from this audit.
