import { makeSignatureHeaders } from '@/lib/signing';

const TRIALS_SECRET = process.env.TRIALS_SECRET!;
const CLIENT_ID = process.env.TRIALS_CLIENT_ID || 'webapp';

const headers = makeSignatureHeaders({
  clientId: CLIENT_ID,
  secret: TRIALS_SECRET,
  fields: [telegram_id, plan_id], // نفس ترتيب الخادم
});

await fetch(`${BACKEND_BASE_URL}/trials/claim`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', ...headers },
  body: JSON.stringify({ telegram_id, plan_id }),
});
