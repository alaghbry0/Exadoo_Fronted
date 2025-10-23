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
  console.log(chalk.bold.cyan('║     🎨 Design Tokens Migration Dashboard                  ║'));
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
  
  // Save updated progress
  saveProgress(progress);
}

main().catch(error => {
  console.error(chalk.red('\n❌ Error:'), error);
  process.exit(1);
});
