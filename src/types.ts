// src/types.ts

export type UserProfile = {
  telegram_id?: number;
  full_name?: string;
  username?: string | null;
  profile_photo?: string;
  join_date?: string | null;
  subscriptions?: Subscription[];
};

// ==================================================================
// ✨ الخطوة 1: أضف هذا التعريف الجديد لشكل رابط القناة الفرعية ✨
// هذا يخبر TypeScript أن كل عنصر في قائمة القنوات الفرعية سيكون
// كائنًا يحتوي على اسم ورابط.
// ==================================================================
export interface SubChannelLink {
  name: string;
  link: string;
  views?: number;
  last_accessed?: string;
}

// ==================================================================
// ✨ الخطوة 2: قم بتحديث تعريف "الاشتراك" الحالي ✨
// ==================================================================
export interface Subscription {
  id: number;
  name: string;
  status: 'نشط' | 'منتهي' | 'unknown';
  expiry: string; // تم إرسالها من الخادم
  start_date: string; // تم إرسالها من الخادم
  progress: number; // تم إرسالها من الخادم
  invite_link: string | null; // تم إرسالها من الخادم (رابط رئيسي)

  // ✨ الخاصية الجديدة التي أضفناها ✨
  // ستكون عبارة عن مصفوفة من الروابط الفرعية أو null إذا لم توجد
  sub_channel_links: SubChannelLink[] | null;

  // --- الخصائص التالية قد تأتي من صفحات أخرى (مثل صفحة الشراء) ---
  // لذلك من الجيد إبقاؤها اختيارية (باستخدام علامة ?) لتجنب الأخطاء
  price?: string | number;
  selectedOption?: string | null;
  description?: string;
  features?: string[];
  terms_and_conditions?: string[];
  animation?: object;
  subscriptionOptions?: string[];
  color?: string;
}

export interface SubscriptionsResponse {
  subscriptions: Subscription[];
  meta?: {
    total: number;
    active: number;
    expired: number;
  };
}
