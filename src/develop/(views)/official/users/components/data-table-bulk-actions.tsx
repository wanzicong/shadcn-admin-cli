import { useState } from 'react'
import { type Table } from '@tanstack/react-table'
import { DataTableBulkActions as BulkActionsToolbar } from '@/develop/(components)/data-table'
import { sleep } from '@/develop/(lib)/utils.ts'
import { Trash2, UserX, UserCheck, Mail } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button.tsx'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip.tsx'
import { type User } from '../data/schema.ts'
import { UsersMultiDeleteDialog } from './users-multi-delete-dialog.tsx'

/**
 * 数据表格批量操作组件的属性类型定义
 * 支持泛型以适配不同的数据类型
 */
type DataTableBulkActionsProps<TData> = {
     table: Table<TData> // TanStack Table 实例
}

/**
 * 数据表格批量操作组件
 * 提供用户批量操作功能：邀请、激活、停用、删除
 * 支持操作确认和状态反馈
 */
export function DataTableBulkActions<TData>({ table }: DataTableBulkActionsProps<TData>) {
     // 控制删除确认对话框的显示状态
     const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
     // 获取当前选中的所有行数据
     const selectedRows = table.getFilteredSelectedRowModel().rows

     /**
      * 批量修改用户状态处理函数
      * @param status - 目标状态（'active' 激活 | 'inactive' 停用）
      */
     const handleBulkStatusChange = (status: 'active' | 'inactive') => {
          // 将选中行转换为用户数据类型
          const selectedUsers = selectedRows.map((row) => row.original as User)

          // 使用 toast.promise 显示异步操作状态和结果
          toast.promise(sleep(2000), {
               loading: `${status === 'active' ? 'Activating' : 'Deactivating'} users...`,
               success: () => {
                    // 操作成功后清空选中状态
                    table.resetRowSelection()
                    const action = status === 'active' ? 'Activated' : 'Deactivated'
                    const plural = selectedUsers.length > 1 ? 's' : ''
                    return `${action} ${selectedUsers.length} user${plural}`
               },
               error: `Error ${status === 'active' ? 'activating' : 'deactivating'} users`,
          })

          // 清空选中状态
          table.resetRowSelection()
     }

     /**
      * 批量邀请用户处理函数
      * 向选中的用户发送邀请
      */
     const handleBulkInvite = () => {
          // 将选中行转换为用户数据类型
          const selectedUsers = selectedRows.map((row) => row.original as User)

          // 使用 toast.promise 显示异步操作状态和结果
          toast.promise(sleep(2000), {
               loading: 'Inviting users...',
               success: () => {
                    // 操作成功后清空选中状态
                    table.resetRowSelection()
                    const plural = selectedUsers.length > 1 ? 's' : ''
                    return `Invited ${selectedUsers.length} user${plural}`
               },
               error: 'Error inviting users',
          })

          // 清空选中状态
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
                                   aria-label='Invite selected users'
                                   title='Invite selected users'
                              >
                                   <Mail />
                                   <span className='sr-only'>Invite selected users</span>
                              </Button>
                         </TooltipTrigger>
                         <TooltipContent>
                              <p>Invite selected users</p>
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
                                   aria-label='Activate selected users'
                                   title='Activate selected users'
                              >
                                   <UserCheck />
                                   <span className='sr-only'>Activate selected users</span>
                              </Button>
                         </TooltipTrigger>
                         <TooltipContent>
                              <p>Activate selected users</p>
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
                                   aria-label='Deactivate selected users'
                                   title='Deactivate selected users'
                              >
                                   <UserX />
                                   <span className='sr-only'>Deactivate selected users</span>
                              </Button>
                         </TooltipTrigger>
                         <TooltipContent>
                              <p>Deactivate selected users</p>
                         </TooltipContent>
                    </Tooltip>

                    {/* 批量删除按钮 */}
                    <Tooltip>
                         <TooltipTrigger asChild>
                              <Button
                                   variant='destructive' // 使用危险样式
                                   size='icon'
                                   onClick={() => setShowDeleteConfirm(true)}
                                   className='size-8'
                                   aria-label='Delete selected users'
                                   title='Delete selected users'
                              >
                                   <Trash2 />
                                   <span className='sr-only'>Delete selected users</span>
                              </Button>
                         </TooltipTrigger>
                         <TooltipContent>
                              <p>Delete selected users</p>
                         </TooltipContent>
                    </Tooltip>
               </BulkActionsToolbar>

               {/* 批量删除确认对话框 */}
               <UsersMultiDeleteDialog
                    table={table}
                    open={showDeleteConfirm}
                    onOpenChange={setShowDeleteConfirm}
               />
          </>
     )
}
