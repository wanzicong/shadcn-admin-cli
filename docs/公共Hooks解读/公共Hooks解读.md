# 公共 Hooks 解读

## 概述

本项目提供了3个核心的自定义 Hooks，用于处理常见的业务场景和状态管理需求。这些 Hooks 基于 React Hooks API 实现，提供了可复用的逻辑封装。

## Hooks 列表

1. **useIsMobile** - 响应式移动端检测
2. **useDialogState** - 对话框状态管理
3. **useTableUrlState** - 表格 URL 状态同步

---

## 1. useIsMobile - 响应式移动端检测

### 功能说明

`useIsMobile` 用于检测当前设备是否为移动端，基于窗口宽度判断。这是一个响应式的 Hook，会实时响应窗口大小变化。

### 核心特性

- ✅ 响应式检测（实时响应窗口变化）
- ✅ 基于断点判断（768px）
- ✅ 使用 MediaQuery API 优化性能
- ✅ 服务端渲染安全（初始值为 `undefined`）

### 实现细节

**文件位置**: `src/develop/(hooks)/use-mobile.tsx`

**断点设置**:
```typescript
const MOBILE_BREAKPOINT = 768  // 768px 以下视为移动端
```

**实现逻辑**:
1. 使用 `window.matchMedia` 创建媒体查询监听器
2. 监听窗口大小变化事件
3. 当窗口宽度 < 768px 时返回 `true`，否则返回 `false`

**状态管理**:
```typescript
const [isMobile, setIsMobile] = useState<boolean | undefined>(undefined)
```

初始值为 `undefined`，确保服务端渲染安全。客户端挂载后才会设置实际值。

### 使用方法

```typescript
import { useIsMobile } from '@/develop/(hooks)/use-mobile'

function ResponsiveComponent() {
  const isMobile = useIsMobile()
  
  if (isMobile === undefined) {
    // 服务端渲染或初始加载
    return <div>Loading...</div>
  }
  
  return (
    <div>
      {isMobile ? (
        <MobileLayout />
      ) : (
        <DesktopLayout />
      )}
    </div>
  )
}
```

### 使用场景

1. **条件渲染**: 根据设备类型渲染不同的组件
2. **样式调整**: 动态应用移动端样式
3. **功能切换**: 移动端隐藏某些功能
4. **布局切换**: 响应式布局切换

### 示例：响应式导航栏

```typescript
function Navigation() {
  const isMobile = useIsMobile()
  
  return (
    <nav>
      {isMobile ? (
        <MobileMenu />
      ) : (
        <DesktopMenu />
      )}
    </nav>
  )
}
```

### 性能优化

- 使用 `matchMedia` API 而不是直接监听 `resize` 事件
- 自动清理事件监听器，避免内存泄漏
- 只在断点变化时更新状态，减少不必要的重渲染

---

## 2. useDialogState - 对话框状态管理

### 功能说明

`useDialogState` 是一个通用的对话框状态管理 Hook，支持管理多个对话框的打开/关闭状态。特别适用于需要同时管理多个对话框的场景。

### 核心特性

- ✅ 支持多个对话框状态管理
- ✅ 切换式打开/关闭（点击相同按钮会关闭）
- ✅ 类型安全（支持字符串或布尔值）
- ✅ 简洁的 API 设计

### 实现细节

**文件位置**: `src/develop/(hooks)/use-dialog-state.tsx`

**类型定义**:
```typescript
function useDialogState<T extends string | boolean>(
  initialState: T | null = null
): [T | null, (str: T | null) => void]
```

**状态切换逻辑**:
```typescript
const setOpen = (str: T | null) => 
  _setOpen((prev) => (prev === str ? null : str))
```

如果传入的值与当前值相同，则关闭（设置为 `null`）；否则打开指定的对话框。

### 使用方法

#### 单个对话框（布尔值）

```typescript
import useDialogState from '@/develop/(hooks)/use-dialog-state'

function SingleDialog() {
  const [open, setOpen] = useDialogState<boolean>(false)
  
  return (
    <>
      <button onClick={() => setOpen(true)}>打开对话框</button>
      <Dialog open={open === true} onOpenChange={() => setOpen(null)}>
        <DialogContent>内容</DialogContent>
      </Dialog>
    </>
  )
}
```

#### 多个对话框（字符串）

```typescript
function MultipleDialogs() {
  const [open, setOpen] = useDialogState<'create' | 'edit' | 'delete'>(null)
  
  return (
    <>
      <button onClick={() => setOpen('create')}>创建</button>
      <button onClick={() => setOpen('edit')}>编辑</button>
      <button onClick={() => setOpen('delete')}>删除</button>
      
      <Dialog open={open === 'create'} onOpenChange={() => setOpen(null)}>
        <DialogContent>创建对话框</DialogContent>
      </Dialog>
      
      <Dialog open={open === 'edit'} onOpenChange={() => setOpen(null)}>
        <DialogContent>编辑对话框</DialogContent>
      </Dialog>
      
      <Dialog open={open === 'delete'} onOpenChange={() => setOpen(null)}>
        <DialogContent>删除对话框</DialogContent>
      </Dialog>
    </>
  )
}
```

### 使用场景

1. **单个对话框**: 使用布尔值类型
2. **多个对话框**: 使用字符串联合类型
3. **确认对话框**: 管理确认/取消状态
4. **表单对话框**: 管理创建/编辑状态

### 示例：用户管理对话框

```typescript
type DialogType = 'create' | 'edit' | 'delete' | 'invite'

function UserManagement() {
  const [dialog, setDialog] = useDialogState<DialogType>(null)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  
  return (
    <>
      <div>
        <button onClick={() => setDialog('create')}>创建用户</button>
        <button onClick={() => setDialog('invite')}>邀请用户</button>
      </div>
      
      {/* 创建对话框 */}
      <Dialog open={dialog === 'create'} onOpenChange={() => setDialog(null)}>
        <CreateUserDialog />
      </Dialog>
      
      {/* 邀请对话框 */}
      <Dialog open={dialog === 'invite'} onOpenChange={() => setDialog(null)}>
        <InviteUserDialog />
      </Dialog>
    </>
  )
}
```

### 优势

1. **简洁**: 一个 Hook 管理多个对话框状态
2. **类型安全**: TypeScript 类型检查确保正确使用
3. **切换式**: 点击相同按钮自动关闭，提升用户体验
4. **灵活**: 支持字符串和布尔值两种类型

---

## 3. useTableUrlState - 表格 URL 状态同步

### 功能说明

`useTableUrlState` 是一个强大的 Hook，用于将 TanStack Table 的状态与 URL 查询参数同步。这使得表格的过滤、分页、排序等状态可以通过 URL 分享和持久化。

### 核心特性

- ✅ URL 状态同步（可分享的链接）
- ✅ 分页状态管理
- ✅ 列过滤状态管理
- ✅ 全局搜索过滤
- ✅ 自定义序列化/反序列化
- ✅ 自动重置分页

### 实现细节

**文件位置**: `src/develop/(hooks)/use-table-url-state.ts`

**依赖**:
- `@tanstack/react-table` - 表格状态管理
- `@tanstack/react-router` - 路由和 URL 状态管理

**配置参数**:
```typescript
type UseTableUrlStateParams = {
  search: SearchRecord                    // 当前 URL 搜索参数
  navigate: NavigateFn                   // 路由导航函数
  pagination?: {                          // 分页配置
    pageKey?: string                     // 页码参数名（默认: 'page'）
    pageSizeKey?: string                 // 每页数量参数名（默认: 'pageSize'）
    defaultPage?: number                 // 默认页码（默认: 1）
    defaultPageSize?: number            // 默认每页数量（默认: 10）
  }
  globalFilter?: {                       // 全局搜索配置
    enabled?: boolean                   // 是否启用（默认: true）
    key?: string                        // 搜索参数名（默认: 'filter'）
    trim?: boolean                       // 是否去除空格（默认: true）
  }
  columnFilters?: Array<{                // 列过滤配置
    columnId: string                    // 列 ID
    searchKey: string                   // URL 参数名
    type?: 'string' | 'array'           // 过滤类型
    serialize?: (value: unknown) => unknown    // 自定义序列化
    deserialize?: (value: unknown) => unknown  // 自定义反序列化
  }>
}
```

**返回值**:
```typescript
type UseTableUrlStateReturn = {
  globalFilter?: string                  // 全局搜索值
  onGlobalFilterChange?: OnChangeFn<string>  // 全局搜索变化处理
  
  columnFilters: ColumnFiltersState      // 列过滤状态
  onColumnFiltersChange: OnChangeFn<ColumnFiltersState>  // 列过滤变化处理
  
  pagination: PaginationState            // 分页状态
  onPaginationChange: OnChangeFn<PaginationState>  // 分页变化处理
  
  ensurePageInRange: (pageCount: number, opts?: { resetTo?: 'first' | 'last' }) => void  // 确保页码在有效范围内
}
```

### 使用方法

#### 基本使用

```typescript
import { useTableUrlState } from '@/develop/(hooks)/use-table-url-state'
import { useSearch, useNavigate } from '@tanstack/react-router'

function UsersTable({ data }: { data: User[] }) {
  const search = useSearch({ from: '/users' })
  const navigate = useNavigate({ from: '/users' })
  
  const {
    columnFilters,
    onColumnFiltersChange,
    pagination,
    onPaginationChange,
    globalFilter,
    onGlobalFilterChange,
  } = useTableUrlState({
    search,
    navigate,
    pagination: {
      defaultPage: 1,
      defaultPageSize: 10,
    },
    globalFilter: {
      enabled: true,
      key: 'search',
    },
    columnFilters: [
      { columnId: 'username', searchKey: 'username', type: 'string' },
      { columnId: 'status', searchKey: 'status', type: 'array' },
      { columnId: 'role', searchKey: 'role', type: 'array' },
    ],
  })
  
  const table = useReactTable({
    data,
    columns,
    state: {
      columnFilters,
      pagination,
      globalFilter,
    },
    onColumnFiltersChange,
    onPaginationChange,
    onGlobalFilterChange,
    // ... 其他配置
  })
  
  return (
    <div>
      <DataTableToolbar table={table} />
      {/* 表格内容 */}
      <DataTablePagination table={table} />
    </div>
  )
}
```

#### 高级用法：自定义序列化

```typescript
const { columnFilters, onColumnFiltersChange } = useTableUrlState({
  search,
  navigate,
  columnFilters: [
    {
      columnId: 'date',
      searchKey: 'date',
      type: 'string',
      // 自定义序列化：将 Date 对象转换为 ISO 字符串
      serialize: (value) => {
        if (value instanceof Date) {
          return value.toISOString()
        }
        return value
      },
      // 自定义反序列化：将 ISO 字符串转换为 Date 对象
      deserialize: (value) => {
        if (typeof value === 'string') {
          return new Date(value)
        }
        return value
      },
    },
  ],
})
```

### 功能详解

#### 1. 分页状态同步

分页状态会自动同步到 URL：
- 页码参数：`?page=2`
- 每页数量参数：`?pageSize=20`
- 默认值不会出现在 URL 中（保持 URL 简洁）

#### 2. 列过滤状态同步

列过滤状态会同步到 URL：
- 字符串类型：`?username=john`
- 数组类型：`?status=active&status=pending`（多个值）

#### 3. 全局搜索同步

全局搜索会同步到 URL：
- 搜索参数：`?filter=keyword`
- 搜索时自动重置到第一页

#### 4. 自动重置分页

当过滤条件变化时，自动重置到第一页：
```typescript
// 当列过滤或全局搜索变化时，page 参数会被移除（重置到第一页）
```

#### 5. 页码范围验证

使用 `ensurePageInRange` 确保页码在有效范围内：
```typescript
useEffect(() => {
  ensurePageInRange(table.getPageCount(), { resetTo: 'first' })
}, [table, ensurePageInRange])
```

### 使用场景

1. **可分享的表格状态**: 用户可以通过 URL 分享当前的表格视图
2. **浏览器前进/后退**: 支持浏览器历史记录导航
3. **书签保存**: 用户可以收藏特定的表格视图
4. **状态持久化**: 刷新页面后保持表格状态

### 示例：完整的表格实现

```typescript
function UsersTable({ data }: { data: User[] }) {
  const search = useSearch({ from: '/users' })
  const navigate = useNavigate({ from: '/users' })
  
  const [rowSelection, setRowSelection] = useState({})
  const [sorting, setSorting] = useState<SortingState>([])
  
  const {
    columnFilters,
    onColumnFiltersChange,
    pagination,
    onPaginationChange,
    ensurePageInRange,
  } = useTableUrlState({
    search,
    navigate,
    pagination: { defaultPage: 1, defaultPageSize: 10 },
    globalFilter: { enabled: false },
    columnFilters: [
      { columnId: 'username', searchKey: 'username', type: 'string' },
      { columnId: 'status', searchKey: 'status', type: 'array' },
      { columnId: 'role', searchKey: 'role', type: 'array' },
    ],
  })
  
  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      pagination,
      rowSelection,
      columnFilters,
    },
    enableRowSelection: true,
    onPaginationChange,
    onColumnFiltersChange,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    getPaginationRowModel: getPaginationRowModel(),
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })
  
  useEffect(() => {
    ensurePageInRange(table.getPageCount())
  }, [table, ensurePageInRange])
  
  return (
    <div>
      <DataTableToolbar table={table} />
      <Table>
        {/* 表格内容 */}
      </Table>
      <DataTablePagination table={table} />
    </div>
  )
}
```

### 优势

1. **URL 同步**: 表格状态可以通过 URL 分享
2. **状态持久化**: 刷新页面后保持状态
3. **类型安全**: 完整的 TypeScript 类型支持
4. **灵活配置**: 支持自定义序列化/反序列化
5. **自动优化**: 自动重置分页，保持 URL 简洁

---

## Hooks 最佳实践

### 1. 错误处理

```typescript
// useIsMobile 需要处理初始 undefined 状态
const isMobile = useIsMobile()
if (isMobile === undefined) {
  return <Loading />
}
```

### 2. 性能优化

```typescript
// useTableUrlState 的配置应该稳定，避免不必要的重新创建
const tableConfig = useMemo(() => ({
  search,
  navigate,
  // ... 配置
}), [search, navigate])

const { ... } = useTableUrlState(tableConfig)
```

### 3. 类型安全

```typescript
// 使用明确的类型定义
const [dialog, setDialog] = useDialogState<'create' | 'edit' | 'delete'>(null)
```

---

## 总结

这三个 Hooks 提供了：

1. **useIsMobile**: 响应式移动端检测，支持条件渲染和布局切换
2. **useDialogState**: 灵活的对话框状态管理，支持单个或多个对话框
3. **useTableUrlState**: 强大的表格 URL 状态同步，支持可分享的表格视图

这些 Hooks 都是类型安全的，经过优化，可以直接在项目中使用，大大提升了开发效率和代码质量。

