#!/usr/bin/env node
/**
 * Design Tokens Migration Dashboard + UI Dedup Scanner (v3.1)
 * - Scan for token violations (colors/bg/border/shadow/spacing), "dark:" classes, inline motion variants, oversized files
 * - Output Top 3 offenders in JSON (for Codex loop)
 * - Detect duplicated UI primitives and rewrite imports to "@/components/ui/*"
 *
 * Usage:
 *   npm run migration:dashboard
 *   npm run migration:dashboard -- --scan
 *   npm run migration:dashboard -- --scan --json
 *   npm run migration:dashboard -- --scan-ui
 *   npm run migration:dashboard -- --scan-ui --rewrite-imports [--dry-run]
 */

import * as fs from 'fs';
import * as path from 'path';
import chalk from 'chalk';
import ora from 'ora';

const isInteractive = process.stdout.isTTY && !process.env.NON_INTERACTIVE;

// ================================
// CLI Flags
// ================================
const args = process.argv.slice(2);
const shouldScan = args.includes('--scan') || args.includes('-s');
const shouldJson = args.includes('--json');
const shouldScanUI = args.includes('--scan-ui') || args.includes('--ui');
const shouldRewriteImports = args.includes('--rewrite-imports');
const shouldDryRun = args.includes('--dry-run');

// ================================
// Types
// ================================
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
  score: number; // 0-100 (higher = more urgent)
  issues: {
    darkModeClasses: number;
    hardCodedColors: number;
    hardCodedSpacing: number;
    inlineStyles: number;
    framerMotionInline: number;       // Inline motion objects
    framerMotionConditional: number;  // Conditional mount without AnimatePresence
    framerMotionHeavy: number;        // width/height animated
    fileSize: number;
    exceedsMaxLines: boolean;         // > 300 lines
  };
  patterns: string[];
  category: string;
  estimatedTime: number; // minutes
  recommendations: string[];
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
  name: string;                 // Component name (PascalCase)
  files: string[];              // Absolute paths
  canonicalPath: string | null; // Absolute canonical path in src/components/ui if exists
  suggestedCanonicalImport: string; // '@/components/ui/<filename>'
  createdCanonicalFilename: string; // kebab-case filename to use if missing
  rewriteCandidates: {
    file: string;              // absolute path to importing file
    fromImport: string;        // detected specifier (alias or relative)
    toImport: string;          // target alias '@/components/ui/<file>'
  }[];
}

// ================================
// Configuration
// ================================
const PROGRESS_FILE = path.join(process.cwd(), '.migration-progress.json');

// Seed (optional). You can leave it empty or tailor to your project.
// This Dashboard-mode bloc is only for pretty display; scan mode is authoritative.
const FILE_LIST: FileProgress[] = [];

// ================================
// Helpers
// ================================
function printf() { console.log(); }
function escapeRegExp(s: string) { return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }

function calculateStats(files: FileProgress[]) {
  return {
    total: files.length || 0,
    completed: files.filter(f => f.status === 'completed').length,
    inProgress: files.filter(f => f.status === 'in-progress').length,
    pending: files.filter(f => f.status === 'pending').length,
    failed: files.filter(f => f.status === 'failed').length,
  };
}

function loadProgress(): MigrationProgress {
  if (fs.existsSync(PROGRESS_FILE)) {
    const data = fs.readFileSync(PROGRESS_FILE, 'utf-8');
    const parsed = JSON.parse(data);
    const files = FILE_LIST.length
      ? FILE_LIST.map(file => parsed.files?.find((f: FileProgress) => f.path === file.path) || file)
      : (parsed.files ?? []);
    return { ...parsed, files, lastUpdated: new Date(parsed.lastUpdated) };
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

// ================================
// Category detection
// ================================
function getCategoryFromPath(filePath: string): string {
  const p = filePath.replace(/\\/g, '/');
  if (p.includes('/payments/')) return 'Payment';
  if (p.includes('/notifications/')) return 'Notification';
  if (p.includes('/profile/')) return 'Profile';
  if (p.includes('/auth/')) return 'Auth';
  if (p.includes('/academy/')) return 'Academy';
  if (p.includes('/shop/')) return 'Shop';
  if (p.includes('/trading/') || p.includes('forex') || p.includes('indicators')) return 'Trading';
  if (p.includes('/layout/')) return 'Layout';
  if (p.includes('/common/')) return 'Common';
  if (p.includes('/components/')) return 'Components';
  return 'Other';
}

// ================================
// Scanner (Design System)
// ================================
const DETECTION_PATTERNS = {
  dark: /\bdark:[a-z0-9-]+/g,
  colors: /\b(?:text|bg|border)-(?:gray|slate|neutral|white|black|red|blue|green|yellow|amber|emerald|rose|sky|indigo|violet|fuchsia|pink)-\d+\b/g,
  spacing: /\b(?:p|px|py|pt|pr|pb|pl|m|mx|my|mt|mr|mb|ml|gap)-\d+\b/g,
  inlineColorLike: /(?:#(?:[0-9a-fA-F]{3}){1,2}|rgba?\()/
};

function extractClassStrings(content: string): string[] {
  const out: string[] = [];
  const rx1 = /className\s*=\s*"([^"]*)"/g;
  const rx2 = /className\s*=\s*\{\s*`([^`]*)`\s*\}/g;
  const rx3 = /className\s*=\s*\{\s*'([^']*)'\s*\}/g;
  let m;
  while ((m = rx1.exec(content))) out.push(m[1]);
  while ((m = rx2.exec(content))) out.push(m[1]);
  while ((m = rx3.exec(content))) out.push(m[1]);
  return out;
}

function countMatchesInClasses(classes: string[], pattern: RegExp): number {
  return classes.reduce((acc, cls) => acc + (cls.match(pattern)?.length || 0), 0);
}

function scanFile(filePath: string): ScanResult | null {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');

    // Exclusions
    const isTokensFile = /\/styles\/tokens\//.test(filePath);
    const isVariantsFile = /\/variants\.tsx?$/.test(filePath);
    const isTailwindConfig = /tailwind\.config|postcss\.config/.test(filePath);
    if (isTokensFile || isVariantsFile || isTailwindConfig) return null;

    const lines = content.split('\n');
    const fileSize = lines.length;
    const exceedsMaxLines = fileSize > 300;

    const classes = extractClassStrings(content);
    const issues = {
      darkModeClasses: countMatchesInClasses(classes, DETECTION_PATTERNS.dark),
      hardCodedColors: countMatchesInClasses(classes, DETECTION_PATTERNS.colors),
      hardCodedSpacing: countMatchesInClasses(classes, DETECTION_PATTERNS.spacing),
      inlineStyles: (content.match(/style=\{\{[^}]*?(?:#(?:[0-9a-fA-F]{3}){1,2}|rgba?\()/g) || []).length,
      framerMotionInline: (content.match(/<motion\.\w+\s+(?:initial|animate|exit)=\{\{/g) || []).length,
      framerMotionConditional: (content.match(/\{[\s\S]*?&&\s*<motion\./g) || []).length,
      framerMotionHeavy: (content.match(/animate=\{\{[^}]*(width|height)\s*:/g) || []).length,
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

    const score = Math.min(
      100,
      (issues.darkModeClasses * 5) +
      (issues.hardCodedColors * 2) +
      (issues.hardCodedSpacing * 1) +
      (issues.inlineStyles * 3) +
      (issues.framerMotionInline * 3) +
      (issues.framerMotionConditional * 2) +
      (issues.framerMotionHeavy * 4) +
      (exceedsMaxLines ? 20 : 0)
    );

    const recommendations: string[] = [];
    if (issues.exceedsMaxLines) recommendations.push(`📏 Split file (${fileSize} lines) → <= 300 LOC`);
    if (issues.darkModeClasses) recommendations.push(`🎨 Replace ${issues.darkModeClasses} dark: classes with Design Tokens`);
    if (issues.hardCodedColors) recommendations.push(`🖌️ Replace ${issues.hardCodedColors} hard-coded colors with tokens`);
    if (issues.hardCodedSpacing) recommendations.push(`📐 Replace ${issues.hardCodedSpacing} spacing utilities with spacing tokens`);
    if (issues.framerMotionInline) recommendations.push(`🎬 Extract ${issues.framerMotionInline} inline motion objects to "@/styles/animations" variants`);
    if (issues.framerMotionConditional) recommendations.push(`🎭 Wrap conditional motion elements with <AnimatePresence>`);
    if (issues.framerMotionHeavy) recommendations.push(`⚡ Avoid animating width/height; use transform-based animations`);

    const patterns = Array.from(new Set([
      ...(content.match(/\btext-[a-z0-9-]+\b/g) || []).slice(0, 2),
      ...(content.match(/\bbg-[a-z0-9-]+\b/g) || []).slice(0, 2),
      ...(content.match(/\bborder-[a-z0-9-]+\b/g) || []).slice(0, 1),
    ]));

    const estimatedTime = Math.max(5, Math.ceil(totalIssues / 3)) + (exceedsMaxLines ? Math.ceil((fileSize - 300) / 50) : 0);
    const category = getCategoryFromPath(filePath);

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

function findFilesRecursive(dir: string, fileRx: RegExp, excludeRx: RegExp): string[] {
  const results: string[] = [];
  try {
    for (const item of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, item.name);
      if (excludeRx.test(full)) continue;
      if (item.isDirectory()) results.push(...findFilesRecursive(full, fileRx, excludeRx));
      else if (item.isFile() && fileRx.test(item.name)) results.push(full);
    }
  } catch {}
  return results;
}

async function scanAllFiles(): Promise<ScanResult[]> {
  const srcDir = path.join(process.cwd(), 'src');
  const files = findFilesRecursive(srcDir, /\.(tsx|ts)$/, /node_modules|\.d\.ts$/);
  const out: ScanResult[] = [];
  for (const file of files) {
    const r = scanFile(file);
    if (r) out.push(r);
  }
  return out.sort((a, b) => b.score - a.score);
}

function outputTop3Json(results: ScanResult[]) {
  const top3 = results.slice(0, 3).map(r => ({
    path: r.path,
    score: r.score,
    category: r.category,
    issues: r.issues,
    recommendations: r.recommendations,
  }));
  console.log('<<<TOP3_JSON_START>>>');
  console.log(JSON.stringify(top3, null, 2));
  console.log('<<<TOP3_JSON_END>>>');
}

function displayHeader() {
  if (isInteractive) console.clear();
  console.log(chalk.bold.cyan('\n╔════════════════════════════════════════════════════════════╗'));
  console.log(chalk.bold.cyan('║     🎨 Design System Compliance Dashboard (v3.1)          ║'));
  console.log(chalk.bold.cyan('╚════════════════════════════════════════════════════════════╝\n'));
}

function displayScanResults(results: ScanResult[]) {
  if (!results.length) {
    console.log(chalk.green('\n✅ All files follow the Design System rules! 🎉\n'));
    return;
  }
  console.log(chalk.bold.yellow('\n🔍 Design System Compliance Scan:\n'));
  console.log(chalk.gray(`  Found ${results.length} files needing attention\n`));

  const topFiles = results.slice(0, 3);
  console.log(chalk.bold('📋 Top Priority Files:\n'));
  topFiles.forEach((r, i) => {
    const scoreColor = r.score > 50 ? chalk.red : r.score > 25 ? chalk.yellow : chalk.cyan;
    const urgency = r.score > 50 ? '🔴 CRITICAL' : r.score > 25 ? '🟡 HIGH' : '🟢 MEDIUM';
    console.log(`  ${chalk.bold.white(`${i + 1}.`)} ${urgency} ${chalk.bold(path.basename(r.path))} ${scoreColor(`[Score: ${r.score}]`)}`);
    console.log(`     ${chalk.gray(r.path)}`);
    console.log(`     ${chalk.cyan('Category:')} ${r.category} ${chalk.gray('|')} ${chalk.cyan('Time:')} ~${r.estimatedTime}m ${chalk.gray('|')} ${chalk.cyan('Size:')} ${r.issues.fileSize} lines`);

    const issuesList: string[] = [];
    if (r.issues.exceedsMaxLines) issuesList.push(`${chalk.red('⚠️  Exceeds 300 lines')}`);
    if (r.issues.darkModeClasses) issuesList.push(`${chalk.magenta(r.issues.darkModeClasses)} dark:`);
    if (r.issues.hardCodedColors) issuesList.push(`${chalk.yellow(r.issues.hardCodedColors)} colors`);
    if (r.issues.hardCodedSpacing) issuesList.push(`${chalk.blue(r.issues.hardCodedSpacing)} spacing`);
    if (r.issues.framerMotionInline) issuesList.push(`${chalk.cyan(r.issues.framerMotionInline)} inline-motion`);
    if (r.issues.framerMotionConditional) issuesList.push(`${chalk.yellow(r.issues.framerMotionConditional)} missing AnimatePresence`);
    if (r.issues.framerMotionHeavy) issuesList.push(`${chalk.red(r.issues.framerMotionHeavy)} heavy-motion`);
    if (issuesList.length) console.log(`     ${chalk.gray('Issues:')} ${issuesList.join(', ')}`);

    if (r.recommendations.length) {
      console.log(`     ${chalk.cyan('Required Actions:')}`);
      r.recommendations.forEach(rec => console.log(`     ${chalk.gray('•')} ${rec}`));
    }
    printf();
  });

  console.log(chalk.bold('⏱️  Estimated time for top 3: ') + chalk.cyan(`~${topFiles.reduce((a, r) => a + r.estimatedTime, 0)} minutes\n`));

  // JSON block for agents (if not using --json)
  console.log(chalk.gray('Agent Integration JSON (Top 3):'));
  outputTop3Json(results);
  printf();
}

// ================================
// UI Dedup Scanner + Import Rewriter
// ================================
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
  if (!/\bReact\b|from\s+['"]react['"]/.test(content)) return false;
  if (!/<[A-Z][A-Za-z0-9]*(\s|>)/.test(content)) return false;
  const uiSignals = ['@radix-ui/', 'lucide-react', 'framer-motion', 'className=', 'cn('];
  return uiSignals.some(sig => content.includes(sig));
}

function listTsFiles(root: string): string[] {
  return findFilesRecursive(root, /\.(tsx|ts|jsx|js)$/, /node_modules|\.d\.ts$/);
}

function aliasGuessFromAbs(absPath: string): string {
  const rel = path.relative(path.join(process.cwd(), 'src'), absPath).replace(/\\/g, '/');
  return rel.startsWith('.') ? '' : `@/${rel.replace(/\.(tsx|ts|jsx|js)$/i, '')}`;
}

function gatherComponentOccurrences(): Map<string, string[]> {
  const files = listTsFiles(SRC_DIR);
  const map = new Map<string, string[]>();
  for (const file of files) {
    try {
      const content = fs.readFileSync(file, 'utf-8');
      if (!isLikelyUIComponent(file, content)) continue;
      const name = toPascalCase(path.basename(file));
      const isInUi = file.includes(`${path.sep}components${path.sep}ui${path.sep}`);
      const isInFeature = file.includes(`${path.sep}features${path.sep}`);
      const isInShared = file.includes(`${path.sep}shared${path.sep}`) || (file.includes(`${path.sep}components${path.sep}`) && !isInUi);
      if (isInUi || isInFeature || isInShared) {
        const arr = map.get(name) || [];
        arr.push(file);
        map.set(name, arr);
      }
    } catch {}
  }
  return map;
}

function buildDuplicateReport(): DuplicateComponentReport[] {
  const occ = gatherComponentOccurrences();
  const out: DuplicateComponentReport[] = [];

  occ.forEach((files, name) => {
    if (files.length < 2) return;
    const canonicalExisting = files.find(f => f.includes(`${path.sep}components${path.sep}ui${path.sep}`)) || null;
    const filename = canonicalExisting
      ? path.basename(canonicalExisting).replace(/\.(tsx|ts|jsx|js)$/i, '')
      : toKebabCase(name);

    const suggestedCanonicalImport = `@/components/ui/${filename}`;
    const canonicalPath = canonicalExisting
      ? canonicalExisting
      : path.join(UI_CANONICAL_DIR, `${filename}.tsx`);

    const importUsers = listTsFiles(SRC_DIR);
    const rewriteCandidates: { file: string; fromImport: string; toImport: string }[] = [];

    for (const userFile of importUsers) {
      try {
        const src = fs.readFileSync(userFile, 'utf-8');

        // Try direct exact spec from guessed alias
        for (const dup of files) {
          const aliasSpec = aliasGuessFromAbs(dup);
          const baseNameNoExt = path.basename(dup).replace(/\.(tsx|ts|jsx|js)$/i, '');

          const candidates = [
            aliasSpec,
            aliasSpec.replace(/\\/g, '/'),
            // relative candidates: any import ending with the same basename
          ].filter(Boolean);

          // exact alias
          for (const spec of candidates) {
            const rx = new RegExp(`from\\s+['"]${escapeRegExp(spec)}['"]`);
            if (rx.test(src) && !spec.startsWith('@/components/ui/')) {
              rewriteCandidates.push({ file: userFile, fromImport: spec, toImport: suggestedCanonicalImport });
            }
          }

          // fuzzy: any import that ends with the same basename (relative or alias)
          const fuzzy = new RegExp(`from\\s+['"][^'"]*${escapeRegExp(baseNameNoExt)}['"]`);
          if (fuzzy.test(src)) {
            rewriteCandidates.push({ file: userFile, fromImport: baseNameNoExt, toImport: suggestedCanonicalImport });
          }
        }
      } catch {}
    }

    out.push({
      name,
      files: files.map(f => f.replace(/\\/g, '/')),
      canonicalPath: canonicalExisting ? canonicalExisting.replace(/\\/g, '/') : null,
      suggestedCanonicalImport,
      createdCanonicalFilename: filename,
      rewriteCandidates
    });
  });

  return out.sort((a, b) => b.rewriteCandidates.length - a.rewriteCandidates.length);
}

function toCanonicalSpec(absCanonicalPath: string, projectRoot = process.cwd()): string {
  const rel = path.relative(path.join(projectRoot, 'src'), absCanonicalPath).replace(/\\/g, '/');
  return `@/${rel.replace(/\.(tsx|ts|jsx|js)$/i, '')}`;
}

function rewriteImportsToCanonical(reports: DuplicateComponentReport[]): { changed: number; skipped: number } {
  let changed = 0, skipped = 0;
  const editsByFile = new Map<string, { from: RegExp; to: string }[]>();
  const projectRoot = process.cwd();

  for (const r of reports) {
    const canonicalAbs = r.canonicalPath ?? path.join(projectRoot, 'src/components/ui', `${r.createdCanonicalFilename}.tsx`);
    const canonicalSpec = toCanonicalSpec(canonicalAbs, projectRoot);

    for (const c of r.rewriteCandidates) {
      const arr = editsByFile.get(c.file) || [];
      // exact alias
      arr.push({ from: new RegExp(`from\\s+['"]${escapeRegExp(c.fromImport)}['"]`, 'g'), to: `from '${canonicalSpec}'` });
      // relative/other fuzzy by same basename
      arr.push({ from: new RegExp(`from\\s+['"][^'"]*${escapeRegExp(c.fromImport)}['"]`, 'g'), to: `from '${canonicalSpec}'` });
      editsByFile.set(c.file, arr);
    }
  }

  editsByFile.forEach((edits, file) => {
    try {
      let src = fs.readFileSync(file, 'utf-8');
      const before = src;
      for (const e of edits) src = src.replace(e.from, e.to);
      if (src !== before) {
        if (!shouldDryRun) fs.writeFileSync(file, src, 'utf-8');
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

function displayUIDedupReport(reports: DuplicateComponentReport[]) {
  if (!reports.length) {
    console.log(chalk.green('\n✅ No duplicated UI primitives detected.\n'));
    return;
  }
  console.log(chalk.bold.magenta('\n🧩 UI Deduplication Report (Canonical → src/components/ui/*)\n'));
  console.log(chalk.gray(`  Found ${reports.length} duplicated component names.\n`));

  reports.slice(0, 10).forEach((r, i) => {
    console.log(`${chalk.bold(`${i + 1}.`)} ${chalk.cyan(r.name)} ${chalk.gray(`(${r.files.length} occurrences)`)}`);
    r.files.forEach(f => console.log(`     ${chalk.gray('•')} ${f}`));
    const canonicalNote = r.canonicalPath
      ? `canonical exists → ${chalk.green(r.canonicalPath)}`
      : `suggest create → ${chalk.yellow(path.join('src/components/ui', `${r.createdCanonicalFilename}.tsx`))}`;
    console.log(`     ${chalk.gray('Canonical:')} ${canonicalNote}`);
    console.log(`     ${chalk.gray('Import →')} ${chalk.bold(r.suggestedCanonicalImport)}`);
    console.log(`     ${chalk.gray('Rewrite candidates:')} ${chalk.yellow(r.rewriteCandidates.length)}\n`);
  });

  if (reports.length > 10) console.log(chalk.gray(`  … ${reports.length - 10} more duplicates omitted\n`));
}

// ================================
// Dashboard (pretty)
// ================================
function displayStats(progress: MigrationProgress) {
  const { stats } = progress;
  const percentage = stats.total ? ((stats.completed / stats.total) * 100).toFixed(1) : '0.0';

  console.log(chalk.bold('📊 Overall Progress:\n'));
  const barWidth = 40;
  const filled = Math.round((stats.total ? (stats.completed / stats.total) : 0) * barWidth);
  const empty = barWidth - filled;
  const bar = chalk.green('█'.repeat(Math.max(0, filled))) + chalk.gray('░'.repeat(Math.max(0, empty)));
  console.log(`  ${bar} ${chalk.bold.cyan(percentage + '%')}`);
  console.log(`  ${chalk.green(stats.completed)}/${stats.total} files completed\n`);
}

function displayFooter() {
  console.log(chalk.bold.cyan('═'.repeat(62)));
  console.log(chalk.gray('\n  Commands:'));
  console.log(chalk.gray('    npm run migration:dashboard -- --scan'));
  console.log(chalk.gray('    npm run migration:dashboard -- --scan --json'));
  console.log(chalk.gray('    npm run migration:dashboard -- --scan-ui [--rewrite-imports] [--dry-run]\n'));
}

// ================================
// Main
// ================================
async function main() {
  // SCAN MODE
  if (shouldScan) {
    const spinner = isInteractive ? ora('🔍 Scanning src/** for design-system issues...').start() : null;
    try {
      const results = await scanAllFiles();
      if (spinner) spinner.succeed(`Scan complete! Found ${results.length} files needing attention.`);

      if (shouldJson) {
        outputTop3Json(results);
        return;
      }
      displayHeader();
      displayScanResults(results);
      return;
    } catch (err) {
      if (spinner) spinner.fail('Scan failed');
      console.error(err);
      process.exit(1);
    }
  }

  // UI DEDUP MODE
  if (shouldScanUI) {
    const spinner = isInteractive ? ora('🧩 Scanning for duplicated UI primitives...').start() : null;
    try {
      const reports = buildDuplicateReport();
      if (spinner) spinner.succeed(`UI scan complete. Found ${reports.length} duplicated names.`);

      displayHeader();
      displayUIDedupReport(reports);

      if (shouldRewriteImports && reports.length) {
        const spinner2 = isInteractive ? ora(`✍️ Rewriting imports to "@/components/ui/*" ${shouldDryRun ? '(dry-run)' : ''}...`).start() : null;
        const res = rewriteImportsToCanonical(reports);
        if (spinner2) spinner2.succeed(`Rewrites complete: ${res.changed} files updated, ${res.skipped} skipped.`);
      }
      return;
    } catch (err) {
      if (spinner) spinner.fail('UI scan failed');
      console.error(err);
      process.exit(1);
    }
  }

  // DASHBOARD MODE (pretty, optional)
  const spinner = isInteractive ? ora('Loading migration progress...').start() : null;
  await new Promise(r => setTimeout(r, 250));
  const progress = loadProgress();
  progress.stats = calculateStats(progress.files);
  if (spinner) spinner.succeed('Progress loaded');

  displayHeader();
  displayStats(progress);
  displayFooter();
  saveProgress(progress);

  console.log(chalk.yellow('\n💡 Tip: Use --scan to get actionable Top 3; use --scan --json for agent loop.\n'));
}

main().catch(err => {
  console.error(chalk.red('\n❌ Error:'), err);
  process.exit(1);
});
