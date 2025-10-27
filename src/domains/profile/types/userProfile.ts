import type { Subscription } from "@/domains/subscriptions/types";

export type UserProfile = {
  telegram_id?: number;
  full_name?: string;
  username?: string | null;
  profile_photo?: string;
  join_date?: string | null;
  subscriptions?: Subscription[];
};
