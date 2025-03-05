// utils/safeHtml.ts
import DOMPurify from 'dompurify';

export const sanitizeHtml = (html: string) => ({
  __html: DOMPurify.sanitize(html)
});