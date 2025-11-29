import { Cross2Icon } from '@radix-ui/react-icons'
import { type Table } from '@tanstack/react-table'
import { Button } from '@/components/ui/button.tsx'
import { Input } from '@/components/ui/input.tsx'
import { DataTableFacetedFilter } from './faceted-filter.tsx'
import { DataTableViewOptions } from './view-options.tsx'

/**
 * 表格工具栏组件的 Props 类型定义
 * @template TData 表格数据的类型
 */
type DataTableToolbarProps<TData> = {
     table: Table<TData>
     searchPlaceholder?: string
     searchKey?: string
     filters?: {
          columnId: string
          title: string
          options: {
               label: string
               value: string
               icon?: React.ComponentType<{ className?: string }>
          }[]
     }[]
}

/**
 * 数据表格工具栏组件
 *
 * 提供表格的搜索、过滤和重置功能，包括：
 * - 全局搜索或列搜索
 * - 多选过滤（Faceted Filter）
 * - 重置所有过滤条件
 * - 列显示选项控制
 *
 * @template TData 表格数据的类型
 * @param props 组件属性
 * @param props.table TanStack Table 实例
 * @param props.searchPlaceholder 搜索框占位符文本，默认为 'Filter...'
 * @param props.searchKey 指定列的搜索键，如果提供则进行列搜索，否则进行全局搜索
 * @param props.filters 过滤配置数组，每个配置包含列ID、标题和选项列表
 * @returns 工具栏组件
 */
export function DataTableToolbar<TData>({ table, searchPlaceholder = 'Filter...', searchKey, filters = [] }: DataTableToolbarProps<TData>) {
     // 检查是否有任何过滤条件被应用（列过滤或全局过滤）
     const isFiltered = table.getState().columnFilters.length > 0 || table.getState().globalFilter

     return (
          <div className='flex items-center justify-between'>
               {/* 左侧工具栏区域：搜索框、过滤器和重置按钮 */}
               <div className='flex flex-1 flex-col-reverse items-start gap-y-2 sm:flex-row sm:items-center sm:space-x-2'>
                    {/* 搜索输入框：根据 searchKey 决定是列搜索还是全局搜索 */}
                    {searchKey ? (
                         // 列搜索模式：搜索指定列的值
                         <Input
                              placeholder={searchPlaceholder}
                              value={(table.getColumn(searchKey)?.getFilterValue() as string) ?? ''}
                              onChange={(event) => table.getColumn(searchKey)?.setFilterValue(event.target.value)}
                              className='h-8 w-[150px] lg:w-[250px]'
                         />
                    ) : (
                         // 全局搜索模式：搜索所有列的值
                         <Input
                              placeholder={searchPlaceholder}
                              value={table.getState().globalFilter ?? ''}
                              onChange={(event) => table.setGlobalFilter(event.target.value)}
                              className='h-8 w-[150px] lg:w-[250px]'
                         />
                    )}

                    {/* 多选过滤器组：渲染每个配置的过滤器 */}
                    <div className='flex gap-x-2'>
                         {filters.map((filter) => {
                              // 获取对应的列对象
                              const column = table.getColumn(filter.columnId)
                              // 如果列不存在，跳过渲染
                              if (!column) return null
                              // 渲染多选过滤器组件
                              return <DataTableFacetedFilter key={filter.columnId} column={column} title={filter.title} options={filter.options} />
                         })}
                    </div>

                    {/* 重置按钮：当有任何过滤条件时显示，点击后清除所有过滤 */}
                    {isFiltered && (
                         <Button
                              variant='ghost'
                              onClick={() => {
                                   // 重置所有列过滤
                                   table.resetColumnFilters()
                                   // 重置全局过滤
                                   table.setGlobalFilter('')
                              }}
                              className='h-8 px-2 lg:px-3'
                         >
                              Reset
                              <Cross2Icon className='ms-2 h-4 w-4' />
                         </Button>
                    )}
               </div>

               {/* 右侧工具栏区域：列显示选项控制 */}
               <DataTableViewOptions table={table} />
          </div>
     )
}
