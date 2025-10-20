// src/stores/zustand/userStore.ts
import { create } from 'zustand';

interface UserData {
    telegramId: string | null;
    telegramUsername: string | null;
    fullName: string | null;
    photoUrl: string | null;
    joinDate: string | null; // ✅ إضافة joinDate هنا
    gmail: string | null;
    isLinked: boolean;
}

interface UserState extends UserData {
    setUserData: (userData: Partial<UserData>) => void;
    clearUserData: () => void;
}

const initialState: UserData = {
    telegramId: null,
    telegramUsername: null,
    fullName: null,
    photoUrl: null,
    joinDate: null,
    gmail: null,
    isLinked: false,
};

export const useUserStore = create<UserState>((set) => ({
    ...initialState,
    setUserData: (userData) => set(userData),
    clearUserData: () => set({ ...initialState }),
}));