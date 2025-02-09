'use client'
import { motion } from 'framer-motion' // ✅ Remove AnimatePresence import
import { FiX } from 'react-icons/fi'
import { useState, useEffect } from 'react' // ✅ Remove useContext import
import { useTelegramPayment } from '../hooks/useTelegramPayment'
import { useTelegram } from '../context/TelegramContext'
import SubscriptionPlanCard from '../components/SubscriptionModal/SubscriptionPlanCard'
import PaymentButtons from '../components/SubscriptionModal/PaymentButtons'
import { useTonConnectUI, TonConnectUIProvider as TCUIProvider } from '@tonconnect/ui-react';

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

export const SubscriptionModalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    return (
        <TCUIProvider manifestUrl="https://exadooo-git-main-main-mohammeds-projects-3d2877c6.vercel.app/tonconnect-manifest.json">
            {children}
        </TCUIProvider>
    );
};


const SubscriptionModal = ({ plan, onClose }: { plan: SubscriptionPlan | null; onClose: () => void }) => {
    const { handleTelegramStarsPayment } = useTelegramPayment()
    const { telegramId } = useTelegram()
    const [loading, setLoading] = useState(false)
    const [isTelegramAvailable, setIsTelegramAvailable] = useState(false)
    const [tonConnectUI, _] = useTonConnectUI() as [TonConnectUI, any];
    const [, setPaymentStatus] = useState('idle');

    // استخدام Zustand Stores
    const { setTariffId } = useTariffStore();
    const [, , ] = useProfileStore();
    const [, , ] = useSessionStore();

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

    const handleTonPayment = async () => {
        setPaymentStatus('pending'); // ✅ Keep setPaymentStatus as it's used in handleTonPayment
        try {
            const transaction = {
                validUntil: 1739029805,
                messages: [
                    {
                        address: "UQAWb4x9KVxA51hf0rq5iRSOJRG13g_UeMTEuUELub_iy6cp",
                        amount: "5000000",
                        payload: "te6ccsEBAQEADAAMABQAAAAASGVsbG8hCaTc/g=="
                    }
                ]
            };


            tonConnectUI.sendTransaction({
                messages: transaction.messages,
                validUntil: transaction.validUntil,
                onSuccess: () => {
                    setPaymentStatus('success'); // ✅ Keep setPaymentStatus as it's used in handleTonPayment
                    showTelegramAlert('✅ تم الدفع بنجاح مبدئيًا!');
                    // ✅ هنا، عند نجاح الدفع بـ TON، قم بتعيين tariffId أيضًا
                    setTariffId(plan.id?.toString()  ?? null); // Use optional chaining and nullish coalescing
                    // ✅ تعديل console.log لعرض tariffId بعد الدفع (TON)
                    console.log("Tariff Store بعد الدفع (TON): Tariff ID =", useTariffStore.getState().tariffId);
                },
                onError: (error) => {
                    setPaymentStatus('failed'); // ✅ Keep setPaymentStatus as it's used in handleTonPayment
                    showTelegramAlert(`❌ فشل الدفع: ${error.message}`);
                },
                onCancel: () => {
                    setPaymentStatus('idle'); // ✅ Keep setPaymentStatus as it's used in handleTonPayment
                    showTelegramAlert('⚠️ تم إلغاء الدفع.');
                }
            });

        } catch (error) {
            console.error("❌ خطأ أثناء بدء دفع TON:", error);
            setPaymentStatus('failed'); // ✅ Keep setPaymentStatus as it's used in handleTonPayment
            showTelegramAlert("❌ فشل بدء دفع TON. يرجى المحاولة مرة أخرى.");
        }
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
                        />
                        <PaymentButtons
                            loading={loading}
                            telegramId={telegramId}
                            handlePayment={handlePayment}
                            handleTonPayment={handleTonPayment}
                        />
                    </motion.div>
                </motion.div>
            )}
        </>
    )
}

export default SubscriptionModal