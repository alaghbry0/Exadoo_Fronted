#!/usr/bin/env node
/**
 * Design Tokens Migration Dashboard + UI Dedup Scanner
 * لوحة تحكم + ماسح لاكتشاف المكوّنات المكررة وتوحيد الاستيرادات إلى @/components/ui/*
 *
 * Usage:
 *   npm run migration:dashboard
 *   npm run migration:dashboard -- --scan
 *   npm run migration:dashboard -- --scan-ui
 *   npm run migration:dashboard -- --scan-ui --rewrite-imports
 */

import * as fs from 'fs';
import * as path from 'path';
import chalk from 'chalk';
import ora from 'ora';

const isInteractive = process.stdout.isTTY && !process.env.NON_INTERACTIVE;

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

interface DuplicateComponentReport {
  name: string;                // Component name (PascalCase)
  files: string[];             // All occurrences (absolute paths)
  canonicalPath: string | null; // absolute canonical path in src/components/ui if exists
  suggestedCanonicalImport: string; // '@/components/ui/<filename>'
  createdCanonicalFilename: string; // filename to use if missing
  rewriteCandidates: {
    file: string;             // absolute path to source file importing it
    fromImport: string;       // the alias import source detected
    toImport: string;         // target alias '@/components/ui/<file>'
  }[];
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
// Smart File Scanner (Design System)
// ================================================

const DETECTION_PATTERNS = {
  darkMode: /dark:[a-z-]+/g,
  hardCodedColors: /(?:text|bg|border)-(?:gray|slate|neutral|white|black|red|blue|green|yellow|amber|emerald|rose)-\d+/g,
  hardCodedSpacing: /(?:p|m|gap|space)-\d+/g,
  inlineColors: /#[0-9a-fA-F]{3,6}|rgb\(|rgba\(/g,
  framerMotion: {
    inlineAnimations: /<motion\.\w+\s+(?:initial|animate|exit)=\{\{/g,
    conditionalWithoutPresence: /\{[\w\s&&||!]+&&\s*<motion\./g,
    heavyAnimations: /animate=\{\{[^}]*(width|height):/g,
  }
};

function scanFile(filePath: string): ScanResult | null {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');

    const fileName = path.basename(filePath);
    const isVariantsFile = fileName === 'variants.ts' || fileName === 'variants.tsx';
    const isTokensFile = filePath.includes('/styles/tokens/');
    const isConfigFile = fileName.includes('tailwind.config') || fileName.includes('postcss.config');
    if (isVariantsFile || isTokensFile || isConfigFile) return null;

    const lines = content.split('\n');
    const fileSize = lines.length;
    const exceedsMaxLines = fileSize > 300;

    const usesTokens = content.includes("from '@/styles/tokens'") || content.includes('from "@/styles/tokens"');

    const darkModeMatches = content.match(DETECTION_PATTERNS.darkMode) || [];
    const colorMatches = content.match(DETECTION_PATTERNS.hardCodedColors) || [];
    const spacingMatches = content.match(DETECTION_PATTERNS.hardCodedSpacing) || [];
    const inlineColorMatches = content.match(DETECTION_PATTERNS.inlineColors) || [];

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

    if (totalIssues === 0) return null;

    const score = Math.min(100,
      (issues.darkModeClasses * 5) +
      (issues.hardCodedColors * 2) +
      (issues.hardCodedSpacing * 1) +
      (issues.inlineStyles * 3) +
      (issues.framerMotionInline * 3) +
      (issues.framerMotionConditional * 2) +
      (issues.framerMotionHeavy * 4) +
      (exceedsMaxLines ? 20 : 0)
    );

    let estimatedTime = Math.max(5, Math.ceil(totalIssues / 3));
    if (exceedsMaxLines) {
      estimatedTime += Math.ceil((fileSize - 300) / 50);
    }

    const category = getCategoryFromPath(filePath);

    const patterns = [...new Set([
      ...darkModeMatches.slice(0, 3),
      ...colorMatches.slice(0, 3),
    ])].slice(0, 5);

    const recommendations: string[] = [];

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
  } catch {
    return null;
  }
}

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

function findFilesRecursive(dir: string, pattern: RegExp, exclude: RegExp): string[] {
  const results: string[] = [];
  try {
    const items = fs.readdirSync(dir, { withFileTypes: true });
    for (const item of items) {
      const fullPath = path.join(dir, item.name);
      if (exclude.test(fullPath)) continue;
      if (item.isDirectory()) {
        results.push(...findFilesRecursive(fullPath, pattern, exclude));
      } else if (item.isFile() && pattern.test(item.name)) {
        results.push(fullPath);
      }
    }
  } catch {}
  return results;
}

async function scanAllFiles(): Promise<ScanResult[]> {
  const srcDir = path.join(process.cwd(), 'src');
  const filePattern = /\.(tsx|ts)$/;
  const excludePattern = /\.(d\.ts|spec\.ts|test\.ts|spec\.tsx|test\.tsx)$|node_modules/;
  const files = findFilesRecursive(srcDir, filePattern, excludePattern);

  const results: ScanResult[] = [];
  for (const file of files) {
    const result = scanFile(file);
    if (result) results.push(result);
  }
  return results.sort((a, b) => b.score - a.score);
}

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

  const topFiles = results.slice(0, 3);
  console.log(chalk.bold('📋 Top Priority Files (Manual Fix Required):\n'));

  topFiles.forEach((result, index) => {
    const fileName = path.basename(result.path);
    const relPath = result.path.replace(process.cwd().replace(/\\/g, '/') + '/src/', 'src/');
    const scoreColor = result.score > 50 ? chalk.red : result.score > 25 ? chalk.yellow : chalk.cyan;
    const urgency = result.score > 50 ? '🔴 CRITICAL' : result.score > 25 ? '🟡 HIGH' : '🟢 MEDIUM';

    console.log(`  ${chalk.bold.white(`${index + 1}.`)} ${urgency} ${chalk.bold(fileName)} ${scoreColor(`[Score: ${result.score}]`)}`);
    console.log(`     ${chalk.gray(relPath)}`);
    console.log(`     ${chalk.cyan('Category:')} ${result.category} ${chalk.gray('|')} ${chalk.cyan('Time:')} ~${result.estimatedTime}min ${chalk.gray('|')} ${chalk.cyan('Size:')} ${result.issues.fileSize} lines`);

    const issuesList: string[] = [];
    if (result.issues.exceedsMaxLines) issuesList.push(`${chalk.red('⚠️  Exceeds 300 lines')}`);
    if (result.issues.darkModeClasses > 0) issuesList.push(`${chalk.magenta(result.issues.darkModeClasses)} dark: classes`);
    if (result.issues.hardCodedColors > 0) issuesList.push(`${chalk.yellow(result.issues.hardCodedColors)} hard-coded colors`);
    if (result.issues.hardCodedSpacing > 0) issuesList.push(`${chalk.blue(result.issues.hardCodedSpacing)} spacing values`);
    if (result.issues.framerMotionInline > 0) issuesList.push(`${chalk.cyan(result.issues.framerMotionInline)} inline animations`);
    if (result.issues.framerMotionConditional > 0) issuesList.push(`${chalk.yellow(result.issues.framerMotionConditional)} missing AnimatePresence`);
    if (result.issues.framerMotionHeavy > 0) issuesList.push(`${chalk.red(result.issues.framerMotionHeavy)} heavy animations`);

    if (issuesList.length > 0) console.log(`     ${chalk.gray('Issues:')} ${issuesList.join(', ')}`);

    if (result.recommendations.length > 0) {
      console.log(`     ${chalk.cyan('Required Actions:')}`);
      result.recommendations.forEach(rec => console.log(`     ${chalk.gray('•')} ${rec}`));
    }

    if (result.patterns.length > 0 && !result.issues.exceedsMaxLines) {
      const examples = result.patterns.slice(0, 2).join(', ');
      console.log(`     ${chalk.gray('Examples:')} ${chalk.dim(examples)}`);
    }
    printf();
  });

  const totalTime = topFiles.reduce((sum, r) => sum + r.estimatedTime, 0);
  console.log(chalk.bold('⏱️  Estimated time for top 3: ') + chalk.cyan(`~${totalTime} minutes\n`));

  if (results.length > 3) {
    console.log(chalk.gray(`  💡 ${results.length - 3} more files need attention (run again after fixing these)\n`));
  }

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

function printf() {
  // small helper to add a blank line consistently
  console.log();
}

// ================================================
// UI Dedup Scanner (NEW)
// ================================================

const SRC_DIR = path.join(process.cwd(), 'src');
const UI_CANONICAL_DIR = path.join(SRC_DIR, 'components', 'ui');

function toPascalCase(name: string): string {
  return name
    .replace(/\.(tsx?|jsx?)$/i, '')
    .replace(/[-_ ]+(\w)/g, (_, c) => c.toUpperCase())
    .replace(/^\w/, c => c.toUpperCase());
}

function toKebabCase(name: string): string {
  return name
    .replace(/\.(tsx?|jsx?)$/i, '')
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/[_\s]+/g, '-')
    .toLowerCase();
}

function isLikelyUIComponent(filePath: string, content: string): boolean {
  // Heuristics: React component exporting JSX + UI-ish imports (radix, lucide, framer, tailwind classes)
  if (!/\bReact\b|from\s+['"]react['"]/.test(content)) return false;
  if (!/<[A-Z][A-Za-z0-9]*(\s|>)/.test(content)) return false; // JSX with capital tag
  const uiSignals = [
    '@radix-ui/',
    'lucide-react',
    'framer-motion',
    'className=',
    'cn(',
    'from "@/components/ui/',
    'from \'@/components/ui/',
  ];
  return uiSignals.some(sig => content.includes(sig));
}

function listTsFiles(root: string): string[] {
  return findFilesRecursive(root, /\.(tsx|ts|jsx|js)$/, /node_modules|\.d\.ts$/);
}

function gatherComponentOccurrences(): Map<string, string[]> {
  const files = listTsFiles(SRC_DIR);
  const map = new Map<string, string[]>();

  for (const file of files) {
    try {
      const content = fs.readFileSync(file, 'utf-8');
      if (!isLikelyUIComponent(file, content)) continue;

      const base = path.basename(file);
      const pascal = toPascalCase(base);

      const isInUi = file.includes(`${path.sep}components${path.sep}ui${path.sep}`);
      const isInFeature = file.includes(`${path.sep}features${path.sep}`);
      const isInShared = file.includes(`${path.sep}shared${path.sep}`) || file.includes(`${path.sep}components${path.sep}`) && !isInUi;

      if (isInUi || isInFeature || isInShared) {
        const current = map.get(pascal) || [];
        current.push(file);
        map.set(pascal, current);
      }
    } catch {}
  }
  return map;
}

function buildDuplicateReport(): DuplicateComponentReport[] {
  const occ = gatherComponentOccurrences();
  const reports: DuplicateComponentReport[] = [];

  occ.forEach((files, name) => {
    if (files.length < 2) return; // not duplicate
    // if one exists in UI canonical, prefer it; else suggest creating kebab filename in UI
    const canonicalExisting = files.find(f => f.includes(`${path.sep}components${path.sep}ui${path.sep}`)) || null;
    const filename = canonicalExisting
      ? path.basename(canonicalExisting).replace(/\.(tsx|ts|jsx|js)$/i, '')
      : toKebabCase(name); // shadcn-style filenames

    const suggestedCanonicalImport = `@/components/ui/${filename}`;
    const canonicalPath = canonicalExisting
      ? canonicalExisting
      : path.join(UI_CANONICAL_DIR, `${filename}.tsx`);

    // Build rewrite candidate list for alias-based imports
    const importUsers = listTsFiles(SRC_DIR);
    const rewriteCandidates: { file: string; fromImport: string; toImport: string }[] = [];
    for (const userFile of importUsers) {
      if (!fs.existsSync(userFile) || fs.statSync(userFile).isDirectory()) continue;
      try {
        const src = fs.readFileSync(userFile, 'utf-8');
        // find alias imports that reference the duplicate component file names by alias
        // conservative patterns:
        const possibleAliases = [
          '@/shared/',
          '@/features/',
          '@/components/',
        ];
        for (const dup of files) {
          const relAliasGuess = aliasGuessFromAbs(dup); // e.g. "@/shared/components/common/card"
          const baseNameNoExt = path.basename(dup).replace(/\.(tsx|ts|jsx|js)$/i, '');
          const directSpecCandidates = [
            relAliasGuess,
            relAliasGuess ? relAliasGuess.replace(/\\/g, '/') : '',
            // sometimes imports omit trailing file name but folder equals file name
            // keep conservative and rely on relAliasGuess mainly
          ].filter(Boolean);

          for (const spec of directSpecCandidates) {
            // Exact string import match using quotes
            const rx = new RegExp(`from\\s+['"]${escapeRegExp(spec)}['"]`);
            if (rx.test(src) && !spec.startsWith('@/components/ui/')) {
              rewriteCandidates.push({
                file: userFile,
                fromImport: spec,
                toImport: suggestedCanonicalImport,
              });
            }
          }

          // Also check generic alias bases if they end with basename
          for (const prefix of possibleAliases) {
            const maybe = `${prefix}${baseNameNoExt}`;
            const rx2 = new RegExp(`from\\s+['"]${escapeRegExp(maybe)}['"]`);
            if (rx2.test(src) && !maybe.startsWith('@/components/ui/')) {
              rewriteCandidates.push({
                file: userFile,
                fromImport: maybe,
                toImport: suggestedCanonicalImport,
              });
            }
          }
        }
      } catch {}
    }

    reports.push({
      name,
      files: files.map(f => f.replace(/\\/g, '/')),
      canonicalPath: canonicalExisting ? canonicalExisting.replace(/\\/g, '/') : null,
      suggestedCanonicalImport,
      createdCanonicalFilename: filename,
      rewriteCandidates,
    });
  });

  return reports.sort((a, b) => b.rewriteCandidates.length - a.rewriteCandidates.length);
}

function aliasGuessFromAbs(absPath: string): string {
  // Best-effort guess: convert /src/... to @/...
  const rel = path.relative(path.join(process.cwd(), 'src'), absPath).replace(/\\/g, '/');
  return rel.startsWith('.') ? '' : `@/${rel.replace(/\.(tsx|ts|jsx|js)$/i, '')}`;
}

function escapeRegExp(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function displayUIDedupReport(reports: DuplicateComponentReport[]) {
  if (!reports.length) {
    console.log(chalk.green('\n✅ No duplicate UI components detected across features/shared/components.\n'));
    return;
  }

  console.log(chalk.bold.magenta('\n🧩 UI Deduplication Report (Canonicalize to src/components/ui/*)\n'));
  console.log(chalk.gray(`  Found ${reports.length} duplicated component names across the codebase.\n`));

  reports.slice(0, 10).forEach((r, i) => {
    const count = r.files.length;
    console.log(`${chalk.bold(`${i + 1}.`)} ${chalk.cyan(r.name)}  ${chalk.gray(`(${count} occurrences)`)}`);
    r.files.forEach(f => console.log(`     ${chalk.gray('•')} ${f}`));
    const canonicalNote = r.canonicalPath
      ? `canonical exists → ${chalk.green(r.canonicalPath)}`
      : `suggest create → ${chalk.yellow(path.join('src/components/ui', `${r.createdCanonicalFilename}.tsx`))}`;
    console.log(`     ${chalk.gray('Canonical:')} ${canonicalNote}`);
    console.log(`     ${chalk.gray('Import →')} ${chalk.bold(r.suggestedCanonicalImport)}`);
    console.log(`     ${chalk.gray('Rewrite candidates:')} ${chalk.yellow(r.rewriteCandidates.length)}\n`);
  });

  if (reports.length > 10) {
    console.log(chalk.gray(`  … ${reports.length - 10} more duplicates omitted\n`));
  }

  console.log(chalk.bold('💡 Tip:'));
  console.log(chalk.gray('  Run with --rewrite-imports to auto-rewrite alias imports to the canonical UI path.'));
  console.log();
}

function rewriteAliasImports(reports: DuplicateComponentReport[]): { changed: number; skipped: number } {
  let changed = 0;
  let skipped = 0;

  // Group by file to batch modify
  const editsByFile = new Map<string, { from: string; to: string }[]>();

  for (const r of reports) {
    for (const cand of r.rewriteCandidates) {
      const arr = editsByFile.get(cand.file) || [];
      arr.push({ from: cand.fromImport, to: cand.toImport });
      editsByFile.set(cand.file, arr);
    }
  }

  editsByFile.forEach((edits, file) => {
    try {
      let src = fs.readFileSync(file, 'utf-8');
      let modified = false;

      // Apply unique edits
      const unique = Array.from(new Map(edits.map(e => [e.from + '→' + e.to, e])).values());
      for (const e of unique) {
        const rx = new RegExp(`from\\s+['"]${escapeRegExp(e.from)}['"]`, 'g');
        if (rx.test(src)) {
          src = src.replace(rx, `from '${e.to}'`);
          modified = true;
        }
      }

      if (modified) {
        fs.writeFileSync(file, src, 'utf-8');
        changed++;
      } else {
        skipped++;
      }
    } catch {
      skipped++;
    }
  });

  return { changed, skipped };
}

// ================================================
// Progress Management
// ================================================

function loadProgress(): MigrationProgress {
  if (fs.existsSync(PROGRESS_FILE)) {
    const data = fs.readFileSync(PROGRESS_FILE, 'utf-8');
    const parsed = JSON.parse(data);
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
// Display (Dashboard)
// ================================================

function displayHeader() {
  if (isInteractive) console.clear();
  console.log(chalk.bold.cyan('\n╔════════════════════════════════════════════════════════════╗'));
  console.log(chalk.bold.cyan('║     🎨 Design System Compliance Dashboard                ║'));
  console.log(chalk.bold.cyan('║     v3.0 - UX/UI Improvements Integrated                 ║'));
  console.log(chalk.bold.cyan('╚════════════════════════════════════════════════════════════╝\n'));
}

function displayStats(progress: MigrationProgress) {
  const { stats } = progress;
  const percentage = ((stats.completed / stats.total) * 100).toFixed(1);

  console.log(chalk.bold('📊 Overall Progress:\n'));
  const barWidth = 40;
  const filled = Math.round((stats.completed / stats.total) * barWidth);
  const empty = barWidth - filled;
  const bar = chalk.green('█'.repeat(filled)) + chalk.gray('░'.repeat(empty));
  console.log(`  ${bar} ${chalk.bold.cyan(percentage + '%')}`);
  console.log(`  ${chalk.green(stats.completed)}/${stats.total} files completed\n`);

  console.log(chalk.bold('📈 Breakdown:\n'));
  console.log(`  ${chalk.green('✓')} Completed:    ${chalk.bold(stats.completed.toString().padStart(3))} files`);
  console.log(`  ${chalk.yellow('⋯')} In Progress:  ${chalk.bold(stats.inProgress.toString().padStart(3))} files`);
  console.log(`  ${chalk.gray('○')} Pending:      ${chalk.bold(stats.pending.toString().padStart(3))} files`);
  if (stats.failed > 0) console.log(`  ${chalk.red('✗')} Failed:       ${chalk.bold(stats.failed.toString().padStart(3))} files`);
  printf();
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
  printf();
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
  printf();
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
    printf();
  }
}

function displayTimeEstimate(progress: MigrationProgress) {
  const { stats } = progress;
  const remainingFiles = stats.total - stats.completed;
  const minutesPerFile = 15;
  const totalMinutes = remainingFiles * minutesPerFile;
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  console.log(chalk.bold('⏱️  Time Estimate:\n'));
  console.log(`  Remaining files: ${chalk.yellow(remainingFiles)}`);
  console.log(`  Estimated time:  ${chalk.cyan(`${hours}h ${minutes}m`)}`);
  console.log(`  Last updated:    ${chalk.gray(new Date().toLocaleString())}\n`);
}

function displayFooter() {
  console.log(chalk.bold.cyan('═'.repeat(62)));
  console.log(chalk.gray('\n  Commands:'));
  console.log(chalk.gray('    npm run migrate:tokens <file>  - Migrate a file'));
  console.log(chalk.gray('    npm run migration:dashboard    - Update this dashboard'));
  console.log(chalk.gray('    npm run migration:dashboard -- --scan'));
  console.log(chalk.gray('    npm run migration:dashboard -- --scan-ui [--rewrite-imports]\n'));
}

// ================================================
// Main
// ================================================

async function main() {
  const args = process.argv.slice(2);
  const shouldScan = args.includes('--scan') || args.includes('-s');
  const shouldScanUI = args.includes('--scan-ui') || args.includes('--ui');
  const shouldRewriteImports = args.includes('--rewrite-imports');

  if (shouldScan) {
    const spinner = isInteractive ? ora('🔍 Scanning all files in src/...').start() : null;
    try {
      const results = await scanAllFiles();
      if (spinner) spinner.succeed(`Scan complete! Found ${results.length} files`);
      else {
        console.log('Scan complete!');
        console.log(`Found ${results.length} files that need attention.`);
      }
      displayHeader();
      displayScanResults(results);
      console.log(chalk.bold.cyan('═'.repeat(62)));
      console.log(chalk.gray('\n  Next Steps:'));
      console.log(chalk.gray('    1. Pick a file from the list above'));
      console.log(chalk.gray('    2. Open it in your editor'));
      console.log(chalk.gray('    3. Apply Design Tokens manually'));
      console.log(chalk.gray('    4. Run: npm run test:visual (to verify)\n'));
      return;
    } catch (error) {
      if (spinner) spinner.fail('Scan failed');
      else console.error('Scan failed');
      throw error;
    }
  }

  if (shouldScanUI) {
    const spinner = isInteractive ? ora('🧩 Scanning for duplicated UI components...').start() : null;
    try {
      const reports = buildDuplicateReport();
      if (spinner) spinner.succeed(`UI scan complete. Found ${reports.length} duplicated components by name.`);

      displayHeader();
      displayUIDedupReport(reports);

      if (shouldRewriteImports && reports.length) {
        const spinner2 = isInteractive ? ora('✍️ Rewriting alias imports to @/components/ui/* ...').start() : null;
        const result = rewriteAliasImports(reports);
        if (spinner2) spinner2.succeed(`Rewrites complete: ${result.changed} files updated, ${result.skipped} unchanged/skipped.`);
        else console.log(`Rewrites: ${result.changed} changed, ${result.skipped} skipped.`);
        printf();
        console.log(chalk.gray('ℹ️  Only alias imports (starting with "@/") are rewritten. Relative imports are logged but left intact.'));
      }

      printf();
      displayFooter();
      return;
    } catch (error) {
      if (spinner) spinner.fail('UI scan failed');
      throw error;
    }
  }

  // Normal dashboard mode
  const spinner = isInteractive ? ora('Loading migration progress...').start() : null;
  await new Promise(resolve => setTimeout(resolve, 500));

  const progress = loadProgress();
  progress.stats = calculateStats(progress.files);

  if (spinner) spinner.succeed('Progress loaded');
  else console.log('Progress loaded');

  displayHeader();
  displayStats(progress);
  displayPriorities(progress);
  displayCategories(progress);
  displayRecentActivity(progress);
  displayTimeEstimate(progress);
  displayFooter();

  console.log(chalk.yellow('\n💡 Tip: Run with --scan to auto-detect style/token issues or --scan-ui for UI duplicates.\n'));

  saveProgress(progress);
}

main().catch(error => {
  console.error(chalk.red('\n❌ Error:'), error);
  process.exit(1);
});
