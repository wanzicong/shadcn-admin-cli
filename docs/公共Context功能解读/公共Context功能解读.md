# 公共 Context 功能解读

## 概述

本项目提供了5个核心的 Context Provider，用于管理全局状态和用户偏好设置。这些 Context 基于 React Context API 实现，提供了统一的全局状态管理方案。

## Context 列表

1. **ThemeProvider** - 主题管理（深色/浅色/系统）
2. **DirectionProvider** - 文本方向管理（LTR/RTL）
3. **FontProvider** - 字体管理
4. **LayoutProvider** - 布局配置管理
5. **SearchProvider** - 全局搜索功能

---

## 1. ThemeProvider - 主题管理

### 功能说明

`ThemeProvider` 负责管理应用的主题模式，支持三种模式：
- **light** - 浅色主题
- **dark** - 深色主题
- **system** - 跟随系统设置

### 核心特性

- ✅ 自动检测系统主题偏好
- ✅ Cookie 持久化存储（1年有效期）
- ✅ 实时响应系统主题变化
- ✅ 优化的主题解析计算（使用 `useMemo`）

### 实现细节

**文件位置**: `src/develop/(context)/theme-provider.tsx`

**状态管理**:
```typescript
type Theme = 'dark' | 'light' | 'system'
type ResolvedTheme = Exclude<Theme, 'system'> // 'dark' | 'light'

interface ThemeProviderState {
  defaultTheme: Theme          // 默认主题
  resolvedTheme: ResolvedTheme // 解析后的实际主题
  theme: Theme                 // 当前主题设置
  setTheme: (theme: Theme) => void  // 设置主题
  resetTheme: () => void      // 重置主题
}
```

**Cookie 存储**:
- Cookie 名称: `vite-ui-theme`
- 有效期: 1年（365天）
- 存储位置: 浏览器 Cookie

**主题解析逻辑**:
1. 如果主题设置为 `system`，自动检测系统偏好
2. 使用 `window.matchMedia('(prefers-color-scheme: dark)')` 检测系统主题
3. 监听系统主题变化，自动更新应用主题

**DOM 操作**:
- 在 `<html>` 元素上添加/移除 `light` 或 `dark` 类名
- 通过 CSS 变量和 TailwindCSS 实现主题切换

### 使用方法

```typescript
import { ThemeProvider, useTheme } from '@/develop/(context)/theme-provider'

// 1. 在应用根组件包裹 Provider
function App() {
  return (
    <ThemeProvider defaultTheme="system">
      <YourApp />
    </ThemeProvider>
  )
}

// 2. 在组件中使用 Hook
function ThemeSwitcher() {
  const { theme, setTheme, resolvedTheme } = useTheme()
  
  return (
    <div>
      <p>当前主题: {theme}</p>
      <p>实际主题: {resolvedTheme}</p>
      <button onClick={() => setTheme('dark')}>深色</button>
      <button onClick={() => setTheme('light')}>浅色</button>
      <button onClick={() => setTheme('system')}>系统</button>
    </div>
  )
}
```

### 最佳实践

1. **初始化**: 在应用最外层包裹 `ThemeProvider`
2. **主题切换**: 使用 `setTheme` 方法，会自动保存到 Cookie
3. **系统主题**: 使用 `system` 模式提供最佳用户体验
4. **性能优化**: `resolvedTheme` 使用 `useMemo` 优化，避免不必要的计算

---

## 2. DirectionProvider - 文本方向管理

### 功能说明

`DirectionProvider` 管理应用的文本方向（LTR/RTL），支持国际化场景，特别是阿拉伯语、希伯来语等从右到左的语言。

### 核心特性

- ✅ LTR（从左到右）和 RTL（从右到左）支持
- ✅ Cookie 持久化存储（1年有效期）
- ✅ 集成 Radix UI Direction Provider
- ✅ 自动应用到 HTML 元素

### 实现细节

**文件位置**: `src/develop/(context)/direction-provider.tsx`

**状态管理**:
```typescript
type Direction = 'ltr' | 'rtl'

interface DirectionContextType {
  defaultDir: Direction      // 默认方向
  dir: Direction             // 当前方向
  setDir: (dir: Direction) => void  // 设置方向
  resetDir: () => void      // 重置方向
}
```

**Cookie 存储**:
- Cookie 名称: `dir`
- 有效期: 1年（365天）

**DOM 操作**:
- 在 `<html>` 元素上设置 `dir` 属性
- 通过 Radix UI 的 `DirectionProvider` 确保组件正确响应方向变化

### 使用方法

```typescript
import { DirectionProvider, useDirection } from '@/develop/(context)/direction-provider'

// 1. 在应用根组件包裹 Provider
function App() {
  return (
    <DirectionProvider>
      <YourApp />
    </DirectionProvider>
  )
}

// 2. 在组件中使用 Hook
function DirectionSwitcher() {
  const { dir, setDir } = useDirection()
  
  return (
    <div>
      <p>当前方向: {dir}</p>
      <button onClick={() => setDir('ltr')}>从左到右</button>
      <button onClick={() => setDir('rtl')}>从右到左</button>
    </div>
  )
}
```

### RTL 支持说明

项目中的以下组件已针对 RTL 进行了优化：
- alert-dialog
- calendar
- command
- dialog
- dropdown-menu
- select
- table
- sheet
- sidebar
- switch

---

## 3. FontProvider - 字体管理

### 功能说明

`FontProvider` 管理应用的字体设置，支持多种字体切换，提供个性化的阅读体验。

### 核心特性

- ✅ 多种字体选择
- ✅ Cookie 持久化存储（1年有效期）
- ✅ 动态应用字体类名
- ✅ 自动清理旧的字体类名

### 实现细节

**文件位置**: `src/develop/(context)/font-provider.tsx`

**字体配置**:
字体列表定义在 `src/config/fonts.ts` 中，通常包括：
- Inter（默认）
- Manrope
- 其他自定义字体

**状态管理**:
```typescript
type Font = (typeof fonts)[number]

interface FontContextType {
  font: Font                    // 当前字体
  setFont: (font: Font) => void // 设置字体
  resetFont: () => void        // 重置字体
}
```

**Cookie 存储**:
- Cookie 名称: `font`
- 有效期: 1年（365天）

**DOM 操作**:
- 在 `<html>` 元素上动态添加/移除字体类名（格式：`font-{fontName}`）
- 自动清理所有以 `font-` 开头的旧类名

### 使用方法

```typescript
import { FontProvider, useFont } from '@/develop/(context)/font-provider'

// 1. 在应用根组件包裹 Provider
function App() {
  return (
    <FontProvider>
      <YourApp />
    </FontProvider>
  )
}

// 2. 在组件中使用 Hook
function FontSwitcher() {
  const { font, setFont } = useFont()
  
  return (
    <select value={font} onChange={(e) => setFont(e.target.value)}>
      <option value="inter">Inter</option>
      <option value="manrope">Manrope</option>
    </select>
  )
}
```

---

## 4. LayoutProvider - 布局配置管理

### 功能说明

`LayoutProvider` 管理侧边栏的布局配置，包括折叠模式和变体样式，提供灵活的布局选项。

### 核心特性

- ✅ 三种折叠模式：offcanvas、icon、none
- ✅ 三种变体样式：inset、sidebar、floating
- ✅ Cookie 持久化存储（7天有效期）
- ✅ 统一的布局重置功能

### 实现细节

**文件位置**: `src/develop/(context)/layout-provider.tsx`

**布局类型**:
```typescript
type Collapsible = 'offcanvas' | 'icon' | 'none'
type Variant = 'inset' | 'sidebar' | 'floating'
```

**状态管理**:
```typescript
interface LayoutContextType {
  resetLayout: () => void              // 重置布局
  
  defaultCollapsible: Collapsible     // 默认折叠模式
  collapsible: Collapsible            // 当前折叠模式
  setCollapsible: (collapsible: Collapsible) => void
  
  defaultVariant: Variant             // 默认变体
  variant: Variant                    // 当前变体
  setVariant: (variant: Variant) => void
}
```

**Cookie 存储**:
- `layout_collapsible` - 折叠模式（7天有效期）
- `layout_variant` - 变体样式（7天有效期）

**默认值**:
- 默认折叠模式: `icon`
- 默认变体: `inset`

### 布局模式说明

**Collapsible（折叠模式）**:
- `offcanvas` - 侧边栏收起时显示为抽屉式
- `icon` - 侧边栏收起时只显示图标
- `none` - 侧边栏不可折叠

**Variant（变体样式）**:
- `inset` - 内嵌式，侧边栏与内容区域在同一容器内
- `sidebar` - 标准侧边栏，独立于内容区域
- `floating` - 浮动式，侧边栏悬浮在内容上方

### 使用方法

```typescript
import { LayoutProvider, useLayout } from '@/develop/(context)/layout-provider'

// 1. 在应用根组件包裹 Provider
function App() {
  return (
    <LayoutProvider>
      <YourApp />
    </LayoutProvider>
  )
}

// 2. 在组件中使用 Hook
function LayoutSettings() {
  const { 
    collapsible, 
    setCollapsible, 
    variant, 
    setVariant,
    resetLayout 
  } = useLayout()
  
  return (
    <div>
      <select value={collapsible} onChange={(e) => setCollapsible(e.target.value)}>
        <option value="offcanvas">抽屉式</option>
        <option value="icon">图标</option>
        <option value="none">不可折叠</option>
      </select>
      
      <select value={variant} onChange={(e) => setVariant(e.target.value)}>
        <option value="inset">内嵌式</option>
        <option value="sidebar">标准</option>
        <option value="floating">浮动</option>
      </select>
      
      <button onClick={resetLayout}>重置布局</button>
    </div>
  )
}
```

---

## 5. SearchProvider - 全局搜索功能

### 功能说明

`SearchProvider` 提供全局搜索功能，集成命令面板（Command Menu），支持键盘快捷键快速打开搜索。

### 核心特性

- ✅ 键盘快捷键支持（Cmd/Ctrl + K）
- ✅ 命令面板集成
- ✅ 全局搜索状态管理
- ✅ 自动注册键盘事件监听

### 实现细节

**文件位置**: `src/develop/(context)/search-provider.tsx`

**状态管理**:
```typescript
interface SearchContextType {
  open: boolean                          // 搜索面板是否打开
  setOpen: React.Dispatch<React.SetStateAction<boolean>>  // 设置打开状态
}
```

**键盘快捷键**:
- **Mac**: `Cmd + K`
- **Windows/Linux**: `Ctrl + K`

**组件集成**:
- 自动渲染 `CommandMenu` 组件
- 搜索面板打开时显示命令菜单

### 使用方法

```typescript
import { SearchProvider, useSearch } from '@/develop/(context)/search-provider'

// 1. 在应用根组件包裹 Provider
function App() {
  return (
    <SearchProvider>
      <YourApp />
    </SearchProvider>
  )
}

// 2. 在组件中使用 Hook
function SearchButton() {
  const { open, setOpen } = useSearch()
  
  return (
    <button onClick={() => setOpen(true)}>
      打开搜索 (Cmd/Ctrl + K)
    </button>
  )
}
```

### 键盘快捷键

用户可以通过以下方式打开搜索：
1. 按 `Cmd + K`（Mac）或 `Ctrl + K`（Windows/Linux）
2. 调用 `setOpen(true)` 方法
3. 点击搜索按钮（如果实现）

---

## Context 组合使用

### 推荐的 Provider 顺序

```typescript
import { ThemeProvider } from '@/develop/(context)/theme-provider'
import { DirectionProvider } from '@/develop/(context)/direction-provider'
import { FontProvider } from '@/develop/(context)/font-provider'
import { LayoutProvider } from '@/develop/(context)/layout-provider'
import { SearchProvider } from '@/develop/(context)/search-provider'

function App() {
  return (
    <ThemeProvider defaultTheme="system">
      <DirectionProvider>
        <FontProvider>
          <LayoutProvider>
            <SearchProvider>
              {/* 你的应用内容 */}
            </SearchProvider>
          </LayoutProvider>
        </FontProvider>
      </DirectionProvider>
    </ThemeProvider>
  )
}
```

### 在 AuthenticatedLayout 中的使用

项目中的 `AuthenticatedLayout` 组件已经集成了部分 Provider：

```typescript
// src/develop/(layout)/authenticated-layout.tsx
export function AuthenticatedLayout({ children }) {
  return (
    <SearchProvider>
      <LayoutProvider>
        {/* 侧边栏和内容 */}
      </LayoutProvider>
    </SearchProvider>
  )
}
```

---

## 技术实现细节

### Cookie 管理

所有 Context 都使用统一的 Cookie 管理工具：
- **工具文件**: `src/develop/(lib)/cookies.ts`
- **方法**: `getCookie`, `setCookie`, `removeCookie`

### 错误处理

所有 Hook 都包含错误检查：
```typescript
if (!context) {
  throw new Error('Hook must be used within Provider')
}
```

这确保了 Hook 只能在对应的 Provider 内部使用。

### 性能优化

1. **ThemeProvider**: 使用 `useMemo` 优化主题解析计算
2. **FontProvider**: 使用 `useEffect` 批量更新 DOM
3. **DirectionProvider**: 使用 Radix UI 的原生支持，性能优化

---

## 最佳实践

1. **Provider 顺序**: 按照依赖关系正确嵌套 Provider
2. **默认值**: 为所有 Provider 设置合理的默认值
3. **持久化**: 使用 Cookie 持久化用户偏好，提升用户体验
4. **错误处理**: 始终在 Provider 内部使用 Hook
5. **性能**: 避免在 Provider 内部进行不必要的重渲染

---

## 总结

这5个 Context Provider 构成了项目的全局状态管理基础，提供了：
- ✅ 主题管理（深色/浅色/系统）
- ✅ 国际化支持（LTR/RTL）
- ✅ 个性化设置（字体）
- ✅ 布局配置（侧边栏）
- ✅ 全局搜索功能

所有 Provider 都支持持久化存储，确保用户偏好能够跨会话保存，提供一致的用户体验。

