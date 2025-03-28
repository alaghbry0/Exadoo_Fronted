import React from 'react'

export type NotificationType = 'success' | 'error' | 'warning' | 'info' | 'processing'

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
  originalPrice?: number;
  savings?: string;
  telegramStarsPrice: number;
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
  icon: React.FC;
  backgroundPattern: string;
  usp: string;
  color: string;
  subscriptionOptions: SubscriptionOption[];
}

export type SubscriptionPlan = SubscriptionCard & {
  selectedOption: SubscriptionOption;
}
