'use client'

import { useState } from 'react'
import { showSubmittedData } from '@/develop/(lib)/show-submitted-data.tsx'
import { AlertTriangle } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert.tsx'
import { Input } from '@/components/ui/input.tsx'
import { Label } from '@/components/ui/label.tsx'
import { ConfirmDialog } from '@/components/confirm-dialog.tsx'
import { type User } from '@/develop/(views)/official/users/services/data/schema.ts'

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

     /**
      * 处理删除确认操作
      * 验证用户输入的用户名是否正确，只有匹配才能执行删除
      */
     const handleDelete = () => {
          // 安全检查：确保输入的用户名与目标用户名完全一致
          if (value.trim() !== currentRow.username) return

          // 关闭对话框
          onOpenChange(false)
          // 显示已删除数据的提交信息（调试用）
          showSubmittedData(currentRow, 'The following user has been deleted:')
     }

     return (
          <ConfirmDialog
               open={open}
               onOpenChange={onOpenChange}
               handleConfirm={handleDelete}
               disabled={value.trim() !== currentRow.username} // 只有输入正确的用户名才能确认
               title={
                    <span className='text-destructive'>
                         <AlertTriangle className='stroke-destructive me-1 inline-block' size={18} /> 删除用户
                    </span>
               }
               desc={
                    <div className='space-y-4'>
                         {/* 删除确认信息 */}
                         <p className='mb-2'>
                              您确定要删除 <span className='font-bold'>{currentRow.username}</span> 吗？此操作将永久从系统中移除 角色为{' '}
                              <span className='font-bold'>{currentRow.role.toUpperCase()}</span> 的用户。此操作无法撤销。
                         </p>

                         {/* 安全确认输入 */}
                         <Label className='my-2'>
                              用户名：
                              <Input value={value} onChange={(e) => setValue(e.target.value)} placeholder='请输入用户名以确认删除。' />
                         </Label>

                         {/* 危险警告提示 */}
                         <Alert variant='destructive'>
                              <AlertTitle>警告！</AlertTitle>
                              <AlertDescription>请注意，此操作无法撤销。</AlertDescription>
                         </Alert>
                    </div>
               }
               confirmText='删除' // 确认按钮文本
               destructive // 使用危险样式（红色主题）
          />
     )
}
