'use client'

import { useState } from 'react'
import { type Table } from '@tanstack/react-table'
import { AlertTriangle } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert.tsx'
import { Input } from '@/components/ui/input.tsx'
import { Label } from '@/components/ui/label.tsx'
import { ConfirmDialog } from '@/components/confirm-dialog.tsx'
import { useUsers } from '../../context/use-users.tsx'
import { type User } from '../../data/schema.ts'

type UserMultiDeleteDialogProps<TData> = {
     open: boolean
     onOpenChange: (open: boolean) => void
     table: Table<TData>
}

const CONFIRM_WORD = 'DELETE'

export function UsersMultiDeleteDialog<TData>({ open, onOpenChange, table }: UserMultiDeleteDialogProps<TData>) {
     const [value, setValue] = useState('')
     
     // 从 Context 获取批量删除方法
     const { bulkDeleteUsers, isBulkDeleting } = useUsers()

     const selectedRows = table.getFilteredSelectedRowModel().rows

     const handleDelete = () => {
          if (value.trim() !== CONFIRM_WORD) {
               return
          }

          // 获取选中的用户 ID
          const selectedUsers = selectedRows.map((row) => row.original as User)
          const userIds = selectedUsers.map((user) => user.id)

          // 调用 API 批量删除
          bulkDeleteUsers({ ids: userIds })

          // 关闭对话框
          onOpenChange(false)
          // 清空输入
          setValue('')
          // 重置选择
          table.resetRowSelection()
     }

     return (
          <ConfirmDialog
               open={open}
               onOpenChange={onOpenChange}
               handleConfirm={handleDelete}
               disabled={value.trim() !== CONFIRM_WORD || isBulkDeleting}
               title={
                    <span className='text-destructive'>
                         <AlertTriangle className='stroke-destructive me-1 inline-block' size={18} /> Delete {selectedRows.length}{' '}
                         {selectedRows.length > 1 ? 'users' : 'user'}
                    </span>
               }
               desc={
                    <div className='space-y-4'>
                         <p className='mb-2'>
                              Are you sure you want to delete the selected users? <br />
                              This action cannot be undone.
                         </p>

                         <Label className='my-4 flex flex-col items-start gap-1.5'>
                              <span className=''>Confirm by typing "{CONFIRM_WORD}":</span>
                              <Input value={value} onChange={(e) => setValue(e.target.value)} placeholder={`Type "${CONFIRM_WORD}" to confirm.`} />
                         </Label>

                         <Alert variant='destructive'>
                              <AlertTitle>Warning!</AlertTitle>
                              <AlertDescription>Please be careful, this operation can not be rolled back.</AlertDescription>
                         </Alert>
                    </div>
               }
               confirmText='Delete'
               destructive
          />
     )
}
