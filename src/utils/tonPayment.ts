import { beginCell, Address, toNano } from '@ton/core';
import { TonConnectUI } from '@tonconnect/ui-react';
import { v4 as uuidv4 } from 'uuid';


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


// ✅ تحديث getUserJettonWallet لاستخدام v2 من TonAPI
export const getUserJettonWallet = async (userTonAddress: string) => {
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

// ✅ تحديث getBotJettonWallet لاستخدام v2 من TonAPI
export const getBotJettonWallet = async (botTonAddress: string) => {
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

// ✅ تحديث createJettonTransferPayload - تم تصحيح OP Code لتحويل خارجي!
export const createJettonTransferPayload = (
  recipientAddress: string | null,
  amount: bigint,
  customPayload?: string // المعرف الفريد الذي سنمرره
) => {
  if (!recipientAddress) {
    throw new Error("❌ recipientAddress مفقود أو غير صالح");
  }

  try {
    console.log(`✅ إنشاء حمولة تحويل Jetton للمستلم: ${recipientAddress}`);
    const recipientTonAddress = Address.parse(recipientAddress);
    const cellBuilder = beginCell()
      .storeUint(0xf8a7ea5, 32) // OP Code لتحويل Jetton
      .storeUint(0, 64) // Query ID
      .storeCoins(amount) // المبلغ بوحدات nanoJettons
      .storeAddress(recipientTonAddress) // عنوان المستلم
      .storeAddress(null); // عدم تحديد response_destination

    if (customPayload) {
      // تفعيل استخدام الحمولة المخصصة
      cellBuilder.storeBit(true);
      // تحويل customPayload إلى بايتات وتخزينها
      const payloadBuffer = Buffer.from(customPayload, 'utf-8');
      // تخزين طول الحمولة أولاً (16 بت) ثم محتواها
      cellBuilder.storeUint(payloadBuffer.length, 16);
      for (const byte of payloadBuffer) {
        cellBuilder.storeUint(byte, 8);
      }
    } else {
      cellBuilder.storeBit(false);
    }

    return cellBuilder
      .storeCoins(0) // forward_ton_amount يجب أن يكون 0
      .storeBit(0) // عدم استخدام forward_payload
      .endCell()
      .toBoc()
      .toString("base64");

  } catch (error) {
    console.error("❌ خطأ أثناء إنشاء حمولة تحويل Jetton:", error);
    throw new Error("❌ فشل إنشاء حمولة تحويل Jetton");
  }
};

// ✅ تعديل handleTonPayment لاستدعاء /api/confirm_payment المدمجة
export const handleTonPayment = async (
  tonConnectUI: TonConnectUI,
  setPaymentStatus: React.Dispatch<React.SetStateAction<string | null>>,
  tariffId: string,
  telegramId: string,
  telegramUsername: string,
  fullName: string
) => {
  if (typeof setPaymentStatus !== "function") {
    console.error("❌ دالة الحالة setPaymentStatus غير صالحة!");
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
    const USDT_AMOUNT = 0.01; // القيمة الحالية 0.01 USDT
    const amountInNanoJettons = BigInt(USDT_AMOUNT * 10 ** 6);
    const gasFee = toNano('0.01').toString();

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

    // توليد معرف الدفع الفريد (UUID)
    const paymentId = uuidv4();
    console.log("✅ معرف الدفع الفريد:", paymentId);

    // تمرير paymentId كـ customPayload للحمولة
    const payloadBase64 = createJettonTransferPayload(botTonAddress, amountInNanoJettons, paymentId);
    console.log("🔹 Payload Base64:", payloadBase64);

    const transaction = {
      validUntil: Math.floor(Date.now() / 1000) + 600, // صلاحية 10 دقائق
      messages: [
        {
          address: userJettonWallet,
          amount: gasFee,
          payload: payloadBase64
        }
      ]
    };

    console.log("🔹 بيانات المعاملة:", JSON.stringify(transaction, null, 2));
    console.log("🚀 إرسال المعاملة...");

    const transactionResponse = await tonConnectUI.sendTransaction(transaction);
    setPaymentStatus("success");
    console.log("✅ تم الدفع بنجاح باستخدام USDT!");
    console.log("✅ استجابة المعاملة:", transactionResponse);


    // إرسال بيانات الدفع إلى الخادم مع تضمين paymentId بدلاً من txHash
    console.log("📞 استدعاء /api/confirm_payment لتحديث معلومات الاشتراك وبيانات المستخدم...");
    const confirmPaymentResponse = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/confirm_payment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        paymentId: paymentId, // إرسال paymentId الفريد
        planId: tariffId,
        telegramId: telegramId,
        telegramUsername: telegramUsername,
        fullName: fullName
      }),
    });

    if (!confirmPaymentResponse.ok) {
      console.error("❌ فشل استدعاء /api/confirm_payment:", confirmPaymentResponse.status, confirmPaymentResponse.statusText);
    } else {
      const confirmPaymentData = await confirmPaymentResponse.json();
      console.log("✅ استجابة /api/confirm_payment:", confirmPaymentData);
    }

  } catch (error: unknown) {
    console.error("❌ فشل الدفع:", error);
    setPaymentStatus("failed");
  }
};
