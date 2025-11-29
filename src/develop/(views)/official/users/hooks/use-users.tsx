import React from 'react'

// 从 context 文件导入类型和上下文
import { UsersContext, type UsersContextType } from '../context/users-context.tsx'

// 用户管理状态Hook - 用于在组件中访问用户管理的共享状态
export const useUsers = (): UsersContextType => {
     const usersContext = React.useContext(UsersContext)

     // 确保该Hook只在UsersProvider内部使用
     if (!usersContext) {
          throw new Error('useUsers has to be used within <UsersContext>')
     }

     return usersContext
}