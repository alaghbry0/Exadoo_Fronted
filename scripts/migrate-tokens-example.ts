#!/usr/bin/env node
/**
 * Design Tokens Migration CLI Tool
 * أداة لتحويل المكونات إلى استخدام Design Tokens تلقائياً
 * 
 * Usage:
 *   npm run migrate:tokens <file-path>
 *   npm run migrate:tokens --scan (للبحث عن جميع الملفات)
 *   npm run migrate:tokens --dry-run <file-path> (preview فقط)
 */

import { Project, SyntaxKind, JsxAttribute } from 'ts-morph';
import * as fs from 'fs';
import * as path from 'path';
import chalk from 'chalk';
import ora from 'ora';

// ================================================
// Configuration
// ================================================

interface MigrationRule {
  pattern: RegExp;
  replacement: string;
  type: 'className' | 'style';
  description: string;
}

const MIGRATION_RULES: MigrationRule[] = [
  // Text Colors
  {
    pattern: /text-gray-900\s+dark:text-white/g,
    replacement: 'style={{ color: colors.text.primary }}',
    type: 'style',
    description: 'Primary text color'
  },
  {
    pattern: /text-gray-600\s+dark:text-gray-400/g,
    replacement: 'style={{ color: colors.text.secondary }}',
    type: 'style',
    description: 'Secondary text color'
  },
  {
    pattern: /text-gray-500\s+dark:text-gray-500/g,
    replacement: 'style={{ color: colors.text.tertiary }}',
    type: 'style',
    description: 'Tertiary text color'
  },
  
  // Background Colors
  {
    pattern: /bg-white\s+dark:bg-neutral-900/g,
    replacement: 'style={{ backgroundColor: colors.bg.primary }}',
    type: 'style',
    description: 'Primary background'
  },
  {
    pattern: /bg-gray-50\s+dark:bg-neutral-800/g,
    replacement: 'style={{ backgroundColor: colors.bg.secondary }}',
    type: 'style',
    description: 'Secondary background'
  },
  
  // Border Colors
  {
    pattern: /border-gray-200\s+dark:border-neutral-800/g,
    replacement: 'style={{ borderColor: colors.border.default }}',
    type: 'style',
    description: 'Default border'
  },
  
  // Shadows
  {
    pattern: /shadow-md\s+hover:shadow-lg/g,
    replacement: `className={shadowClasses.card}`,
    type: 'className',
    description: 'Card shadow'
  },
];

// ================================================
// Migration Stats
// ================================================

interface MigrationStats {
  filesScanned: number;
  filesModified: number;
  replacementsMade: number;
  errors: string[];
  warnings: string[];
  startTime: Date;
  endTime?: Date;
}

const stats: MigrationStats = {
  filesScanned: 0,
  filesModified: 0,
  replacementsMade: 0,
  errors: [],
  warnings: [],
  startTime: new Date()
};

// ================================================
// Core Functions
// ================================================

/**
 * Scan file for potential migrations
 */
function scanFile(filePath: string): {
  matches: Array<{ rule: MigrationRule; line: number; text: string }>;
  hasImport: boolean;
} {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');
  const matches: Array<{ rule: MigrationRule; line: number; text: string }> = [];
  
  // Check if file already imports tokens
  const hasImport = /from ['"]@\/styles\/tokens['"]/.test(content);
  
  // Find all matches
  MIGRATION_RULES.forEach(rule => {
    lines.forEach((line, index) => {
      if (rule.pattern.test(line)) {
        matches.push({
          rule,
          line: index + 1,
          text: line.trim()
        });
      }
    });
  });
  
  return { matches, hasImport };
}

/**
 * Apply migrations to a file
 */
function migrateFile(filePath: string, dryRun: boolean = false): boolean {
  try {
    stats.filesScanned++;
    const spinner = ora(`Processing ${path.basename(filePath)}...`).start();
    
    // Read original content
    const originalContent = fs.readFileSync(filePath, 'utf-8');
    let modifiedContent = originalContent;
    let replacementCount = 0;
    
    // Scan for matches
    const { matches, hasImport } = scanFile(filePath);
    
    if (matches.length === 0) {
      spinner.info(chalk.gray(`No migrations needed for ${path.basename(filePath)}`));
      return false;
    }
    
    // Add import if needed
    if (!hasImport) {
      const importStatement = `import { colors, spacing, shadows, shadowClasses } from '@/styles/tokens';\n`;
      
      // Find the right place to insert (after other imports)
      const importRegex = /^import .+;$/gm;
      const matches = [...originalContent.matchAll(importRegex)];
      
      if (matches.length > 0) {
        const lastImport = matches[matches.length - 1];
        const insertPosition = lastImport.index! + lastImport[0].length + 1;
        modifiedContent = 
          modifiedContent.slice(0, insertPosition) +
          importStatement +
          modifiedContent.slice(insertPosition);
      } else {
        // Insert at the beginning
        modifiedContent = importStatement + modifiedContent;
      }
      
      replacementCount++;
    }
    
    // Apply migrations
    MIGRATION_RULES.forEach(rule => {
      const beforeCount = (modifiedContent.match(rule.pattern) || []).length;
      modifiedContent = modifiedContent.replace(rule.pattern, rule.replacement);
      const afterCount = (modifiedContent.match(rule.pattern) || []).length;
      replacementCount += beforeCount - afterCount;
    });
    
    // Write changes if not dry run
    if (!dryRun && modifiedContent !== originalContent) {
      // Create backup
      const backupPath = filePath + '.backup';
      fs.writeFileSync(backupPath, originalContent);
      
      // Write modified content
      fs.writeFileSync(filePath, modifiedContent);
      
      stats.filesModified++;
      stats.replacementsMade += replacementCount;
      
      spinner.succeed(
        chalk.green(`✅ Migrated ${path.basename(filePath)} (${replacementCount} changes)`)
      );
    } else if (dryRun) {
      spinner.info(
        chalk.yellow(`🔍 Would migrate ${path.basename(filePath)} (${replacementCount} changes)`)
      );
    }
    
    return true;
  } catch (error) {
    stats.errors.push(`Error processing ${filePath}: ${error}`);
    ora().fail(chalk.red(`❌ Failed to process ${path.basename(filePath)}`));
    return false;
  }
}

/**
 * Scan directory recursively
 */
function scanDirectory(dirPath: string, pattern: RegExp = /\.(tsx|ts)$/): string[] {
  const files: string[] = [];
  
  function scan(dir: string) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    
    entries.forEach(entry => {
      const fullPath = path.join(dir, entry.name);
      
      if (entry.isDirectory()) {
        // Skip node_modules, .next, etc.
        if (!['node_modules', '.next', 'dist', 'build'].includes(entry.name)) {
          scan(fullPath);
        }
      } else if (entry.isFile() && pattern.test(entry.name)) {
        files.push(fullPath);
      }
    });
  }
  
  scan(dirPath);
  return files;
}

/**
 * Generate migration report
 */
function generateReport(): string {
  stats.endTime = new Date();
  const duration = (stats.endTime.getTime() - stats.startTime.getTime()) / 1000;
  
  let report = '\n';
  report += chalk.bold.cyan('═'.repeat(60)) + '\n';
  report += chalk.bold.cyan('  📊 Design Tokens Migration Report\n');
  report += chalk.bold.cyan('═'.repeat(60)) + '\n\n';
  
  report += chalk.bold('📈 Statistics:\n');
  report += `  Files scanned:    ${chalk.yellow(stats.filesScanned)}\n`;
  report += `  Files modified:   ${chalk.green(stats.filesModified)}\n`;
  report += `  Replacements:     ${chalk.blue(stats.replacementsMade)}\n`;
  report += `  Duration:         ${chalk.gray(duration.toFixed(2) + 's')}\n\n`;
  
  if (stats.errors.length > 0) {
    report += chalk.bold.red('❌ Errors:\n');
    stats.errors.forEach(error => {
      report += `  ${chalk.red('•')} ${error}\n`;
    });
    report += '\n';
  }
  
  if (stats.warnings.length > 0) {
    report += chalk.bold.yellow('⚠️  Warnings:\n');
    stats.warnings.forEach(warning => {
      report += `  ${chalk.yellow('•')} ${warning}\n`;
    });
    report += '\n';
  }
  
  report += chalk.bold.green('✅ Next Steps:\n');
  report += `  1. Review the changes in modified files\n`;
  report += `  2. Run visual regression tests\n`;
  report += `  3. Test dark mode switching\n`;
  report += `  4. Remove .backup files if satisfied\n\n`;
  
  report += chalk.bold.cyan('═'.repeat(60)) + '\n';
  
  return report;
}

// ================================================
// CLI Interface
// ================================================

function printUsage() {
  console.log(chalk.bold('\n📝 Usage:\n'));
  console.log('  npm run migrate:tokens <file-path>        Migrate single file');
  console.log('  npm run migrate:tokens --scan             Scan all files');
  console.log('  npm run migrate:tokens --dry-run <path>   Preview changes');
  console.log('  npm run migrate:tokens --help             Show this help\n');
}

async function main() {
  const args = process.argv.slice(2);
  
  console.log(chalk.bold.cyan('\n🚀 Design Tokens Migration Tool\n'));
  
  if (args.length === 0 || args.includes('--help')) {
    printUsage();
    return;
  }
  
  const dryRun = args.includes('--dry-run');
  const scanMode = args.includes('--scan');
  
  if (scanMode) {
    // Scan entire src directory
    console.log(chalk.gray('Scanning src directory...\n'));
    const srcPath = path.join(process.cwd(), 'src');
    const files = scanDirectory(srcPath);
    
    console.log(chalk.bold(`Found ${files.length} TypeScript files\n`));
    
    // Show files that need migration
    const filesToMigrate: string[] = [];
    
    files.forEach(file => {
      const { matches } = scanFile(file);
      if (matches.length > 0) {
        filesToMigrate.push(file);
        console.log(chalk.yellow(`📄 ${path.relative(process.cwd(), file)}`));
        console.log(chalk.gray(`   ${matches.length} potential migrations\n`));
      }
    });
    
    console.log(chalk.bold.cyan(`\n📊 Summary: ${filesToMigrate.length} files need migration\n`));
    
  } else {
    // Migrate specific file
    const filePath = args.find(arg => !arg.startsWith('--'));
    
    if (!filePath) {
      console.log(chalk.red('❌ Please provide a file path\n'));
      printUsage();
      return;
    }
    
    const fullPath = path.resolve(process.cwd(), filePath);
    
    if (!fs.existsSync(fullPath)) {
      console.log(chalk.red(`❌ File not found: ${filePath}\n`));
      return;
    }
    
    migrateFile(fullPath, dryRun);
    console.log(generateReport());
  }
}

// Run
main().catch(error => {
  console.error(chalk.red('\n❌ Fatal error:'), error);
  process.exit(1);
});
