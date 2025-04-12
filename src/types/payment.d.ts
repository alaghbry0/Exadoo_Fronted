// في ملف src/types/payment.d.ts
export type PaymentStatus =
  | 'idle'
  | 'pending'
  | 'processing'
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
