import type { TelegramInvoiceCreateRequest } from "@/domains/payments/types";

export async function createTelegramInvoice(
  req: TelegramInvoiceCreateRequest,
): Promise<{ invoice_url?: string; error?: string }> {
  const res = await fetch("/api/create-invoice", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(req),
  });
  if (!res.ok) {
    try {
      const err = await res.json();
      return { error: err?.error || `HTTP ${res.status}` };
    } catch {
      return { error: `HTTP ${res.status}` };
    }
  }
  return res.json();
}
