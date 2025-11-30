import { post } from '../request'
import type { LoginRequest, Token, UserProfile } from './types'

/**
 * 认证相关 API 服务
 */
export class AuthService {
     /**
      * 用户登录
      */
     static async login(data: LoginRequest): Promise<Token> {
          return post<Token>('/auth/login', data)
     }

     /**
      * 获取当前用户信息
      */
     static async getProfile(): Promise<UserProfile> {
          return post<UserProfile>('/auth/profile')
     }

     /**
      * 用户登出
      */
     static async logout(): Promise<{ message: string }> {
          return post<{ message: string }>('/auth/logout')
     }
}

/**
 * 导出便捷方法
 */
export const authApi = {
     login: AuthService.login,
     getProfile: AuthService.getProfile,
     logout: AuthService.logout,
}
