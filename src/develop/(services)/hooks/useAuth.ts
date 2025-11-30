import { useMutation, useQuery } from '@tanstack/react-query'
import { useAuthStore } from '@/develop/(stores)/auth-store'
import { toast } from 'sonner'
import { authApi } from '../api/auth'
import type { LoginRequest, Token } from '../api/types'

// 定义错误类型
interface ApiError {
     message?: string
     response?: {
          data?: {
               message?: string
          }
     }
}

/**
 * 认证相关 API Hooks
 */

// 用户登录
export function useLogin() {
     const { auth: authStore } = useAuthStore()

     return useMutation({
          mutationFn: (data: LoginRequest) => authApi.login(data),
          onSuccess: (result: Token) => {
               // 存储 token 到 auth store
               authStore.setAccessToken(result.access_token)
               toast.success('登录成功')
          },
          onError: (error: ApiError) => {
               toast.error(error.response?.data?.message || error.message || '登录失败')
          },
     })
}

// 获取当前用户信息
export function useProfile() {
     const { auth: authStore } = useAuthStore()

     return useQuery({
          queryKey: ['profile'],
          queryFn: () => authApi.getProfile(),
          enabled: !!authStore.accessToken, // 只有在有 token 时才执行
          retry: 1,
     })
}

// 用户登出
export function useLogout() {
     const { auth: authStore } = useAuthStore()

     return useMutation({
          mutationFn: () => authApi.logout(),
          onSuccess: () => {
               // 清除认证信息
               authStore.reset()
               toast.success('登出成功')
          },
          onError: (error: unknown) => {
               // 即使 API 调用失败，也要清除本地认证信息
               authStore.reset()
               const errorMessage = error instanceof Error ? error.message : '登出失败'
               toast.error(errorMessage)
          },
     })
}

// 检查认证状态
export function useAuth() {
     const { auth: authStore } = useAuthStore()
     const profileQuery = useProfile()

     return {
          isAuthenticated: !!authStore.accessToken,
          user: authStore.user,
          accessToken: authStore.accessToken,
          isLoading: profileQuery.isLoading,
          error: profileQuery.error,
          refetch: profileQuery.refetch,
     }
}
