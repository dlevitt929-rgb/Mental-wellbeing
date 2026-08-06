# Data deletion — Ebb

This document exists for two audiences: App Store reviewers checking
Guideline 5.1.1(v) (account/data deletion), and users looking for how to
delete their data. Keep it in sync with `DATA_INVENTORY.md`.

## Does Ebb have accounts?

No. Ebb has no sign-up, no login, no user accounts, and no server-side
storage of any kind. Every piece of content a person creates in Ebb —
journal entries, memories, letters, contacts, calm plan entries, worries,
session history, and app preferences — is stored exclusively in local
storage on that person's own device (see `DATA_INVENTORY.md` for the
complete list, store by store).

## How deletion works, given that

Since there is no account and no server copy, "deleting your data" and
"deleting it from the app" are the same action — there is nothing left
over anywhere else to separately purge. In-app, at increasing scope:

1. **Per-item deletion** — every journal entry, memory (including voice
   recordings, which deletes the underlying audio file, not just the
   list entry), letter, and contact has its own "Remove"/"Delete" action.
2. **Journal → Privacy → "Delete all journal entries"** — removes every
   journal entry in one action.
3. **Settings → Your privacy → "Clear all my data"** — removes sessions,
   calm plan entries, contacts, letters, worries, journal entries, and
   memories (again, including deleting voice-recording files from disk).
4. **Uninstalling the app** — removes everything above plus app
   preferences and the keychain-stored journal PIN hash. This is the
   complete, unconditional deletion path with nothing left behind.

All four are available to every user, at any time, with no paywall, no
support ticket, and no waiting period — deletion is immediate and
irreversible.

## Reviewer note

If App Store Connect's data-deletion questionnaire requires an explicit
answer: Ebb does not need to offer "request account deletion" because it
has no accounts to delete. The equivalent, in-app, always-available action
is Settings → Your privacy → "Clear all my data," described above.
