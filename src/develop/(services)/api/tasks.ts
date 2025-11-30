import { get, post, put, del } from '../request'
import type {
     Task,
     TaskCreate,
     TaskUpdate,
     TaskQueryParams,
     PaginatedResponse,
     TaskImportRequest,
     TaskImportResponse,
     BulkDeleteRequest,
     BulkOperationResponse,
     TaskStats,
     DashboardData,
     TaskStatus,
} from './types'

/**
 * 任务管理 API 服务
 */
export class TasksService {
     /**
      * 获取任务列表
      */
     static async getTasks(params?: TaskQueryParams): Promise<PaginatedResponse<Task>> {
          return get<PaginatedResponse<Task>>('/tasks/', params as Record<string, unknown>)
     }

     /**
      * 获取单个任务详情
      */
     static async getTask(taskId: string): Promise<Task> {
          return get<Task>(`/tasks/${taskId}`)
     }

     /**
      * 创建新任务
      */
     static async createTask(data: TaskCreate): Promise<Task> {
          return post<Task>('/tasks/', data)
     }

     /**
      * 更新任务信息
      */
     static async updateTask(taskId: string, data: TaskUpdate): Promise<Task> {
          return put<Task>(`/tasks/${taskId}`, data)
     }

     /**
      * 删除单个任务
      */
     static async deleteTask(taskId: string): Promise<{ message: string }> {
          return del<{ message: string }>(`/tasks/${taskId}`)
     }

     /**
      * 批量删除任务
      */
     static async bulkDeleteTasks(data: BulkDeleteRequest): Promise<BulkOperationResponse> {
          return del<BulkOperationResponse>('/tasks/', data as unknown as Record<string, unknown>)
     }

     /**
      * 更新任务状态
      */
     static async updateTaskStatus(taskId: string, status: TaskStatus): Promise<{ message: string }> {
          return put<{ message: string }>(`/tasks/${taskId}/status`, { status })
     }

     /**
      * 分配任务
      */
     static async assignTask(taskId: string, assigneeId: string): Promise<{ message: string }> {
          return put<{ message: string }>(`/tasks/${taskId}/assign`, { assignee_id: assigneeId })
     }

     /**
      * 批量导入任务
      */
     static async importTasks(data: TaskImportRequest): Promise<TaskImportResponse> {
          return post<TaskImportResponse>('/tasks/import', data)
     }

     /**
      * 导出任务数据
      */
     static async exportTasks(params?: { status?: TaskStatus; label?: string; priority?: string }): Promise<{ data: Task[]; message: string }> {
          return get<{ data: Task[]; message: string }>('/tasks/export', params)
     }

     /**
      * 获取任务统计信息
      */
     static async getTaskStats(): Promise<TaskStats> {
          return get<TaskStats>('/tasks/stats/summary')
     }

     /**
      * 获取仪表板数据
      */
     static async getDashboardData(): Promise<DashboardData> {
          return get<DashboardData>('/tasks/dashboard')
     }
}

/**
 * 导出便捷方法
 */
export const tasksApi = {
     getTasks: TasksService.getTasks,
     getTask: TasksService.getTask,
     createTask: TasksService.createTask,
     updateTask: TasksService.updateTask,
     deleteTask: TasksService.deleteTask,
     bulkDeleteTasks: TasksService.bulkDeleteTasks,
     updateTaskStatus: TasksService.updateTaskStatus,
     assignTask: TasksService.assignTask,
     importTasks: TasksService.importTasks,
     exportTasks: TasksService.exportTasks,
     getTaskStats: TasksService.getTaskStats,
     getDashboardData: TasksService.getDashboardData,
}
