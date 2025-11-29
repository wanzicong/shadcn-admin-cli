#!/usr/bin/env node

/**
 * 开发环境设置脚本
 * 自动检查和配置开发环境
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const REQUIRED_NODE_VERSION = '18.0.0';
const REQUIRED_PNPM_VERSION = '8.0.0';

function checkNodeVersion() {
  const nodeVersion = process.version;
  const versionNumber = nodeVersion.replace('v', '');

  console.log(`📦 Node.js 版本: ${nodeVersion}`);

  if (versionNumber < REQUIRED_NODE_VERSION) {
    console.error(`❌ Node.js 版本过低，需要 >= ${REQUIRED_NODE_VERSION}`);
    return false;
  }

  console.log('✅ Node.js 版本检查通过');
  return true;
}

function checkPnpmInstallation() {
  try {
    const pnpmVersion = execSync('pnpm --version', { encoding: 'utf8' }).trim();
    console.log(`📦 pnpm 版本: ${pnpmVersion}`);

    if (pnpmVersion < REQUIRED_PNPM_VERSION) {
      console.error(`❌ pnpm 版本过低，需要 >= ${REQUIRED_PNPM_VERSION}`);
      return false;
    }

    console.log('✅ pnpm 版本检查通过');
    return true;
  } catch (error) {
    console.error('❌ pnpm 未安装，请先安装 pnpm:');
    console.error('   npm install -g pnpm');
    return false;
  }
}

function checkDependencies() {
  const packageJsonPath = path.join(process.cwd(), 'package.json');
  const nodeModulesPath = path.join(process.cwd(), 'node_modules');

  if (!fs.existsSync(packageJsonPath)) {
    console.error('❌ package.json 不存在');
    return false;
  }

  if (!fs.existsSync(nodeModulesPath)) {
    console.log('📥 正在安装依赖...');
    try {
      execSync('pnpm install', { stdio: 'inherit' });
      console.log('✅ 依赖安装完成');
    } catch (error) {
      console.error('❌ 依赖安装失败');
      return false;
    }
  } else {
    console.log('✅ 依赖已安装');
  }

  return true;
}

function checkEnvironmentFiles() {
  const envFiles = [
    '.env',
    '.env.local',
    '.env.example'
  ];

  let hasEnv = false;
  for (const envFile of envFiles) {
    if (fs.existsSync(path.join(process.cwd(), envFile))) {
      console.log(`✅ 找到环境文件: ${envFile}`);
      hasEnv = true;
    }
  }

  if (!hasEnv) {
    console.log('💡 建议创建 .env.local 文件配置环境变量');
    console.log('   可以参考 .env.example 文件');
  }

  return true;
}

function checkGitRepository() {
  const gitPath = path.join(process.cwd(), '.git');

  if (fs.existsSync(gitPath)) {
    console.log('✅ Git 仓库已初始化');

    // 检查是否有远程仓库
    try {
      const remotes = execSync('git remote', { encoding: 'utf8' }).trim();
      if (remotes) {
        console.log(`🔗 Git 远程仓库: ${remotes.split('\n').join(', ')}`);
      } else {
        console.log('💡 建议添加 Git 远程仓库');
      }
    } catch (error) {
      console.log('💡 建议初始化 Git 仓库');
    }
  } else {
    console.log('💡 建议初始化 Git 仓库');
  }

  return true;
}

function setupDevelopmentTools() {
  console.log('🛠️  配置开发工具...');

  // 确保 .claude 目录存在
  const claudeDir = path.join(process.cwd(), '.claude');
  if (!fs.existsSync(claudeDir)) {
    fs.mkdirSync(claudeDir, { recursive: true });
    console.log('✅ 创建 .claude 目录');
  }

  // 检查 VS Code 推荐扩展
  const vscodeDir = path.join(process.cwd(), '.vscode');
  if (fs.existsSync(vscodeDir)) {
    console.log('✅ VS Code 配置目录存在');
  } else {
    console.log('💡 建议创建 .vscode 目录并配置推荐扩展');
  }

  return true;
}

function runInitialChecks() {
  console.log('🔍 运行初始检查...\n');

  const checks = [
    { name: 'Node.js 版本', fn: checkNodeVersion },
    { name: 'pnpm 安装', fn: checkPnpmInstallation },
    { name: '项目依赖', fn: checkDependencies },
    { name: '环境文件', fn: checkEnvironmentFiles },
    { name: 'Git 仓库', fn: checkGitRepository },
    { name: '开发工具', fn: setupDevelopmentTools }
  ];

  let allPassed = true;

  for (const check of checks) {
    try {
      const result = check.fn();
      if (!result) {
        allPassed = false;
      }
    } catch (error) {
      console.error(`❌ ${check.name} 检查失败: ${error.message}`);
      allPassed = false;
    }
    console.log(''); // 空行分隔
  }

  return allPassed;
}

function showNextSteps() {
  console.log('🚀 开发环境设置完成！\n');
  console.log('📋 接下来的步骤:');
  console.log('  1. pnpm dev              # 启动开发服务器');
  console.log('  2. pnpm type-check       # 检查 TypeScript 类型');
  console.log('  3. pnpm lint             # 运行代码检查');
  console.log('  4. pnpm build            # 构建生产版本');
  console.log('  5. pnpm preview           # 预览构建结果');
  console.log('\n💡 常用开发命令:');
  console.log('  - pnpm format            # 格式化代码');
  console.log('  - pnpm check              # 并行运行 lint 和 type-check');
  console.log('  - pnpm knip               # 检查未使用的代码');
}

// 主执行流程
console.log('🎨 shadcn-admin 开发环境设置\n');

if (runInitialChecks()) {
  showNextSteps();
  console.log('\n✅ 开发环境准备就绪！');
} else {
  console.log('\n❌ 开发环境设置未完成，请解决上述问题后重试');
  process.exit(1);
}