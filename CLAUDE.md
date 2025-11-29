# CLAUDE.md

本文件为 Claude Code (claude.ai/code) 在此代码库中工作时提供指导。

## 项目概述

这是一个使用 Vite 构建的现代化 React 19 + TypeScript 管理后台，具有 Shadcn UI 组件和全面的开发工具。这是版本 2.2.1，是一个成熟的、可用于生产环境的管理后台模板。

项目使用 TanStack Router 文件系统路由，所有业务代码位于 `src/develop/` 目录下，通过路由组实现模块化组织。

## 开发命令

### 核心开发
```bash
pnpm install          # 安装所有项目依赖
pnpm dev              # 启动开发服务器 (Vite + HMR，端口 3000)
pnpm build            # 构建生产版本 (TypeScript 编译 + Vite 打包)
pnpm preview          # 预览生产构建
```

### 代码质量检查
```bash
pnpm lint             # 运行 ESLint (严格 TypeScript + React 规则，UI 组件被忽略)
pnpm type-check       # TypeScript 类型检查
pnpm type-check:watch # 监听模式类型检查
pnpm check            # 并行运行 lint 和 type-check
pnpm format           # 使用 Prettier 格式化代码 (包含 TailwindCSS 类排序)
pnpm format:check     # 检查代码格式
pnpm knip             # 查找未使用的代码和依赖，优化包大小
```

### 专项格式化命令
```bash
pnpm format:src       # 仅格式化 src 目录
pnpm format:config    # 仅格式化配置文件
pnpm format:ts        # 仅格式化 TypeScript 文件
pnpm format:json      # 仅格式化 JSON 文件
pnpm format:md        # 仅格式化 Markdown 文件
pnpm format:all       # 格式化后检查所有文件
```

## 核心技术栈

### 前端框架
- **React 19.2.0** - 最新 React 版本，支持严格模式和全面 TypeScript 集成
- **TypeScript ~5.9.3** - 严格模式配置，零容忍 `any` 类型
- **Vite 7.2.4** with SWC - 极速开发服务器和构建工具

### 路由与状态管理
- **TanStack Router 1.139.3** - 文件系统路由，自动代码分割，类型安全
- **TanStack Query 5.90.10** - 服务器状态管理和缓存同步
- **Zustand 5.0.8** - 轻量级客户端状态管理
- **React Hook Form 7.66.1** + Zod 4.1.13 - 表单处理和验证

### UI 组件库
- **Shadcn UI** - 基于 Radix UI 的高质量组件库
- **TailwindCSS 4.1.17** with Vite 集成 - 原子化 CSS
- **Radix UI** - 可访问性组件基元 (Alert, Avatar, Checkbox, Dialog, Dropdown, Select, Switch, Tabs, Tooltip 等)
- **Lucide React 0.554.0** - 现代化图标库
- **Recharts 3.5.0** - React 图表组件
- **React Day Picker 9.11.2** - 日期选择器组件
- **Sonner 2.0.7** - Toast 通知组件

### 认证系统
- **@clerk/clerk-react 5.57.0** - 生产级认证解决方案
- **自定义 JWT 认证** - 基于 Zustand store 的 cookie 持久化

### 开发工具与代码质量
- **ESLint 9.39.1** - 现代化扁平配置，React hooks 规则，TanStack Query 最佳实践
- **Prettier 3.6.2** - 代码格式化，TailwindCSS 类排序，导入排序
- **Knip 5.70.2** - 未使用代码检测和包大小优化

## 项目架构

### 目录结构
```
src/
├── assets/                    # 静态资源文件
│   ├── brand-icons/         # 品牌/社交图标组件
│   └── custom/              # 自定义 SVG 图标组件
├── components/              # 可复用组件
│   ├── ui/                 # Shadcn UI 基础组件 (ESLint 忽略)
│   ├── coming-soon.tsx     # 开发中页面组件
│   ├── date-picker.tsx     # 日期选择器组件
│   ├── navigation-progress.tsx # 导航进度组件
│   ├── search.tsx          # 全局搜索组件
│   ├── theme-switch.tsx    # 主题切换组件
│   └── config-drawer.tsx   # 配置抽屉组件
├── develop/                # 所有业务代码目录 (TanStack Router 路由)
│   ├── (context)/         # React Context 提供者
│   ├── (hooks)/           # 项目全局 Hooks
│   ├── (lib)/             # 项目全局工具函数
│   ├── (services)/        # API 和外部服务集成
│   ├── (stores)/          # 全局状态管理
│   ├── (views)/           # 业务页面组件
│   │   └── official/      # 官方页面组件
│   │       ├── auth/      # 认证相关页面
│   │       ├── dashboard/ # 仪表板页面
│   │       ├── users/     # 用户管理页面
│   │       ├── tasks/     # 任务管理页面
│   │       ├── chats/     # 聊天功能页面
│   │       ├── apps/      # 应用管理页面
│   │       ├── settings/  # 设置页面
│   │       └── errors/    # 错误页面
│   └── clerk/             # Clerk 认证集成页面
├── config/               # 配置文件
├── styles/              # 全局样式文件
├── tanstack-table.d.ts   # TanStack Table 类型定义
└── vite-env.d.ts        # Vite 环境类型定义
```

### TanStack Router 配置
- **路由目录**: `./src/develop` (通过 `tsr.config.json` 配置)
- **路由树生成**: `./src/routeTree.gen.ts`
- **路由组组织**: 使用括号路由组 `(context)`、`(hooks)`、`(lib)`、`(views)` 等
- **受保护路由**: `_authenticated` 前缀表示需要认证的路由
- **Clerk 集成**: `clerk/` 目录下为 Clerk 专用的认证路由

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

### ESLint 配置要点

- **生产环境无 console 语句** (强制为错误)
- **TypeScript 严格模式** 无 `any` 类型，全面错误检查
- **React hooks** 规则强制执行，适用于 React 19
- **TanStack Query** 最佳实践强制执行
- **仅类型导入** 强制执行，更好的 tree-shaking
- **UI 组件被忽略**: `src/components/ui/` 目录被排除在 linting 之外

### Prettier 配置

- **导入排序**: Node.js → React → 第三方库 → 内部模块，使用 @trivago/prettier-plugin-sort-imports
- **TailwindCSS 类排序** 通过 prettier-plugin-tailwindcss 提高可维护性
- **一致的格式化**: 自动格式化与 TailwindCSS 优化

### Vite 配置

- **路径别名**: `@/*` → `./src/*`
- **自动代码分割** 使用 TanStack Router 插件，基于路由的自动代码分割
- **SWC 编译** 使用 SWC 替代 Babel，更快的构建
- **TailwindCSS Vite 插件** 原生集成
- **代理配置**: `/api` 代理指向 `VITE_API_BASE_URL` 或 `http://localhost:8080`
- **开发服务器**: 端口 3000，自动打开浏览器并启用 CORS

## 开发工作流程

### 提交前
1. 运行 `pnpm check` 确保 ESLint 和 TypeScript 检查通过
2. 运行 `pnpm format` 格式化代码
3. 运行 `pnpm build` 确保成功构建
4. 运行 `pnpm knip` 检查未使用的代码

### 导入组织 (由 Prettier 强制执行)
```typescript
// 1. Node.js 内置模块
import path from 'path'

// 2. React
import { useState, useEffect } from 'react'

// 3. 第三方库
import { QueryClient } from '@tanstack/react-query'
import { zodResolver } from '@hookform/resolvers/zod'

// 4. 内部模块 (@/ path)
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/use-auth'
```

### 文件命名约定
- **组件**: PascalCase (例如 `DataTable.tsx`)
- **文件**: kebab-case (例如 `user-profile.ts`)
- **工具**: camelCase (例如 `formatDate.ts`)

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

## 性能优化

1. **代码分割**: 使用 TanStack Router 的自动基于路由的代码分割
2. **包优化**: 使用仅类型导入的 tree shaking
3. **缓存策略**: TanStack Query 10秒过期时间
4. **开发工具**: 开发模式下的 React Query DevTools 和 Router DevTools
5. **未使用代码检测**: Knip 集成用于包大小优化

此代码库代表了一个现代化的、生产就绪的 React 管理后台模板，具有出色的开发者体验、全面的工具和深思熟虑的架构模式，优先考虑可维护性、性能和可访问性。