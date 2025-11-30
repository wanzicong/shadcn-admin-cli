// 导入 API 实例用于组合导出
import { authApi } from './auth'
import { tasksApi } from './tasks'
import { usersApi } from './users'

/**
 * API 服务统一导出
 */

// 类型定义
export * from './types'

// 认证服务
export { AuthService, authApi } from './auth'

// 用户管理服务
export { UsersService, usersApi } from './users'

// 任务管理服务
export { TasksService, tasksApi } from './tasks'

// 默认导出所有 API 服务
export const api = {
     auth: authApi,
     users: usersApi,
     tasks: tasksApi,
}
