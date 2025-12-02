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
     useReactTable, // Main hook for creating table instance
} from '@tanstack/react-table'
import { DataTablePagination, DataTableFacetedFilter, DataTableViewOptions } from '@/develop/(components)/data-table'
import { type NavigateFn, useTableUrlState } from '@/develop/(hooks)/use-table-url-state.ts'
import { cn } from '@/develop/(lib)/utils.ts'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table.tsx'
import { Input } from '@/components/ui/input.tsx'
import { Button } from '@/components/ui/button.tsx'
import { Search, X } from 'lucide-react'
import { roles } from '../data/data.ts'
import { DataTableBulkActions } from './actions/data-table-bulk-actions.tsx'
import { usersColumns as columns } from './users-columns.tsx'
import { useUsers } from '../context/use-users'

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
     // ============= Context 数据 =============
     const {
          users,
          isLoading,
          error,
          pagination,
          onPageChange,
          onSort,
          queryParams,
     } = useUsers()

     // ============= 本地 UI 状态 =============
     // 这些状态仅本地管理，不与 URL 同步

     const [rowSelection, setRowSelection] = useState({}) // 行选择状态
     const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({}) // 列可见性状态
     const [sorting, setSorting] = useState<SortingState>([
          {
               // queryParams.sort_by 已经是驼峰命名（createdAt），直接使用
               id: queryParams.sort_by || 'createdAt',
               desc: queryParams.sort_order === 'desc',
          },
     ]) // 排序状态

     // ============= 仅本地状态 (已禁用) =============
     // 取消注释可使用本地状态替代 URL 同步状态
     // const [columnFilters, onColumnFiltersChange] = useState<ColumnFiltersState>([])
     // const [pagination, onPaginationChange] = useState<PaginationState>({ pageIndex: 0, pageSize: 10 })

     // ============= 搜索输入框本地状态 =============
     // 搜索输入框的值（本地状态，不立即触发 API）
     const [searchInput, setSearchInput] = useState<string>(() => {
          // 从 URL 参数初始化搜索输入框的值
          return typeof search.username === 'string' ? search.username : ''
     })

     // ============= URL 同步状态 =============
     // 这些状态自动与 URL 搜索参数同步，支持可分享的链接

     const { columnFilters, onColumnFiltersChange, ensurePageInRange } = useTableUrlState({
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
               // 定义与 URL 参数同步的列筛选器
               { columnId: 'username', searchKey: 'username', type: 'string' }, // 用户名文本搜索
               { columnId: 'status', searchKey: 'status', type: 'array' }, // 状态多选筛选
               { columnId: 'role', searchKey: 'role', type: 'array' }, // 角色多选筛选
          ],
     })

     // ============= 搜索处理 =============
     // 当 URL 中的 username 参数变化时，同步更新搜索输入框
     useEffect(() => {
          const urlUsername = typeof search.username === 'string' ? search.username : ''
          if (urlUsername !== searchInput) {
               setSearchInput(urlUsername)
          }
     }, [search.username])

     // 处理搜索按钮点击
     const handleSearch = () => {
          // 更新 URL 参数，触发 API 查询
          navigate({
               search: (prev) => ({
                    ...(prev as Record<string, unknown>),
                    username: searchInput.trim() || undefined,
                    page: undefined, // 搜索时重置页码
               }),
          })
     }

     // 处理清除搜索
     const handleClearSearch = () => {
          setSearchInput('')
          navigate({
               search: (prev) => ({
                    ...(prev as Record<string, unknown>),
                    username: undefined,
                    page: undefined,
               }),
          })
     }

     // 处理回车键搜索
     const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
          if (e.key === 'Enter') {
               handleSearch()
          }
     }


     // ============= 排序处理 =============
     const handleSortingChange = (updater: SortingState | ((prev: SortingState) => SortingState)) => {
          const newSorting = typeof updater === 'function' ? updater(sorting) : updater
          setSorting(newSorting)
          if (newSorting.length > 0) {
               const { id, desc } = newSorting[0]
               onSort(id as string, desc ? 'desc' : 'asc')
          }
     }

     // ============= 分页处理 =============
     const handlePaginationChange = (updater: { pageIndex: number; pageSize: number } | ((prev: { pageIndex: number; pageSize: number }) => { pageIndex: number; pageSize: number })) => {
          const newPagination = typeof updater === 'function' ? updater({
               pageIndex: pagination.page - 1, // 转换为 0-based index
               pageSize: pagination.pageSize,
          }) : updater
          onPageChange(newPagination.pageIndex + 1) // 转换回 1-based index
     }

     // ============= 表格实例创建 =============
     // 创建 TanStack Table 实例
     /* eslint-disable-next-line react-hooks/incompatible-library */
     const table = useReactTable({
          data: users, // 用户数据来自 API
          columns, // 列定义
          state: {
               sorting, // 排序状态
               pagination: {
                    pageIndex: pagination.page - 1, // 转换为 0-based index
                    pageSize: pagination.pageSize,
               }, // 分页状态
               rowSelection, // 行选择状态
               columnFilters, // 列筛选状态 (URL 同步)
               columnVisibility, // 列可见性状态
          },
          enableRowSelection: true, // 启用行选择
          onPaginationChange: handlePaginationChange, // 分页变化处理
          onColumnFiltersChange, // 列筛选变化处理
          onRowSelectionChange: setRowSelection, // 行选择变化处理
          onSortingChange: handleSortingChange, // 排序变化处理
          onColumnVisibilityChange: setColumnVisibility, // 列可见性变化处理
          getPaginationRowModel: getPaginationRowModel(), // 启用分页
          getCoreRowModel: getCoreRowModel(), // 核心表格功能
          getFilteredRowModel: getFilteredRowModel(), // 启用筛选
          getSortedRowModel: getSortedRowModel(), // 启用排序
          getFacetedRowModel: getFacetedRowModel(), // 启用分面筛选
          getFacetedUniqueValues: getFacetedUniqueValues(), // 启用唯一值提取
          manualPagination: true, // 手动分页（服务端）
          manualSorting: true, // 手动排序（服务端）
          pageCount: pagination.totalPages, // 总页数
          rowCount: pagination.total, // 总行数
     })

     // ============= 页面验证 =============
     // 确保当前页面在有效范围内，防止筛选后跳转到无效页面
     useEffect(() => {
          ensurePageInRange(table.getPageCount())
     }, [table, ensurePageInRange])

     // ============= 加载和错误状态 =============
     if (isLoading) {
          return (
               <div className='flex flex-1 items-center justify-center'>
                    <div className='text-center'>
                         <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4'></div>
                         <p className='text-muted-foreground'>加载用户数据中...</p>
                    </div>
               </div>
          )
     }

     if (error) {
          return (
               <div className='flex flex-1 items-center justify-center'>
                    <div className='text-center'>
                         <div className='text-destructive text-4xl mb-4'>⚠️</div>
                         <h3 className='text-lg font-semibold mb-2'>加载失败</h3>
                         <p className='text-muted-foreground mb-4'>
                              {error instanceof Error ? error.message : '无法加载用户数据，请稍后重试'}
                         </p>
                         <button
                              onClick={() => window.location.reload()}
                              className='px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90'
                         >
                              重新加载
                         </button>
                    </div>
               </div>
          )
     }

     // ============= 渲染 =============
     return (
          <div
               className={cn(
                    // 移动端工具栏可见时添加底部边距，防止覆盖表格内容
                    'max-sm:has-[div[role="toolbar"]]:mb-16',
                    'flex flex-1 flex-col gap-4'
               )}
          >
               {/* 表格工具栏 - 自定义搜索框、列筛选、可见性切换 */}
               <div className='flex items-center justify-between'>
                    {/* 左侧工具栏区域：搜索框、过滤器和重置按钮 */}
                    <div className='flex flex-1 flex-col-reverse items-start gap-y-2 sm:flex-row sm:items-center sm:space-x-2'>
                         {/* 自定义搜索输入框：点击搜索按钮或按回车键才触发 API 查询 */}
                         <div className='flex items-center gap-2'>
                              <div className='relative'>
                                   <Input
                                        placeholder='筛选用户...'
                                        value={searchInput}
                                        onChange={(e) => setSearchInput(e.target.value)}
                                        onKeyDown={handleSearchKeyDown}
                                        className='h-8 w-[150px] lg:w-[250px] pr-8'
                                   />
                                   {searchInput && (
                                        <Button
                                             variant='ghost'
                                             size='sm'
                                             className='absolute right-0 top-0 h-8 w-8 p-0 hover:bg-transparent'
                                             onClick={handleClearSearch}
                                        >
                                             <X className='h-4 w-4' />
                                        </Button>
                                   )}
                              </div>
                              <Button
                                   variant='outline'
                                   size='sm'
                                   onClick={handleSearch}
                                   className='h-8'
                              >
                                   <Search className='h-4 w-4 mr-2' />
                                   搜索
                              </Button>
                         </div>

                         {/* 多选过滤器组：只显示过滤器，不显示搜索框 */}
                         <div className='flex gap-x-2'>
                              {[
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
                              ].map((filter) => {
                                   const column = table.getColumn(filter.columnId)
                                   if (!column) return null
                                   return <DataTableFacetedFilter key={filter.columnId} column={column} title={filter.title} options={filter.options} />
                              })}
                         </div>

                         {/* 重置按钮：当有任何过滤条件时显示 */}
                         {(table.getState().columnFilters.length > 0 || searchInput) && (
                              <Button
                                   variant='ghost'
                                   onClick={() => {
                                        table.resetColumnFilters()
                                        handleClearSearch()
                                   }}
                                   className='h-8 px-2 lg:px-3'
                              >
                                   重置
                                   <X className='ms-2 h-4 w-4' />
                              </Button>
                         )}
                    </div>

                    {/* 右侧工具栏区域：列显示选项控制 */}
                    <DataTableViewOptions table={table} />
               </div>

               {/* 数据表格 */}
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
                                                            // 动态背景色：常规/悬停/选中状态
                                                            'bg-background group-hover/row:bg-muted group-data-[state=selected]/row:bg-muted',
                                                            // 应用列定义中的自定义类
                                                            header.column.columnDef.meta?.className,
                                                            header.column.columnDef.meta?.thClassName
                                                       )}
                                                  >
                                                       {/* 渲染列标题 */}
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
                                   // 渲染数据行
                                   table.getRowModel().rows.map((row) => (
                                        <TableRow key={row.id} data-state={row.getIsSelected() && 'selected'} className='group/row'>
                                             {row.getVisibleCells().map((cell) => (
                                                  <TableCell
                                                       key={cell.id}
                                                       className={cn(
                                                            // 动态背景色，与表头保持一致
                                                            'bg-background group-hover/row:bg-muted group-data-[state=selected]/row:bg-muted',
                                                            // 应用列定义中的自定义类
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
                                   // 无数据时的空状态
                                   <TableRow>
                                        <TableCell colSpan={columns.length} className='h-24 text-center'>
                                             无结果。
                                        </TableCell>
                                   </TableRow>
                              )}
                         </TableBody>
                    </Table>
               </div>

               {/* 表格分页 - 页面导航、每页行数选择器、行数统计 */}
               <DataTablePagination table={table} className='mt-auto' />

               {/* 批量操作 - 选中行时显示，提供删除、编辑等操作 */}
               <DataTableBulkActions table={table} />
          </div>
     )
}
