<<<<<<< HEAD
// Chemin: C:\PROJETS-DEVELOPPEMENT\PI-BICARS-CLEAN\project\src\store\index.ts

import { create } from 'zustand';

interface Store {
  darkMode: boolean;
  toggleDarkMode: () => void;
  language: string;
  setLanguage: (lang: string) => void;
  user: { name: string } | null;
  setUser: (user: { name: string } | null) => void;
}

export const useStore = create<Store>((set) => ({
  darkMode: false,
  toggleDarkMode: () => set((state) => ({ darkMode: !state.darkMode })),
  language: 'fr',
  setLanguage: (lang) => set({ language: lang }),
  user: { name: 'Admin' },
  setUser: (user) => set({ user }),
}));
=======
export * from './useFinanceStore';
>>>>>>> fbec03c06150e04d48d84815960898c3c347b0e2
