import type { NextApiRequest, NextApiResponse } from "next";
import sharp from "sharp";

const FETCH_TIMEOUT_MS = 20000;
const MAX_SIZE_BYTES = 512 * 1024; // حماية من الصور الضخمة (لن نحمل ضخمة للblur)
const WIDTH = 16; // صغير جداً للـ blur
const HEIGHT = 10;

const ALLOWED_HOSTS = new Set(["exaado.plebits.com"]);

function okUrl(raw: string) {
  try {
    const u = new URL(raw);
    return (u.protocol === "https:" || u.protocol === "http:") && ALLOWED_HOSTS.has(u.hostname);
  } catch {
    return false;
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const url = typeof req.query.url === "string" ? req.query.url : "";
  if (!okUrl(url)) {
    res.status(400).json({ error: "Invalid or not allowed url" });
    return;
  }

  const controller = new AbortController();
  const to = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const upstream = await fetch(url, {
      signal: controller.signal,
      headers: {
        Accept: "image/avif,image/webp,image/*;q=0.8,*/*;q=0.5",
        "User-Agent": "ExaadoBlur/1.0",
      },
    });

    if (!upstream.ok) {
      clearTimeout(to);
      res.status(upstream.status).json({ error: `Upstream ${upstream.status}` });
      return;
    }

    const buf = Buffer.from(await upstream.arrayBuffer());
    if (buf.length > MAX_SIZE_BYTES) {
      // للصورة الكبيرة، ما نولّد blur – خليه front ينتقل للـ SVG الافتراضي
      clearTimeout(to);
      res.status(200).json({ blurDataURL: null });
      return;
    }

    const tiny = await sharp(buf).resize(WIDTH, HEIGHT, { fit: "cover" }).toFormat("webp", { quality: 30 }).toBuffer();
    const base64 = `data:image/webp;base64,${tiny.toString("base64")}`;

    res.setHeader("Cache-Control", "public, max-age=2592000, stale-while-revalidate=2592000"); // 30d
    res.status(200).json({ blurDataURL: base64 });
  } catch (e: any) {
    const aborted = e?.name === "AbortError";
    res.status(aborted ? 504 : 502).json({ error: "Failed to blur" });
  } finally {
    clearTimeout(to);
  }
}
