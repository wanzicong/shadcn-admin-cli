import { ArrowDownIcon, ArrowUpIcon, CaretSortIcon, EyeNoneIcon } from '@radix-ui/react-icons'
import { type Column } from '@tanstack/react-table'
import { cn } from '@/develop/(lib)/utils.ts'
import { Button } from '@/components/ui/button.tsx'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu.tsx'

/**
 * 表格列标题组件的 Props 类型定义
 * @template TData 表格数据的类型
 * @template TValue 列值的类型
 */
type DataTableColumnHeaderProps<TData, TValue> = React.HTMLAttributes<HTMLDivElement> & {
     column: Column<TData, TValue>
     title: string
}

/**
 * 数据表格列标题组件
 *
 * 提供列标题的排序和隐藏功能，包括：
 * - 列排序（升序/降序）
 * - 列隐藏功能
 * - 排序状态指示（图标）
 * - 下拉菜单操作
 *
 * @template TData 表格数据的类型
 * @template TValue 列值的类型
 * @param props 组件属性
 * @param props.column TanStack Table 列对象
 * @param props.title 列标题文本
 * @param props.className 自定义样式类名
 * @returns 列标题组件
 */
export function DataTableColumnHeader<TData, TValue>({ column, title, className }: DataTableColumnHeaderProps<TData, TValue>) {
     // 如果列不支持排序，直接返回标题文本
     if (!column.getCanSort()) {
          return <div className={cn(className)}>{title}</div>
     }

     return (
          <div className={cn('flex items-center space-x-2', className)}>
               {/* 下拉菜单：包含排序和隐藏选项 */}
               <DropdownMenu>
                    {/* 触发按钮：显示列标题和排序状态图标 */}
                    <DropdownMenuTrigger asChild>
                         <Button variant='ghost' size='sm' className='data-[state=open]:bg-accent h-8'>
                              <span>{title}</span>
                              {/* 根据排序状态显示不同的图标 */}
                              {column.getIsSorted() === 'desc' ? (
                                   // 降序：显示向下箭头
                                   <ArrowDownIcon className='ms-2 h-4 w-4' />
                              ) : column.getIsSorted() === 'asc' ? (
                                   // 升序：显示向上箭头
                                   <ArrowUpIcon className='ms-2 h-4 w-4' />
                              ) : (
                                   // 未排序：显示排序图标
                                   <CaretSortIcon className='ms-2 h-4 w-4' />
                              )}
                         </Button>
                    </DropdownMenuTrigger>

                    {/* 下拉菜单内容 */}
                    <DropdownMenuContent align='start'>
                         {/* 升序排序选项 */}
                         <DropdownMenuItem onClick={() => column.toggleSorting(false)}>
                              <ArrowUpIcon className='text-muted-foreground/70 size-3.5' />
                              升序
                         </DropdownMenuItem>

                         {/* 降序排序选项 */}
                         <DropdownMenuItem onClick={() => column.toggleSorting(true)}>
                              <ArrowDownIcon className='text-muted-foreground/70 size-3.5' />
                              降序
                         </DropdownMenuItem>

                         {/* 如果列可以隐藏，显示隐藏选项 */}
                         {column.getCanHide() && (
                              <>
                                   <DropdownMenuSeparator />
                                   {/* 隐藏列选项 */}
                                   <DropdownMenuItem onClick={() => column.toggleVisibility(false)}>
                                        <EyeNoneIcon className='text-muted-foreground/70 size-3.5' />
                                        隐藏
                                   </DropdownMenuItem>
                              </>
                         )}
                    </DropdownMenuContent>
               </DropdownMenu>
          </div>
     )
}
