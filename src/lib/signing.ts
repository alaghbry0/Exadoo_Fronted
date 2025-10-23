// src/lib/signing.ts (كما هو عندك)
import crypto from "crypto";

export type SignatureFields = (string | number | null | undefined)[];

export type SignInput = {
  clientId: string;
  secret: string;
  timestamp?: number;
  fields: SignatureFields;
};

type BuildMessageInput = {
  clientId: string;
  fields: SignatureFields;
  timestamp?: number;
};

export function buildMessage({
  clientId,
  timestamp = Math.floor(Date.now() / 1000),
  fields,
}: BuildMessageInput) {
  const parts = [
    clientId,
    String(timestamp),
    ...fields.map((v) => (v ?? "").toString()),
  ];
  return { message: parts.join(":"), timestamp };
}

export function signHex(secret: string, message: string) {
  return crypto.createHmac("sha256", secret).update(message).digest("hex");
}

export function makeSignatureHeaders(input: SignInput) {
  const { clientId, secret, fields } = input;
  const { message, timestamp } = buildMessage({
    clientId,
    fields,
    timestamp: input.timestamp,
  });
  const signature = signHex(secret, message);
  return {
    "X-Client-Id": clientId,
    "X-Timestamp": String(timestamp),
    "X-Signature": signature,
  };
}
