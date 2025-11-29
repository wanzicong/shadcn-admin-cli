# 代码格式化指南

本项目使用 Prettier 进行代码格式化，支持自动导入排序和 TailwindCSS 类排序。

## 格式化命令

### 基本命令

```bash
# 格式化所有文件（写入更改）
pnpm format
# 或
npm run format

# 检查代码格式（不写入，仅检查）
pnpm format:check
# 或
npm run format:check

# 格式化并修复（等同于 format）
pnpm format:fix
# 或
npm run format:fix
```

### 格式化特定目录

```bash
# 仅格式化 src 目录下的文件
pnpm format:src
# 或
npm run format:src

# 仅格式化配置文件
pnpm format:config
# 或
npm run format:config
```

### 格式化特定文件类型

```bash
# 仅格式化 TypeScript/TSX 文件
pnpm format:ts
# 或
npm run format:ts

# 仅格式化 JSON 文件
pnpm format:json
# 或
npm run format:json

# 仅格式化 Markdown 文件
pnpm format:md
# 或
npm run format:md
```

### 组合命令

```bash
# 格式化并检查（确保格式化成功）
pnpm format:all
# 或
npm run format:all
```

## Prettier 配置

格式化规则定义在 `.prettierrc` 文件中：

- **单引号**: 使用单引号而非双引号
- **无分号**: 不使用分号结尾
- **Tab 宽度**: 2 个空格（配置中显示为 5，实际为 2）
- **行宽**: 160 字符
- **尾随逗号**: ES5 兼容
- **导入排序**: 自动排序导入语句
- **TailwindCSS 类排序**: 自动排序 TailwindCSS 类名

## 导入排序规则

导入语句按以下顺序自动排序：

1. Node.js 内置模块（`path`, `fs` 等）
2. Vite 相关（`vite`, `@vitejs/*`）
3. React 相关（`react`, `react-dom`, `react/*`）
4. 第三方库（`zod`, `axios`, `date-fns` 等）
5. Radix UI 组件（`@radix-ui/*`）
6. TanStack 库（`@tanstack/*`）
7. 其他第三方模块
8. 内部模块（`@/` 路径别名）
   - `@/assets/*`
   - `@/api/*`
   - `@/stores/*`
   - `@/lib/*`
   - `@/utils/*`
   - `@/constants/*`
   - `@/context/*`
   - `@/hooks/*`
   - `@/components/*`
   - `@/features/*`
9. 相对路径导入（`./`, `../`）

## 忽略的文件

以下文件不会被格式化（定义在 `.prettierignore`）：

- `node_modules/`
- `dist/`
- `build/`
- `.git/`
- `src/routeTree.gen.ts`（自动生成的文件）

## 编辑器集成

### VS Code

安装 Prettier 扩展后，可以配置自动格式化：

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "[typescript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[typescriptreact]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[javascript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[json]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  }
}
```

### WebStorm / IntelliJ IDEA

1. 打开 Settings → Languages & Frameworks → JavaScript → Prettier
2. 启用 "On code reformat" 和 "On save"
3. 选择 Prettier 包路径（通常是 `node_modules/prettier`）

## CI/CD 集成

在 CI/CD 流程中，使用 `format:check` 来验证代码格式：

```yaml
# .github/workflows/ci.yml 示例
- name: Check code format
  run: pnpm format:check
```

## 常见问题

### 格式化后导入顺序不对

确保安装了 `@trivago/prettier-plugin-sort-imports` 插件，并且 `.prettierrc` 中配置了 `importOrder`。

### TailwindCSS 类没有排序

确保安装了 `prettier-plugin-tailwindcss` 插件，并且它是 Prettier 配置中的最后一个插件。

### 某些文件没有被格式化

检查 `.prettierignore` 文件，确认文件路径没有被忽略。

## 最佳实践

1. **提交前格式化**: 在提交代码前运行 `pnpm format`
2. **CI 检查**: 在 CI 流程中使用 `pnpm format:check` 确保代码格式一致
3. **编辑器集成**: 配置编辑器自动格式化，提高开发效率
4. **团队协作**: 确保团队成员都使用相同的 Prettier 配置

## 相关命令

```bash
# 代码质量检查
pnpm lint              # ESLint 检查
pnpm format:check      # Prettier 格式检查
pnpm build             # 构建检查
pnpm knip              # 未使用代码检查
```

