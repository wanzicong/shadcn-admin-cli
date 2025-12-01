import { post } from '../request'
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
 * 用户管理 API 服务
 */
export class UsersService {
     /**
      * 获取用户列表
      */
     static async getUsers(params?: UserQueryParams): Promise<PaginatedResponse<User>> {
          return post<PaginatedResponse<User>>('/users', params)
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
     static async createUser(data: UserCreate): Promise<User> {
          return post<User>('/users/create', { user_data: data })
     }

     /**
      * 更新用户信息
      */
     static async updateUser(userId: string, data: UserUpdate): Promise<User> {
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
