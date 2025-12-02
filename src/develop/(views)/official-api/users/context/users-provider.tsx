import React, { useState, useEffect, useMemo } from 'react'
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
import type { UserQueryParams, UserStatus, UserRole } from '@/develop/(services)/api/types'

// UsersProvider 属性类型
type UsersProviderProps = {
     children: React.ReactNode
     initialQueryParams?: Record<string, unknown> // 从 URL 传入的初始查询参数
}

// 用户管理状态提供者组件 - 集成 API 数据和操作
export function UsersProvider({ children, initialQueryParams }: UsersProviderProps) {
     // 现有的对话框状态管理
     const [open, setOpen] = useDialogState<UsersDialogType>(null)
     const [currentRow, setCurrentRow] = useState<User | null>(null)

     // 将 URL 参数转换为 API 查询参数格式
     const convertUrlParamsToQueryParams = React.useCallback((urlParams: Record<string, unknown>): UserQueryParams => {
          const params: UserQueryParams = {
               page: typeof urlParams.page === 'number' ? urlParams.page : 1,
               page_size: typeof urlParams.pageSize === 'number' ? urlParams.pageSize : 10,
               // 后端期望 sort_by 默认值是 "createdAt"（驼峰命名），不是 "created_at"
               sort_by: typeof urlParams.sort_by === 'string' ? urlParams.sort_by : 'createdAt',
               sort_order: (urlParams.sort_order as 'asc' | 'desc') || 'desc',
          }

          // 处理搜索参数（username 映射到 search）
          if (typeof urlParams.username === 'string' && urlParams.username.trim()) {
               params.search = urlParams.username.trim()
          }

          // 处理状态筛选（URL 中是数组，但后端期望单个值，取第一个）
          // 当状态筛选变化时，如果 URL 中没有明确指定 page，则重置页码到第 1 页
          const hasStatusFilter = Array.isArray(urlParams.status) && urlParams.status.length > 0 || typeof urlParams.status === 'string'
          if (hasStatusFilter) {
               if (Array.isArray(urlParams.status) && urlParams.status.length > 0) {
                    params.status = urlParams.status[0] as UserStatus
               } else if (typeof urlParams.status === 'string') {
                    params.status = urlParams.status as UserStatus
               }
               // 如果 URL 中没有明确指定 page（筛选变化时通常会被重置），则使用第 1 页
               if (urlParams.page === undefined) {
                    params.page = 1
               }
          }

          // 处理角色筛选（URL 中是数组，但后端期望单个值，取第一个）
          // 当角色筛选变化时，如果 URL 中没有明确指定 page，则重置页码到第 1 页
          const hasRoleFilter = Array.isArray(urlParams.role) && urlParams.role.length > 0 || typeof urlParams.role === 'string'
          if (hasRoleFilter) {
               if (Array.isArray(urlParams.role) && urlParams.role.length > 0) {
                    params.role = urlParams.role[0] as UserRole
               } else if (typeof urlParams.role === 'string') {
                    params.role = urlParams.role as UserRole
               }
               // 如果 URL 中没有明确指定 page（筛选变化时通常会被重置），则使用第 1 页
               if (urlParams.page === undefined) {
                    params.page = 1
               }
          }

          return params
     }, [])

     // 查询参数状态 - 从 URL 参数初始化
     const [queryParams, setQueryParams] = useState<UserQueryParams>(() => {
          if (initialQueryParams) {
               return convertUrlParamsToQueryParams(initialQueryParams)
          }
          return {
               page: 1,
               page_size: 10,
               sort_by: 'createdAt', // 后端期望驼峰命名
               sort_order: 'desc',
          }
     })

     // 将 URL 参数转换为稳定的查询参数对象
     const urlQueryParams = useMemo(() => {
          if (initialQueryParams) {
               return convertUrlParamsToQueryParams(initialQueryParams)
          }
          return null
     }, [
          initialQueryParams?.page,
          initialQueryParams?.pageSize,
          initialQueryParams?.sort_by,
          initialQueryParams?.sort_order,
          initialQueryParams?.username,
          // 使用 JSON.stringify 来稳定数组依赖
          initialQueryParams?.status ? JSON.stringify(initialQueryParams.status) : undefined,
          initialQueryParams?.role ? JSON.stringify(initialQueryParams.role) : undefined,
          convertUrlParamsToQueryParams,
     ])

     // 当 URL 参数变化时，同步更新 queryParams
     useEffect(() => {
          if (urlQueryParams) {
               setQueryParams((prev) => {
                    // 深度比较参数变化
                    const statusChanged = 
                         (Array.isArray(prev.status) && Array.isArray(urlQueryParams.status) 
                              ? JSON.stringify([...prev.status].sort()) !== JSON.stringify([...urlQueryParams.status].sort())
                              : prev.status !== urlQueryParams.status)
                    const roleChanged = 
                         (Array.isArray(prev.role) && Array.isArray(urlQueryParams.role)
                              ? JSON.stringify([...prev.role].sort()) !== JSON.stringify([...urlQueryParams.role].sort())
                              : prev.role !== urlQueryParams.role)
                    
                    const hasChanges = 
                         prev.page !== urlQueryParams.page ||
                         prev.page_size !== urlQueryParams.page_size ||
                         prev.sort_by !== urlQueryParams.sort_by ||
                         prev.sort_order !== urlQueryParams.sort_order ||
                         prev.search !== urlQueryParams.search ||
                         statusChanged ||
                         roleChanged
                    
                    return hasChanges ? urlQueryParams : prev
               })
          }
     }, [urlQueryParams])

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
          // 后端期望驼峰命名（createdAt），不需要转换
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
                         totalPages: usersQuery.data?.totalPages || Math.ceil((usersQuery.data?.total || 0) / (usersQuery.data?.pageSize || 10)),
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
                    isInviting: inviteUserMutation.isPending,

                    // 刷新方法
                    refetch,
               }}
          >
               {children}
          </UsersContext>
     )
}
