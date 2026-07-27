import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { localStorage } from './storage';
import { TrustedContact } from '@/types';
import { generateId } from '@/utils/id';

interface ContactsState {
  contacts: TrustedContact[];
  add: (c: Omit<TrustedContact, 'id'>) => void;
  update: (id: string, patch: Partial<TrustedContact>) => void;
  remove: (id: string) => void;
}

export const useContactsStore = create<ContactsState>()(
  persist(
    (set) => ({
      contacts: [],
      add: (c) => set((s) => ({ contacts: [...s.contacts, { ...c, id: generateId() }] })),
      update: (id, patch) =>
        set((s) => ({ contacts: s.contacts.map((c) => (c.id === id ? { ...c, ...patch } : c)) })),
      remove: (id) => set((s) => ({ contacts: s.contacts.filter((c) => c.id !== id) })),
    }),
    { name: 'ebb.contacts', storage: localStorage },
  ),
);
