import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import type { UserCreate, UserUpdate, UserQueryParams, UserInviteRequest, BulkDeleteRequest } from '../api/types'
import { usersApi } from '../api/users'

/**
 * 用户管理 API Hooks
 */

// 获取用户列表
export function useUsers(params?: UserQueryParams) {
     return useQuery({
          queryKey: ['users', params],
          queryFn: () => usersApi.getUsers(params),
          staleTime: 5 * 60 * 1000, // 5分钟
     })
}

// 获取单个用户
export function useUser(userId: string) {
     return useQuery({
          queryKey: ['user', userId],
          queryFn: () => usersApi.getUser({ user_id: userId }),
          enabled: !!userId,
     })
}

// 获取用户统计信息
export function useUserStats() {
     return useQuery({
          queryKey: ['user-stats'],
          queryFn: () => usersApi.getUserStats(),
          staleTime: 10 * 60 * 1000, // 10分钟
     })
}

// 创建用户
export function useCreateUser() {
     const queryClient = useQueryClient()

     return useMutation({
          mutationFn: (data: UserCreate) => usersApi.createUser(data),
          onSuccess: () => {
               queryClient.invalidateQueries({ queryKey: ['users'] })
               queryClient.invalidateQueries({ queryKey: ['user-stats'] })
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
          mutationFn: ({ userId, data }: { userId: string; data: UserUpdate }) => usersApi.updateUser(userId, data),
          onSuccess: (_, { userId }) => {
               queryClient.invalidateQueries({ queryKey: ['users'] })
               queryClient.invalidateQueries({ queryKey: ['user', userId] })
               queryClient.invalidateQueries({ queryKey: ['user-stats'] })
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
          onSuccess: () => {
               queryClient.invalidateQueries({ queryKey: ['users'] })
               queryClient.invalidateQueries({ queryKey: ['user-stats'] })
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
               queryClient.invalidateQueries({ queryKey: ['users'] })
               queryClient.invalidateQueries({ queryKey: ['user-stats'] })
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
               queryClient.invalidateQueries({ queryKey: ['users'] })
               queryClient.invalidateQueries({ queryKey: ['user-stats'] })
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
          onSuccess: () => {
               queryClient.invalidateQueries({ queryKey: ['users'] })
               queryClient.invalidateQueries({ queryKey: ['user-stats'] })
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
          onSuccess: () => {
               queryClient.invalidateQueries({ queryKey: ['users'] })
               queryClient.invalidateQueries({ queryKey: ['user-stats'] })
               toast.success('用户暂停成功')
          },
          onError: (error: unknown) => {
               const errorMessage = error instanceof Error ? error.message : '用户暂停失败'
               toast.error(errorMessage)
          },
     })
}
