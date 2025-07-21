// types/modalPlanData.ts

export interface PlanOption {
  id: number;
  duration: string;
  price: string;
  originalPrice?: number | null;
  hasDiscount: boolean;
  telegramStarsPrice?: number;
  discountPercentage?: string;
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