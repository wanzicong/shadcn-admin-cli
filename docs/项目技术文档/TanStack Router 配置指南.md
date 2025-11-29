# TanStack Router 配置指南

## 指定路由文件夹位置

TanStack Router 支持通过配置文件或 Vite 插件选项来指定路由文件夹的位置。

### 方法一：使用 tsr.config.json（推荐）

在项目根目录创建 `tsr.config.json` 文件：

```json
{
  "routesDirectory": "./src/develop",
  "generatedRouteTree": "./src/routeTree.gen.ts"
}
```

#### 配置选项说明

- **`routesDirectory`**: 路由文件所在的目录路径（相对于项目根目录）
  - 默认值: `./src/routes`
  - 示例: `./app/routes`, `./src/pages`, `./routes`

- **`generatedRouteTree`**: 生成的路由树文件保存路径（相对于项目根目录）
  - 默认值: `./src/routeTree.gen.ts`
  - 示例: `./src/router/routeTree.gen.ts`, `./app/routeTree.gen.ts`

### 方法二：在 vite.config.ts 中配置

在 `vite.config.ts` 的 `tanstackRouter` 插件选项中配置：

```typescript
import { defineConfig } from 'vite'
import { tanstackRouter } from '@tanstack/router-plugin/vite'

export default defineConfig({
  plugins: [
    tanstackRouter({
      target: 'react',
      autoCodeSplitting: true,
      routesDirectory: './src/develop',           // 路由文件夹位置
      generatedRouteTree: './src/routeTree.gen.ts', // 生成的路由树文件位置
    }),
    // ... 其他插件
  ],
})
```

### 配置示例

#### 示例 1: 使用 app 目录结构

```json
{
  "routesDirectory": "./app/develop",
  "generatedRouteTree": "./app/routeTree.gen.ts"
}
```

#### 示例 2: 使用 pages 目录结构

```json
{
  "routesDirectory": "./src/pages",
  "generatedRouteTree": "./src/router/routeTree.gen.ts"
}
```

#### 示例 3: 路由文件在项目根目录

```json
{
  "routesDirectory": "./develop",
  "generatedRouteTree": "./routeTree.gen.ts"
}
```

### 注意事项

1. **路径格式**: 使用相对路径，相对于项目根目录（`package.json` 所在目录）

2. **配置文件优先级**: 
   - 如果同时存在 `tsr.config.json` 和 Vite 插件配置，`tsr.config.json` 的优先级更高

3. **必填选项**: 
   - `routesDirectory` 和 `generatedRouteTree` 都是必填项，不能为空字符串或 `undefined`

4. **目录结构要求**:
   - 路由目录必须包含 `__root.tsx` 或 `__root.ts` 作为根路由
   - 路由文件命名遵循 TanStack Router 的文件系统路由规则

5. **生成文件位置**:
   - 确保 `generatedRouteTree` 指定的路径在 TypeScript 编译范围内
   - 建议将生成的文件放在 `src` 目录下，以便被 TypeScript 识别

### 当前项目配置

本项目使用默认配置：

```json
{
  "routesDirectory": "./src/develop",
  "generatedRouteTree": "./src/routeTree.gen.ts"
}
```

路由文件位于 `src/routes/` 目录，生成的路由树文件为 `src/routeTree.gen.ts`。

### 修改配置后的步骤

1. 创建或修改 `tsr.config.json` 文件
2. 如果更改了路由目录，需要移动现有的路由文件到新位置
3. 如果更改了生成文件位置，需要更新 `src/main.tsx` 中的导入路径：

```typescript
// 如果生成文件改为 ./app/routeTree.gen.ts
import { routeTree } from '../app/routeTree.gen'
```

4. 重启开发服务器（`pnpm dev`）以应用更改

### 验证配置

配置完成后，运行开发服务器，TanStack Router 会自动：
- 扫描指定的路由目录
- 生成路由树文件到指定位置
- 如果配置正确，控制台不会出现错误信息

### 相关文档

- [TanStack Router 官方文档](https://tanstack.com/router/latest)
- [基于文件的路由配置](https://tanstack.com/router/latest/docs/api/file-based-routing)

