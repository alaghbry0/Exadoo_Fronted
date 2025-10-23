// src/components/SubscriptionModal/useSubscriptionPayment.tsx
"use client";
import { useEffect, useState, useCallback, useRef } from "react";
import { useTelegramPayment } from "@/hooks/useTelegramPayment";
import { useTonConnectUI } from "@tonconnect/ui-react";
import { useUserStore } from "@/stores/zustand/userStore";
import { handleTonPayment } from "@/utils/tonPayment";
import { useTelegram } from "@/context/TelegramContext";
import type { ModalPlanData } from "@/types/modalPlanData";
import type { PaymentStatus } from "@/types/payment";
import { useQueryClient } from "@tanstack/react-query";
import { useTariffStore } from "@/stores/zustand";
import { showToast } from "@/components/ui/showToast";
import { createPaymentIntent } from "@/utils/paymentIntent";

export const useSubscriptionPayment = (
  plan: ModalPlanData | null,
  onSuccess: () => void,
) => {
  const { handleTelegramStarsPayment } = useTelegramPayment();
  const { telegramId } = useTelegram();
  const { telegramUsername, fullName } = useUserStore();
  const [tonConnectUI] = useTonConnectUI();
  const queryClient = useQueryClient();

  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>("idle");
  const [loading, setLoading] = useState<boolean>(false);
  const [exchangeDetails, setExchangeDetails] = useState<{
    depositAddress: string;
    amount: string;
    network: string;
    paymentToken: string;
    planName?: string;
  } | null>(null);
  const [isInitializing, setIsInitializing] = useState(false);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const paymentSessionRef = useRef<{ paymentToken?: string; planId?: string }>(
    {},
  );

  const cleanupPaymentSession = useCallback(() => {
    localStorage.removeItem("paymentData");
    paymentSessionRef.current = {};
    setExchangeDetails(null);
  }, []);

  const resetPaymentStatus = useCallback(() => {
    setPaymentStatus("idle");
    cleanupPaymentSession();
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
  }, [cleanupPaymentSession]);

  const handlePaymentSuccess = useCallback(() => {
    cleanupPaymentSession();
    setPaymentStatus("success");
    queryClient.invalidateQueries({
      queryKey: ["subscriptions", telegramId || ""],
    });
    onSuccess();
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
  }, [cleanupPaymentSession, queryClient, telegramId, onSuccess]);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (paymentStatus === "processing") {
        e.preventDefault();
        e.returnValue = "لديك عملية دفع قيد التقدم، هل أنت متأكد من المغادرة؟";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [paymentStatus]);

  const restoreSession = useCallback(async () => {
    if (!plan || paymentStatus !== "idle") return;
    setIsInitializing(true);
    try {
      const savedData = localStorage.getItem("paymentData");
      if (!savedData) return;
      const { paymentToken, planId, timestamp } = JSON.parse(savedData);
      if (Date.now() - timestamp > 30 * 60 * 1000)
        return localStorage.removeItem("paymentData");
      if (planId !== plan.selectedOption.id.toString())
        return localStorage.removeItem("paymentData");
      if (paymentToken) handlePaymentSuccess();
    } catch (error) {
      console.error("فشل في استعادة الجلسة:", error);
      showToast.error("تعذر استعادة جلسة الدفع، يرجى البدء من جديد");
      localStorage.removeItem("paymentData");
    } finally {
      setIsInitializing(false);
    }
  }, [plan, paymentStatus, handlePaymentSuccess]);

  useEffect(() => {
    restoreSession();
  }, [restoreSession]);

  useEffect(() => {
    if (paymentStatus === "exchange_success") {
      const timer = setTimeout(() => onSuccess(), 2000);
      return () => clearTimeout(timer);
    }
  }, [paymentStatus, onSuccess]);

  const startPollingPaymentStatus = useCallback(
    (paymentToken: string) => {
      if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);
      const pollStatus = async () => {
        try {
          const res = await fetch(
            `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/payment/status?token=${paymentToken}`,
          );
          if (!res.ok) throw new Error(res.statusText);
          const data = await res.json();
          if (data.status === "exchange_success") {
            setPaymentStatus("exchange_success");
            localStorage.setItem(
              "paymentData",
              JSON.stringify({
                paymentToken,
                planId: plan?.selectedOption.id.toString(),
                status: "exchange_success",
                timestamp: Date.now(),
              }),
            );
            if (pollingIntervalRef.current) {
              clearInterval(pollingIntervalRef.current);
              pollingIntervalRef.current = null;
            }
          }
        } catch (e) {
          console.error("خطأ في استطلاع حالة الدفع:", e);
        }
      };
      pollStatus();
      pollingIntervalRef.current = setInterval(pollStatus, 3000);
    },
    [plan],
  );

  // USDT: كل الحالات تبدأ بـ create-intent
  const handleUsdtPaymentChoice = useCallback(
    async (method: "wallet" | "exchange"): Promise<boolean> => {
      if (!plan || !telegramId) return false;
      setLoading(true);
      try {
        const price = Number(plan.selectedOption.price);
        if (Number.isNaN(price)) throw new Error("سعر غير صالح");

        // 1) create-intent
        const intent = await createPaymentIntent({
          webhookSecret: process.env.NEXT_PUBLIC_WEBHOOK_SECRET as string,
          telegramId,
          telegramUsername,
          fullName,
          productType: "signals_subscription",
          subscriptionPlanId: plan.selectedOption.id,
          amount: price, // USDT
          currency: "USDT",
          paymentMethod: "USDT (TON)",
          extraMetadata: {}, // لو احتجت بيانات إضافية لاحقًا
        });

        if (!intent.success || !intent.payment_token) {
          showToast.error(intent.error || "فشل إنشاء نية الدفع");
          setPaymentStatus("failed");
          return false;
        }

        paymentSessionRef.current = {
          paymentToken: intent.payment_token,
          planId: plan.selectedOption.id.toString(),
        };
        localStorage.setItem(
          "paymentData",
          JSON.stringify({
            paymentToken: intent.payment_token,
            planId: plan.selectedOption.id.toString(),
            timestamp: Date.now(),
          }),
        );

        if (method === "wallet") {
          // 2) دفع محفظة TON
          await handleTonPayment(
            tonConnectUI,
            setPaymentStatus,
            intent.payment_token,
            price,
            String(telegramId),
            telegramUsername || "unknown",
            fullName || "Unknown",
          );
          return true;
        } else {
          // 2) مسار الإيداع عبر منصة/Exchange
          setExchangeDetails({
            depositAddress:
              useTariffStore.getState().walletAddress || "TON-ADDRESS",
            amount: String(price),
            network: "TON Network",
            paymentToken: intent.payment_token,
            planName: plan.name,
          });
          setPaymentStatus("processing");
          startPollingPaymentStatus(intent.payment_token);
          return true;
        }
      } catch (error: any) {
        console.error("خطأ في عملية الدفع:", error);
        setPaymentStatus("failed");
        showToast.error(error?.message || "فشلت عملية الدفع");
        return false;
      } finally {
        setLoading(false);
      }
    },
    [
      plan,
      telegramId,
      telegramUsername,
      fullName,
      startPollingPaymentStatus,
      tonConnectUI,
    ],
  );

  // Stars: عبر الهوك الموحّد
  const handleStarsPayment = async () => {
    if (
      !plan ||
      !telegramId ||
      plan.selectedOption.telegramStarsPrice == null
    ) {
      return showToast.error("بيانات غير مكتملة للدفع بالنجوم");
    }
    try {
      setLoading(true);
      setPaymentStatus("processing_stars");

      const starsAmount = Math.round(
        Number(plan.selectedOption.price) *
          Number(plan.selectedOption.telegramStarsPrice),
      );
      const { paymentToken, error } = await handleTelegramStarsPayment({
        productType: "signals_subscription",
        subscriptionPlanId: plan.selectedOption.id,
        productId: undefined,
        starsAmount,
        title: "اشتراك إشارات",
        description: `تجديد/شراء اشتراك: ${plan.selectedOption.duration}`,
        payloadExtra: { planId: plan.selectedOption.id },
        telegramUsername,
        fullName,
      });

      if (paymentToken) {
        handlePaymentSuccess();
      } else {
        setPaymentStatus("failed");
        if (error) showToast.error(error);
      }
    } catch (e: any) {
      console.error("Stars payment failed:", e);
      setPaymentStatus("failed");
      showToast.error(e?.message || "فشلت عملية الدفع بالنجوم");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!exchangeDetails && paymentStatus === "processing")
      setPaymentStatus("idle");
  }, [exchangeDetails, paymentStatus]);

  useEffect(() => {
    return () => {
      if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);
    };
  }, []);

  return {
    paymentStatus,
    loading,
    exchangeDetails,
    setExchangeDetails,
    isInitializing,
    handleUsdtPaymentChoice,
    handleStarsPayment,
    resetPaymentStatus,
    cleanupPaymentSession,
  };
};
