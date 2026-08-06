# Support — Ebb

**Draft support-page content — host this at the URL you put in
`src/config/legal.ts` (`LEGAL_LINKS.supportUrl`). App Store Connect requires
a working Support URL for every listing.**

## Contact

Having a problem, found a bug, or have feedback? Reach us at
[SUPPORT EMAIL].

## If you're in crisis right now

Ebb is a self-guided support tool, not an emergency service. If you're in
immediate danger, please contact your local emergency number directly. Ebb
includes a Crisis & Emergency Resources screen (Settings → Crisis &
emergency resources, or from the "I need help right now" button on Home)
with region-appropriate crisis lines and a best-effort local emergency
number.

If you don't have the app open right now and need help immediately:
- United States & Canada: call or text **988** (Suicide & Crisis Lifeline)
- United Kingdom & Ireland: call **116 123** (Samaritans)
- Australia: call **13 11 14** (Lifeline)
- Elsewhere: please search for your country's crisis line, or call your
  local emergency number.

## Common questions

**Is my journal private?**
Yes. Everything you write stays on your device — see our
[Privacy Policy]([PRIVACY POLICY URL]). You can add a PIN or Face
ID/Touch ID lock in Journal → Privacy.

**I forgot my journal PIN — how do I get back in?**
There's no PIN-recovery flow, by design — Ebb never stores the PIN itself,
only a one-way hash, so there's nothing for us to look up or reset for you.
If you're truly locked out, reinstalling the app will clear the PIN (and
all locally-stored journal content along with it, since there's no
account/cloud copy). If you want a safer path for this in the future,
that's a feature request — see Contact above.

**Does Ebb record or upload anything without telling me?**
No. Camera and microphone access are only ever used while you're actively
in the specific feature that needs them (camera grounding, voice memories),
never in the background, and nothing captured is uploaded — see the
Privacy Policy for specifics.

**How do I delete everything?**
Settings → Your privacy → "Clear all my data." This is permanent and
can't be undone from within the app.

**How do I export my journal?**
Journal → Privacy → "Export my journal." This creates a text file and opens
your device's normal share sheet so you can save or send it wherever you'd
like.

## Data deletion requests

Because Ebb stores data only on your device and has no server or account
system, there is no separate "delete my data" request to submit — deleting
it in the app (see above) or uninstalling the app is the complete deletion.
See `docs/app-store/DATA_DELETION.md` for the full explanation, written for
App Store Connect's data-deletion requirement.
