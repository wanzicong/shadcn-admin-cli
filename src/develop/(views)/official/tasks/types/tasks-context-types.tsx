import { type Task } from '../data/schema.ts'

// 任务对话框类型定义
export type TasksDialogType = 'create' | 'update' | 'delete' | 'import'

// 任务上下文类型定义
export type TasksContextType = {
     // 当前打开的对话框类型，null表示没有打开的对话框
     open: TasksDialogType | null
     // 设置对话框状态的方法
     setOpen: (str: TasksDialogType | null) => void
     // 当前选中的任务对象，null表示没有选中的任务
     currentRow: Task | null
     // 设置当前选中任务的方法
     setCurrentRow: React.Dispatch<React.SetStateAction<Task | null>>
}