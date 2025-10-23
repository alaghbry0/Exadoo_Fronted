// services/api.js

export const getSubscriptionGroups = async () => {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/public/subscription-groups`,
    );
    if (!response.ok) {
      let errorMessage = `Error ${response.status}: Failed to fetch subscription groups.`;
      try {
        const errorData = await response.json();
        if (errorData.error) {
          errorMessage += ` ${errorData.error}`;
        }
      } catch {}
      throw new Error(errorMessage);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("getSubscriptionGroups failed:", error);
    throw error;
  }
};

// تعديل getSubscriptionTypes ليقبل group_id
export const getSubscriptionTypes = async (groupId: number | null = null) => {
  try {
    let url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/public/subscription-types`;
    if (groupId !== null) {
      url += `?group_id=${groupId}`; // <-- تعديل هنا
    }
    const response = await fetch(url);
    if (!response.ok) {
      let errorMessage = `Error ${response.status}: Failed to fetch subscription types.`;
      try {
        const errorData = await response.json();
        if (errorData.error) {
          errorMessage += ` ${errorData.error}`;
        }
      } catch {}
      throw new Error(errorMessage);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("getSubscriptionTypes failed:", error);
    throw error;
  }
};

export const getSubscriptionPlans = async (telegramId: string | null) => {
  try {
    const url = new URL(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/public/subscription-plans`,
    );

    if (telegramId) {
      // TypeScript يعرف الآن أن telegramId هو string هنا
      url.searchParams.append("telegram_id", telegramId);
    }

    const response = await fetch(url.toString());

    if (!response.ok) {
      let errorMessage = `Error ${response.status}: Failed to fetch subscription plans.`;
      try {
        const errorData = await response.json();
        if (errorData.error) {
          errorMessage += ` ${errorData.error}`;
        }
      } catch {}
      throw new Error(errorMessage);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("getSubscriptionPlans failed:", error);
    throw error;
  }
};

type ClaimTrialParams = {
  telegramId: string | number;
  planId: string | number;
};

export const claimTrial = async ({ telegramId, planId }: ClaimTrialParams) => {
  const res = await fetch("/api/trials/claim", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ telegram_id: telegramId, plan_id: planId }),
  });

  const data = (await res.json().catch(() => ({}))) as Record<string, unknown>;
  if (!res.ok) {
    const message =
      typeof data["error"] === "string"
        ? (data["error"] as string)
        : `Error ${res.status}: Trial claim failed.`;
    throw new Error(message);
  }
  return data;
};

export const getUserSubscriptions = async (
  telegramId: string,
  page: number = 1,
) => {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/user/subscriptions?telegram_id=${telegramId}&page=${page}`,
  );
  if (!res.ok) throw new Error("فشل في جلب الاشتراكات");
  return res.json();
};

export const fetchBotWalletAddress = async () => {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/public/wallet`,
    );
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

import axios from "axios";

export const fetchUserPayments = async (params: {
  telegramId: number;
  page?: number;
  status?: string;
  startDate?: string;
  endDate?: string;
}) => {
  const response = await axios.get(
    `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/user/payments`,
    { params },
  );
  return {
    data: response.data.results,
    pagination: response.data.pagination,
  };
};

// واجهة لنوع بيانات المستخدم التي سنرسلها
interface UserSyncData {
  telegramId: string;
  telegramUsername: string | null;
  fullName: string | null;
}

/**
 * يرسل بيانات المستخدم إلى الخادم لمزامنتها (إضافة/تحديث).
 * @param userData بيانات المستخدم المراد مزامنتها.
 */
export const syncUserData = async (userData: UserSyncData): Promise<void> => {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/user/sync`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      },
    );

    if (!response.ok) {
      // يمكنك معالجة الخطأ هنا إذا أردت، مثلاً إرساله إلى خدمة تتبع الأخطاء
      const errorData = await response.json();
      console.error(
        "Failed to sync user data:",
        errorData.error || response.statusText,
      );
      // لا نلقي خطأ هنا لأن المزامنة عملية خلفية ولا يجب أن توقف التطبيق
    } else {
      console.log("✅ User data synced successfully with the backend.");
    }
  } catch (error) {
    console.error("Network or other error during user sync:", error);
  }
};
