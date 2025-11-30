import { get, post, put, del } from '../request'
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
          return get<PaginatedResponse<User>>('/users/', params as Record<string, unknown>)
     }

     /**
      * 获取单个用户详情
      */
     static async getUser(userId: string): Promise<User> {
          return get<User>(`/users/${userId}`)
     }

     /**
      * 创建新用户
      */
     static async createUser(data: UserCreate): Promise<User> {
          return post<User>('/users/', data)
     }

     /**
      * 更新用户信息
      */
     static async updateUser(userId: string, data: UserUpdate): Promise<User> {
          return put<User>(`/users/${userId}`, data)
     }

     /**
      * 删除单个用户
      */
     static async deleteUser(userId: string): Promise<{ message: string }> {
          return del<{ message: string }>(`/users/${userId}`)
     }

     /**
      * 批量删除用户
      */
     static async bulkDeleteUsers(data: BulkDeleteRequest): Promise<BulkOperationResponse> {
          return del<BulkOperationResponse>('/users/', data as unknown as Record<string, unknown>)
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
          return post<{ message: string }>(`/users/${userId}/activate`)
     }

     /**
      * 暂停用户
      */
     static async suspendUser(userId: string): Promise<{ message: string }> {
          return post<{ message: string }>(`/users/${userId}/suspend`)
     }

     /**
      * 获取用户统计信息
      */
     static async getUserStats(): Promise<UserStats> {
          return get<UserStats>('/users/stats/summary')
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
