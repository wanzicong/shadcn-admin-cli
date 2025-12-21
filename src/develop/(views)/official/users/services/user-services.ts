import type {
     UserQueryParams,
     PaginatedResponse,
     UserInviteRequest,
     UserInviteResponse,
     BulkDeleteRequest,
     BulkOperationResponse,
     UserStats,
} from '@/develop/(services)/api/types'
import { post } from '@/develop/(services)/request'
import type { User } from '../data/schema'

/**
 * 用户管理 API 服务
 */
export class UsersService {
     /**
      * 获取用户列表
      */
     static async getUsers(params?: UserQueryParams): Promise<PaginatedResponse<User>> {
          // 过滤掉 undefined 值，只发送有效参数，并确保类型正确
          const cleanParams: Record<string, unknown> = {}
          if (params) {
               // 确保 page 和 page_size 是数字
               if (params.page !== undefined) {
                    cleanParams.page = typeof params.page === 'number' ? params.page : Number.parseInt(String(params.page), 10) || 1
               }
               if (params.page_size !== undefined) {
                    cleanParams.page_size = typeof params.page_size === 'number' ? params.page_size : Number.parseInt(String(params.page_size), 10) || 10
               }
               // 搜索参数
               if (params.search !== undefined && params.search !== '') {
                    cleanParams.search = String(params.search).trim()
               }
               // 状态和角色（确保是字符串）
               if (params.status !== undefined) {
                    cleanParams.status = String(params.status)
               }
               if (params.role !== undefined) {
                    cleanParams.role = String(params.role)
               }
               // 排序参数
               if (params.sort_by !== undefined) {
                    cleanParams.sort_by = String(params.sort_by)
               }
               if (params.sort_order !== undefined) {
                    cleanParams.sort_order = String(params.sort_order)
               }
          }

          // 开发环境打印请求参数
          if (import.meta.env.DEV) {
               // eslint-disable-next-line no-console
               console.log('📤 API Request - getUsers:', cleanParams)
          }

          return post<PaginatedResponse<User>>('/api/users', cleanParams)
     }

     /**
      * 获取单个用户详情
      */
     static async getUser(params: { user_id: string }): Promise<User> {
          return post<User>('/users/detail', params)
     }

     /**
      * 创建新用户
      */
     static async createUser(data: User): Promise<User> {
          return post<User>('/users/create', { user_data: data })
     }

     /**
      * 更新用户信息
      */
     static async updateUser(userId: string, data: User): Promise<User> {
          return post<User>('/users/update', { user_id: userId, user_data: data })
     }

     /**
      * 删除单个用户
      */
     static async deleteUser(userId: string): Promise<{ message: string }> {
          return post<{ message: string }>('/users/delete', { user_id: userId })
     }

     /**
      * 批量删除用户
      */
     static async bulkDeleteUsers(data: BulkDeleteRequest): Promise<BulkOperationResponse> {
          return post<BulkOperationResponse>('/users/bulk-delete', data)
     }

     /**
      * 邀请用户
      */
     static async inviteUser(data: UserInviteRequest): Promise<UserInviteResponse> {
          return post<UserInviteResponse>('/users/invite', data)
     }

     /**
      * 激活用户
      */
     static async activateUser(userId: string): Promise<{ message: string }> {
          return post<{ message: string }>('/users/activate', { user_id: userId })
     }

     /**
      * 暂停用户
      */
     static async suspendUser(userId: string): Promise<{ message: string }> {
          return post<{ message: string }>('/users/suspend', { user_id: userId })
     }

     /**
      * 获取用户统计信息
      */
     static async getUserStats(params?: Record<string, unknown>): Promise<UserStats> {
          return post<UserStats>('/users/stats', params)
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
     getUserStats: UsersService.getUserStats,
}
