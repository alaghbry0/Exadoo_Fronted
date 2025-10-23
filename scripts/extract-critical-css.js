/**
 * Extract Critical CSS Script
 * يستخرج الـ CSS الحرج من الصفحات الرئيسية
 */

const fs = require('fs');
const path = require('path');

// قراءة critical.css
const criticalCssPath = path.join(__dirname, '../src/styles/critical.css');
const criticalCss = fs.readFileSync(criticalCssPath, 'utf-8');

// تصغير CSS (إزالة التعليقات والمسافات الزائدة)
const minifiedCss = criticalCss
  .replace(/\/\*[\s\S]*?\*\//g, '') // إزالة التعليقات
  .replace(/\s+/g, ' ') // استبدال المسافات المتعددة بمسافة واحدة
  .replace(/\s*([{}:;,])\s*/g, '$1') // إزالة المسافات حول الرموز
  .trim();

// إنشاء ملف inline
const inlineCssContent = `
/**
 * Critical CSS - Auto-generated
 * DO NOT EDIT MANUALLY
 */

export const criticalCss = \`${minifiedCss}\`;
`;

// حفظ الملف
const outputPath = path.join(__dirname, '../src/styles/critical-inline.ts');
fs.writeFileSync(outputPath, inlineCssContent, 'utf-8');

console.log('✅ Critical CSS extracted successfully!');
console.log(`📦 Size: ${Buffer.byteLength(minifiedCss, 'utf-8')} bytes`);
console.log(`📄 Output: ${outputPath}`);
