import { DotsHorizontalIcon } from '@radix-ui/react-icons'
import { type Row } from '@tanstack/react-table'
import { Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button.tsx'
import {
     DropdownMenu,
     DropdownMenuContent,
     DropdownMenuItem,
     DropdownMenuRadioGroup,
     DropdownMenuRadioItem,
     DropdownMenuSeparator,
     DropdownMenuShortcut,
     DropdownMenuSub,
     DropdownMenuSubContent,
     DropdownMenuSubTrigger,
     DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu.tsx'
import { labels } from '../../data/data.tsx'
import { taskSchema } from '../../data/schema.ts'
import { useTasks } from '../../context/use-tasks.tsx'

type DataTableRowActionsProps<TData> = {
     row: Row<TData>
}

// 表格行操作组件 - 为单个任务行提供上下文操作菜单
export function DataTableRowActions<TData>({ row }: DataTableRowActionsProps<TData>) {
     // 解析并验证行数据为标准任务对象
     const task = taskSchema.parse(row.original)

     // 获取任务上下文操作函数
     const { setOpen, setCurrentRow } = useTasks()

     return (
          // 下拉菜单组件 - 提供上下文操作选项
          <DropdownMenu modal={false}>
               <DropdownMenuTrigger asChild>
                    <Button variant='ghost' className='data-[state=open]:bg-muted flex h-8 w-8 p-0'>
                         <DotsHorizontalIcon className='h-4 w-4' />
                         <span className='sr-only'>Open menu</span>
                    </Button>
               </DropdownMenuTrigger>

               <DropdownMenuContent align='end' className='w-[160px]'>
                    {/* 编辑任务 */}
                    <DropdownMenuItem
                         onClick={() => {
                              setCurrentRow(task)
                              setOpen('update')
                         }}
                    >
                         Edit
                    </DropdownMenuItem>

                    {/* 扩展功能 - 当前禁用 */}
                    <DropdownMenuItem disabled>Make a copy</DropdownMenuItem>
                    <DropdownMenuItem disabled>Favorite</DropdownMenuItem>

                    <DropdownMenuSeparator />

                    {/* 标签管理 */}
                    <DropdownMenuSub>
                         <DropdownMenuSubTrigger>Labels</DropdownMenuSubTrigger>
                         <DropdownMenuSubContent>
                              <DropdownMenuRadioGroup value={task.label}>
                                   {labels.map((label) => (
                                        <DropdownMenuRadioItem key={label.value} value={label.value}>
                                             {label.label}
                                        </DropdownMenuRadioItem>
                                   ))}
                              </DropdownMenuRadioGroup>
                         </DropdownMenuSubContent>
                    </DropdownMenuSub>

                    <DropdownMenuSeparator />

                    {/* 删除任务 */}
                    <DropdownMenuItem
                         onClick={() => {
                              setCurrentRow(task)
                              setOpen('delete')
                         }}
                    >
                         Delete
                         <DropdownMenuShortcut>
                              <Trash2 size={16} />
                         </DropdownMenuShortcut>
                    </DropdownMenuItem>
               </DropdownMenuContent>
          </DropdownMenu>
     )
}
