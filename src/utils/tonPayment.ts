// src/utils/tonPayment.ts
import { beginCell, Address, toNano } from '@ton/core';
import { TonConnectUI } from '@tonconnect/ui-react';
import { useTariffStore } from '../stores/zustand';
import { PaymentStatus } from '@/types/payment';
import { showToast } from '../components/ui/showToast'

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
 * - لا يتم تمرير amount من الواجهة.
 * - يتم إرسال بيانات الدفع إلى الخادم دون amount.
 * - يتم استخدام قيمة amount التي قد تُعاد من الخادم (إذا وُجدت) في حساب الحمولة.
 * - إظهار رسائل للمستخدم باستخدام showToast.error و showToast.success.
 */
export const handleTonPayment = async (
  tonConnectUI: TonConnectUI,
  setPaymentStatus: React.Dispatch<React.SetStateAction<PaymentStatus>>,
  paymentToken: string,     // ✅ يمرّر من create-intent
  amountUsdt: number,       // ✅ يمرّر من create-intent
  telegramId?: string,      // اختياري للتسجيل/الـ logs
  telegramUsername?: string,
  fullName?: string
): Promise<{ payment_token?: string }> => {
  if (typeof setPaymentStatus !== 'function') {
    showToast.error('❌ دالة الحالة غير صالحة!');
    return {};
  }

  setPaymentStatus('pending');

  try {
    if (!tonConnectUI.account?.address) {
      showToast.error('❌ الرجاء ربط محفظتك أولاً');
      setPaymentStatus('failed');
      return {};
    }

    const userTonAddress = tonConnectUI.account.address;
    const userJettonWallet = await getUserJettonWallet(userTonAddress);
    if (!userJettonWallet) {
      showToast.error('🚨 لا يوجد محفظة USDT لهذا الحساب');
      setPaymentStatus('failed');
      return {};
    }

    const botWalletAddress = useTariffStore.getState().walletAddress;
    if (!botWalletAddress) {
      showToast.error('❌ عنوان محفظة البوت غير متوفر');
      setPaymentStatus('failed');
      return {};
    }

    const recipientJettonWalletAddress = await getBotJettonWallet(botWalletAddress);
    if (!recipientJettonWalletAddress) {
      showToast.error('❌ تعذر جلب محفظة USDT الخاصة بالبوت');
      setPaymentStatus('failed');
      return {};
    }

    // حساب المبلغ بوحدات nanoJettons (1 USDT = 1,000,000 NanoJettons)
    if (!amountUsdt || amountUsdt <= 0) {
      showToast.error('❌ مبلغ غير صالح');
      setPaymentStatus('failed');
      return {};
    }
    const finalAmountInNano = BigInt(Math.round(amountUsdt * 1_000_000));

    // رسوم الغاز
    const gasFee = toNano('0.02').toString();

    // الـ payload يحتوي paymentToken فقط (الربط مع intent)
    const payloadBase64 = createJettonTransferPayload(
      botWalletAddress,
      finalAmountInNano,
      paymentToken
    );

    const tx = {
      validUntil: Math.floor(Date.now() / 1000) + 600,
      messages: [
        {
          address: userJettonWallet,
          amount: gasFee,
          payload: payloadBase64,
        },
      ],
    };

    await tonConnectUI.sendTransaction(tx);
    setPaymentStatus('processing'); // الباك سيكمل التأكيد والـ fulfillment
    return { payment_token: paymentToken };
  } catch (error) {
    console.error('TON payment failed:', error);
    setPaymentStatus('failed');
    return {};
  }
};