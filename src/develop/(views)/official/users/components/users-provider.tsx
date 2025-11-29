import React, { useState } from 'react'
import useDialogState from '@/develop/(hooks)/use-dialog-state.tsx'
import { type User } from '../data/schema.ts'
import { UsersContext } from '../context/users-context.tsx'

// 用户管理状态提供者组件 - 管理用户模块的所有对话框状态和当前操作的用户数据
export function UsersProvider({ children }: { children: React.ReactNode }) {
     // 管理当前打开的对话框状态
     const [open, setOpen] = useDialogState<UsersDialogType>(null)
     // 管理当前选中的用户数据，用于编辑和删除操作
     const [currentRow, setCurrentRow] = useState<User | null>(null)

     return <UsersContext value={{ open, setOpen, currentRow, setCurrentRow }}>{children}</UsersContext>
}
