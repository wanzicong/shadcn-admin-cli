/**
 * API 类型定义
 * 与后端 FastAPI 接口保持一致
 */

// 基础响应类型
export interface BaseResponse<T = unknown> {
     code: number
     message: string
     success: boolean
     data?: T
}

// 分页响应类型
export interface PaginatedResponse<T> {
     list: T[]
     total: number
     page: number
     pageSize: number
     totalPages: number
     code?: number
     message?: string
     success?: boolean
}

// 用户相关枚举
export type UserStatus = 'active' | 'inactive' | 'invited' | 'suspended'
export type UserRole = 'superadmin' | 'admin' | 'manager' | 'cashier'

// 任务相关枚举
export type TaskStatus = 'backlog' | 'todo' | 'in progress' | 'done' | 'canceled'
export type TaskLabel = 'bug' | 'feature' | 'documentation'
export type TaskPriority = 'low' | 'medium' | 'high' | 'critical'

// 用户相关类型
export interface User {
     id: string
     firstName: string
     lastName: string
     username: string
     email: string
     phoneNumber: string | null
     status: UserStatus
     role: UserRole
     createdAt: string
     updatedAt: string
}

export interface UserCreate {
     firstName: string
     lastName: string
     username: string
     email: string
     phoneNumber?: string
     password: string
     status?: UserStatus
     role?: UserRole
}

export interface UserUpdate {
     firstName?: string
     lastName?: string
     username?: string
     email?: string
     phoneNumber?: string
     password?: string
     status?: UserStatus
     role?: UserRole
}

export interface UserProfile {
     id: string
     username: string
     email: string
     firstName: string
     lastName: string
     role: UserRole
     status: UserStatus
     createdAt: string
}

// 认证相关类型
export interface LoginRequest {
     username: string
     password: string
}

export interface Token {
     access_token: string
     token_type: string
}

// 用户操作类型
export interface UserInviteRequest {
     email: string
     role?: UserRole
}

export interface UserInviteResponse extends BaseResponse {
     invited_users: string[]
}

export interface BulkDeleteRequest {
     ids: string[]
}

export interface BulkOperationResponse {
     deleted_count: number
     failed_count: number
     failed_ids?: string[]
     code?: number
     message?: string
     success?: boolean
}

export interface UserStats {
     total_users: number
     active_users: number
     inactive_users: number
     invited_users: number
     suspended_users: number
     code?: number
     message?: string
     success?: boolean
}

// 任务相关类型
export interface Task {
     id: string
     title: string
     description: string | null
     status: TaskStatus
     label: TaskLabel
     priority: TaskPriority
     assignee: string | null
     dueDate: string | null
     createdAt: string
     updatedAt: string
}

export interface TaskCreate {
     title: string
     description?: string
     status?: TaskStatus
     label?: TaskLabel
     priority?: TaskPriority
     assignee?: string
     dueDate?: string
}

export interface TaskUpdate {
     title?: string
     description?: string
     status?: TaskStatus
     label?: TaskLabel
     priority?: TaskPriority
     assignee?: string
     dueDate?: string
}

export interface TaskImportRequest {
     tasks: TaskCreate[]
}

export interface TaskImportResponse extends BaseResponse {
     imported_count: number
     failed_count: number
     failed_tasks: string[]
}

export interface TaskStats extends BaseResponse {
     total_tasks: number
     backlog_tasks: number
     todo_tasks: number
     in_progress_tasks: number
     done_tasks: number
     canceled_tasks: number
     tasks_by_priority: Record<string, number>
     tasks_by_label: Record<string, number>
}

export interface DashboardData extends BaseResponse {
     recent_tasks: Task[]
     status_distribution: Record<string, number>
     priority_distribution: Record<string, number>
}

// 查询参数类型
export interface PaginationParams {
     page?: number
     page_size?: number
}

export interface SearchParams extends PaginationParams {
     search?: string
}

export interface UserQueryParams extends SearchParams {
     status?: UserStatus | UserStatus[] // 支持单个值或数组
     role?: UserRole | UserRole[] // 支持单个值或数组
     sort_by?: string
     sort_order?: 'asc' | 'desc'
     username?: string
}

export interface TaskQueryParams extends SearchParams {
     status?: TaskStatus
     label?: TaskLabel
     priority?: TaskPriority
     assignee?: string
     sort_by?: string
     sort_order?: 'asc' | 'desc'
}
