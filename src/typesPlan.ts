import React from 'react'

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
