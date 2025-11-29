import React, { useState } from 'react'
import useDialogState from '@/develop/(hooks)/use-dialog-state.tsx'
import { type User } from '../data/schema.ts'

// 定义用户管理模块支持的所有对话框类型
type UsersDialogType = 'invite' | 'add' | 'edit' | 'delete'

// 定义用户上下文的数据结构，用于在用户管理相关组件间共享状态
type UsersContextType = {
     open: UsersDialogType | null                                    // 当前打开的对话框类型
     setOpen: (str: UsersDialogType | null) => void              // 设置打开的对话框
     currentRow: User | null                                       // 当前选中的用户行数据
     setCurrentRow: React.Dispatch<React.SetStateAction<User | null>> // 设置当前选中的用户
}

// 创建用户上下文，初始值为 null
const UsersContext = React.createContext<UsersContextType | null>(null)

/**
 * 用户管理状态提供者组件
 * 管理用户模块的所有对话框状态和当前操作的用户数据
 */
export function UsersProvider({ children }: { children: React.ReactNode }) {
     // 管理当前打开的对话框状态
     const [open, setOpen] = useDialogState<UsersDialogType>(null)
     // 管理当前选中的用户数据，用于编辑和删除操作
     const [currentRow, setCurrentRow] = useState<User | null>(null)

     return (
          <UsersContext value={{ open, setOpen, currentRow, setCurrentRow }}>
               {children}
          </UsersContext>
     )
}

/**
 * 用户管理状态 Hook
 * 用于在组件中访问用户管理的共享状态
 * @throws Error 如果不在 UsersProvider 内使用会抛出错误
 */
export const useUsers = () => {
     const usersContext = React.useContext(UsersContext)

     // 确保该 Hook 只在 UsersProvider 内部使用
     if (!usersContext) {
          throw new Error('useUsers has to be used within <UsersContext>')
     }

     return usersContext
}
