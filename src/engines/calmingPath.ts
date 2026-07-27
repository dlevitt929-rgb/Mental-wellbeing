import { BreathingTechniqueId, Feeling } from '@/types';
import { chooseBreathingTechnique, CalmingPathSignals } from './breathing';

export function openingLineForFeeling(feeling?: Feeling | string | null): string {
  switch (feeling) {
    case 'something-happened':
      return 'Something happened, and that’s a lot to be holding.';
    case 'overwhelmed':
      return 'It’s too much right now. That’s allowed.';
    case 'need-calm':
      return 'Okay. Let’s bring this down together.';
    default:
      return 'You don’t need to fix anything right now.';
  }
}

export interface CalmingQuestion {
  id: keyof CalmingPathSignals;
  text: string;
}

/** Asked one at a time, never all at once. Each answer narrows the plan — never a diagnosis. */
export const CALMING_QUESTIONS: CalmingQuestion[] = [
  { id: 'heartRacing', text: 'Is your heart racing?' },
  { id: 'dizzy', text: 'Do you feel dizzy or lightheaded?' },
  { id: 'thoughtsRacing', text: 'Are your thoughts racing?' },
  { id: 'catastrophic', text: 'Does it feel like something terrible is about to happen?' },
  { id: 'unsafe', text: 'Are you somewhere safe right now?' },
];

export type PlanStepKind =
  | 'safety-check'
  | 'breathing'
  | 'physical-grounding'
  | 'cognitive-distancing'
  | 'reassurance';

export interface PlanStep {
  kind: PlanStepKind;
  breathingTechnique?: BreathingTechniqueId;
}

/**
 * Builds the sequence of what happens next. Intentionally simple — a handful of
 * signals map to an order of steps, never a score or a label for the person.
 */
export function buildCalmingPlan(signals: CalmingPathSignals): PlanStep[] {
  const steps: PlanStep[] = [];

  if (signals.unsafe === true) {
    steps.push({ kind: 'safety-check' });
  }

  const technique = chooseBreathingTechnique(signals);
  steps.push({ kind: 'breathing', breathingTechnique: technique });

  if (signals.thoughtsRacing) {
    steps.push({ kind: 'cognitive-distancing' });
  }

  steps.push({ kind: 'physical-grounding' });

  // Every plan lands on some acknowledgment — the wording adapts to what was actually said.
  steps.push({ kind: 'reassurance' });

  return steps;
}

export function reassuranceLine(signals: CalmingPathSignals): string {
  if (signals.catastrophic) {
    return 'Your body can feel like something terrible is happening even when you are safe. That feeling is real, but it is not a fact.';
  }
  if (signals.heartRacing || signals.dizzy) {
    return 'A racing heart and dizziness are common in panic. They feel alarming, but they will pass.';
  }
  if (signals.thoughtsRacing) {
    return 'Your thoughts don’t need to stop for you to feel calmer. We’re just going to give them somewhere else to rest for a minute.';
  }
  return 'Whatever this is, you don’t need to solve it right now. Let’s just get through the next few minutes.';
}
