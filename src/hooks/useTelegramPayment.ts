'use client';
import { useState, useCallback } from 'react';
import { useTelegram } from '@/context/TelegramContext';
import { createPaymentIntent } from '@/utils/paymentIntent';
import { createTelegramInvoice } from '@/utils/telegramInvoice';
import type { ProductType } from '@/types/payments';

type PaymentResponse = { paymentToken?: string; error?: string };

export const useTelegramPayment = () => {
  const { telegramId } = useTelegram();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'paid' | 'failed' | 'processing' | null>(null);

  /**
   * يدعم أي منتج: نولّد Intent بـ currency='Stars' ثم ننشئ الفاتورة ونفتحها.
   */
  const handleTelegramStarsPayment = useCallback(
    async (params: {
      productType: ProductType;
      subscriptionPlanId?: number;  // للاشتراك
      productId?: number;           // لباقي المنتجات
      starsAmount: number;          // المبلغ بالـ Stars (سنتات XTR)
      title?: string;
      description?: string;
      payloadExtra?: Record<string, any>; // يُدمج داخل invoice_payload
      telegramUsername?: string | null;
      fullName?: string | null;
      extraMetadata?: { trading_view_id?: string; forex_addresses?: string[]; [k: string]: any };
    }): Promise<PaymentResponse> => {
      if (typeof window === 'undefined' || !window.Telegram?.WebApp) {
        return { error: 'Telegram WebApp not available' };
      }
      if (!telegramId) {
        const e = 'Missing telegramId';
        setError(e);
        return { error: e };
      }
      try {
        setLoading(true);
        setError(null);
        setPaymentStatus('pending');

        // 1) create-intent
        const intent = await createPaymentIntent({
          webhookSecret: process.env.NEXT_PUBLIC_WEBHOOK_SECRET as string,
          telegramId,
          telegramUsername: params.telegramUsername,
          fullName: params.fullName,
          productType: params.productType,
          subscriptionPlanId: params.subscriptionPlanId,
          productId: params.productId,
          amount: params.starsAmount,          // نفس القيمة ستُرسل للفاتورة
          currency: 'Stars',
          paymentMethod: 'Telegram Stars',
          extraMetadata: params.extraMetadata,
        });

        if (!intent.success || !intent.payment_token) {
          const e = intent.error || 'Failed to create intent';
          setError(e);
          setPaymentStatus('failed');
          return { error: e };
        }

        // 2) create-invoice
        const invoice = await createTelegramInvoice({
          telegram_id: Number(telegramId),
          amount: params.starsAmount, // بالـ XTR (سنتات)
          payment_token: intent.payment_token,
          title: params.title || 'شراء خدمة',
          description: params.description || 'دفع عبر Telegram Stars',
          payload: {
            productType: params.productType,
            productId: params.productId,
            subscriptionPlanId: params.subscriptionPlanId,
            // أي بيانات إضافية تحبها للـ payload:
            ...(params.payloadExtra || {}),
          },
        });
        if (invoice.error || !invoice.invoice_url) {
          const e = invoice.error || 'Failed to create invoice';
          setError(e);
          setPaymentStatus('failed');
          return { error: e };
        }

        // 3) فتح واجهة الدفع
        return await new Promise<PaymentResponse>((resolve) => {
          window.Telegram!.WebApp!.openInvoice(invoice.invoice_url!, (status: string) => {
            if (status === 'paid') {
              setPaymentStatus('processing');
              resolve({ paymentToken: intent.payment_token });
            } else {
              setPaymentStatus('failed');
              resolve({ error: `invoice status: ${status}` });
            }
          });
        });
      } catch (err: any) {
        setPaymentStatus('failed');
        const msg = err?.message || 'Unknown error';
        setError(msg);
        return { error: msg };
      } finally {
        setLoading(false);
      }
    },
    [telegramId]
  );

  return {
    handleTelegramStarsPayment,
    paymentState: { loading, error, paymentStatus, resetError: () => setError(null) },
  };
};
