const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

export async function getSubscriptionGroups() {
  const response = await fetch(`${BASE_URL}/api/public/subscription-groups`);
  if (!response.ok) {
    let message = `Error ${response.status}: Failed to fetch subscription groups.`;
    try {
      const payload = await response.json();
      if (payload?.error) {
        message += ` ${payload.error as string}`;
      }
    } catch {
      // ignore json parse errors
    }
    throw new Error(message);
  }
  return response.json();
}

export async function getSubscriptionTypes(groupId: number | null = null) {
  const url = new URL(`${BASE_URL}/api/public/subscription-types`);
  if (groupId !== null) {
    url.searchParams.set("group_id", String(groupId));
  }

  const response = await fetch(url.toString());
  if (!response.ok) {
    let message = `Error ${response.status}: Failed to fetch subscription types.`;
    try {
      const payload = await response.json();
      if (payload?.error) {
        message += ` ${payload.error as string}`;
      }
    } catch {
      // ignore parse errors
    }
    throw new Error(message);
  }
  return response.json();
}

export async function getSubscriptionPlans(telegramId: string | null) {
  const url = new URL(`${BASE_URL}/api/public/subscription-plans`);
  if (telegramId) {
    url.searchParams.set("telegram_id", telegramId);
  }

  const response = await fetch(url.toString());
  if (!response.ok) {
    let message = `Error ${response.status}: Failed to fetch subscription plans.`;
    try {
      const payload = await response.json();
      if (payload?.error) {
        message += ` ${payload.error as string}`;
      }
    } catch {
      // ignore parse errors
    }
    throw new Error(message);
  }
  return response.json();
}

type ClaimTrialParams = {
  telegramId: string | number;
  planId: string | number;
};

export async function claimTrial({ telegramId, planId }: ClaimTrialParams) {
  const response = await fetch("/api/trials/claim", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ telegram_id: telegramId, plan_id: planId }),
  });

  const payload = (await response.json().catch(() => ({}))) as Record<string, unknown>;
  if (!response.ok) {
    const message =
      typeof payload.error === "string"
        ? (payload.error as string)
        : `Error ${response.status}: Trial claim failed.`;
    throw new Error(message);
  }
  return payload;
}

export async function getUserSubscriptions(telegramId: string, page = 1) {
  const response = await fetch(
    `${BASE_URL}/api/user/subscriptions?telegram_id=${telegramId}&page=${page}`,
  );
  if (!response.ok) {
    throw new Error("فشل في جلب الاشتراكات");
  }
  return response.json();
}
