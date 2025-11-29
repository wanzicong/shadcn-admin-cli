import React from 'react'
import { type TasksContextType } from './tasks-context-types.tsx'

// 创建任务上下文
export const TasksContext = React.createContext<TasksContextType | null>(null)