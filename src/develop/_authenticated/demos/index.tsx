import { useCallback, useEffect, useMemo, useState } from 'react'
import { ArrowDownIcon, ArrowUpIcon, CaretSortIcon, ChevronLeftIcon, ChevronRightIcon, DoubleArrowLeftIcon, DoubleArrowRightIcon } from '@radix-ui/react-icons'
import { useQuery } from '@tanstack/react-query'
import { createFileRoute, getRouteApi } from '@tanstack/react-router'
import {
     type ColumnDef,
     type ColumnFiltersState,
     flexRender,
     useReactTable,
     getCoreRowModel,
     getPaginationRowModel,
     getSortedRowModel,
     getFilteredRowModel,
     type SortingState,
     type PaginationState,
     type RowSelectionState,
     type TableOptions,
     type Table as TanstackTable,
     type OnChangeFn,
} from '@tanstack/react-table'
import { Main } from '@/develop/(layout)/main.tsx'
import { cn } from '@/develop/(lib)/utils.ts'
import { usersApi } from '@/develop/(services)/api'
import type { User, UserQueryParams } from '@/develop/(services)/api/types'
import { Badge } from '@/components/ui/badge.tsx'
import { Button } from '@/components/ui/button.tsx'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.tsx'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table.tsx'

type TablePageProps = {
     data: User[]
     total: number
     totalPages: number
     searchParam: UserQueryParams
     searchChange: (searchParam: UserQueryParams) => Promise<void>
}

/**
 *  路由信息
 */
export const Route = createFileRoute('/_authenticated/demos/')({
     component: RouteComponent,
})

const route = getRouteApi('/_authenticated/demos/')

/**
 * 主页面
 * 1. 数据加载
 * 2. 组件信息
 * @constructor
 */
function RouteComponent() {
     // 页面导航信息
     const navigate = route.useNavigate()
     // 查询参数 - 路由配置已经处理了解码
     const searchParam = route.useSearch()

     // 处理参数变化 - 编码URL参数
     const searchChange = async (searchParam: UserQueryParams) => {
          // 编码查询参数以处理中文等特殊字符
          // const encodedParams = encodeQueryParams(searchParam as Record<string, unknown>)
          await navigate({
               search: searchParam,
          })
     }

     // 查询数据
     const { data, isLoading, isError } = useQuery({
          queryKey: ['demos', searchParam],
          queryFn: () => usersApi.getUsers(searchParam as UserQueryParams),
     })

     if (isLoading) {
          return <div>loading ...</div>
     }

     if (isError) {
          return <div>error info </div>
     }

     if (!data) {
          return <div>no data</div>
     }

     const userData = data.list // 实际展示数据 (后端)
     const total = data.total // 一共数据量 (后端)
     const totalPages = data.totalPages // 数据分页 (后端)

     return (
          <Main>
               <TablePage data={userData} total={total} totalPages={totalPages} searchParam={searchParam} searchChange={searchChange} />
          </Main>
     )
}

/**
 * Table 数据处理逻辑
 * @param data
 * @param total
 * @param totalPages
 * @param searchParam
 * @param searchChange
 * @constructor
 */
function TablePage({ data, total, totalPages, searchParam, searchChange }: TablePageProps) {
     // ==========================
     // 本地状态管理
     // ==========================

     const [rowSelection, setRowSelection] = useState<RowSelectionState>({})
     const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])

     // ==========================
     // 从 URL 参数计算派生状态
     // ==========================

     const paginationFromUrl: PaginationState = useMemo(() => {
          const page = (searchParam.page as number) ?? 1
          const pageSize = (searchParam.page_size as number) ?? 10
          // console.log('计算 paginationFromUrl:', { page, pageSize, searchParam })
          return {
               pageIndex: Math.max(0, page - 1),
               pageSize,
          }
     }, [searchParam.page, searchParam.page_size])

     const sortingFromUrl: SortingState = useMemo(() => {
          const sort_by = searchParam.sort_by as string
          const sort_order = searchParam.sort_order as string
          // console.log('计算 sortingFromUrl:', { sort_by, sort_order })

          if (sort_by && sort_order) {
               return [
                    {
                         id: sort_by,
                         desc: sort_order === 'desc',
                    },
               ]
          }
          return []
     }, [searchParam.sort_by, searchParam.sort_order])

     // ==========================
     // 本地状态（作为中间层）
     // ==========================

     const [pagination, setPagination] = useState<PaginationState>(paginationFromUrl)
     const [sorting, setSorting] = useState<SortingState>(sortingFromUrl)

     // ==========================
     // 关键：同步 URL -> 本地状态
     // ==========================

     useEffect(() => {
          // console.log('URL -> 本地状态: 同步分页', paginationFromUrl)
          setPagination(paginationFromUrl)
     }, [paginationFromUrl])

     useEffect(() => {
          // console.log('URL -> 本地状态: 同步排序', sortingFromUrl)
          setSorting(sortingFromUrl)
     }, [sortingFromUrl])

     // ==========================
     // 本地状态 -> URL
     // ==========================

     // 处理分页变化 - 修复类型问题
     const handlePaginationChange: OnChangeFn<PaginationState> = useCallback(
          (updater) => {
               // console.log('本地状态 -> URL: 处理分页变化', updater)

               // 计算新的分页状态
               const newPagination = typeof updater === 'function' ? updater(pagination) : updater

               // console.log('新的分页状态:', newPagination)

               const newSearchParam = {
                    ...searchParam,
                    page: newPagination.pageIndex + 1,
                    page_size: newPagination.pageSize,
               }

               // 保留排序参数
               if (sorting.length > 0) {
                    newSearchParam.sort_by = sorting[0].id
                    newSearchParam.sort_order = sorting[0].desc ? 'desc' : 'asc'
               }

               // console.log('更新 URL 参数:', newSearchParam)
               searchChange(newSearchParam)
          },
          [searchParam, sorting, pagination, searchChange]
     )

     // 处理排序变化 - 修复类型问题
     const handleSortingChange: OnChangeFn<SortingState> = useCallback(
          (updater) => {
               // console.log('本地状态 -> URL: 处理排序变化', updater)

               // 计算新的排序状态
               const newSorting = typeof updater === 'function' ? updater(sorting) : updater

               // console.log('新的排序状态:', newSorting)

               const newSearchParam = {
                    ...searchParam,
                    page: 1, // 排序后重置到第一页
                    page_size: pagination.pageSize,
               }

               if (newSorting.length > 0) {
                    newSearchParam.sort_by = newSorting[0].id
                    newSearchParam.sort_order = newSorting[0].desc ? 'desc' : 'asc'
               } else {
                    // 清除排序参数
                    delete newSearchParam.sort_by
                    delete newSearchParam.sort_order
               }

               // console.log('更新 URL 参数:', newSearchParam)
               searchChange(newSearchParam)
          },
          [searchParam, sorting, pagination.pageSize, searchChange]
     )

     // ============= 表格实例创建 =============
     const tableOptions: TableOptions<User> = {
          data,
          columns: useCommonTableCols2(),
          state: {
               sorting,
               pagination,
               rowSelection,
               columnFilters,
          },
          pageCount: totalPages,
          rowCount: total,
          getCoreRowModel: getCoreRowModel(),
          getPaginationRowModel: getPaginationRowModel(),
          getSortedRowModel: getSortedRowModel(),
          getFilteredRowModel: getFilteredRowModel(),
          manualPagination: true,
          manualSorting: true,
          manualFiltering: true,
          enableRowSelection: true,
          enableMultiRowSelection: true,
          enableColumnFilters: true,
          onSortingChange: handleSortingChange, // ✅ 类型正确
          onPaginationChange: handlePaginationChange, // ✅ 类型正确
          onRowSelectionChange: setRowSelection,
          onColumnFiltersChange: setColumnFilters,
     }

     // eslint-disable-next-line react-hooks/incompatible-library
     const table: TanstackTable<User> = useReactTable<User>(tableOptions)

     return (
          <div className='space-y-4'>
               <div className='flex items-center justify-between'>
                    <div>
                         <h3 className='text-lg font-semibold'>用户管理演示</h3>
                         <p className='text-muted-foreground text-sm'>搜索信息: {JSON.stringify(searchParam)}</p>
                    </div>
                    <button
                         onClick={async () => {
                              await searchChange({ page: 1, page_size: 10 })
                         }}
                         className='rounded-md bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700'
                    >
                         查询按钮
                    </button>
                    <button
                         onClick={async () => {
                              await searchChange({})
                         }}
                         className='rounded-md bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700'
                    >
                         重置按钮
                    </button>
                    <button
                         onClick={async () => {
                              await searchChange({
                                   page: 1,
                                   page_size: 10,
                                   search: 'superadmin@example.com',
                              })
                         }}
                         className='rounded-md bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700'
                    >
                         查询按钮2
                    </button>
                    <button
                         onClick={async () => {
                              await searchChange({
                                   page: 1,
                                   page_size: 10,
                                   search: '管理员',
                              })
                         }}
                         className='rounded-md bg-green-600 px-4 py-2 text-white transition-colors hover:bg-green-700'
                    >
                         测试中文搜索
                    </button>
               </div>

               <div className='grid grid-cols-2 gap-4 text-sm md:grid-cols-4'>
                    <div className='bg-muted rounded-lg p-3'>
                         <div className='font-medium'>数据总数</div>
                         <div className='text-2xl font-bold'>{total}</div>
                    </div>
                    <div className='bg-muted rounded-lg p-3'>
                         <div className='font-medium'>总页数</div>
                         <div className='text-2xl font-bold'>{totalPages}</div>
                    </div>
                    <div className='bg-muted rounded-lg p-3'>
                         <div className='font-medium'>当前页数据</div>
                         <div className='text-2xl font-bold'>{data.length}</div>
                    </div>
                    <div className='bg-muted rounded-lg p-3'>
                         <div className='font-medium'>页面大小</div>
                         <div className='text-2xl font-bold'>{(searchParam.page_size as number) || 10}</div>
                    </div>
                    <div className='bg-muted rounded-lg p-3'>
                         <div className='font-medium'>排序信息</div>
                         <div className='font-medium'>{sorting[0]?.desc}</div>
                         <div className='font-medium'>{sorting[0]?.id}</div>
                    </div>
               </div>

               <div className='rounded-lg border'>
                    <CommonTableData table={table} />
               </div>
               <div>
                    <CommonTablePagination table={table} />
               </div>
          </div>
     )
}

/**
 * 获取分页的数量
 * @param currentPage
 * @param totalPages
 */
function getPageNumbers(currentPage: number, totalPages: number) {
     const maxVisiblePages = 5
     const rangeWithDots: (string | number)[] = []

     if (totalPages === 0) {
          return rangeWithDots
     }

     if (totalPages <= maxVisiblePages) {
          // 显示1-based页码：1, 2, 3, ...
          for (let i = 1; i <= totalPages; i++) {
               rangeWithDots.push(i)
          }
     } else {
          // 始终显示第一页 (1)
          rangeWithDots.push(1)

          if (currentPage <= 3) {
               // 靠近开头: [1] [2] [3] [4] ... [totalPages]
               for (let i = 2; i <= 4; i++) {
                    rangeWithDots.push(i)
               }
               rangeWithDots.push('...', totalPages)
          } else if (currentPage >= totalPages - 2) {
               // 靠近结尾: [1] ... [totalPages-3] [totalPages-2] [totalPages-1] [totalPages]
               rangeWithDots.push('...')
               for (let i = totalPages - 3; i <= totalPages; i++) {
                    rangeWithDots.push(i)
               }
          } else {
               // 在中间: [1] ... [currentPage-1] [currentPage] [currentPage+1] ... [totalPages]
               rangeWithDots.push('...')
               for (let i = currentPage - 1; i <= currentPage + 1; i++) {
                    rangeWithDots.push(i)
               }
               rangeWithDots.push('...', totalPages)
          }
     }

     return rangeWithDots
}

/**
 * 分页组件
 * @param table
 * @constructor
 */
function CommonTablePagination({ table }: { table: TanstackTable<User> }) {
     const currentPageIndex = table.getState().pagination.pageIndex
     const currentPage = currentPageIndex + 1
     const totalPages = table.getPageCount()
     const pageNumbers = getPageNumbers(currentPage, totalPages)

     return (
          <div className='flex flex-col items-center justify-between gap-4 px-2 py-2 sm:flex-row'>
               {/* 第一行：左侧信息 */}
               <div className='flex w-full items-center justify-between gap-4 sm:w-auto sm:justify-start'>
                    {/* 移动端页面信息 */}
                    <div className='flex items-center text-sm font-medium sm:hidden'>
                         第 {currentPage} / {totalPages} 页
                    </div>

                    {/* 每页数量选择器 */}
                    <div className='flex items-center gap-2'>
                         <p className='hidden text-sm font-medium sm:block'>每页</p>
                         <Select
                              value={`${table.getState().pagination.pageSize}`}
                              onValueChange={(value) => {
                                   table.setPageSize(Number(value))
                              }}
                         >
                              <SelectTrigger className='h-8 w-[70px]'>
                                   <SelectValue placeholder={table.getState().pagination.pageSize} />
                              </SelectTrigger>
                              <SelectContent side='top'>
                                   {[10, 20, 30, 40, 50].map((pageSize) => (
                                        <SelectItem key={pageSize} value={`${pageSize}`}>
                                             {pageSize}
                                        </SelectItem>
                                   ))}
                              </SelectContent>
                         </Select>
                    </div>
               </div>

               {/* 第二行：分页导航 */}
               <div className='flex w-full flex-col items-center gap-4 sm:w-auto sm:flex-row'>
                    {/* 桌面端页面信息 */}
                    <div className='hidden min-w-[120px] items-center text-sm font-medium sm:flex'>
                         第 {currentPage} 页 / 共 {totalPages} 页
                    </div>

                    {/* 分页按钮组 */}
                    <div className='flex flex-wrap items-center justify-center gap-1 sm:gap-2'>
                         {/* 首页按钮 */}
                         <Button
                              variant='outline'
                              className='hidden size-8 p-0 sm:inline-flex'
                              onClick={() => table.setPageIndex(0)}
                              disabled={!table.getCanPreviousPage()}
                         >
                              <span className='sr-only'>跳转到第一页</span>
                              <DoubleArrowLeftIcon className='h-4 w-4' />
                         </Button>

                         {/* 上一页按钮 */}
                         <Button variant='outline' className='size-8 p-0' onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>
                              <span className='sr-only'>上一页</span>
                              <ChevronLeftIcon className='h-4 w-4' />
                         </Button>

                         {/* 页码按钮 */}
                         <div className='flex flex-wrap items-center justify-center gap-1'>
                              {pageNumbers.map((pageNumber, index) => (
                                   <div key={`${pageNumber}-${index}`} className='flex items-center'>
                                        {pageNumber === '...' ? (
                                             <span className='text-muted-foreground px-1 text-sm'>...</span>
                                        ) : (
                                             <Button
                                                  variant={currentPage === pageNumber ? 'default' : 'outline'}
                                                  className='h-8 w-8 min-w-8 p-0'
                                                  onClick={() => table.setPageIndex((pageNumber as number) - 1)}
                                             >
                                                  {pageNumber}
                                             </Button>
                                        )}
                                   </div>
                              ))}
                         </div>

                         {/* 下一页按钮 */}
                         <Button variant='outline' className='size-8 p-0' onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
                              <span className='sr-only'>下一页</span>
                              <ChevronRightIcon className='h-4 w-4' />
                         </Button>

                         {/* 末页按钮 */}
                         <Button
                              variant='outline'
                              className='hidden size-8 p-0 sm:inline-flex'
                              onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                              disabled={!table.getCanNextPage()}
                         >
                              <span className='sr-only'>末页</span>
                              <DoubleArrowRightIcon className='h-4 w-4' />
                         </Button>
                    </div>
               </div>
          </div>
     )
}

/**
 * 表格数据 table 表头
 */
export function useCommonTableCols(): ColumnDef<User>[] {
     return [
          // 用户名列
          {
               accessorKey: 'username',
               header: '用户名',
               cell: ({ row }) => <div className='font-medium'>{row.getValue('username')}</div>,
          },
          // 全名列
          {
               accessorKey: 'firstName',
               header: '姓名',
               cell: ({ row }) => {
                    const firstName = row.getValue('firstName') as string
                    const lastName = row.original.lastName
                    return (
                         <div>
                              {firstName} {lastName}
                         </div>
                    )
               },
          },
          // 邮箱列
          {
               accessorKey: 'email',
               header: '邮箱',
               cell: ({ row }) => <div className='text-muted-foreground text-sm'>{row.getValue('email')}</div>,
          },
          // 电话号码列
          {
               accessorKey: 'phoneNumber',
               header: '电话',
               cell: ({ row }) => {
                    const phone = row.getValue('phoneNumber') as string
                    return <div className='text-sm'>{phone || '-'}</div>
               },
          },
          // 状态列
          {
               accessorKey: 'status',
               header: '状态',
               cell: ({ row }) => {
                    const status = row.getValue('status') as string
                    const statusConfig = {
                         active: { label: '活跃', variant: 'default' as const },
                         inactive: { label: '非活跃', variant: 'secondary' as const },
                         invited: { label: '已邀请', variant: 'outline' as const },
                         suspended: { label: '已暂停', variant: 'destructive' as const },
                    }
                    const config = statusConfig[status as keyof typeof statusConfig] || { label: status, variant: 'outline' as const }
                    return (
                         <Badge variant={config.variant} className='capitalize'>
                              {config.label}
                         </Badge>
                    )
               },
          },
          // 角色列
          {
               accessorKey: 'role',
               header: '角色',
               cell: ({ row }) => {
                    const role = row.getValue('role') as string
                    const roleConfig = {
                         superadmin: { label: '超级管理员', color: 'text-red-600' },
                         admin: { label: '管理员', color: 'text-blue-600' },
                         manager: { label: '经理', color: 'text-green-600' },
                         cashier: { label: '收银员', color: 'text-orange-600' },
                    }
                    const config = roleConfig[role as keyof typeof roleConfig] || { label: role, color: 'text-gray-600' }
                    return <span className={cn('text-sm font-medium', config.color)}>{config.label}</span>
               },
          },
          // 创建时间列
          {
               accessorKey: 'createdAt',
               header: '创建时间',
               cell: ({ row }) => {
                    const date = new Date(row.getValue('createdAt') as string)
                    return <div className='text-muted-foreground text-sm'>{date.toLocaleDateString('zh-CN')}</div>
               },
          },
     ]
}

/**
 * 表格数据 table 表头 - 添加排序功能
 */
function useCommonTableCols2(): ColumnDef<User>[] {
     return [
          // 用户名列 - 启用排序
          {
               accessorKey: 'username',
               header: ({ column }) => (
                    <Button variant='ghost' onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')} className='p-0 hover:bg-transparent'>
                         用户名
                         {column.getIsSorted() === 'desc' ? (
                              <ArrowDownIcon className='ml-2 h-4 w-4' />
                         ) : column.getIsSorted() === 'asc' ? (
                              <ArrowUpIcon className='ml-2 h-4 w-4' />
                         ) : (
                              <CaretSortIcon className='ml-2 h-4 w-4' />
                         )}
                    </Button>
               ),
               cell: ({ row }) => <div className='font-medium'>{row.getValue('username')}</div>,
          },
          // 全名列 - 启用排序
          {
               accessorKey: 'firstName',
               header: ({ column }) => (
                    <Button variant='ghost' onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')} className='p-0 hover:bg-transparent'>
                         姓名
                         {column.getIsSorted() === 'desc' ? (
                              <ArrowDownIcon className='ml-2 h-4 w-4' />
                         ) : column.getIsSorted() === 'asc' ? (
                              <ArrowUpIcon className='ml-2 h-4 w-4' />
                         ) : (
                              <CaretSortIcon className='ml-2 h-4 w-4' />
                         )}
                    </Button>
               ),
               cell: ({ row }) => {
                    const firstName = row.getValue('firstName') as string
                    const lastName = row.original.lastName
                    return (
                         <div>
                              {firstName} {lastName}
                         </div>
                    )
               },
          },
          // 邮箱列 - 启用排序
          {
               accessorKey: 'email',
               header: ({ column }) => (
                    <Button variant='ghost' onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')} className='p-0 hover:bg-transparent'>
                         邮箱
                         {column.getIsSorted() === 'desc' ? (
                              <ArrowDownIcon className='ml-2 h-4 w-4' />
                         ) : column.getIsSorted() === 'asc' ? (
                              <ArrowUpIcon className='ml-2 h-4 w-4' />
                         ) : (
                              <CaretSortIcon className='ml-2 h-4 w-4' />
                         )}
                    </Button>
               ),
               cell: ({ row }) => <div className='text-muted-foreground text-sm'>{row.getValue('email')}</div>,
          },
          // 电话号码列
          {
               accessorKey: 'phoneNumber',
               header: '电话',
               cell: ({ row }) => {
                    const phone = row.getValue('phoneNumber') as string
                    return <div className='text-sm'>{phone || '-'}</div>
               },
          },
          // 状态列 - 启用排序
          {
               accessorKey: 'status',
               header: ({ column }) => (
                    <Button variant='ghost' onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')} className='p-0 hover:bg-transparent'>
                         状态
                         {column.getIsSorted() === 'desc' ? (
                              <ArrowDownIcon className='ml-2 h-4 w-4' />
                         ) : column.getIsSorted() === 'asc' ? (
                              <ArrowUpIcon className='ml-2 h-4 w-4' />
                         ) : (
                              <CaretSortIcon className='ml-2 h-4 w-4' />
                         )}
                    </Button>
               ),
               cell: ({ row }) => {
                    const status = row.getValue('status') as string
                    const statusConfig = {
                         active: { label: '活跃', variant: 'default' as const },
                         inactive: { label: '非活跃', variant: 'secondary' as const },
                         invited: { label: '已邀请', variant: 'outline' as const },
                         suspended: { label: '已暂停', variant: 'destructive' as const },
                    }
                    const config = statusConfig[status as keyof typeof statusConfig] || { label: status, variant: 'outline' as const }
                    return (
                         <Badge variant={config.variant} className='capitalize'>
                              {config.label}
                         </Badge>
                    )
               },
          },
          // 角色列 - 启用排序
          {
               accessorKey: 'role',
               header: ({ column }) => (
                    <Button variant='ghost' onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')} className='p-0 hover:bg-transparent'>
                         角色
                         {column.getIsSorted() === 'desc' ? (
                              <ArrowDownIcon className='ml-2 h-4 w-4' />
                         ) : column.getIsSorted() === 'asc' ? (
                              <ArrowUpIcon className='ml-2 h-4 w-4' />
                         ) : (
                              <CaretSortIcon className='ml-2 h-4 w-4' />
                         )}
                    </Button>
               ),
               cell: ({ row }) => {
                    const role = row.getValue('role') as string
                    const roleConfig = {
                         superadmin: { label: '超级管理员', color: 'text-red-600' },
                         admin: { label: '管理员', color: 'text-blue-600' },
                         manager: { label: '经理', color: 'text-green-600' },
                         cashier: { label: '收银员', color: 'text-orange-600' },
                    }
                    const config = roleConfig[role as keyof typeof roleConfig] || { label: role, color: 'text-gray-600' }
                    return <span className={cn('text-sm font-medium', config.color)}>{config.label}</span>
               },
          },
          // 创建时间列 - 启用排序
          {
               accessorKey: 'createdAt',
               header: ({ column }) => (
                    <Button variant='ghost' onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')} className='p-0 hover:bg-transparent'>
                         创建时间
                         {column.getIsSorted() === 'desc' ? (
                              <ArrowDownIcon className='ml-2 h-4 w-4' />
                         ) : column.getIsSorted() === 'asc' ? (
                              <ArrowUpIcon className='ml-2 h-4 w-4' />
                         ) : (
                              <CaretSortIcon className='ml-2 h-4 w-4' />
                         )}
                    </Button>
               ),
               cell: ({ row }) => {
                    const date = new Date(row.getValue('createdAt') as string)
                    return <div className='text-muted-foreground text-sm'>{date.toLocaleDateString('zh-CN')}</div>
               },
          },
     ]
}

/**
 * 公共页面组件
 * @param table
 * @constructor
 */
function CommonTableData({ table }: { table: TanstackTable<User> }) {
     return (
          <Table>
               <TableHeader>
                    {table.getHeaderGroups().map((headerGroup) => (
                         <TableRow key={headerGroup.id}>
                              {headerGroup.headers.map((header) => (
                                   <TableHead key={header.id}>
                                        {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                                   </TableHead>
                              ))}
                         </TableRow>
                    ))}
               </TableHeader>
               <TableBody>
                    {table.getRowModel().rows?.length ? (
                         table.getRowModel().rows.map((row) => (
                              <TableRow key={row.id} data-state={row.getIsSelected() && 'selected'}>
                                   {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                                   ))}
                              </TableRow>
                         ))
                    ) : (
                         <TableRow>
                              <TableCell colSpan={table.getAllColumns().length} className='h-24 text-center'>
                                   暂无数据
                              </TableCell>
                         </TableRow>
                    )}
               </TableBody>
          </Table>
     )
}
