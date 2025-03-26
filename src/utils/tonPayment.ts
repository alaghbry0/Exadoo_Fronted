-tonPayment.ts

import { beginCell, Address, toNano } from '@ton/core';
import { TonConnectUI } from '@tonconnect/ui-react';
import { useTariffStore } from '../stores/zustand';
import { PaymentStatus } from '@/types/payment';
import { showToast } from '../components/ui/Toast'

// واجهة تعريف JettonBalance (قد تحتاج إلى تعديلها بناءً على وثائق TonAPI)
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

/**
 * دالة جلب محفظة المستخدم (Jetton) باستخدام TonAPI v2.
 */
export const getUserJettonWallet = async (userTonAddress: string) => {
  try {
    const response = await fetch(`https://tonapi.io/v2/accounts/${userTonAddress}/jettons`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data: JettonApiResponse = await response.json();

    // البحث عن محفظة USDT باستخدام الرمز "USD₮"
    const usdtJetton = data.balances.find(
      (jetton: JettonBalance) => jetton.jetton.symbol === "USD₮"
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

/**
 * دالة جلب محفظة البوت (Jetton) باستخدام TonAPI v2.
 */
export const getBotJettonWallet = async (botTonAddress: string) => {
  try {
    const response = await fetch(`https://tonapi.io/v2/accounts/${botTonAddress}/jettons`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data: JettonApiResponse = await response.json();

    // البحث عن محفظة USDT باستخدام الرمز "USD₮"
    const usdtJetton = data.balances.find(
      (jetton: JettonBalance) => jetton.jetton.symbol === "USD₮"
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

/**
 * دالة إنشاء حمولة تحويل Jetton.
 * تم تعديل المعامل الثالث لاستقبال paymentToken بدلاً من orderId.
 */
export const createJettonTransferPayload = (
  recipientAddress: string | null,
  amount: bigint,
  paymentToken: string // استخدام paymentToken بدلاً من orderId
) => {
  if (!recipientAddress) {
    throw new Error("❌ recipientAddress مفقود أو غير صالح");
  }

  try {
    console.log(`✅ إنشاء حمولة تحويل Jetton للمستلم: ${recipientAddress}`);

    const recipientTonAddress = Address.parse(recipientAddress);
    // بناء الخلية الأساسية لتحويل Jetton وفق معيار TEP‑74
    const cellBuilder = beginCell()
      .storeUint(0xf8a7ea5, 32) // OP Code لتحويل Jetton
      .storeUint(0, 64)         // Query ID
      .storeCoins(amount)       // المبلغ بوحدات nanoJettons
      .storeAddress(recipientTonAddress) // عنوان المستلم
      .storeAddress(null);      // response_destination

    // عدم استخدام custom_payload هنا؛ لذا يتم تعيين العلم إلى false
    cellBuilder.storeBit(false);

    // ضبط forward_ton_amount على قيمة غير صفرية (مثلاً 0.01 TON)
    cellBuilder.storeCoins(toNano("0.01"));

    // استخدام forward payload لنقل paymentToken كسلسلة نصية
    cellBuilder.storeBit(true);
    cellBuilder.storeRef(
      beginCell()
        .storeUint(0x00000000, 32) // OP Code للتعليق النصي (0)
        .storeStringTail(`${paymentToken}`)
        .endCell()
    );

    return cellBuilder
      .endCell()
      .toBoc()
      .toString("base64");
  } catch (error: unknown) {
    console.error("❌ خطأ أثناء إنشاء حمولة تحويل Jetton:", error);
    let errorMessage = "❌ فشل إنشاء حمولة تحويل Jetton: حدث خطأ غير معروف";
    if (error instanceof Error) {
      errorMessage = `❌ فشل إنشاء حمولة تحويل Jetton: ${error.message}`;
    }
    throw new Error(errorMessage);
  }
};

/**
 * دالة handleTonPayment المعدلة:
 * - لا يتم استخدام amount من الواجهة الأمامية
 * - استخدام القيمة المرجعة من الخادم لـ amount
 * - إظهار الرسائل عبر showToast
 */
export const handleTonPayment = async (
  tonConnectUI: TonConnectUI,
  setPaymentStatus: React.Dispatch<React.SetStateAction<PaymentStatus>>,
  selectedPlanId: string,
  telegramId: string,
  telegramUsername: string,
  fullName: string,
): Promise<{ payment_token?: string }> => {
  if (typeof setPaymentStatus !== 'function') {
    console.error('❌ دالة الحالة setPaymentStatus غير صالحة!');
    return {};
  }

  setPaymentStatus('pending');

  try {
    console.log('🚀 بدء عملية دفع USDT...');

    const userTonAddress = tonConnectUI.account?.address;
    if (!userTonAddress) {
      showToast.error('الرجاء ربط محفظتك أولاً');
      setPaymentStatus('failed');
      return {};
    }
    console.log(`✅ عنوان محفظة المستخدم: ${userTonAddress}`);

    const userJettonWallet = await getUserJettonWallet(userTonAddress);
    if (!userJettonWallet) {
      showToast.error('المستخدم لا يملك محفظة USDT على TON.');
      setPaymentStatus('failed');
      return {};
    }
    console.log(`✅ عنوان محفظة USDT الخاصة بالمستخدم: ${userJettonWallet}`);

    // جلب عنوان البوت من Zustand
    const botWalletAddress = useTariffStore.getState().walletAddress;
    if (!botWalletAddress) {
      showToast.error('عنوان محفظة البوت غير متوفر.');
      setPaymentStatus('failed');
      return {};
    }
    console.log(`✅ عنوان محفظة البوت من Zustand: ${botWalletAddress}`);

    const recipientJettonWalletAddress = await getBotJettonWallet(botWalletAddress);
    if (!recipientJettonWalletAddress) {
      showToast.error('تعذر الحصول على محفظة البوت USDT.');
      setPaymentStatus('failed');
      return {};
    }
    console.log(`✅ عنوان محفظة USDT الخاصة بالبوت: ${recipientJettonWalletAddress}`);

    // إرسال بيانات الدفع إلى الخادم لتأكيد الدفع
    console.log('📞 استدعاء /api/confirm_payment لتأكيد الدفع...');
    const confirmPaymentResponse = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/confirm_payment`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Telegram-Id': telegramId,
        },
        body: JSON.stringify({
          webhookSecret: process.env.NEXT_PUBLIC_WEBHOOK_SECRET,
          userWalletAddress: userTonAddress,
          planId: selectedPlanId,
          telegramId: telegramId,
          telegramUsername: telegramUsername,
          fullName: fullName
        }),
      }
    );

    if (!confirmPaymentResponse.ok) {
      showToast.error('فشل في تأكيد الدفع. الرجاء المحاولة لاحقاً.');
      setPaymentStatus('failed');
      return {};
    }

    const confirmPaymentData = await confirmPaymentResponse.json();
    console.log('✅ استجابة /api/confirm_payment:', confirmPaymentData);

    if (!confirmPaymentData.amount) {
      showToast.error('حدث خطأ في تحديد المبلغ.');
      setPaymentStatus('failed');
      return {};
    }

    const finalAmount = parseFloat(confirmPaymentData.amount);
    const finalAmountInNano = BigInt(finalAmount * 10 ** 6);
    const gasFee = toNano('0.02').toString();

    if (finalAmountInNano <= 0) {
      showToast.error('المبلغ المحدد غير صالح.');
      setPaymentStatus('failed');
      return {};
    }

    // إنشاء payload باستخدام العنوان الخاص بالبوت والـ paymentToken
    const payloadBase64 = createJettonTransferPayload(
      botWalletAddress,
      finalAmountInNano,
      confirmPaymentData.payment_token
    );
    console.log('🔹 Payload Base64:', payloadBase64);

    // بناء المعاملة مع تضمين payload
    const transaction = {
      validUntil: Math.floor(Date.now() / 1000) + 600,
      messages: [
        {
          address: userJettonWallet,
          amount: gasFee,
          payload: payloadBase64,
        },
      ],
    };

    console.log('🔹 بيانات المعاملة:', JSON.stringify(transaction, null, 2));
    console.log('🚀 إرسال المعاملة...');

    const transactionResponse = await tonConnectUI.sendTransaction(transaction);
    console.log('✅ تم الدفع بنجاح باستخدام USDT!');
    showToast.success('تمت عملية الدفع بنجاح! جاري التجهيز...');

    setPaymentStatus('processing');
    return { payment_token: confirmPaymentData.payment_token };
  } catch (error: unknown) {
    console.error('❌ فشل الدفع:', error);
    showToast.error('فشل في عملية الدفع. الرجاء المحاولة مرة أخرى.');
    setPaymentStatus('failed');
    return {};
  }
};