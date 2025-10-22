// src/stores/zustand/uiStore.ts
import { create } from 'zustand';

type AuthContext = 'locked' | 'generic';

interface UIState {
  isAuthPromptOpen: boolean;
  authContext: AuthContext | null;
  openAuthPrompt: (ctx?: AuthContext) => void;
  closeAuthPrompt: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  isAuthPromptOpen: false,
  authContext: null,
  openAuthPrompt: (ctx = 'generic') => set({ isAuthPromptOpen: true, authContext: ctx }),
  closeAuthPrompt: () => set({ isAuthPromptOpen: false, authContext: null }),
}));