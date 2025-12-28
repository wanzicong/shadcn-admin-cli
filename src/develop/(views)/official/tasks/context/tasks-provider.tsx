import React, { useState } from 'react'
import useDialogState from '@/develop/(hooks)/use-dialog-state.tsx'
import { type Task } from '@/develop/(views)/official/tasks/services/data/schema.ts'
import type { TasksDialogType } from './tasks-context-types.tsx'
import { TasksContext } from './tasks-context.tsx'

// 任务提供者组件 - 为所有子组件提供共享状态
export function TasksProvider({ children }: { children: React.ReactNode }) {
     // 对话框状态管理 - 管理不同类型对话框的打开/关闭
     const [open, setOpen] = useDialogState<TasksDialogType>(null)

     // 当前任务状态管理 - 存储当前正在编辑或删除的任务
     const [currentRow, setCurrentRow] = useState<Task | null>(null)

     // 返回任务上下文提供者
     return <TasksContext value={{ open, setOpen, currentRow, setCurrentRow }}>{children}</TasksContext>
}
