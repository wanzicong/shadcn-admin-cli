import React from 'react'

// 从 context 文件导入类型和上下文
import { TasksContext, } from './tasks-context.tsx'
import { type TasksContextType } from './tasks-context-types.tsx'

// 任务上下文Hook - 用于在组件中访问任务上下文
export const useTasks = (): TasksContextType => {
     // 获取任务上下文
     const tasksContext = React.useContext(TasksContext)

     // 错误处理 - 确保在正确的Provider内使用
     if (!tasksContext) {
          throw new Error('useTasks has to be used within <TasksContext>')
     }

     // 返回上下文值
     return tasksContext
}