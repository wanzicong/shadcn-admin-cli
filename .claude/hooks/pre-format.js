#!/usr/bin/env node

/**
 * 格式化前钩子
 * 在代码格式化前运行，用于检查和准备格式化环境
 */

const fs = require('fs');
const path = require('path');

function checkPrettierConfig() {
  const prettierConfigPath = path.join(process.cwd(), '.prettierrc');

  if (fs.existsSync(prettierConfigPath)) {
    console.log('✅ Prettier 配置文件存在');
  } else {
    console.log('⚠️  未找到 .prettierrc 配置文件');
  }

  // 检查其他可能的配置文件
  const possibleConfigs = [
    '.prettierrc.js',
    '.prettierrc.json',
    'prettier.config.js',
    '.prettierrc.yaml'
  ];

  const foundConfigs = possibleConfigs.filter(config =>
    fs.existsSync(path.join(process.cwd(), config))
  );

  if (foundConfigs.length > 0) {
    console.log(`📝 找到 Prettier 配置: ${foundConfigs.join(', ')}`);
  }
}

function checkFormatTargetFiles() {
  const srcPath = path.join(process.cwd(), 'src');

  if (!fs.existsSync(srcPath)) {
    console.warn('⚠️  src 目录不存在');
    return false;
  }

  function countFiles(dirPath, extensions) {
    let count = 0;
    const files = fs.readdirSync(dirPath);

    for (const file of files) {
      const filePath = path.join(dirPath, file);
      const stats = fs.statSync(filePath);

      if (stats.isDirectory()) {
        count += countFiles(filePath, extensions);
      } else if (extensions.some(ext => file.endsWith(ext))) {
        count++;
      }
    }

    return count;
  }

  const codeExtensions = ['.ts', '.tsx', '.js', '.jsx', '.json', '.md', '.css', '.scss'];
  const fileCount = countFiles(srcPath, codeExtensions);

  console.log(`📄 可格式化文件数量: ${fileCount}`);
  return fileCount > 0;
}

function checkGitStatus() {
  try {
    const { execSync } = require('child_process');
    const output = execSync('git status --porcelain', { encoding: 'utf8' });
    const modifiedFiles = output.trim().split('\n').filter(line => line.trim());

    if (modifiedFiles.length > 0) {
      console.log(`📝 Git 状态: ${modifiedFiles.length} 个文件有变更`);
      console.log('💡 提示: 格式化后可能需要重新暂存文件');
    } else {
      console.log('📝 Git 状态: 工作目录干净');
    }
  } catch (error) {
    console.log('💡 未在 Git 仓库中或无法获取 Git 状态');
  }
}

function suggestFormatCommands() {
  console.log('\n💡 可用的格式化命令:');
  console.log('  - pnpm format          # 格式化所有文件');
  console.log('  - pnpm format:src      # 仅格式化 src 目录');
  console.log('  - pnpm format:config   # 仅格式化配置文件');
  console.log('  - pnpm format:ts       # 仅格式化 TypeScript 文件');
  console.log('  - pnpm format:json     # 仅格式化 JSON 文件');
  console.log('  - pnpm format:md       # 仅格式化 Markdown 文件');
  console.log('  - pnpm format:check     # 检查格式（不修改文件）');
}

console.log('🎨 运行格式化前钩子...\n');

// 检查 Prettier 配置
checkPrettierConfig();

// 检查可格式化文件
if (!checkFormatTargetFiles()) {
  console.warn('⚠️  没有找到可格式化的文件');
  process.exit(0);
}

// 检查 Git 状态
checkGitStatus();

// 建议格式化命令
suggestFormatCommands();

console.log('\n✅ 格式化前准备完成！');
console.log('🚀 开始执行格式化...');

process.exit(0);