// في ملف src/types/payment.d.ts
export type PaymentStatus =
  | 'idle'
  | 'pending'
  | 'processing'
  | 'success'
  | 'failed';