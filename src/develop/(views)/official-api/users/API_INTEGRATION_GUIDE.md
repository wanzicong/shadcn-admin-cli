# Users 模块 API 接入详细实施步骤

本文档提供将 Users 模块从静态数据迁移到真实 API 的完整实施步骤。

## 📋 实施概览

### 目标
- 替换静态数据为真实 API 调用
- 保持现有 UI 组件和交互逻辑不变
- 实现完整的 CRUD 操作和数据同步
- 提供良好的用户体验和错误处理

### 技术栈
- **HTTP 客户端**: Axios (已配置)
- **状态管理**: TanStack Query + Zustand
- **表单处理**: React Hook Form + Zod
- **UI 组件**: Shadcn UI

---

## 🚀 阶段 1: API 服务层实现

### 步骤 1.1: 定义 API 类型

**文件**: `src/develop/(services)/api/types.ts` (如果不存在则创建)

```typescript
/**
 * Users 模块相关类型定义
 */

// 用户基础信息
export interface User {
  id: string
  name: string
  email: string
  avatar?: string
  role: UserRole
  status: UserStatus
  created_at: string
  updated_at: string
  last_login_at?: string
}

// 用户角色枚举
export type UserRole = 'superadmin' | 'admin' | 'manager' | 'cashier'

// 用户状态枚举
export type UserStatus = 'active' | 'inactive' | 'invited' | 'suspended'

// 创建用户请求
export interface UserCreate {
  name: string
  email: string
  role: UserRole
  status?: UserStatus
  password?: string
}

// 更新用户请求
export interface UserUpdate {
  name?: string
  email?: string
  role?: UserRole
  status?: UserStatus
  password?: string
}

// 查询参数
export interface UserQueryParams {
  page?: number
  pageSize?: number
  search?: string
  role?: UserRole
  status?: UserStatus
  sortBy?: 'name' | 'email' | 'created_at' | 'last_login_at'
  sortOrder?: 'asc' | 'desc'
}

// 分页响应
export interface PaginatedResponse<T> {
  list: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

// 用户统计信息
export interface UserStats {
  total: number
  active: number
  inactive: number
  invited: number
  suspended: number
  byRole: Record<UserRole, number>
}

// 邀请用户请求
export interface UserInviteRequest {
  email: string
  role: UserRole
  message?: string
}

// 邀请响应
export interface UserInviteResponse {
  message: string
  inviteId: string
}

// 批量操作请求
export interface BulkDeleteRequest {
  userIds: string[]
  reason?: string
}

// 批量操作响应
export interface BulkOperationResponse {
  deleted_count: number
  failed_count: number
  failed_items?: Array<{
    id: string
    error: string
  }>
}
```

### 步骤 1.2: 实现 Users API 服务

**文件**: `src/develop/(services)/api/users.ts`

```typescript
import { post, get, put, del } from '../request'
import type {
  User,
  UserCreate,
  UserUpdate,
  UserQueryParams,
  PaginatedResponse,
  UserInviteRequest,
  UserInviteResponse,
  BulkDeleteRequest,
  BulkOperationResponse,
  UserStats,
} from './types'

/**
 * 用户管理 API 服务类
 */
export class UsersService {
  /**
   * 获取用户列表
   * @param params 查询参数
   */
  static async getUsers(params?: UserQueryParams): Promise<PaginatedResponse<User>> {
    return post<PaginatedResponse<User>>('/users/list', params)
  }

  /**
   * 获取单个用户详情
   * @param userId 用户ID
   */
  static async getUser(userId: string): Promise<User> {
    return post<User>('/users/detail', { user_id: userId })
  }

  /**
   * 创建新用户
   * @param data 用户数据
   */
  static async createUser(data: UserCreate): Promise<User> {
    return post<User>('/users/create', { user_data: data })
  }

  /**
   * 更新用户信息
   * @param userId 用户ID
   * @param data 更新数据
   */
  static async updateUser(userId: string, data: UserUpdate): Promise<User> {
    return post<User>('/users/update', { user_id: userId, user_data: data })
  }

  /**
   * 删除单个用户
   * @param userId 用户ID
   */
  static async deleteUser(userId: string): Promise<{ message: string }> {
    return post<{ message: string }>('/users/delete', { user_id: userId })
  }

  /**
   * 批量删除用户
   * @param data 批量删除数据
   */
  static async bulkDeleteUsers(data: BulkDeleteRequest): Promise<BulkOperationResponse> {
    return post<BulkOperationResponse>('/users/bulk-delete', data)
  }

  /**
   * 邀请用户
   * @param data 邀请数据
   */
  static async inviteUser(data: UserInviteRequest): Promise<UserInviteResponse> {
    return post<UserInviteResponse>('/users/invite', data)
  }

  /**
   * 激活用户
   * @param userId 用户ID
   */
  static async activateUser(userId: string): Promise<{ message: string }> {
    return post<{ message: string }>('/users/activate', { user_id: userId })
  }

  /**
   * 暂停用户
   * @param userId 用户ID
   */
  static async suspendUser(userId: string): Promise<{ message: string }> {
    return post<{ message: string }>('/users/suspend', { user_id: userId })
  }

  /**
   * 重置用户密码
   * @param userId 用户ID
   * @param newPassword 新密码
   */
  static async resetPassword(userId: string, newPassword: string): Promise<{ message: string }> {
    return post<{ message: string }>('/users/reset-password', {
      user_id: userId,
      new_password: newPassword,
    })
  }

  /**
   * 获取用户统计信息
   * @param params 查询参数
   */
  static async getUserStats(params?: Record<string, unknown>): Promise<UserStats> {
    return post<UserStats>('/users/stats', params)
  }

  /**
   * 搜索用户
   * @param query 搜索关键词
   * @param limit 结果限制
   */
  static async searchUsers(query: string, limit = 10): Promise<User[]> {
    return post<User[]>('/users/search', { query, limit })
  }

  /**
   * 导出用户数据
   * @param params 导出参数
   */
  static async exportUsers(params?: UserQueryParams): Promise<{ download_url: string }> {
    return post<{ download_url: string }>('/users/export', params)
  }
}

/**
 * 导出便捷方法
 */
export const usersApi = {
  getUsers: UsersService.getUsers,
  getUser: UsersService.getUser,
  createUser: UsersService.createUser,
  updateUser: UsersService.updateUser,
  deleteUser: UsersService.deleteUser,
  bulkDeleteUsers: UsersService.bulkDeleteUsers,
  inviteUser: UsersService.inviteUser,
  activateUser: UsersService.activateUser,
  suspendUser: UsersService.suspendUser,
  resetPassword: UsersService.resetPassword,
  getUserStats: UsersService.getUserStats,
  searchUsers: UsersService.searchUsers,
  exportUsers: UsersService.exportUsers,
}
```

---

## 🎣 阶段 2: TanStack Query Hooks

### 步骤 2.1: 创建用户管理 Hooks

**文件**: `src/develop/(services)/hooks/useUsersApi.ts`

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import type {
  User,
  UserCreate,
  UserUpdate,
  UserQueryParams,
  UserInviteRequest,
  BulkDeleteRequest,
  UserStats,
} from '../api/types'
import { usersApi } from '../api/users'

/**
 * 用户管理 API Hooks
 */

// 查询 Keys 常量
const USER_QUERY_KEYS = {
  all: ['users'] as const,
  lists: () => [...USER_QUERY_KEYS.all, 'list'] as const,
  list: (params?: UserQueryParams) => [...USER_QUERY_KEYS.lists(), params] as const,
  details: () => [...USER_QUERY_KEYS.all, 'detail'] as const,
  detail: (id: string) => [...USER_QUERY_KEYS.details(), id] as const,
  stats: () => [...USER_QUERY_KEYS.all, 'stats'] as const,
} as const

// 获取用户列表
export function useUsers(params?: UserQueryParams) {
  return useQuery({
    queryKey: USER_QUERY_KEYS.list(params),
    queryFn: () => usersApi.getUsers(params),
    staleTime: 5 * 60 * 1000, // 5分钟
    gcTime: 10 * 60 * 1000, // 10分钟
  })
}

// 获取单个用户
export function useUser(userId: string) {
  return useQuery({
    queryKey: USER_QUERY_KEYS.detail(userId),
    queryFn: () => usersApi.getUser(userId),
    enabled: !!userId,
    staleTime: 2 * 60 * 1000, // 2分钟
  })
}

// 获取用户统计信息
export function useUserStats() {
  return useQuery({
    queryKey: USER_QUERY_KEYS.stats(),
    queryFn: () => usersApi.getUserStats(),
    staleTime: 10 * 60 * 1000, // 10分钟
    refetchInterval: 5 * 60 * 1000, // 5分钟自动刷新
  })
}

// 搜索用户
export function useUserSearch(query: string, enabled = true) {
  return useQuery({
    queryKey: ['user-search', query],
    queryFn: () => usersApi.searchUsers(query),
    enabled: enabled && query.length > 0,
    staleTime: 30 * 1000, // 30秒
  })
}

// 创建用户
export function useCreateUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: UserCreate) => usersApi.createUser(data),
    onSuccess: (newUser) => {
      // 刷新用户列表
      queryClient.invalidateQueries({ queryKey: USER_QUERY_KEYS.lists() })
      queryClient.invalidateQueries({ queryKey: USER_QUERY_KEYS.stats() })

      // 可选：添加新用户到缓存
      queryClient.setQueryData(
        USER_QUERY_KEYS.detail(newUser.id),
        newUser
      )

      toast.success('用户创建成功')
    },
    onError: (error: unknown) => {
      const errorMessage = error instanceof Error ? error.message : '用户创建失败'
      toast.error(errorMessage)
    },
  })
}

// 更新用户
export function useUpdateUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ userId, data }: { userId: string; data: UserUpdate }) =>
      usersApi.updateUser(userId, data),
    onSuccess: (updatedUser, { userId }) => {
      // 更新详情缓存
      queryClient.setQueryData(
        USER_QUERY_KEYS.detail(userId),
        updatedUser
      )

      // 刷新用户列表
      queryClient.invalidateQueries({ queryKey: USER_QUERY_KEYS.lists() })
      queryClient.invalidateQueries({ queryKey: USER_QUERY_KEYS.stats() })

      toast.success('用户更新成功')
    },
    onError: (error: unknown) => {
      const errorMessage = error instanceof Error ? error.message : '用户更新失败'
      toast.error(errorMessage)
    },
  })
}

// 删除用户
export function useDeleteUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (userId: string) => usersApi.deleteUser(userId),
    onSuccess: (_, userId) => {
      // 从缓存中移除用户
      queryClient.removeQueries({ queryKey: USER_QUERY_KEYS.detail(userId) })

      // 刷新用户列表
      queryClient.invalidateQueries({ queryKey: USER_QUERY_KEYS.lists() })
      queryClient.invalidateQueries({ queryKey: USER_QUERY_KEYS.stats() })

      toast.success('用户删除成功')
    },
    onError: (error: unknown) => {
      const errorMessage = error instanceof Error ? error.message : '用户删除失败'
      toast.error(errorMessage)
    },
  })
}

// 批量删除用户
export function useBulkDeleteUsers() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: BulkDeleteRequest) => usersApi.bulkDeleteUsers(data),
    onSuccess: (result) => {
      // 刷新用户列表
      queryClient.invalidateQueries({ queryKey: USER_QUERY_KEYS.lists() })
      queryClient.invalidateQueries({ queryKey: USER_QUERY_KEYS.stats() })

      // 显示结果
      if (result.failed_count > 0) {
        toast.warning(`部分删除失败，成功删除 ${result.deleted_count} 个，失败 ${result.failed_count} 个`)
      } else {
        toast.success(`批量删除成功，共删除 ${result.deleted_count} 个用户`)
      }
    },
    onError: (error: unknown) => {
      const errorMessage = error instanceof Error ? error.message : '批量删除失败'
      toast.error(errorMessage)
    },
  })
}

// 邀请用户
export function useInviteUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: UserInviteRequest) => usersApi.inviteUser(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: USER_QUERY_KEYS.lists() })
      queryClient.invalidateQueries({ queryKey: USER_QUERY_KEYS.stats() })
      toast.success('用户邀请成功')
    },
    onError: (error: unknown) => {
      const errorMessage = error instanceof Error ? error.message : '用户邀请失败'
      toast.error(errorMessage)
    },
  })
}

// 激活用户
export function useActivateUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (userId: string) => usersApi.activateUser(userId),
    onSuccess: (_, userId) => {
      queryClient.invalidateQueries({ queryKey: USER_QUERY_KEYS.detail(userId) })
      queryClient.invalidateQueries({ queryKey: USER_QUERY_KEYS.lists() })
      queryClient.invalidateQueries({ queryKey: USER_QUERY_KEYS.stats() })
      toast.success('用户激活成功')
    },
    onError: (error: unknown) => {
      const errorMessage = error instanceof Error ? error.message : '用户激活失败'
      toast.error(errorMessage)
    },
  })
}

// 暂停用户
export function useSuspendUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (userId: string) => usersApi.suspendUser(userId),
    onSuccess: (_, userId) => {
      queryClient.invalidateQueries({ queryKey: USER_QUERY_KEYS.detail(userId) })
      queryClient.invalidateQueries({ queryKey: USER_QUERY_KEYS.lists() })
      queryClient.invalidateQueries({ queryKey: USER_QUERY_KEYS.stats() })
      toast.success('用户暂停成功')
    },
    onError: (error: unknown) => {
      const errorMessage = error instanceof Error ? error.message : '用户暂停失败'
      toast.error(errorMessage)
    },
  })
}

// 重置密码
export function useResetPassword() {
  return useMutation({
    mutationFn: ({ userId, newPassword }: { userId: string; newPassword: string }) =>
      usersApi.resetPassword(userId, newPassword),
    onSuccess: () => {
      toast.success('密码重置成功')
    },
    onError: (error: unknown) => {
      const errorMessage = error instanceof Error ? error.message : '密码重置失败'
      toast.error(errorMessage)
    },
  })
}

// 导出用户
export function useExportUsers() {
  return useMutation({
    mutationFn: (params?: UserQueryParams) => usersApi.exportUsers(params),
    onSuccess: (result) => {
      // 可以自动触发下载或显示下载链接
      window.open(result.download_url, '_blank')
      toast.success('用户数据导出成功')
    },
    onError: (error: unknown) => {
      const errorMessage = error instanceof Error ? error.message : '导出失败'
      toast.error(errorMessage)
    },
  })
}
```

---

## 🔄 阶段 3: 组件集成

### 步骤 3.1: 更新 Users Provider

**文件**: `src/develop/(views)/official-api/users/context/users-provider.tsx`

```typescript
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
  useResetPassword,
  useUserStats,
  type UserQueryParams,
} from '@/develop/(services)/hooks/useUsersApi'

// 用户管理状态提供者组件 - 集成 API 数据和操作
export function UsersProvider({ children }: { children: React.ReactNode }) {
  // 现有的对话框状态管理
  const [open, setOpen] = useDialogState<UsersDialogType>(null)
  const [currentRow, setCurrentRow] = useState<User | null>(null)

  // 查询参数状态
  const [queryParams, setQueryParams] = useState<UserQueryParams>({
    page: 1,
    pageSize: 10,
    sortBy: 'created_at',
    sortOrder: 'desc',
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
  const resetPasswordMutation = useResetPassword()

  // 处理查询参数变化
  const handleQueryParamsChange = (newParams: Partial<UserQueryParams>) => {
    setQueryParams(prev => ({ ...prev, ...newParams }))
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
      sortBy: sortBy as UserQueryParams['sortBy'],
      sortOrder,
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
        resetPassword: resetPasswordMutation.mutate,

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
```

### 步骤 3.2: 更新 Context 类型定义

**文件**: `src/develop/(views)/official-api/users/context/users-context-types.tsx`

```typescript
import { type User } from '../data/schema'
import { type UsersDialogType } from './users-context-types'
import type { UserStats, UserQueryParams } from '@/develop/(services)/api/types'

// 扩展 Users Context 类型
export interface UsersContextType {
  // 现有状态
  open: UsersDialogType
  setOpen: (dialog: UsersDialogType) => void
  currentRow: User | null
  setCurrentRow: (row: User | null) => void

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
  createUser: (data: any) => void
  updateUser: ({ userId, data }: { userId: string; data: any }) => void
  deleteUser: (userId: string) => void
  bulkDeleteUsers: (data: any) => void
  inviteUser: (data: any) => void
  activateUser: (userId: string) => void
  suspendUser: (userId: string) => void
  resetPassword: ({ userId, newPassword }: { userId: string; newPassword: string }) => void

  // 加载状态
  isCreating: boolean
  isUpdating: boolean
  isDeleting: boolean
  isBulkDeleting: boolean

  // 刷新方法
  refetch: () => void
}
```

### 步骤 3.3: 更新表格组件

**文件**: `src/develop/(views)/official-api/users/components/users-table.tsx`

```typescript
import * as React from 'react'
import { DataTable, type DataTableProps } from '@/components/data-table'
import { columns } from './users-columns'
import { useUsersContext } from '../context/use-users'
import { DataTableSkeleton } from '@/components/data-table-skeleton'
import { ErrorMessage } from '@/components/error-message'

interface UsersTableProps extends Partial<DataTableProps<User>> {
  className?: string
}

export function UsersTable({ className, ...props }: UsersTableProps) {
  const {
    users,
    isLoading,
    error,
    pagination,
    onPageChange,
    onSort,
    queryParams,
  } = useUsersContext()

  // 处理表格变化
  const handleSortingChange: DataTableProps<User>['onSortingChange'] = (sorting) => {
    if (sorting.length > 0) {
      const { id, desc } = sorting[0]
      onSort(id as string, desc ? 'desc' : 'asc')
    }
  }

  const handlePaginationChange: DataTableProps<User>['onPaginationChange'] = (updater) => {
    if (typeof updater === 'function') {
      const newPagination = updater({
        pageIndex: pagination.page - 1, // 转换为 0-based index
        pageSize: pagination.pageSize,
      })
      onPageChange(newPagination.pageIndex + 1) // 转换回 1-based index
    }
  }

  // 加载状态
  if (isLoading) {
    return <DataTableSkeleton />
  }

  // 错误状态
  if (error) {
    return (
      <ErrorMessage
        title="加载失败"
        description="无法加载用户数据，请稍后重试"
        onRetry={() => window.location.reload()}
      />
    )
  }

  return (
    <DataTable<User>
      data={users}
      columns={columns}
      className={className}
      {...props}
      // 分页配置
      pageCount={pagination.totalPages}
      manualPagination
      pagination={{
        pageIndex: pagination.page - 1,
        pageSize: pagination.pageSize,
      }}
      onPaginationChange={handlePaginationChange}

      // 排序配置
      manualSorting
      sorting={[
        {
          id: queryParams.sortBy || 'created_at',
          desc: queryParams.sortOrder === 'desc',
        },
      ]}
      onSortingChange={handleSortingChange}

      // 其他配置
      rowCount={pagination.total}
      defaultColumn={{
        minSize: 0,
        maxSize: 1200,
        size: 160,
      }}
    />
  )
}
```

### 步骤 3.4: 更新操作对话框

**文件**: `src/develop/(views)/official-api/users/components/users-action-dialog.tsx`

```typescript
import * as React from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useUsersContext } from '../context/use-users'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2 } from 'lucide-react'

// 表单验证 Schema
const userFormSchema = z.object({
  name: z.string().min(1, '姓名不能为空').max(50, '姓名不能超过50个字符'),
  email: z.string().email('请输入有效的邮箱地址'),
  role: z.enum(['superadmin', 'admin', 'manager', 'cashier']),
  status: z.enum(['active', 'inactive', 'invited', 'suspended']).optional(),
  password: z.string().min(6, '密码至少6个字符').optional(),
})

type UserFormValues = z.infer<typeof userFormSchema>

interface UsersActionDialogProps {
  isOpen: boolean
  onClose: () => void
}

export function UsersActionDialog({ isOpen, onClose }: UsersActionDialogProps) {
  const { currentRow, createUser, updateUser, isCreating, isUpdating } = useUsersContext()
  const isEdit = !!currentRow

  // 表单配置
  const form = useForm<UserFormValues>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      name: currentRow?.name || '',
      email: currentRow?.email || '',
      role: currentRow?.role || 'cashier',
      status: currentRow?.status || 'active',
    },
  })

  // 重置表单
  React.useEffect(() => {
    if (isOpen) {
      form.reset({
        name: currentRow?.name || '',
        email: currentRow?.email || '',
        role: currentRow?.role || 'cashier',
        status: currentRow?.status || 'active',
      })
    }
  }, [isOpen, currentRow, form])

  // 提交处理
  const onSubmit = (data: UserFormValues) => {
    if (isEdit && currentRow) {
      updateUser({ userId: currentRow.id, data })
    } else {
      createUser(data)
    }
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{isEdit ? '编辑用户' : '创建用户'}</DialogTitle>
          <DialogDescription>
            {isEdit ? '修改用户信息。点击保存以应用更改。' : '创建新用户账户。填写必要信息。'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>姓名</FormLabel>
                  <FormControl>
                    <Input placeholder="请输入姓名" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>邮箱</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="请输入邮箱地址"
                      {...field}
                      disabled={isEdit} // 编辑时邮箱通常不可修改
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>角色</FormLabel>
                  <FormControl>
                    <select
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      {...field}
                    >
                      <option value="cashier">收银员</option>
                      <option value="manager">经理</option>
                      <option value="admin">管理员</option>
                      <option value="superadmin">超级管理员</option>
                    </select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {!isEdit && (
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>密码</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="请输入密码"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                取消
              </Button>
              <Button type="submit" disabled={isCreating || isUpdating}>
                {(isCreating || isUpdating) && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {isEdit ? '保存' : '创建'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
```

---

## 🎨 阶段 4: UI 优化

### 步骤 4.1: 添加加载和错误状态组件

**文件**: `src/components/data-table-skeleton.tsx` (如果不存在)

```typescript
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

export function DataTableSkeleton() {
  return (
    <div className="space-y-3">
      <div className="flex items-center space-x-2">
        <Skeleton className="h-10 w-[250px]" />
        <Skeleton className="h-10 w-[100px]" />
        <Skeleton className="h-10 w-[100px] ml-auto" />
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {Array.from({ length: 6 }).map((_, index) => (
                <TableHead key={index}>
                  <Skeleton className="h-6 w-20" />
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 10 }).map((_, index) => (
              <TableRow key={index}>
                {Array.from({ length: 6 }).map((_, cellIndex) => (
                  <TableCell key={cellIndex}>
                    <Skeleton className="h-4 w-16" />
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-[150px]" />
        <Skeleton className="h-8 w-[200px]" />
      </div>
    </div>
  )
}
```

**文件**: `src/components/error-message.tsx` (如果不存在)

```typescript
import { AlertCircle, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

interface ErrorMessageProps {
  title?: string
  description: string
  onRetry?: () => void
  className?: string
}

export function ErrorMessage({
  title = "发生错误",
  description,
  onRetry,
  className
}: ErrorMessageProps) {
  return (
    <Alert variant="destructive" className={className}>
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription className="flex items-center justify-between">
        <span>{description}</span>
        {onRetry && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onRetry}
            className="ml-2 h-auto p-1 text-sm"
          >
            <RefreshCw className="mr-1 h-3 w-3" />
            重试
          </Button>
        )}
      </AlertDescription>
    </Alert>
  )
}
```

### 步骤 4.2: 添加统计信息组件

**文件**: `src/develop/(views)/official-api/users/components/users-stats.tsx`

```typescript
import * as React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { UsersContext } from '../context/users-context'
import { useContext } from 'react'
import { User, UserCheck, UserX, Clock, Shield, Users2 } from 'lucide-react'

export function UsersStats() {
  const { userStats, isStatsLoading } = useContext(UsersContext)

  if (isStatsLoading || !userStats) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">加载中...</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">-</div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  const stats = [
    {
      title: '总用户数',
      value: userStats.total,
      icon: Users,
      color: 'text-blue-600',
    },
    {
      title: '活跃用户',
      value: userStats.active,
      icon: UserCheck,
      color: 'text-green-600',
    },
    {
      title: '非活跃用户',
      value: userStats.inactive,
      icon: UserX,
      color: 'text-red-600',
    },
    {
      title: '已邀请',
      value: userStats.invited,
      icon: Clock,
      color: 'text-yellow-600',
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
            <stat.icon className={`h-4 w-4 ${stat.color}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
```

---

## 🧪 阶段 5: 测试和验证

### 步骤 5.1: 单元测试示例

**文件**: `src/develop/(views)/official-api/users/__tests__/useUsersApi.test.ts` (可选)

```typescript
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useUsers, useCreateUser } from '@/develop/(services)/hooks/useUsersApi'
import { usersApi } from '@/develop/(services)/api/users'

// Mock API
jest.mock('@/develop/(services)/api/users')
const mockUsersApi = usersApi as jest.Mocked<typeof usersApi>

// 创建测试用的 QueryClient
const createTestQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: { retry: false },
    mutations: { retry: false },
  },
})

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={createTestQueryClient()}>
    {children}
  </QueryClientProvider>
)

describe('useUsersApi', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('useUsers', () => {
    it('should fetch users successfully', async () => {
      const mockUsers = [
        { id: '1', name: 'User 1', email: 'user1@example.com' },
        { id: '2', name: 'User 2', email: 'user2@example.com' },
      ]

      mockUsersApi.getUsers.mockResolvedValue({
        list: mockUsers,
        total: 2,
        page: 1,
        pageSize: 10,
        totalPages: 1,
      })

      const { result } = renderHook(() => useUsers(), { wrapper })

      await waitFor(() => {
        expect(result.current.data?.list).toEqual(mockUsers)
      })

      expect(mockUsersApi.getUsers).toHaveBeenCalledWith(undefined)
    })
  })

  describe('useCreateUser', () => {
    it('should create user successfully', async () => {
      const newUser = { name: 'New User', email: 'new@example.com', role: 'cashier' }
      const createdUser = { id: '3', ...newUser, status: 'active' }

      mockUsersApi.createUser.mockResolvedValue(createdUser)

      const { result } = renderHook(() => useCreateUser(), { wrapper })

      result.current.mutate(newUser)

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(mockUsersApi.createUser).toHaveBeenCalledWith(newUser)
    })
  })
})
```

### 步骤 5.2: API Mock 服务 (开发阶段)

**文件**: `src/mocks/users.ts` (可选，用于开发阶段)

```typescript
import { users } from '@/develop/(views)/official-api/users/data/users'
import type {
  User,
  UserCreate,
  UserUpdate,
  UserQueryParams,
  PaginatedResponse,
  UserStats,
  BulkDeleteRequest,
  BulkOperationResponse,
} from '@/develop/(services)/api/types'

// Mock 数据库
let mockUsers = [...users]
let nextId = Math.max(...users.map(u => parseInt(u.id))) + 1

// Mock API 服务
export const mockUsersApi = {
  // 获取用户列表
  async getUsers(params?: UserQueryParams): Promise<PaginatedResponse<User>> {
    await new Promise(resolve => setTimeout(resolve, 300)) // 模拟网络延迟

    let filteredUsers = [...mockUsers]

    // 搜索过滤
    if (params?.search) {
      const search = params.search.toLowerCase()
      filteredUsers = filteredUsers.filter(user =>
        user.name.toLowerCase().includes(search) ||
        user.email.toLowerCase().includes(search)
      )
    }

    // 角色过滤
    if (params?.role) {
      filteredUsers = filteredUsers.filter(user => user.role === params.role)
    }

    // 状态过滤
    if (params?.status) {
      filteredUsers = filteredUsers.filter(user => user.status === params.status)
    }

    // 排序
    if (params?.sortBy) {
      filteredUsers.sort((a, b) => {
        const aValue = a[params.sortBy!]
        const bValue = b[params.sortBy!]
        const order = params.sortOrder === 'desc' ? -1 : 1
        return aValue > bValue ? order : -order
      })
    }

    // 分页
    const page = params?.page || 1
    const pageSize = params?.pageSize || 10
    const total = filteredUsers.length
    const totalPages = Math.ceil(total / pageSize)
    const start = (page - 1) * pageSize
    const end = start + pageSize
    const list = filteredUsers.slice(start, end)

    return { list, total, page, pageSize, totalPages }
  },

  // 创建用户
  async createUser(data: UserCreate): Promise<User> {
    await new Promise(resolve => setTimeout(resolve, 500))

    const newUser: User = {
      id: nextId.toString(),
      name: data.name,
      email: data.email,
      role: data.role,
      status: data.status || 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    mockUsers.push(newUser)
    nextId++

    return newUser
  },

  // 更新用户
  async updateUser(userId: string, data: UserUpdate): Promise<User> {
    await new Promise(resolve => setTimeout(resolve, 300))

    const index = mockUsers.findIndex(user => user.id === userId)
    if (index === -1) {
      throw new Error('用户不存在')
    }

    mockUsers[index] = {
      ...mockUsers[index],
      ...data,
      updated_at: new Date().toISOString(),
    }

    return mockUsers[index]
  },

  // 删除用户
  async deleteUser(userId: string): Promise<{ message: string }> {
    await new Promise(resolve => setTimeout(resolve, 200))

    const index = mockUsers.findIndex(user => user.id === userId)
    if (index === -1) {
      throw new Error('用户不存在')
    }

    mockUsers.splice(index, 1)

    return { message: '用户删除成功' }
  },

  // 获取用户统计
  async getUserStats(): Promise<UserStats> {
    await new Promise(resolve => setTimeout(resolve, 200))

    const total = mockUsers.length
    const active = mockUsers.filter(u => u.status === 'active').length
    const inactive = mockUsers.filter(u => u.status === 'inactive').length
    const invited = mockUsers.filter(u => u.status === 'invited').length
    const suspended = mockUsers.filter(u => u.status === 'suspended').length

    const byRole = mockUsers.reduce((acc, user) => {
      acc[user.role] = (acc[user.role] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    return {
      total,
      active,
      inactive,
      invited,
      suspended,
      byRole: byRole as UserStats['byRole'],
    }
  },
}
```

---

## 📝 阶段 6: 部署和配置

### 步骤 6.1: 环境变量配置

在项目根目录创建或更新 `.env` 文件：

```env
# API 配置
VITE_API_BASE_URL=http://localhost:9000
VITE_API_TIMEOUT=30000
VITE_API_PREFIX=

# 应用配置
VITE_APP_TITLE=Shadcn Admin 脚手架
VITE_APP_ENV=development
```

### 步骤 6.2: 构建配置

**文件**: `vite.config.ts` (确保代理配置正确)

```typescript
export default defineConfig({
  // ... 其他配置
  server: {
    proxy: {
      '/api': {
        target: process.env.VITE_API_BASE_URL || 'http://localhost:9000',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
})
```

---

## ✅ 验证清单

完成以下步骤确保 API 集成成功：

### 功能验证
- [ ] 用户列表正确加载和显示
- [ ] 分页功能正常工作
- [ ] 搜索功能正常工作
- [ ] 排序功能正常工作
- [ ] 创建用户功能正常
- [ ] 编辑用户功能正常
- [ ] 删除用户功能正常
- [ ] 批量删除功能正常
- [ ] 邀请用户功能正常

### 用户体验验证
- [ ] 加载状态正确显示
- [ ] 错误状态正确处理
- [ ] 成功操作有适当提示
- [ ] 表单验证正常工作
- [ ] 响应式设计适配

### 性能验证
- [ ] 数据缓存正常工作
- [ ] 网络请求优化
- [ ] 页面加载速度良好
- [ ] 内存使用合理

### 安全验证
- [ ] 认证令牌正确传递
- [ ] 错误信息不泄露敏感数据
- [ ] 输入验证充分
- [ ] 权限控制正确

---

## 🔧 故障排除

### 常见问题

1. **API 请求失败**
   - 检查环境变量配置
   - 验证后端服务是否运行
   - 查看网络请求详情

2. **数据不更新**
   - 检查 TanStack Query 缓存配置
   - 确认 mutation 成功后调用了 invalidateQueries
   - 验证 queryKey 配置

3. **类型错误**
   - 确保类型定义与后端 API 契约一致
   - 检查 Zod schema 验证
   - 验证 TypeScript 配置

4. **权限问题**
   - 检查认证令牌是否正确设置
   - 验证用户角色权限
   - 确认 API 端点权限配置

---

## 📚 扩展指南

### 添加新功能
1. 在 `types.ts` 中定义新类型
2. 在 `users.ts` 中实现 API 方法
3. 在 `useUsersApi.ts` 中添加 hook
4. 在组件中集成新功能

### 性能优化
1. 调整 TanStack Query 缓存策略
2. 实现虚拟滚动（大数据量）
3. 添加请求防抖
4. 优化组件渲染

### 国际化
1. 提取所有文本到 i18n 文件
2. 使用 react-i18next 实现多语言
3. 处理日期和数字格式化

通过遵循这些详细步骤，你可以成功地将 Users 模块从静态数据迁移到完整的 API 集成实现。