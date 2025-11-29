// 导入必要的React Hooks和UI组件
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
     useReactTable, // React Table Hook
} from '@tanstack/react-table'
import { DataTablePagination, DataTableToolbar } from '@/develop/(components)/data-table'
import { useTableUrlState } from '@/develop/(hooks)/use-table-url-state.ts'
import { cn } from '@/develop/(lib)/utils.ts'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table.tsx'
import { priorities, statuses } from '../data/data.tsx'
import { type Task } from '../data/schema.ts'
import { DataTableBulkActions } from './actions/data-table-bulk-actions.tsx'
import { tasksColumns as columns } from './tasks-columns.tsx'

// 任务表格列定义

// 获取当前路由的API实例，用于访问路由搜索参数和导航功能
const route = getRouteApi('/_authenticated/official/tasks/')

// 定义组件属性类型
type DataTableProps = {
     data: Task[] // 任务数据数组
}

// 任务表格组件 - 使用TanStack Table实现的高级数据表格
export function TasksTable({ data }: DataTableProps) {
     // ==================== 本地UI状态管理 ====================
     // 这些状态仅在组件内部使用，不与URL同步
     const [rowSelection, setRowSelection] = useState({}) // 行选择状态
     const [sorting, setSorting] = useState<SortingState>([]) // 排序状态
     const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({}) // 列可见性状态

     // ==================== 注释：纯本地状态管理（不与URL同步） ====================
     // 如果需要本地状态管理，可以取消以下注释
     // const [globalFilter, onGlobalFilterChange] = useState('')             // 全局搜索过滤
     // const [columnFilters, onColumnFiltersChange] = useState<ColumnFiltersState>([]) // 列过滤状态
     // const [pagination, onPaginationChange] = useState<PaginationState>({ pageIndex: 0, pageSize: 10 }) // 分页状态

     // ==================== URL同步状态管理 ====================
     // 使用自定义Hook将表格状态与URL参数同步，实现状态持久化和分享功能
     const {
          globalFilter, // 全局搜索词
          onGlobalFilterChange, // 全局搜索更新函数
          columnFilters, // 列过滤器数组
          onColumnFiltersChange, // 列过滤器更新函数
          pagination, // 分页状态 { pageIndex, pageSize }
          onPaginationChange, // 分页更新函数
          ensurePageInRange, // 确保页码在有效范围内的函数
     } = useTableUrlState({
          search: route.useSearch(), // 获取当前URL搜索参数
          navigate: route.useNavigate(), // 获取路由导航函数
          pagination: {
               defaultPage: 1, // 默认页码
               defaultPageSize: 10, // 默认每页条数
          },
          globalFilter: {
               enabled: true, // 启用全局搜索
               key: 'filter', // URL参数中的搜索键名
          },
          columnFilters: [
               // 状态列过滤器配置
               {
                    columnId: 'status', // 表格中的列ID
                    searchKey: 'status', // URL参数中的键名
                    type: 'array', // 参数类型：数组（支持多选）
               },
               // 优先级列过滤器配置
               {
                    columnId: 'priority', // 表格中的列ID
                    searchKey: 'priority', // URL参数中的键名
                    type: 'array', // 参数类型：数组（支持多选）
               },
          ],
     })

     // ==================== TanStack Table 实例创建 ====================
     // 使用useReactTable Hook创建功能丰富的数据表格
     // eslint-disable-next-line react-hooks/incompatible-library
     const table = useReactTable({
          data, // 表格数据源
          columns, // 表格列定义
          // ==================== 表格状态配置 ====================
          state: {
               sorting, // 排序状态
               columnVisibility, // 列可见性状态
               rowSelection, // 行选择状态
               columnFilters, // 列过滤器状态（来自URL同步）
               globalFilter, // 全局搜索状态（来自URL同步）
               pagination, // 分页状态（来自URL同步）
          },
          // ==================== 表格功能配置 ====================
          enableRowSelection: true, // 启用行选择功能
          onRowSelectionChange: setRowSelection, // 行选择状态更新回调
          onSortingChange: setSorting, // 排序状态更新回调
          onColumnVisibilityChange: setColumnVisibility, // 列可见性状态更新回调

          // ==================== 自定义全局搜索函数 ====================
          // 支持按任务ID和任务标题进行搜索（不区分大小写）
          globalFilterFn: (row, _columnId, filterValue) => {
               const id = String(row.getValue('id')).toLowerCase() // 获取任务ID并转为小写
               const title = String(row.getValue('title')).toLowerCase() // 获取任务标题并转为小写
               const searchValue = String(filterValue).toLowerCase() // 搜索值转为小写

               // 搜索ID或标题是否包含搜索值
               return id.includes(searchValue) || title.includes(searchValue)
          },

          // ==================== Table 模型配置 ====================
          // 这些模型提供了表格的核心功能和性能优化
          getCoreRowModel: getCoreRowModel(), // 核心行模型 - 提供基础的行结构
          getFilteredRowModel: getFilteredRowModel(), // 过滤行模型 - 处理数据过滤
          getPaginationRowModel: getPaginationRowModel(), // 分页行模型 - 处理分页逻辑
          getSortedRowModel: getSortedRowModel(), // 排序行模型 - 处理数据排序
          getFacetedRowModel: getFacetedRowModel(), // 分面行模型 - 提供高级过滤功能
          getFacetedUniqueValues: getFacetedUniqueValues(), // 唯一值模型 - 为过滤器提供选项

          // ==================== 状态更新回调（与URL同步） ====================
          onPaginationChange, // 分页状态更新（同步到URL）
          onGlobalFilterChange, // 全局搜索更新（同步到URL）
          onColumnFiltersChange, // 列过滤器更新（同步到URL）
     })

     // ==================== 分页范围检查 ====================
     // 获取表格总页数
     const pageCount = table.getPageCount()

     // 确保当前页码在有效范围内，防止数据变化时页码超出范围
     useEffect(() => {
          ensurePageInRange(pageCount)
     }, [pageCount, ensurePageInRange])

     // ==================== 组件渲染 ====================
     return (
          <div
               // 使用cn工具函数合并样式类
               className={cn(
                    // 移动端适配：当工具栏可见时，为表格添加底部外边距
                    'max-sm:has-[div[role="toolbar"]]:mb-16',
                    // 布局样式：flex布局，占据剩余空间，列方向，间距4
                    'flex flex-1 flex-col gap-4'
               )}
          >
               {/* ==================== 表格工具栏 ==================== */}
               {/* 包含搜索框、过滤器、列显示控制等 */}
               <DataTableToolbar
                    table={table}
                    searchPlaceholder='Filter by title or ID...' // 搜索框占位符文本
                    filters={[
                         // 状态过滤器配置
                         {
                              columnId: 'status', // 对应表格列中的status字段
                              title: 'Status', // 过滤器显示标题
                              options: statuses, // 可选状态选项列表
                         },
                         // 优先级过滤器配置
                         {
                              columnId: 'priority', // 对应表格列中的priority字段
                              title: 'Priority', // 过滤器显示标题
                              options: priorities, // 可选优先级选项列表
                         },
                    ]}
               />

               {/* ==================== 表格主体 ==================== */}
               <div className='overflow-hidden rounded-md border'>
                    <Table>
                         {/* ==================== 表格头部 ==================== */}
                         <TableHeader>
                              {/* 遍历表头组，支持多级表头 */}
                              {table.getHeaderGroups().map((headerGroup) => (
                                   <TableRow key={headerGroup.id}>
                                        {/* 遍历每个表头单元格 */}
                                        {headerGroup.headers.map((header) => {
                                             return (
                                                  <TableHead
                                                       key={header.id}
                                                       colSpan={header.colSpan} // 支持列合并
                                                       // 合并来自列定义的样式类
                                                       className={cn(header.column.columnDef.meta?.className, header.column.columnDef.meta?.thClassName)}
                                                  >
                                                       {/* 占位符不渲染，否则渲染列标题内容 */}
                                                       {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                                                  </TableHead>
                                             )
                                        })}
                                   </TableRow>
                              ))}
                         </TableHeader>

                         {/* ==================== 表格主体内容 ==================== */}
                         <TableBody>
                              {/* 有数据时渲染表格行 */}
                              {table.getRowModel().rows?.length ? (
                                   table.getRowModel().rows.map((row) => (
                                        <TableRow
                                             key={row.id}
                                             // 标记选中的行，用于样式控制
                                             data-state={row.getIsSelected() && 'selected'}
                                        >
                                             {/* 渲染行中的每个单元格 */}
                                             {row.getVisibleCells().map((cell) => (
                                                  <TableCell
                                                       key={cell.id}
                                                       // 合并来自列定义的样式类
                                                       className={cn(cell.column.columnDef.meta?.className, cell.column.columnDef.meta?.tdClassName)}
                                                  >
                                                       {/* 使用flexRender渲染单元格内容，支持复杂的单元格组件 */}
                                                       {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                                  </TableCell>
                                             ))}
                                        </TableRow>
                                   ))
                              ) : (
                                   // 无数据时显示提示信息
                                   <TableRow>
                                        <TableCell colSpan={columns.length} className='h-24 text-center'>
                                             No results. {/* 无结果提示 */}
                                        </TableCell>
                                   </TableRow>
                              )}
                         </TableBody>
                    </Table>
               </div>

               {/* ==================== 表格底部组件 ==================== */}
               {/* 分页控件 */}
               <DataTablePagination table={table} className='mt-auto' />
               {/* 批量操作控件（选中多行时显示） */}
               <DataTableBulkActions table={table} />
          </div>
     )
}
