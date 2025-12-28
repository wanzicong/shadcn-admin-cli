import { useEffect, useState, useCallback } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
     type VisibilityState,
     flexRender,
     getCoreRowModel,
     getFacetedRowModel,
     getFacetedUniqueValues,
     getFilteredRowModel,
     getPaginationRowModel,
     getSortedRowModel,
     useReactTable,
     type TableOptions,
} from '@tanstack/react-table'
import { DataTablePagination } from '@/develop/(components)/data-table'
import { cn } from '@/develop/(lib)/utils.ts'
import { type UserQueryParams, type UserRole, type UserStatus } from '@/develop/(services)/api'
import { DataTableToolbar } from '@/develop/(views)/official/users/search/search-form.tsx'
import { type NavigateFn, useTableUrlState } from '@/develop/(views)/official/users/search/use-table-url.ts'
import { Button } from '@/components/ui/button.tsx'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table.tsx'
import { roles } from '@/develop/(views)/official/users/services/data/data.ts'
import { type User } from '@/develop/(views)/official/users/services/data/schema.ts'
import { usersApi } from '../services/user-services.ts'
import { DataTableBulkActions } from './actions/data-table-bulk-actions.tsx'
import { usersColumns as columns } from './users-columns.tsx'

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

     // ============= 手动搜索处理 =============
     const handleManualSearch = useCallback(() => {
          // 手动搜索时重置到第一页并重新触发查询
          navigate({
               search: (prev) => ({
                    ...(prev as Record<string, unknown>),
                    page: 1, // 重置到第一页
               }),
          })
     }, [navigate])

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
          queryKey: ['users', userSearchParams],
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
     // eslint-disable-next-line react-hooks/incompatible-library -- TanStack Table 与 React Compiler 不兼容是已知的
     const table = useReactTable(tableOptions2)

     // ============= 副作用 =============
     useEffect(() => {
          // 确保当前页码在有效范围内
          ensurePageInRange(totalPages, { resetTo: 'first' })
     }, [table, ensurePageInRange, totalPages]) // 添加 totalPages 依赖

     // ============= 渲染逻辑 =============
     // 现在可以在 Hook 之后处理条件渲染

     if (isLoading) {
          return (
               <div className='flex h-64 flex-col items-center justify-center gap-4'>
                    <div className='flex items-center gap-2'>
                         <div className='border-primary h-6 w-6 animate-spin rounded-full border-b-2'></div>
                         <span className='text-muted-foreground'>加载用户数据中...</span>
                    </div>
                    <div className='text-muted-foreground text-xs'>正在获取第 {pagination.pageIndex + 1} 页数据，请稍候</div>
               </div>
          )
     }

     if (isError) {
          return (
               <div className='flex h-64 flex-col items-center justify-center gap-4'>
                    <div className='text-destructive flex items-center gap-2'>
                         <svg className='h-6 w-6' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                              <path
                                   strokeLinecap='round'
                                   strokeLinejoin='round'
                                   strokeWidth={2}
                                   d='M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z'
                              />
                         </svg>
                         <span>加载数据时出错</span>
                    </div>
                    <div className='space-y-2 text-center'>
                         <p className='text-muted-foreground text-sm'>无法获取用户数据，请检查网络连接后重试</p>
                         <div className='flex justify-center gap-2'>
                              <Button variant='outline' size='sm' onClick={() => window.location.reload()}>
                                   <svg className='mr-1 h-4 w-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                        <path
                                             strokeLinecap='round'
                                             strokeLinejoin='round'
                                             strokeWidth={2}
                                             d='M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15'
                                        />
                                   </svg>
                                   刷新页面
                              </Button>
                         </div>
                    </div>
               </div>
          )
     }

     // 注意：这里不能有 if (!data) 的检查，因为我们已经使用了 data?.list || []
     // 如果 data 为 null/undefined，userData 会是空数组 []

     // ============= 渲染 =============
     return (
          <div className={cn('max-sm:has-[div[role="toolbar"]]:mb-16', 'flex flex-1 flex-col gap-4')}>
               {/* 表格工具栏 */}
               <DataTableToolbar
                    table={table}
                    onManualSearch={handleManualSearch}
                    searchFields={[
                         {
                              columnId: 'phoneNumber',
                              placeholder: '电话号码...',
                              label: '电话号码',
                         },
                         {
                              columnId: 'username',
                              placeholder: '姓名...',
                              label: '姓名',
                         },
                    ]}
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

               {/* 简化的状态信息栏 */}
               {!isLoading && !isError && (
                    <div className='text-muted-foreground bg-muted/30 flex items-center justify-between rounded-md px-3 py-2 text-xs'>
                         <span>
                              共 <span className='text-foreground font-semibold'>{total}</span> 个用户
                              {total > 0 && (
                                   <>
                                        ，第 <span className='text-foreground font-semibold'>{pagination.pageIndex + 1}</span> 页， 每页{' '}
                                        <span className='text-foreground font-semibold'>{pagination.pageSize}</span> 条
                                   </>
                              )}
                         </span>
                    </div>
               )}

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
                                        <TableCell colSpan={columns.length} className='h-32 text-center'>
                                             <div className='flex flex-col items-center gap-2 py-8'>
                                                  {userData.length === 0 ? (
                                                       <>
                                                            <svg
                                                                 className='text-muted-foreground h-12 w-12'
                                                                 fill='none'
                                                                 stroke='currentColor'
                                                                 viewBox='0 0 24 24'
                                                            >
                                                                 <path
                                                                      strokeLinecap='round'
                                                                      strokeLinejoin='round'
                                                                      strokeWidth={1}
                                                                      d='M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z'
                                                                 />
                                                            </svg>
                                                            <div className='space-y-1'>
                                                                 <p className='text-muted-foreground font-medium'>暂无用户数据</p>
                                                                 <p className='text-muted-foreground text-xs'>系统中还没有用户，点击上方按钮添加新用户</p>
                                                            </div>
                                                       </>
                                                  ) : (
                                                       <>
                                                            <svg
                                                                 className='text-muted-foreground h-12 w-12'
                                                                 fill='none'
                                                                 stroke='currentColor'
                                                                 viewBox='0 0 24 24'
                                                            >
                                                                 <path
                                                                      strokeLinecap='round'
                                                                      strokeLinejoin='round'
                                                                      strokeWidth={1}
                                                                      d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z'
                                                                 />
                                                            </svg>
                                                            <div className='space-y-1'>
                                                                 <p className='text-muted-foreground font-medium'>未找到匹配的用户</p>
                                                                 <p className='text-muted-foreground text-xs'>请尝试调整搜索条件或筛选条件</p>
                                                            </div>
                                                       </>
                                                  )}
                                             </div>
                                        </TableCell>
                                   </TableRow>
                              )}
                         </TableBody>
                    </Table>
               </div>

               {/* 表格分页 */}
               <div className='mt-auto'>
                    {isLoading && (
                         <div className='text-muted-foreground flex items-center justify-center py-2 text-sm'>
                              <div className='border-primary mr-2 h-4 w-4 animate-spin rounded-full border-b-2'></div>
                              更新分页信息中...
                         </div>
                    )}
                    <DataTablePagination table={table} />
               </div>

               {/* 批量操作 */}
               <DataTableBulkActions table={table} />
          </div>
     )
}
