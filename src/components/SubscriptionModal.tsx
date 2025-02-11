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

// حذف الأسطر غير المستخدمة
// import { Cell, Address } from '@ton/core';

// استيراد الدوال من الملف الجديد
import { handleTonPayment } from '../utils/tonPayment'; // ✅ استيراد handleTonPayment من الملف الجديد

// استيراد Zustand Stores التي قمنا بإنشائها
import { useTariffStore } from '../stores/zustand';
import { useProfileStore } from '../stores/profileStore';
import { useSessionStore } from '../stores/sessionStore';


type SubscriptionPlan = {
    id: number
    name: string
    price: string
    description: string
    features: string[]
    color: string
}


const SubscriptionModal = ({ plan, onClose }: { plan: SubscriptionPlan | null; onClose: () => void }) => {
    const { handleTelegramStarsPayment } = useTelegramPayment()
    const { telegramId } = useTelegram()
    const [loading, setLoading] = useState(false)
    const [isTelegramAvailable, setIsTelegramAvailable] = useState(false)
   const [tonConnectUI] = useTonConnectUI();
    const [, setPaymentStatus] = useState<string | null>('idle'); // ✅ إزالة paymentStatus من التعريف (متغير غير مستخدم) - تم التعليق مؤقتًا



    // استخدام Zustand Stores
    const { setTariffId } = useTariffStore();
    useProfileStore();
    useSessionStore();

    useEffect(() => {
        // ✅ تعديل console.log لعرض حالة Zustand Store كـ JSON stringified
        console.log("Tariff Store:", JSON.stringify(useTariffStore.getState()));
        console.log("Profile Store:", JSON.stringify(useProfileStore.getState()));
        console.log("Session Store:", JSON.stringify(useSessionStore.getState()));
    }, []);


    useEffect(() => {
        if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
            setIsTelegramAvailable(true)
        }
    }, [])

    const showTelegramAlert = (message: string, callback?: () => void) => {
        if (isTelegramAvailable && window.Telegram?.WebApp?.showAlert) {
            window.Telegram.WebApp.showAlert(message, callback)
        } else {
            alert(message)
            callback?.()
        }
    }

    const handlePayment = async () => {
        if (!plan || !telegramId) return

        try {
            setLoading(true)
            // ✅ هنا، قبل استدعاء handleTelegramStarsPayment، قم بتعيين tariffId في Zustand Store
            setTariffId(plan.id?.toString() ?? null); // Use optional chaining and nullish coalescing
            await handleTelegramStarsPayment(plan.id, parseFloat(plan.price.replace(/[^0-9.]/g, '')))
        } catch (error) {
            console.error("❌ خطأ أثناء عملية الدفع:", error)
            showTelegramAlert('❌ فشلت عملية الدفع: ' + (error instanceof Error ? error.message : 'خطأ غير معروف'))
        } finally {
            setLoading(false)
            // ✅ تعديل console.log لعرض tariffId بعد الدفع (Telegram Stars)
            console.log("Tariff Store بعد الدفع (Telegram Stars): Tariff ID =", useTariffStore.getState().tariffId);
        }
    }


    // ✅ استبدال استدعاء handleTonPayment بالدالة المستوردة من utils/tonPayment.ts
    const handleTonPaymentWrapper = async () => {
    if (!plan || !telegramId) return; // ✅ تحقق من plan و telegramId
    await handleTonPayment(
        tonConnectUI,
        setPaymentStatus,  // ✅ تمرير دالة تحديث الحالة الصحيحة
        setTariffId,
        plan.id // ✅ تمرير plan.id  <- ✅✅✅  تأكد من تمرير plan.id هنا عند الاستدعاء
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
                >
                    <motion.div
                        className="bg-white rounded-t-2xl shadow-xl w-full max-w-lg mx-auto overflow-hidden"
                        style={{ height: '65vh', maxHeight: 'calc(180vh - 70px)', marginBottom: '59px' }}
                        initial={{ y: "100%" }}
                        animate={{ y: "0%" }}
                        exit={{ y: "100%" }}
                        transition={{ type: "spring", stiffness: 150, damping: 20 }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="bg-[#f8fbff] px-4 py-3 flex justify-between items-center border-b sticky top-0">
                            <button onClick={onClose} className="text-gray-500 hover:text-[#2390f1] transition-colors">
                                <FiX className="w-6 h-6" />
                            </button>
                            <h2 className="text-base font-semibold text-[#1a202c] text-right flex-1 pr-2">{plan.name}</h2>
                        </div>

                        <SubscriptionPlanCard
                            plan={plan}
                            loading={loading}
                            telegramId={telegramId}
                            handlePayment={handlePayment}
                            handleTonPayment={handleTonPaymentWrapper} // ✅ استدعاء الدالة wrapper هنا
                        />
                        <PaymentButtons
                            loading={loading}
                            telegramId={telegramId}
                            handlePayment={handlePayment}
                            handleTonPayment={handleTonPaymentWrapper} // ✅ استدعاء الدالة wrapper هنا
                        />
                    </motion.div>
                </motion.div>
            )}
        </>
    )
}

export default SubscriptionModal