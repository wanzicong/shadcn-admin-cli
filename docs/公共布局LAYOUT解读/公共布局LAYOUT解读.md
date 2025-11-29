# 公共布局 LAYOUT 解读

## 概述

本项目提供了一套完整的布局系统，包括侧边栏、头部、主内容区等组件，支持多种布局模式和响应式设计。布局系统基于 Shadcn UI 的 Sidebar 组件构建，提供了灵活且可定制的布局方案。

## 布局组件列表

1. **AuthenticatedLayout** - 认证后的主布局容器
2. **AppSidebar** - 应用侧边栏
3. **Header** - 页面头部
4. **Main** - 主内容区
5. **TopNav** - 顶部导航
6. **NavGroup** - 导航组组件

---

## 1. AuthenticatedLayout - 认证布局容器

### 功能说明

`AuthenticatedLayout` 是认证后页面的主布局容器，整合了侧边栏、搜索功能和布局配置，提供了完整的页面框架。

### 核心特性

- ✅ 集成侧边栏（AppSidebar）
- ✅ 集成搜索功能（SearchProvider）
- ✅ 集成布局配置（LayoutProvider）
- ✅ 响应式设计
- ✅ 侧边栏状态持久化

### 实现细节

**文件位置**: `src/develop/(layout)/authenticated-layout.tsx`

**组件结构**:
```typescript
<SearchProvider>
  <LayoutProvider>
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        {children ?? <Outlet />}
      </SidebarInset>
    </SidebarProvider>
  </LayoutProvider>
</SearchProvider>
```

**侧边栏状态**:
- 从 Cookie 读取侧边栏打开/关闭状态
- Cookie 名称: `sidebar_state`
- 默认值: `true`（打开）

**布局模式**:
- 支持固定布局（`fixed`）
- 支持自适应布局（`auto`）
- 支持容器查询（`@container/content`）

### 使用方法

```typescript
import { AuthenticatedLayout } from '@/develop/(layout)/authenticated-layout'

// 在路由中使用
export const Route = createRoute({
  component: () => (
    <AuthenticatedLayout>
      <YourPageContent />
    </AuthenticatedLayout>
  ),
})
```

---

## 2. AppSidebar - 应用侧边栏

### 功能说明

`AppSidebar` 是应用的主侧边栏组件，包含团队切换器、导航菜单和用户信息。

### 核心特性

- ✅ 团队切换器（TeamSwitcher）
- ✅ 导航组（NavGroup）
- ✅ 用户信息（NavUser）
- ✅ 响应式折叠
- ✅ 支持多种变体（inset、sidebar、floating）

### 实现细节

**文件位置**: `src/develop/(layout)/app-sidebar.tsx`

**组件结构**:
```typescript
<Sidebar collapsible={collapsible} variant={variant}>
  <SidebarHeader>
    <TeamSwitcher />
  </SidebarHeader>
  <SidebarContent>
    {navGroups.map((props) => (
      <NavGroup key={props.title} {...props} />
    ))}
  </SidebarContent>
  <SidebarFooter>
    <NavUser />
  </SidebarFooter>
  <SidebarRail />
</Sidebar>
```

**布局配置**:
- `collapsible`: 从 `LayoutProvider` 获取折叠模式
- `variant`: 从 `LayoutProvider` 获取变体样式

**导航数据**:
- 从 `src/develop/(layout)/data/sidebar-data.ts` 读取导航配置

### 侧边栏变体

#### 1. Inset（内嵌式）
- 侧边栏与内容在同一容器内
- 适合大多数场景

#### 2. Sidebar（标准）
- 侧边栏独立于内容区域
- 传统布局风格

#### 3. Floating（浮动式）
- 侧边栏悬浮在内容上方
- 现代感设计

### 折叠模式

#### 1. Offcanvas（抽屉式）
- 收起时显示为抽屉
- 点击触发按钮打开

#### 2. Icon（图标）
- 收起时只显示图标
- 悬停显示完整菜单

#### 3. None（不可折叠）
- 侧边栏始终展开
- 固定宽度

---

## 3. Header - 页面头部

### 功能说明

`Header` 是页面的头部组件，支持固定定位、滚动阴影效果和侧边栏触发器。

### 核心特性

- ✅ 固定定位（可选）
- ✅ 滚动阴影效果
- ✅ 侧边栏触发器集成
- ✅ 响应式设计
- ✅ 毛玻璃效果（backdrop-blur）

### 实现细节

**文件位置**: `src/develop/(layout)/header.tsx`

**固定定位**:
```typescript
fixed && 'header-fixed peer/header sticky top-0 w-[inherit]'
```

**滚动阴影**:
- 滚动距离 > 10px 时显示阴影
- 使用 `useState` 和 `useEffect` 监听滚动

**毛玻璃效果**:
```typescript
offset > 10 && fixed && 'after:bg-background/20 after:absolute after:inset-0 after:-z-10 after:backdrop-blur-lg'
```

### 使用方法

```typescript
import { Header } from '@/develop/(layout)/header'

function Page() {
  return (
    <>
      <Header fixed>
        <TopNav links={navLinks} />
        <div className="ms-auto flex items-center space-x-4">
          <Search />
          <ThemeSwitch />
        </div>
      </Header>
      <Main>
        {/* 页面内容 */}
      </Main>
    </>
  )
}
```

---

## 4. Main - 主内容区

### 功能说明

`Main` 是页面的主内容容器，支持固定布局和流式布局两种模式。

### 核心特性

- ✅ 固定布局模式
- ✅ 流式布局模式
- ✅ 响应式内边距
- ✅ 容器查询支持

### 实现细节

**文件位置**: `src/develop/(layout)/main.tsx`

**布局模式**:
```typescript
// 固定布局
fixed && 'flex grow flex-col overflow-hidden'

// 数据属性
data-layout={fixed ? 'fixed' : 'auto'}
```

**内边距**:
- 默认: `px-4 py-6`
- 响应式调整

### 使用方法

```typescript
import { Main } from '@/develop/(layout)/main'

function Page() {
  return (
    <Main fixed>
      <h1>页面标题</h1>
      <p>页面内容</p>
    </Main>
  )
}
```

---

## 5. TopNav - 顶部导航

### 功能说明

`TopNav` 提供页面顶部的水平导航链接，支持移动端下拉菜单。

### 核心特性

- ✅ 响应式设计（移动端下拉菜单）
- ✅ 活动状态高亮
- ✅ 禁用状态支持
- ✅ 路由集成（TanStack Router）

### 实现细节

**文件位置**: `src/develop/(layout)/top-nav.tsx`

**移动端适配**:
- 小屏幕：下拉菜单（DropdownMenu）
- 大屏幕：水平导航栏

**链接配置**:
```typescript
type TopNavLink = {
  title: string      // 链接文本
  href: string      // 路由路径
  isActive: boolean // 是否激活
  disabled?: boolean // 是否禁用
}
```

### 使用方法

```typescript
import { TopNav } from '@/develop/(layout)/top-nav'

const navLinks = [
  { title: '概览', href: '/dashboard', isActive: true },
  { title: '用户', href: '/users', isActive: false },
  { title: '设置', href: '/settings', isActive: false, disabled: true },
]

function Dashboard() {
  return (
    <Header>
      <TopNav links={navLinks} />
    </Header>
  )
}
```

---

## 6. NavGroup - 导航组组件

### 功能说明

`NavGroup` 用于渲染侧边栏中的导航组，支持普通链接、可折叠菜单和收起状态的下拉菜单。

### 核心特性

- ✅ 普通导航链接
- ✅ 可折叠菜单（Collapsible）
- ✅ 收起状态下拉菜单（DropdownMenu）
- ✅ 活动状态检测
- ✅ 徽章支持（Badge）
- ✅ 图标支持

### 实现细节

**文件位置**: `src/develop/(layout)/nav-group.tsx`

**导航项类型**:
```typescript
type NavLink = {
  title: string
  url: string
  icon?: React.ComponentType
  badge?: string | number
}

type NavCollapsible = {
  title: string
  url: string
  icon?: React.ComponentType
  badge?: string | number
  items: NavLink[]
}
```

**活动状态检测**:
```typescript
function checkIsActive(href: string, item: NavItem, mainNav = false) {
  return (
    href === item.url ||                    // 完全匹配
    href.split('?')[0] === item.url ||      // 路径匹配（忽略查询参数）
    !!item?.items?.filter((i) => i.url === href).length ||  // 子项匹配
    (mainNav && href.split('/')[1] === item?.url?.split('/')[1])  // 主路径匹配
  )
}
```

**响应式行为**:
- 侧边栏展开：显示可折叠菜单
- 侧边栏收起（桌面端）：显示下拉菜单
- 移动端：始终显示可折叠菜单

### 使用方法

```typescript
import { NavGroup } from '@/develop/(layout)/nav-group'

const navGroups = [
  {
    title: '主要',
    items: [
      { title: '仪表盘', url: '/dashboard', icon: DashboardIcon },
      { title: '任务', url: '/tasks', icon: TasksIcon, badge: '5' },
    ],
  },
  {
    title: '设置',
    items: [
      {
        title: '用户管理',
        url: '/users',
        icon: UsersIcon,
        items: [
          { title: '用户列表', url: '/users/list' },
          { title: '角色管理', url: '/users/roles' },
        ],
      },
    ],
  },
]

function Sidebar() {
  return (
    <SidebarContent>
      {navGroups.map((group) => (
        <NavGroup key={group.title} {...group} />
      ))}
    </SidebarContent>
  )
}
```

---

## 布局系统架构

### 组件层次结构

```
AuthenticatedLayout
├── SearchProvider (全局搜索)
├── LayoutProvider (布局配置)
└── SidebarProvider (侧边栏状态)
    ├── AppSidebar (侧边栏)
    │   ├── SidebarHeader (头部)
    │   │   └── TeamSwitcher (团队切换)
    │   ├── SidebarContent (内容)
    │   │   └── NavGroup[] (导航组)
    │   ├── SidebarFooter (底部)
    │   │   └── NavUser (用户信息)
    │   └── SidebarRail (轨道)
    └── SidebarInset (内容区)
        └── <Outlet /> (页面内容)
```

### 布局配置流程

1. **LayoutProvider** 提供布局配置（collapsible、variant）
2. **AppSidebar** 读取配置并应用
3. **SidebarProvider** 管理侧边栏打开/关闭状态
4. **Cookie** 持久化侧边栏状态

---

## 响应式设计

### 断点系统

- **移动端**: < 768px
- **平板**: 768px - 1024px
- **桌面**: > 1024px

### 响应式行为

1. **侧边栏**:
   - 移动端：抽屉式（点击打开）
   - 桌面端：可折叠/固定

2. **顶部导航**:
   - 移动端：下拉菜单
   - 桌面端：水平导航

3. **主内容区**:
   - 移动端：全宽
   - 桌面端：自适应宽度

---

## 布局模式详解

### 1. 固定布局（Fixed Layout）

```typescript
<Main fixed>
  {/* 内容 */}
</Main>
```

**特点**:
- 主容器使用 `flex grow flex-col overflow-hidden`
- 高度固定为视口高度
- 适合需要固定高度的场景（如仪表盘）

### 2. 自适应布局（Auto Layout）

```typescript
<Main>
  {/* 内容 */}
</Main>
```

**特点**:
- 内容高度自适应
- 支持滚动
- 适合内容较多的页面

---

## 最佳实践

### 1. 布局选择

- **固定布局**: 仪表盘、数据可视化页面
- **自适应布局**: 列表页、详情页、表单页

### 2. 导航组织

- 使用 `NavGroup` 组织相关导航项
- 合理使用可折叠菜单，避免导航过深
- 使用徽章显示未读数量或状态

### 3. 响应式设计

- 始终测试移动端体验
- 使用响应式工具类（TailwindCSS）
- 考虑触摸设备的使用场景

### 4. 性能优化

- 使用 `React.memo` 优化导航组件
- 避免在布局组件中进行重计算
- 合理使用状态管理，避免不必要的重渲染

---

## 自定义布局

### 创建自定义布局

```typescript
function CustomLayout({ children }) {
  return (
    <LayoutProvider>
      <SidebarProvider>
        <CustomSidebar />
        <SidebarInset>
          <CustomHeader />
          <Main>
            {children}
          </Main>
        </SidebarInset>
      </SidebarProvider>
    </LayoutProvider>
  )
}
```

### 扩展导航数据

```typescript
// src/develop/(layout)/data/sidebar-data.ts
export const sidebarData = {
  navGroups: [
    {
      title: '自定义',
      items: [
        // 你的导航项
      ],
    },
  ],
}
```

---

## 总结

布局系统提供了：

- ✅ **AuthenticatedLayout**: 完整的认证布局容器
- ✅ **AppSidebar**: 功能丰富的侧边栏
- ✅ **Header/Main**: 灵活的页面结构
- ✅ **TopNav**: 响应式顶部导航
- ✅ **NavGroup**: 强大的导航组织组件

所有组件都支持响应式设计，提供了灵活的布局配置选项，可以满足各种业务场景的需求。通过合理的组合使用，可以快速构建出专业的管理后台界面。

