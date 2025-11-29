# Data-Table 组件项目使用案例

## 概述

本文档提供了 Data-Table 组件在实际项目中的详细使用案例，包含完整的代码示例和详细注释。所有案例都基于项目中的实际实现。

## 案例列表

1. **用户管理表格** - 列搜索 + URL 状态同步
2. **任务管理表格** - 全局搜索 + URL 状态同步

---

## 案例 1：用户管理表格（Users Table）

### 功能说明

用户管理表格展示了如何使用 Data-Table 组件实现一个完整的用户列表管理功能，包括：
- 列搜索（按用户名搜索）
- 多选过滤（状态、角色）
- URL 状态同步（可分享的表格视图）
- 批量操作（邀请、激活、停用、删除）
- 列排序和隐藏

### 文件位置

- **表格组件**: `src/develop/(views)/official/users/components/users-table.tsx`
- **列定义**: `src/develop/(views)/official/users/components/users-columns.tsx`
- **批量操作**: `src/develop/(views)/official/users/components/data-table-bulk-actions.tsx`
- **页面入口**: `src/develop/(views)/official/users/index.tsx`

### 完整代码示例

#### 1. 页面入口组件

```typescript
import { getRouteApi } from '@tanstack/react-router'
import { Header } from '@/develop/(layout)/header.tsx'
import { Main } from '@/develop/(layout)/main.tsx'
import { UsersTable } from './components/users-table.tsx'
import { users } from './data/users.ts'

// 获取路由 API，用于访问路由的 search 和 navigate 方法
const route = getRouteApi('/_authenticated/official/users/')

export function Users() {
     // 从路由中获取当前的搜索参数（URL 查询参数）
     const search = route.useSearch()
     // 获取路由导航函数，用于更新 URL
     const navigate = route.useNavigate()

     return (
          <UsersProvider>
               {/* 页面头部 */}
               <Header fixed>
                    {/* 搜索、主题切换等组件 */}
               </Header>

               {/* 主内容区 */}
               <Main className='flex flex-1 flex-col gap-4 sm:gap-6'>
                    {/* 页面标题和操作按钮 */}
                    <div className='flex flex-wrap items-end justify-between gap-2'>
                         <div>
                              <h2 className='text-2xl font-bold tracking-tight'>User List</h2>
                              <p className='text-muted-foreground'>Manage your users and their roles here.</p>
                         </div>
                         <UsersPrimaryButtons />
                    </div>
                    
                    {/* 数据表格组件：传入数据、搜索参数和导航函数 */}
                    <UsersTable data={users} search={search} navigate={navigate} />
               </Main>
          </UsersProvider>
     )
}
```

#### 2. 表格组件实现

```typescript
import { useEffect, useState } from 'react'
import {
     type SortingState,
     type VisibilityState,
     flexRender,
     getCoreRowModel,
     getFacetedRowModel,
     getFacetedUniqueValues,
     getFilteredRowModel,
     getPaginationRowModel,
     getSortedRowModel,
     useReactTable,
} from '@tanstack/react-table'
import { DataTablePagination, DataTableToolbar } from '@/develop/(components)/data-table'
import { type NavigateFn, useTableUrlState } from '@/develop/(hooks)/use-table-url-state.ts'
import { cn } from '@/develop/(lib)/utils.ts'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table.tsx'
import { roles } from '../data/data.ts'
import { type User } from '../data/schema.ts'
import { DataTableBulkActions } from './data-table-bulk-actions.tsx'
import { usersColumns as columns } from './users-columns.tsx'

/**
 * 表格组件的 Props 类型定义
 */
type DataTableProps = {
     data: User[]                    // 表格数据数组
     search: Record<string, unknown> // 当前 URL 搜索参数
     navigate: NavigateFn            // 路由导航函数
}

/**
 * 用户管理表格组件
 * 
 * 实现功能：
 * - 列搜索（按用户名）
 * - 多选过滤（状态、角色）
 * - URL 状态同步
 * - 批量操作
 * - 列排序和隐藏
 */
export function UsersTable({ data, search, navigate }: DataTableProps) {
     // ========== 本地 UI 状态（不同步到 URL）==========
     
     // 行选择状态：记录哪些行被选中（用于批量操作）
     const [rowSelection, setRowSelection] = useState({})
     
     // 列可见性状态：控制哪些列显示/隐藏
     const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
     
     // 排序状态：当前列的排序方式（升序/降序）
     const [sorting, setSorting] = useState<SortingState>([])

     // ========== URL 同步状态（使用 useTableUrlState Hook）==========
     
     // 注意：如果需要纯本地状态（不同步到 URL），可以取消注释下面的代码
     // const [columnFilters, onColumnFiltersChange] = useState<ColumnFiltersState>([])
     // const [pagination, onPaginationChange] = useState<PaginationState>({ pageIndex: 0, pageSize: 10 })

     /**
      * 使用 useTableUrlState Hook 将表格状态同步到 URL
      * 
      * 配置说明：
      * - pagination: 分页配置（默认第 1 页，每页 10 条）
      * - globalFilter: 禁用全局搜索（使用列搜索）
      * - columnFilters: 配置需要同步到 URL 的列过滤
      *   - username: 字符串类型过滤（用于列搜索）
      *   - status: 数组类型过滤（多选）
      *   - role: 数组类型过滤（多选）
      */
     const { 
          columnFilters,           // 列过滤状态
          onColumnFiltersChange,   // 列过滤变化处理函数
          pagination,              // 分页状态
          onPaginationChange,      // 分页变化处理函数
          ensurePageInRange        // 确保页码在有效范围内的函数
     } = useTableUrlState({
          search,                 // 当前 URL 搜索参数
          navigate,               // 路由导航函数
          pagination: { 
               defaultPage: 1,    // 默认页码
               defaultPageSize: 10 // 默认每页数量
          },
          globalFilter: { 
               enabled: false     // 禁用全局搜索（使用列搜索）
          },
          columnFilters: [
               // 用户名列过滤：字符串类型，同步到 URL 的 'username' 参数
               { columnId: 'username', searchKey: 'username', type: 'string' },
               // 状态列过滤：数组类型，同步到 URL 的 'status' 参数（支持多个值）
               { columnId: 'status', searchKey: 'status', type: 'array' },
               // 角色列过滤：数组类型，同步到 URL 的 'role' 参数（支持多个值）
               { columnId: 'role', searchKey: 'role', type: 'array' },
          ],
     })

     /**
      * 创建 TanStack Table 实例
      * 
      * 配置说明：
      * - data: 表格数据
      * - columns: 列定义
      * - state: 表格状态（排序、分页、行选择、列过滤、列可见性）
      * - enableRowSelection: 启用行选择功能
      * - onXxxChange: 各种状态变化的处理函数
      * - getXxxRowModel: 各种行模型（分页、过滤、排序、Faceted 等）
      */
     const table = useReactTable({
          data,                    // 表格数据
          columns,                 // 列定义
          state: {
               sorting,            // 排序状态
               pagination,         // 分页状态
               rowSelection,       // 行选择状态
               columnFilters,      // 列过滤状态
               columnVisibility,   // 列可见性状态
          },
          enableRowSelection: true, // 启用行选择
          onPaginationChange,      // 分页变化处理
          onColumnFiltersChange,   // 列过滤变化处理
          onRowSelectionChange: setRowSelection,    // 行选择变化处理
          onSortingChange: setSorting,              // 排序变化处理
          onColumnVisibilityChange: setColumnVisibility, // 列可见性变化处理
          getPaginationRowModel: getPaginationRowModel(),     // 分页行模型
          getCoreRowModel: getCoreRowModel(),                // 核心行模型
          getFilteredRowModel: getFilteredRowModel(),         // 过滤行模型
          getSortedRowModel: getSortedRowModel(),             // 排序行模型
          getFacetedRowModel: getFacetedRowModel(),           // Faceted 行模型（用于过滤计数）
          getFacetedUniqueValues: getFacetedUniqueValues(),   // Faceted 唯一值（用于显示过滤选项计数）
     })

     /**
      * 确保页码在有效范围内
      * 当数据变化导致总页数减少时，自动调整当前页码
      */
     useEffect(() => {
          ensurePageInRange(table.getPageCount())
     }, [table, ensurePageInRange])

     return (
          <div
               className={cn(
                    // 移动端：当批量操作工具栏显示时，添加底部边距
                    'max-sm:has-[div[role="toolbar"]]:mb-16',
                    'flex flex-1 flex-col gap-4'
               )}
          >
               {/* ========== 表格工具栏 ========== */}
               <DataTableToolbar
                    table={table}
                    searchPlaceholder='Filter users...'  // 搜索框占位符
                    searchKey='username'                 // 指定搜索列（列搜索模式）
                    filters={[
                         // 状态过滤器配置
                         {
                              columnId: 'status',        // 列 ID
                              title: 'Status',           // 过滤器标题
                              options: [                 // 过滤选项
                                   { label: 'Active', value: 'active' },
                                   { label: 'Inactive', value: 'inactive' },
                                   { label: 'Invited', value: 'invited' },
                                   { label: 'Suspended', value: 'suspended' },
                              ],
                         },
                         // 角色过滤器配置
                         {
                              columnId: 'role',
                              title: 'Role',
                              options: roles.map((role) => ({ ...role })), // 从数据中获取角色选项
                         },
                    ]}
               />
               
               {/* ========== 表格主体 ========== */}
               <div className='overflow-hidden rounded-md border'>
                    <Table>
                         {/* 表头 */}
                         <TableHeader>
                              {table.getHeaderGroups().map((headerGroup) => (
                                   <TableRow key={headerGroup.id} className='group/row'>
                                        {headerGroup.headers.map((header) => {
                                             return (
                                                  <TableHead
                                                       key={header.id}
                                                       colSpan={header.colSpan}
                                                       className={cn(
                                                            'bg-background group-hover/row:bg-muted group-data-[state=selected]/row:bg-muted',
                                                            header.column.columnDef.meta?.className,
                                                            header.column.columnDef.meta?.thClassName
                                                       )}
                                                  >
                                                       {/* 渲染列标题（支持排序、隐藏等功能） */}
                                                       {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                                                  </TableHead>
                                             )
                                        })}
                                   </TableRow>
                              ))}
                         </TableHeader>
                         
                         {/* 表体 */}
                         <TableBody>
                              {table.getRowModel().rows?.length ? (
                                   // 有数据：渲染数据行
                                   table.getRowModel().rows.map((row) => (
                                        <TableRow 
                                             key={row.id} 
                                             data-state={row.getIsSelected() && 'selected'} 
                                             className='group/row'
                                        >
                                             {row.getVisibleCells().map((cell) => (
                                                  <TableCell
                                                       key={cell.id}
                                                       className={cn(
                                                            'bg-background group-hover/row:bg-muted group-data-[state=selected]/row:bg-muted',
                                                            cell.column.columnDef.meta?.className,
                                                            cell.column.columnDef.meta?.tdClassName
                                                       )}
                                                  >
                                                       {/* 渲染单元格内容 */}
                                                       {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                                  </TableCell>
                                             ))}
                                        </TableRow>
                                   ))
                              ) : (
                                   // 无数据：显示空状态
                                   <TableRow>
                                        <TableCell colSpan={columns.length} className='h-24 text-center'>
                                             No results.
                                        </TableCell>
                                   </TableRow>
                              )}
                         </TableBody>
                    </Table>
               </div>
               
               {/* ========== 分页组件 ========== */}
               <DataTablePagination table={table} className='mt-auto' />
               
               {/* ========== 批量操作工具栏 ========== */}
               <DataTableBulkActions table={table} />
          </div>
     )
}
```

#### 3. 列定义

```typescript
import { type ColumnDef } from '@tanstack/react-table'
import { DataTableColumnHeader } from '@/develop/(components)/data-table'
import { cn } from '@/develop/(lib)/utils.ts'
import { Badge } from '@/components/ui/badge.tsx'
import { Checkbox } from '@/components/ui/checkbox.tsx'
import { LongText } from '@/components/long-text.tsx'
import { callTypes, roles } from '../data/data.ts'
import { type User } from '../data/schema.ts'
import { DataTableRowActions } from './data-table-row-actions.tsx'

/**
 * 用户表格列定义
 * 
 * 包含以下列：
 * - select: 选择列（复选框）
 * - username: 用户名（可排序，不可隐藏）
 * - fullName: 全名（可排序）
 * - email: 邮箱（可排序）
 * - phoneNumber: 电话号码（不可排序）
 * - status: 状态（可过滤，不可排序和隐藏）
 * - role: 角色（可过滤，不可排序和隐藏）
 * - actions: 操作列（行操作按钮）
 */
export const usersColumns: ColumnDef<User>[] = [
     // ========== 选择列 ==========
     {
          id: 'select',
          header: ({ table }) => (
               // 全选复选框
               <Checkbox
                    checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && 'indeterminate')}
                    onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                    aria-label='Select all'
                    className='translate-y-[2px]'
               />
          ),
          meta: {
               // 移动端：固定在左侧
               className: cn('max-md:sticky start-0 z-10 rounded-tl-[inherit]'),
          },
          cell: ({ row }) => (
               // 行选择复选框
               <Checkbox
                    checked={row.getIsSelected()}
                    onCheckedChange={(value) => row.toggleSelected(!!value)}
                    aria-label='Select row'
                    className='translate-y-[2px]'
               />
          ),
          enableSorting: false,   // 不可排序
          enableHiding: false,    // 不可隐藏
     },
     
     // ========== 用户名列 ==========
     {
          accessorKey: 'username',  // 数据字段名
          header: ({ column }) => (
               // 使用 DataTableColumnHeader 组件，支持排序和隐藏
               <DataTableColumnHeader column={column} title='Username' />
          ),
          cell: ({ row }) => (
               // 使用 LongText 组件处理长文本
               <LongText className='max-w-36 ps-3'>{row.getValue('username')}</LongText>
          ),
          meta: {
               // 移动端：固定在左侧，大屏幕时取消固定
               className: cn(
                    'drop-shadow-[0_1px_2px_rgb(0_0_0_/_0.1)] dark:drop-shadow-[0_1px_2px_rgb(255_255_255_/_0.1)]',
                    'ps-0.5 max-md:sticky start-6 @4xl/content:table-cell @4xl/content:drop-shadow-none'
               ),
          },
          enableHiding: false,  // 不可隐藏（重要列）
     },
     
     // ========== 全名列 ==========
     {
          id: 'fullName',
          header: ({ column }) => <DataTableColumnHeader column={column} title='Name' />,
          cell: ({ row }) => {
               // 组合 firstName 和 lastName
               const { firstName, lastName } = row.original
               const fullName = `${firstName} ${lastName}`
               return <LongText className='max-w-36'>{fullName}</LongText>
          },
          meta: { className: 'w-36' },
     },
     
     // ========== 邮箱列 ==========
     {
          accessorKey: 'email',
          header: ({ column }) => <DataTableColumnHeader column={column} title='Email' />,
          cell: ({ row }) => (
               <div className='w-fit ps-2 text-nowrap'>{row.getValue('email')}</div>
          ),
     },
     
     // ========== 电话号码列 ==========
     {
          accessorKey: 'phoneNumber',
          header: ({ column }) => <DataTableColumnHeader column={column} title='Phone Number' />,
          cell: ({ row }) => <div>{row.getValue('phoneNumber')}</div>,
          enableSorting: false,  // 不可排序
     },
     
     // ========== 状态列 ==========
     {
          accessorKey: 'status',
          header: ({ column }) => <DataTableColumnHeader column={column} title='Status' />,
          cell: ({ row }) => {
               const { status } = row.original
               // 根据状态获取对应的徽章颜色
               const badgeColor = callTypes.get(status)
               return (
                    <div className='flex space-x-2'>
                         <Badge variant='outline' className={cn('capitalize', badgeColor)}>
                              {row.getValue('status')}
                         </Badge>
                    </div>
               )
          },
          // 自定义过滤函数：检查值是否在过滤数组中
          filterFn: (row, id, value) => {
               return value.includes(row.getValue(id))
          },
          enableHiding: false,   // 不可隐藏（重要列）
          enableSorting: false,   // 不可排序
     },
     
     // ========== 角色列 ==========
     {
          accessorKey: 'role',
          header: ({ column }) => <DataTableColumnHeader column={column} title='Role' />,
          cell: ({ row }) => {
               const { role } = row.original
               // 查找角色配置（包含图标）
               const userType = roles.find(({ value }) => value === role)

               if (!userType) {
                    return null
               }

               return (
                    <div className='flex items-center gap-x-2'>
                         {/* 显示角色图标 */}
                         {userType.icon && <userType.icon size={16} className='text-muted-foreground' />}
                         <span className='text-sm capitalize'>{row.getValue('role')}</span>
                    </div>
               )
          },
          // 自定义过滤函数：检查值是否在过滤数组中
          filterFn: (row, id, value) => {
               return value.includes(row.getValue(id))
          },
          enableSorting: false,   // 不可排序
          enableHiding: false,    // 不可隐藏（重要列）
     },
     
     // ========== 操作列 ==========
     {
          id: 'actions',
          cell: DataTableRowActions,  // 使用自定义行操作组件
     },
]
```

#### 4. 批量操作组件

```typescript
import { useState } from 'react'
import { type Table } from '@tanstack/react-table'
import { DataTableBulkActions as BulkActionsToolbar } from '@/develop/(components)/data-table'
import { sleep } from '@/develop/(lib)/utils.ts'
import { Trash2, UserX, UserCheck, Mail } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button.tsx'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip.tsx'
import { type User } from '../data/schema.ts'
import { UsersMultiDeleteDialog } from './users-multi-delete-dialog.tsx'

type DataTableBulkActionsProps<TData> = {
     table: Table<TData>
}

/**
 * 用户表格批量操作组件
 * 
 * 提供以下批量操作：
 * - 邀请用户
 * - 激活用户
 * - 停用用户
 * - 删除用户
 */
export function DataTableBulkActions<TData>({ table }: DataTableBulkActionsProps<TData>) {
     // 删除确认对话框显示状态
     const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
     
     // 获取当前选中的行（只包含过滤后的选中行）
     const selectedRows = table.getFilteredSelectedRowModel().rows

     /**
      * 批量更改用户状态
      * @param status 状态值：'active' 或 'inactive'
      */
     const handleBulkStatusChange = (status: 'active' | 'inactive') => {
          // 获取选中的用户数据
          const selectedUsers = selectedRows.map((row) => row.original as User)
          
          // 显示加载提示，并在操作完成后显示成功/失败提示
          toast.promise(sleep(2000), {
               loading: `${status === 'active' ? 'Activating' : 'Deactivating'} users...`,
               success: () => {
                    // 操作成功后清除选择
                    table.resetRowSelection()
                    return `${status === 'active' ? 'Activated' : 'Deactivated'} ${selectedUsers.length} user${selectedUsers.length > 1 ? 's' : ''}`
               },
               error: `Error ${status === 'active' ? 'activating' : 'deactivating'} users`,
          })
          table.resetRowSelection()
     }

     /**
      * 批量邀请用户
      */
     const handleBulkInvite = () => {
          const selectedUsers = selectedRows.map((row) => row.original as User)
          toast.promise(sleep(2000), {
               loading: 'Inviting users...',
               success: () => {
                    table.resetRowSelection()
                    return `Invited ${selectedUsers.length} user${selectedUsers.length > 1 ? 's' : ''}`
               },
               error: 'Error inviting users',
          })
          table.resetRowSelection()
     }

     return (
          <>
               {/* 批量操作工具栏：当有选中行时显示 */}
               <BulkActionsToolbar table={table} entityName='user'>
                    {/* 邀请按钮 */}
                    <Tooltip>
                         <TooltipTrigger asChild>
                              <Button
                                   variant='outline'
                                   size='icon'
                                   onClick={handleBulkInvite}
                                   className='size-8'
                                   aria-label='Invite selected users'
                                   title='Invite selected users'
                              >
                                   <Mail />
                                   <span className='sr-only'>Invite selected users</span>
                              </Button>
                         </TooltipTrigger>
                         <TooltipContent>
                              <p>Invite selected users</p>
                         </TooltipContent>
                    </Tooltip>

                    {/* 激活按钮 */}
                    <Tooltip>
                         <TooltipTrigger asChild>
                              <Button
                                   variant='outline'
                                   size='icon'
                                   onClick={() => handleBulkStatusChange('active')}
                                   className='size-8'
                                   aria-label='Activate selected users'
                                   title='Activate selected users'
                              >
                                   <UserCheck />
                                   <span className='sr-only'>Activate selected users</span>
                              </Button>
                         </TooltipTrigger>
                         <TooltipContent>
                              <p>Activate selected users</p>
                         </TooltipContent>
                    </Tooltip>

                    {/* 停用按钮 */}
                    <Tooltip>
                         <TooltipTrigger asChild>
                              <Button
                                   variant='outline'
                                   size='icon'
                                   onClick={() => handleBulkStatusChange('inactive')}
                                   className='size-8'
                                   aria-label='Deactivate selected users'
                                   title='Deactivate selected users'
                              >
                                   <UserX />
                                   <span className='sr-only'>Deactivate selected users</span>
                              </Button>
                         </TooltipTrigger>
                         <TooltipContent>
                              <p>Deactivate selected users</p>
                         </TooltipContent>
                    </Tooltip>

                    {/* 删除按钮 */}
                    <Tooltip>
                         <TooltipTrigger asChild>
                              <Button
                                   variant='destructive'
                                   size='icon'
                                   onClick={() => setShowDeleteConfirm(true)}
                                   className='size-8'
                                   aria-label='Delete selected users'
                                   title='Delete selected users'
                              >
                                   <Trash2 />
                                   <span className='sr-only'>Delete selected users</span>
                              </Button>
                         </TooltipTrigger>
                         <TooltipContent>
                              <p>Delete selected users</p>
                         </TooltipContent>
                    </Tooltip>
               </BulkActionsToolbar>

               {/* 批量删除确认对话框 */}
               <UsersMultiDeleteDialog table={table} open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm} />
          </>
     )
}
```

---

## 案例 2：任务管理表格（Tasks Table）

### 功能说明

任务管理表格展示了如何使用 Data-Table 组件实现一个完整的任务列表管理功能，包括：
- 全局搜索（按标题或 ID 搜索）
- 多选过滤（状态、优先级）
- URL 状态同步（可分享的表格视图）
- 批量操作（更新状态、更新优先级、导出、删除）
- 列排序和隐藏

### 文件位置

- **表格组件**: `src/develop/(views)/official/tasks/components/tasks-table.tsx`
- **列定义**: `src/develop/(views)/official/tasks/components/tasks-columns.tsx`
- **批量操作**: `src/develop/(views)/official/tasks/components/data-table-bulk-actions.tsx`

### 完整代码示例

#### 1. 表格组件实现

```typescript
import { useEffect, useState } from 'react'
import { getRouteApi } from '@tanstack/react-router'
import {
     type SortingState,
     type VisibilityState,
     flexRender,
     getCoreRowModel,
     getFacetedRowModel,
     getFacetedUniqueValues,
     getFilteredRowModel,
     getPaginationRowModel,
     getSortedRowModel,
     useReactTable,
} from '@tanstack/react-table'
import { DataTablePagination, DataTableToolbar } from '@/develop/(components)/data-table'
import { useTableUrlState } from '@/develop/(hooks)/use-table-url-state.ts'
import { cn } from '@/develop/(lib)/utils.ts'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table.tsx'
import { priorities, statuses } from '../data/data.tsx'
import { type Task } from '../data/schema.ts'
import { DataTableBulkActions } from './data-table-bulk-actions.tsx'
import { tasksColumns as columns } from './tasks-columns.tsx'

// 获取路由 API
const route = getRouteApi('/_authenticated/official/tasks/')

type DataTableProps = {
     data: Task[]
}

/**
 * 任务管理表格组件
 * 
 * 实现功能：
 * - 全局搜索（按标题或 ID）
 * - 多选过滤（状态、优先级）
 * - URL 状态同步
 * - 批量操作
 * - 列排序和隐藏
 */
export function TasksTable({ data }: DataTableProps) {
     // ========== 本地 UI 状态（不同步到 URL）==========
     
     const [rowSelection, setRowSelection] = useState({})
     const [sorting, setSorting] = useState<SortingState>([])
     const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})

     // ========== URL 同步状态 ==========
     
     // 注意：如果需要纯本地状态，可以取消注释下面的代码
     // const [globalFilter, onGlobalFilterChange] = useState('')
     // const [columnFilters, onColumnFiltersChange] = useState<ColumnFiltersState>([])
     // const [pagination, onPaginationChange] = useState<PaginationState>({ pageIndex: 0, pageSize: 10 })

     /**
      * 使用 useTableUrlState Hook 将表格状态同步到 URL
      * 
      * 与用户表格的区别：
      * - 启用全局搜索（globalFilter: { enabled: true }）
      * - 全局搜索的 URL 参数名为 'filter'
      */
     const { 
          globalFilter,            // 全局搜索值
          onGlobalFilterChange,    // 全局搜索变化处理函数
          columnFilters,           // 列过滤状态
          onColumnFiltersChange,   // 列过滤变化处理函数
          pagination,              // 分页状态
          onPaginationChange,      // 分页变化处理函数
          ensurePageInRange        // 确保页码在有效范围内的函数
     } = useTableUrlState({
          search: route.useSearch(),      // 从路由获取搜索参数
          navigate: route.useNavigate(),  // 从路由获取导航函数
          pagination: { 
               defaultPage: 1, 
               defaultPageSize: 10 
          },
          globalFilter: { 
               enabled: true,      // 启用全局搜索
               key: 'filter'      // URL 参数名为 'filter'
          },
          columnFilters: [
               // 状态列过滤：数组类型
               { columnId: 'status', searchKey: 'status', type: 'array' },
               // 优先级列过滤：数组类型
               { columnId: 'priority', searchKey: 'priority', type: 'array' },
          ],
     })

     /**
      * 创建 TanStack Table 实例
      */
     const table = useReactTable({
          data,
          columns,
          state: {
               sorting,
               columnVisibility,
               rowSelection,
               columnFilters,
               globalFilter,        // 全局搜索状态
               pagination,
          },
          enableRowSelection: true,
          onRowSelectionChange: setRowSelection,
          onSortingChange: setSorting,
          onColumnVisibilityChange: setColumnVisibility,
          
          /**
           * 自定义全局搜索函数
           * 搜索 ID 和标题字段
           */
          globalFilterFn: (row, _columnId, filterValue) => {
               // 获取 ID 和标题的值，转换为小写
               const id = String(row.getValue('id')).toLowerCase()
               const title = String(row.getValue('title')).toLowerCase()
               const searchValue = String(filterValue).toLowerCase()

               // 检查 ID 或标题是否包含搜索值
               return id.includes(searchValue) || title.includes(searchValue)
          },
          
          getCoreRowModel: getCoreRowModel(),
          getFilteredRowModel: getFilteredRowModel(),
          getPaginationRowModel: getPaginationRowModel(),
          getSortedRowModel: getSortedRowModel(),
          getFacetedRowModel: getFacetedRowModel(),
          getFacetedUniqueValues: getFacetedUniqueValues(),
          onPaginationChange,
          onGlobalFilterChange,    // 全局搜索变化处理
          onColumnFiltersChange,
     })

     const pageCount = table.getPageCount()
     
     /**
      * 确保页码在有效范围内
      */
     useEffect(() => {
          ensurePageInRange(pageCount)
     }, [pageCount, ensurePageInRange])

     return (
          <div
               className={cn(
                    'max-sm:has-[div[role="toolbar"]]:mb-16',
                    'flex flex-1 flex-col gap-4'
               )}
          >
               {/* ========== 表格工具栏 ========== */}
               <DataTableToolbar
                    table={table}
                    searchPlaceholder='Filter by title or ID...'  // 搜索框占位符
                    // 注意：不指定 searchKey，使用全局搜索模式
                    filters={[
                         // 状态过滤器
                         {
                              columnId: 'status',
                              title: 'Status',
                              options: statuses,  // 从数据中获取状态选项
                         },
                         // 优先级过滤器
                         {
                              columnId: 'priority',
                              title: 'Priority',
                              options: priorities,  // 从数据中获取优先级选项
                         },
                    ]}
               />
               
               {/* ========== 表格主体 ========== */}
               <div className='overflow-hidden rounded-md border'>
                    <Table>
                         <TableHeader>
                              {table.getHeaderGroups().map((headerGroup) => (
                                   <TableRow key={headerGroup.id}>
                                        {headerGroup.headers.map((header) => {
                                             return (
                                                  <TableHead
                                                       key={header.id}
                                                       colSpan={header.colSpan}
                                                       className={cn(header.column.columnDef.meta?.className, header.column.columnDef.meta?.thClassName)}
                                                  >
                                                       {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                                                  </TableHead>
                                             )
                                        })}
                                   </TableRow>
                              ))}
                         </TableHeader>
                         <TableBody>
                              {table.getRowModel().rows?.length ? (
                                   table.getRowModel().rows.map((row) => (
                                        <TableRow key={row.id} data-state={row.getIsSelected() && 'selected'}>
                                             {row.getVisibleCells().map((cell) => (
                                                  <TableCell
                                                       key={cell.id}
                                                       className={cn(cell.column.columnDef.meta?.className, cell.column.columnDef.meta?.tdClassName)}
                                                  >
                                                       {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                                  </TableCell>
                                             ))}
                                        </TableRow>
                                   ))
                              ) : (
                                   <TableRow>
                                        <TableCell colSpan={columns.length} className='h-24 text-center'>
                                             No results.
                                        </TableCell>
                                   </TableRow>
                              )}
                         </TableBody>
                    </Table>
               </div>
               
               {/* ========== 分页组件 ========== */}
               <DataTablePagination table={table} className='mt-auto' />
               
               {/* ========== 批量操作工具栏 ========== */}
               <DataTableBulkActions table={table} />
          </div>
     )
}
```

#### 2. 列定义

```typescript
import { type ColumnDef } from '@tanstack/react-table'
import { DataTableColumnHeader } from '@/develop/(components)/data-table'
import { Badge } from '@/components/ui/badge.tsx'
import { Checkbox } from '@/components/ui/checkbox.tsx'
import { labels, priorities, statuses } from '../data/data.tsx'
import { type Task } from '../data/schema.ts'
import { DataTableRowActions } from './data-table-row-actions.tsx'

/**
 * 任务表格列定义
 */
export const tasksColumns: ColumnDef<Task>[] = [
     // ========== 选择列 ==========
     {
          id: 'select',
          header: ({ table }) => (
               <Checkbox
                    checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && 'indeterminate')}
                    onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                    aria-label='Select all'
                    className='translate-y-[2px]'
               />
          ),
          cell: ({ row }) => (
               <Checkbox
                    checked={row.getIsSelected()}
                    onCheckedChange={(value) => row.toggleSelected(!!value)}
                    aria-label='Select row'
                    className='translate-y-[2px]'
               />
          ),
          enableSorting: false,
          enableHiding: false,
     },
     
     // ========== 任务 ID 列 ==========
     {
          accessorKey: 'id',
          header: ({ column }) => <DataTableColumnHeader column={column} title='Task' />,
          cell: ({ row }) => <div className='w-[80px]'>{row.getValue('id')}</div>,
          enableSorting: false,   // 不可排序
          enableHiding: false,    // 不可隐藏
     },
     
     // ========== 标题列 ==========
     {
          accessorKey: 'title',
          header: ({ column }) => <DataTableColumnHeader column={column} title='Title' />,
          meta: { className: 'ps-1', tdClassName: 'ps-4' },
          cell: ({ row }) => {
               // 查找标签配置
               const label = labels.find((label) => label.value === row.original.label)

               return (
                    <div className='flex space-x-2'>
                         {/* 显示标签徽章 */}
                         {label && <Badge variant='outline'>{label.label}</Badge>}
                         {/* 显示标题（支持截断） */}
                         <span className='max-w-32 truncate font-medium sm:max-w-72 md:max-w-[31rem]'>{row.getValue('title')}</span>
                    </div>
               )
          },
     },
     
     // ========== 状态列 ==========
     {
          accessorKey: 'status',
          header: ({ column }) => <DataTableColumnHeader column={column} title='Status' />,
          meta: { className: 'ps-1', tdClassName: 'ps-4' },
          cell: ({ row }) => {
               // 查找状态配置（包含图标和标签）
               const status = statuses.find((status) => status.value === row.getValue('status'))

               if (!status) {
                    return null
               }

               return (
                    <div className='flex w-[100px] items-center gap-2'>
                         {/* 显示状态图标 */}
                         {status.icon && <status.icon className='text-muted-foreground size-4' />}
                         <span>{status.label}</span>
                    </div>
               )
          },
          // 自定义过滤函数
          filterFn: (row, id, value) => {
               return value.includes(row.getValue(id))
          },
     },
     
     // ========== 优先级列 ==========
     {
          accessorKey: 'priority',
          header: ({ column }) => <DataTableColumnHeader column={column} title='Priority' />,
          meta: { className: 'ps-1', tdClassName: 'ps-3' },
          cell: ({ row }) => {
               // 查找优先级配置（包含图标和标签）
               const priority = priorities.find((priority) => priority.value === row.getValue('priority'))

               if (!priority) {
                    return null
               }

               return (
                    <div className='flex items-center gap-2'>
                         {/* 显示优先级图标 */}
                         {priority.icon && <priority.icon className='text-muted-foreground size-4' />}
                         <span>{priority.label}</span>
                    </div>
               )
          },
          // 自定义过滤函数
          filterFn: (row, id, value) => {
               return value.includes(row.getValue(id))
          },
     },
     
     // ========== 操作列 ==========
     {
          id: 'actions',
          cell: ({ row }) => <DataTableRowActions row={row} />,
     },
]
```

#### 3. 批量操作组件

```typescript
import { useState } from 'react'
import { type Table } from '@tanstack/react-table'
import { DataTableBulkActions as BulkActionsToolbar } from '@/develop/(components)/data-table'
import { sleep } from '@/develop/(lib)/utils.ts'
import { Trash2, CircleArrowUp, ArrowUpDown, Download } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button.tsx'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu.tsx'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip.tsx'
import { priorities, statuses } from '../data/data.tsx'
import { type Task } from '../data/schema.ts'
import { TasksMultiDeleteDialog } from './tasks-multi-delete-dialog.tsx'

type DataTableBulkActionsProps<TData> = {
     table: Table<TData>
}

/**
 * 任务表格批量操作组件
 * 
 * 提供以下批量操作：
 * - 更新状态（下拉菜单）
 * - 更新优先级（下拉菜单）
 * - 导出任务
 * - 删除任务
 */
export function DataTableBulkActions<TData>({ table }: DataTableBulkActionsProps<TData>) {
     const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
     const selectedRows = table.getFilteredSelectedRowModel().rows

     /**
      * 批量更改任务状态
      * @param status 状态值
      */
     const handleBulkStatusChange = (status: string) => {
          const selectedTasks = selectedRows.map((row) => row.original as Task)
          toast.promise(sleep(2000), {
               loading: 'Updating status...',
               success: () => {
                    table.resetRowSelection()
                    return `Status updated to "${status}" for ${selectedTasks.length} task${selectedTasks.length > 1 ? 's' : ''}.`
               },
               error: 'Error',
          })
          table.resetRowSelection()
     }

     /**
      * 批量更改任务优先级
      * @param priority 优先级值
      */
     const handleBulkPriorityChange = (priority: string) => {
          const selectedTasks = selectedRows.map((row) => row.original as Task)
          toast.promise(sleep(2000), {
               loading: 'Updating priority...',
               success: () => {
                    table.resetRowSelection()
                    return `Priority updated to "${priority}" for ${selectedTasks.length} task${selectedTasks.length > 1 ? 's' : ''}.`
               },
               error: 'Error',
          })
          table.resetRowSelection()
     }

     /**
      * 批量导出任务
      */
     const handleBulkExport = () => {
          const selectedTasks = selectedRows.map((row) => row.original as Task)
          toast.promise(sleep(2000), {
               loading: 'Exporting tasks...',
               success: () => {
                    table.resetRowSelection()
                    return `Exported ${selectedTasks.length} task${selectedTasks.length > 1 ? 's' : ''} to CSV.`
               },
               error: 'Error',
          })
          table.resetRowSelection()
     }

     return (
          <>
               <BulkActionsToolbar table={table} entityName='task'>
                    {/* 更新状态下拉菜单 */}
                    <DropdownMenu>
                         <Tooltip>
                              <TooltipTrigger asChild>
                                   <DropdownMenuTrigger asChild>
                                        <Button variant='outline' size='icon' className='size-8' aria-label='Update status' title='Update status'>
                                             <CircleArrowUp />
                                             <span className='sr-only'>Update status</span>
                                        </Button>
                                   </DropdownMenuTrigger>
                              </TooltipTrigger>
                              <TooltipContent>
                                   <p>Update status</p>
                              </TooltipContent>
                         </Tooltip>
                         <DropdownMenuContent sideOffset={14}>
                              {/* 遍历所有状态选项 */}
                              {statuses.map((status) => (
                                   <DropdownMenuItem 
                                        key={status.value} 
                                        defaultValue={status.value} 
                                        onClick={() => handleBulkStatusChange(status.value)}
                                   >
                                        {status.icon && <status.icon className='text-muted-foreground size-4' />}
                                        {status.label}
                                   </DropdownMenuItem>
                              ))}
                         </DropdownMenuContent>
                    </DropdownMenu>

                    {/* 更新优先级下拉菜单 */}
                    <DropdownMenu>
                         <Tooltip>
                              <TooltipTrigger asChild>
                                   <DropdownMenuTrigger asChild>
                                        <Button variant='outline' size='icon' className='size-8' aria-label='Update priority' title='Update priority'>
                                             <ArrowUpDown />
                                             <span className='sr-only'>Update priority</span>
                                        </Button>
                                   </DropdownMenuTrigger>
                              </TooltipTrigger>
                              <TooltipContent>
                                   <p>Update priority</p>
                              </TooltipContent>
                         </Tooltip>
                         <DropdownMenuContent sideOffset={14}>
                              {/* 遍历所有优先级选项 */}
                              {priorities.map((priority) => (
                                   <DropdownMenuItem
                                        key={priority.value}
                                        defaultValue={priority.value}
                                        onClick={() => handleBulkPriorityChange(priority.value)}
                                   >
                                        {priority.icon && <priority.icon className='text-muted-foreground size-4' />}
                                        {priority.label}
                                   </DropdownMenuItem>
                              ))}
                         </DropdownMenuContent>
                    </DropdownMenu>

                    {/* 导出按钮 */}
                    <Tooltip>
                         <TooltipTrigger asChild>
                              <Button
                                   variant='outline'
                                   size='icon'
                                   onClick={() => handleBulkExport()}
                                   className='size-8'
                                   aria-label='Export tasks'
                                   title='Export tasks'
                              >
                                   <Download />
                                   <span className='sr-only'>Export tasks</span>
                              </Button>
                         </TooltipTrigger>
                         <TooltipContent>
                              <p>Export tasks</p>
                         </TooltipContent>
                    </Tooltip>

                    {/* 删除按钮 */}
                    <Tooltip>
                         <TooltipTrigger asChild>
                              <Button
                                   variant='destructive'
                                   size='icon'
                                   onClick={() => setShowDeleteConfirm(true)}
                                   className='size-8'
                                   aria-label='Delete selected tasks'
                                   title='Delete selected tasks'
                              >
                                   <Trash2 />
                                   <span className='sr-only'>Delete selected tasks</span>
                              </Button>
                         </TooltipTrigger>
                         <TooltipContent>
                              <p>Delete selected tasks</p>
                         </TooltipContent>
                    </Tooltip>
               </BulkActionsToolbar>

               {/* 批量删除确认对话框 */}
               <TasksMultiDeleteDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm} table={table} />
          </>
     )
}
```

---

## 两个案例的对比

### 搜索模式对比

| 特性 | 用户表格 | 任务表格 |
|------|---------|---------|
| 搜索模式 | 列搜索（`searchKey='username'`） | 全局搜索（不指定 `searchKey`） |
| 搜索范围 | 仅搜索用户名列 | 搜索 ID 和标题列 |
| URL 参数 | `?username=xxx` | `?filter=xxx` |
| 适用场景 | 明确知道要搜索的列 | 需要跨列搜索 |

### URL 状态同步对比

| 特性 | 用户表格 | 任务表格 |
|------|---------|---------|
| 全局搜索 | 禁用 | 启用 |
| 列过滤 | username（字符串）、status（数组）、role（数组） | status（数组）、priority（数组） |
| URL 参数示例 | `?username=john&status=active&status=inactive&role=admin&page=1&pageSize=10` | `?filter=task&status=todo&priority=high&page=1&pageSize=10` |

### 批量操作对比

| 特性 | 用户表格 | 任务表格 |
|------|---------|---------|
| 操作类型 | 邀请、激活、停用、删除 | 更新状态、更新优先级、导出、删除 |
| 操作方式 | 按钮 | 下拉菜单 + 按钮 |
| 复杂度 | 简单操作 | 复杂操作（下拉菜单选择） |

---

## 最佳实践总结

### 1. 状态管理

- **URL 同步状态**：使用 `useTableUrlState` Hook 管理分页、过滤等需要持久化的状态
- **本地 UI 状态**：使用 `useState` 管理行选择、列可见性等临时状态

### 2. 搜索模式选择

- **列搜索**：当用户明确知道要搜索的列时使用（如用户名、邮箱）
- **全局搜索**：当需要跨列搜索时使用（如任务标题和 ID）

### 3. 列定义

- **使用 `DataTableColumnHeader`**：为需要排序和隐藏的列添加列标题组件
- **自定义过滤函数**：使用 `filterFn` 实现自定义过滤逻辑
- **列元数据**：使用 `meta` 属性添加样式类名

### 4. 批量操作

- **使用 `DataTableBulkActions`**：提供统一的批量操作工具栏
- **操作后清除选择**：操作完成后调用 `table.resetRowSelection()`
- **提供反馈**：使用 `toast` 显示操作结果

### 5. 响应式设计

- **移动端优化**：使用 CSS 类名处理移动端布局（如固定列）
- **工具栏边距**：移动端为批量操作工具栏添加底部边距

---

## 总结

这两个案例展示了 Data-Table 组件在实际项目中的完整使用方式，包括：

1. ✅ **完整的表格实现**：从数据到渲染的完整流程
2. ✅ **URL 状态同步**：实现可分享的表格视图
3. ✅ **多种搜索模式**：列搜索和全局搜索
4. ✅ **丰富的过滤功能**：多选过滤、自定义过滤函数
5. ✅ **批量操作**：提供完整的批量操作功能
6. ✅ **响应式设计**：适配移动端和桌面端

通过参考这些案例，可以快速实现自己的数据表格功能。

