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
     Table as TanstackTable,
} from '@tanstack/react-table'
import { Main } from '@/develop/(layout)/main.tsx'
import { cn } from '@/develop/(lib)/utils.ts'
import { usersApi } from '@/develop/(services)/api'
import type { User, UserQueryParams } from '@/develop/(services)/api/types'
import { Badge } from '@/components/ui/badge.tsx'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table.tsx'

export const Route = createFileRoute('/_authenticated/demos/')({
     component: RouteComponent,
})

function RouteComponent() {
     const route = getRouteApi('/_authenticated/demos/')
     const navigate = route.useNavigate()
     // 获取查询参数
     // const params = route.useParams()
     const search = route.useSearch()
     // 查询数据
     const { data, isLoading, isError } = useQuery({
          queryKey: ['demos', search],
          queryFn: () => usersApi.getUsers(search as UserQueryParams),
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

     const searchChange = async () => {
          await navigate({
               search: {
                    page: 1,
                    page_size: 1,
               },
               params: {
                    sort: 1,
                    page: 2,
               },
          })
     }

     const userData = data.list
     const total = data.total
     const totalPages = data.totalPages

     return (
          <Main>
               <TableDemo data={userData} total={total} totalPages={totalPages} searchParam={search} searchChange={searchChange} />
          </Main>
     )
}

type TableProps = {
     data: User[]
     total: number
     totalPages: number
     searchParam: Record<string, unknown>
     searchChange: () => Promise<void>
}

function TableDemo({ data, total, totalPages, searchParam, searchChange }: TableProps) {
     // ============= 本地状态管理 =============
     const [sorting, setSorting] = useState<SortingState>([])
     const [rowSelection, setRowSelection] = useState<RowSelectionState>({})
     const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
     const [pagination, setPagination] = useState<PaginationState>({
          pageIndex: (searchParam.page as number) ? (searchParam.page as number) - 1 : 0,
          pageSize: (searchParam.page_size as number) || 10,
     })

     //  ============= 表格列字段定义 =============
     const columns: ColumnDef<User>[] = [
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

     const CommonDataTable = ({ table }: { table: TanstackTable<User> }) => {
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
                                   <TableCell colSpan={columns.length} className='h-24 text-center'>
                                        暂无数据
                                   </TableCell>
                              </TableRow>
                         )}
                    </TableBody>
               </Table>
          )
     }

     return (
          <div className='space-y-4'>
               <div className='flex items-center justify-between'>
                    <div>
                         <h3 className='text-lg font-semibold'>用户管理演示</h3>
                         <p className='text-muted-foreground text-sm'>搜索信息: {JSON.stringify(searchParam)}</p>
                    </div>
                    <button onClick={searchChange} className='rounded-md bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700'>
                         设置参数
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
                    <CommonDataTable table={table} />
               </div>
          </div>
     )
}
