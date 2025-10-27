// src/domains/subscriptions/types/subscriptionPlan.ts
import type { ElementType } from "react";

// ⭐ --- التعديل الأول ---
// سنجعل السعر نصًا ليتوافق مع الخادم والمكونات الأخرى
// وسنعدل نوع نسبة الخصم إلى رقم
export interface SubscriptionOption {
  id: number;
  duration: string;
  price: string;
  originalPrice?: number | null;
  discountPercentage?: string;
  hasDiscount: boolean;
  telegramStarsPrice: number;
  discountDetails?: DiscountDetails;
  // ⬅️ جديد
  isTrial?: boolean;
  trialDurationDays?: number; // عدد أيام الفترة التجريبية
  savings?: string;
}

export type SubscriptionPlan = SubscriptionCard & {
  selectedOption: SubscriptionOption;
};

export interface ApiSubscriptionGroup {
  id: number;
  name: string;
  description: string | null;
  image_url: string | null;
  color: string;
  icon: string;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface ApiSubscriptionType {
  id: number;
  name: string;
  description: string;
  features: string[];
  channel_id: number;
  image_url: string | null;
  is_active: boolean;
  created_at: string;
  usp: string;
  is_recommended?: boolean;
  terms_and_conditions: string[];
  group_id: number | null;
  sort_order: number;
}

// ⭐ --- التعديل الثاني ---
// إضافة خاصية next_price التي كانت مفقودة
export interface NextTierInfo {
  message: string;
  next_price?: string; // إضافة الخاصية المفقودة
}

export interface DiscountDetails {
  discount_id: number;
  discount_name: string | null;
  lock_in_price: boolean;
  is_tiered: boolean;
  has_limited_slots?: boolean;
  remaining_slots?: number | null;
  price_lock_duration_months?: number | null;
  next_tier_info?: NextTierInfo | null;
}

export interface ApiSubscriptionPlan {
  id: number;
  name: string;
  price: string;
  original_price: string | null;
  duration_days: number;
  subscription_type_id: number;
  telegram_stars_price: number;
  created_at: string;
  is_active: boolean;
  discount_details: DiscountDetails | null;
  // ⬅️ جديد: الخادم صار يرجع is_trial
  is_trial: boolean;
}

export interface SubscriptionCard {
  id: number;
  name: string;
  isRecommended: boolean;
  tagline: string;
  description: string;
  features: string[];
  primaryColor: string;
  accentColor: string;
  image_url: string | null;
  icon: ElementType;
  backgroundPattern: string;
  usp: string;
  color: string;
  subscriptionOptions: SubscriptionOption[];
  group_id: number | null;
  terms_and_conditions: string[];
}
