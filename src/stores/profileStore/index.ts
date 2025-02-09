import { create } from 'zustand';

interface ProfileState {
  profileData: any | null; // يمكنك استبدال `any` بنوع بيانات ملف تعريف المستخدم الفعلي لاحقًا
  fetchProfileData: () => Promise<void>; // دالة لجلب بيانات ملف التعريف (سنقوم بتنفيذها لاحقًا)
  clearProfileData: () => void; // دالة لمسح بيانات ملف التعريف
}

export const useProfileStore = create<ProfileState>((set) => ({
  profileData: null,
  fetchProfileData: async () => {
    // سيتم تنفيذ جلب البيانات من الخادم هنا لاحقًا
    console.log("Fetching profile data (implementation to be added)");
    // مثال مؤقت: يمكنك إزالة هذا السطر لاحقًا
    set({ profileData: { username: "exampleUser", subscriptionStatus: "inactive" } });
  },
  clearProfileData: () => {
    set({ profileData: null });
  },
}));