// src/types.ts
export type UserProfile = {
  telegram_id?: number;
  full_name?: string;
  username?: string | null;
  profile_photo?: string;
  join_date?: string | null; // ✅ تم التعديل هنا ليصبح string | null
  subscriptions?: Subscription[];
};

export type Subscription = {
  id: number;
  name: string;
  price: string | number;
  selectedOption?: string | null;
  description?: string;
  features?: string[];
  animation?: object;
  subscriptionOptions?: string[];
  color?: string;
  expiry?: string;
  progress?: number;
  status?: "نشط" | "منتهي";
};

