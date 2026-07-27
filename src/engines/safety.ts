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
