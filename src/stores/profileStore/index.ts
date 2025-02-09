import { create } from 'zustand';

// ✅ تعريف واجهة (interface) لنوع بيانات ملف تعريف المستخدم
interface UserProfile {
  username: string;
  subscriptionStatus: string; // أو يمكنك استخدام نوع enum إذا كانت الحالة محددة بقيم معينة
  // يمكنك إضافة المزيد من الخصائص هنا حسب الحاجة (مثل: email, avatarUrl, الخ)
}

interface ProfileState {
  profileData: UserProfile | null; // ✅ استبدال `any` بـ `UserProfile` interface
  fetchProfileData: () => Promise<void>;
  clearProfileData: () => void;
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