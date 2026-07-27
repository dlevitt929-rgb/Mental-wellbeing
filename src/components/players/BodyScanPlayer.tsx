import React from 'react';
import { MessageBeat } from '@/components/MessageBeat';
import { BODY_SCAN_STEPS } from '@/data/bodyScripts';

export function BodyScanPlayer({ onDone }: { onDone: () => void }) {
  return <MessageBeat beats={BODY_SCAN_STEPS.map((text) => ({ text, holdMs: 4200 }))} onDone={onDone} />;
}
