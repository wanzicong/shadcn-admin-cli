#!/usr/bin/env node

/**
 * 增强版构建命令
 * 包含预检查、构建分析和报告生成
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

function preBuildChecks() {
  console.log('🔍 构建前检查...\n');

  const checks = [
    {
      name: 'TypeScript 类型检查',
      command: 'pnpm type-check',
      critical: true
    },
    {
      name: 'ESLint 代码检查',
      command: 'pnpm lint',
      critical: true
    },
    {
      name: '代码格式检查',
      command: 'pnpm format:check',
      critical: false
    }
  ];

  let allPassed = true;

  for (const check of checks) {
    console.log(`🔍 ${check.name}...`);
    try {
      execSync(check.command, { stdio: 'pipe', cwd: process.cwd() });
      console.log(`✅ ${check.name} - 通过\n`);
    } catch (error) {
      console.log(`❌ ${check.name} - 失败\n`);
      if (check.critical) {
        allPassed = false;
      }
    }
  }

  if (!allPassed) {
    console.log('❌ 关键检查失败，构建中止');
    console.log('💡 使用 --force 参数强制跳过检查');
    process.exit(1);
  }

  console.log('✅ 所有检查通过\n');
}

function performBuild() {
  console.log('🏗️  开始构建...\n');

  const startTime = Date.now();

  try {
    execSync('pnpm build', { stdio: 'inherit', cwd: process.cwd() });
    const endTime = Date.now();
    const duration = (endTime - startTime) / 1000;

    console.log(`\n✅ 构建成功完成 (耗时: ${duration.toFixed(2)}s)\n`);
    return { success: true, duration };
  } catch (error) {
    console.log('\n❌ 构建失败\n');
    return { success: false, duration: 0, error: error.message };
  }
}

function analyzeBuild() {
  console.log('📊 分析构建结果...\n');

  const distPath = path.join(process.cwd(), 'dist');

  if (!fs.existsSync(distPath)) {
    console.log('❌ 构建目录不存在');
    return false;
  }

  function analyzeDirectory(dirPath, relativePath = '') {
    let totalSize = 0;
    let fileCount = 0;
    const files = fs.readdirSync(dirPath);

    const analysis = {
      path: relativePath || '/',
      files: [],
      directories: [],
      totalSize: 0,
      fileCount: 0
    };

    for (const file of files) {
      const filePath = path.join(dirPath, file);
      const stats = fs.statSync(filePath);
      const relativeFilePath = path.join(relativePath, file);

      if (stats.isDirectory()) {
        const dirAnalysis = analyzeDirectory(filePath, relativeFilePath);
        analysis.directories.push(dirAnalysis);
        totalSize += dirAnalysis.totalSize;
        fileCount += dirAnalysis.fileCount;
      } else {
        const fileInfo = {
          name: file,
          path: relativeFilePath,
          size: stats.size,
          extension: path.extname(file)
        };
        analysis.files.push(fileInfo);
        totalSize += stats.size;
        fileCount++;
      }
    }

    analysis.totalSize = totalSize;
    analysis.fileCount = fileCount;

    // 按大小排序文件
    analysis.files.sort((a, b) => b.size - a.size);

    return analysis;
  }

  const analysis = analyzeDirectory(distPath);

  // 显示总体信息
  console.log(`📦 构建分析:`);
  console.log(`  总文件数: ${analysis.fileCount}`);
  console.log(`  总大小: ${(analysis.totalSize / 1024 / 1024).toFixed(2)} MB`);

  // 显示最大的文件
  console.log('\n📄 最大的文件:');
  const largestFiles = analysis.files.slice(0, 5);
  for (const file of largestFiles) {
    console.log(`  ${file.path}: ${(file.size / 1024).toFixed(2)} KB`);
  }

  // 检查关键文件
  const criticalFiles = ['index.html'];
  console.log('\n🔍 关键文件检查:');
  for (const file of criticalFiles) {
    const exists = analysis.files.some(f => f.name === file);
    console.log(`  ${file}: ${exists ? '✅' : '❌'}`);
  }

  return analysis;
}

function generateBuildReport(buildResult, analysis) {
  const report = {
    timestamp: new Date().toISOString(),
    build: {
      success: buildResult.success,
      duration: buildResult.duration,
      error: buildResult.error || null
    },
    analysis: {
      totalFiles: analysis.fileCount,
      totalSize: analysis.totalSize,
      fileBreakdown: analysis.files.map(f => ({
        name: f.name,
        path: f.path,
        size: f.size,
        extension: f.extension
      }))
    },
    recommendations: []
  };

  // 生成建议
  if (report.analysis.totalSize > 50 * 1024 * 1024) { // 50MB
    report.recommendations.push('构建包较大，建议进行代码分割优化');
  }

  if (report.build.duration > 60) { // 60秒
    report.recommendations.push('构建时间较长，考虑优化构建配置');
  }

  const jsFiles = report.analysis.fileBreakdown.filter(f => f.extension === '.js');
  if (jsFiles.length > 0 && jsFiles.some(f => f.size > 1024 * 1024)) { // 1MB
    report.recommendations.push('存在较大的 JavaScript 文件，建议拆分');
  }

  // 保存报告
  const reportPath = path.join(process.cwd(), '.claude', 'build-analysis.json');
  try {
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`\n📄 构建分析报告已保存: ${reportPath}`);
  } catch (error) {
    console.warn('⚠️  无法保存构建报告:', error.message);
  }

  return report;
}

// 主流程
async function main() {
  const args = process.argv.slice(2);
  const forceMode = args.includes('--force');

  console.log('🏗️  shadcn-admin 增强构建工具\n');

  if (!forceMode) {
    preBuildChecks();
  } else {
    console.log('⚠️  跳过构建前检查 (--force 模式)\n');
  }

  const buildResult = performBuild();

  if (!buildResult.success) {
    console.log('💡 检查错误信息并修复后重试');
    process.exit(1);
  }

  const analysis = analyzeBuild();
  const report = generateBuildReport(buildResult, analysis);

  console.log('\n🎉 构建分析完成！');

  if (report.recommendations.length > 0) {
    console.log('\n💡 优化建议:');
    for (const recommendation of report.recommendations) {
      console.log(`  - ${recommendation}`);
    }
  }

  console.log('\n🚀 使用 "pnpm preview" 预览构建结果');
}

main().catch(error => {
  console.error('❌ 构建过程中发生错误:', error.message);
  process.exit(1);
});