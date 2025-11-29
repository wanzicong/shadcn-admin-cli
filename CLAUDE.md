# CLAUDE.md

本文件为 Claude Code (claude.ai/code) 在此代码库中工作时提供指导。

## 回答问题
永远用中文回答

## 项目概述

这是一个使用 Vite 构建的现代化 React 19 + TypeScript 管理后台，具有 Shadcn UI 组件和全面的开发工具。这是版本 2.2.1，是一个成熟的、可用于生产环境的管理后台模板。

## 核心技术栈

- **React 19.2.0** with TypeScript (严格模式)
- **Vite 7.2.4** with SWC 快速编译
- **TanStack Router** 文件系统路由和自动代码分割
- **TanStack Query** 服务器状态管理
- **Zustand** 客户端状态管理
- **TailwindCSS 4.1.17** with Vite 集成
- **Shadcn UI** (Radix UI + TailwindCSS) 组件库
- **ESLint 9.39.1** 现代化扁平配置
- **Prettier** with TailwindCSS 和导入排序插件

## 开发命令

```bash
# 核心开发
pnpm install          # 安装依赖
pnpm dev              # 启动开发服务器 (Vite + HMR)
pnpm build            # 构建生产版本 (TypeScript 编译 + Vite)
pnpm preview          # 预览生产构建

# 代码质量
pnpm lint             # 运行 ESLint (严格 TypeScript + React 规则，UI 组件被忽略)
pnpm format           # 使用 Prettier 格式化代码 (包含 TailwindCSS 类排序)
pnpm format:check     # 检查代码格式
pnpm knip             # 查找未使用的代码和依赖
```

## 项目架构

### 目录结构
```
src/
├── assets/           # 静态资源 (图标, logo)
├── components/       # 可复用组件
│   ├── ui/          # Shadcn UI 基础组件 (ESLint 忽略)
│   ├── [custom-components].tsx # 自定义组件如 command-menu, config-drawer, profile-dropdown
├── config/          # 配置文件
├── context/         # React context 提供者
├── routes/          # TanStack Router 文件系统路由
│   ├── (auth)/      # 认证页面
│   ├── (components)/# 项目全局组件
│   ├── (errors)/    # 错误页面
│   ├── (hooks)/     # 项目全局 hooks
│   ├── (lib)/       # 项目全局工具
│   ├── (services)/  # 项目全局 接口对接服务 API 和外部服务
│   ├── (stores)/    # 项目全局存储
│   ├── (views)/     # 项目全局业务页面
│   ├── _authenticated/ # 受保护的路由
│   └── clerk/       # Clerk 认证集成
└── styles/          # 全局样式和 CSS
```

### 核心架构模式

1. **基于路由的组织**: 代码通过 TanStack Router 文件系统路由与路由组进行组织
2. **类型安全**: 全面使用 TypeScript，严格配置，不允许 `any` 类型
3. **导入顺序**: Node.js → React → 第三方库 → 内部模块 (@/ path)
4. **组件可复用性**: 基础 UI 组件位于 `src/components/ui/`
5. **ESLint 忽略 UI 组件**: `src/components/ui/` 目录被排除在 linting 之外，因为它们是 Shadcn UI 组件

### 状态管理层次

1. **URL 状态** - 可共享状态 (过滤器, 分页) 通过 TanStack Router
2. **TanStack Query** - 服务器状态管理与缓存同步
3. **Zustand** - 全局客户端状态 (认证, 主题偏好)
4. **useState** - 本地组件状态
5. **React Hook Form** - 表单状态与 Zod 验证

## 路由系统

**TanStack Router** 提供这些路由组的文件系统路由：
- `/` - 根布局
- `/_authenticated/` - 需要认证的受保护路由
- `/(auth)/` - 认证页面 (登录, 注册等)
- `/(errors)/` - 错误页面 (401, 403, 404, 500, 503)
- `/clerk/` - Clerk 认证集成路由

## 代码质量标准

### ESLint 配置要点
- **生产环境无 console 语句** (强制为错误)
- **TypeScript 严格模式** 无 `any` 类型
- **React hooks** 规则强制执行
- **TanStack Query** 最佳实践
- **仅类型导入** 更好的 tree-shaking
- **UI 组件被忽略**: `src/components/ui/` 目录被排除在 linting 之外

### Prettier 配置
- **导入排序**: Node.js → React → 第三方库 → 内部模块，使用 @trivago/prettier-plugin-sort-imports
- **TailwindCSS 类排序** 通过 prettier-plugin-tailwindcss 提高可维护性
- **一致的格式化**: 自动格式化与 TailwindCSS 优化

## 认证系统

应用包含双重认证方法：
1. **自定义 JWT 认证** 使用 Zustand store 与 cookie 持久化
2. **Clerk 集成** 用于生产就绪的认证

### Auth Store 模式
- 基于 cookie 的令牌持久化存储在 Zustand store 中
- 自动令牌刷新和清理
- 基于角色的用户状态管理
- 会话过期处理

## API 集成模式

### HTTP 客户端配置
- **Axios** 统一拦截器直接返回 `response.data`
- 自动令牌注入用于认证请求
- 通过 `handleServerError` 工具在整个应用中一致的错误处理

### 错误处理策略
- 通过 Sonner 的集中错误处理与 toast 通知
- TanStack Query 中的全局查询错误边界
- 一致的用户反馈模式

## RTL (从右到左) 支持

此项目包含增强的 RTL 支持用于国际化：
- **自定义 Shadcn 组件** 具有 RTL 感知定位
- **方向上下文提供者** 用于运行时语言切换
- **修改的 UI 组件**: alert-dialog, calendar, command, dialog, dropdown-menu, select, table, sheet, sidebar, switch

> 通过 CLI 更新 Shadcn 组件时，RTL 修改的组件可能需要手动合并以保留 RTL 支持。

## 开发工具集成

### Vite 配置
- **路径别名**: `@/*` → `./src/*`
- **自动代码分割** 使用 TanStack Router 插件
- **SWC 编译** 更快的构建
- **TailwindCSS Vite 插件** 集成

### TypeScript 配置
- **项目引用**: 应用和 node 环境的独立配置
- **严格模式**: 无隐式 any，全面类型检查
- **路径解析**: `@/` 别名用于清洁导入

## 性能优化

1. **代码分割**: 使用 TanStack Router 的自动基于路由的代码分割
2. **包优化**: 使用仅类型导入的 tree shaking
3. **缓存策略**: TanStack Query 10秒过期时间
4. **开发工具**: 开发模式下的 React Query DevTools 和 Router DevTools
5. **未使用代码检测**: Knip 集成用于包大小优化

## 核心依赖

### 核心库
- `@tanstack/react-router` - 文件系统路由与类型安全
- `@tanstack/react-query` - 服务器状态管理
- `@tanstack/react-table` - 具有排序/过滤的表格组件
- `zustand` - 全局客户端状态管理
- `axios` - 带拦截器的 HTTP 客户端
- `react-hook-form` + `@hookform/resolvers` - 使用 Zod 验证的表单处理

### UI 组件
- `@radix-ui/*` - 可访问组件基元
- `lucide-react` - 图标库
- `recharts` - 图表组件
- `react-day-picker` - 日期选择器组件
- `cmdk` - 命令面板功能

## 开发工作流

### 提交前
1. 运行 `pnpm lint` 检查 ESLint 错误
2. 运行 `pnpm format` 格式化代码
3. 运行 `pnpm build` 确保成功构建
4. 运行 `pnpm knip` 检查未使用代码

### 文件命名约定
- **组件**: PascalCase (例如 `DataTable.tsx`)
- **文件**: kebab-case (例如 `user-profile.ts`)
- **工具**: camelCase (例如 `formatDate.ts`)

### 导入组织
```typescript
// 1. Node.js 内置模块
import path from 'path'

// 2. React
import { useState, useEffect } from 'react'

// 3. 第三方库
import { QueryClient } from '@tanstack/react-query'

// 4. 内部模块 (@/ path)
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/use-auth'
```

## 构建与部署

- **生产构建**: TypeScript 编译 + Vite 打包
- **静态站点就绪**: 兼容 Netlify, Vercel 等
- **环境变量**: `VITE_` 前缀用于客户端访问
- **开发服务器**: 使用 Vite 的热模块替换

此代码库代表了一个现代化的、生产就绪的 React 管理后台模板，具有出色的开发者体验、全面的工具和深思熟虑的架构模式，优先考虑可维护性、性能和可访问性。
- 编写的代码严格准许项目ts 配置信息 严格准许eslint.config.js  tsconfig.app.json tsconfig.json tsconfig.node.json package.json .prettierrc