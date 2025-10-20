export type BackendConfigOptions = {
  requireWebhookSecret?: boolean;
};

export type BackendConfig = {
  baseUrl: string;
  clientId: string;
  secret: string;
  webhookSecret?: string;
};

const cleanEnvValue = (value?: string | null) => {
  if (!value) return undefined;
  const trimmed = value.trim();
  return trimmed.length ? trimmed : undefined;
};

export function resolveBackendConfig(options: BackendConfigOptions = {}): BackendConfig {
  const baseUrl =
    cleanEnvValue(process.env.BACKEND_BASE_URL) ?? cleanEnvValue(process.env.NEXT_PUBLIC_BACKEND_URL);

  const clientId = cleanEnvValue(process.env.CLIENT_ID) ?? 'webapp';

  const secret =
    cleanEnvValue(process.env.SECRET) ??
    cleanEnvValue(process.env.WEBHOOK_SECRET) ??
    cleanEnvValue(process.env.NEXT_PUBLIC_WEBHOOK_SECRET);

  const webhookSecret =
    cleanEnvValue(process.env.WEBHOOK_SECRET) ?? cleanEnvValue(process.env.NEXT_PUBLIC_WEBHOOK_SECRET);

  const missing: string[] = [];
  if (!baseUrl) {
    missing.push('BACKEND_BASE_URL or NEXT_PUBLIC_BACKEND_URL');
  }
  if (!secret) {
    missing.push('SECRET or WEBHOOK_SECRET (NEXT_PUBLIC_WEBHOOK_SECRET as a fallback)');
  }
  if (options.requireWebhookSecret && !webhookSecret) {
    missing.push('WEBHOOK_SECRET or NEXT_PUBLIC_WEBHOOK_SECRET');
  }

  if (missing.length) {
    throw new Error(`Missing environment variables: ${missing.join(', ')}`);
  }

  return {
    baseUrl: baseUrl!,
    clientId,
    secret: secret!,
    webhookSecret,
  };
}
