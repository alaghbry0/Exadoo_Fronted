export type ProductType =
  | 'signals_subscription'
  | 'course'
  | 'bundle'
  | 'buy_indicators'
  | 'utility_trading_panel';

export type Currency = 'USDT' | 'Stars';

export type PaymentMethod = 'USDT (TON)' | 'Telegram Stars';

export interface PaymentIntentRequest {
  webhookSecret: string;
  telegramId: number | string;
  telegramUsername?: string | null;
  fullName?: string | null;
  productType: ProductType;
  productId?: number;               // للمنتجات غير الاشتراك
  subscriptionPlanId?: number;      // للاشتراكات
  amount: number | string;          // المبلغ النهائي (بنفس عملة currency)
  currency: Currency;               // 'USDT' أو 'Stars'
  paymentMethod: PaymentMethod;     // مطابق لما في الباك
  extraMetadata?: {
    trading_view_id?: string;
    forex_addresses?: string[];
    [k: string]: any;
  }; 
}

export interface PaymentIntentResponse {
  success: boolean;
  payment_token?: string;
  payment_identifier?: string;
  amount?: string;
  currency?: Currency;
  payment_method?: PaymentMethod;
  error?: string;
}

export interface TelegramInvoiceCreateRequest {
  telegram_id: number;
  amount: number; // بالـ XTR (سنتات Stars)
  payment_token: string;
  // بيانات اختيارية لتوليد عنوان ووصف الفاتورة
  title?: string;
  description?: string;
  // payload عام يذهب للـ invoice_payload
  payload?: Record<string, any>;
}

export interface ExchangeDetails {
  depositAddress: string;
  amount: string;
  network: string;
  paymentToken: string;
  title?: string;
}
