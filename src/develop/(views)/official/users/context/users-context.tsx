import React from 'react'
import { type UsersContextType } from './users-context-types.tsx'

// 创建用户上下文
export const UsersContext = React.createContext<UsersContextType | null>(null)
