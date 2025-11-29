import { type User } from '../data/schema.ts'

// 用户对话框类型定义
export type UsersDialogType = 'invite' | 'add' | 'edit' | 'delete'

// 用户上下文类型定义
export type UsersContextType = {
     open: UsersDialogType | null
     setOpen: (str: UsersDialogType | null) => void
     currentRow: User | null
     setCurrentRow: React.Dispatch<React.SetStateAction<User | null>>
}
