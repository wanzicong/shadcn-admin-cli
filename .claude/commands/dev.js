#!/usr/bin/env node

/**
 * 开发服务器启动命令
 * 增强版的 pnpm dev，包含环境检查和优化
 */

const { execSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

function checkEnvironment() {
  console.log('🔍 检查开发环境...');

  // 检查依赖
  const nodeModulesPath = path.join(process.cwd(), 'node_modules');
  if (!fs.existsSync(nodeModulesPath)) {
    console.log('📥 依赖未安装，正在安装...');
    execSync('pnpm install', { stdio: 'inherit' });
  }

  // 检查端口占用
  try {
    const net = require('net');
    const server = net.createServer();

    server.listen(3000, () => {
      server.close();
    });

    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        console.warn('⚠️  端口 3000 已被占用，Vite 会自动选择其他端口');
      }
    });
  } catch (error) {
    // 忽略端口检查错误
  }

  console.log('✅ 环境检查完成\n');
}

function startDevServer() {
  console.log('🚀 启动开发服务器...\n');

  const devProcess = spawn('pnpm', ['dev'], {
    stdio: 'inherit',
    cwd: process.cwd(),
    shell: true
  });

  // 处理退出信号
  process.on('SIGINT', () => {
    console.log('\n🛑 正在停止开发服务器...');
    devProcess.kill('SIGINT');
  });

  process.on('SIGTERM', () => {
    console.log('\n🛑 正在停止开发服务器...');
    devProcess.kill('SIGTERM');
  });

  devProcess.on('close', (code) => {
    console.log(`\n开发服务器已退出 (代码: ${code})`);
    process.exit(code);
  });

  devProcess.on('error', (error) => {
    console.error('启动开发服务器失败:', error.message);
    process.exit(1);
  });
}

// 显示有用的提示信息
function showDevTips() {
  console.log('💡 开发提示:');
  console.log('  - 访问: http://localhost:3000');
  console.log('  - 热重载已启用');
  console.log('  - React DevTools 可用');
  console.log('  - TanStack Router DevTools 可用');
  console.log('  - TanStack Query DevTools 可用');
  console.log('  - 按 Ctrl+C 停止服务器\n');
}

// 主流程
checkEnvironment();
showDevTips();
startDevServer();