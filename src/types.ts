export type Subscription = {
  id: number;
  name: string;
  price: string;
  description: string;
  features: string[];
  animation: object;
  color: string;
  expiry: string;
  progress: number;
  status: "نشط" | "منتهي"; // ✅ استخدام Enum بدلاً من `string`
};

export type UserProfile = {
  telegram_id?: number;
  full_name?: string;
  username?: string | null;
  profile_photo?: string;
  join_date?: string;
  subscriptions?: Subscription[];
};
