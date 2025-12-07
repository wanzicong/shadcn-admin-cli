import { useEffect, useState } from 'react'
import { ChevronLeftIcon, ChevronRightIcon, DoubleArrowLeftIcon, DoubleArrowRightIcon } from '@radix-ui/react-icons'
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
     // ============= 本地状态管理 =============
     const [pagination, setPagination] = useState<PaginationState>({
          // 后端分页 1 逻辑修改
          pageIndex: (searchParam.page as number) ? (searchParam.page as number) -1 : 0,
          pageSize: (searchParam.page_size as number) || 10,
     })
     const [sorting, setSorting] = useState<SortingState>([])
     const [rowSelection, setRowSelection] = useState<RowSelectionState>({})
     const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])

     //  ============= 表格列字段定义 =============
     const columns: ColumnDef<User>[] = useCommonTableCols()

     // ============= 表格实例创建 =============
     // 定义表格配置选项，提供完整的类型安全
     const tableOptions: TableOptions<User> = {
          data, // 表格数据
          columns, // 列定义
          state: {
               sorting, // 排序状态
               pagination, // 分页状态
               rowSelection, // 行选择状态
               columnFilters, // 列过滤状态
          },
          pageCount: totalPages, // 总页数
          rowCount: total, // 总行数
          getCoreRowModel: getCoreRowModel(), // 核心表格功能
          getPaginationRowModel: getPaginationRowModel(), // 启用分页
          getSortedRowModel: getSortedRowModel(), // 启用排序
          getFilteredRowModel: getFilteredRowModel(), // 启用筛选
          manualPagination: true, // 手动分页（服务端分页）
          manualSorting: true,
          manualFiltering: true,
          enableRowSelection: true, // 启用行选择
          enableMultiRowSelection: true, // 启用多行选择
          enableColumnFilters: true, // 启用列过滤
          onSortingChange: setSorting, // 排序变化处理
          onPaginationChange: setPagination, // 分页变化处理
          onRowSelectionChange: setRowSelection, // 行选择变化处理
          onColumnFiltersChange: setColumnFilters, // 列过滤变化处理
     }

     // eslint-disable-next-line react-hooks/incompatible-library
     const table: TanstackTable<User> = useReactTable<User>(tableOptions)

     useEffect(() => {
          searchChange({
               ...searchParam,
               page: pagination.pageIndex + 1,
               page_size: pagination.pageSize,
          })
     }, [pagination])

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
     // React Table内部使用0-based，但显示时转换为1-based
     const currentPageIndex = table.getState().pagination.pageIndex
     const currentPage = currentPageIndex + 1 // 转换为1-based用于显示
     const totalPages = table.getPageCount()

     // 注意：这里currentPage已经是1-based了，所以直接传入
     const pageNumbers = getPageNumbers(currentPage, totalPages)

     return (
          <div className={cn('flex items-center justify-between overflow-clip px-2', '@max-2xl/content:flex-col-reverse @max-2xl/content:gap-4')}>
               {/* 左侧区域 */}
               <div className='flex w-full items-center justify-between'>
                    <div className='flex w-[100px] items-center justify-center text-sm font-medium @2xl/content:hidden'>
                         Page {currentPage} of {totalPages}
                    </div>
                    <div className='flex items-center gap-2 @max-2xl/content:flex-row-reverse'>
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
                         <p className='hidden text-sm font-medium sm:block'>每页数量</p>
                    </div>
               </div>

               {/* 右侧区域 */}
               <div className='flex items-center sm:space-x-6 lg:space-x-8'>
                    <div className='flex w-[100px] items-center justify-center text-sm font-medium @max-3xl/content:hidden'>
                         第 {currentPage} 页 / 共 {totalPages}
                    </div>

                    <div className='flex items-center space-x-2'>
                         {/* 首页按钮：注意传递给setPageIndex的参数是0-based */}
                         <Button
                              variant='outline'
                              className='size-8 p-0 @max-md/content:hidden'
                              onClick={() => table.setPageIndex(0)}  // 0代表第一页
                              disabled={!table.getCanPreviousPage()}
                         >
                              <span className='sr-only'>跳转到第一页</span>
                              <DoubleArrowLeftIcon className='h-4 w-4' />
                         </Button>

                         <Button variant='outline' className='size-8 p-0' onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>
                              <span className='sr-only'>跳转到上一页</span>
                              <ChevronLeftIcon className='h-4 w-4' />
                         </Button>

                         {pageNumbers.map((pageNumber, index) => (
                              <div key={`${pageNumber}-${index}`} className='flex items-center'>
                                   {pageNumber === '...' ? (
                                        <span className='text-muted-foreground px-1 text-sm'>...</span>
                                   ) : (
                                        // 注意：pageNumber是1-based，需要减1来设置给React Table
                                        <Button
                                             variant={currentPage === pageNumber ? 'default' : 'outline'}
                                             className='h-8 min-w-8 px-2'
                                             onClick={() => table.setPageIndex((pageNumber as number) - 1)}
                                        >
                                             <span className='sr-only'>Go to page {pageNumber}</span>
                                             {pageNumber}
                                        </Button>
                                   )}
                              </div>
                         ))}

                         <Button variant='outline' className='size-8 p-0' onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
                              <span className='sr-only'>下一页</span>
                              <ChevronRightIcon className='h-4 w-4' />
                         </Button>

                         {/* 末页按钮：注意传递给setPageIndex的参数是0-based */}
                         <Button
                              variant='outline'
                              className='size-8 p-0 @max-md/content:hidden'
                              onClick={() => table.setPageIndex(table.getPageCount() - 1)}  // 最后一页是totalPages-1
                              disabled={!table.getCanNextPage()}
                         >
                              <span className='sr-only'>上一页</span>
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
function useCommonTableCols(): ColumnDef<User>[] {
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
