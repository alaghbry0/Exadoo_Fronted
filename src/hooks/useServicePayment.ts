// src/hooks/useServicePayment.ts
'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useTonConnectUI } from '@tonconnect/ui-react';
import { useTelegram } from '@/context/TelegramContext';
import { useUserStore } from '@/stores/zustand/userStore';
import { useTariffStore } from '@/stores/zustand';
import { showToast } from '@/components/ui/showToast';
import { createPaymentIntent } from '@/utils/paymentIntent';
import { handleTonPayment } from '@/utils/tonPayment';
import type { ProductType } from '@/types/payments';
import type { PaymentStatus } from '@/types/payment';

type UsdtMethod = 'wallet' | 'exchange';

export interface ServicePaymentInput {
  productType: ProductType;
  // واحد من الاثنين:
  subscriptionPlanId?: number; // لاشتراك الإشارات
  productId?: number;          // لباقي المنتجات
  // الأسعار:
  amountUsdt?: number;         // السعر بالـ USDT عند الدفع USDT
  amountStars?: number;        // السعر بالـ Stars (سنتات XTR) عند الدفع Stars
  // ميتاداتا اختيارية
  extraMetadata?: {
    trading_view_id?: string;
    forex_addresses?: string[];
    [k: string]: any;
  };
  // عناوين اختيارية للفاتورة (Stars)
  title?: string;
  description?: string;
  // اسم منتج/خطة للعرض في الواجهات
  displayName?: string;
}

export interface ExchangeDetails {
  depositAddress: string;
  amount: string;
  network: string;
  paymentToken: string;
  title?: string;
}

export function useServicePayment() {
  const [tonConnectUI] = useTonConnectUI();
  const { telegramId } = useTelegram();
  const { telegramUsername, fullName } = useUserStore();

  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('idle');
  const [loading, setLoading] = useState(false);
  const [exchangeDetails, setExchangeDetails] = useState<ExchangeDetails | null>(null);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const reset = useCallback(() => {
    setPaymentStatus('idle');
    setExchangeDetails(null);
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
  }, []);

  // polling لحالة الدفع (للتحويل عبر المنصّات)
  const startPollingPaymentStatus = useCallback((paymentToken: string, onExchangeSuccess?: () => void) => {
    if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);

    const poll = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/payment/status?token=${paymentToken}`);
        if (!res.ok) throw new Error(res.statusText);
        const data = await res.json();
        if (data.status === 'exchange_success') {
          setPaymentStatus('exchange_success');
          if (pollingIntervalRef.current) {
            clearInterval(pollingIntervalRef.current);
            pollingIntervalRef.current = null;
          }
          onExchangeSuccess?.();
        }
      } catch (e) {
        console.error('poll error:', e);
      }
    };

    poll();
    pollingIntervalRef.current = setInterval(poll, 3000);
  }, []);

  useEffect(() => {
    return () => {
      if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);
    };
  }, []);

  /**
   * دفع USDT:
   * - ينشئ Intent بـ currency='USDT'
   * - لو "wallet": يمرر payment_token + amount إلى handleTonPayment
   * - لو "exchange": يعرض شاشة التحويل ويبدأ Polling
   */
  const payWithUSDT = useCallback(
    async (
      method: UsdtMethod,
      input: ServicePaymentInput,
      opts?: { onWalletSuccess?: () => void; onExchangeSuccess?: () => void }
    ) => {
      if (!telegramId) {
        showToast.error('معرّف تيليجرام غير متوفر');
        return false;
      }

      if (!input.amountUsdt || Number.isNaN(Number(input.amountUsdt))) {
        showToast.error('سعر USDT غير صالح');
        return false;
      }

      // التأكد من المعرف المناسب حسب النوع
      const isSubscription = input.productType === 'signals_subscription';
      if (isSubscription && !input.subscriptionPlanId) {
        showToast.error('subscriptionPlanId مطلوب للاشتراك');
        return false;
      }
      if (!isSubscription && !input.productId) {
        showToast.error('productId مطلوب لهذا المنتج');
        return false;
      }

      try {
        setLoading(true);
        setPaymentStatus('processing_usdt');

        // 1) create-intent
        const intent = await createPaymentIntent({
          webhookSecret: process.env.NEXT_PUBLIC_WEBHOOK_SECRET as string,
          telegramId,
          telegramUsername,
          fullName,
          productType: input.productType,
          subscriptionPlanId: input.subscriptionPlanId,
          productId: input.productId,
          amount: Number(input.amountUsdt),
          currency: 'USDT',
          paymentMethod: 'USDT (TON)',
          extraMetadata: input.extraMetadata,
        });

        if (!intent.success || !intent.payment_token || !intent.amount) {
          showToast.error(intent.error || 'فشل إنشاء نية الدفع');
          setPaymentStatus('failed');
          return false;
        }

        const paymentToken = intent.payment_token;
        const amountUsdt = Number(intent.amount);

        if (method === 'wallet') {
          // 2) TonConnect wallet pay (لا نطلب الخادم هنا)
          const res = await handleTonPayment(
            tonConnectUI,
            setPaymentStatus,
            paymentToken,
            amountUsdt,                 // المبلغ النهائي من الـ intent
            String(telegramId),         // لمجرّد التسجيل/التوافق
            telegramUsername || 'unknown',
            fullName || 'Unknown'
          );
          if (res?.payment_token) {
            // المعاملة أُرسلت، وحالة الدفع ستُكمَّل من الباك
            opts?.onWalletSuccess?.();
            return true;
          }
          setPaymentStatus('failed');
          return false;
        } else {
          // 2) Exchange flow (عرض عنوان + memo = paymentToken)
          setExchangeDetails({
            depositAddress: useTariffStore.getState().walletAddress || 'TON-ADDRESS',
            amount: String(amountUsdt),
            network: 'TON Network',
            paymentToken,
            title: input.displayName || undefined,
          });
          setPaymentStatus('processing');
          startPollingPaymentStatus(paymentToken, opts?.onExchangeSuccess);
          return true;
        }
      } catch (e: any) {
        console.error('USDT pay failed:', e);
        setPaymentStatus('failed');
        showToast.error(e?.message || 'فشل الدفع');
        return false;
      } finally {
        setLoading(false);
      }
    },
    [telegramId, telegramUsername, fullName, tonConnectUI, startPollingPaymentStatus]
  );

  /**
   * دفع Telegram Stars:
   * - أنت غالبًا عندك useTelegramPayment مهيأ (موحد) — تقدر تمرّر له نفس المدخلات
   * - لو تفضل، تقدر تستدعيه من هنا (حقن اختياري عبر باراميتر).
   * هنا مبدئيًا بنرجّع false ونترك الاستدعاء للهوك المخصّص عندك (useTelegramPayment)
   * للحفاظ على الفصل. لكن وفّرنا واجهة موحّدة.
   */
  const payWithStars = useCallback(async (_input: ServicePaymentInput) => {
    showToast.error('استخدم useTelegramPayment لدفعات Stars (تم توحيده مسبقًا).');
    return false;
  }, []);

  return {
    // حالات
    paymentStatus,
    loading,
    exchangeDetails,
    // أفعال
    reset,
    payWithUSDT,
    payWithStars,
    // لو ودّك تستخدم الـ polling يدويًا
    startPollingPaymentStatus,
    setExchangeDetails,
    setPaymentStatus,
  };
}
