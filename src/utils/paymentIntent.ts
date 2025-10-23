import type {
  PaymentIntentRequest,
  PaymentIntentResponse,
} from "@/types/payments";

export async function createPaymentIntent(
  req: PaymentIntentRequest,
): Promise<PaymentIntentResponse> {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/payments/create-intent`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(req),
    },
  );
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
