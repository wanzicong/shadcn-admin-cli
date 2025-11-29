# TypeScript 类型检查指南

## 概述

TypeScript 类型错误和 ESLint 错误是不同的：

- **ESLint (`pnpm lint`)**: 检查代码风格、语法错误、未使用的变量等
- **TypeScript (`pnpm type-check`)**: 检查类型错误、类型不匹配、缺失类型定义等

两者都需要检查，以确保代码质量。

## 类型检查命令

### 基本命令

```bash
# 检查 TypeScript 类型错误（不生成文件）
pnpm type-check
# 或
npm run type-check

# 监听模式：自动检查类型错误（开发时使用）
pnpm type-check:watch
# 或
npm run type-check:watch
```

### 组合检查命令

```bash
# 同时运行 ESLint 和 TypeScript 类型检查
pnpm check
# 或
npm run check
```

## 命令说明

### `type-check`

使用 `tsc --noEmit` 检查所有 TypeScript 文件的类型错误，但不会生成任何文件。

**用途**：
- 检查类型错误
- 检查类型不匹配
- 检查缺失的类型定义
- 验证类型安全性

**示例输出**：
```bash
> pnpm type-check

# 如果没有错误，无输出
# 如果有错误，会显示详细的类型错误信息
```

### `type-check:watch`

监听模式，当文件发生变化时自动检查类型错误。

**用途**：
- 开发时实时检查类型错误
- 快速发现类型问题

**使用场景**：
```bash
# 在一个终端运行
pnpm type-check:watch

# 在另一个终端运行开发服务器
pnpm dev
```

### `check`

组合命令，同时运行 ESLint 和 TypeScript 类型检查。

**用途**：
- 提交代码前检查
- CI/CD 流程中检查
- 确保代码质量和类型安全

**执行顺序**：
1. 先运行 `pnpm lint`（ESLint 检查）
2. 再运行 `pnpm type-check`（TypeScript 类型检查）
3. 如果任一检查失败，命令会失败

## ESLint vs TypeScript 类型检查

### ESLint 检查的内容

- ✅ 代码风格和格式
- ✅ 未使用的变量和导入
- ✅ React Hooks 规则
- ✅ 代码质量问题
- ✅ 一些语法错误
- ❌ **不检查类型错误**

### TypeScript 类型检查的内容

- ✅ 类型错误
- ✅ 类型不匹配
- ✅ 缺失的类型定义
- ✅ 类型安全性
- ✅ 接口和类型定义问题
- ❌ **不检查代码风格**

## 常见类型错误示例

### 1. 类型不匹配

```typescript
// ❌ 错误
const num: number = "123"

// ✅ 正确
const num: number = 123
```

### 2. 缺失类型定义

```typescript
// ❌ 错误
function greet(name) {
  return `Hello, ${name}`
}

// ✅ 正确
function greet(name: string): string {
  return `Hello, ${name}`
}
```

### 3. 访问不存在的属性

```typescript
// ❌ 错误
interface User {
  name: string
}
const user: User = { name: "John" }
console.log(user.age) // 类型错误：User 上不存在属性 'age'

// ✅ 正确
interface User {
  name: string
  age?: number
}
```

### 4. 类型断言错误

```typescript
// ❌ 错误
const str: string = 123 as string

// ✅ 正确
const str: string = String(123)
```

## 开发工作流建议

### 开发时

```bash
# 终端 1: 运行开发服务器
pnpm dev

# 终端 2: 监听类型检查（可选）
pnpm type-check:watch
```

### 提交代码前

```bash
# 运行完整的代码检查
pnpm check        # ESLint + TypeScript 类型检查
pnpm format:check # 代码格式检查
pnpm build        # 确保能够成功构建
```

### CI/CD 流程

在 CI/CD 配置中添加：

```yaml
# .github/workflows/ci.yml 示例
- name: Check code quality
  run: |
    pnpm install
    pnpm check
    pnpm format:check
    pnpm build
```

## 配置说明

### TypeScript 配置

类型检查使用 `tsconfig.json` 和 `tsconfig.app.json` 中的配置：

- **严格模式**: `strict: true`
- **未使用的变量**: `noUnusedLocals: true`
- **未使用的参数**: `noUnusedParameters: true`
- **路径别名**: `@/*` → `./src/*`

### 忽略文件

TypeScript 会自动忽略：
- `node_modules/`
- `dist/`
- `build/`
- 在 `tsconfig.json` 中 `exclude` 的文件

## 故障排除

### 类型错误但代码能运行

TypeScript 类型检查是编译时检查，不会影响运行时。如果代码能运行但类型检查失败，说明：
- 类型定义不准确
- 使用了 `any` 类型
- 需要添加类型断言

### 类型检查很慢

如果类型检查很慢，可以：
1. 使用 `type-check:watch` 模式（增量检查）
2. 检查是否有大量文件被包含
3. 考虑使用项目引用（Project References）

### 类型错误太多

如果有很多类型错误：
1. 先修复最严重的错误
2. 逐步添加类型定义
3. 使用 `// @ts-ignore` 临时忽略（不推荐）

## 相关命令

```bash
# 代码质量检查
pnpm lint              # ESLint 检查
pnpm type-check        # TypeScript 类型检查
pnpm check             # ESLint + TypeScript 类型检查

# 代码格式检查
pnpm format:check      # Prettier 格式检查

# 构建检查
pnpm build             # TypeScript 编译 + Vite 构建

# 其他检查
pnpm knip              # 未使用代码检查
```

## 最佳实践

1. **开发时**: 使用编辑器集成（VS Code TypeScript 支持）
2. **提交前**: 运行 `pnpm check` 确保代码质量
3. **CI/CD**: 在 CI 流程中运行 `pnpm check`
4. **类型安全**: 避免使用 `any`，使用严格的类型定义
5. **增量检查**: 使用 `type-check:watch` 提高开发效率

