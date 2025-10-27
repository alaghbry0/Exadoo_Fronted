import type {
  PaymentIntentRequest,
  PaymentIntentResponse,
} from "@/domains/payments/types";

export async function createPaymentIntent(
  req: PaymentIntentRequest,
): Promise<PaymentIntentResponse> {
  // استدعاء API route المحلي بدلاً من Backend مباشرة
  // API route سيقوم بإضافة signature headers والتحقق من الأمان
  const res = await fetch("/api/payments/create-intent", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(req),
  });

  if (!res.ok) {
    try {
      const err = await res.json();
      return { success: false, error: err?.error || `HTTP ${res.status}` };
    } catch {
      return { success: false, error: `HTTP ${res.status}` };
    }
  }
  return res.json();
}
