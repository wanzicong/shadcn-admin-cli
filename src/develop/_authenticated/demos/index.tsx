import { useState } from 'react'
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
// import { decodeQueryParams, encodeQueryParams } from '@/develop/(lib)/url-utils.ts'
import { cn } from '@/develop/(lib)/utils.ts'
import { usersApi } from '@/develop/(services)/api'
import type { User, UserQueryParams } from '@/develop/(services)/api/types'
import { Badge } from '@/components/ui/badge.tsx'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table.tsx'

type TablePageProps = {
     data: User[]
     total: number
     totalPages: number
     // searchParam: Record<string, unknown>
     searchParam: UserQueryParams
     searchChange: (searchParam: UserQueryParams) => Promise<void>
}

/**
 *  路由信息
 */
export const Route = createFileRoute('/_authenticated/demos/')({
     component: RouteComponent,
     // validateSearch: (search: Record<string, unknown>): UserQueryParams => {
     //      // 解码URL参数
     //      const decoded = decodeQueryParams(search)
     //
     //      return {
     //           page: typeof decoded.page === 'string' ? parseInt(decoded.page, 10) : typeof decoded.page === 'number' ? decoded.page : undefined,
     //           page_size:
     //                typeof decoded.page_size === 'string'
     //                     ? parseInt(decoded.page_size, 10)
     //                     : typeof decoded.page_size === 'number'
     //                       ? decoded.page_size
     //                       : undefined,
     //           search: typeof decoded.search === 'string' ? decoded.search : undefined,
     //           status: decoded.status as UserQueryParams['status'],
     //           role: decoded.role as UserQueryParams['role'],
     //           sort_by: typeof decoded.sort_by === 'string' ? decoded.sort_by : undefined,
     //           sort_order: decoded.sort_order === 'asc' || decoded.sort_order === 'desc' ? decoded.sort_order : undefined,
     //      }
     // },
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

     const userData = data.list
     const total = data.total
     const totalPages = data.totalPages

     return (
          <Main>
               <TablePage data={userData}
                          total={total}
                          totalPages={totalPages}
                          searchParam={searchParam}
                          searchChange={searchChange}
               />
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
          pageIndex: (searchParam.page as number) ? (searchParam.page as number) - 1 : 0,
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
          </div>
     )
}

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
