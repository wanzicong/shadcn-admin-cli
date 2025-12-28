import { useState } from 'react'
import { type Table } from '@tanstack/react-table'
import { DataTableBulkActions as BulkActionsToolbar } from '@/develop/(components)/data-table'
import { sleep } from '@/develop/(lib)/utils.ts'
import { Trash2, UserX, UserCheck, Mail } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button.tsx'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip.tsx'
import { type User } from '@/develop/(views)/official/users/services/data/schema.ts'
import { UsersMultiDeleteDialog } from '../dialogs/users-multi-delete-dialog.tsx'

type DataTableBulkActionsProps<TData> = {
     table: Table<TData>
}

// 数据表格批量操作组件 - 提供用户批量操作功能：邀请、激活、停用、删除
export function DataTableBulkActions<TData>({ table }: DataTableBulkActionsProps<TData>) {
     // 控制删除确认对话框的显示状态
     const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
     // 获取当前选中的所有行数据
     const selectedRows = table.getFilteredSelectedRowModel().rows

     // 批量修改用户状态处理函数
     const handleBulkStatusChange = (status: 'active' | 'inactive') => {
          const selectedUsers = selectedRows.map((row) => row.original as User)

          toast.promise(sleep(2000), {
               loading: `${status === 'active' ? '正在激活用户...' : '正在停用用户...'}`,
               success: () => {
                    table.resetRowSelection()
                    const action = status === 'active' ? '已激活' : '已停用'
                    return `成功${action} ${selectedUsers.length} 个用户`
               },
               error: `激活/停用用户时出错`,
          })

          table.resetRowSelection()
     }

     // 批量邀请用户处理函数
     const handleBulkInvite = () => {
          const selectedUsers = selectedRows.map((row) => row.original as User)

          toast.promise(sleep(2000), {
               loading: '邀请用户中...',
               success: () => {
                    table.resetRowSelection()
                    return `成功邀请 ${selectedUsers.length} 个用户`
               },
               error: '邀请用户时出错',
          })

          table.resetRowSelection()
     }

     return (
          <>
               {/* 批量操作工具栏 */}
               <BulkActionsToolbar table={table} entityName='user'>
                    {/* 批量邀请按钮 */}
                    <Tooltip>
                         <TooltipTrigger asChild>
                              <Button
                                   variant='outline'
                                   size='icon'
                                   onClick={handleBulkInvite}
                                   className='size-8'
                                   aria-label='邀请选择用户'
                                   title='邀请选择用户'
                              >
                                   <Mail />
                                   <span className='sr-only'>邀请选择用户</span>
                              </Button>
                         </TooltipTrigger>
                         <TooltipContent>
                              <p>邀请选择用户</p>
                         </TooltipContent>
                    </Tooltip>

                    {/* 批量激活按钮 */}
                    <Tooltip>
                         <TooltipTrigger asChild>
                              <Button
                                   variant='outline'
                                   size='icon'
                                   onClick={() => handleBulkStatusChange('active')}
                                   className='size-8'
                                   aria-label='激活选择用户'
                                   title='激活选择用户'
                              >
                                   <UserCheck />
                                   <span className='sr-only'>激活选择用户</span>
                              </Button>
                         </TooltipTrigger>
                         <TooltipContent>
                              <p>激活选择用户</p>
                         </TooltipContent>
                    </Tooltip>

                    {/* 批量停用按钮 */}
                    <Tooltip>
                         <TooltipTrigger asChild>
                              <Button
                                   variant='outline'
                                   size='icon'
                                   onClick={() => handleBulkStatusChange('inactive')}
                                   className='size-8'
                                   aria-label='停用选择用户'
                                   title='不邀请他们'
                              >
                                   <UserX />
                                   <span className='sr-only'>不邀请他们</span>
                              </Button>
                         </TooltipTrigger>
                         <TooltipContent>
                              <p>不邀请他们</p>
                         </TooltipContent>
                    </Tooltip>

                    {/* 批量删除按钮 */}
                    <Tooltip>
                         <TooltipTrigger asChild>
                              <Button
                                   variant='destructive'
                                   size='icon'
                                   onClick={() => setShowDeleteConfirm(true)}
                                   className='size-8'
                                   aria-label='删除选择用户'
                                   title='删除选择用户'
                              >
                                   <Trash2 />
                                   <span className='sr-only'>删除选择用户</span>
                              </Button>
                         </TooltipTrigger>
                         <TooltipContent>
                              <p>删除选择用户</p>
                         </TooltipContent>
                    </Tooltip>
               </BulkActionsToolbar>

               {/* 批量删除确认对话框 */}
               <UsersMultiDeleteDialog table={table} open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm} />
          </>
     )
}
