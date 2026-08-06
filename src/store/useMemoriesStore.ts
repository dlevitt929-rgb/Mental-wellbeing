import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Platform } from 'react-native';
import { File } from 'expo-file-system';
import { localStorage } from './storage';
import { CalmMemory } from '@/types';
import { generateId } from '@/utils/id';

interface MemoriesState {
  memories: CalmMemory[];
  addText: (text: string, tag?: CalmMemory['tag']) => void;
  addVoice: (audioUri: string) => void;
  remove: (id: string) => void;
  /** Removes every memory AND deletes every voice recording's underlying
   *  file — "Clear all my data" must not leave orphaned audio on disk. */
  clear: () => void;
}

/** Recordings are real files on disk, not just store rows — removing the row
 *  without deleting the file leaves it behind indefinitely. Best-effort: a
 *  missing/already-deleted file must never throw. No-op on web, which has no
 *  real filesystem for these blob URIs. */
function deleteVoiceFile(audioUri: string) {
  if (Platform.OS === 'web') return;
  try {
    new File(audioUri).delete();
  } catch {
    // Already gone, or never a real file — nothing left to clean up.
  }
}

export const useMemoriesStore = create<MemoriesState>()(
  persist(
    (set, get) => ({
      memories: [],
      addText: (text, tag = 'general') =>
        set((s) => ({
          memories: [...s.memories, { id: generateId(), kind: 'text', text, tag, createdAt: Date.now() }],
        })),
      addVoice: (audioUri) =>
        set((s) => ({
          memories: [...s.memories, { id: generateId(), kind: 'voice', audioUri, tag: 'general', createdAt: Date.now() }],
        })),
      remove: (id) => {
        const target = get().memories.find((m) => m.id === id);
        if (target?.kind === 'voice' && target.audioUri) deleteVoiceFile(target.audioUri);
        set((s) => ({ memories: s.memories.filter((m) => m.id !== id) }));
      },
      clear: () => {
        for (const m of get().memories) {
          if (m.kind === 'voice' && m.audioUri) deleteVoiceFile(m.audioUri);
        }
        set({ memories: [] });
      },
    }),
    { name: 'ebb.memories', storage: localStorage },
  ),
);
