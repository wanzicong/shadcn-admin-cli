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
     return (
          <DropdownMenu modal={false}>
               {/* 触发按钮：显示"View"文本和图标（移动端隐藏） */}
               <DropdownMenuTrigger asChild>
                    <Button variant='outline' size='sm' className='ms-auto hidden h-8 lg:flex'>
                         <MixerHorizontalIcon className='size-4' />
                         View
                    </Button>
               </DropdownMenuTrigger>

               {/* 下拉菜单内容 */}
               <DropdownMenuContent align='end' className='w-[150px]'>
                    <DropdownMenuLabel>Toggle columns</DropdownMenuLabel>
                    <DropdownMenuSeparator />

                    {/* 遍历所有可隐藏的列，生成复选框选项 */}
                    {table
                         .getAllColumns()
                         // 过滤：只显示有访问器函数且可以隐藏的列（排除操作列等）
                         .filter((column) => typeof column.accessorFn !== 'undefined' && column.getCanHide())
                         .map((column) => {
                              return (
                                   <DropdownMenuCheckboxItem
                                        key={column.id}
                                        className='capitalize'
                                        // 复选框状态：根据列的可见性设置
                                        checked={column.getIsVisible()}
                                        // 切换列的可见性
                                        onCheckedChange={(value) => column.toggleVisibility(!!value)}
                                   >
                                        {column.id}
                                   </DropdownMenuCheckboxItem>
                              )
                         })}
               </DropdownMenuContent>
          </DropdownMenu>
     )
}
