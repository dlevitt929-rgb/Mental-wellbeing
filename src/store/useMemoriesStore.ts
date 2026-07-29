import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { localStorage } from './storage';
import { CalmMemory } from '@/types';
import { generateId } from '@/utils/id';

interface MemoriesState {
  memories: CalmMemory[];
  addText: (text: string, tag?: CalmMemory['tag']) => void;
  addVoice: (audioUri: string) => void;
  remove: (id: string) => void;
}

export const useMemoriesStore = create<MemoriesState>()(
  persist(
    (set) => ({
      memories: [],
      addText: (text, tag = 'general') =>
        set((s) => ({
          memories: [...s.memories, { id: generateId(), kind: 'text', text, tag, createdAt: Date.now() }],
        })),
      addVoice: (audioUri) =>
        set((s) => ({
          memories: [...s.memories, { id: generateId(), kind: 'voice', audioUri, tag: 'general', createdAt: Date.now() }],
        })),
      remove: (id) => set((s) => ({ memories: s.memories.filter((m) => m.id !== id) })),
    }),
    { name: 'ebb.memories', storage: localStorage },
  ),
);
