import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { type VisibilityState, flexRender, getCoreRowModel, getFacetedRowModel, getFacetedUniqueValues, getFilteredRowModel, getPaginationRowModel, getSortedRowModel, useReactTable, type TableOptions } from '@tanstack/react-table';
import { DataTablePagination } from '@/develop/(components)/data-table';
import { DataTableToolbar } from '@/develop/(components)/data-table/toolbar-server';
import { type NavigateFn, useTableUrlState } from '@/develop/(hooks)/use-table-url-state-server.ts';
import { cn } from '@/develop/(lib)/utils.ts';
import { type UserQueryParams, type UserRole, type UserStatus } from '@/develop/(services)/api';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table.tsx';
import { roles } from '../data/data.ts';
import { type User } from '../data/schema.ts';
import { usersApi } from '../services/user-services.ts';
import { DataTableBulkActions } from './actions/data-table-bulk-actions.tsx';
import { usersColumns as columns } from './users-columns.tsx';

















































// 组件属性类型定义
type DataTableProps = {
     search: Record<string, unknown> // URL 搜索参数
     navigate: NavigateFn // 导航函数
}

/**
 * 用户数据表格组件
 * 功能：排序、筛选、分页、行选择和 URL 状态同步
 */
export function UsersTable({ search, navigate }: DataTableProps) {
     // ============= Hook 区域（必须放在最前面） =============
     // 所有 Hook 必须在任何条件语句之前调用

     // 本地 UI 状态
     const [rowSelection, setRowSelection] = useState({}) // 行选择状态
     const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({}) // 列可见性状态
     // const [sorting, setSorting] = useState<SortingState>([]) // 排序状态

     // ============= URL 同步状态 =============
     const { columnFilters, onColumnFiltersChange, pagination, onPaginationChange, ensurePageInRange, sorting, onSortingChange } = useTableUrlState({
          search, // 当前 URL 搜索参数
          navigate, // 导航函数
          pagination: {
               defaultPage: 1, // 默认页码
               defaultPageSize: 10, // 默认每页大小
          },
          globalFilter: {
               enabled: false, // 禁用全局搜索
          },
          columnFilters: [
               { columnId: 'username', searchKey: 'username', type: 'string' },
               { columnId: 'phoneNumber', searchKey: 'phoneNumber', type: 'string' },
               { columnId: 'status', searchKey: 'status', type: 'array' },
               { columnId: 'role', searchKey: 'role', type: 'array' },
          ],
          sorting: {
               // ✅ 新增排序配置
               enabled: true,
               sortByKey: 'sort_by', // 对应后端的 sort_by 参数
               sortOrderKey: 'sort_order', // 对应后端的 sort_order 参数
               defaultSortBy: 'created_at', // 默认排序字段
               defaultSortOrder: 'desc', // 默认排序方向
          },
     })

     // ============= 数据查询 Hook =============
     // 必须放在所有其他 Hook 之后，但在条件语句之前
     const userSearchParams: UserQueryParams = {
          page: search.page as number,
          page_size: search.pageSize as number,
          ...(sorting.length > 0 && {
               sort_by: sorting[0].id,
               sort_order: sorting[0].desc ? 'desc' : 'asc',
          }),
          username: search.username as string,
          ...search,
          ...transformFilters(search),
     }

     // alert(userSearchParams.username)
     const { data, isLoading, isError } = useQuery({
          queryKey: ['demos', userSearchParams],
          queryFn: () => usersApi.getUsers(userSearchParams),
     })


     // 转换筛选参数的辅助函数
     function transformFilters(searchParams: Record<string, unknown>): Partial<UserQueryParams> {
          const result: Partial<UserQueryParams> = {}

          // 状态参数转换
          if (searchParams.status) {
               result.status = parseFilterParam(searchParams.status) as UserStatus | UserStatus[]
          }

          // 角色参数转换
          if (searchParams.role) {
               result.role = parseFilterParam(searchParams.role) as UserRole | UserRole[]
          }
          return result
     }

     // 解析筛选参数的通用函数
     function parseFilterParam(param: unknown): string | string[] {
          if (Array.isArray(param)) {
               return param.map(String)
          }

          if (typeof param === 'string') {
               // 检查是否是 JSON 数组字符串
               if (param.startsWith('[') && param.endsWith(']')) {
                    try {
                         const parsed = JSON.parse(param)
                         return Array.isArray(parsed) ? parsed.map(String) : [String(parsed)]
                    } catch {
                         return [param]
                    }
               }

               // 检查是否是逗号分隔的字符串
               if (param.includes(',')) {
                    return param
                         .split(',')
                         .map((s) => s.trim())
                         .filter(Boolean)
               }

               // 单个字符串值
               return param
          }

          // 其他类型转换为字符串
          return String(param)
     }
     // ============= 数据转换 =============
     // 这些不是 Hook，可以在条件语句之前
     const userData: User[] = data?.list || [] // 添加默认值，防止 undefined
     const total = data?.total || 0
     const totalPages = data?.totalPages || 1

     // ============= 表格配置 =============
     // 确保在所有渲染路径中 tableOptions2 都被定义
     const tableOptions2: TableOptions<User> = {
          data: userData, // 使用 userData，确保有默认值
          columns,
          state: {
               sorting,
               pagination,
               rowSelection,
               columnFilters,
               columnVisibility,
          },
          enableRowSelection: true,
          onPaginationChange: onPaginationChange,
          onColumnFiltersChange,
          onRowSelectionChange: setRowSelection,
          onSortingChange: onSortingChange,
          onColumnVisibilityChange: setColumnVisibility,
          getPaginationRowModel: getPaginationRowModel(),
          getCoreRowModel: getCoreRowModel(),
          getFilteredRowModel: getFilteredRowModel(),
          getSortedRowModel: getSortedRowModel(),
          getFacetedRowModel: getFacetedRowModel(),
          getFacetedUniqueValues: getFacetedUniqueValues(),
          manualPagination: true,
          manualSorting: true,
          manualFiltering: true,
          enableMultiRowSelection: true,
          enableColumnFilters: true,
          pageCount: totalPages,
          rowCount: total,
     }

     // ============= 表格实例创建 =============
     // useReactTable 必须在所有条件下都调用
     // eslint-disable-next-line react-hooks/rules-of-hooks
     const table = useReactTable(tableOptions2)

     // ============= 副作用 =============
     useEffect(() => {
          ensurePageInRange(table.getPageCount())
     }, [table, ensurePageInRange, totalPages]) // 添加 totalPages 依赖

     // ============= 渲染逻辑 =============
     // 现在可以在 Hook 之后处理条件渲染

     if (isLoading) {
          return <div className='flex h-64 items-center justify-center'>加载中...</div>
     }

     if (isError) {
          return <div className='flex h-64 items-center justify-center text-red-500'>加载数据时出错</div>
     }

     // 注意：这里不能有 if (!data) 的检查，因为我们已经使用了 data?.list || []
     // 如果 data 为 null/undefined，userData 会是空数组 []

     // ============= 渲染 =============
     return (
          <div className={cn('max-sm:has-[div[role="toolbar"]]:mb-16', 'flex flex-1 flex-col gap-4')}>
               {/* 表格工具栏 */}
               <DataTableToolbar
                    table={table}
                    searchPlaceholder='筛选用户...'
                    searchKey='username'
                    filters={[
                         {
                              columnId: 'status',
                              title: '状态',
                              options: [
                                   { label: '活跃', value: 'active' },
                                   { label: '非活跃', value: 'inactive' },
                                   { label: '已邀请', value: 'invited' },
                                   { label: '已暂停', value: 'suspended' },
                              ],
                         },
                         {
                              columnId: 'role',
                              title: '角色',
                              options: roles.map((role) => ({ ...role })),
                         },
                    ]}
               />

               {/* 数据表格 */}
               <div className='overflow-hidden rounded-md border'>
                    <Table>
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
                                        <TableRow key={row.id} data-state={row.getIsSelected() && 'selected'} className='group/row'>
                                             {row.getVisibleCells().map((cell) => (
                                                  <TableCell
                                                       key={cell.id}
                                                       className={cn(
                                                            'bg-background group-hover/row:bg-muted group-data-[state=selected]/row:bg-muted',
                                                            cell.column.columnDef.meta?.className,
                                                            cell.column.columnDef.meta?.tdClassName
                                                       )}
                                                  >
                                                       {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                                  </TableCell>
                                             ))}
                                        </TableRow>
                                   ))
                              ) : (
                                   <TableRow>
                                        <TableCell colSpan={columns.length} className='h-24 text-center'>
                                             {userData.length === 0 ? '暂无数据' : '无匹配结果'}
                                        </TableCell>
                                   </TableRow>
                              )}
                         </TableBody>
                    </Table>
               </div>

               {/* 表格分页 */}
               <DataTablePagination table={table} className='mt-auto' />

               {/* 批量操作 */}
               <DataTableBulkActions table={table} />
          </div>
     )
}
