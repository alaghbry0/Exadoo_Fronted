import { beginCell, Address, toNano } from '@ton/core';
import { TonConnectUI } from '@tonconnect/ui-react';
import { useUserStore } from '../stores/zustand/userStore'; // ✅ استيراد userStore لاستخدام بيانات المستخدم

// ✅ تعريف واجهة JettonBalance (مثال - قد تحتاج إلى تعديلها بناءً على وثائق TonAPI)
interface JettonBalance {
    balance: string;
    wallet_address: {
        address: string;
    };
    jetton: {
        symbol: string;
        decimals: number;
        name: string;
    };
}

interface JettonApiResponse {
    balances: JettonBalance[];
}


// ✅ تحديث getUserJettonWallet لاستخدام v2 من TonAPI (بدون تغيير)
export const getUserJettonWallet = async (userTonAddress: string) => {
    // ... (نفس الكود السابق لـ getUserJettonWallet) ...
    try {
        const response = await fetch(`https://tonapi.io/v2/accounts/${userTonAddress}/jettons`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data: JettonApiResponse = await response.json(); // ✅ تحديد نوع البيانات هنا

        // ✅ البحث عن محفظة USDT باستخدام `symbol: "USD₮"`
        const usdtJetton = data.balances.find(
            (jetton: JettonBalance) => jetton.jetton.symbol === "USD₮" // ✅ تحديد نوع jetton هنا
        );

        if (!usdtJetton) {
            console.warn("🚨 المستخدم لا يملك محفظة USDT على TON.");
            return null;
        }

        console.log(`✅ User USDT Wallet Address: ${usdtJetton.wallet_address.address}`);
        return usdtJetton.wallet_address.address;
    } catch (error) {
        console.error("❌ Error fetching User Jetton Wallet:", error);
        return null;
    }
};

// ✅ تحديث getBotJettonWallet لاستخدام v2 من TonAPI (بدون تغيير)
export const getBotJettonWallet = async (botTonAddress: string) => {
    // ... (نفس الكود السابق لـ getBotJettonWallet) ...
    try {
        const response = await fetch(`https://tonapi.io/v2/accounts/${botTonAddress}/jettons`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data: JettonApiResponse = await response.json(); // ✅ تحديد نوع البيانات هنا

        // ✅ البحث عن محفظة USDT باستخدام `symbol: "USD₮"`
        const usdtJetton = data.balances.find(
            (jetton: JettonBalance) => jetton.jetton.symbol === "USD₮" // ✅ تحديد نوع jetton هنا
        );

        if (!usdtJetton) {
            console.warn("🚨 البوت لا يملك محفظة USDT على TON.");
            return null;
        }

        console.log(`✅ Bot USDT Wallet Address: ${usdtJetton.wallet_address.address}`);
        return usdtJetton.wallet_address.address;
    } catch (error) {
        console.error("❌ Error fetching Bot Jetton Wallet:", error);
        return null;
    }
};

// ✅ تحديث createJettonTransferPayload لتضمين بيانات المستخدم في payload
export const createJettonTransferPayload = (
    recipientAddress: string | null,
    amount: bigint,
    planId: string, // ✅ إضافة planId كمعامل
    telegramId: string | null, // ✅ إضافة telegramId كمعامل
    telegramUsername: string | null, // ✅ إضافة telegramUsername كمعامل
    fullName: string | null, // ✅ إضافة fullName كمعامل
    userWallet: string | null, // ✅ إضافة userWallet كمعامل
    paymentId: string // ✅ إضافة paymentId كمعامل
) => {
    if (!recipientAddress) {
        throw new Error("❌ recipientAddress مفقود أو غير صالح");
    }

    if (!planId) {
        throw new Error("❌ planId مفقود"); // ✅ التحقق من وجود planId
    }

    if (!telegramId) {
        throw new Error("❌ telegramId مفقود"); // ✅ التحقق من وجود telegramId
    }


    try {
        console.log(`✅ إنشاء حمولة تحويل Jetton للمستلم: ${recipientAddress}`);

        const recipientTonAddress = Address.parse(recipientAddress);

        // ✅ إنشاء Payment ID فريد
        const uniquePaymentId = paymentId;

        // ✅ تخزين البيانات الإضافية في Cell
        const additionalDataCell = beginCell()
            .storeStringTail(planId)         // ✅ نوع الخطة
            .storeStringTail(telegramId || "")     // ✅ معرف تيليجرام (التعامل مع null)
            .storeStringTail(telegramUsername || "") // ✅ اسم المستخدم على تيليجرام (التعامل مع null)
            .storeStringTail(fullName || "")       // ✅ الاسم الكامل للمستخدم (التعامل مع null)
            .storeStringTail(userWallet || "")     // ✅ عنوان محفظة المستخدم (التعامل مع null)
            .storeStringTail(uniquePaymentId)     // ✅ Payment ID فريد
            .storeUint(Math.floor(Date.now() / 1000), 32) // ✅ الطابع الزمني للمعاملة
            .endCell();


        return beginCell()
            .storeUint(0xf8a7ea5, 32) // OP Code لتحويل Jetton
            .storeUint(0, 64) // Query ID
            .storeCoins(amount) // المبلغ بوحدات nanoJettons
            .storeAddress(recipientTonAddress) // عنوان المستلم
            .storeAddress(null) // عدم تحديد response_destination
            .storeBit(1) // تحديد أن هناك custom_payload
            .storeRef(additionalDataCell) // تضمين البيانات الإضافية
            .endCell()
            .toBoc()
            .toString("base64");
    } catch (error) {
        console.error("❌ خطأ أثناء إنشاء حمولة تحويل Jetton:", error);
        throw new Error("❌ فشل إنشاء حمولة تحويل Jetton");
    }
};

// ✅ تصحيح تعريف handleTonPayment ليتوافق مع نوع setTariffId من Zustand
export const handleTonPayment = async (
    tonConnectUI: TonConnectUI,
    setPaymentStatus: React.Dispatch<React.SetStateAction<string | null>>,
    setTariffId: (tariffId: string | null) => void, // ✅ تم التصحيح:  (tariffId: string | null) => void
    planId: number
) => {
    if (typeof setPaymentStatus !== "function" || typeof setTariffId !== "function") {
        console.error("❌ دوال الحالة غير صالحة!");
        return;
    }

    setPaymentStatus("pending");

    try {
        console.log("🚀 بدء عملية دفع USDT...");

        const userTonAddress = tonConnectUI.account?.address;
        if (!userTonAddress) {
            console.error("❌ لم يتم العثور على محفظة TON متصلة!");
            setPaymentStatus("failed");
            return;
        }

        console.log(`✅ عنوان محفظة المستخدم: ${userTonAddress}`);

        const userJettonWallet = await getUserJettonWallet(userTonAddress);
        if (!userJettonWallet) {
            console.warn("🚨 المستخدم لا يملك محفظة USDT على TON.");
            setPaymentStatus("failed");
            return;
        }

        console.log(`✅ عنوان محفظة USDT الخاصة بالمستخدم: ${userJettonWallet}`);

        const botTonAddress = "UQA5RdmmK3KM7nR9YyVc4gsAYnw-rN_bM9x2IIpwKONMByoa";
        const recipientJettonWalletAddress = await getBotJettonWallet(botTonAddress);
        if (!recipientJettonWalletAddress) {
            console.error("❌ لم يتمكن من جلب عنوان محفظة USDT الخاصة بالبوت.");
            setPaymentStatus("failed");
            return;
        }

        console.log(`✅ عنوان محفظة USDT الخاصة بالبوت: ${recipientJettonWalletAddress}`);

        // تحويل المبلغ إلى nanoJettons (1 USDT = 1,000,000 NanoJettons)
        const USDT_AMOUNT = 0.1; // ✅ الآن القيمة هي 0.1 USDT
        const amountInNanoJettons = BigInt(USDT_AMOUNT * 10 ** 6); // ✅ التحويل الصحيح
        const gasFee = toNano('0.01').toString(); // 0.05 TON لرسوم الغاز

        if (amountInNanoJettons <= 0) {
            console.error(`❌ مبلغ غير صالح بالـ nanoJettons: ${amountInNanoJettons}`);
            setPaymentStatus("failed");
            return;
        }

        console.log("🔍 بيانات الدفع:", {
            USDT_AMOUNT,
            amountInNanoJettons,
            userJettonWallet,
            recipientJettonWalletAddress
        });

        try {
            console.log(`✅ إنشاء حمولة تحويل Jetton للمستلم: ${recipientJettonWalletAddress}`);

            // ✅ استرجاع بيانات المستخدم من Zustand Store
            const userStore = useUserStore.getState();
            const telegramId = userStore.telegramId;
            const telegramUsername = userStore.telegramUsername;
            const fullName = userStore.fullName;
            const userWallet = userTonAddress; // ✅ استخدام userTonAddress هنا

            // ✅ إنشاء Payment ID فريد
            const paymentId = `USDT_PAYMENT_${Date.now()}`;


            // ✅ استدعاء createJettonTransferPayload مع جميع البيانات
            const payloadBase64 = createJettonTransferPayload(
                recipientJettonWalletAddress,
                amountInNanoJettons,
                planId.toString(), // ✅ تمرير planId
                telegramId,         // ✅ تمرير telegramId
                telegramUsername,     // ✅ تمرير telegramUsername
                fullName,           // ✅ تمرير fullName
                userWallet,         // ✅ تمرير userWallet
                paymentId           // ✅ تمرير paymentId
            );


            console.log("🔹 Payload Base64:", payloadBase64);

            const transaction = {
                validUntil: Math.floor(Date.now() / 1000) + 600, // صلاحية 10 دقائق
                messages: [
                    {
                        address: userJettonWallet, // محفظة المستخدم الخاصة بـ USDT
                        amount: gasFee, // رسوم الغاز المطلوبة لتنفيذ المعاملة
                        payload: payloadBase64
                    }
                ]
            };

            console.log("🔹 بيانات المعاملة:", JSON.stringify(transaction, null, 2));
            console.log("🚀 إرسال المعاملة...");

            await tonConnectUI.sendTransaction(transaction);
            setPaymentStatus("success");
            console.log("✅ تم الدفع بنجاح باستخدام USDT!");

            setTariffId(planId.toString()); // ✅ استخدام planId.toString() للتناسق
            console.log("✅ معرف التعريفة بعد الدفع:", planId);
        } catch (error: unknown) { // ✅ تعديل نوع الخطأ هنا إلى any أو unknown أو Error
            console.error("❌ فشل الدفع:", error);
            setPaymentStatus("failed");
        }
    } catch (error) {
        console.error("❌ خطأ أثناء عملية دفع USDT:", error);
        setPaymentStatus("failed");
    }
};