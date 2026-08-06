# Privacy Policy — Ebb

**Draft — replace the bracketed placeholders below, then host this at the
URL you put in `src/config/legal.ts` (`LEGAL_LINKS.privacyPolicyUrl`)
before submitting to the App Store.** The claims in this draft were
generated from a direct audit of the app's source code (see
`docs/app-store/DATA_INVENTORY.md`) — if you change what the app collects
or how, update this document to match, not the other way around.

_Last reviewed: [DATE]_
_Effective date: [DATE]_

## The short version

Ebb stores what you write and record only on your own device. It does not
have a server, does not create an account for you, and does not send your
journal entries, memories, letters, contacts, or recordings anywhere. There
are no ads and no analytics currently active in the app.

## What we collect

Ebb collects only what you choose to enter directly into the app:

- Journal entries you write, and an optional mood tag
- Text or voice memories you save ("Calm memories")
- Letters you write to your future self
- Trusted contacts you add manually (name, phone number, a short note) —
  Ebb never reads your device's actual address book
- A personal calm plan (coping strategies, reasons it will be okay, etc.)
- Worries you set aside for later
- App preferences (appearance, sound/haptics, guidance pace, favourite
  calming environment) and an optional first name
- A record of which in-app techniques you've used and when, kept only to
  personalize what Ebb suggests next

None of this requires creating an account. Ebb does not collect your email
address, real name (beyond what you optionally type in), device
identifiers, advertising identifiers, or location.

## Where it's stored

Everything above is stored locally on your device. Most of it uses standard
on-device app storage; your journal PIN is stored as a one-way cryptographic
hash (never the PIN itself) in your device's secure hardware-backed
keychain, not in regular app storage. See `DATA_INVENTORY.md` in this
project for the complete field-by-field breakdown.

## What leaves your device

Nothing, by default. Ebb makes no network requests — there is no backend
server for it to talk to. The only way any of your content leaves your
device is if you explicitly choose to:

- **Export your journal** (Journal → Privacy → "Export my journal"), which
  creates a plain-text file and hands it to your device's native share
  sheet (Mail, Files, AirDrop, Messages, etc.) — you choose the destination,
  Ebb doesn't pick one for you.
- **Call or text a trusted contact or a crisis line** from within the app,
  which opens your device's Phone or Messages app the same way tapping a
  phone number anywhere else would.

## Camera and microphone

- Ebb's grounding exercises can use your camera to show you a live view of
  your surroundings, to guide a "find something around you" exercise.
  **No photo or video is ever captured, saved, or transmitted** — it's a
  live pass-through view only, and the camera is released the moment you
  leave that screen.
- Ebb's Calm Memories feature can use your microphone to record a voice
  note to yourself. **Recordings are saved only on your device** and are
  never uploaded. You can delete any recording at any time, which deletes
  the underlying audio file, not just its entry in the list.

Both permissions are requested only at the moment you actually use that
feature — never during onboarding or app launch — and you can decline
either one and continue using the rest of the app; text alternatives are
offered where relevant (e.g. writing a memory instead of recording one).

## The "AI companion"

Stay With Me's "Talk to the AI" mode is a small on-device response system
that matches what you type against a fixed set of pre-written, calm
reassurance lines. **It is not a cloud AI service** — nothing you type
there is sent to us, to a language-model provider, or to anyone else. It
runs entirely on your device.

## Your control over this data

Every category of content above can be deleted from within the app:

- Delete any single journal entry, memory, letter, or contact individually
- "Journal → Privacy → Delete all journal entries" removes every journal
  entry
- "Settings → Your privacy → Clear all my data" removes sessions, calm plan
  entries, contacts, letters, worries, journal entries, and memories
  (including deleting the audio files behind any voice recordings)
- Uninstalling the app removes everything Ebb ever stored, including the
  keychain-protected PIN hash

There is no server-side copy for us to delete on your behalf, because none
exists.

## Children's privacy

Ebb is not directed at children and is not intended for use by anyone
under [13 / 16 — pick based on your target markets and legal advice]. We do
not knowingly collect information from children under that age. Because
Ebb collects no information from us in the first place (everything is
on-device, entered by the person using the app), there is no server-side
data for us to identify as belonging to a child.

## Crisis and emergency content

Ebb includes crisis-support resources and, where your device's language and
region setting allows a reasonable guess, a locally-appropriate emergency
number. This is a best-effort convenience, not a location service — Ebb
does not access or store your GPS location, and the guessed number may be
wrong if your device's language/region setting doesn't match where you
actually are. Ebb is not an emergency service and is not a substitute for
professional mental health care; see the in-app crisis screen and
`docs/app-store/SUPPORT.md` for details.

## Changes to this policy

If what Ebb collects or how it's handled changes — for example, if a future
version adds an optional cloud AI feature, analytics, or account sync —
this policy will be updated first, the change will be described plainly
(not buried), and any new data collection will be opt-in wherever
technically and legally appropriate.

## Contact

Questions about this policy: [SUPPORT EMAIL / SUPPORT URL].
