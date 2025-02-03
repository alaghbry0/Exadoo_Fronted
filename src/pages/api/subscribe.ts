import { NextApiRequest, NextApiResponse } from 'next'
import { Pool } from 'pg'

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { telegram_id, plan_id, payment_id } = req.body

  if (!telegram_id || !plan_id || !payment_id) {
    return res.status(400).json({ error: 'Missing required fields' })
  }

  const client = await pool.connect()

  try {
    await client.query('BEGIN')

    // 🔹 1. التأكد من أن الدفع مسجل مسبقًا
    const existingPayment = await client.query(
      `SELECT * FROM payments WHERE payment_id = $1`,
      [payment_id]
    )

    if (existingPayment.rows.length > 0) {
      console.warn(`⚠️ الدفع مسجل مسبقًا للمستخدم ${telegram_id}, payment_id: ${payment_id}`)
      await client.query('ROLLBACK')
      return res.status(400).json({ error: 'Payment already processed' })
    }

    // 🔹 2. تسجيل الدفع في جدول payments
    await client.query(
      `INSERT INTO payments (payment_id, user_id, plan_id, amount, payment_date)
       VALUES ($1, $2, $3, (SELECT price FROM subscription_plans WHERE id = $3), NOW())`,
      [payment_id, telegram_id, plan_id]
    )

    // 🔹 3. تجديد الاشتراك
    const subscriptionResult = await client.query(
      `INSERT INTO subscriptions (user_id, plan_id, expiry_date)
       VALUES ($1, $2, NOW() + INTERVAL '1 month')
       ON CONFLICT (user_id) DO UPDATE
       SET expiry_date = GREATEST(subscriptions.expiry_date, NOW()) + INTERVAL '1 month'
       RETURNING expiry_date`,
      [telegram_id, plan_id]
    )

    // 🔹 4. تسجيل إشعار للمستخدم
    await client.query(
      `INSERT INTO notifications (user_id, message)
       VALUES ($1, $2)`,
      [telegram_id, '✅ تم تجديد اشتراكك بنجاح!']
    )

    await client.query('COMMIT')

    res.status(200).json({
      success: true,
      expiry_date: subscriptionResult.rows[0].expiry_date
    })
  } catch (error) {
    await client.query('ROLLBACK')
    console.error('❌ خطأ أثناء معالجة الاشتراك:', error)
    res.status(500).json({ success: false, error: 'Internal server error' })
  } finally {
    client.release()
  }
}
