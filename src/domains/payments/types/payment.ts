import type {
  SubscriptionPlan,
  SubscriptionOption,
} from "@/domains/subscriptions/types";

export type PaymentStatus =
  | "idle"
  | "pending"
  | "usdt_pending"
  | "stars_pending"
  | "processing"
  | "processing_usdt"
  | "processing_stars"
  | "success"
  | "failed"
  | "exchange_success";

export interface SubscriptionPlanExtended extends SubscriptionPlan {
  selectedOption: SubscriptionOption;
}
