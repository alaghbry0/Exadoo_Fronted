// src/stores/zustand/userStore.ts
import { create } from 'zustand';

interface UserState {
    telegramId: string | null;
    telegramUsername: string | null;
    fullName: string | null;
    photoUrl: string | null;
    joinDate: string | null; // ✅ إضافة joinDate هنا
    setUserData: (userData: UserData) => void;
    clearUserData: () => void;
}

interface UserData {
    telegramId: string | null;
    telegramUsername: string | null;
    fullName: string | null;
    photoUrl: string | null;
    joinDate: string | null; // ✅ إضافة joinDate هنا
}


export const useUserStore = create<UserState>((set) => ({
    telegramId: null,
    telegramUsername: null,
    fullName: null,
    photoUrl: null,
    joinDate: null, // ✅ تهيئة joinDate هنا
    setUserData: (userData) => set(userData),
    clearUserData: () => set({ telegramId: null, telegramUsername: null, fullName: null, photoUrl: null, joinDate: null }), // ✅ إعادة تعيين joinDate هنا
}));