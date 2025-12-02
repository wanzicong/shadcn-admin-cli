'use client'

import { useState } from 'react'
import { AlertTriangle } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert.tsx'
import { Input } from '@/components/ui/input.tsx'
import { Label } from '@/components/ui/label.tsx'
import { ConfirmDialog } from '@/components/confirm-dialog.tsx'
import { type User } from '../../data/schema.ts'
import { useUsers } from '../../context/use-users.tsx'

/**
 * 用户删除对话框组件的属性类型定义
 */
type UserDeleteDialogProps = {
     open: boolean // 对话框显示状态
     onOpenChange: (open: boolean) => void // 对话框状态变更回调
     currentRow: User // 当前要删除的用户数据
}

/**
 * 用户删除对话框组件
 * 提供用户删除确认功能，需要用户输入用户名进行二次确认
 * 包含安全警告和信息展示
 */
export function UsersDeleteDialog({ open, onOpenChange, currentRow }: UserDeleteDialogProps) {
     // 状态：存储用户输入的确认用户名
     const [value, setValue] = useState('')
     
     // 从 Context 获取删除方法
     const { deleteUser, isDeleting } = useUsers()

     /**
      * 处理删除确认操作
      * 验证用户输入的用户名是否正确，只有匹配才能执行删除
      */
     const handleDelete = () => {
          // 安全检查：确保输入的用户名与目标用户名完全一致
          if (value.trim() !== currentRow.username) return

          // 调用 API 删除用户
          deleteUser(currentRow.id)
          
          // 关闭对话框
          onOpenChange(false)
          // 清空输入
          setValue('')
     }

     return (
          <ConfirmDialog
               open={open}
               onOpenChange={onOpenChange}
               handleConfirm={handleDelete}
               disabled={value.trim() !== currentRow.username || isDeleting} // 只有输入正确的用户名才能确认，且不在删除中
               title={
                    <span className='text-destructive'>
                         <AlertTriangle className='stroke-destructive me-1 inline-block' size={18} /> Delete User
                    </span>
               }
               desc={
                    <div className='space-y-4'>
                         {/* 删除确认信息 */}
                         <p className='mb-2'>
                              Are you sure you want to delete <span className='font-bold'>{currentRow.username}</span>? This action will permanently remove the
                              user with the role of <span className='font-bold'>{currentRow.role.toUpperCase()}</span> from the system. This cannot be undone.
                         </p>

                         {/* 安全确认输入 */}
                         <Label className='my-2'>
                              Username:
                              <Input value={value} onChange={(e) => setValue(e.target.value)} placeholder='Enter username to confirm deletion.' />
                         </Label>

                         {/* 危险警告提示 */}
                         <Alert variant='destructive'>
                              <AlertTitle>Warning!</AlertTitle>
                              <AlertDescription>Please be careful, this operation cannot be rolled back.</AlertDescription>
                         </Alert>
                    </div>
               }
               confirmText='Delete' // 确认按钮文本
               destructive // 使用危险样式（红色主题）
          />
     )
}
