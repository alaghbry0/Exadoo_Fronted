// src/types/modalPlanData.ts
import type { DiscountDetails } from "../typesPlan";

export interface PlanOption {
  id: number;
  duration: string;
  price: string;
  originalPrice?: number | null;
  hasDiscount: boolean;
  telegramStarsPrice?: number;
  discountPercentage?: string;
  discountDetails?: DiscountDetails;
  isTrial?: boolean;
  trialDurationDays?: number; // عدد أيام الفترة التجريبية
  savings?: string;
}

export interface ModalPlanData {
  id: number;
  name: string;
  description: string;
  features: string[];
  isRecommended: boolean;
  termsAndConditions: string[];
  selectedOption: PlanOption;
  discountedPrice?: number;
}
