import { create } from 'zustand';

interface SessionState {
  session: string | null; // رمز الجلسة (Session Token) - يمكن أن يكون سلسلة نصية أو null
  setSession: (session: string | null) => void;
  removeSession: () => void;
}

export const useSessionStore = create<SessionState>((set) => ({
  session: null,
  setSession: (session) => set({ session }),
  removeSession: () => set({ session: null }),
}));