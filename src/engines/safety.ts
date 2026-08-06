export type SafetyLevel = 'none' | 'medical' | 'crisis';

const CRISIS_PATTERNS = [
  /kill myself/i,
  /suicid/i,
  /want to die/i,
  /end my life/i,
  /ending it all/i,
  /no reason to (live|keep going)/i,
  /can'?t go on/i,
  /hurt myself/i,
  /harm myself/i,
  /self[\s-]?harm/i,
  /overdose/i,
  /better off (dead|without me)/i,
  /hurt (someone|him|her|them)/i,
];

const MEDICAL_PATTERNS = [
  /chest pain/i,
  /can'?t breathe/i,
  /cannot breathe/i,
  /numbness (on|in) (one|my) (side|arm|face)/i,
  /face is drooping/i,
  /severe allergic/i,
  /throat is closing/i,
  /passing out/i,
  /heart attack/i,
  /stroke/i,
];

export function detectSafetyLevel(text: string): SafetyLevel {
  if (!text) return 'none';
  if (CRISIS_PATTERNS.some((p) => p.test(text))) return 'crisis';
  if (MEDICAL_PATTERNS.some((p) => p.test(text))) return 'medical';
  return 'none';
}

export const RESPONSIBLE_MEDICAL_LINE =
  'Panic can cause intense physical sensations, but some medical emergencies can feel similar. If you have severe, new, or concerning symptoms, please seek urgent medical help or call your local emergency number.';

export interface CrisisResource {
  region: string;
  name: string;
  contact: string;
  kind: 'call' | 'text';
}

export const CRISIS_RESOURCES: CrisisResource[] = [
  { region: 'United States', name: '988 Suicide & Crisis Lifeline', contact: '988', kind: 'call' },
  { region: 'United States', name: 'Crisis Text Line', contact: '741741', kind: 'text' },
  { region: 'United Kingdom', name: 'Samaritans', contact: '116 123', kind: 'call' },
  { region: 'Canada', name: 'Talk Suicide Canada', contact: '988', kind: 'call' },
  { region: 'Ireland', name: 'Samaritans Ireland', contact: '116 123', kind: 'call' },
  { region: 'Australia', name: 'Lifeline Australia', contact: '13 11 14', kind: 'call' },
];

/**
 * A hardcoded "Call emergency services" button used to always dial 911 —
 * correct for the US, silently wrong (and potentially dangerous at the worst
 * possible moment) for anyone elsewhere. There is no reliable way to know a
 * user's real location without asking for it, which this app deliberately
 * doesn't do — so this is a best-effort guess from the device's language/
 * region setting, always paired in the UI with a visible "not right?"
 * fallback rather than presented as a confident answer.
 */
export interface EmergencyNumber {
  region: string;
  number: string;
}

const EMERGENCY_NUMBERS: Record<string, EmergencyNumber> = {
  US: { region: 'the United States', number: '911' },
  CA: { region: 'Canada', number: '911' },
  MX: { region: 'Mexico', number: '911' },
  GB: { region: 'the United Kingdom', number: '999' },
  AU: { region: 'Australia', number: '000' },
  NZ: { region: 'New Zealand', number: '111' },
  JP: { region: 'Japan', number: '119' },
  IN: { region: 'India', number: '112' },
  ZA: { region: 'South Africa', number: '10111' },
  BR: { region: 'Brazil', number: '190' },
};

// The EU standard — plus a handful of other countries that also route 112.
const REGIONS_USING_112 = [
  'IE', 'FR', 'DE', 'ES', 'IT', 'NL', 'BE', 'PT', 'AT', 'SE', 'FI', 'DK', 'NO', 'PL', 'GR',
  'CZ', 'RO', 'HU', 'CH', 'IS', 'HR', 'SK', 'SI', 'EE', 'LV', 'LT', 'LU', 'MT', 'CY', 'BG',
];

/** Best-effort two-letter region from the device's locale (e.g. "en-US" → "US"). */
function detectRegion(): string | null {
  try {
    const locale = Intl.DateTimeFormat().resolvedOptions().locale;
    const region = locale.split('-')[1];
    return region && region.length === 2 ? region.toUpperCase() : null;
  } catch {
    return null;
  }
}

/** Null when detection isn't possible/confident — callers must have a
 *  generic fallback for that case, never assume a number. */
export function getLocalEmergencyNumber(): EmergencyNumber | null {
  const region = detectRegion();
  if (!region) return null;
  if (EMERGENCY_NUMBERS[region]) return EMERGENCY_NUMBERS[region];
  if (REGIONS_USING_112.includes(region)) return { region: 'your country', number: '112' };
  return null;
}
