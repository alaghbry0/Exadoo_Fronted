// src/pages/api/trials/claim.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { makeSignatureHeaders } from "@/infrastructure/security/signing";
import { resolveBackendConfig } from "@/infrastructure/config/serverConfig";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  try {
    if (req.method !== "POST") {
      res.setHeader("Allow", "POST");
      return res.status(405).json({ error: "Method Not Allowed" });
    }

    const { telegram_id, plan_id } = (req.body ?? {}) as {
      telegram_id?: string | number;
      plan_id?: string | number;
    };

    if (!telegram_id || !plan_id) {
      return res.status(400).json({ error: "Missing telegram_id or plan_id" });
    }

    const { baseUrl, clientId, secret } = resolveBackendConfig();

    const sigHeaders = makeSignatureHeaders({
      clientId,
      secret,
      fields: [telegram_id, plan_id],
    });

    const upstream = await fetch(`${baseUrl}/trials/claim`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...sigHeaders },
      body: JSON.stringify({ telegram_id, plan_id }),
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
      const errorMessage =
        typeof data["error"] === "string" && data["error"]
          ? (data["error"] as string)
          : upstream.statusText || "Trial claim failed";
      return res.status(upstream.status).json({ error: errorMessage });
    }

    return res.status(200).json(data);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal error";
    return res.status(500).json({ error: message });
  }
}
