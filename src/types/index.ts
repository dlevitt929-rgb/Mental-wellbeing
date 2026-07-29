export type Feeling =
  | 'panicking'
  | 'cant-sleep'
  | 'racing-thoughts'
  | 'overwhelmed'
  | 'alone'
  | 'need-calm'
  | 'something-happened'
  | 'dont-know';

export type Technique =
  | 'breathing'
  | 'grounding'
  | 'pmr'
  | 'body-scan'
  | 'guided-imagery'
  | 'cognitive-defusion'
  | 'mindfulness'
  | 'sensory-grounding'
  | 'movement'
  | 'cold-grounding'
  | 'journaling'
  | 'self-compassion'
  | 'sleep-exercise'
  | 'worry-postponement'
  | 'emotional-regulation'
  | 'talking'
  | 'stay-with-me'
  | 'hold-to-breathe'
  | 'follow-along'
  | 'stillness'
  | 'look-away-grounding'
  | 'put-it-down'
  | 'time';

export type BreathingTechniqueId =
  | 'diaphragmatic'
  | 'extended-exhale'
  | 'box'
  | 'physiological-sigh'
  | 'paced';

export interface BreathingPhase {
  key: 'inhale' | 'inhale2' | 'hold' | 'exhale' | 'holdEmpty';
  seconds: number;
  label: string;
}

export interface BreathingTechnique {
  id: BreathingTechniqueId;
  name: string;
  description: string;
  phases: BreathingPhase[];
  cycles: number;
}

export interface Session {
  id: string;
  startedAt: number;
  endedAt?: number;
  feeling: Feeling;
  path: string[]; // screens/steps visited, e.g. ['calming-path','breathing:box','grounding']
  techniquesUsed: Technique[];
  helped?: 'much-better' | 'a-little-better' | 'about-the-same' | 'worse';
  reliefRating?: 1 | 2 | 3 | 4 | 5;
}

export interface CalmPlanEntry {
  id: string;
  category:
    | 'things-that-calm-me'
    | 'people-i-trust'
    | 'songs'
    | 'places'
    | 'things-to-remember'
    | 'reasons-it-will-be-okay';
  text: string;
  createdAt: number;
}

export interface TrustedContact {
  id: string;
  name: string;
  phone?: string;
  relationship?: string;
  helpsWithText: string; // e.g. "hearing your mom's voice usually helps"
}

export interface Letter {
  id: string;
  title: string;
  body: string;
  createdAt: number;
  timesOpened: number;
}

export interface WorryEntry {
  id: string;
  text: string;
  createdAt: number;
  resolvedAt?: number;
  remindTomorrow: boolean;
}

export interface ThoughtEntry {
  id: string;
  text: string;
  category?: 'deal-tomorrow' | 'not-in-control' | 'just-a-thought' | 'important' | 'let-go';
  createdAt: number;
}

export type Mood =
  | 'calm'
  | 'happy'
  | 'okay'
  | 'anxious'
  | 'overwhelmed'
  | 'sad'
  | 'angry'
  | 'numb'
  | 'hopeful'
  | 'tired';

export interface JournalEntry {
  id: string;
  text: string;
  createdAt: number;
  updatedAt: number;
  mood?: Mood;
}

export interface InsightSignal {
  techniqueUsageCount: Partial<Record<Technique, number>>;
  techniqueHelpfulCount: Partial<Record<Technique, number>>;
  totalSessions: number;
  reachedOutCount: number;
  nightSessionDurationsMs: number[];
}
