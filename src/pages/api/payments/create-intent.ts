// src/pages/api/payments/create-intent.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { makeSignatureHeaders } from "@/lib/signing";
import { resolveBackendConfig } from "@/lib/serverConfig";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  try {
    if (req.method !== "POST") {
      res.setHeader("Allow", "POST");
      return res.status(405).json({ error: "Method not allowed" });
    }

    const {
      webhookSecret,
      telegramId,
      telegramUsername,
      fullName,
      productType,
      subscriptionPlanId,
      amount,
      currency,
      paymentMethod,
      extraMetadata,
    } = req.body as {
      webhookSecret?: string;
      telegramId: string | number;
      telegramUsername?: string | null;
      fullName?: string | null;
      productType?: string;
      subscriptionPlanId?: number | string;
      amount?: number | string;
      currency?: string;
      paymentMethod?: string;
      extraMetadata?: Record<string, unknown>;
    };

    if (!telegramId) {
      return res.status(400).json({ error: "Missing telegramId" });
    }

    const { baseUrl, clientId, secret, webhookSecret: envWebhookSecret } = resolveBackendConfig({
      requireWebhookSecret: true,
    });

    // إنشاء signature headers - يجب أن تطابق Backend
    // استخدام نفس pattern في confirm_payment: [telegramId, planId]
    const sigHeaders = makeSignatureHeaders({
      clientId,
      secret,
      fields: [telegramId, subscriptionPlanId || ""],
    });

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...sigHeaders,
      "X-Telegram-Id": String(telegramId),
    };

    const upstreamBody: Record<string, unknown> = {
      telegramId,
      telegramUsername,
      fullName,
      productType,
      subscriptionPlanId,
      amount,
      currency,
      paymentMethod,
      extraMetadata,
    };

    // إضافة webhookSecret من env أو request
    if (envWebhookSecret) {
      upstreamBody.webhookSecret = envWebhookSecret;
    } else if (webhookSecret) {
      upstreamBody.webhookSecret = webhookSecret;
    }

    // Debug logging (يمكن حذفه بعد التأكد من العمل)
    console.log("[create-intent] Sending request to:", `${baseUrl}/api/payments/create-intent`);
    console.log("[create-intent] Headers:", {
      ...headers,
      "X-Signature": "***" + headers["X-Signature"]?.slice(-8), // إخفاء التوقيع
    });
    console.log("[create-intent] Body keys:", Object.keys(upstreamBody));

    const upstream = await fetch(`${baseUrl}/api/payments/create-intent`, {
      method: "POST",
      headers,
      body: JSON.stringify(upstreamBody),
    });

    const responseText = await upstream.text();
    let data: Record<string, unknown> = {};
    if (responseText) {
      try {
        data = JSON.parse(responseText) as Record<string, unknown>;
      } catch {
        data = { raw: responseText };
      }
    }

    if (!upstream.ok) {
      console.error("[create-intent] Backend error:", {
        status: upstream.status,
        statusText: upstream.statusText,
        data,
      });
      const errorMessage =
        typeof data["error"] === "string" && data["error"]
          ? (data["error"] as string)
          : upstream.statusText || "Create payment intent failed";
      return res.status(upstream.status).json({ 
        success: false, 
        error: errorMessage 
      });
    }

    return res.status(200).json(data);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal error";
    return res.status(500).json({ success: false, error: message });
  }
}
