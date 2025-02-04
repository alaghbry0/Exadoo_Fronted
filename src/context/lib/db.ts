import { Pool } from 'pg';

// ✅ تحميل متغيرات البيئة من Vercel مع دعم SSL اختياري
const pool = new Pool({
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  port: Number(process.env.DB_PORT) || 5432, // ✅ تحديد قيمة افتراضية للمنفذ
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false, // ✅ دعم SSL إذا كان مطلوبًا
  max: 10, // 🔹 تحسين الأداء عبر تحديد الحد الأقصى للاتصالات المفتوحة
  idleTimeoutMillis: 30000, // 🔹 إغلاق الاتصال بعد 30 ثانية من عدم النشاط
  connectionTimeoutMillis: 2000, // 🔹 تحديد مهلة للاتصال
});

export default pool;
