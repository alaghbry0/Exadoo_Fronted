// src/stores/profileStore.ts
import { create } from 'zustand';
import { UserProfile, Subscription } from '@/types'; // استيراد الأنواع

interface ProfileState {
    userProfile: UserProfile | null;
    userSubscriptions: Subscription[] | null;
    setUserProfile: (profile: UserProfile) => void;
    setUserSubscriptions: (subscriptions: Subscription[]) => void;
    clearUserProfile: () => void;
}

export const useProfileStore = create<ProfileState>((set) => ({
    userProfile: null,
    userSubscriptions: null,
    setUserProfile: (profile) => set({ userProfile: profile }),
    setUserSubscriptions: (subscriptions) => set({ userSubscriptions: subscriptions }),
    clearUserProfile: () => set({ userProfile: null, userSubscriptions: null }),
}));