// services/api.js

export const getSubscriptionTypes = async () => {
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/public/subscription-types`);
        if (!response.ok) {
            // محاولة استخراج تفاصيل الخطأ من الاستجابة إن وُجدت
            let errorMessage = `Error ${response.status}: Failed to fetch subscription types.`;
            try {
                const errorData = await response.json();
                if (errorData.error) {
                    errorMessage += ` ${errorData.error}`;
                }
            } catch { // تم حذف parseError غير المستخدم
                // في حال تعذر تحليل الاستجابة، يتم الاحتفاظ برسالة الخطأ الافتراضية
            }
            throw new Error(errorMessage);
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("getSubscriptionTypes failed:", error);
        throw error;
    }
};

export const getSubscriptionPlans = async () => {
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/public/subscription-plans`);
        if (!response.ok) {
            let errorMessage = `Error ${response.status}: Failed to fetch subscription plans.`;
            try {
                const errorData = await response.json();
                if (errorData.error) {
                    errorMessage += ` ${errorData.error}`;
                }
            } catch { // تم حذف parseError غير المستخدم
                // في حال تعذر تحليل الاستجابة، يتم الاحتفاظ برسالة الخطأ الافتراضية
            }
            throw new Error(errorMessage);
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("getSubscriptionPlans failed:", error);
        throw error;
    }
};



export const getUserSubscriptions = async (telegramId: string) => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/user/subscriptions?telegram_id=${telegramId}`);
    if (!res.ok) throw new Error('فشل في جلب الاشتراكات');
    return res.json();
};

export const fetchBotWalletAddress = async () => {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/public/wallet`);
    if (response.ok) {
      const data = await response.json();
      return data.wallet_address;
    } else {
      console.error("❌ Failed to fetch wallet address");
      return null;
    }
  } catch (error) {
    console.error("❌ Error fetching wallet address:", error);
    return null;
  }
};
