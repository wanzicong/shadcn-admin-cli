#!/usr/bin/env node

/**
 * 项目清理脚本
 * 清理构建产物、缓存文件和临时文件
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const CLEANUP_TARGETS = [
  {
    name: '构建目录',
    paths: ['dist', 'build', '.output'],
    description: '清理构建输出目录'
  },
  {
    name: '缓存目录',
    paths: ['.cache', '.vite', '.turbo'],
    description: '清理构建缓存'
  },
  {
    name: '依赖锁文件备份',
    paths: ['package-lock.json', 'yarn.lock'],
    description: '清理其他包管理器的锁文件'
  },
  {
    name: '临时日志',
    paths: ['.claude/command-history.log', '.claude/quality-report.json', '.claude/build-report.json'],
    description: '清理 Claude Code 生成的日志文件'
  },
  {
    name: 'TypeScript 构建',
    paths: ['tsconfig.tsbuildinfo'],
    description: '清理 TypeScript 增量构建信息'
  }
];

const DANGEROUS_CLEANUP_TARGETS = [
  {
    name: 'node_modules',
    paths: ['node_modules'],
    description: '删除所有依赖（需要重新安装）',
    confirm: true
  }
];

function promptUser(message) {
  const readline = require('readline');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise((resolve) => {
    rl.question(message, (answer) => {
      rl.close();
      resolve(answer.toLowerCase().trim());
    });
  });
}

function getDirectorySize(dirPath) {
  let totalSize = 0;

  function calculateSize(currentPath) {
    try {
      const stats = fs.statSync(currentPath);
      if (stats.isDirectory()) {
        const files = fs.readdirSync(currentPath);
        for (const file of files) {
          calculateSize(path.join(currentPath, file));
        }
      } else {
        totalSize += stats.size;
      }
    } catch (error) {
      // 忽略无法访问的文件
    }
  }

  calculateSize(dirPath);
  return totalSize;
}

function formatSize(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function deletePath(targetPath) {
  try {
    const fullPath = path.join(process.cwd(), targetPath);
    if (!fs.existsSync(fullPath)) {
      return { success: true, size: 0, message: '不存在' };
    }

    const stats = fs.statSync(fullPath);
    const size = stats.isDirectory() ? getDirectorySize(fullPath) : stats.size;

    if (stats.isDirectory()) {
      fs.rmSync(fullPath, { recursive: true, force: true });
    } else {
      fs.unlinkSync(fullPath);
    }

    return { success: true, size, message: '已删除' };
  } catch (error) {
    return { success: false, size: 0, message: error.message };
  }
}

function cleanupTargets(targets) {
  let totalSize = 0;
  let successCount = 0;

  console.log('\n🧹 开始清理...');

  for (const target of targets) {
    console.log(`\n📁 ${target.name}:`);
    console.log(`   ${target.description}`);

    for (const targetPath of target.paths) {
      const result = deletePath(targetPath);
      const sizeStr = result.size > 0 ? ` (${formatSize(result.size)})` : '';

      if (result.success) {
        console.log(`   ✅ ${targetPath}${sizeStr} - ${result.message}`);
        totalSize += result.size;
        successCount++;
      } else {
        console.log(`   ❌ ${targetPath} - ${result.message}`);
      }
    }
  }

  return { totalSize, successCount, totalTargets: targets.reduce((sum, t) => sum + t.paths.length, 0) };
}

async function cleanupDangerousTargets(targets) {
  console.log('\n⚠️  危险清理操作:');

  for (const target of targets) {
    console.log(`\n🚨 ${target.name}:`);
    console.log(`   ${target.description}`);

    for (const targetPath of target.paths) {
      const fullPath = path.join(process.cwd(), targetPath);
      if (fs.existsSync(fullPath)) {
        const stats = fs.statSync(fullPath);
        const size = stats.isDirectory() ? getDirectorySize(fullPath) : stats.size;

        console.log(`   📂 ${targetPath} (${formatSize(size)})`);

        if (target.confirm) {
          const answer = await promptUser(`   确定要删除 ${targetPath} 吗? (y/N): `);
          if (answer !== 'y' && answer !== 'yes') {
            console.log('   ⏭️  跳过');
            continue;
          }
        }

        const result = deletePath(targetPath);
        if (result.success) {
          console.log(`   ✅ ${targetPath} - ${result.message}`);
        } else {
          console.log(`   ❌ ${targetPath} - ${result.message}`);
        }
      } else {
        console.log(`   ℹ️  ${targetPath} - 不存在`);
      }
    }
  }
}

function clearPackageManagersCache() {
  console.log('\n📦 清理包管理器缓存...');

  try {
    // pnpm store prune
    console.log('🧹 清理 pnpm 缓存...');
    execSync('pnpm store prune', { stdio: 'inherit' });
    console.log('✅ pnpm 缓存清理完成');
  } catch (error) {
    console.log('⚠️  pnpm 缓存清理失败或 pnpm 未安装');
  }

  try {
    // npm cache clean --force
    console.log('🧹 清理 npm 缓存...');
    execSync('npm cache clean --force', { stdio: 'inherit' });
    console.log('✅ npm 缓存清理完成');
  } catch (error) {
    console.log('⚠️  npm 缓存清理失败或 npm 未安装');
  }
}

function generateCleanupReport(originalSize, cleanedTargets) {
  const reportPath = path.join(process.cwd(), '.claude', 'cleanup-report.json');
  const report = {
    timestamp: new Date().toISOString(),
    originalSize,
    cleanedTargets,
    savedSpace: originalSize
  };

  try {
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`\n📄 清理报告已保存: ${reportPath}`);
  } catch (error) {
    console.warn('⚠️  无法保存清理报告:', error.message);
  }
}

// 主执行流程
async function main() {
  console.log('🧹 shadcn-admin 项目清理工具\n');

  // 显示磁盘使用情况
  console.log('📊 当前磁盘使用情况:');
  for (const target of CLEANUP_TARGETS) {
    for (const targetPath of target.paths) {
      const fullPath = path.join(process.cwd(), targetPath);
      if (fs.existsSync(fullPath)) {
        const size = fs.statSync(fullPath).isDirectory() ? getDirectorySize(fullPath) : fs.statSync(fullPath).size;
        console.log(`  ${targetPath}: ${formatSize(size)}`);
      }
    }
  }

  // 执行常规清理
  const cleanupResult = cleanupTargets(CLEANUP_TARGETS);

  console.log(`\n📋 常规清理完成:`);
  console.log(`  - 成功: ${cleanupResult.successCount}/${cleanupResult.totalTargets}`);
  console.log(`  - 释放空间: ${formatSize(cleanupResult.totalSize)}`);

  // 询问是否进行危险清理
  console.log('\n🚨 危险清理选项:');
  const dangerousAnswer = await promptUser('是否执行危险清理操作 (如删除 node_modules)? (y/N): ');

  if (dangerousAnswer === 'y' || dangerousAnswer === 'yes') {
    await cleanupDangerousTargets(DANGEROUS_CLEANUP_TARGETS);
  }

  // 询问是否清理包管理器缓存
  console.log('\n📦 包管理器缓存清理:');
  const cacheAnswer = await promptUser('是否清理包管理器缓存? (y/N): ');

  if (cacheAnswer === 'y' || cacheAnswer === 'yes') {
    clearPackageManagersCache();
  }

  // 生成报告
  generateCleanupReport(cleanupResult.totalSize, cleanupResult);

  console.log('\n🎉 清理完成！');
  console.log('💡 提示: 运行 "pnpm install" 重新安装依赖');
  console.log('💡 提示: 运行 "pnpm dev" 重新启动开发服务器');
}

main().catch(error => {
  console.error('❌ 清理过程中发生错误:', error.message);
  process.exit(1);
});