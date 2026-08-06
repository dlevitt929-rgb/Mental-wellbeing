import { useJournalStore } from '@/store/useJournalStore';
import { useLettersStore } from '@/store/useLettersStore';
import { useMemoriesStore } from '@/store/useMemoriesStore';
import { useContactsStore } from '@/store/useContactsStore';
import { useCalmPlanStore } from '@/store/useCalmPlanStore';
import { useSettingsStore } from '@/store/useSettingsStore';

/**
 * Entirely fictional seed content for App Store screenshots and reviewer
 * walkthroughs — no real names, phone numbers, or personal details. Dev-only
 * by construction: every call site gates this behind `__DEV__`, and it is
 * never imported or referenced from any file that ships in a production
 * bundle path outside that guard. There is no way to reach this from a
 * release build — `__DEV__` is a compile-time constant Metro strips in
 * release mode, so the button that calls this doesn't exist in that build.
 */

const DEMO_JOURNAL_ENTRIES = [
  { text: 'Slept better than I expected. Took the dog out before anyone else was up — the quiet helped.', mood: 'calm' as const },
  { text: "Presentation went fine. I built it up in my head for nothing, again. Trying to notice that pattern.", mood: 'okay' as const },
  { text: "Rough one today. Chest felt tight most of the afternoon. Did the breathing exercise twice.", mood: 'anxious' as const },
];

const DEMO_LETTERS = [
  {
    title: 'For a hard morning',
    body: "You've felt like this before and it always moved. Drink some water, get outside for five minutes if you can. You don't have to solve today by 9am.",
    category: 'general' as const,
  },
  {
    title: 'When the panic starts',
    body: "This is adrenaline, not danger. Slow the exhale down. It peaks and then it passes — it always has.",
    category: 'panic' as const,
  },
];

const DEMO_MEMORIES = [
  { text: 'The porch light was on when I got home and it just felt okay.' },
  { text: 'Sam saying "you don\'t have to have it figured out yet" — I think about that a lot.' },
];

const DEMO_CONTACTS = [
  { name: 'Jordan', phone: '5551230000', helpsWithText: 'Good at just listening, no advice unless asked', relationship: '' },
];

const DEMO_CALM_PLAN = [
  { category: 'things-that-calm-me' as const, text: 'Cold water on my wrists, slow exhale, naming five things I can see.' },
  { category: 'reasons-it-will-be-okay' as const, text: "Every hard moment so far has passed. This one will too." },
];

export function loadDemoContent() {
  if (!__DEV__) return;

  DEMO_JOURNAL_ENTRIES.forEach((e) => useJournalStore.getState().create(e.text, e.mood));
  DEMO_LETTERS.forEach((l) => useLettersStore.getState().add(l.title, l.body, l.category));
  DEMO_MEMORIES.forEach((m) => useMemoriesStore.getState().addText(m.text));
  DEMO_CONTACTS.forEach((c) => useContactsStore.getState().add(c));
  DEMO_CALM_PLAN.forEach((p) => useCalmPlanStore.getState().add(p.category, p.text));
  useSettingsStore.getState().setName('Alex');
}

/** The counterpart action — leaves real user data alone if any exists, this
 *  only removes what loadDemoContent() could plausibly have added is not
 *  attempted (there's no reliable way to tell a demo entry from a real one
 *  after the fact); instead this clears everything, same as Settings' "Clear
 *  all my data", and is only ever exposed next to the load action in the dev
 *  menu so the two are always used as a matched pair. */
export function clearDemoContent() {
  if (!__DEV__) return;
  useJournalStore.getState().removeAll();
  useLettersStore.setState({ letters: [] });
  useMemoriesStore.getState().clear();
  useContactsStore.setState({ contacts: [] });
  useCalmPlanStore.setState({ entries: [] });
  useSettingsStore.getState().setName('');
}
