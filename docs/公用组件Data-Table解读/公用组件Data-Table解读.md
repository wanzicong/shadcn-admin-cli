# 公用组件 Data-Table 解读

## 概述

本项目基于 **TanStack Table**（原 React Table）构建了一套完整的数据表格组件系统，提供了排序、过滤、分页、列显示控制等丰富的功能。所有组件都支持 URL 状态同步，可以实现可分享的表格视图。

## 组件列表

1. **DataTableToolbar** - 表格工具栏（搜索、过滤）
2. **DataTablePagination** - 表格分页组件
3. **DataTableColumnHeader** - 列标题（排序、隐藏）
4. **DataTableFacetedFilter** - 多选过滤组件
5. **DataTableViewOptions** - 列显示选项
6. **DataTableBulkActions** - 批量操作工具栏

---

## 1. DataTableToolbar - 表格工具栏

### 功能说明

`DataTableToolbar` 是表格的工具栏组件，提供全局搜索、列过滤和重置功能。

### 核心特性

- ✅ 全局搜索输入框
- ✅ 列过滤（多选）
- ✅ 重置所有过滤
- ✅ 响应式设计
- ✅ 支持自定义搜索键

### 实现细节

**文件位置**: `src/develop/(components)/data-table/toolbar.tsx`

**Props 类型**:
```typescript
type DataTableToolbarProps<TData> = {
  table: Table<TData>                    // TanStack Table 实例
  searchPlaceholder?: string            // 搜索框占位符
  searchKey?: string                     // 指定列的搜索键（可选）
  filters?: {                            // 过滤配置
    columnId: string                    // 列 ID
    title: string                       // 过滤标题
    options: {                           // 过滤选项
      label: string
      value: string
      icon?: React.ComponentType
    }[]
  }[]
}
```

**搜索模式**:
1. **列搜索**（指定 `searchKey`）: 搜索特定列
2. **全局搜索**（不指定 `searchKey`）: 搜索所有列

### 使用方法

```typescript
import { DataTableToolbar } from '@/develop/(components)/data-table'

const statusOptions = [
  { label: '活跃', value: 'active', icon: CheckIcon },
  { label: '待审核', value: 'pending', icon: ClockIcon },
  { label: '已禁用', value: 'disabled', icon: XIcon },
]

function UsersTable({ table }) {
  return (
    <div>
      <DataTableToolbar
        table={table}
        searchPlaceholder="搜索用户..."
        searchKey="username"  // 可选：指定搜索列
        filters={[
          {
            columnId: 'status',
            title: '状态',
            options: statusOptions,
          },
          {
            columnId: 'role',
            title: '角色',
            options: roleOptions,
          },
        ]}
      />
      {/* 表格内容 */}
    </div>
  )
}
```

---

## 2. DataTablePagination - 表格分页

### 功能说明

`DataTablePagination` 提供完整的分页功能，包括页码导航、每页数量选择和页面信息显示。

### 核心特性

- ✅ 页码导航（首页、上一页、下一页、末页）
- ✅ 页码按钮（显示当前页及前后页）
- ✅ 每页数量选择（10、20、30、40、50）
- ✅ 页面信息显示（当前页/总页数）
- ✅ 响应式设计（移动端优化）

### 实现细节

**文件位置**: `src/develop/(components)/data-table/pagination.tsx`

**分页功能**:
- 使用 `table.getState().pagination` 获取分页状态
- 使用 `table.setPageIndex()` 和 `table.setPageSize()` 更新分页
- 使用 `getPageNumbers()` 工具函数计算显示的页码

**响应式设计**:
- 移动端：简化显示，隐藏部分按钮
- 桌面端：完整的分页控件

### 使用方法

```typescript
import { DataTablePagination } from '@/develop/(components)/data-table'

function UsersTable({ table }) {
  return (
    <div>
      {/* 表格内容 */}
      <DataTablePagination table={table} />
    </div>
  )
}
```

### 自定义每页数量选项

修改组件源码中的选项数组：
```typescript
{[10, 20, 30, 40, 50].map((pageSize) => (
  <SelectItem key={pageSize} value={`${pageSize}`}>
    {pageSize}
  </SelectItem>
))}
```

---

## 3. DataTableColumnHeader - 列标题

### 功能说明

`DataTableColumnHeader` 提供列标题的排序和隐藏功能，支持升序、降序和隐藏列。

### 核心特性

- ✅ 列排序（升序/降序）
- ✅ 列隐藏功能
- ✅ 排序状态指示（图标）
- ✅ 下拉菜单操作

### 实现细节

**文件位置**: `src/develop/(components)/data-table/column-header.tsx`

**排序功能**:
- 使用 `column.toggleSorting(false)` 升序
- 使用 `column.toggleSorting(true)` 降序
- 使用 `column.getIsSorted()` 获取当前排序状态

**隐藏功能**:
- 使用 `column.toggleVisibility(false)` 隐藏列
- 使用 `column.getCanHide()` 检查是否可以隐藏

### 使用方法

```typescript
import { DataTableColumnHeader } from '@/develop/(components)/data-table'

const columns = [
  {
    accessorKey: 'username',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="用户名" />
    ),
  },
  {
    accessorKey: 'email',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="邮箱" />
    ),
  },
]
```

---

## 4. DataTableFacetedFilter - 多选过滤

### 功能说明

`DataTableFacetedFilter` 提供多选过滤功能，支持从下拉菜单中选择多个值进行过滤。

### 核心特性

- ✅ 多选过滤
- ✅ 选项计数显示
- ✅ 已选值徽章显示
- ✅ 搜索过滤选项
- ✅ 清除过滤功能

### 实现细节

**文件位置**: `src/develop/(components)/data-table/faceted-filter.tsx`

**过滤值类型**:
- 使用数组存储选中的值: `string[]`
- 使用 `Set` 数据结构管理选中状态

**选项计数**:
- 使用 `column.getFacetedUniqueValues()` 获取每个选项的数量
- 显示在选项右侧

### 使用方法

```typescript
import { DataTableFacetedFilter } from '@/develop/(components)/data-table'

function UsersTable({ table }) {
  const statusColumn = table.getColumn('status')
  
  return (
    <DataTableFacetedFilter
      column={statusColumn}
      title="状态"
      options={[
        { label: '活跃', value: 'active', icon: CheckIcon },
        { label: '待审核', value: 'pending', icon: ClockIcon },
        { label: '已禁用', value: 'disabled', icon: XIcon },
      ]}
    />
  )
}
```

---

## 5. DataTableViewOptions - 列显示选项

### 功能说明

`DataTableViewOptions` 提供列显示/隐藏的控制功能，用户可以自定义表格显示的列。

### 核心特性

- ✅ 列显示/隐藏切换
- ✅ 复选框控制
- ✅ 下拉菜单界面
- ✅ 自动过滤可隐藏的列

### 实现细节

**文件位置**: `src/develop/(components)/data-table/view-options.tsx`

**列过滤**:
```typescript
table
  .getAllColumns()
  .filter((column) => 
    typeof column.accessorFn !== 'undefined' && 
    column.getCanHide()
  )
```

只显示可以隐藏的列（排除操作列等）。

### 使用方法

```typescript
import { DataTableViewOptions } from '@/develop/(components)/data-table'

function UsersTable({ table }) {
  return (
    <DataTableToolbar table={table}>
      {/* 其他工具栏内容 */}
      <DataTableViewOptions table={table} />
    </DataTableToolbar>
  )
}
```

---

## 6. DataTableBulkActions - 批量操作工具栏

### 功能说明

`DataTableBulkActions` 提供批量操作工具栏，当选中多行时显示浮动工具栏。

### 核心特性

- ✅ 选中行数量显示
- ✅ 浮动工具栏（固定在底部）
- ✅ 键盘导航支持（方向键、Home、End、Escape）
- ✅ 无障碍支持（ARIA 标签、屏幕阅读器）
- ✅ 清除选择功能

### 实现细节

**文件位置**: `src/develop/(components)/data-table/bulk-actions.tsx`

**选中行获取**:
```typescript
const selectedRows = table.getFilteredSelectedRowModel().rows
const selectedCount = selectedRows.length
```

**键盘导航**:
- `ArrowRight`: 下一个按钮
- `ArrowLeft`: 上一个按钮
- `Home`: 第一个按钮
- `End`: 最后一个按钮
- `Escape`: 清除选择（除非在下拉菜单中）

**无障碍支持**:
- `role="toolbar"`: 工具栏角色
- `aria-label`: 工具栏标签
- `aria-live`: 屏幕阅读器公告

### 使用方法

```typescript
import { DataTableBulkActions } from '@/develop/(components)/data-table'

function UsersTable({ table }) {
  return (
    <>
      {/* 表格内容 */}
      <DataTableBulkActions table={table} entityName="用户">
        <Button onClick={handleDelete}>删除</Button>
        <Button onClick={handleExport}>导出</Button>
        <Button onClick={handleBulkEdit}>批量编辑</Button>
      </DataTableBulkActions>
    </>
  )
}
```

---

## 完整表格实现示例

### 基础表格

```typescript
import { useReactTable, getCoreRowModel } from '@tanstack/react-table'
import { DataTableToolbar, DataTablePagination } from '@/develop/(components)/data-table'

function UsersTable({ data }) {
  const [sorting, setSorting] = useState([])
  const [columnFilters, setColumnFilters] = useState([])
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 })
  
  const table = useReactTable({
    data,
    columns,
    state: { sorting, columnFilters, pagination },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  })
  
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

### 带 URL 同步的表格

```typescript
import { useTableUrlState } from '@/develop/(hooks)/use-table-url-state'

function UsersTable({ data, search, navigate }) {
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
    globalFilter: { enabled: true, key: 'search' },
    columnFilters: [
      { columnId: 'status', searchKey: 'status', type: 'array' },
      { columnId: 'role', searchKey: 'role', type: 'array' },
    ],
  })
  
  const table = useReactTable({
    data,
    columns,
    state: { columnFilters, pagination },
    onColumnFiltersChange,
    onPaginationChange,
    // ... 其他配置
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
      <DataTableBulkActions table={table} entityName="用户">
        <Button onClick={handleDelete}>删除选中</Button>
      </DataTableBulkActions>
    </div>
  )
}
```

---

## 列定义示例

### 基础列定义

```typescript
const columns = [
  {
    accessorKey: 'id',
    header: 'ID',
  },
  {
    accessorKey: 'username',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="用户名" />
    ),
  },
  {
    accessorKey: 'email',
    header: '邮箱',
  },
  {
    accessorKey: 'status',
    header: '状态',
    cell: ({ row }) => {
      const status = row.getValue('status')
      return <Badge>{status}</Badge>
    },
  },
]
```

### 带过滤的列定义

```typescript
const columns = [
  {
    accessorKey: 'status',
    header: '状态',
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
  },
]
```

---

## 最佳实践

### 1. URL 状态同步

使用 `useTableUrlState` Hook 实现 URL 同步，提供可分享的表格视图：

```typescript
const { columnFilters, pagination, ... } = useTableUrlState({
  search,
  navigate,
  // 配置
})
```

### 2. 性能优化

- 使用 `getFilteredRowModel()` 进行客户端过滤
- 使用 `getPaginationRowModel()` 进行分页
- 大数据量时考虑服务端分页和过滤

### 3. 响应式设计

- 使用响应式工具类（TailwindCSS）
- 移动端隐藏部分列
- 使用 `columnVisibility` 控制列显示

### 4. 无障碍支持

- 使用语义化 HTML
- 添加 ARIA 标签
- 支持键盘导航

---

## 总结

Data-Table 组件系统提供了：

- ✅ **DataTableToolbar**: 完整的工具栏（搜索、过滤）
- ✅ **DataTablePagination**: 强大的分页功能
- ✅ **DataTableColumnHeader**: 列排序和隐藏
- ✅ **DataTableFacetedFilter**: 多选过滤
- ✅ **DataTableViewOptions**: 列显示控制
- ✅ **DataTableBulkActions**: 批量操作工具栏

所有组件都基于 TanStack Table，提供了类型安全、高性能的数据表格解决方案。结合 URL 状态同步，可以实现可分享、可书签的表格视图，大大提升了用户体验。

