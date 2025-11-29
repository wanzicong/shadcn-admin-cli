#!/usr/bin/env node

/**
 * Git 提交前钩子
 * 在执行 git commit 前运行代码质量检查
 */

const { execSync } = require('child_process');
const path = require('path');

const REQUIRED_COMMANDS = [
  {
    name: 'ESLint检查',
    command: 'pnpm lint',
    errorMessage: 'ESLint检查失败，请修复代码风格问题'
  },
  {
    name: 'TypeScript类型检查',
    command: 'pnpm type-check',
    errorMessage: 'TypeScript类型检查失败，请修复类型错误'
  }
];

const OPTIONAL_COMMANDS = [
  {
    name: '代码格式化检查',
    command: 'pnpm format:check',
    errorMessage: '代码格式不符合规范，请运行 pnpm format'
  }
];

function runCommand(command) {
  try {
    console.log(`🔍 运行: ${command}`);
    execSync(command, { stdio: 'inherit', cwd: process.cwd() });
    return true;
  } catch (error) {
    console.error(`❌ 命令执行失败: ${command}`);
    return false;
  }
}

function checkStagedFiles() {
  try {
    const output = execSync('git diff --cached --name-only', { encoding: 'utf8' });
    const stagedFiles = output.trim().split('\n').filter(file => file.trim());

    if (stagedFiles.length === 0) {
      console.log('📝 没有暂存的文件，跳过检查');
      process.exit(0);
    }

    console.log(`📁 检查暂存文件 (${stagedFiles.length} 个):`);
    stagedFiles.forEach(file => console.log(`  - ${file}`));

    // 检查是否有相关文件需要检查
    const relevantFiles = stagedFiles.filter(file =>
      file.endsWith('.ts') ||
      file.endsWith('.tsx') ||
      file.endsWith('.js') ||
      file.endsWith('.jsx')
    );

    if (relevantFiles.length === 0) {
      console.log('⏭️  没有需要检查的代码文件，跳过代码质量检查');
      process.exit(0);
    }

    return true;
  } catch (error) {
    console.warn('⚠️  无法获取暂存文件列表，继续执行检查');
    return true;
  }
}

console.log('🚀 开始 Git 提交前检查...\n');

// 检查暂存文件
if (!checkStagedFiles()) {
  process.exit(1);
}

// 运行必需的检查
console.log('\n📋 必需检查:');
const requiredResults = REQUIRED_COMMANDS.map(check => {
  const success = runCommand(check.command);
  if (!success) {
    console.error(`❌ ${check.errorMessage}`);
  }
  return success;
});

// 如果必需检查失败，退出
if (requiredResults.some(result => !result)) {
  console.error('\n❌ 提交前检查失败，请修复上述问题后重试');
  process.exit(1);
}

// 运行可选检查
console.log('\n🔍 可选检查:');
const optionalResults = OPTIONAL_COMMANDS.map(check => {
  const success = runCommand(check.command);
  if (!success) {
    console.warn(`⚠️  ${check.errorMessage}`);
  }
  return success;
});

console.log('\n✅ 提交前检查完成！');
console.log('💡 提示: 使用 "git commit --no-verify" 跳过这些检查');

process.exit(0);