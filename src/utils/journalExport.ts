import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { JournalEntry } from '@/types';
import { formatFullTimestamp } from './formatDate';

export async function exportJournal(entries: JournalEntry[]): Promise<void> {
  const sorted = [...entries].sort((a, b) => a.createdAt - b.createdAt);
  const lines = sorted.map((e) => {
    const header = formatFullTimestamp(e.createdAt) + (e.mood ? ` · feeling ${e.mood}` : '');
    return `${header}\n${e.text}\n`;
  });
  const contents = lines.join('\n---\n\n') || 'No journal entries yet.';

  const file = new File(Paths.cache, `ebb-journal-${Date.now()}.txt`);
  file.write(contents);

  const available = await Sharing.isAvailableAsync();
  if (available) {
    await Sharing.shareAsync(file.uri, { mimeType: 'text/plain', dialogTitle: 'Export your journal' });
  }
}
