import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { JournalEntry } from '@/types';
import { formatFullTimestamp } from './formatDate';

/** iOS resolves `Sharing.shareAsync` as soon as the share sheet is
 *  presented, not after the user finishes with it — deleting the just-shared
 *  file immediately after `await` risks deleting it out from under Mail/
 *  Files/AirDrop mid-handoff. Instead, sweep up *previous* exports before
 *  writing a new one, so nothing currently being shared is ever touched and
 *  at most one leftover export file exists in cache at a time. */
function cleanupPreviousExports() {
  try {
    for (const entry of Paths.cache.list()) {
      if (entry instanceof File && entry.name.startsWith('ebb-journal-') && entry.name.endsWith('.txt')) {
        entry.delete();
      }
    }
  } catch {
    // Best-effort — a leftover temp file isn't worth failing the export over.
  }
}

export async function exportJournal(entries: JournalEntry[]): Promise<void> {
  cleanupPreviousExports();

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
