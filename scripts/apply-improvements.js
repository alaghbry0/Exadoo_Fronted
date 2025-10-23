/**
 * Apply Improvements Script
 * يطبق التحسينات تلقائياً على جميع ملفات المشروع
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// الإحصائيات
const stats = {
  filesProcessed: 0,
  smartImageUpdated: 0,
  variantsAdded: 0,
  errors: [],
};

/**
 * تحديث SmartImage لإضافة blur placeholders
 */
function updateSmartImage(content, filePath) {
  let updated = false;
  
  // البحث عن استخدامات SmartImage بدون blurType
  const smartImageRegex = /<SmartImage\s+([^>]*?)(?:\/?>|\s*>)/gs;
  
  content = content.replace(smartImageRegex, (match, attrs) => {
    // تحقق إذا كان blurType موجود بالفعل
    if (attrs.includes('blurType')) {
      return match;
    }
    
    // تحقق إذا كان autoQuality موجود
    if (attrs.includes('autoQuality')) {
      return match;
    }
    
    // إضافة blurType و autoQuality
    const hasWidth = attrs.includes('width=');
    const hasFill = attrs.includes('fill');
    
    let newAttrs = attrs.trim();
    
    // تحديد blurType بناءً على السياق
    let blurType = 'light';
    if (filePath.includes('profile')) blurType = 'primary';
    else if (filePath.includes('academy')) blurType = 'secondary';
    else if (filePath.includes('shop')) blurType = 'primary';
    
    // إضافة الخصائص الجديدة
    if (!newAttrs.endsWith('\n')) {
      newAttrs += '\n          ';
    }
    newAttrs += `blurType="${blurType}"\n          `;
    
    if (hasWidth && !hasFill) {
      newAttrs += `autoQuality={true}\n          `;
    }
    
    updated = true;
    stats.smartImageUpdated++;
    
    return `<SmartImage\n          ${newAttrs}${match.endsWith('/>') ? '/>' : '>'}`;
  });
  
  return { content, updated };
}

/**
 * إضافة Component Variants للكروت
 */
function addComponentVariants(content) {
  let updated = false;
  
  // البحث عن patterns شائعة للكروت
  const cardPatterns = [
    {
      // Pattern: bg-white dark:bg-neutral-900 border
      regex: /className=["']([^"']*bg-white[^"']*dark:bg-neutral-\d+[^"']*border[^"']*)["']/g,
      replacement: (match, classes) => {
        if (classes.includes('componentVariants')) return match;
        updated = true;
        stats.variantsAdded++;
        return `className={cn(componentVariants.card.base, "${classes.replace(/bg-white\s+dark:bg-neutral-\d+\s+border\s+border-gray-\d+\s+dark:border-neutral-\d+/g, '').trim()}")}`;
      }
    },
    {
      // Pattern: rounded-2xl shadow
      regex: /className=["']([^"']*rounded-2xl[^"']*shadow[^"']*)["']/g,
      replacement: (match, classes) => {
        if (classes.includes('componentVariants')) return match;
        if (!classes.includes('bg-white') && !classes.includes('bg-gray')) return match;
        updated = true;
        stats.variantsAdded++;
        return `className={cn(componentVariants.card.elevated, "${classes.replace(/rounded-2xl|shadow-\w+/g, '').trim()}")}`;
      }
    }
  ];
  
  cardPatterns.forEach(({ regex, replacement }) => {
    content = content.replace(regex, replacement);
  });
  
  // إضافة import إذا تم التحديث
  if (updated && !content.includes('componentVariants')) {
    const importStatement = "import { componentVariants, mergeVariants } from '@/components/ui/variants';\n";
    
    // البحث عن آخر import
    const lastImportIndex = content.lastIndexOf('import ');
    if (lastImportIndex !== -1) {
      const nextNewline = content.indexOf('\n', lastImportIndex);
      content = content.slice(0, nextNewline + 1) + importStatement + content.slice(nextNewline + 1);
    }
    
    // إضافة cn import إذا لم يكن موجوداً
    if (!content.includes("from '@/lib/utils'")) {
      content = content.replace(importStatement, importStatement + "import { cn } from '@/lib/utils';\n");
    }
  }
  
  return { content, updated };
}

/**
 * معالجة ملف واحد
 */
function processFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf-8');
    const originalContent = content;
    
    let hasChanges = false;
    
    // تطبيق تحديثات SmartImage
    if (content.includes('SmartImage')) {
      const result = updateSmartImage(content, filePath);
      content = result.content;
      hasChanges = hasChanges || result.updated;
    }
    
    // تطبيق Component Variants
    if (content.includes('bg-white') && content.includes('dark:bg-')) {
      const result = addComponentVariants(content);
      content = result.content;
      hasChanges = hasChanges || result.updated;
    }
    
    // حفظ الملف إذا تم التعديل
    if (hasChanges && content !== originalContent) {
      fs.writeFileSync(filePath, content, 'utf-8');
      stats.filesProcessed++;
      console.log(`✅ Updated: ${path.relative(process.cwd(), filePath)}`);
    }
    
  } catch (error) {
    stats.errors.push({ file: filePath, error: error.message });
    console.error(`❌ Error processing ${filePath}:`, error.message);
  }
}

/**
 * معالجة جميع الملفات
 */
function processAllFiles() {
  console.log('🚀 Starting improvements application...\n');
  
  // البحث عن جميع ملفات TSX/TS
  const files = glob.sync('src/**/*.{tsx,ts}', {
    ignore: ['**/node_modules/**', '**/*.d.ts', '**/dist/**'],
    cwd: process.cwd(),
  });
  
  console.log(`📁 Found ${files.length} files to process\n`);
  
  files.forEach(processFile);
  
  // طباعة الإحصائيات
  console.log('\n' + '='.repeat(50));
  console.log('📊 Summary:');
  console.log('='.repeat(50));
  console.log(`✅ Files processed: ${stats.filesProcessed}`);
  console.log(`🖼️  SmartImage updated: ${stats.smartImageUpdated}`);
  console.log(`🎨 Component Variants added: ${stats.variantsAdded}`);
  
  if (stats.errors.length > 0) {
    console.log(`\n❌ Errors: ${stats.errors.length}`);
    stats.errors.forEach(({ file, error }) => {
      console.log(`   - ${file}: ${error}`);
    });
  }
  
  console.log('\n✨ Done!');
}

// تشغيل
processAllFiles();
