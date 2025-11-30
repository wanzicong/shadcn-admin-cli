# Tasks 模块 API 接入详细实施步骤

本文档提供将 Tasks 模块从静态数据迁移到真实 API 的完整实施步骤。

## 📋 实施概览

### 目标
- 替换静态数据为真实 API 调用
- 保持现有 UI 组件和交互逻辑不变
- 实现完整的任务 CRUD 操作和状态管理
- 支持任务分配、优先级管理和标签分类

### 技术栈
- **HTTP 客户端**: Axios (已配置)
- **状态管理**: TanStack Query + Zustand
- **表单处理**: React Hook Form + Zod
- **UI 组件**: Shadcn UI
- **特性**: 抽屉式设计、批量操作、数据可视化

---

## 🚀 阶段 1: API 服务层实现

### 步骤 1.1: 定义 API 类型

**文件**: `src/develop/(services)/api/types.ts` (扩展 Users 模块的类型)

```typescript
// ==================== Tasks 相关类型定义 ====================

// 任务基础信息
export interface Task {
  id: string
  title: string
  description?: string
  status: TaskStatus
  priority: TaskPriority
  label: TaskLabel
  assignee_id?: string
  creator_id: string
  project_id?: string
  due_date?: string
  estimated_hours?: number
  actual_hours?: number
  tags?: string[]
  attachments?: TaskAttachment[]
  comments?: TaskComment[]
  created_at: string
  updated_at: string
  completed_at?: string
}

// 任务状态枚举
export type TaskStatus = 'backlog' | 'todo' | 'in_progress' | 'done' | 'canceled'

// 任务优先级枚举
export type TaskPriority = 'low' | 'medium' | 'high' | 'critical'

// 任务标签枚举
export type TaskLabel = 'bug' | 'feature' | 'documentation' | 'enhancement' | 'hotfix'

// 任务附件
export interface TaskAttachment {
  id: string
  name: string
  url: string
  size: number
  type: string
  uploaded_by: string
  uploaded_at: string
}

// 任务评论
export interface TaskComment {
  id: string
  content: string
  author_id: string
  created_at: string
  updated_at?: string
  parent_id?: string // 用于回复功能
}

// 创建任务请求
export interface TaskCreate {
  title: string
  description?: string
  status?: TaskStatus
  priority?: TaskPriority
  label?: TaskLabel
  assignee_id?: string
  project_id?: string
  due_date?: string
  estimated_hours?: number
  tags?: string[]
}

// 更新任务请求
export interface TaskUpdate {
  title?: string
  description?: string
  status?: TaskStatus
  priority?: TaskPriority
  label?: TaskLabel
  assignee_id?: string
  project_id?: string
  due_date?: string
  estimated_hours?: number
  actual_hours?: number
  tags?: string[]
}

// 任务查询参数
export interface TaskQueryParams {
  page?: number
  pageSize?: number
  search?: string
  status?: TaskStatus | TaskStatus[]
  priority?: TaskPriority | TaskPriority[]
  label?: TaskLabel | TaskLabel[]
  assignee_id?: string | string[]
  project_id?: string | string[]
  creator_id?: string
  due_date_from?: string
  due_date_to?: string
  created_at_from?: string
  created_at_to?: string
  tags?: string[]
  sortBy?: 'title' | 'status' | 'priority' | 'due_date' | 'created_at' | 'updated_at'
  sortOrder?: 'asc' | 'desc'
}

// 任务统计信息
export interface TaskStats {
  total: number
  byStatus: Record<TaskStatus, number>
  byPriority: Record<TaskPriority, number>
  byLabel: Record<TaskLabel, number>
  overdue: number
  completedThisWeek: number
  completedThisMonth: number
  averageCompletionTime: number // 小时
  totalEstimatedHours: number
  totalActualHours: number
}

// 任务评论请求
export interface TaskCommentCreate {
  content: string
  parent_id?: string
}

export interface TaskCommentUpdate {
  content: string
}

// 任务附件上传
export interface TaskAttachmentUpload {
  file: File
  description?: string
}

// 批量操作
export interface TaskBulkUpdate {
  taskIds: string[]
  updates: Partial<TaskUpdate>
}

export interface TaskBulkDelete {
  taskIds: string[]
  reason?: string
}

export interface TaskBulkOperationResponse {
  updated_count: number
  deleted_count: number
  failed_count: number
  failed_items?: Array<{
    id: string
    error: string
  }>
}

// 任务导入
export interface TaskImportRequest {
  file: File
  format: 'csv' | 'json' | 'xlsx'
  mapping?: Record<string, string> // 字段映射
  options?: {
    skipErrors?: boolean
    updateExisting?: boolean
  }
}

export interface TaskImportResponse {
  imported_count: number
  updated_count: number
  failed_count: number
  errors?: Array<{
    row: number
    field: string
    message: string
  }>
}

// 任务导出
export interface TaskExportRequest {
  format: 'csv' | 'json' | 'xlsx'
  filters?: TaskQueryParams
  fields?: string[]
}

// 项目相关 (扩展)
export interface Project {
  id: string
  name: string
  description?: string
  status: 'active' | 'completed' | 'archived'
  created_at: string
  updated_at: string
}

// Kanban 看板数据
export interface KanbanColumn {
  id: string
  title: string
  status: TaskStatus
  tasks: Task[]
  limit?: number
  color?: string
}

export interface KanbanBoard {
  id: string
  title: string
  project_id?: string
  columns: KanbanColumn[]
  filters?: TaskQueryParams
}
```

### 步骤 1.2: 实现 Tasks API 服务

**文件**: `src/develop/(services)/api/tasks.ts`

```typescript
import { post, get, put, del, upload } from '../request'
import type {
  Task,
  TaskCreate,
  TaskUpdate,
  TaskQueryParams,
  TaskStats,
  TaskComment,
  TaskCommentCreate,
  TaskCommentUpdate,
  TaskAttachment,
  TaskAttachmentUpload,
  TaskBulkUpdate,
  TaskBulkDelete,
  TaskBulkOperationResponse,
  TaskImportRequest,
  TaskImportResponse,
  TaskExportRequest,
  Project,
  KanbanBoard,
} from './types'

/**
 * 任务管理 API 服务类
 */
export class TasksService {
  // ==================== 基础 CRUD ====================

  /**
   * 获取任务列表
   * @param params 查询参数
   */
  static async getTasks(params?: TaskQueryParams): Promise<PaginatedResponse<Task>> {
    return post<PaginatedResponse<Task>>('/tasks/list', params)
  }

  /**
   * 获取单个任务详情
   * @param taskId 任务ID
   */
  static async getTask(taskId: string): Promise<Task> {
    return post<Task>('/tasks/detail', { task_id: taskId })
  }

  /**
   * 创建新任务
   * @param data 任务数据
   */
  static async createTask(data: TaskCreate): Promise<Task> {
    return post<Task>('/tasks/create', { task_data: data })
  }

  /**
   * 更新任务信息
   * @param taskId 任务ID
   * @param data 更新数据
   */
  static async updateTask(taskId: string, data: TaskUpdate): Promise<Task> {
    return post<Task>('/tasks/update', { task_id: taskId, task_data: data })
  }

  /**
   * 删除单个任务
   * @param taskId 任务ID
   */
  static async deleteTask(taskId: string): Promise<{ message: string }> {
    return post<{ message: string }>('/tasks/delete', { task_id: taskId })
  }

  /**
   * 批量更新任务
   * @param data 批量更新数据
   */
  static async bulkUpdateTasks(data: TaskBulkUpdate): Promise<TaskBulkOperationResponse> {
    return post<TaskBulkOperationResponse>('/tasks/bulk-update', data)
  }

  /**
   * 批量删除任务
   * @param data 批量删除数据
   */
  static async bulkDeleteTasks(data: TaskBulkDelete): Promise<TaskBulkOperationResponse> {
    return post<TaskBulkOperationResponse>('/tasks/bulk-delete', data)
  }

  // ==================== 任务状态管理 ====================

  /**
   * 更新任务状态
   * @param taskId 任务ID
   * @param status 新状态
   */
  static async updateTaskStatus(taskId: string, status: TaskStatus): Promise<Task> {
    return post<Task>('/tasks/update-status', { task_id: taskId, status })
  }

  /**
   * 更新任务优先级
   * @param taskId 任务ID
   * @param priority 新优先级
   */
  static async updateTaskPriority(taskId: string, priority: TaskPriority): Promise<Task> {
    return post<Task>('/tasks/update-priority', { task_id: taskId, priority })
  }

  /**
   * 分配任务
   * @param taskId 任务ID
   * @param assigneeId 分配给的用户ID
   */
  static async assignTask(taskId: string, assigneeId: string): Promise<Task> {
    return post<Task>('/tasks/assign', { task_id: taskId, assignee_id: assigneeId })
  }

  /**
   * 取消任务分配
   * @param taskId 任务ID
   */
  static async unassignTask(taskId: string): Promise<Task> {
    return post<Task>('/tasks/unassign', { task_id: taskId })
  }

  // ==================== 任务评论 ====================

  /**
   * 获取任务评论
   * @param taskId 任务ID
   */
  static async getTaskComments(taskId: string): Promise<TaskComment[]> {
    return post<TaskComment[]>('/tasks/comments/list', { task_id: taskId })
  }

  /**
   * 添加任务评论
   * @param taskId 任务ID
   * @param data 评论数据
   */
  static async addTaskComment(taskId: string, data: TaskCommentCreate): Promise<TaskComment> {
    return post<TaskComment>('/tasks/comments/create', { task_id: taskId, ...data })
  }

  /**
   * 更新任务评论
   * @param commentId 评论ID
   * @param data 更新数据
   */
  static async updateTaskComment(commentId: string, data: TaskCommentUpdate): Promise<TaskComment> {
    return post<TaskComment>('/tasks/comments/update', { comment_id: commentId, ...data })
  }

  /**
   * 删除任务评论
   * @param commentId 评论ID
   */
  static async deleteTaskComment(commentId: string): Promise<{ message: string }> {
    return post<{ message: string }>('/tasks/comments/delete', { comment_id: commentId })
  }

  // ==================== 任务附件 ====================

  /**
   * 获取任务附件
   * @param taskId 任务ID
   */
  static async getTaskAttachments(taskId: string): Promise<TaskAttachment[]> {
    return post<TaskAttachment[]>('/tasks/attachments/list', { task_id: taskId })
  }

  /**
   * 上传任务附件
   * @param taskId 任务ID
   * @param data 上传数据
   */
  static async uploadTaskAttachment(taskId: string, data: TaskAttachmentUpload): Promise<TaskAttachment> {
    const formData = new FormData()
    formData.append('file', data.file)
    if (data.description) {
      formData.append('description', data.description)
    }
    formData.append('task_id', taskId)

    return upload<TaskAttachment>('/tasks/attachments/upload', formData, {
      onUploadProgress: (progress) => {
        const percent = Math.round((progress.loaded * 100) / progress.total)
        console.log(`上传进度: ${percent}%`)
      },
    })
  }

  /**
   * 删除任务附件
   * @param attachmentId 附件ID
   */
  static async deleteTaskAttachment(attachmentId: string): Promise<{ message: string }> {
    return post<{ message: string }>('/tasks/attachments/delete', { attachment_id: attachmentId })
  }

  /**
   * 下载任务附件
   * @param attachmentId 附件ID
   */
  static async downloadTaskAttachment(attachmentId: string): Promise<void> {
    return download(
      '/tasks/attachments/download',
      { attachment_id: attachmentId },
      `attachment-${attachmentId}`
    )
  }

  // ==================== 时间跟踪 ====================

  /**
   * 开始任务计时
   * @param taskId 任务ID
   */
  static async startTaskTimer(taskId: string): Promise<{ message: string; timer_id: string }> {
    return post<{ message: string; timer_id: string }>('/tasks/timer/start', { task_id: taskId })
  }

  /**
   * 停止任务计时
   * @param timerId 计时器ID
   */
  static async stopTaskTimer(timerId: string): Promise<{ message: string; duration: number }> {
    return post<{ message: string; duration: number }>('/tasks/timer/stop', { timer_id: timerId })
  }

  /**
   * 获取任务时间记录
   * @param taskId 任务ID
   */
  static async getTaskTimeLogs(taskId: string): Promise<TimeLog[]> {
    return post<TimeLog[]>('/tasks/time-logs/list', { task_id: taskId })
  }

  /**
   * 手动记录工作时间
   * @param taskId 任务ID
   * @param data 时间记录数据
   */
  static async logTaskTime(taskId: string, data: TimeLogCreate): Promise<TimeLog> {
    return post<TimeLog>('/tasks/time-logs/create', { task_id: taskId, ...data })
  }

  // ==================== 数据导入导出 ====================

  /**
   * 导入任务
   * @param data 导入数据
   */
  static async importTasks(data: TaskImportRequest): Promise<TaskImportResponse> {
    const formData = new FormData()
    formData.append('file', data.file)
    formData.append('format', data.format)

    if (data.mapping) {
      formData.append('mapping', JSON.stringify(data.mapping))
    }

    if (data.options) {
      formData.append('options', JSON.stringify(data.options))
    }

    return upload<TaskImportResponse>('/tasks/import', formData)
  }

  /**
   * 导出任务
   * @param data 导出参数
   */
  static async exportTasks(data: TaskExportRequest): Promise<{ download_url: string }> {
    return post<{ download_url: string }>('/tasks/export', data)
  }

  /**
   * 获取导入模板
   * @param format 模板格式
   */
  static async getImportTemplate(format: 'csv' | 'json' | 'xlsx'): Promise<{ download_url: string }> {
    return post<{ download_url: string }>('/tasks/import-template', { format })
  }

  // ==================== 统计和分析 ====================

  /**
   * 获取任务统计信息
   * @param params 查询参数
   */
  static async getTaskStats(params?: {
    project_id?: string
    date_from?: string
    date_to?: string
  }): Promise<TaskStats> {
    return post<TaskStats>('/tasks/stats', params)
  }

  /**
   * 获取工作负载分析
   * @param params 查询参数
   */
  static async getWorkloadAnalysis(params?: {
    user_ids?: string[]
    project_id?: string
    date_from?: string
    date_to?: string
  }): Promise<WorkloadAnalysis> {
    return post<WorkloadAnalysis>('/tasks/workload-analysis', params)
  }

  /**
   * 获取项目进度报告
   * @param projectId 项目ID
   */
  static async getProjectProgress(projectId: string): Promise<ProjectProgress> {
    return post<ProjectProgress>('/tasks/project-progress', { project_id: projectId })
  }

  // ==================== Kanban 看板 ====================

  /**
   * 获取 Kanban 看板数据
   * @param boardId 看板ID
   */
  static async getKanbanBoard(boardId: string): Promise<KanbanBoard> {
    return post<KanbanBoard>('/tasks/kanban/board', { board_id: boardId })
  }

  /**
   * 更新 Kanban 看板
   * @param boardId 看板ID
   * @param data 更新数据
   */
  static async updateKanbanBoard(boardId: string, data: Partial<KanbanBoard>): Promise<KanbanBoard> {
    return post<KanbanBoard>('/tasks/kanban/update', { board_id: boardId, ...data })
  }

  /**
   * 移动任务到不同列
   * @param taskId 任务ID
   * @param targetColumnId 目标列ID
   * @param position 新位置
   */
  static async moveTaskToColumn(
    taskId: string,
    targetColumnId: string,
    position?: number
  ): Promise<Task> {
    return post<Task>('/tasks/kanban/move-task', {
      task_id: taskId,
      column_id: targetColumnId,
      position,
    })
  }

  // ==================== 搜索和过滤 ====================

  /**
   * 搜索任务
   * @param query 搜索关键词
   * @param filters 过滤条件
   * @param limit 结果限制
   */
  static async searchTasks(
    query: string,
    filters?: Partial<TaskQueryParams>,
    limit = 20
  ): Promise<Task[]> {
    return post<Task[]>('/tasks/search', { query, filters, limit })
  }

  /**
   * 获取任务建议 (基于用户历史)
   * @param userId 用户ID
   * @param limit 建议数量
   */
  static async getTaskSuggestions(userId: string, limit = 10): Promise<TaskSuggestion[]> {
    return post<TaskSuggestion[]>('/tasks/suggestions', { user_id: userId, limit })
  }

  // ==================== 项目管理 ====================

  /**
   * 获取项目列表
   * @param params 查询参数
   */
  static async getProjects(params?: {
    page?: number
    pageSize?: number
    search?: string
    status?: Project['status']
  }): Promise<PaginatedResponse<Project>> {
    return post<PaginatedResponse<Project>>('/projects/list', params)
  }

  /**
   * 创建项目
   * @param data 项目数据
   */
  static async createProject(data: {
    name: string
    description?: string
  }): Promise<Project> {
    return post<Project>('/projects/create', data)
  }

  /**
   * 获取项目任务
   * @param projectId 项目ID
   * @param params 查询参数
   */
  static async getProjectTasks(
    projectId: string,
    params?: TaskQueryParams
  ): Promise<PaginatedResponse<Task>> {
    return post<PaginatedResponse<Task>>('/tasks/project-tasks', {
      project_id: projectId,
      ...params,
    })
  }
}

/**
 * 导出便捷方法
 */
export const tasksApi = {
  // 基础 CRUD
  getTasks: TasksService.getTasks,
  getTask: TasksService.getTask,
  createTask: TasksService.createTask,
  updateTask: TasksService.updateTask,
  deleteTask: TasksService.deleteTask,
  bulkUpdateTasks: TasksService.bulkUpdateTasks,
  bulkDeleteTasks: TasksService.bulkDeleteTasks,

  // 状态管理
  updateTaskStatus: TasksService.updateTaskStatus,
  updateTaskPriority: TasksService.updateTaskPriority,
  assignTask: TasksService.assignTask,
  unassignTask: TasksService.unassignTask,

  // 评论
  getTaskComments: TasksService.getTaskComments,
  addTaskComment: TasksService.addTaskComment,
  updateTaskComment: TasksService.updateTaskComment,
  deleteTaskComment: TasksService.deleteTaskComment,

  // 附件
  getTaskAttachments: TasksService.getTaskAttachments,
  uploadTaskAttachment: TasksService.uploadTaskAttachment,
  deleteTaskAttachment: TasksService.deleteTaskAttachment,
  downloadTaskAttachment: TasksService.downloadTaskAttachment,

  // 时间跟踪
  startTaskTimer: TasksService.startTaskTimer,
  stopTaskTimer: TasksService.stopTaskTimer,
  getTaskTimeLogs: TasksService.getTaskTimeLogs,
  logTaskTime: TasksService.logTaskTime,

  // 导入导出
  importTasks: TasksService.importTasks,
  exportTasks: TasksService.exportTasks,
  getImportTemplate: TasksService.getImportTemplate,

  // 统计分析
  getTaskStats: TasksService.getTaskStats,
  getWorkloadAnalysis: TasksService.getWorkloadAnalysis,
  getProjectProgress: TasksService.getProjectProgress,

  // Kanban
  getKanbanBoard: TasksService.getKanbanBoard,
  updateKanbanBoard: TasksService.updateKanbanBoard,
  moveTaskToColumn: TasksService.moveTaskToColumn,

  // 搜索
  searchTasks: TasksService.searchTasks,
  getTaskSuggestions: TasksService.getTaskSuggestions,

  // 项目
  getProjects: TasksService.getProjects,
  createProject: TasksService.createProject,
  getProjectTasks: TasksService.getProjectTasks,
}

// ==================== 补充类型定义 ====================

// 时间日志
export interface TimeLog {
  id: string
  task_id: string
  user_id: string
  start_time: string
  end_time?: string
  duration: number // 分钟
  description?: string
  created_at: string
  updated_at?: string
}

export interface TimeLogCreate {
  start_time: string
  end_time: string
  description?: string
}

// 工作负载分析
export interface WorkloadAnalysis {
  user_id: string
  user_name: string
  total_tasks: number
  completed_tasks: number
  pending_tasks: number
  overdue_tasks: number
  total_hours: number
  average_completion_time: number
  efficiency_score: number // 0-100
}

// 项目进度
export interface ProjectProgress {
  project_id: string
  project_name: string
  total_tasks: number
  completed_tasks: number
  in_progress_tasks: number
  completion_percentage: number
  estimated_completion_date?: string
  total_estimated_hours: number
  total_actual_hours: number
  by_status: Record<TaskStatus, number>
  by_priority: Record<TaskPriority, number>
}

// 任务建议
export interface TaskSuggestion {
  task: Task
  reason: string
  confidence: number // 0-100
}

// 分页响应 (复用 Users 模块的定义)
export interface PaginatedResponse<T> {
  list: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}
```

---

## 🎣 阶段 2: TanStack Query Hooks

### 步骤 2.1: 创建任务管理 Hooks

**文件**: `src/develop/(services)/hooks/useTasksApi.ts`

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import type {
  Task,
  TaskCreate,
  TaskUpdate,
  TaskQueryParams,
  TaskStats,
  TaskComment,
  TaskCommentCreate,
  TaskCommentUpdate,
  TaskAttachment,
  TaskAttachmentUpload,
  TaskBulkUpdate,
  TaskBulkDelete,
  TaskImportRequest,
  TaskImportResponse,
  TaskExportRequest,
  Project,
  KanbanBoard,
  TaskStatus,
  TaskPriority,
  WorkloadAnalysis,
  ProjectProgress,
  TimeLog,
  TimeLogCreate,
} from '../api/types'
import { tasksApi } from '../api/tasks'

/**
 * 任务管理 API Hooks
 */

// 查询 Keys 常量
const TASK_QUERY_KEYS = {
  all: ['tasks'] as const,
  lists: () => [...TASK_QUERY_KEYS.all, 'list'] as const,
  list: (params?: TaskQueryParams) => [...TASK_QUERY_KEYS.lists(), params] as const,
  details: () => [...TASK_QUERY_KEYS.all, 'detail'] as const,
  detail: (id: string) => [...TASK_QUERY_KEYS.details(), id] as const,
  comments: (id: string) => [...TASK_QUERY_KEYS.detail(id), 'comments'] as const,
  attachments: (id: string) => [...TASK_QUERY_KEYS.detail(id), 'attachments'] as const,
  timeLogs: (id: string) => [...TASK_QUERY_KEYS.detail(id), 'time-logs'] as const,
  stats: () => [...TASK_QUERY_KEYS.all, 'stats'] as const,
  projects: () => [...TASK_QUERY_KEYS.all, 'projects'] as const,
  kanban: (boardId: string) => [...TASK_QUERY_KEYS.all, 'kanban', boardId] as const,
  search: (query: string) => [...TASK_QUERY_KEYS.all, 'search', query] as const,
  suggestions: (userId: string) => [...TASK_QUERY_KEYS.all, 'suggestions', userId] as const,
} as const

// ==================== 基础 CRUD ====================

// 获取任务列表
export function useTasks(params?: TaskQueryParams) {
  return useQuery({
    queryKey: TASK_QUERY_KEYS.list(params),
    queryFn: () => tasksApi.getTasks(params),
    staleTime: 2 * 60 * 1000, // 2分钟
    gcTime: 5 * 60 * 1000, // 5分钟
  })
}

// 获取单个任务
export function useTask(taskId: string) {
  return useQuery({
    queryKey: TASK_QUERY_KEYS.detail(taskId),
    queryFn: () => tasksApi.getTask(taskId),
    enabled: !!taskId,
    staleTime: 1 * 60 * 1000, // 1分钟
  })
}

// 获取任务统计信息
export function useTaskStats(params?: {
  project_id?: string
  date_from?: string
  date_to?: string
}) {
  return useQuery({
    queryKey: [TASK_QUERY_KEYS.stats(), params],
    queryFn: () => tasksApi.getTaskStats(params),
    staleTime: 10 * 60 * 1000, // 10分钟
    refetchInterval: 5 * 60 * 1000, // 5分钟自动刷新
  })
}

// ==================== 评论管理 ====================

// 获取任务评论
export function useTaskComments(taskId: string) {
  return useQuery({
    queryKey: TASK_QUERY_KEYS.comments(taskId),
    queryFn: () => tasksApi.getTaskComments(taskId),
    enabled: !!taskId,
    staleTime: 30 * 1000, // 30秒
  })
}

// ==================== 附件管理 ====================

// 获取任务附件
export function useTaskAttachments(taskId: string) {
  return useQuery({
    queryKey: TASK_QUERY_KEYS.attachments(taskId),
    queryFn: () => tasksApi.getTaskAttachments(taskId),
    enabled: !!taskId,
    staleTime: 2 * 60 * 1000, // 2分钟
  })
}

// ==================== 项目管理 ====================

// 获取项目列表
export function useProjects(params?: {
  page?: number
  pageSize?: number
  search?: string
  status?: Project['status']
}) {
  return useQuery({
    queryKey: [...TASK_QUERY_KEYS.projects(), params],
    queryFn: () => tasksApi.getProjects(params),
    staleTime: 5 * 60 * 1000, // 5分钟
  })
}

// ==================== Kanban 看板 ====================

// 获取 Kanban 看板
export function useKanbanBoard(boardId: string) {
  return useQuery({
    queryKey: TASK_QUERY_KEYS.kanban(boardId),
    queryFn: () => tasksApi.getKanbanBoard(boardId),
    enabled: !!boardId,
    staleTime: 30 * 1000, // 30秒
  })
}

// ==================== 搜索功能 ====================

// 搜索任务
export function useTaskSearch(query: string, filters?: Partial<TaskQueryParams>, enabled = true) {
  return useQuery({
    queryKey: TASK_QUERY_KEYS.search(query),
    queryFn: () => tasksApi.searchTasks(query, filters),
    enabled: enabled && query.length > 0,
    staleTime: 30 * 1000, // 30秒
  })
}

// 获取任务建议
export function useTaskSuggestions(userId: string, enabled = true) {
  return useQuery({
    queryKey: TASK_QUERY_KEYS.suggestions(userId),
    queryFn: () => tasksApi.getTaskSuggestions(userId),
    enabled: enabled && !!userId,
    staleTime: 5 * 60 * 1000, // 5分钟
  })
}

// ==================== Mutations ====================

// 创建任务
export function useCreateTask() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: TaskCreate) => tasksApi.createTask(data),
    onSuccess: (newTask) => {
      // 刷新任务列表
      queryClient.invalidateQueries({ queryKey: TASK_QUERY_KEYS.lists() })
      queryClient.invalidateQueries({ queryKey: TASK_QUERY_KEYS.stats() })

      // 可选：添加新任务到缓存
      queryClient.setQueryData(
        TASK_QUERY_KEYS.detail(newTask.id),
        newTask
      )

      toast.success('任务创建成功')
    },
    onError: (error: unknown) => {
      const errorMessage = error instanceof Error ? error.message : '任务创建失败'
      toast.error(errorMessage)
    },
  })
}

// 更新任务
export function useUpdateTask() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ taskId, data }: { taskId: string; data: TaskUpdate }) =>
      tasksApi.updateTask(taskId, data),
    onSuccess: (updatedTask, { taskId }) => {
      // 更新详情缓存
      queryClient.setQueryData(
        TASK_QUERY_KEYS.detail(taskId),
        updatedTask
      )

      // 刷新任务列表
      queryClient.invalidateQueries({ queryKey: TASK_QUERY_KEYS.lists() })
      queryClient.invalidateQueries({ queryKey: TASK_QUERY_KEYS.stats() })

      toast.success('任务更新成功')
    },
    onError: (error: unknown) => {
      const errorMessage = error instanceof Error ? error.message : '任务更新失败'
      toast.error(errorMessage)
    },
  })
}

// 删除任务
export function useDeleteTask() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (taskId: string) => tasksApi.deleteTask(taskId),
    onSuccess: (_, taskId) => {
      // 从缓存中移除任务
      queryClient.removeQueries({ queryKey: TASK_QUERY_KEYS.detail(taskId) })
      queryClient.removeQueries({ queryKey: TASK_QUERY_KEYS.comments(taskId) })
      queryClient.removeQueries({ queryKey: TASK_QUERY_KEYS.attachments(taskId) })

      // 刷新任务列表
      queryClient.invalidateQueries({ queryKey: TASK_QUERY_KEYS.lists() })
      queryClient.invalidateQueries({ queryKey: TASK_QUERY_KEYS.stats() })

      toast.success('任务删除成功')
    },
    onError: (error: unknown) => {
      const errorMessage = error instanceof Error ? error.message : '任务删除失败'
      toast.error(errorMessage)
    },
  })
}

// 批量更新任务
export function useBulkUpdateTasks() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: TaskBulkUpdate) => tasksApi.bulkUpdateTasks(data),
    onSuccess: (result) => {
      // 刷新任务列表
      queryClient.invalidateQueries({ queryKey: TASK_QUERY_KEYS.lists() })
      queryClient.invalidateQueries({ queryKey: TASK_QUERY_KEYS.stats() })

      if (result.failed_count > 0) {
        toast.warning(`部分更新失败，成功更新 ${result.updated_count} 个，失败 ${result.failed_count} 个`)
      } else {
        toast.success(`批量更新成功，共更新 ${result.updated_count} 个任务`)
      }
    },
    onError: (error: unknown) => {
      const errorMessage = error instanceof Error ? error.message : '批量更新失败'
      toast.error(errorMessage)
    },
  })
}

// 批量删除任务
export function useBulkDeleteTasks() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: TaskBulkDelete) => tasksApi.bulkDeleteTasks(data),
    onSuccess: (result) => {
      // 刷新任务列表
      queryClient.invalidateQueries({ queryKey: TASK_QUERY_KEYS.lists() })
      queryClient.invalidateQueries({ queryKey: TASK_QUERY_KEYS.stats() })

      if (result.failed_count > 0) {
        toast.warning(`部分删除失败，成功删除 ${result.deleted_count} 个，失败 ${result.failed_count} 个`)
      } else {
        toast.success(`批量删除成功，共删除 ${result.deleted_count} 个任务`)
      }
    },
    onError: (error: unknown) => {
      const errorMessage = error instanceof Error ? error.message : '批量删除失败'
      toast.error(errorMessage)
    },
  })
}

// ==================== 状态管理 Mutations ====================

// 更新任务状态
export function useUpdateTaskStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ taskId, status }: { taskId: string; status: TaskStatus }) =>
      tasksApi.updateTaskStatus(taskId, status),
    onSuccess: (updatedTask, { taskId }) => {
      queryClient.setQueryData(TASK_QUERY_KEYS.detail(taskId), updatedTask)
      queryClient.invalidateQueries({ queryKey: TASK_QUERY_KEYS.lists() })
      queryClient.invalidateQueries({ queryKey: TASK_QUERY_KEYS.stats() })
      toast.success('任务状态更新成功')
    },
    onError: (error: unknown) => {
      const errorMessage = error instanceof Error ? error.message : '状态更新失败'
      toast.error(errorMessage)
    },
  })
}

// 更新任务优先级
export function useUpdateTaskPriority() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ taskId, priority }: { taskId: string; priority: TaskPriority }) =>
      tasksApi.updateTaskPriority(taskId, priority),
    onSuccess: (updatedTask, { taskId }) => {
      queryClient.setQueryData(TASK_QUERY_KEYS.detail(taskId), updatedTask)
      queryClient.invalidateQueries({ queryKey: TASK_QUERY_KEYS.lists() })
      queryClient.invalidateQueries({ queryKey: TASK_QUERY_KEYS.stats() })
      toast.success('任务优先级更新成功')
    },
    onError: (error: unknown) => {
      const errorMessage = error instanceof Error ? error.message : '优先级更新失败'
      toast.error(errorMessage)
    },
  })
}

// 分配任务
export function useAssignTask() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ taskId, assigneeId }: { taskId: string; assigneeId: string }) =>
      tasksApi.assignTask(taskId, assigneeId),
    onSuccess: (updatedTask, { taskId }) => {
      queryClient.setQueryData(TASK_QUERY_KEYS.detail(taskId), updatedTask)
      queryClient.invalidateQueries({ queryKey: TASK_QUERY_KEYS.lists() })
      toast.success('任务分配成功')
    },
    onError: (error: unknown) => {
      const errorMessage = error instanceof Error ? error.message : '任务分配失败'
      toast.error(errorMessage)
    },
  })
}

// 取消任务分配
export function useUnassignTask() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (taskId: string) => tasksApi.unassignTask(taskId),
    onSuccess: (updatedTask, { taskId }) => {
      queryClient.setQueryData(TASK_QUERY_KEYS.detail(taskId), updatedTask)
      queryClient.invalidateQueries({ queryKey: TASK_QUERY_KEYS.lists() })
      toast.success('任务分配已取消')
    },
    onError: (error: unknown) => {
      const errorMessage = error instanceof Error ? error.message : '取消分配失败'
      toast.error(errorMessage)
    },
  })
}

// ==================== 评论管理 Mutations ====================

// 添加任务评论
export function useAddTaskComment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ taskId, data }: { taskId: string; data: TaskCommentCreate }) =>
      tasksApi.addTaskComment(taskId, data),
    onSuccess: (newComment, { taskId }) => {
      // 更新评论列表
      queryClient.setQueryData(
        TASK_QUERY_KEYS.comments(taskId),
        (old: TaskComment[] | undefined) => [...(old || []), newComment]
      )

      // 更新任务的 updated_at
      queryClient.invalidateQueries({ queryKey: TASK_QUERY_KEYS.detail(taskId) })

      toast.success('评论添加成功')
    },
    onError: (error: unknown) => {
      const errorMessage = error instanceof Error ? error.message : '评论添加失败'
      toast.error(errorMessage)
    },
  })
}

// 更新任务评论
export function useUpdateTaskComment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ commentId, data }: { commentId: string; data: TaskCommentUpdate }) =>
      tasksApi.updateTaskComment(commentId, data),
    onSuccess: (updatedComment, { commentId }) => {
      // 找到任务ID并更新评论缓存
      const commentsQuery = queryClient.getQueriesData({
        queryKey: TASK_QUERY_KEYS.comments,
      })

      commentsQuery.forEach(([queryKey, comments]) => {
        if (Array.isArray(comments)) {
          queryClient.setQueryData(
            queryKey,
            comments.map((comment: TaskComment) =>
              comment.id === commentId ? updatedComment : comment
            )
          )
        }
      })

      toast.success('评论更新成功')
    },
    onError: (error: unknown) => {
      const errorMessage = error instanceof Error ? error.message : '评论更新失败'
      toast.error(errorMessage)
    },
  })
}

// 删除任务评论
export function useDeleteTaskComment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (commentId: string) => tasksApi.deleteTaskComment(commentId),
    onSuccess: (_, commentId) => {
      // 从评论列表中移除
      const commentsQuery = queryClient.getQueriesData({
        queryKey: TASK_QUERY_KEYS.comments,
      })

      commentsQuery.forEach(([queryKey]) => {
        queryClient.setQueryData(
          queryKey,
          (old: TaskComment[] | undefined) => old?.filter(comment => comment.id !== commentId)
        )
      })

      toast.success('评论删除成功')
    },
    onError: (error: unknown) => {
      const errorMessage = error instanceof Error ? error.message : '评论删除失败'
      toast.error(errorMessage)
    },
  })
}

// ==================== 附件管理 Mutations ====================

// 上传任务附件
export function useUploadTaskAttachment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ taskId, data }: { taskId: string; data: TaskAttachmentUpload }) =>
      tasksApi.uploadTaskAttachment(taskId, data),
    onSuccess: (newAttachment, { taskId }) => {
      // 更新附件列表
      queryClient.setQueryData(
        TASK_QUERY_KEYS.attachments(taskId),
        (old: TaskAttachment[] | undefined) => [...(old || []), newAttachment]
      )

      toast.success('附件上传成功')
    },
    onError: (error: unknown) => {
      const errorMessage = error instanceof Error ? error.message : '附件上传失败'
      toast.error(errorMessage)
    },
  })
}

// 删除任务附件
export function useDeleteTaskAttachment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (attachmentId: string) => tasksApi.deleteTaskAttachment(attachmentId),
    onSuccess: (_, attachmentId) => {
      // 从附件列表中移除
      const attachmentsQuery = queryClient.getQueriesData({
        queryKey: TASK_QUERY_KEYS.attachments,
      })

      attachmentsQuery.forEach(([queryKey]) => {
        queryClient.setQueryData(
          queryKey,
          (old: TaskAttachment[] | undefined) => old?.filter(attachment => attachment.id !== attachmentId)
        )
      })

      toast.success('附件删除成功')
    },
    onError: (error: unknown) => {
      const errorMessage = error instanceof Error ? error.message : '附件删除失败'
      toast.error(errorMessage)
    },
  })
}

// ==================== 时间跟踪 Mutations ====================

// 开始任务计时
export function useStartTaskTimer() {
  return useMutation({
    mutationFn: (taskId: string) => tasksApi.startTaskTimer(taskId),
    onSuccess: (result) => {
      toast.success('计时已开始')
      // 可以存储 timer_id 到状态管理中
      localStorage.setItem('active_timer', result.timer_id)
    },
    onError: (error: unknown) => {
      const errorMessage = error instanceof Error ? error.message : '开始计时失败'
      toast.error(errorMessage)
    },
  })
}

// 停止任务计时
export function useStopTaskTimer() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (timerId: string) => tasksApi.stopTaskTimer(timerId),
    onSuccess: (result) => {
      // 清除本地存储的 timer_id
      localStorage.removeItem('active_timer')

      // 刷新相关数据
      queryClient.invalidateQueries({ queryKey: TASK_QUERY_KEYS.lists() })
      queryClient.invalidateQueries({ queryKey: TASK_QUERY_KEYS.stats() })

      toast.success(`计时已停止，共工作 ${Math.round(result.duration / 60)} 分钟`)
    },
    onError: (error: unknown) => {
      const errorMessage = error instanceof Error ? error.message : '停止计时失败'
      toast.error(errorMessage)
    },
  })
}

// 记录工作时间
export function useLogTaskTime() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ taskId, data }: { taskId: string; data: TimeLogCreate }) =>
      tasksApi.logTaskTime(taskId, data),
    onSuccess: (timeLog, { taskId }) => {
      queryClient.setQueryData(
        TASK_QUERY_KEYS.timeLogs(taskId),
        (old: TimeLog[] | undefined) => [...(old || []), timeLog]
      )

      queryClient.invalidateQueries({ queryKey: TASK_QUERY_KEYS.detail(taskId) })

      toast.success('工作时间记录成功')
    },
    onError: (error: unknown) => {
      const errorMessage = error instanceof Error ? error.message : '时间记录失败'
      toast.error(errorMessage)
    },
  })
}

// ==================== 导入导出 Mutations ====================

// 导入任务
export function useImportTasks() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: TaskImportRequest) => tasksApi.importTasks(data),
    onSuccess: (result) => {
      // 刷新任务列表
      queryClient.invalidateQueries({ queryKey: TASK_QUERY_KEYS.lists() })
      queryClient.invalidateQueries({ queryKey: TASK_QUERY_KEYS.stats() })

      if (result.failed_count > 0) {
        toast.warning(`部分导入失败，成功导入 ${result.imported_count} 个，失败 ${result.failed_count} 个`)
      } else {
        toast.success(`任务导入成功，共导入 ${result.imported_count} 个任务`)
      }
    },
    onError: (error: unknown) => {
      const errorMessage = error instanceof Error ? error.message : '任务导入失败'
      toast.error(errorMessage)
    },
  })
}

// 导出任务
export function useExportTasks() {
  return useMutation({
    mutationFn: (data: TaskExportRequest) => tasksApi.exportTasks(data),
    onSuccess: (result) => {
      // 可以自动触发下载或显示下载链接
      window.open(result.download_url, '_blank')
      toast.success('任务数据导出成功')
    },
    onError: (error: unknown) => {
      const errorMessage = error instanceof Error ? error.message : '导出失败'
      toast.error(errorMessage)
    },
  })
}

// 获取导入模板
export function useGetImportTemplate() {
  return useMutation({
    mutationFn: (format: 'csv' | 'json' | 'xlsx') => tasksApi.getImportTemplate(format),
    onSuccess: (result) => {
      window.open(result.download_url, '_blank')
      toast.success('导入模板下载成功')
    },
    onError: (error: unknown) => {
      const errorMessage = error instanceof Error ? error.message : '模板下载失败'
      toast.error(errorMessage)
    },
  })
}

// ==================== Kanban 看板 Mutations ====================

// 移动任务到不同列
export function useMoveTaskToColumn() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ taskId, targetColumnId, position }: {
      taskId: string
      targetColumnId: string
      position?: number
    }) => tasksApi.moveTaskToColumn(taskId, targetColumnId, position),
    onSuccess: (updatedTask, { taskId }) => {
      queryClient.setQueryData(TASK_QUERY_KEYS.detail(taskId), updatedTask)

      // 刷新所有看板缓存
      queryClient.invalidateQueries({
        queryKey: TASK_QUERY_KEYS.all.filter(key => key === 'kanban')
      })

      queryClient.invalidateQueries({ queryKey: TASK_QUERY_KEYS.lists() })

      toast.success('任务移动成功')
    },
    onError: (error: unknown) => {
      const errorMessage = error instanceof Error ? error.message : '任务移动失败'
      toast.error(errorMessage)
    },
  })
}
```

---

## 🔄 阶段 3: 组件集成

### 步骤 3.1: 更新 Tasks Provider

**文件**: `src/develop/(views)/official-api/tasks/context/tasks-provider.tsx`

```typescript
import React, { useState, useEffect } from 'react'
import useDialogState from '@/develop/(hooks)/use-dialog-state.tsx'
import { type TasksDialogType } from './tasks-context-types.tsx'
import { type Task } from '../data/schema.ts'
import { TasksContext } from './tasks-context.tsx'

// 导入 API Hooks
import {
  useTasks,
  useCreateTask,
  useUpdateTask,
  useDeleteTask,
  useBulkDeleteTasks,
  useImportTasks,
  useExportTasks,
  useTaskStats,
  useUpdateTaskStatus,
  useUpdateTaskPriority,
  useAssignTask,
  useUnassignTask,
  type TaskQueryParams,
  TaskStatus,
  TaskPriority,
} from '@/develop/(services)/hooks/useTasksApi'

// 任务管理状态提供者组件 - 集成 API 数据和操作
export function TasksProvider({ children }: { children: React.ReactNode }) {
  // 现有的对话框状态管理
  const [open, setOpen] = useDialogState<TasksDialogType>(null)
  const [currentRow, setCurrentRow] = useState<Task | null>(null)
  const [selectedRows, setSelectedRows] = useState<Task[]>([])

  // 查询参数状态
  const [queryParams, setQueryParams] = useState<TaskQueryParams>({
    page: 1,
    pageSize: 10,
    sortBy: 'created_at',
    sortOrder: 'desc',
  })

  // 筛选器状态
  const [filters, setFilters] = useState({
    status: [] as TaskStatus[],
    priority: [] as TaskPriority[],
    label: [] as string[],
    assignee_id: [] as string[],
  })

  // API 数据和操作
  const tasksQuery = useTasks({ ...queryParams, ...filters })
  const taskStatsQuery = useTaskStats()

  // Mutations
  const createTaskMutation = useCreateTask()
  const updateTaskMutation = useUpdateTask()
  const deleteTaskMutation = useDeleteTask()
  const bulkDeleteTasksMutation = useBulkDeleteTasks()
  const importTasksMutation = useImportTasks()
  const exportTasksMutation = useExportTasks()

  // 状态操作
  const updateStatusMutation = useUpdateTaskStatus()
  const updatePriorityMutation = useUpdateTaskPriority()
  const assignTaskMutation = useAssignTask()
  const unassignTaskMutation = useUnassignTask()

  // 计时器状态
  const [activeTimer, setActiveTimer] = useState<{
    taskId: string
    timerId: string
    startTime: Date
  } | null>(null)

  // 初始化计时器状态
  useEffect(() => {
    const savedTimer = localStorage.getItem('active_timer')
    if (savedTimer) {
      try {
        const timerData = JSON.parse(savedTimer)
        setActiveTimer(timerData)
      } catch (error) {
        console.error('Failed to parse saved timer data:', error)
        localStorage.removeItem('active_timer')
      }
    }
  }, [])

  // 处理查询参数变化
  const handleQueryParamsChange = (newParams: Partial<TaskQueryParams>) => {
    setQueryParams(prev => ({ ...prev, ...newParams }))
  }

  // 处理筛选器变化
  const handleFiltersChange = (newFilters: Partial<typeof filters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }))
    // 重置到第一页
    handleQueryParamsChange({ page: 1 })
  }

  // 处理页面变化
  const handlePageChange = (page: number) => {
    handleQueryParamsChange({ page })
  }

  // 处理搜索
  const handleSearch = (search: string) => {
    handleQueryParamsChange({ search, page: 1 })
  }

  // 处理排序
  const handleSort = (sortBy: string, sortOrder: 'asc' | 'desc') => {
    handleQueryParamsChange({
      sortBy: sortBy as TaskQueryParams['sortBy'],
      sortOrder,
      page: 1
    })
  }

  // 处理任务状态变更
  const handleStatusChange = (taskId: string, status: TaskStatus) => {
    updateStatusMutation.mutate({ taskId, status })
  }

  // 处理任务优先级变更
  const handlePriorityChange = (taskId: string, priority: TaskPriority) => {
    updatePriorityMutation.mutate({ taskId, priority })
  }

  // 处理任务分配
  const handleAssignTask = (taskId: string, assigneeId: string) => {
    assignTaskMutation.mutate({ taskId, assigneeId })
  }

  // 处理取消分配
  const handleUnassignTask = (taskId: string) => {
    unassignTaskMutation.mutate(taskId)
  }

  // 处理多选
  const handleSelectRows = (rows: Task[]) => {
    setSelectedRows(rows)
  }

  // 处理全选
  const handleSelectAll = () => {
    if (tasksQuery.data?.list) {
      setSelectedRows(
        selectedRows.length === tasksQuery.data.list.length
          ? []
          : tasksQuery.data.list
      )
    }
  }

  // 清除选择
  const handleClearSelection = () => {
    setSelectedRows([])
  }

  // 刷新数据
  const refetch = () => {
    tasksQuery.refetch()
    taskStatsQuery.refetch()
  }

  // 重置筛选器
  const resetFilters = () => {
    setFilters({
      status: [],
      priority: [],
      label: [],
      assignee_id: [],
    })
    handleQueryParamsChange({ page: 1, search: undefined })
  }

  // 导出选中的任务
  const exportSelectedTasks = () => {
    if (selectedRows.length > 0) {
      exportTasksMutation.mutate({
        format: 'xlsx',
        filters: {
          taskIds: selectedRows.map(task => task.id),
        },
      })
    }
  }

  // 批量删除选中的任务
  const bulkDeleteSelectedTasks = () => {
    if (selectedRows.length > 0) {
      bulkDeleteTasksMutation.mutate({
        taskIds: selectedRows.map(task => task.id),
        reason: '批量删除',
      })
      setSelectedRows([])
    }
  }

  return (
    <TasksContext
      value={{
        // 现有状态
        open,
        setOpen,
        currentRow,
        setCurrentRow,

        // 选择状态
        selectedRows,
        setSelectedRows: handleSelectRows,
        selectAll: handleSelectAll,
        clearSelection: handleClearSelection,

        // API 数据
        tasks: tasksQuery.data?.list || [],
        taskStats: taskStatsQuery.data,
        isLoading: tasksQuery.isLoading,
        isStatsLoading: taskStatsQuery.isLoading,
        error: tasksQuery.error,
        statsError: taskStatsQuery.error,

        // 分页信息
        pagination: {
          page: tasksQuery.data?.page || 1,
          pageSize: tasksQuery.data?.pageSize || 10,
          total: tasksQuery.data?.total || 0,
          totalPages: tasksQuery.data?.totalPages || 0,
        },

        // 查询和筛选
        queryParams,
        onQueryParamsChange: handleQueryParamsChange,
        onPageChange: handlePageChange,
        onSearch: handleSearch,
        onSort: handleSort,

        filters,
        onFiltersChange: handleFiltersChange,
        resetFilters,

        // 操作方法
        createTask: createTaskMutation.mutate,
        updateTask: updateTaskMutation.mutate,
        deleteTask: deleteTaskMutation.mutate,
        bulkDeleteTasks: bulkDeleteTasksMutation.mutate,
        importTasks: importTasksMutation.mutate,
        exportTasks: exportTasksMutation.mutate,
        exportSelectedTasks,

        // 状态操作
        updateStatus: handleStatusChange,
        updatePriority: handlePriorityChange,
        assignTask: handleAssignTask,
        unassignTask: handleUnassignTask,

        // 加载状态
        isCreating: createTaskMutation.isPending,
        isUpdating: updateTaskMutation.isPending,
        isDeleting: deleteTaskMutation.isPending,
        isBulkDeleting: bulkDeleteTasksMutation.isPending,
        isImporting: importTasksMutation.isPending,
        isExporting: exportTasksMutation.isPending,

        // 计时器状态
        activeTimer,
        setActiveTimer,

        // 刷新方法
        refetch,
      }}
    >
      {children}
    </TasksContext>
  )
}
```

### 步骤 3.2: 更新 Context 类型定义

**文件**: `src/develop/(views)/official-api/tasks/context/tasks-context-types.tsx`

```typescript
import { type Task } from '../data/schema'
import { type TasksDialogType } from './tasks-context-types'
import type { TaskStats, TaskQueryParams, TaskStatus, TaskPriority } from '@/develop/(services)/api/types'

// 扩展 Tasks Context 类型
export interface TasksContextType {
  // 现有状态
  open: TasksDialogType
  setOpen: (dialog: TasksDialogType) => void
  currentRow: Task | null
  setCurrentRow: (row: Task | null) => void

  // 选择状态
  selectedRows: Task[]
  setSelectedRows: (rows: Task[]) => void
  selectAll: () => void
  clearSelection: () => void

  // API 数据
  tasks: Task[]
  taskStats?: TaskStats
  isLoading: boolean
  isStatsLoading: boolean
  error: unknown
  statsError: unknown

  // 分页信息
  pagination: {
    page: number
    pageSize: number
    total: number
    totalPages: number
  }

  // 查询和筛选
  queryParams: TaskQueryParams
  onQueryParamsChange: (params: Partial<TaskQueryParams>) => void
  onPageChange: (page: number) => void
  onSearch: (search: string) => void
  onSort: (sortBy: string, sortOrder: 'asc' | 'desc') => void

  // 筛选器
  filters: {
    status: TaskStatus[]
    priority: TaskPriority[]
    label: string[]
    assignee_id: string[]
  }
  onFiltersChange: (filters: Partial<typeof filters>) => void
  resetFilters: () => void

  // 操作方法
  createTask: (data: any) => void
  updateTask: ({ taskId, data }: { taskId: string; data: any }) => void
  deleteTask: (taskId: string) => void
  bulkDeleteTasks: (data: any) => void
  importTasks: (data: any) => void
  exportTasks: (data: any) => void
  exportSelectedTasks: () => void

  // 状态操作
  updateStatus: (taskId: string, status: TaskStatus) => void
  updatePriority: (taskId: string, priority: TaskPriority) => void
  assignTask: (taskId: string, assigneeId: string) => void
  unassignTask: (taskId: string) => void

  // 加载状态
  isCreating: boolean
  isUpdating: boolean
  isDeleting: boolean
  isBulkDeleting: boolean
  isImporting: boolean
  isExporting: boolean

  // 计时器状态
  activeTimer: {
    taskId: string
    timerId: string
    startTime: Date
  } | null
  setActiveTimer: (timer: any) => void

  // 刷新方法
  refetch: () => void
}
```

### 步骤 3.3: 更新表格组件

**文件**: `src/develop/(views)/official-api/tasks/components/tasks-table.tsx`

```typescript
import * as React from 'react'
import { DataTable, type DataTableProps } from '@/components/data-table'
import { columns } from './tasks-columns'
import { useTasksContext } from '../context/use-tasks'
import { DataTableSkeleton } from '@/components/data-table-skeleton'
import { ErrorMessage } from '@/components/error-message'
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import { Trash2, Download } from 'lucide-react'

interface TasksTableProps extends Partial<DataTableProps<Task>> {
  className?: string
}

export function TasksTable({ className, ...props }: TasksTableProps) {
  const {
    tasks,
    isLoading,
    error,
    pagination,
    selectedRows,
    setSelectedRows,
    selectAll,
    clearSelection,
    onPageChange,
    onSort,
    queryParams,
    exportSelectedTasks,
    bulkDeleteTasks,
    isBulkDeleting,
    isExporting,
  } = useTasksContext()

  // 处理表格变化
  const handleSortingChange: DataTableProps<Task>['onSortingChange'] = (sorting) => {
    if (sorting.length > 0) {
      const { id, desc } = sorting[0]
      onSort(id as string, desc ? 'desc' : 'asc')
    }
  }

  const handlePaginationChange: DataTableProps<Task>['onPaginationChange'] = (updater) => {
    if (typeof updater === 'function') {
      const newPagination = updater({
        pageIndex: pagination.page - 1, // 转换为 0-based index
        pageSize: pagination.pageSize,
      })
      onPageChange(newPagination.pageIndex + 1) // 转换回 1-based index
    }
  }

  // 处理行选择
  const handleRowSelectionChange = (selectedRowIds: string[]) => {
    const selectedTasks = tasks.filter(task => selectedRowIds.includes(task.id))
    setSelectedRows(selectedTasks)
  }

  // 全选处理
  const handleSelectAllChange = (checked: boolean) => {
    if (checked) {
      setSelectedRows(tasks)
    } else {
      setSelectedRows([])
    }
  }

  // 批量操作
  const handleBulkDelete = () => {
    if (selectedRows.length > 0) {
      bulkDeleteTasks({
        taskIds: selectedRows.map(task => task.id),
        reason: '批量删除',
      })
    }
  }

  // 加载状态
  if (isLoading) {
    return <DataTableSkeleton />
  }

  // 错误状态
  if (error) {
    return (
      <ErrorMessage
        title="加载失败"
        description="无法加载任务数据，请稍后重试"
        onRetry={() => window.location.reload()}
      />
    )
  }

  // 自定义列定义（包含选择列）
  const extendedColumns = React.useMemo(() => {
    const selectColumn = {
      id: 'select',
      header: ({ table }: any) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected()}
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }: any) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    }

    return [selectColumn, ...columns]
  }, [columns])

  return (
    <div className="space-y-4">
      {/* 批量操作栏 */}
      {selectedRows.length > 0 && (
        <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/50">
          <div className="text-sm font-medium">
            已选择 {selectedRows.length} 个任务
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedRows([])}
            >
              取消选择
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={exportSelectedTasks}
              disabled={isExporting}
            >
              <Download className="mr-2 h-4 w-4" />
              导出选中
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleBulkDelete}
              disabled={isBulkDeleting}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              删除选中 ({selectedRows.length})
            </Button>
          </div>
        </div>
      )}

      {/* 数据表格 */}
      <DataTable<Task>
        data={tasks}
        columns={extendedColumns}
        className={className}
        {...props}
        // 分页配置
        pageCount={pagination.totalPages}
        manualPagination
        pagination={{
          pageIndex: pagination.page - 1,
          pageSize: pagination.pageSize,
        }}
        onPaginationChange={handlePaginationChange}

        // 排序配置
        manualSorting
        sorting={[
          {
            id: queryParams.sortBy || 'created_at',
            desc: queryParams.sortOrder === 'desc',
          },
        ]}
        onSortingChange={handleSortingChange}

        // 行选择配置
        enableRowSelection
        onRowSelectionChange={handleRowSelectionChange}

        // 其他配置
        rowCount={pagination.total}
        defaultColumn={{
          minSize: 0,
          maxSize: 1200,
          size: 160,
        }}
      />
    </div>
  )
}
```

### 步骤 3.4: 更新任务抽屉组件

**文件**: `src/develop/(views)/official-api/tasks/components/tasks-mutate-drawer.tsx`

```typescript
import * as React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { CalendarIcon } from 'lucide-react'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'
import { useTasksContext } from '../context/use-tasks'
import { Loader2 } from 'lucide-react'
import { TaskStatus, TaskPriority, TaskLabel } from '@/develop/(services)/api/types'

// 表单验证 Schema
const taskFormSchema = z.object({
  title: z.string().min(1, '任务标题不能为空').max(200, '标题不能超过200个字符'),
  description: z.string().optional(),
  status: z.enum(['backlog', 'todo', 'in_progress', 'done', 'canceled']),
  priority: z.enum(['low', 'medium', 'high', 'critical']),
  label: z.enum(['bug', 'feature', 'documentation', 'enhancement', 'hotfix']),
  assignee_id: z.string().optional(),
  project_id: z.string().optional(),
  due_date: z.string().optional(),
  estimated_hours: z.number().min(0, '预估工时不能为负数').optional(),
  tags: z.array(z.string()).optional(),
})

type TaskFormValues = z.infer<typeof taskFormSchema>

interface TasksMutateDrawerProps {
  isOpen: boolean
  onClose: () => void
}

// 状态选项
const statusOptions = [
  { value: 'backlog', label: 'Backlog' },
  { value: 'todo', label: '待办' },
  { value: 'in_progress', label: '进行中' },
  { value: 'done', label: '已完成' },
  { value: 'canceled', label: '已取消' },
]

// 优先级选项
const priorityOptions = [
  { value: 'low', label: '低' },
  { value: 'medium', label: '中' },
  { value: 'high', label: '高' },
  { value: 'critical', label: '紧急' },
]

// 标签选项
const labelOptions = [
  { value: 'bug', label: 'Bug' },
  { value: 'feature', label: '功能' },
  { value: 'documentation', label: '文档' },
  { value: 'enhancement', label: '改进' },
  { value: 'hotfix', label: '热修复' },
]

export function TasksMutateDrawer({ isOpen, onClose }: TasksMutateDrawerProps) {
  const { currentRow, createTask, updateTask, isCreating, isUpdating } = useTasksContext()
  const isEdit = !!currentRow

  // 表单配置
  const form = useForm<TaskFormValues>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: {
      title: currentRow?.title || '',
      description: currentRow?.description || '',
      status: currentRow?.status || 'todo',
      priority: currentRow?.priority || 'medium',
      label: currentRow?.label || 'feature',
      assignee_id: currentRow?.assignee_id || '',
      project_id: currentRow?.project_id || '',
      due_date: currentRow?.due_date ? new Date(currentRow.due_date).toISOString().split('T')[0] : '',
      estimated_hours: currentRow?.estimated_hours || undefined,
      tags: currentRow?.tags || [],
    },
  })

  // 重置表单
  React.useEffect(() => {
    if (isOpen) {
      form.reset({
        title: currentRow?.title || '',
        description: currentRow?.description || '',
        status: currentRow?.status || 'todo',
        priority: currentRow?.priority || 'medium',
        label: currentRow?.label || 'feature',
        assignee_id: currentRow?.assignee_id || '',
        project_id: currentRow?.project_id || '',
        due_date: currentRow?.due_date ? new Date(currentRow.due_date).toISOString().split('T')[0] : '',
        estimated_hours: currentRow?.estimated_hours || undefined,
        tags: currentRow?.tags || [],
      })
    }
  }, [isOpen, currentRow, form])

  // 提交处理
  const onSubmit = (data: TaskFormValues) => {
    if (isEdit && currentRow) {
      updateTask({ taskId: currentRow.id, data })
    } else {
      createTask(data)
    }
    onClose()
  }

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-[600px] sm:w-[800px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{isEdit ? '编辑任务' : '创建任务'}</SheetTitle>
          <SheetDescription>
            {isEdit ? '修改任务信息。点击保存以应用更改。' : '创建新任务。填写任务详细信息。'}
          </SheetDescription>
        </SheetHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 mt-6">
            {/* 基本信息 */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">基本信息</h3>

              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>任务标题 *</FormLabel>
                    <FormControl>
                      <Input placeholder="请输入任务标题" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>任务描述</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="请输入任务描述"
                        rows={4}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* 状态和优先级 */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">状态和优先级</h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>状态</FormLabel>
                      <FormControl>
                        <select
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          {...field}
                        >
                          {statusOptions.map(option => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="priority"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>优先级</FormLabel>
                      <FormControl>
                        <select
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          {...field}
                        >
                          {priorityOptions.map(option => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="label"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>标签</FormLabel>
                      <FormControl>
                        <select
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          {...field}
                        >
                          {labelOptions.map(option => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* 分配和时间 */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">分配和时间</h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="assignee_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>分配给</FormLabel>
                      <FormControl>
                        <Input placeholder="选择分配人员" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="project_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>项目</FormLabel>
                      <FormControl>
                        <Input placeholder="选择项目" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="due_date"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>截止日期</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className={cn(
                                'w-full pl-3 text-left font-normal',
                                !field.value && 'text-muted-foreground'
                              )}
                            >
                              {field.value ? (
                                format(new Date(field.value), 'PPP')
                              ) : (
                                <span>选择日期</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value ? new Date(field.value) : undefined}
                            onSelect={(date) =>
                              field.onChange(date ? date.toISOString().split('T')[0] : '')
                            }
                            disabled={(date) =>
                              date < new Date('1900-01-01')
                            }
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="estimated_hours"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>预估工时 (小时)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="0"
                          min="0"
                          step="0.5"
                          {...field}
                          onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* 标签 */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">标签</h3>

              <FormField
                control={form.control}
                name="tags"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>自定义标签</FormLabel>
                    <FormControl>
                      <Input placeholder="输入标签，按回车添加" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <SheetFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                取消
              </Button>
              <Button type="submit" disabled={isCreating || isUpdating}>
                {(isCreating || isUpdating) && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {isEdit ? '保存更改' : '创建任务'}
              </Button>
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  )
}
```

---

## 🎨 阶段 4: 高级功能组件

### 步骤 4.1: 创建任务筛选器组件

**文件**: `src/develop/(views)/official-api/tasks/components/tasks-filters.tsx`

```typescript
import * as React from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { CalendarIcon, Search, X, RotateCcw } from 'lucide-react'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'
import { useTasksContext } from '../context/use-tasks'
import { TaskStatus, TaskPriority, TaskLabel } from '@/develop/(services)/api/types'

export function TasksFilters() {
  const {
    queryParams,
    filters,
    onQueryParamsChange,
    onFiltersChange,
    resetFilters,
  } = useTasksContext()

  // 状态选项
  const statusOptions = [
    { value: 'backlog', label: 'Backlog', color: 'bg-gray-500' },
    { value: 'todo', label: '待办', color: 'bg-blue-500' },
    { value: 'in_progress', label: '进行中', color: 'bg-yellow-500' },
    { value: 'done', label: '已完成', color: 'bg-green-500' },
    { value: 'canceled', label: '已取消', color: 'bg-red-500' },
  ]

  // 优先级选项
  const priorityOptions = [
    { value: 'low', label: '低', color: 'bg-gray-400' },
    { value: 'medium', label: '中', color: 'bg-yellow-400' },
    { value: 'high', label: '高', color: 'bg-orange-400' },
    { value: 'critical', label: '紧急', color: 'bg-red-500' },
  ]

  // 标签选项
  const labelOptions = [
    { value: 'bug', label: 'Bug', color: 'bg-red-100 text-red-800' },
    { value: 'feature', label: '功能', color: 'bg-blue-100 text-blue-800' },
    { value: 'documentation', label: '文档', color: 'bg-green-100 text-green-800' },
    { value: 'enhancement', label: '改进', color: 'bg-purple-100 text-purple-800' },
    { value: 'hotfix', label: '热修复', color: 'bg-orange-100 text-orange-800' },
  ]

  // 处理状态筛选变化
  const handleStatusChange = (status: TaskStatus) => {
    const newStatus = filters.status.includes(status)
      ? filters.status.filter(s => s !== status)
      : [...filters.status, status]
    onFiltersChange({ status: newStatus })
  }

  // 处理优先级筛选变化
  const handlePriorityChange = (priority: TaskPriority) => {
    const newPriority = filters.priority.includes(priority)
      ? filters.priority.filter(p => p !== priority)
      : [...filters.priority, priority]
    onFiltersChange({ priority: newPriority })
  }

  // 处理标签筛选变化
  const handleLabelChange = (label: TaskLabel) => {
    const newLabel = filters.label.includes(label)
      ? filters.label.filter(l => l !== label)
      : [...filters.label, label]
    onFiltersChange({ label: newLabel })
  }

  // 移除单个筛选条件
  const removeFilter = (type: string, value: string) => {
    switch (type) {
      case 'status':
        onFiltersChange({
          status: filters.status.filter(s => s !== value)
        })
        break
      case 'priority':
        onFiltersChange({
          priority: filters.priority.filter(p => p !== value)
        })
        break
      case 'label':
        onFiltersChange({
          label: filters.label.filter(l => l !== value)
        })
        break
      case 'assignee':
        onFiltersChange({
          assignee_id: filters.assignee_id.filter(a => a !== value)
        })
        break
      default:
        break
    }
  }

  // 计算活跃的筛选器数量
  const activeFiltersCount =
    filters.status.length +
    filters.priority.length +
    filters.label.length +
    filters.assignee_id.length +
    (queryParams.search ? 1 : 0)

  return (
    <div className="space-y-4 p-4 border rounded-lg bg-muted/50">
      {/* 搜索框 */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="搜索任务标题、描述..."
          value={queryParams.search || ''}
          onChange={(e) => onQueryParamsChange({ search: e.target.value })}
          className="pl-10"
        />
      </div>

      {/* 筛选选项 */}
      <div className="space-y-4">
        {/* 状态筛选 */}
        <div>
          <label className="text-sm font-medium mb-2 block">状态</label>
          <div className="flex flex-wrap gap-2">
            {statusOptions.map(option => (
              <Button
                key={option.value}
                variant={filters.status.includes(option.value) ? "default" : "outline"}
                size="sm"
                onClick={() => handleStatusChange(option.value)}
                className="text-xs"
              >
                <span className={`w-2 h-2 rounded-full ${option.color} mr-1`} />
                {option.label}
              </Button>
            ))}
          </div>
        </div>

        {/* 优先级筛选 */}
        <div>
          <label className="text-sm font-medium mb-2 block">优先级</label>
          <div className="flex flex-wrap gap-2">
            {priorityOptions.map(option => (
              <Button
                key={option.value}
                variant={filters.priority.includes(option.value) ? "default" : "outline"}
                size="sm"
                onClick={() => handlePriorityChange(option.value)}
                className="text-xs"
              >
                <span className={`w-2 h-2 rounded-full ${option.color} mr-1`} />
                {option.label}
              </Button>
            ))}
          </div>
        </div>

        {/* 标签筛选 */}
        <div>
          <label className="text-sm font-medium mb-2 block">标签</label>
          <div className="flex flex-wrap gap-2">
            {labelOptions.map(option => (
              <Badge
                key={option.value}
                variant={filters.label.includes(option.value) ? "default" : "secondary"}
                className={`cursor-pointer ${filters.label.includes(option.value) ? option.color : ''}`}
                onClick={() => handleLabelChange(option.value)}
              >
                {option.label}
              </Badge>
            ))}
          </div>
        </div>

        {/* 分配人筛选 */}
        <div>
          <label className="text-sm font-medium mb-2 block">分配给</label>
          <Select
            value=""
            onValueChange={(value) => {
              if (value && !filters.assignee_id.includes(value)) {
                onFiltersChange({
                  assignee_id: [...filters.assignee_id, value]
                })
              }
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="选择分配人员" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="user1">张三</SelectItem>
              <SelectItem value="user2">李四</SelectItem>
              <SelectItem value="user3">王五</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* 活跃筛选器显示 */}
      {activeFiltersCount > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">已选择筛选条件</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={resetFilters}
              className="text-xs"
            >
              <RotateCcw className="mr-1 h-3 w-3" />
              重置筛选
            </Button>
          </div>

          <div className="flex flex-wrap gap-2">
            {/* 搜索条件 */}
            {queryParams.search && (
              <Badge variant="secondary" className="gap-1">
                搜索: {queryParams.search}
                <X
                  className="h-3 w-3 cursor-pointer"
                  onClick={() => onQueryParamsChange({ search: undefined })}
                />
              </Badge>
            )}

            {/* 状态筛选 */}
            {filters.status.map(status => (
              <Badge key={status} variant="secondary" className="gap-1">
                状态: {statusOptions.find(s => s.value === status)?.label}
                <X
                  className="h-3 w-3 cursor-pointer"
                  onClick={() => removeFilter('status', status)}
                />
              </Badge>
            ))}

            {/* 优先级筛选 */}
            {filters.priority.map(priority => (
              <Badge key={priority} variant="secondary" className="gap-1">
                优先级: {priorityOptions.find(p => p.value === priority)?.label}
                <X
                  className="h-3 w-3 cursor-pointer"
                  onClick={() => removeFilter('priority', priority)}
                />
              </Badge>
            ))}

            {/* 标签筛选 */}
            {filters.label.map(label => (
              <Badge key={label} variant="secondary" className="gap-1">
                标签: {labelOptions.find(l => l.value === label)?.label}
                <X
                  className="h-3 w-3 cursor-pointer"
                  onClick={() => removeFilter('label', label)}
                />
              </Badge>
            ))}

            {/* 分配人筛选 */}
            {filters.assignee_id.map(assigneeId => (
              <Badge key={assigneeId} variant="secondary" className="gap-1">
                分配给: {assigneeId}
                <X
                  className="h-3 w-3 cursor-pointer"
                  onClick={() => removeFilter('assignee', assigneeId)}
                />
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
```

### 步骤 4.2: 创建任务统计卡片组件

**文件**: `src/develop/(views)/official-api/tasks/components/tasks-stats.tsx`

```typescript
import * as React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { useTasksContext } from '../context/use-tasks'
import {
  CheckCircle,
  Clock,
  AlertCircle,
  XCircle,
  TrendingUp,
  Timer,
  Target,
  Users,
} from 'lucide-react'
import { TaskStatus, TaskPriority } from '@/develop/(services)/api/types'

export function TasksStats() {
  const { taskStats, isStatsLoading } = useTasksContext()

  if (isStatsLoading || !taskStats) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">加载中...</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">-</div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  // 计算完成率
  const completionRate = taskStats.total > 0
    ? (taskStats.byStatus.done / taskStats.total) * 100
    : 0

  // 基础统计卡片
  const basicStats = [
    {
      title: '总任务数',
      value: taskStats.total,
      icon: Target,
      color: 'text-blue-600',
      description: '所有任务',
    },
    {
      title: '已完成',
      value: taskStats.byStatus.done,
      icon: CheckCircle,
      color: 'text-green-600',
      description: '完成的任务',
    },
    {
      title: '进行中',
      value: taskStats.byStatus.in_progress,
      icon: Clock,
      color: 'text-yellow-600',
      description: '正在处理的任务',
    },
    {
      title: '已过期',
      value: taskStats.overdue,
      icon: AlertCircle,
      color: 'text-red-600',
      description: '超过截止日期的任务',
    },
  ]

  // 优先级统计
  const priorityStats = [
    {
      title: '紧急',
      value: taskStats.byPriority.critical,
      color: 'bg-red-500',
      total: taskStats.total,
    },
    {
      title: '高',
      value: taskStats.byPriority.high,
      color: 'bg-orange-500',
      total: taskStats.total,
    },
    {
      title: '中',
      value: taskStats.byPriority.medium,
      color: 'bg-yellow-500',
      total: taskStats.total,
    },
    {
      title: '低',
      value: taskStats.byPriority.low,
      color: 'bg-gray-500',
      total: taskStats.total,
    },
  ]

  // 状态进度条
  const statusProgress = [
    {
      label: 'Backlog',
      value: taskStats.byStatus.backlog,
      color: 'bg-gray-500',
      total: taskStats.total,
    },
    {
      label: '待办',
      value: taskStats.byStatus.todo,
      color: 'bg-blue-500',
      total: taskStats.total,
    },
    {
      label: '进行中',
      value: taskStats.byStatus.in_progress,
      color: 'bg-yellow-500',
      total: taskStats.total,
    },
    {
      label: '已完成',
      value: taskStats.byStatus.done,
      color: 'bg-green-500',
      total: taskStats.total,
    },
    {
      label: '已取消',
      value: taskStats.byStatus.canceled,
      color: 'bg-red-500',
      total: taskStats.total,
    },
  ]

  // 工作时间统计
  const workTimeStats = [
    {
      title: '预估总工时',
      value: `${Math.round(taskStats.totalEstimatedHours)}h`,
      icon: Timer,
      color: 'text-blue-600',
    },
    {
      title: '实际总工时',
      value: `${Math.round(taskStats.totalActualHours)}h`,
      icon: Clock,
      color: 'text-green-600',
    },
    {
      title: '本周完成',
      value: taskStats.completedThisWeek,
      icon: TrendingUp,
      color: 'text-purple-600',
    },
    {
      title: '本月完成',
      value: taskStats.completedThisMonth,
      icon: CheckCircle,
      color: 'text-indigo-600',
    },
  ]

  // 效率指标
  const efficiencyStats = [
    {
      title: '平均完成时间',
      value: `${Math.round(taskStats.averageCompletionTime)}h`,
      icon: Timer,
      color: 'text-orange-600',
      description: '从创建到完成的平均时间',
    },
    {
      title: '完成率',
      value: `${completionRate.toFixed(1)}%`,
      icon: Target,
      color: completionRate > 70 ? 'text-green-600' : completionRate > 50 ? 'text-yellow-600' : 'text-red-600',
      description: '已完成任务占比',
    },
  ]

  return (
    <div className="space-y-6">
      {/* 基础统计 */}
      <div>
        <h3 className="text-lg font-semibold mb-4">任务概览</h3>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {basicStats.map((stat) => (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">{stat.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* 优先级分布 */}
      <div>
        <h3 className="text-lg font-semibold mb-4">优先级分布</h3>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {priorityStats.map((stat) => {
            const percentage = stat.total > 0 ? (stat.value / stat.total) * 100 : 0
            return (
              <Card key={stat.title}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <Progress value={percentage} className="h-2" />
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{stat.title}</span>
                    <span>{percentage.toFixed(1)}%</span>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>

      {/* 状态进度 */}
      <div>
        <h3 className="text-lg font-semibold mb-4">状态进度</h3>
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-3">
              {statusProgress.map((status) => {
                const percentage = status.total > 0 ? (status.value / status.total) * 100 : 0
                return (
                  <div key={status.label} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">{status.label}</span>
                      <span className="text-muted-foreground">
                        {status.value} / {status.total} ({percentage.toFixed(1)}%)
                      </span>
                    </div>
                    <Progress value={percentage} className="h-2">
                      <div className={`h-full ${status.color} rounded-full`} />
                    </Progress>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 工作时间统计 */}
      <div>
        <h3 className="text-lg font-semibold mb-4">工作时间</h3>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {workTimeStats.map((stat) => (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* 效率指标 */}
      <div>
        <h3 className="text-lg font-semibold mb-4">效率指标</h3>
        <div className="grid gap-4 md:grid-cols-2">
          {efficiencyStats.map((stat) => (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                {stat.description && (
                  <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
```

### 步骤 4.3: 创建任务导入组件

**文件**: `src/develop/(views)/official-api/tasks/components/tasks-import-dialog.tsx`

```typescript
import * as React from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import { Upload, Download, FileText, AlertCircle, CheckCircle } from 'lucide-react'
import { useTasksContext } from '../context/use-tasks'
import { useGetImportTemplate } from '@/develop/(services)/hooks/useTasksApi'
import { Loader2 } from 'lucide-react'

interface TasksImportDialogProps {
  isOpen: boolean
  onClose: () => void
}

export function TasksImportDialog({ isOpen, onClose }: TasksImportDialogProps) {
  const { importTasks, isImporting } = useTasksContext()
  const [file, setFile] = React.useState<File | null>(null)
  const [format, setFormat] = React.useState<'csv' | 'json' | 'xlsx'>('csv')
  const [skipErrors, setSkipErrors] = React.useState(true)
  const [updateExisting, setUpdateExisting] = React.useState(false)

  const getTemplateMutation = useGetImportTemplate()

  // 处理文件选择
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0]
    if (selectedFile) {
      setFile(selectedFile)
    }
  }

  // 处理导入
  const handleImport = () => {
    if (file) {
      importTasks({
        file,
        format,
        options: {
          skipErrors,
          updateExisting,
        },
      })
      onClose()
    }
  }

  // 下载模板
  const handleDownloadTemplate = () => {
    getTemplateMutation.mutate(format)
  }

  // 重置表单
  const handleReset = () => {
    setFile(null)
    setFormat('csv')
    setSkipErrors(true)
    setUpdateExisting(false)
  }

  // 对话框关闭时重置
  React.useEffect(() => {
    if (!isOpen) {
      handleReset()
    }
  }, [isOpen])

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>导入任务</DialogTitle>
          <DialogDescription>
            从文件批量导入任务数据。支持 CSV、JSON 和 Excel 格式。
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-6">
          {/* 下载模板 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">1. 下载模板</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                下载标准模板，按照格式填写数据以确保导入成功。
              </p>

              <div className="flex items-center gap-4">
                <Select value={format} onValueChange={(value: any) => setFormat(value)}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="csv">CSV</SelectItem>
                    <SelectItem value="json">JSON</SelectItem>
                    <SelectItem value="xlsx">Excel</SelectItem>
                  </SelectContent>
                </Select>

                <Button
                  variant="outline"
                  onClick={handleDownloadTemplate}
                  disabled={getTemplateMutation.isPending}
                >
                  {getTemplateMutation.isPending ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Download className="mr-2 h-4 w-4" />
                  )}
                  下载模板
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* 上传文件 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">2. 上传文件</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6">
                <div className="text-center space-y-2">
                  <Upload className="mx-auto h-12 w-12 text-muted-foreground" />
                  <div>
                    <Label htmlFor="file-upload" className="cursor-pointer">
                      <span className="text-sm font-medium text-primary hover:underline">
                        点击选择文件
                      </span>
                      <span className="text-sm text-muted-foreground"> 或拖拽到此处</span>
                    </Label>
                    <Input
                      id="file-upload"
                      type="file"
                      accept=".csv,.json,.xlsx"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    支持 CSV、JSON、Excel 格式，最大 10MB
                  </p>
                </div>

                {file && (
                  <div className="mt-4 p-3 bg-muted rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        <span className="text-sm font-medium">{file.name}</span>
                        <span className="text-xs text-muted-foreground">
                          ({(file.size / 1024 / 1024).toFixed(2)} MB)
                        </span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setFile(null)}
                      >
                        移除
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* 导入选项 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">3. 导入选项</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="skip-errors"
                    checked={skipErrors}
                    onCheckedChange={(checked) => setSkipErrors(checked as boolean)}
                  />
                  <Label htmlFor="skip-errors" className="text-sm">
                    跳过错误行（继续导入其他数据）
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="update-existing"
                    checked={updateExisting}
                    onCheckedChange={(checked) => setUpdateExisting(checked as boolean)}
                  />
                  <Label htmlFor="update-existing" className="text-sm">
                    更新现有任务（基于任务ID）
                  </Label>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 注意事项 */}
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-1 text-sm">
                <p>• 确保文件格式与模板一致</p>
                <p>• 任务标题为必填字段</p>
                <p>• 状态和优先级必须使用预定义值</p>
                <p>• 日期格式为 YYYY-MM-DD</p>
                <p>• 导入后请在任务列表中检查结果</p>
              </div>
            </AlertDescription>
          </Alert>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            取消
          </Button>
          <Button
            onClick={handleImport}
            disabled={!file || isImporting}
          >
            {isImporting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                导入中...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                开始导入
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
```

---

## 📋 验证清单

完成以下步骤确保 Tasks 模块 API 集成成功：

### 功能验证
- [ ] 任务列表正确加载和显示
- [ ] 分页功能正常工作
- [ ] 搜索功能正常工作
- [ ] 排序功能正常工作
- [ ] 筛选功能正常工作（状态、优先级、标签、分配人）
- [ ] 创建任务功能正常
- [ ] 编辑任务功能正常
- [ ] 删除任务功能正常
- [ ] 批量操作功能正常
- [ ] 任务导入功能正常
- [ ] 任务导出功能正常
- [ ] 状态更新功能正常
- [ ] 优先级更新功能正常
- [ ] 任务分配功能正常

### 用户体验验证
- [ ] 加载状态正确显示
- [ ] 错误状态正确处理
- [ ] 成功操作有适当提示
- [ ] 表单验证正常工作
- [ ] 抽屉式设计体验良好
- [ ] 响应式设计适配

### 高级功能验证
- [ ] 统计信息正确显示
- [ ] 进度条显示准确
- [ ] 多选功能正常
- [ ] 批量操作反馈明确
- [ ] 文件上传功能正常
- [ ] 模板下载功能正常

### 性能验证
- [ ] 数据缓存正常工作
- [ ] 网络请求优化
- [ ] 页面加载速度良好
- [ ] 内存使用合理
- [ ] 大量数据时性能良好

### 安全验证
- [ ] 认证令牌正确传递
- [ ] 错误信息不泄露敏感数据
- [ ] 输入验证充分
- [ ] 权限控制正确

通过遵循这些详细步骤，你可以成功地将 Tasks 模块从静态数据迁移到完整的 API 集成实现，并提供丰富的任务管理功能。