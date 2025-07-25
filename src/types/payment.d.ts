// في ملف src/types/payment.d.ts
export type PaymentStatus =
  | 'idle'
  | 'pending'
  | 'usdt_pending'
  | 'stars_pending'
  | 'processing'
  | 'processing_usdt'
  | 'processing_stars' 
  | 'success'
  | 'failed'
  | 'exchange_success';

export interface SubscriptionPlanExtended extends SubscriptionPlan {
  selectedOption: {
    id: number;
    price: string;
    duration: string;
    telegramStarsPrice: number;
  };
  features: string[];
}
