#!/usr/bin/env node

/**
 * 构建后钩子
 * 在项目构建完成后运行，用于验证构建结果和生成报告
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

function getCurrentTime() {
  return new Date().toISOString();
}

function analyzeBuildOutput() {
  const distPath = path.join(process.cwd(), 'dist');

  if (!fs.existsSync(distPath)) {
    console.error('❌ 构建输出目录不存在');
    return false;
  }

  function getDirectorySize(dirPath) {
    let totalSize = 0;
    let fileCount = 0;

    function calculateSize(currentPath) {
      const stats = fs.statSync(currentPath);

      if (stats.isDirectory()) {
        const files = fs.readdirSync(currentPath);
        for (const file of files) {
          calculateSize(path.join(currentPath, file));
        }
      } else {
        totalSize += stats.size;
        fileCount++;
      }
    }

    calculateSize(dirPath);
    return { totalSize, fileCount };
  }

  const { totalSize, fileCount } = getDirectorySize(distPath);

  console.log('📊 构建分析报告:');
  console.log(`  - 总文件数: ${fileCount}`);
  console.log(`  - 总大小: ${(totalSize / 1024 / 1024).toFixed(2)} MB`);
  console.log(`  - 构建时间: ${getCurrentTime()}`);

  // 检查关键文件
  const indexHtmlPath = path.join(distPath, 'index.html');
  if (fs.existsSync(indexHtmlPath)) {
    console.log('✅ index.html 存在');
  } else {
    console.warn('⚠️  index.html 未找到');
  }

  // 检查是否有资源文件
  const assetsPath = path.join(distPath, 'assets');
  if (fs.existsSync(assetsPath)) {
    const assetFiles = fs.readdirSync(assetsPath);
    console.log(`✅ 资源文件: ${assetFiles.length} 个`);
  }

  return true;
}

function generateBuildReport() {
  const reportPath = path.join(process.cwd(), '.claude', 'build-report.json');
  const report = {
    timestamp: getCurrentTime(),
    buildSize: null,
    fileCount: null,
    nodeVersion: process.version,
    platform: process.platform
  };

  try {
    const distPath = path.join(process.cwd(), 'dist');
    if (fs.existsSync(distPath)) {
      const stats = fs.statSync(distPath);
      report.buildSize = stats.size;
      report.buildTime = stats.mtime.toISOString();
    }

    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`📝 构建报告已生成: ${reportPath}`);
  } catch (error) {
    console.warn('⚠️  无法生成构建报告:', error.message);
  }
}

function checkBundleSize() {
  const packageJsonPath = path.join(process.cwd(), 'package.json');

  try {
    if (fs.existsSync(packageJsonPath)) {
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
      console.log(`📦 项目版本: ${packageJson.version}`);

      // 简单的大小检查阈值
      const distPath = path.join(process.cwd(), 'dist');
      if (fs.existsSync(distPath)) {
        const stats = fs.statSync(distPath);
        const sizeInMB = stats.size / 1024 / 1024;

        if (sizeInMB > 50) {
          console.warn(`⚠️  构建包较大: ${sizeInMB.toFixed(2)} MB，建议进行代码分割优化`);
        } else if (sizeInMB > 20) {
          console.log(`💡 构建包大小适中: ${sizeInMB.toFixed(2)} MB`);
        } else {
          console.log(`✅ 构建包大小良好: ${sizeInMB.toFixed(2)} MB`);
        }
      }
    }
  } catch (error) {
    console.warn('⚠️  无法检查包大小:', error.message);
  }
}

console.log('🏗️  运行构建后钩子...\n');

// 分析构建输出
if (analyzeBuildOutput()) {
  console.log('✅ 构建分析完成');
} else {
  console.error('❌ 构建分析失败');
  process.exit(1);
}

// 检查包大小
checkBundleSize();

// 生成构建报告
generateBuildReport();

console.log('\n🎉 构建后钩子完成！');
console.log('💡 提示: 使用 "pnpm preview" 预览构建结果');

process.exit(0);