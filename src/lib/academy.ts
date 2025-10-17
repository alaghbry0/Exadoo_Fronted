// src/lib/academy.ts
export const formatPrice = (value?: string | number) => {
  if (value === undefined || value === null) return ''
  const str = String(value)
  if (str.toLowerCase?.() === 'free') return 'مجاني'
  const n = Number(str)
  return isNaN(n) ? str : `$${n.toFixed(0)}`
}

export const normalizeDescription = (description?: string) => {
  if (!description) return { generalInfo: '', lessons: [] as string[] }

  const normalizedText = description
    .replace(/<br\s*\/?>(?=\s|$)/gi, '\n')
    .replace(/<\/p>/gi, '\n')
    .replace(/<li>/gi, '\n• ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim()

  const lessonPattern = /(?:C\d+)?\s*\|\s*الدرس\s*\d+\s*\|\s*([^<\n]+)/g
  const lessons: string[] = []
  let m: RegExpExecArray | null
  while ((m = lessonPattern.exec(description)) !== null) {
    const title = (m[1] || '').replace(/<[^>]+>/g, ' ').trim()
    if (title) lessons.push(title)
  }

  const generalInfo = normalizedText.split('C3 |')[0]?.trim() || normalizedText
  return { generalInfo, lessons }
}
