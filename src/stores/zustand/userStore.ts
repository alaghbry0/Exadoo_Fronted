// src/stores/zustand/userStore.ts
import { create } from 'zustand';

interface UserData {
    telegramId?: string | null;
    telegramUsername?: string | null;
    fullName?: string | null;
    photoUrl?: string | null;
    joinDate?: string | null;
    isLinked?: boolean;
    gmail?: string | null;
}

interface UserState {
    telegramId: string | null;
    telegramUsername: string | null;
    fullName: string | null;
    photoUrl: string | null;
    joinDate: string | null;
    isLinked: boolean;
    gmail: string | null;
    setUserData: (userData: Partial<UserData>) => void;
    clearUserData: () => void;
    setLinked: (isLinked: boolean, gmail?: string | null) => void;
}

export const useUserStore = create<UserState>((set) => ({
    telegramId: null,
    telegramUsername: null,
    fullName: null,
    photoUrl: null,
    joinDate: null,
    isLinked: false,
    gmail: null,
    setUserData: (userData) => set((state) => ({ ...state, ...userData })),
    clearUserData: () => set({
        telegramId: null,
        telegramUsername: null,
        fullName: null,
        photoUrl: null,
        joinDate: null,
        isLinked: false,
        gmail: null,
    }),
    setLinked: (isLinked, gmail = null) => set({ isLinked, gmail }),
}));
