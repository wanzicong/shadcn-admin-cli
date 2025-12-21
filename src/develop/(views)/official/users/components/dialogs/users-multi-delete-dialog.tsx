'use client'

import { useState } from 'react'
import { type Table } from '@tanstack/react-table'
import { sleep } from '@/develop/(lib)/utils.ts'
import { AlertTriangle } from 'lucide-react'
import { toast } from 'sonner'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert.tsx'
import { Input } from '@/components/ui/input.tsx'
import { Label } from '@/components/ui/label.tsx'
import { ConfirmDialog } from '@/components/confirm-dialog.tsx'

type UserMultiDeleteDialogProps<TData> = {
     open: boolean
     onOpenChange: (open: boolean) => void
     table: Table<TData>
}

const CONFIRM_WORD = 'DELETE'

export function UsersMultiDeleteDialog<TData>({ open, onOpenChange, table }: UserMultiDeleteDialogProps<TData>) {
     const [value, setValue] = useState('')

     const selectedRows = table.getFilteredSelectedRowModel().rows

     const handleDelete = () => {
          if (value.trim() !== CONFIRM_WORD) {
               toast.error(`请输入"${CONFIRM_WORD}"以确认。`)
               return
          }

          onOpenChange(false)

          toast.promise(sleep(2000), {
               loading: '正在删除用户...',
               success: () => {
                    table.resetRowSelection()
                    return `已删除 ${selectedRows.length} 个${selectedRows.length > 1 ? '用户' : '用户'}`
               },
               error: '错误',
          })
     }

     return (
          <ConfirmDialog
               open={open}
               onOpenChange={onOpenChange}
               handleConfirm={handleDelete}
               disabled={value.trim() !== CONFIRM_WORD}
               title={
                    <span className='text-destructive'>
                         <AlertTriangle className='stroke-destructive me-1 inline-block' size={18} /> 删除 {selectedRows.length}{' '}
                         个用户
                    </span>
               }
               desc={
                    <div className='space-y-4'>
                         <p className='mb-2'>
                              您确定要删除所选用户吗？ <br />
                              此操作无法撤销。
                         </p>

                         <Label className='my-4 flex flex-col items-start gap-1.5'>
                              <span className=''>通过输入"{CONFIRM_WORD}"确认：</span>
                              <Input value={value} onChange={(e) => setValue(e.target.value)} placeholder={`请输入"${CONFIRM_WORD}"以确认。`} />
                         </Label>

                         <Alert variant='destructive'>
                              <AlertTitle>警告！</AlertTitle>
                              <AlertDescription>请注意，此操作无法撤销。</AlertDescription>
                         </Alert>
                    </div>
               }
               confirmText='删除'
               destructive
          />
     )
}
