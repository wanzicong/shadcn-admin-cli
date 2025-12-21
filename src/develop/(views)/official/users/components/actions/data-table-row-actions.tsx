import { DotsHorizontalIcon } from '@radix-ui/react-icons'
import { type Row } from '@tanstack/react-table'
import { Trash2, UserPen } from 'lucide-react'
import { Button } from '@/components/ui/button.tsx'
import {
     DropdownMenu,
     DropdownMenuContent,
     DropdownMenuItem,
     DropdownMenuSeparator,
     DropdownMenuShortcut,
     DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu.tsx'
import { useUsers } from '../../context/use-users.tsx'
import { type User } from '../../data/schema.ts'

type DataTableRowActionsProps = {
     row: Row<User>
}

// 数据表格行操作组件 - 为每行用户提供编辑和删除操作的下拉菜单
export function DataTableRowActions({ row }: DataTableRowActionsProps) {
     // 从用户状态上下文中获取操作函数
     const { setOpen, setCurrentRow } = useUsers()

     return (
          <>
               {/* 下拉菜单，设置 modal={false} 避免与全局对话框冲突 */}
               <DropdownMenu modal={false}>
                    {/* 触发按钮：三点菜单图标 */}
                    <DropdownMenuTrigger asChild>
                         <Button variant='ghost' className='data-[state=open]:bg-muted flex h-8 w-8 p-0' aria-label='操作菜单'>
                              <DotsHorizontalIcon className='h-4 w-4' />
                              <span className='sr-only'>Open menu</span>
                         </Button>
                    </DropdownMenuTrigger>

                    {/* 下拉菜单内容 */}
                    <DropdownMenuContent align='end' className='w-[160px]'>
                         {/* 编辑操作：打开编辑对话框 */}
                         <DropdownMenuItem
                              onClick={() => {
                                   setCurrentRow(row.original)
                                   setOpen('edit')
                              }}
                         >
                              编辑
                              <DropdownMenuShortcut>
                                   <UserPen size={16} />
                              </DropdownMenuShortcut>
                         </DropdownMenuItem>

                         {/* 分割线 */}
                         <DropdownMenuSeparator />

                         {/* 删除操作：打开删除确认对话框 */}
                         <DropdownMenuItem
                              onClick={() => {
                                   setCurrentRow(row.original)
                                   setOpen('delete')
                              }}
                              className='text-red-500!'
                         >
                              删除
                              <DropdownMenuShortcut>
                                   <Trash2 size={16} />
                              </DropdownMenuShortcut>
                         </DropdownMenuItem>
                    </DropdownMenuContent>
               </DropdownMenu>
          </>
     )
}
