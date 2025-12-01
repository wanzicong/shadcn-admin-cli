import React, { useState } from 'react'
import useDialogState from '@/develop/(hooks)/use-dialog-state.tsx'
import { type UsersDialogType } from './users-context-types.tsx'
import { type User } from '../data/schema.ts'
import { UsersContext } from './users-context.tsx'

// 导入 API Hooks
import {
     useUsers,
     useCreateUser,
     useUpdateUser,
     useDeleteUser,
     useBulkDeleteUsers,
     useInviteUser,
     useActivateUser,
     useSuspendUser,
     useUserStats,
} from '@/develop/(services)/hooks/useUsersApi'
import type { UserQueryParams } from '@/develop/(services)/api/types'

// 用户管理状态提供者组件 - 集成 API 数据和操作
export function UsersProvider({ children }: { children: React.ReactNode }) {
     // 现有的对话框状态管理
     const [open, setOpen] = useDialogState<UsersDialogType>(null)
     const [currentRow, setCurrentRow] = useState<User | null>(null)

     // 查询参数状态
     const [queryParams, setQueryParams] = useState<UserQueryParams>({
          page: 1,
          page_size: 10,
          sort_by: 'created_at',
          sort_order: 'desc',
     })

     // API 数据和操作
     const usersQuery = useUsers(queryParams)
     const userStatsQuery = useUserStats()

     // Mutations
     const createUserMutation = useCreateUser()
     const updateUserMutation = useUpdateUser()
     const deleteUserMutation = useDeleteUser()
     const bulkDeleteUsersMutation = useBulkDeleteUsers()
     const inviteUserMutation = useInviteUser()
     const activateUserMutation = useActivateUser()
     const suspendUserMutation = useSuspendUser()

     // 处理查询参数变化
     const handleQueryParamsChange = (newParams: Partial<UserQueryParams>) => {
          setQueryParams((prev: UserQueryParams) => ({ ...prev, ...newParams }))
     }

     // 处理页面变化
     const handlePageChange = (page: number) => {
          handleQueryParamsChange({ page })
     }

     // 处理搜索
     const handleSearch = (search: string) => {
          handleQueryParamsChange({ search, page: 1 })
     }

     // 处理排序
     const handleSort = (sortBy: string, sortOrder: 'asc' | 'desc') => {
          handleQueryParamsChange({
               sort_by: sortBy as UserQueryParams['sort_by'],
               sort_order: sortOrder,
               page: 1
          })
     }

     // 刷新数据
     const refetch = () => {
          usersQuery.refetch()
          userStatsQuery.refetch()
     }

     return (
          <UsersContext
               value={{
                    // 现有状态
                    open,
                    setOpen,
                    currentRow,
                    setCurrentRow,

                    // API 数据
                    users: usersQuery.data?.list || [],
                    userStats: userStatsQuery.data,
                    isLoading: usersQuery.isLoading,
                    isStatsLoading: userStatsQuery.isLoading,
                    error: usersQuery.error,
                    statsError: userStatsQuery.error,

                    // 分页信息
                    pagination: {
                         page: usersQuery.data?.page || 1,
                         pageSize: usersQuery.data?.pageSize || 10,
                         total: usersQuery.data?.total || 0,
                         totalPages: usersQuery.data?.totalPages || 0,
                    },

                    // 查询参数
                    queryParams,
                    onQueryParamsChange: handleQueryParamsChange,
                    onPageChange: handlePageChange,
                    onSearch: handleSearch,
                    onSort: handleSort,

                    // 操作方法
                    createUser: createUserMutation.mutate,
                    updateUser: updateUserMutation.mutate,
                    deleteUser: deleteUserMutation.mutate,
                    bulkDeleteUsers: bulkDeleteUsersMutation.mutate,
                    inviteUser: inviteUserMutation.mutate,
                    activateUser: activateUserMutation.mutate,
                    suspendUser: suspendUserMutation.mutate,

                    // 加载状态
                    isCreating: createUserMutation.isPending,
                    isUpdating: updateUserMutation.isPending,
                    isDeleting: deleteUserMutation.isPending,
                    isBulkDeleting: bulkDeleteUsersMutation.isPending,

                    // 刷新方法
                    refetch,
               }}
          >
               {children}
          </UsersContext>
     )
}
