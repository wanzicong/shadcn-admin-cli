import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { tasksApi } from '../api/tasks'
import type { TaskCreate, TaskUpdate, TaskQueryParams, TaskImportRequest, BulkDeleteRequest, TaskStatus } from '../api/types'

/**
 * 任务管理 API Hooks
 */

// 获取任务列表
export function useTasks(params?: TaskQueryParams) {
     return useQuery({
          queryKey: ['tasks', params],
          queryFn: () => tasksApi.getTasks(params),
          staleTime: 5 * 60 * 1000, // 5分钟
     })
}

// 获取单个任务
export function useTask(taskId: string) {
     return useQuery({
          queryKey: ['task', taskId],
          queryFn: () => tasksApi.getTask({ task_id: taskId }),
          enabled: !!taskId,
     })
}

// 获取任务统计信息
export function useTaskStats() {
     return useQuery({
          queryKey: ['task-stats'],
          queryFn: () => tasksApi.getTaskStats(),
          staleTime: 10 * 60 * 1000, // 10分钟
     })
}

// 获取仪表板数据
export function useDashboardData() {
     return useQuery({
          queryKey: ['dashboard-data'],
          queryFn: () => tasksApi.getDashboardData(),
          staleTime: 5 * 60 * 1000, // 5分钟
     })
}

// 创建任务
export function useCreateTask() {
     const queryClient = useQueryClient()

     return useMutation({
          mutationFn: (data: TaskCreate) => tasksApi.createTask(data),
          onSuccess: () => {
               queryClient.invalidateQueries({ queryKey: ['tasks'] })
               queryClient.invalidateQueries({ queryKey: ['task-stats'] })
               queryClient.invalidateQueries({ queryKey: ['dashboard-data'] })
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
          mutationFn: ({ taskId, data }: { taskId: string; data: TaskUpdate }) => tasksApi.updateTask(taskId, data),
          onSuccess: (_, { taskId }) => {
               queryClient.invalidateQueries({ queryKey: ['tasks'] })
               queryClient.invalidateQueries({ queryKey: ['task', taskId] })
               queryClient.invalidateQueries({ queryKey: ['task-stats'] })
               queryClient.invalidateQueries({ queryKey: ['dashboard-data'] })
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
          onSuccess: () => {
               queryClient.invalidateQueries({ queryKey: ['tasks'] })
               queryClient.invalidateQueries({ queryKey: ['task-stats'] })
               queryClient.invalidateQueries({ queryKey: ['dashboard-data'] })
               toast.success('任务删除成功')
          },
          onError: (error: unknown) => {
               const errorMessage = error instanceof Error ? error.message : '任务删除失败'
               toast.error(errorMessage)
          },
     })
}

// 批量删除任务
export function useBulkDeleteTasks() {
     const queryClient = useQueryClient()

     return useMutation({
          mutationFn: (data: BulkDeleteRequest) => tasksApi.bulkDeleteTasks(data),
          onSuccess: (result) => {
               queryClient.invalidateQueries({ queryKey: ['tasks'] })
               queryClient.invalidateQueries({ queryKey: ['task-stats'] })
               queryClient.invalidateQueries({ queryKey: ['dashboard-data'] })
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

// 更新任务状态
export function useUpdateTaskStatus() {
     const queryClient = useQueryClient()

     return useMutation({
          mutationFn: ({ taskId, status }: { taskId: string; status: TaskStatus }) => tasksApi.updateTaskStatus(taskId, status),
          onSuccess: (_, { taskId }) => {
               queryClient.invalidateQueries({ queryKey: ['tasks'] })
               queryClient.invalidateQueries({ queryKey: ['task', taskId] })
               queryClient.invalidateQueries({ queryKey: ['task-stats'] })
               queryClient.invalidateQueries({ queryKey: ['dashboard-data'] })
               toast.success('任务状态更新成功')
          },
          onError: (error: unknown) => {
               const errorMessage = error instanceof Error ? error.message : '任务状态更新失败'
               toast.error(errorMessage)
          },
     })
}

// 分配任务
export function useAssignTask() {
     const queryClient = useQueryClient()

     return useMutation({
          mutationFn: ({ taskId, assigneeId }: { taskId: string; assigneeId: string }) => tasksApi.assignTask(taskId, assigneeId),
          onSuccess: (_, { taskId }) => {
               queryClient.invalidateQueries({ queryKey: ['tasks'] })
               queryClient.invalidateQueries({ queryKey: ['task', taskId] })
               toast.success('任务分配成功')
          },
          onError: (error: unknown) => {
               const errorMessage = error instanceof Error ? error.message : '任务分配失败'
               toast.error(errorMessage)
          },
     })
}

// 导入任务
export function useImportTasks() {
     const queryClient = useQueryClient()

     return useMutation({
          mutationFn: (data: TaskImportRequest) => tasksApi.importTasks(data),
          onSuccess: (result) => {
               queryClient.invalidateQueries({ queryKey: ['tasks'] })
               queryClient.invalidateQueries({ queryKey: ['task-stats'] })
               queryClient.invalidateQueries({ queryKey: ['dashboard-data'] })
               if (result.failed_count > 0) {
                    toast.warning(`部分导入失败，成功导入 ${result.imported_count} 个，失败 ${result.failed_count} 个`)
               } else {
                    toast.success(`批量导入成功，共导入 ${result.imported_count} 个任务`)
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
          mutationFn: (params?: { status?: TaskStatus; label?: string; priority?: string }) => tasksApi.exportTasks(params),
          onSuccess: (result) => {
               // 这里可以处理文件下载逻辑
               toast.success(`成功导出 ${result.data.length} 个任务`)
          },
          onError: (error: unknown) => {
               const errorMessage = error instanceof Error ? error.message : '任务导出失败'
               toast.error(errorMessage)
          },
     })
}
