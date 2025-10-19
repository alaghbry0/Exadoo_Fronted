import crypto from 'crypto';

export type SignInput = {
  clientId: string;
  secret: string;
  timestamp?: number;           // افتراضي: الآن (ثواني)
  fields: (string | number | null | undefined)[];
};

export function buildMessage({ clientId, timestamp = Math.floor(Date.now() / 1000), fields }: SignInput) {
  const parts = [clientId, String(timestamp), ...fields.map(v => (v ?? '').toString())];
  return { message: parts.join(':'), timestamp };
}

export function signHex(secret: string, message: string) {
  return crypto.createHmac('sha256', secret).update(message).digest('hex');
}

export function makeSignatureHeaders(input: SignInput) {
  const { clientId, secret, fields } = input;
  const { message, timestamp } = buildMessage({ clientId, fields, timestamp: input.timestamp });
  const signature = signHex(secret, message);
  return {
    'X-Client-Id': clientId,
    'X-Timestamp': String(timestamp),
    'X-Signature': signature,
  };
}
