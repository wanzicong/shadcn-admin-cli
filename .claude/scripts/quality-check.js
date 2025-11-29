#!/usr/bin/env node

/**
 * 代码质量检查脚本
 * 运行全面的代码质量检查并生成报告
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const QUALITY_CHECKS = [
  {
    name: 'TypeScript 类型检查',
    command: 'pnpm type-check',
    critical: true,
    description: '检查 TypeScript 类型错误'
  },
  {
    name: 'ESLint 代码检查',
    command: 'pnpm lint',
    critical: true,
    description: '检查代码风格和潜在问题'
  },
  {
    name: '代码格式检查',
    command: 'pnpm format:check',
    critical: false,
    description: '检查代码格式是否符合规范'
  },
  {
    name: '未使用代码检查',
    command: 'pnpm knip',
    critical: false,
    description: '检查未使用的代码和依赖'
  },
  {
    name: '构建测试',
    command: 'pnpm build',
    critical: true,
    description: '验证项目是否可以成功构建'
  }
];

function runCheck(check) {
  console.log(`\n🔍 运行检查: ${check.name}`);
  console.log(`📝 ${check.description}`);

  try {
    const startTime = Date.now();
    execSync(check.command, { stdio: 'pipe', cwd: process.cwd() });
    const endTime = Date.now();
    const duration = endTime - startTime;

    console.log(`✅ ${check.name} - 通过 (${duration}ms)`);
    return { success: true, duration, error: null };
  } catch (error) {
    const duration = Date.now() - Date.now();
    console.log(`❌ ${check.name} - 失败`);

    // 尝试提取错误信息
    let errorMsg = '未知错误';
    try {
      errorMsg = error.stdout ? error.stdout.toString().trim() : error.message;
      if (errorMsg.length > 200) {
        errorMsg = errorMsg.substring(0, 200) + '...';
      }
    } catch (e) {
      // 忽略解析错误
    }

    if (check.critical) {
      console.log(`🚨 关键检查失败: ${errorMsg}`);
    } else {
      console.log(`⚠️  非关键检查失败: ${errorMsg}`);
    }

    return { success: false, duration, error: errorMsg };
  }
}

function analyzeProjectStructure() {
  console.log('\n📊 分析项目结构...');

  const srcPath = path.join(process.cwd(), 'src');
  const developPath = path.join(srcPath, 'develop');

  const analysis = {
    hasSrc: fs.existsSync(srcPath),
    hasDevelop: fs.existsSync(developPath),
    routeFiles: 0,
    componentFiles: 0,
    utilityFiles: 0
  };

  if (analysis.hasDevelop) {
    function countFilesByType(dirPath) {
      let routes = 0, components = 0, utilities = 0;

      function walkDir(currentPath) {
        const files = fs.readdirSync(currentPath);

        for (const file of files) {
          const filePath = path.join(currentPath, file);
          const stats = fs.statSync(filePath);

          if (stats.isDirectory()) {
            walkDir(filePath);
          } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
            if (file.includes('route') || currentPath.includes('(views)')) {
              routes++;
            } else if (currentPath.includes('(lib)') || currentPath.includes('(hooks)')) {
              utilities++;
            } else if (currentPath.includes('components')) {
              components++;
            }
          }
        }
      }

      walkDir(dirPath);
      return { routes, components, utilities };
    }

    const counts = countFilesByType(developPath);
    analysis.routeFiles = counts.routes;
    analysis.componentFiles = counts.components;
    analysis.utilityFiles = counts.utilities;
  }

  console.log(`  - src 目录: ${analysis.hasSrc ? '✅' : '❌'}`);
  console.log(`  - develop 目录: ${analysis.hasDevelop ? '✅' : '❌'}`);
  if (analysis.hasDevelop) {
    console.log(`  - 路由文件: ${analysis.routeFiles} 个`);
    console.log(`  - 组件文件: ${analysis.componentFiles} 个`);
    console.log(`  - 工具文件: ${analysis.utilityFiles} 个`);
  }

  return analysis;
}

function generateQualityReport(results, structureAnalysis) {
  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      totalChecks: results.length,
      passedChecks: results.filter(r => r.success).length,
      criticalChecks: QUALITY_CHECKS.filter(c => c.critical).length,
      passedCriticalChecks: results.filter(r => r.success && QUALITY_CHECKS.find(c => c.critical)).length
    },
    checks: QUALITY_CHECKS.map((check, index) => ({
      name: check.name,
      description: check.description,
      critical: check.critical,
      success: results[index].success,
      duration: results[index].duration,
      error: results[index].error
    })),
    structure: structureAnalysis,
    recommendation: []
  };

  // 生成建议
  if (report.summary.passedChecks === report.summary.totalChecks) {
    report.recommendation.push('🎉 所有检查通过，代码质量良好！');
  } else {
    report.recommendation.push('⚠️  存在问题需要解决，请查看详细报告');
  }

  if (report.summary.passedCriticalChecks !== report.summary.criticalChecks) {
    report.recommendation.push('🚨 关键检查失败，请优先解决');
  }

  // 保存报告
  const reportPath = path.join(process.cwd(), '.claude', 'quality-report.json');
  try {
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`\n📄 质量报告已保存: ${reportPath}`);
  } catch (error) {
    console.warn('⚠️  无法保存质量报告:', error.message);
  }

  return report;
}

function displayResults(report) {
  console.log('\n📋 代码质量检查报告');
  console.log('='.repeat(50));

  console.log(`\n📊 总体情况:`);
  console.log(`  - 总检查项: ${report.summary.totalChecks}`);
  console.log(`  - 通过检查: ${report.summary.passedChecks}`);
  console.log(`  - 关键检查: ${report.summary.criticalChecks}`);
  console.log(`  - 通过关键检查: ${report.summary.passedCriticalChecks}`);

  console.log(`\n🔍 检查详情:`);
  for (const check of report.checks) {
    const status = check.success ? '✅' : (check.critical ? '❌' : '⚠️');
    const duration = check.duration ? ` (${check.duration}ms)` : '';
    console.log(`  ${status} ${check.name}${duration}`);
    if (check.error && !check.success) {
      console.log(`     错误: ${check.error}`);
    }
  }

  console.log(`\n💡 建议:`);
  for (const recommendation of report.recommendation) {
    console.log(`  ${recommendation}`);
  }
}

// 主执行流程
console.log('🔍 shadcn-admin 代码质量检查\n');

console.log('🚀 开始运行质量检查...');
const results = [];

for (const check of QUALITY_CHECKS) {
  const result = runCheck(check);
  results.push(result);
}

// 分析项目结构
const structureAnalysis = analyzeProjectStructure();

// 生成和显示报告
const report = generateQualityReport(results, structureAnalysis);
displayResults(report);

// 根据结果设置退出码
const hasCriticalFailure = results.some((result, index) =>
  !result.success && QUALITY_CHECKS[index].critical
);

if (hasCriticalFailure) {
  console.log('\n❌ 关键检查失败，请修复后重试');
  process.exit(1);
} else {
  console.log('\n✅ 质量检查完成');
  process.exit(0);
}