#!/usr/bin/env node

/**
 * Claude Code 后命令钩子
 * 在执行每个命令后运行，用于清理和状态报告
 */

const fs = require('fs');
const path = require('path');

function getCurrentTime() {
  return new Date().toISOString();
}

function logCommandResult(command, result) {
  const logFile = path.join(process.cwd(), '.claude', 'command-history.log');
  const logEntry = `[${getCurrentTime()}] Post-command: ${JSON.stringify(command)} - Status: ${result}\n`;

  try {
    fs.appendFileSync(logFile, logEntry);
  } catch (error) {
    console.warn('Failed to write command result log:', error.message);
  }
}

function checkTypeScriptErrors() {
  const tsconfigPath = path.join(process.cwd(), 'tsconfig.json');

  if (fs.existsSync(tsconfigPath)) {
    console.log('📝 TypeScript configuration detected');
    console.log('💡 Tip: Run "pnpm type-check" to verify TypeScript compilation');
  }
}

function checkBuildStatus() {
  const distPath = path.join(process.cwd(), 'dist');

  if (fs.existsSync(distPath)) {
    const stats = fs.statSync(distPath);
    console.log(`📦 Build directory exists (last modified: ${stats.mtime.toISOString()})`);
  }
}

// 主钩子逻辑
const command = process.argv[2] ? JSON.parse(process.argv[2]) : {};
const result = process.argv[3] || 'success';

console.log('🏁 Running post-command hook...');
logCommandResult(command, result);

// 项目特定的后置检查
if (command.command && command.command.includes('build')) {
  checkBuildStatus();
}

if (command.command && (command.command.includes('edit') || command.command.includes('write'))) {
  checkTypeScriptErrors();
}

console.log('✅ Post-command hook completed');
process.exit(0);