/**
 * Replace framer-motion with CSS animations
 * يستبدل الحركات البسيطة من framer-motion بـ CSS animations
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

const stats = {
  filesProcessed: 0,
  replacements: 0,
  errors: [],
};

/**
 * Patterns للاستبدال
 */
const patterns = [
  // Pattern 1: Fade In
  {
    name: 'Fade In',
    regex: /<motion\.(\w+)\s+initial={{\s*opacity:\s*0\s*}}\s+animate={{\s*opacity:\s*1\s*}}[^>]*>/g,
    replacement: '<$1 className="animate-fade-in">',
    cssClass: 'animate-fade-in'
  },
  
  // Pattern 2: Slide Up
  {
    name: 'Slide Up',
    regex: /<motion\.(\w+)\s+initial={{\s*opacity:\s*0,\s*y:\s*\d+\s*}}\s+animate={{\s*opacity:\s*1,\s*y:\s*0\s*}}[^>]*>/g,
    replacement: '<$1 className="animate-slide-up">',
    cssClass: 'animate-slide-up'
  },
  
  // Pattern 3: Scale In
  {
    name: 'Scale In',
    regex: /<motion\.(\w+)\s+initial={{\s*opacity:\s*0,\s*scale:\s*[\d.]+\s*}}\s+animate={{\s*opacity:\s*1,\s*scale:\s*1\s*}}[^>]*>/g,
    replacement: '<$1 className="animate-scale-in">',
    cssClass: 'animate-scale-in'
  },
  
  // Pattern 4: Closing motion tags
  {
    name: 'Closing motion tags',
    regex: /<\/motion\.(\w+)>/g,
    replacement: '</$1>',
    cssClass: null
  },
  
  // Pattern 5: Self-closing motion tags with simple animations
  {
    name: 'Self-closing motion tags',
    regex: /<motion\.(\w+)([^>]*?)\/>/g,
    replacement: '<$1$2 />',
    cssClass: null
  }
];

/**
 * معالجة ملف واحد
 */
function processFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf-8');
    const originalContent = content;
    
    let fileReplacements = 0;
    
    // تطبيق جميع الأنماط
    patterns.forEach(({ name, regex, replacement }) => {
      const matches = content.match(regex);
      if (matches) {
        fileReplacements += matches.length;
        content = content.replace(regex, replacement);
      }
    });
    
    // إزالة import غير المستخدمة من framer-motion
    if (!content.includes('motion.') && !content.includes('AnimatePresence') && !content.includes('motion,')) {
      content = content.replace(/import\s*{\s*motion\s*}\s*from\s*['"]framer-motion['"]\n?/g, '');
      content = content.replace(/import\s*{\s*([^}]*),\s*motion\s*}\s*from\s*['"]framer-motion['"]/g, 'import { $1 } from "framer-motion"');
      content = content.replace(/import\s*{\s*motion\s*,\s*([^}]*)\s*}\s*from\s*['"]framer-motion['"]/g, 'import { $1 } from "framer-motion"');
    }
    
    // حفظ الملف إذا تم التعديل
    if (fileReplacements > 0 && content !== originalContent) {
      fs.writeFileSync(filePath, content, 'utf-8');
      stats.filesProcessed++;
      stats.replacements += fileReplacements;
      console.log(`✅ ${path.relative(process.cwd(), filePath)}: ${fileReplacements} replacements`);
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
  console.log('🚀 Starting framer-motion replacement...\n');
  
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
  console.log(`🔄 Total replacements: ${stats.replacements}`);
  
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
