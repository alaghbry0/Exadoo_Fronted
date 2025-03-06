// utils/safeHtml.ts
import DOMPurify from 'dompurify';

let domPurify: typeof DOMPurify;

if (typeof window !== 'undefined') {
  // في بيئة العميل
  domPurify = DOMPurify(window);
} else {
  // في بيئة الخادم (Next.js SSR)
  import('jsdom').then(({ JSDOM }) => {
    const { window } = new JSDOM('');
    domPurify = DOMPurify(window);
  }).catch(error => {
    console.error('Failed to load jsdom:', error);
    domPurify = DOMPurify; // Fallback
  });
}

export const sanitizeHtml = (html: string) => ({
  __html: domPurify?.sanitize(html) || html
});