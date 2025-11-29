# shadcn-admin 项目 Claude Code 配置指南

## 项目概述

这是一个基于 React 19 + TypeScript 的现代化管理后台模板，版本 2.2.1，使用 Vite 构建，具有 Shadcn UI 组件库和全面的开发工具链。项目已配置了 TanStack Router 文件系统路由，所有业务代码位于 `src/develop/` 目录下。

## 技术栈特点

### 核心技术
- **React 19.2.0** - 最新 React 版本，支持严格模式和完整 TypeScript 集成
- **TypeScript ~5.9.3** - 严格模式配置，零容忍 `any` 类型
- **Vite 7.2.4** with SWC - 极速开发服务器和构建工具
- **TailwindCSS 4.1.17** - 原子化 CSS，Vite 集成

### 路由与状态管理
- **TanStack Router 1.139.3** - 文件系统路由，自动代码分割，类型安全
- **TanStack Query 5.90.10** - 服务器状态管理和缓存同步
- **Zustand 5.0.8** - 轻量级客户端状态管理
- **React Hook Form 7.66.1** + Zod 4.1.13 - 表单处理和验证

### UI 组件体系
- **Shadcn UI** - 基于 Radix UI 的高质量组件库
- **Radix UI** - 可访问性组件基元
- **Lucide React 0.554.0** - 现代化图标库
- **Recharts 3.5.0** - React 图表组件

### 认证系统
- **@clerk/clerk-react 5.57.0** - 生产级认证解决方案
- **自定义 JWT 认证** - 基于 Zustand store 的 cookie 持久化

## 项目架构

### 目录结构
```
src/
├── develop/                # 所有业务代码 (TanStack Router 路由)
│   ├── (context)/         # React Context 提供者
│   ├── (hooks)/           # 项目全局 Hooks
│   ├── (lib)/             # 项目全局工具函数
│   ├── (services)/        # API 和外部服务集成
│   ├── (stores)/          # 全局状态管理
│   ├── (views)/           # 业务页面组件
│   │   └── official/      # 官方页面组件
│   └── clerk/             # Clerk 认证集成页面
├── components/            # 可复用组件
│   └── ui/               # Shadcn UI 基础组件 (ESLint 忽略)
└── assets/               # 静态资源文件
```

### 路由配置
- **路由目录**: `./src/develop`
- **路由树生成**: `./src/routeTree.gen.ts`
- **受保护路由**: `_authenticated` 前缀
- **路由组**: 使用括号组织功能模块

## Claude Code 权限配置

### 允许的操作
- **代码操作**: 读取、编写、编辑所有源代码文件
- **包管理**: pnpm、npm、npx 命令
- **Git 操作**: status、add、commit、restore、diff、log、branch、checkout
- **开发工具**: TypeScript 编译、Vite、Prettier、ESLint、Knip
- **文件查找**: find、ls、glob、grep

### 需要确认的操作
- **Git 推送**: git push、pull、merge、rebase
- **包发布**: npm publish、pnpm publish
- **系统操作**: sudo、chmod、rm -rf 等

### 禁止的操作
- **危险删除**: rm -rf node_modules、.git、src
- **系统格式化**: fdisk、mkfs 等磁盘操作

## 开发工作流程

### 日常开发命令
```bash
pnpm dev              # 启动开发服务器
pnpm build            # 构建生产版本
pnpm lint             # 代码检查
pnpm type-check       # TypeScript 类型检查
pnpm check            # 并行运行 lint 和 type-check
pnpm format           # 代码格式化
pnpm knip             # 未使用代码检测
```

### 提交前检查清单
1. 运行 `pnpm check` 确保 ESLint 和 TypeScript 检查通过
2. 运行 `pnpm format` 格式化代码
3. 运行 `pnpm build` 确保成功构建
4. 运行 `pnpm knip` 检查未使用的代码

### 代码质量标准
- **TypeScript 严格模式**: 无 `any` 类型，全面错误检查
- **ESLint 规则**: React hooks 规则，TanStack Query 最佳实践
- **导入顺序**: Node.js → React → 第三方库 → 内部模块
- **组件命名**: PascalCase 组件，kebab-case 文件

## 状态管理层次

1. **URL 状态** - TanStack Router 管理可共享状态
2. **服务器状态** - TanStack Query 管理API数据和缓存
3. **全局状态** - Zustand 管理认证、主题偏好
4. **组件状态** - useState 管理本地状态
5. **表单状态** - React Hook Form + Zod 管理表单

## 认证集成

项目支持双重认证方式：
1. **自定义JWT认证** - 使用 Zustand + cookie 持久化
2. **Clerk集成** - 生产级认证解决方案

### Auth Store 模式
- 基于 cookie 的令牌持久化
- 自动令牌刷新和清理
- 基于角色的用户状态管理

## API 集成模式

### HTTP 客户端
- **Axios** 统一拦截器，直接返回 `response.data`
- 自动令牌注入用于认证请求
- 通过 `handleServerError` 工具统一错误处理

### 错误处理
- Sonner Toast 通知系统
- TanStack Query 全局查询错误边界
- 一致的用户反馈模式

## 国际化支持

项目包含 RTL (从右到左) 支持：
- **RTL 感知组件**: 修改的 Shadcn 组件支持 RTL
- **方向上下文**: 运行时语言切换
- **受影响组件**: alert-dialog、calendar、dialog、dropdown-menu、select、table、sheet、sidebar、switch

## 性能优化特性

1. **代码分割**: TanStack Router 自动基于路由的代码分割
2. **Tree Shaking**: 仅类型导入，优化包大小
3. **缓存策略**: TanStack Query 10秒过期时间
4. **开发工具**: React Query DevTools 和 Router DevTools
5. **未使用代码检测**: Knip 集成

## Claude Code 使用建议

### 推荐操作模式
- 使用 `plan` 模式进行复杂功能规划
- 利用 `AskUserQuestion` 进行需求确认
- 使用 `TodoWrite` 跟踪任务进度

### 项目特定命令
- `/dev` - 启动开发服务器
- `/build` - 构建项目
- `/test` - 运行代码质量检查
- `/format` - 格式化代码
- `/clean` - 检查未使用代码

### 注意事项
- `src/components/ui/` 目录被 ESLint 忽略，因为包含 Shadcn UI 组件
- 项目使用严格 TypeScript 配置，避免使用 `any` 类型
- 遵循既定的导入顺序和命名约定
- 优先编辑现有文件而非创建新文件

这个配置为 shadcn-admin 项目提供了完整的 Claude Code 工作环境，确保开发效率、代码质量和项目安全性。