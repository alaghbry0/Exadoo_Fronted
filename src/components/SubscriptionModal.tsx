// src/components/SubscriptionModal.tsx
'use client'
import { motion } from 'framer-motion'
import { FiX } from 'react-icons/fi'
import { useState, useEffect } from 'react'
import { useTelegramPayment } from '../hooks/useTelegramPayment'
import { useTelegram } from '../context/TelegramContext'
import SubscriptionPlanCard from '../components/SubscriptionModal/SubscriptionPlanCard'
import PaymentButtons from '../components/SubscriptionModal/PaymentButtons'
import { useTonConnectUI } from '@tonconnect/ui-react';
import { useUserStore } from '../stores/zustand/userStore';

// استيراد الدوال من utils
import { handleTonPayment } from '../utils/tonPayment';

// استيراد Zustand Stores
import { useTariffStore } from '../stores/zustand';
import { useProfileStore } from '../stores/profileStore';
import { useSessionStore } from '../stores/sessionStore';

type SubscriptionPlan = {
    id: number;
    name: string;
    price: string;
    description: string;
    features: string[];
    color: string;
}

const SubscriptionModal = ({ plan, onClose }: { plan: SubscriptionPlan | null; onClose: () => void }) => {
    const { handleTelegramStarsPayment } = useTelegramPayment();
    const { telegramId } = useTelegram();
    const { telegramUsername, fullName } = useUserStore();
    const [loading, setLoading] = useState(false);
    const [isTelegramAvailable, setIsTelegramAvailable] = useState(false);
    const [tonConnectUI] = useTonConnectUI();
    const [paymentStatus, setPaymentStatus] = useState<string | null>('idle');

    // استخدام Zustand Stores
    const { setTariffId } = useTariffStore();
    useProfileStore();
    useSessionStore();

    useEffect(() => {
        console.log("🔍 Zustand Stores:", {
            TariffStore: useTariffStore.getState(),
            ProfileStore: useProfileStore.getState(),
            SessionStore: useSessionStore.getState()
        });
    }, []);

    useEffect(() => {
        if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
            setIsTelegramAvailable(true);
        }
    }, []);

    useEffect(() => {
        console.log("🔍 Checking Telegram ID:", telegramId);
    }, [telegramId]);

    const showTelegramAlert = (message: string, callback?: () => void) => {
        if (isTelegramAvailable && window.Telegram?.WebApp?.showAlert) {
            window.Telegram.WebApp.showAlert(message, callback);
        } else {
            alert(message);
            callback?.();
        }
    };

    const handlePayment = async () => {
        if (!plan) return;

        try {
            setLoading(true);
            setTariffId(plan.id?.toString() ?? null);
            await handleTelegramStarsPayment(plan.id, parseFloat(plan.price.replace(/[^0-9.]/g, '')));
        } catch (error) {
            console.error("❌ خطأ أثناء عملية الدفع:", error);
            showTelegramAlert('❌ فشلت عملية الدفع: ' + (error instanceof Error ? error.message : 'خطأ غير معروف'));
        } finally {
            setLoading(false);
            console.log("📢 Tariff Store بعد الدفع (Telegram Stars):", useTariffStore.getState().tariffId);
        }
    };

    // ✅ استدعاء `handleTonPayment` مع تمرير البيانات، مع جعل `telegramId` والبيانات الأخرى اختيارية
    const handleTonPaymentWrapper = async () => {
        if (!plan) {
            console.error("❌ فشل استدعاء handleTonPaymentWrapper: الخطة غير متاحة!");
            showTelegramAlert("⚠️ يرجى تحديد خطة اشتراك قبل المتابعة.");
            return;
        }

        console.log("🟢 استدعاء handleTonPaymentWrapper...");
        console.log("🟢 البيانات المرسلة إلى handleTonPayment:", {
            tariffId: plan.id.toString(),
            telegramId: telegramId || "غير متوفر",
            telegramUsername: telegramUsername || "غير متوفر",
            fullName: fullName || "غير متوفر"
        });

        await handleTonPayment(
            tonConnectUI,
            setPaymentStatus,
            setTariffId,
            plan.id.toString(),
            telegramId || "unknown_user",  // ✅ تعيين معرف افتراضي في حالة عدم توفر `telegramId`
            telegramUsername || "unknown_username",  // ✅ تعيين اسم مستخدم افتراضي
            fullName || "Unknown User"  // ✅ تعيين اسم كامل افتراضي
        );
    };

    return (
        <>
            {plan && (
                <motion.div
                    className="fixed inset-0 bg-black/25 backdrop-blur-sm z-50 flex justify-center items-end"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    dir="rtl"
                    style={{ direction: 'rtl', textAlign: 'right' }}
                >
                    <motion.div
                        className="bg-white rounded-t-2xl shadow-xl w-full max-w-lg mx-auto overflow-hidden"
                        style={{ height: '65vh', maxHeight: 'calc(180vh - 70px)', marginBottom: '59px', direction: 'rtl', textAlign: 'right' }}
                        initial={{ y: "100%" }}
                        animate={{ y: "0%" }}
                        exit={{ y: "100%" }}
                        transition={{ type: "spring", stiffness: 150, damping: 20 }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="bg-[#f8fbff] px-4 py-3 flex justify-between items-center border-b sticky top-0" style={{ direction: 'rtl' }}>
                            <button onClick={onClose} className="text-gray-500 hover:text-[#2390f1] transition-colors" style={{ marginLeft: 'auto', marginRight: '0' }}>
                                <FiX className="w-6 h-6" />
                            </button>
                            <h2 className="text-base font-semibold text-[#1a202c] text-right flex-1 pr-2" style={{ textAlign: 'right', direction: 'rtl' }}>{plan.name}</h2>
                        </div>

                        <SubscriptionPlanCard
                            plan={plan}
                            loading={loading}
                            telegramId={telegramId}
                            handlePayment={handlePayment}
                            handleTonPayment={handleTonPaymentWrapper}
                        />
                        <PaymentButtons
                            loading={loading}
                            telegramId={telegramId}
                            handlePayment={handlePayment}
                            handleTonPayment={handleTonPaymentWrapper}
                        />
                    </motion.div>
                </motion.div>
            )}
        </>
    )
}

export default SubscriptionModal;
