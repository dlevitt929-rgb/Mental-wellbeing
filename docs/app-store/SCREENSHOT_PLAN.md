# Screenshot plan — Ebb

## What's already captured

Eight real screenshots were captured this session from the actual running
app (web export, seeded with clearly-fictional demo content — see
`src/data/demoContent.ts`), not mockups. They're in this repo's session
scratch output and were sent to you directly; regenerate them any time with
the same technique (seed the relevant AsyncStorage keys, navigate, capture)
now that the app has real content to show. They are **not** committed to
the repo (screenshots aren't source code and the fictional content, while
harmless, doesn't belong in version control) — save the ones you like into
your App Store Connect media upload directly.

| # | Screen | What it shows | Suggested caption |
|---|---|---|---|
| 1 | Home + immediate help | Hero "I need help right now" button, full tile grid | "One tap, no questions first." |
| 2 | One Minute With Me | The breathing orb mid-session over the ocean environment | "Sixty seconds where nothing else needs deciding." |
| 3 | Breathing | Rhythm picker → active breathing orb, "Breathe in" | "Five rhythms, each with its own gentle pace." |
| 4 | Sleep | The cognitive-shuffle "meadow" screen against a starfield | "Tools for when your mind won't stop at night." |
| 5 | Stay With Me | Quiet-presence mode, fireplace glow, reassurance line | "A calming presence when you don't want to be alone." |
| 6 | Journal | Three demo entries, mood glyphs, search | "A private place to put things down." |
| 7 | Calm Memories | Two saved text memories, record/write actions | "Save something for a harder day." |
| 8 | Settings/personalization | Appearance, guidance pace, environment picker | "Make it feel like yours." |

**Note on "My Room":** the original 22-point brief asked for a "Personalisation
or My Room" screenshot. My Room was scoped down and never built (see task
history — it was deliberately deferred, not an oversight). Screenshot #8
substitutes Settings' personalization section (appearance, guidance pace,
environments), which is the app's actual equivalent surface. If you build
My Room later, swap this screenshot for it.

## Required sizes (verify against App Store Connect at submission time —
Apple periodically changes required device classes)

At time of writing, App Store Connect requires at minimum:
- **6.9" display** (iPhone 16 Pro Max class) — 1320 × 2868 or 2868 × 1320
- **6.5" display** (iPhone 11 Pro Max / XS Max class) — 1284 × 2778 or similar,
  still commonly requested even when 6.9" is provided

The eight screenshots captured this session are at a 390×844 logical /
780×1688 physical (2x) resolution — a standard iPhone viewport, but not
necessarily matching Apple's exact current required export sizes. Re-capture
at the exact required dimensions (or use App Store Connect's automatic
scaling from a supported size — check current Apple documentation, this
detail changes) before final submission.

## Open question: iPad screenshots

`app.json` sets `ios.supportsTablet: true`. If that stays true, App Store
Connect will also want iPad screenshots (12.9" iPad Pro class at minimum).
**This wasn't tested on a tablet-sized viewport this session** — the app's
layouts are generally centered/max-width phone layouts, and nobody has
verified they look intentional (not just stretched/awkwardly centered) at
iPad dimensions. Before submitting, either:
1. Actually test the app at an iPad viewport/simulator and confirm it
   looks acceptable, then capture real iPad screenshots, or
2. Set `supportsTablet: false` in `app.json` if the app isn't meant to be
   used on iPad, which removes the iPad-screenshot requirement entirely.

This is a real open decision, not something resolved in this pass.

## What to avoid (per the original brief, still true)

No real journal entries, no real phone numbers, no debug data, no
unsupported medical claims, no crisis language used as marketing spectacle.
The demo content used for these captures satisfies this — it's entirely
fictional ("Alex," "Jordan," invented journal entries) and was generated
specifically for this purpose.
