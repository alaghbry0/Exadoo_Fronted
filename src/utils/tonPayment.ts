import { beginCell, Address, toNano } from '@ton/core';
import { TonConnectUI } from '@tonconnect/ui-react';
import { useTariffStore } from '../stores/zustand';
import { PaymentStatus } from '@/types/payment';
import { showToast } from '../components/ui/Toast';

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
 * يتم استخدامها للحصول على عنوان محفظة jetton الخاص بالمستخدم.
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

    console.log(`✅ User USDT Wallet Address (jetton): ${usdtJetton.wallet_address.address}`);
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
 * يتم تمرير paymentToken بدلاً من orderId.
 */
export const createJettonTransferPayload = (
  recipientAddress: string | null,
  amount: bigint,
  paymentToken: string
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

    cellBuilder.storeBit(false);
    cellBuilder.storeCoins(toNano("0.01"));

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
 * - إرسال بيانات الدفع إلى الخادم لتأكيد الدفع باستخدام العنوان الرئيسي للمستخدم.
 * - عند بناء المعاملة يتم استخدام عنوان محفظة jetton الخاص بالمستخدم.
 * - استخدام showToast.error و showToast.success لإظهار الإشعارات.
 */
export const handleTonPayment = async (
  tonConnectUI: TonConnectUI,
  setPaymentStatus: React.Dispatch<React.SetStateAction<PaymentStatus>>,
  selectedPlanId: string,
  telegramId: string,
  telegramUsername: string,
  fullName: string
): Promise<{ payment_token?: string }> => {
  if (typeof setPaymentStatus !== 'function') {
    console.error('❌ دالة الحالة setPaymentStatus غير صالحة!');
    return {};
  }

  setPaymentStatus('pending');

  try {
    console.log('🚀 بدء عملية دفع USDT...');

    // الحصول على عنوان المحفظة الرئيسي للمستخدم
    const userMainWalletAddress = tonConnectUI.account?.address;
    if (!userMainWalletAddress) {
      console.error('❌ الرجاء ربط محفظتك اولا');
      showToast.error('الرجاء ربط محفظتك اولا');
      setPaymentStatus('failed');
      return {};
    }
    console.log(`✅ عنوان المحفظة الرئيسي للمستخدم: ${userMainWalletAddress}`);

    // إرسال عنوان المحفظة الرئيسي إلى الخادم في استدعاء /api/confirm_payment
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
          userWalletAddress: userMainWalletAddress, // إرسال العنوان الرئيسي للمستخدم
          planId: selectedPlanId,
          telegramId: telegramId,
          telegramUsername: telegramUsername,
          fullName: fullName
        }),
      }
    );

    if (!confirmPaymentResponse.ok) {
      console.error(
        '❌ فشل استدعاء /api/confirm_payment:',
        confirmPaymentResponse.status,
        confirmPaymentResponse.statusText
      );
      showToast.error('❌ فشل استدعاء خدمة الدفع');
      setPaymentStatus('failed');
      return {};
    }

    const confirmPaymentData = await confirmPaymentResponse.json();
    console.log('✅ استجابة /api/confirm_payment:', confirmPaymentData);

    const paymentToken = confirmPaymentData.payment_token;
    // استخدام القيمة المستلمة من الخادم للسعر (مثلاً "0.01")
    const finalAmount = confirmPaymentData.amount ? parseFloat(confirmPaymentData.amount) : 0;
    if (finalAmount <= 0) {
      console.error('❌ السعر المستلم من الخادم غير صالح.');
      showToast.error('❌ السعر غير صالح');
      setPaymentStatus('failed');
      return {};
    }

    // تحويل finalAmount إلى nanoJettons
    const finalAmountInNano = BigInt(finalAmount * 10 ** 6);
    const gasFee = toNano('0.02').toString();

    // الحصول على عنوان محفظة jetton الخاص بالمستخدم (مطلوب لاستخدامه في بناء المعاملة)
    const userJettonWalletAddress = await getUserJettonWallet(userMainWalletAddress);
    if (!userJettonWalletAddress) {
      console.error('❌ لم يتم العثور على عنوان محفظة USDT (jetton) للمستخدم.');
      showToast.error('❌ الرجاء التأكد من وجود محفظة USDT.');
      setPaymentStatus('failed');
      return {};
    }
    console.log(`✅ عنوان محفظة USDT الخاصة بالمستخدم (jetton): ${userJettonWalletAddress}`);

    // جلب عنوان محفظة البوت
    const botWalletAddress = useTariffStore.getState().walletAddress;
    if (!botWalletAddress) {
      console.error('❌ عنوان محفظة البوت غير متوفر في المتجر!');
      showToast.error('❌ عنوان محفظة البوت غير متوفر');
      setPaymentStatus('failed');
      return {};
    }
    console.log(`✅ عنوان محفظة البوت: ${botWalletAddress}`);

    const recipientJettonWalletAddress = await getBotJettonWallet(botWalletAddress);
    if (!recipientJettonWalletAddress) {
      console.error('❌ لم يتمكن من جلب عنوان محفظة USDT الخاصة بالبوت.');
      showToast.error('❌ فشل جلب عنوان محفظة البوت');
      setPaymentStatus('failed');
      return {};
    }
    console.log(`✅ عنوان محفظة USDT الخاصة بالبوت: ${recipientJettonWalletAddress}`);

    // إنشاء payload باستخدام عنوان البوت والـ paymentToken
    const payloadBase64 = createJettonTransferPayload(botWalletAddress, finalAmountInNano, paymentToken);
    console.log('🔹 Payload Base64:', payloadBase64);

    // بناء المعاملة باستخدام عنوان محفظة jetton للمستخدم
    const transaction = {
      validUntil: Math.floor(Date.now() / 1000) + 600,
      messages: [
        {
          address: userJettonWalletAddress, // استخدام عنوان محفظة jetton للمستخدم
          amount: gasFee,
          payload: payloadBase64,
        },
      ],
    };

    console.log('🔹 بيانات المعاملة:', JSON.stringify(transaction, null, 2));
    console.log('🚀 إرسال المعاملة...');

    const transactionResponse = await tonConnectUI.sendTransaction(transaction);
    console.log('✅ تم الدفع بنجاح باستخدام USDT!');
    console.log('✅ استجابة المعاملة:', transactionResponse);

    setPaymentStatus('processing');
    showToast.success('✅ تم الدفع بنجاح!');
    return { payment_token: paymentToken };
  } catch (error: unknown) {
    console.error('❌ فشل الدفع:', error);
    showToast.error('❌ فشل الدفع');
    setPaymentStatus('failed');
    return {};
  }
};
