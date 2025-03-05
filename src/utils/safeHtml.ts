// utils/safeHtml.ts
import DOMPurify from 'dompurify';
import { JSDOM } from 'jsdom';

const { window } = new JSDOM('');
const domPurify = DOMPurify(window);

export const sanitizeHtml = (html: string) => ({
  __html: domPurify.sanitize(html)
});