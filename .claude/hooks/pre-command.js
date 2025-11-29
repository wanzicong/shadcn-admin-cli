#!/usr/bin/env node

/**
 * Claude Code 预命令钩子
 * 在执行每个命令前运行，用于日志记录和状态检查
 */

const fs = require('fs');
const path = require('path');

function getCurrentTime() {
  return new Date().toISOString();
}

function logCommand(command) {
  const logFile = path.join(process.cwd(), '.claude', 'command-history.log');
  const logEntry = `[${getCurrentTime()}] Pre-command: ${JSON.stringify(command)}\n`;

  try {
    fs.appendFileSync(logFile, logEntry);
  } catch (error) {
    console.warn('Failed to write command log:', error.message);
  }
}

function checkProjectHealth() {
  const packageJsonPath = path.join(process.cwd(), 'package.json');

  if (!fs.existsSync(packageJsonPath)) {
    console.warn('⚠️  Warning: package.json not found in project root');
    return false;
  }

  return true;
}

// 主钩子逻辑
const command = process.argv[2] ? JSON.parse(process.argv[2]) : {};

console.log('🚀 Running pre-command hook...');
logCommand(command);

if (!checkProjectHealth()) {
  console.error('❌ Project health check failed');
  process.exit(1);
}

console.log('✅ Pre-command hook completed');
process.exit(0);