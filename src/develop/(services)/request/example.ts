/**
 * 网络请求工具使用示例
 * 此文件仅作为示例参考，不会被实际使用
 */
import { get, post, put, patch, del, upload, download } from './index'
import type { PageResponseData } from './types'

// ==================== 类型定义示例 ====================

interface User {
     id: number
     name: string
     email: string
     role: string
}

interface CreateUserDto {
     name: string
     email: string
     password: string
}

interface UpdateUserDto {
     name?: string
     email?: string
}

// ==================== GET 请求示例 ====================

/**
 * 获取用户列表
 */
export async function getUsers(): Promise<User[]> {
     return get<User[]>('/users')
}

/**
 * 获取单个用户
 */
export async function getUserById(id: number): Promise<User> {
     return get<User>(`/users/${id}`)
}

/**
 * 分页获取用户列表
 */
export async function getUsersByPage(page: number, pageSize: number): Promise<PageResponseData<User>> {
     return get<PageResponseData<User>>('/users', { page, pageSize })
}

/**
 * 带自定义配置的 GET 请求
 */
export async function getUsersWithoutToken(): Promise<User[]> {
     return get<User[]>(
          '/users',
          {},
          {
               needToken: false,
               showError: false,
          }
     )
}

// ==================== POST 请求示例 ====================

/**
 * 创建用户
 */
export async function createUser(data: CreateUserDto): Promise<User> {
     return post<User>('/users', data)
}

/**
 * 登录
 */
export async function login(email: string, password: string): Promise<{ token: string }> {
     return post<{ token: string }>(
          '/auth/login',
          { email, password },
          {
               needToken: false,
          }
     )
}

// ==================== PUT/PATCH 请求示例 ====================

/**
 * 更新用户（完整更新）
 */
export async function updateUser(id: number, data: UpdateUserDto): Promise<User> {
     return put<User>(`/users/${id}`, data)
}

/**
 * 更新用户（部分更新）
 */
export async function patchUser(id: number, data: UpdateUserDto): Promise<User> {
     return patch<User>(`/users/${id}`, data)
}

// ==================== DELETE 请求示例 ====================

/**
 * 删除用户
 */
export async function deleteUser(id: number): Promise<void> {
     return del(`/users/${id}`)
}

// ==================== 文件上传示例 ====================

/**
 * 上传头像
 */
export async function uploadAvatar(userId: number, file: File): Promise<{ url: string }> {
     return upload<{ url: string }>(`/users/${userId}/avatar`, file, {
          onUploadProgress: (progress) => {
               const percent = progress.total ? Math.round((progress.loaded / progress.total) * 100) : 0
               // eslint-disable-next-line no-console
               console.log(`上传进度: ${percent}%`)
          },
     })
}

/**
 * 上传多个文件
 */
export async function uploadFiles(files: File[]): Promise<{ urls: string[] }> {
     const formData = new FormData()
     files.forEach((file) => {
          formData.append('files', file)
     })
     return upload<{ urls: string[] }>('/upload/files', formData)
}

// ==================== 文件下载示例 ====================

/**
 * 导出用户列表
 */
export async function exportUsers(format: 'excel' | 'csv'): Promise<void> {
     return download('/users/export', { format }, `users.${format === 'excel' ? 'xlsx' : 'csv'}`)
}

// ==================== 自定义错误处理示例 ====================

/**
 * 带自定义错误处理的请求
 */
export async function getUserWithCustomError(id: number): Promise<User> {
     return get<User>(
          `/users/${id}`,
          {},
          {
               customErrorHandler: (error) => {
                    const requestError = error as import('./types').RequestError
                    if (requestError.errorCode === 404) {
                         // eslint-disable-next-line no-console
                         console.error('用户不存在')
                    } else if (requestError.errorCode === 403) {
                         // eslint-disable-next-line no-console
                         console.error('没有权限访问')
                    }
               },
          }
     )
}

// ==================== 与 TanStack Query 集成示例 ====================

/**
 * 在 React 组件中使用
 *
 * import { useQuery, useMutation } from '@tanstack/react-query'
 * import { getUsers, createUser } from '@/develop/(services)/request/example'
 *
 * function UsersPage() {
 *   const { data, isLoading } = useQuery({
 *     queryKey: ['users'],
 *     queryFn: getUsers,
 *   })
 *
 *   const mutation = useMutation({
 *     mutationFn: createUser,
 *     onSuccess: () => {
 *       // 刷新列表
 *     },
 *   })
 *
 *   return (
 *     <div>
 *       {isLoading ? '加载中...' : JSON.stringify(data)}
 *     </div>
 *   )
 * }
 */
