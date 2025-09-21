// src/pages/api/miniapp-snapshot.ts
import type { NextApiRequest, NextApiResponse } from 'next'
import { promises as fs } from 'fs'
import path from 'path'

interface SnapshotBody {
  date?: string
  data?: unknown
}

const SNAPSHOT_DIR = path.join(process.cwd(), '.snapshots')

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST'])
    return res.status(405).json({ ok: false, message: 'Method Not Allowed' })
  }

  if (process.env.NODE_ENV !== 'development' && process.env.ALLOW_SNAPSHOT_WRITE !== 'true') {
    return res.status(200).json({ ok: false, skipped: true })
  }

  let body: SnapshotBody
  try {
    body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body ?? {})
  } catch (error) {
    console.error('[miniapp-snapshot] Failed to parse body', error)
    return res.status(400).json({ ok: false, message: 'Invalid JSON body' })
  }
  const { date, data } = body

  if (!date || !/^[0-9]{8}$/.test(date)) {
    return res.status(400).json({ ok: false, message: 'Invalid snapshot date' })
  }

  if (typeof data === 'undefined') {
    return res.status(400).json({ ok: false, message: 'Snapshot payload missing' })
  }

  try {
    await fs.mkdir(SNAPSHOT_DIR, { recursive: true })
    const filePath = path.join(SNAPSHOT_DIR, `miniapp-${date}.json`)
    await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf8')
    return res.status(200).json({ ok: true })
  } catch (error) {
    console.error('[miniapp-snapshot] Failed to persist snapshot', error)
    return res.status(500).json({ ok: false, message: 'Snapshot persistence failed' })
  }
}
