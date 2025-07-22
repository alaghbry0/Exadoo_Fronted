// src/typesPlan.ts
import React from 'react'

export type NotificationType = 
  | 'info'
  | 'success' 
  | 'warning'
  | 'error'
  | 'invite';

export type PaymentStatus = 'idle' | 'processing' | 'success' | 'failed' | 'exchange_success';

export interface ToastAction {
  text: string
  onClick: () => void
}

export interface Notification {
  id: string
  type: NotificationType
  message: string
  _seq?: number
  timestamp: number
  duration?: number
  invite_link?: string
  formatted_message?: string
  action?: ToastAction
}

export interface SubscriptionOption {
  id: number;
  duration: string;
  price: number | string;
  originalPrice?: number | null;
  discountedPrice?: number;
  discountPercentage?: number;
  hasDiscount: boolean;
  savings?: string;
  telegramStarsPrice: number;
}


export type SubscriptionPlan = SubscriptionCard & {
  selectedOption: SubscriptionOption;
}


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

// تعديل ApiSubscriptionType ليشمل group_id
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
  terms_and_conditions: string[]; // تأكد أن هذا موجود، يبدو أنه مفقود من تعريفك الحالي
  group_id: number | null; // <-- إضافة مهمة
  sort_order: number; // <-- إضافة مهمة
}


export interface ApiSubscriptionPlan {
  id: number;
  name: string;
  price: number;
  original_price: number; // إضافة حقل السعر الأصلي
  duration_days: number;
  subscription_type_id: number;
  telegram_stars_price: number;
  created_at: string;
  is_active: boolean;
}

// تعديل SubscriptionCard ليشمل group_id
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
  icon: React.ElementType;  // أو string إذا كنت ستستخدم اسم الأيقونة من API
  backgroundPattern: string;
  usp: string;
  color: string;
  subscriptionOptions: SubscriptionOption[];
  group_id: number | null; // <-- إضافة مهمة
  terms_and_conditions: string[]; // أضفت هذا هنا لأنه منطقي أن يكون لكل نوع اشتراك شروطه
}


