#!/usr/bin/env node
/**
 * Design Tokens Migration Dashboard
 * لوحة تحكم تفاعلية لتتبع تقدم المشروع
 * 
 * Usage:
 *   npm run migration:dashboard
 */

import * as fs from 'fs';
import * as path from 'path';
import chalk from 'chalk';
import ora from 'ora';

// ================================================
// Types
// ================================================

interface FileProgress {
  path: string;
  status: 'pending' | 'in-progress' | 'completed' | 'failed';
  priority: 1 | 2 | 3;
  category: string;
  migratedAt?: Date;
  replacements?: number;
  errors?: string[];
}

interface ScanResult {
  path: string;
  needsMigration: boolean;
  score: number; // 0-100, higher = more urgent
  issues: {
    darkModeClasses: number;
    hardCodedColors: number;
    hardCodedSpacing: number;
    inlineStyles: number;
    framerMotionInline: number;       // Inline animations (should use variants)
    framerMotionConditional: number;  // Missing AnimatePresence
    framerMotionHeavy: number;        // Heavy animations (width/height)
    fileSize: number; // number of lines
    exceedsMaxLines: boolean; // > 300 lines
  };
  patterns: string[];
  category: string;
  estimatedTime: number; // minutes
  recommendations: string[]; // What to fix
}

interface MigrationProgress {
  lastUpdated: Date;
  files: FileProgress[];
  stats: {
    total: number;
    completed: number;
    inProgress: number;
    pending: number;
    failed: number;
  };
}

// ================================================
// Configuration
// ================================================

const PROGRESS_FILE = path.join(process.cwd(), '.migration-progress.json');

const FILE_LIST: FileProgress[] = [
  // Priority 1 - Core Components
  { path: 'src/components/PaymentHistoryItem.tsx', status: 'completed', priority: 1, category: 'Payment' },
  { path: 'src/features/payments/components/DetailRow.tsx', status: 'pending', priority: 1, category: 'Payment' },
  { path: 'src/features/payments/components/PaymentCard.tsx', status: 'pending', priority: 1, category: 'Payment' },
  { path: 'src/features/notifications/components/NotificationItem.tsx', status: 'completed', priority: 1, category: 'Notification' },
  { path: 'src/features/notifications/components/NotificationFilter.tsx', status: 'pending', priority: 1, category: 'Notification' },
  { path: 'src/features/profile/components/ProfileHeader.tsx', status: 'pending', priority: 1, category: 'Profile' },
  { path: 'src/features/profile/components/SubscriptionsSection.tsx', status: 'pending', priority: 1, category: 'Profile' },
  { path: 'src/features/auth/components/GlobalAuthSheet.tsx', status: 'pending', priority: 1, category: 'Auth' },
  { path: 'src/features/auth/components/UnlinkedStateBanner.tsx', status: 'pending', priority: 1, category: 'Auth' },
  
  // Priority 2 - Page Components
  { path: 'src/pages/academy/index.tsx', status: 'pending', priority: 2, category: 'Academy' },
  { path: 'src/pages/academy/course/[id].tsx', status: 'pending', priority: 2, category: 'Academy' },
  { path: 'src/pages/academy/bundle/[id].tsx', status: 'pending', priority: 2, category: 'Academy' },
  { path: 'src/pages/academy/category/[id].tsx', status: 'pending', priority: 2, category: 'Academy' },
  { path: 'src/pages/shop/index.tsx', status: 'pending', priority: 2, category: 'Shop' },
  { path: 'src/pages/shop/signals.tsx', status: 'pending', priority: 2, category: 'Shop' },
  { path: 'src/pages/forex.tsx', status: 'pending', priority: 2, category: 'Trading' },
  { path: 'src/pages/indicators.tsx', status: 'pending', priority: 2, category: 'Trading' },
  
  // Priority 3 - Shared Components
  { path: 'src/shared/components/common/ServiceCardV2.tsx', status: 'pending', priority: 3, category: 'Common' },
  { path: 'src/shared/components/common/SkeletonLoaders.tsx', status: 'pending', priority: 3, category: 'Common' },
  { path: 'src/shared/components/common/InviteAlert.tsx', status: 'pending', priority: 3, category: 'Common' },
  { path: 'src/shared/components/layout/Navbar.tsx', status: 'pending', priority: 3, category: 'Layout' },
  { path: 'src/shared/components/layout/NavbarEnhanced.tsx', status: 'pending', priority: 3, category: 'Layout' },
  { path: 'src/shared/components/layout/BackHeader.tsx', status: 'pending', priority: 3, category: 'Layout' },
  { path: 'src/shared/components/layout/FooterNav.tsx', status: 'pending', priority: 3, category: 'Layout' },
];

// ================================================
// Smart File Scanner
// ================================================

/**
 * Patterns to detect files that need migration
 */
const DETECTION_PATTERNS = {
  // Dark mode classes - highest priority
  darkMode: /dark:[a-z-]+/g,
  
  // Hard-coded colors (Tailwind)
  hardCodedColors: /(?:text|bg|border)-(?:gray|slate|neutral|white|black|red|blue|green|yellow|amber|emerald|rose)-\d+/g,
  
  // Hard-coded spacing
  hardCodedSpacing: /(?:p|m|gap|space)-\d+/g,
  
  // Inline hex/rgb colors
  inlineColors: /#[0-9a-fA-F]{3,6}|rgb\(|rgba\(/g,
  
  // Framer Motion issues
  framerMotion: {
    // Inline animations (should use variants)
    inlineAnimations: /<motion\.\w+\s+(?:initial|animate|exit)=\{\{/g,
    
    // Missing AnimatePresence for conditional rendering
    conditionalWithoutPresence: /\{[\w\s&&||!]+&&\s*<motion\./g,
    
    // Heavy animations (width, height)
    heavyAnimations: /animate=\{\{[^}]*(width|height):/g,
  }
};

/**
 * Scan a single file and determine if it needs migration
 */
function scanFile(filePath: string): ScanResult | null {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    
    // Skip special files that are allowed to use dark: classes
    const fileName = path.basename(filePath);
    const isVariantsFile = fileName === 'variants.ts' || fileName === 'variants.tsx';
    const isTokensFile = filePath.includes('/styles/tokens/');
    const isConfigFile = fileName.includes('tailwind.config') || fileName.includes('postcss.config');
    
    if (isVariantsFile || isTokensFile || isConfigFile) {
      return null; // These files are allowed to have dark: classes and hard-coded colors
    }
    
    // Count lines
    const lines = content.split('\n');
    const fileSize = lines.length;
    const exceedsMaxLines = fileSize > 300;
    
    // Skip if already using design tokens (unless file is too large)
    const usesTokens = content.includes("from '@/styles/tokens'") || content.includes('from "@/styles/tokens"');
    
    // Count issues
    const darkModeMatches = content.match(DETECTION_PATTERNS.darkMode) || [];
    const colorMatches = content.match(DETECTION_PATTERNS.hardCodedColors) || [];
    const spacingMatches = content.match(DETECTION_PATTERNS.hardCodedSpacing) || [];
    const inlineColorMatches = content.match(DETECTION_PATTERNS.inlineColors) || [];
    
    // Framer Motion issues
    const inlineAnimationsMatches = content.match(DETECTION_PATTERNS.framerMotion.inlineAnimations) || [];
    const conditionalMotionMatches = content.match(DETECTION_PATTERNS.framerMotion.conditionalWithoutPresence) || [];
    const heavyAnimationsMatches = content.match(DETECTION_PATTERNS.framerMotion.heavyAnimations) || [];
    const usesFramerMotion = content.includes('framer-motion');
    
    const issues = {
      darkModeClasses: darkModeMatches.length,
      hardCodedColors: colorMatches.length,
      hardCodedSpacing: spacingMatches.length,
      inlineStyles: inlineColorMatches.length,
      framerMotionInline: inlineAnimationsMatches.length,
      framerMotionConditional: conditionalMotionMatches.length,
      framerMotionHeavy: heavyAnimationsMatches.length,
      fileSize,
      exceedsMaxLines,
    };
    
    const totalIssues = 
      issues.darkModeClasses +
      issues.hardCodedColors +
      issues.hardCodedSpacing +
      issues.inlineStyles +
      issues.framerMotionInline +
      issues.framerMotionConditional +
      issues.framerMotionHeavy +
      (exceedsMaxLines ? 1 : 0);
    
    // Skip if no issues
    if (totalIssues === 0) {
      return null;
    }
    
    // Skip if only file size issue but uses tokens
    if (usesTokens && totalIssues === 1 && exceedsMaxLines) {
      // File uses tokens, only issue is size - lower priority
      // Still report but with lower score
    }
    
    // Calculate priority score (0-100)
    let score = Math.min(100, 
      (issues.darkModeClasses * 5) +     // Dark mode is highest priority
      (issues.hardCodedColors * 2) +
      (issues.hardCodedSpacing * 1) +
      (issues.inlineStyles * 3) +
      (issues.framerMotionInline * 3) +  // Inline animations should use variants
      (issues.framerMotionConditional * 2) + // Missing AnimatePresence
      (issues.framerMotionHeavy * 4) +   // Heavy animations are bad for performance
      (exceedsMaxLines ? 20 : 0)         // File size violation is important
    );
    
    // Estimate time (1 min per 3 issues, minimum 5 min)
    // Add extra time for large files
    let estimatedTime = Math.max(5, Math.ceil(totalIssues / 3));
    if (exceedsMaxLines) {
      estimatedTime += Math.ceil((fileSize - 300) / 50); // +1 min per 50 extra lines
    }
    
    // Determine category from path
    const category = getCategoryFromPath(filePath);
    
    // Get unique patterns found
    const patterns = [...new Set([
      ...darkModeMatches.slice(0, 3),
      ...colorMatches.slice(0, 3),
    ])].slice(0, 5);
    
    // Generate recommendations
    const recommendations: string[] = [];
    
    // Check for duplicate files (same filename in src/components/ and src/features/)
    const componentName = path.basename(filePath);
    const isInOldLocation = filePath.includes('/src/components/') && !filePath.includes('/src/components/ui/');
    if (isInOldLocation && componentName.includes('Modal')) {
      recommendations.push(`⚠️ DUPLICATE: Move to features/ and delete from components/`);
    }
    
    if (exceedsMaxLines) {
      recommendations.push(`📏 Split file into smaller components (${fileSize} lines → max 300)`);
    }
    if (issues.darkModeClasses > 0) {
      recommendations.push(`🎨 Replace ${issues.darkModeClasses} dark: classes with Design Tokens`);
    }
    if (issues.hardCodedColors > 0) {
      recommendations.push(`🖌️ Replace ${issues.hardCodedColors} hard-coded colors with tokens`);
    }
    if (issues.hardCodedSpacing > 0) {
      recommendations.push(`📐 Use spacing tokens for ${issues.hardCodedSpacing} spacing values`);
    }
    if (!usesTokens && (issues.darkModeClasses > 0 || issues.hardCodedColors > 0)) {
      recommendations.push(`✅ Add: import { colors } from '@/styles/tokens'`);
    }
    
    // Framer Motion recommendations
    if (usesFramerMotion) {
      if (issues.framerMotionInline > 0) {
        recommendations.push(`🎬 Extract ${issues.framerMotionInline} inline animations to reusable variants`);
      }
      if (issues.framerMotionConditional > 0) {
        recommendations.push(`🎭 Wrap ${issues.framerMotionConditional} conditional motion elements with <AnimatePresence>`);
      }
      if (issues.framerMotionHeavy > 0) {
        recommendations.push(`⚡ Replace ${issues.framerMotionHeavy} heavy animations (width/height) with transform-based ones`);
      }
      if (issues.framerMotionInline > 0 || issues.framerMotionConditional > 0) {
        recommendations.push(`📖 See: DESIGN_SYSTEM.md → Framer Motion section`);
      }
    }
    
    return {
      path: filePath.replace(/\\/g, '/'),
      needsMigration: true,
      score,
      issues,
      patterns,
      category,
      estimatedTime,
      recommendations,
    };
  } catch (error) {
    return null;
  }
}

/**
 * Get category from file path
 */
function getCategoryFromPath(filePath: string): string {
  if (filePath.includes('/payments/')) return 'Payment';
  if (filePath.includes('/notifications/')) return 'Notification';
  if (filePath.includes('/profile/')) return 'Profile';
  if (filePath.includes('/auth/')) return 'Auth';
  if (filePath.includes('/academy/')) return 'Academy';
  if (filePath.includes('/shop/')) return 'Shop';
  if (filePath.includes('/trading/') || filePath.includes('forex') || filePath.includes('indicators')) return 'Trading';
  if (filePath.includes('/layout/')) return 'Layout';
  if (filePath.includes('/common/')) return 'Common';
  if (filePath.includes('/components/')) return 'Components';
  return 'Other';
}

/**
 * Recursively find all files in directory
 */
function findFilesRecursive(dir: string, pattern: RegExp, exclude: RegExp): string[] {
  const results: string[] = [];
  
  try {
    const items = fs.readdirSync(dir, { withFileTypes: true });
    
    for (const item of items) {
      const fullPath = path.join(dir, item.name);
      
      // Skip excluded patterns
      if (exclude.test(fullPath)) {
        continue;
      }
      
      if (item.isDirectory()) {
        results.push(...findFilesRecursive(fullPath, pattern, exclude));
      } else if (item.isFile() && pattern.test(item.name)) {
        results.push(fullPath);
      }
    }
  } catch (error) {
    // Skip directories we can't read
  }
  
  return results;
}

/**
 * Scan all TypeScript/TSX files in src directory
 */
async function scanAllFiles(): Promise<ScanResult[]> {
  const srcDir = path.join(process.cwd(), 'src');
  
  // Find all .tsx and .ts files (exclude .d.ts, spec, test files)
  const filePattern = /\.(tsx|ts)$/;
  const excludePattern = /\.(d\.ts|spec\.ts|test\.ts|spec\.tsx|test\.tsx)$|node_modules/;
  
  const files = findFilesRecursive(srcDir, filePattern, excludePattern);
  
  const results: ScanResult[] = [];
  
  for (const file of files) {
    const result = scanFile(file);
    if (result) {
      results.push(result);
    }
  }
  
  // Sort by score (highest priority first)
  return results.sort((a, b) => b.score - a.score);
}

/**
 * Display scan results - top 2-3 files that need migration
 */
function displayScanResults(results: ScanResult[]) {
  if (results.length === 0) {
    console.log(chalk.green('\n✅ All files follow Design System rules! 🎉\n'));
    console.log(chalk.gray('  • All files < 300 lines'));
    console.log(chalk.gray('  • Using Design Tokens'));
    console.log(chalk.gray('  • Following best practices\n'));
    return;
  }
  
  console.log(chalk.bold.yellow('\n🔍 Design System Compliance Scan:\n'));
  console.log(chalk.gray(`  Found ${results.length} files that need attention\n`));
  
  // Show top 2-3 files only (as requested)
  const topFiles = results.slice(0, 3);
  
  console.log(chalk.bold('📋 Top Priority Files (Manual Fix Required):\n'));
  
  topFiles.forEach((result, index) => {
    const fileName = path.basename(result.path);
    const relPath = result.path.replace(process.cwd().replace(/\\/g, '/') + '/src/', 'src/');
    
    // Score indicator
    const scoreColor = result.score > 50 ? chalk.red : result.score > 25 ? chalk.yellow : chalk.cyan;
    const urgency = result.score > 50 ? '🔴 CRITICAL' : result.score > 25 ? '🟡 HIGH' : '🟢 MEDIUM';
    
    console.log(`  ${chalk.bold.white(`${index + 1}.`)} ${urgency} ${chalk.bold(fileName)} ${scoreColor(`[Score: ${result.score}]`)}`);
    console.log(`     ${chalk.gray(relPath)}`);
    console.log(`     ${chalk.cyan('Category:')} ${result.category} ${chalk.gray('|')} ${chalk.cyan('Time:')} ~${result.estimatedTime}min ${chalk.gray('|')} ${chalk.cyan('Size:')} ${result.issues.fileSize} lines`);
    
    // Show issues breakdown
    const issuesList: string[] = [];
    if (result.issues.exceedsMaxLines) {
      issuesList.push(`${chalk.red('⚠️  Exceeds 300 lines')}`);
    }
    if (result.issues.darkModeClasses > 0) {
      issuesList.push(`${chalk.magenta(result.issues.darkModeClasses)} dark: classes`);
    }
    if (result.issues.hardCodedColors > 0) {
      issuesList.push(`${chalk.yellow(result.issues.hardCodedColors)} hard-coded colors`);
    }
    if (result.issues.hardCodedSpacing > 0) {
      issuesList.push(`${chalk.blue(result.issues.hardCodedSpacing)} spacing values`);
    }
    if (result.issues.framerMotionInline > 0) {
      issuesList.push(`${chalk.cyan(result.issues.framerMotionInline)} inline animations`);
    }
    if (result.issues.framerMotionConditional > 0) {
      issuesList.push(`${chalk.yellow(result.issues.framerMotionConditional)} missing AnimatePresence`);
    }
    if (result.issues.framerMotionHeavy > 0) {
      issuesList.push(`${chalk.red(result.issues.framerMotionHeavy)} heavy animations`);
    }
    
    if (issuesList.length > 0) {
      console.log(`     ${chalk.gray('Issues:')} ${issuesList.join(', ')}`);
    }
    
    // Show recommendations
    if (result.recommendations.length > 0) {
      console.log(`     ${chalk.cyan('Required Actions:')}`);
      result.recommendations.forEach(rec => {
        console.log(`     ${chalk.gray('•')} ${rec}`);
      });
    }
    
    // Show example patterns (only if relevant)
    if (result.patterns.length > 0 && !result.issues.exceedsMaxLines) {
      const examples = result.patterns.slice(0, 2).join(', ');
      console.log(`     ${chalk.gray('Examples:')} ${chalk.dim(examples)}`);
    }
    
    console.log();
  });
  
  // Summary
  const totalTime = topFiles.reduce((sum, r) => sum + r.estimatedTime, 0);
  console.log(chalk.bold('⏱️  Estimated time for top 3: ') + chalk.cyan(`~${totalTime} minutes\n`));
  
  // Show remaining count
  if (results.length > 3) {
    console.log(chalk.gray(`  💡 ${results.length - 3} more files need attention (run again after fixing these)\n`));
  }
  
  // Show design system reference
  console.log(chalk.bold.cyan('═'.repeat(62)));
  console.log(chalk.yellow('\n📖 Design System Reference:\n'));
  console.log(chalk.gray('   DESIGN_SYSTEM.md - دليل نظام التصميم'));
  console.log(chalk.gray('   docs/design/DESIGN_TOKENS_GUIDE.md - دليل Design Tokens'));
  console.log(chalk.gray('   docs/design/ANIMATIONS_GUIDE.md - دليل Animations'));
  console.log(chalk.gray('   docs/design/UX_ISSUES.md - مشاكل UX'));
  console.log(chalk.gray('   docs/design/UI_ISSUES.md - مشاكل UI'));
  console.log(chalk.gray('   docs/design/ACTION_PLAN.md - خطة العمل\n'));
  console.log(chalk.bold.cyan('═'.repeat(62)));
  console.log(chalk.yellow('  Next Steps:'));
  console.log(chalk.gray('    1. Pick a file from the list above'));
  console.log(chalk.gray('    2. Open it in your editor'));
  console.log(chalk.gray('    3. Apply Design Tokens manually'));
  console.log(chalk.gray('    4. Run: npm run test:visual (to verify)'));
}

// ================================================
// Progress Management
// ================================================

function loadProgress(): MigrationProgress {
  if (fs.existsSync(PROGRESS_FILE)) {
    const data = fs.readFileSync(PROGRESS_FILE, 'utf-8');
    const parsed = JSON.parse(data);
    
    // Merge with current file list
    const files = FILE_LIST.map(file => {
      const saved = parsed.files.find((f: FileProgress) => f.path === file.path);
      return saved || file;
    });
    
    return {
      ...parsed,
      files,
      lastUpdated: new Date(parsed.lastUpdated),
    };
  }
  
  return {
    lastUpdated: new Date(),
    files: FILE_LIST,
    stats: calculateStats(FILE_LIST),
  };
}

function saveProgress(progress: MigrationProgress) {
  fs.writeFileSync(PROGRESS_FILE, JSON.stringify(progress, null, 2));
}

function calculateStats(files: FileProgress[]) {
  return {
    total: files.length,
    completed: files.filter(f => f.status === 'completed').length,
    inProgress: files.filter(f => f.status === 'in-progress').length,
    pending: files.filter(f => f.status === 'pending').length,
    failed: files.filter(f => f.status === 'failed').length,
  };
}

// ================================================
// Display Functions
// ================================================

function displayHeader() {
  console.clear();
  console.log(chalk.bold.cyan('\n╔════════════════════════════════════════════════════════════╗'));
  console.log(chalk.bold.cyan('║     🎨 Design System Compliance Dashboard                ║'));
  console.log(chalk.bold.cyan('║     v3.0 - UX/UI Improvements Integrated               ║'));
  console.log(chalk.bold.cyan('╚════════════════════════════════════════════════════════════╝\n'));
}

function displayStats(progress: MigrationProgress) {
  const { stats } = progress;
  const percentage = ((stats.completed / stats.total) * 100).toFixed(1);
  
  console.log(chalk.bold('📊 Overall Progress:\n'));
  
  // Progress bar
  const barWidth = 40;
  const filled = Math.round((stats.completed / stats.total) * barWidth);
  const empty = barWidth - filled;
  const bar = chalk.green('█'.repeat(filled)) + chalk.gray('░'.repeat(empty));
  
  console.log(`  ${bar} ${chalk.bold.cyan(percentage + '%')}`);
  console.log(`  ${chalk.green(stats.completed)}/${stats.total} files completed\n`);
  
  // Detailed stats
  console.log(chalk.bold('📈 Breakdown:\n'));
  console.log(`  ${chalk.green('✓')} Completed:    ${chalk.bold(stats.completed.toString().padStart(3))} files`);
  console.log(`  ${chalk.yellow('⋯')} In Progress:  ${chalk.bold(stats.inProgress.toString().padStart(3))} files`);
  console.log(`  ${chalk.gray('○')} Pending:      ${chalk.bold(stats.pending.toString().padStart(3))} files`);
  if (stats.failed > 0) {
    console.log(`  ${chalk.red('✗')} Failed:       ${chalk.bold(stats.failed.toString().padStart(3))} files`);
  }
  console.log();
}

function displayPriorities(progress: MigrationProgress) {
  console.log(chalk.bold('🎯 By Priority:\n'));
  
  [1, 2, 3].forEach(priority => {
    const files = progress.files.filter(f => f.priority === priority);
    const completed = files.filter(f => f.status === 'completed').length;
    const percentage = ((completed / files.length) * 100).toFixed(0);
    
    const icon = priority === 1 ? '🔴' : priority === 2 ? '🟡' : '🟢';
    const label = priority === 1 ? 'High' : priority === 2 ? 'Medium' : 'Low';
    
    const barWidth = 20;
    const filled = Math.round((completed / files.length) * barWidth);
    const bar = '█'.repeat(filled) + '░'.repeat(barWidth - filled);
    
    console.log(`  ${icon} Priority ${priority} (${label}):`);
    console.log(`     ${bar} ${percentage}% (${completed}/${files.length})`);
  });
  console.log();
}

function displayCategories(progress: MigrationProgress) {
  console.log(chalk.bold('📁 By Category:\n'));
  
  const categories = [...new Set(progress.files.map(f => f.category))];
  
  categories.forEach(category => {
    const files = progress.files.filter(f => f.category === category);
    const completed = files.filter(f => f.status === 'completed').length;
    
    const statusIcon = completed === files.length ? chalk.green('✓') : 
                       completed > 0 ? chalk.yellow('⋯') : chalk.gray('○');
    
    console.log(`  ${statusIcon} ${category.padEnd(15)} ${completed}/${files.length}`);
  });
  console.log();
}

function displayRecentActivity(progress: MigrationProgress) {
  const completed = progress.files
    .filter(f => f.status === 'completed' && f.migratedAt)
    .sort((a, b) => {
      const dateA = a.migratedAt ? new Date(a.migratedAt).getTime() : 0;
      const dateB = b.migratedAt ? new Date(b.migratedAt).getTime() : 0;
      return dateB - dateA;
    })
    .slice(0, 5);
  
  if (completed.length > 0) {
    console.log(chalk.bold('🕐 Recent Activity:\n'));
    
    completed.forEach(file => {
      const fileName = path.basename(file.path);
      const date = file.migratedAt ? new Date(file.migratedAt).toLocaleString() : '';
      const replacements = file.replacements || 0;
      
      console.log(`  ${chalk.green('✓')} ${fileName}`);
      console.log(`     ${chalk.gray(date)} - ${replacements} changes`);
    });
    console.log();
  }
}

function displayTimeEstimate(progress: MigrationProgress) {
  const { stats } = progress;
  const remainingFiles = stats.total - stats.completed;
  
  // Average 15 minutes per file (conservative estimate)
  const minutesPerFile = 15;
  const totalMinutes = remainingFiles * minutesPerFile;
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  
  console.log(chalk.bold('⏱️  Time Estimate:\n'));
  console.log(`  Remaining files: ${chalk.yellow(remainingFiles)}`);
  console.log(`  Estimated time:  ${chalk.cyan(`${hours}h ${minutes}m`)}`);
  console.log(`  Last updated:    ${chalk.gray(progress.lastUpdated.toLocaleString())}\n`);
}

function displayNextSteps(progress: MigrationProgress) {
  const nextFiles = progress.files
    .filter(f => f.status === 'pending')
    .sort((a, b) => a.priority - b.priority)
    .slice(0, 5);
  
  if (nextFiles.length > 0) {
    console.log(chalk.bold('📝 Next Steps:\n'));
    
    nextFiles.forEach((file, index) => {
      const fileName = path.basename(file.path);
      const priorityIcon = file.priority === 1 ? '🔴' : file.priority === 2 ? '🟡' : '🟢';
      
      console.log(`  ${index + 1}. ${priorityIcon} ${fileName}`);
      console.log(`     ${chalk.gray(file.path)}`);
    });
    console.log();
  }
}

function displayFooter() {
  console.log(chalk.bold.cyan('═'.repeat(62)));
  console.log(chalk.gray('\n  Commands:'));
  console.log(chalk.gray('    npm run migrate:tokens <file>  - Migrate a file'));
  console.log(chalk.gray('    npm run migration:dashboard    - Update this dashboard'));
  console.log(chalk.gray('    npm run test:visual            - Run visual regression tests\n'));
}

// ================================================
// Main
// ================================================

async function main() {
  const args = process.argv.slice(2);
  const shouldScan = args.includes('--scan') || args.includes('-s');
  
  // Auto-scan mode
  if (shouldScan) {
    const spinner = ora('🔍 Scanning all files in src/...').start();
    
    try {
      const results = await scanAllFiles();
      spinner.succeed(`Scan complete! Found ${results.length} files`);
      
      displayHeader();
      displayScanResults(results);
      
      // Show commands
      console.log(chalk.bold.cyan('═'.repeat(62)));
      console.log(chalk.gray('\n  Next Steps:'));
      console.log(chalk.gray('    1. Pick a file from the list above'));
      console.log(chalk.gray('    2. Open it in your editor'));
      console.log(chalk.gray('    3. Apply Design Tokens manually'));
      console.log(chalk.gray('    4. Run: npm run test:visual (to verify)\n'));
      
      return;
    } catch (error) {
      spinner.fail('Scan failed');
      throw error;
    }
  }
  
  // Normal dashboard mode
  const spinner = ora('Loading migration progress...').start();
  
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const progress = loadProgress();
  progress.stats = calculateStats(progress.files);
  
  spinner.succeed('Progress loaded');
  
  // Display dashboard
  displayHeader();
  displayStats(progress);
  displayPriorities(progress);
  displayCategories(progress);
  displayRecentActivity(progress);
  displayTimeEstimate(progress);
  displayNextSteps(progress);
  displayFooter();
  
  console.log(chalk.yellow('\n💡 Tip: Run with --scan to auto-detect files that need migration\n'));
  console.log(chalk.gray('   Example: npm run migration:dashboard -- --scan\n'));
  
  // Save updated progress
  saveProgress(progress);
}

main().catch(error => {
  console.error(chalk.red('\n❌ Error:'), error);
  process.exit(1);
});
