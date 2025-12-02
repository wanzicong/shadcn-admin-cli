import { type User } from '../data/schema.ts'
import type { UserQueryParams, UserCreate, UserUpdate, BulkDeleteRequest, UserInviteRequest, UserStats } from '@/develop/(services)/api/types'

// 用户对话框类型定义
export type UsersDialogType = 'invite' | 'add' | 'edit' | 'delete'

// 用户上下文类型定义
export type UsersContextType = {
     // 对话框状态
     open: UsersDialogType | null
     setOpen: (str: UsersDialogType | null) => void
     currentRow: User | null
     setCurrentRow: React.Dispatch<React.SetStateAction<User | null>>

     // API 数据
     users: User[]
     userStats?: UserStats
     isLoading: boolean
     isStatsLoading: boolean
     error: unknown
     statsError: unknown

     // 分页信息
     pagination: {
          page: number
          pageSize: number
          total: number
          totalPages: number
     }

     // 查询参数
     queryParams: UserQueryParams
     onQueryParamsChange: (params: Partial<UserQueryParams>) => void
     onPageChange: (page: number) => void
     onSearch: (search: string) => void
     onSort: (sortBy: string, sortOrder: 'asc' | 'desc') => void

     // 操作方法
     createUser: (data: UserCreate) => void
     updateUser: ({ userId, data }: { userId: string; data: UserUpdate }) => void
     deleteUser: (userId: string) => void
     bulkDeleteUsers: (data: BulkDeleteRequest) => void
     inviteUser: (data: UserInviteRequest) => void
     activateUser: (userId: string) => void
     suspendUser: (userId: string) => void

     // 加载状态
     isCreating: boolean
     isUpdating: boolean
     isDeleting: boolean
     isBulkDeleting: boolean
     isInviting: boolean

     // 刷新方法
     refetch: () => void
}
