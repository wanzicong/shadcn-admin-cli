import * as React from 'react'
import { DropdownMenuTrigger } from '@radix-ui/react-dropdown-menu'
import { MixerHorizontalIcon } from '@radix-ui/react-icons'
import { type Table } from '@tanstack/react-table'
import { Button } from '@/components/ui/button.tsx'
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuLabel, DropdownMenuSeparator } from '@/components/ui/dropdown-menu.tsx'

/**
 * 列显示选项组件的 Props 类型定义
 * @template TData 表格数据的类型
 */
type DataTableViewOptionsProps<TData> = {
     table: Table<TData>
}

/**
 * 数据表格列显示选项组件
 *
 * 提供列显示/隐藏的控制功能，用户可以自定义表格显示的列，包括：
 * - 列显示/隐藏切换
 * - 复选框控制
 * - 下拉菜单界面
 * - 自动过滤可隐藏的列
 *
 * @template TData 表格数据的类型
 * @param props 组件属性
 * @param props.table TanStack Table 实例
 * @returns 列显示选项组件
 */
export function DataTableViewOptions<TData>({ table }: DataTableViewOptionsProps<TData>) {
     /**
      * 获取列的显示名称
      * 优先使用列定义的 header，如果没有则使用列 ID
      */
     const getColumnDisplayName = (column: unknown): string => {
          // 类型守卫：确保 column 是有效的列对象
          if (!column || typeof column !== 'object') return 'Unknown'

          const col = column as Record<string, unknown>

          // 尝试从 columnDef 中获取 header
          if (col.columnDef) {
               const columnDef = col.columnDef as Record<string, unknown>
               if (columnDef.header) {
                    // 如果 header 是字符串，直接返回
                    if (typeof columnDef.header === 'string') {
                         return columnDef.header
                    }
                    // 如果 header 是函数，尝试获取返回值
                    if (typeof columnDef.header === 'function') {
                         // 尝试调用函数获取标题
                         try {
                              const result = columnDef.header({ column })
                              // 如果结果是 React 元素，尝试提取文本
                              if (React.isValidElement(result)) {
                                   // 从 DataTableColumnHeader 的 title prop 获取
                                   if (result.props?.title && typeof result.props.title === 'string') {
                                        return result.props.title
                                   }
                                   // 如果有 children，尝试提取
                                   if (result.props?.children) {
                                        return String(result.props.children)
                                   }
                              }
                         } catch {
                              // 如果获取失败，使用列 ID
                         }
                    }
               }
          }

          // 默认返回列 ID（首字母大写）
          const colId = typeof col.id === 'string' ? col.id : 'Unknown'
          return colId.charAt(0).toUpperCase() + colId.slice(1)
     }

     return (
          <DropdownMenu modal={false}>
               {/* 触发按钮：显示"View"文本和图标（移动端隐藏） */}
               <DropdownMenuTrigger asChild>
                    <Button variant='outline' size='sm' className='ms-auto hidden h-8 lg:flex'>
                         <MixerHorizontalIcon className='size-4' />
                         查看
                    </Button>
               </DropdownMenuTrigger>

               {/* 下拉菜单内容 */}
               <DropdownMenuContent align='end' className='w-[150px]'>
                    <DropdownMenuLabel>字段列表</DropdownMenuLabel>
                    <DropdownMenuSeparator />

                    {/* 遍历所有可隐藏的列，生成复选框选项 */}
                    {table
                         .getAllColumns()
                         // 过滤：只显示有访问器函数且可以隐藏的列（排除操作列等）
                         .filter((column) => typeof column.accessorFn !== 'undefined' && column.getCanHide())
                         .map((column) => {
                              const displayName = getColumnDisplayName(column)

                              return (
                                   <DropdownMenuCheckboxItem
                                        key={column.id}
                                        className='capitalize'
                                        // 复选框状态：根据列的可见性设置
                                        checked={column.getIsVisible()}
                                        // 切换列的可见性
                                        onCheckedChange={(value) => column.toggleVisibility(!!value)}
                                   >
                                        {displayName}
                                   </DropdownMenuCheckboxItem>
                              )
                         })}
               </DropdownMenuContent>
          </DropdownMenu>
     )
}
