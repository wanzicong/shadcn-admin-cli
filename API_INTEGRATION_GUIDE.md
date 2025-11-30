# Shadcn Admin API 接入通用指南

这是一个完整的指南，帮助你在 shadcn-admin 项目中实现任何模块的 API 接入，从静态数据迁移到真实的后端 API。

## 📋 目录

- [概览](#-概览)
- [技术栈](#-技术栈)
- [实施流程](#-实施流程)
- [代码生成器](#-代码生成器)
- [最佳实践](#-最佳实践)
- [故障排除](#-故障排除)
- [性能优化](#-性能优化)
- [安全考虑](#-安全考虑)

---

## 🎯 概览

### 目标
- 提供标准化的 API 接入流程
- 保持代码一致性和可维护性
- 确保良好的用户体验
- 实现高效的数据管理

### 核心原则
1. **类型安全**: 全链路 TypeScript 支持
2. **渐进式**: 可逐步迁移，不破坏现有功能
3. **一致性**: 统一的代码风格和架构模式
4. **可扩展**: 易于添加新功能和模块
5. **高性能**: 智能缓存和优化策略

### 适用场景
- 新模块的 API 集成
- 现有模块从静态数据迁移
- 第三方服务集成
- 复杂数据管理功能

---

## 🛠️ 技术栈

### 核心技术
- **HTTP 客户端**: Axios - 已配置拦截器和错误处理
- **状态管理**: TanStack Query (React Query) - 服务器状态管理
- **本地状态**: Zustand - 客户端状态管理
- **表单处理**: React Hook Form + Zod - 高性能表单和验证
- **路由**: TanStack Router - 文件系统路由

### UI 框架
- **组件库**: Shadcn UI + Radix UI
- **样式**: TailwindCSS
- **图标**: Lucide React
- **通知**: Sonner
- **表格**: TanStack Table

### 开发工具
- **语言**: TypeScript 严格模式
- **格式化**: Prettier + ESLint
- **构建**: Vite + SWC
- **测试**: Vitest + React Testing Library

---

## 🚀 实施流程

### 阶段 1: 准备工作

#### 1.1 环境配置

**环境变量设置** (`.env`)
```env
# API 配置
VITE_API_BASE_URL=http://localhost:8080
VITE_API_TIMEOUT=30000
VITE_API_PREFIX=

# 应用配置
VITE_APP_TITLE=Shadcn Admin 脚手架
VITE_APP_ENV=development

# 功能开关
VITE_ENABLE_MOCK=false
VITE_ENABLE_DEVTOOLS=true
```

**Vite 代理配置** (`vite.config.ts`)
```typescript
export default defineConfig({
  server: {
    proxy: {
      '/api': {
        target: process.env.VITE_API_BASE_URL || 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
})
```

#### 1.2 类型定义

**基础类型** (`src/develop/(services)/api/types.ts`)
```typescript
// ==================== 基础类型 ====================

// 通用分页响应
export interface PaginatedResponse<T> {
  list: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

// 通用错误响应
export interface ApiError {
  code: number | string
  message: string
  details?: Record<string, any>
  timestamp: string
}

// 成功响应
export interface ApiResponse<T> {
  data: T
  success: boolean
  message?: string
  code: number
}

// 分页查询参数
export interface PaginationParams {
  page?: number
  pageSize?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

// 搜索参数
export interface SearchParams {
  search?: string
  searchFields?: string[]
}

// 日期范围参数
export interface DateRangeParams {
  dateFrom?: string
  dateTo?: string
  createdAtFrom?: string
  createdAtTo?: string
  updatedAtFrom?: string
  updatedAtTo?: string
}

// ID 数组参数
export interface IdsParams {
  ids?: string[]
  excludeIds?: string[]
}

// 批量操作结果
export interface BulkOperationResult {
  success_count: number
  failed_count: number
  total_count: number
  failed_items?: Array<{
    id: string
    error: string
  }>
}

// 导入导出相关
export interface ImportResult {
  imported_count: number
  updated_count: number
  failed_count: number
  errors?: Array<{
    row: number
    field: string
    message: string
    value?: any
  }>
}

export interface ExportResult {
  download_url: string
  filename: string
  format: string
  size?: number
}

// ==================== 请求配置 ====================

export interface RequestConfig {
  showLoading?: boolean
  showError?: boolean
  needToken?: boolean
  customErrorHandler?: (error: any) => void
  timeout?: number
  retries?: number
  retryDelay?: number
}

// ==================== 模块模板 ====================

/**
 * 根据模块名称生成类型定义模板
 *
 * 示例模块: User, Task, Product, Order 等
 *
 * @template T - 实体类型
 */
export interface ModuleTypes<T> {
  // 实体
  Entity: T & {
    id: string
    created_at: string
    updated_at: string
  }

  // 创建请求
  CreateRequest: Partial<Omit<T, 'id' | 'created_at' | 'updated_at'>>

  // 更新请求
  UpdateRequest: Partial<CreateRequest>

  // 查询参数
  QueryParams: PaginationParams & SearchParams & DateRangeParams & IdsParams & {
    [K in keyof T]?: T[K] | T[K][]
  }

  // 统计信息
  Stats: Record<string, number> & {
    total: number
  }

  // 批量操作
  BulkUpdate: {
    ids: string[]
    updates: UpdateRequest
  }

  BulkDelete: {
    ids: string[]
    reason?: string
  }

  // 自定义操作
  CustomActions: Record<string, any>
}
```

#### 1.3 API 服务类模板

**基础服务类** (`src/develop/(services)/api/base-service.ts`)
```typescript
import { post, get, put, del, upload, download } from '../request'
import type { RequestConfig, PaginatedResponse, ApiResponse, BulkOperationResult, ImportResult, ExportResult } from './types'

/**
 * 基础 API 服务类
 * 提供通用的 CRUD 操作和工具方法
 */
export abstract class BaseApiService<T, C = Partial<T>, U = Partial<C>, Q = any> {
  protected abstract endpoint: string
  protected abstract entityName: string

  constructor() {
    if (!this.endpoint) {
      throw new Error(`Endpoint must be defined for ${this.constructor.name}`)
    }
    if (!this.entityName) {
      throw new Error(`Entity name must be defined for ${this.constructor.name}`)
    }
  }

  // ==================== 基础 CRUD ====================

  /**
   * 获取实体列表
   */
  async list(params?: Q, config?: RequestConfig): Promise<PaginatedResponse<T>> {
    return post<PaginatedResponse<T>>(`${this.endpoint}/list`, params, config)
  }

  /**
   * 获取单个实体详情
   */
  async detail(id: string, config?: RequestConfig): Promise<T> {
    return post<T>(`${this.endpoint}/detail`, { id }, config)
  }

  /**
   * 创建实体
   */
  async create(data: C, config?: RequestConfig): Promise<T> {
    return post<T>(`${this.endpoint}/create`, { [this.entityName]: data }, config)
  }

  /**
   * 更新实体
   */
  async update(id: string, data: U, config?: RequestConfig): Promise<T> {
    return post<T>(`${this.endpoint}/update`, { id, [this.entityName]: data }, config)
  }

  /**
   * 删除实体
   */
  async delete(id: string, config?: RequestConfig): Promise<{ message: string }> {
    return post<{ message: string }>(`${this.endpoint}/delete`, { id }, config)
  }

  // ==================== 批量操作 ====================

  /**
   * 批量更新
   */
  async bulkUpdate(data: { ids: string[]; updates: U }, config?: RequestConfig): Promise<BulkOperationResult> {
    return post<BulkOperationResult>(`${this.endpoint}/bulk-update`, data, config)
  }

  /**
   * 批量删除
   */
  async bulkDelete(data: { ids: string[]; reason?: string }, config?: RequestConfig): Promise<BulkOperationResult> {
    return post<BulkOperationResult>(`${this.endpoint}/bulk-delete`, data, config)
  }

  // ==================== 搜索 ====================

  /**
   * 搜索实体
   */
  async search(query: string, filters?: any, limit = 20, config?: RequestConfig): Promise<T[]> {
    return post<T[]>(`${this.endpoint}/search`, { query, filters, limit }, config)
  }

  // ==================== 导入导出 ====================

  /**
   * 导入实体
   */
  async import(file: File, format: 'csv' | 'json' | 'xlsx', options?: any, config?: RequestConfig): Promise<ImportResult> {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('format', format)
    if (options) {
      formData.append('options', JSON.stringify(options))
    }

    return upload<ImportResult>(`${this.endpoint}/import`, formData, config)
  }

  /**
   * 导出实体
   */
  async export(filters?: any, format: 'csv' | 'json' | 'xlsx' = 'xlsx', config?: RequestConfig): Promise<ExportResult> {
    return post<ExportResult>(`${this.endpoint}/export`, { filters, format }, config)
  }

  /**
   * 下载导入模板
   */
  async downloadTemplate(format: 'csv' | 'json' | 'xlsx', config?: RequestConfig): Promise<ExportResult> {
    return post<ExportResult>(`${this.endpoint}/template`, { format }, config)
  }

  // ==================== 统计 ====================

  /**
   * 获取统计信息
   */
  async stats(params?: any, config?: RequestConfig): Promise<any> {
    return post<any>(`${this.endpoint}/stats`, params, config)
  }

  // ==================== 工具方法 ====================

  /**
   * 获取端点 URL
   */
  protected getEndpoint(path: string = ''): string {
    return path ? `${this.endpoint}/${path}` : this.endpoint
  }

  /**
   * 创建请求参数
   */
  protected createParams(params: any): any {
    return {
      [this.entityName]: params,
    }
  }

  /**
   * 处理错误
   */
  protected handleError(error: any): never {
    console.error(`Error in ${this.entityName} service:`, error)
    throw error
  }
}
```

### 阶段 2: 代码生成器

#### 2.1 模块代码生成脚本

**生成器工具** (`scripts/generate-module-api.ts`)
```typescript
#!/usr/bin/env ts-node

import * as fs from 'fs'
import * as path from 'path'

/**
 * 模块 API 代码生成器
 *
 * 使用方法:
 * npm run generate:api -- User user users
 *
 * 参数:
 * 1. PascalCase 模块名 (User)
 * 2. camelCase 模块名 (user)
 * 3. kebab-case 模块名 (users)
 * 4. 可选: 额外字段 (name:string,email:string,role:string)
 */

interface GenerateOptions {
  pascalName: string  // User
  camelName: string   // user
  kebabName: string   // users
  fields?: string[]    // name:string,email:string,role:string
}

// 字段类型映射
const typeMap: Record<string, string> = {
  'string': 'string',
  'number': 'number',
  'boolean': 'boolean',
  'date': 'string',
  'text': 'string',
  'email': 'string',
  'url': 'string',
  'phone': 'string',
  'id': 'string',
  'enum': 'string',
}

// 解析字段字符串
function parseFields(fields: string[]): Array<{ name: string; type: string; optional: boolean }> {
  return fields.map(field => {
    const [name, typeString] = field.split(':')
    const isOptional = typeString.endsWith('?')
    const type = isOptional ? typeString.slice(0, -1) : typeString

    return {
      name,
      type: typeMap[type] || 'string',
      optional: isOptional,
    }
  })
}

// 生成类型定义
function generateTypes(options: GenerateOptions): string {
  const { pascalName, camelName, kebabName, fields = [] } = options
  const parsedFields = parseFields(fields)

  const fieldsInterface = parsedFields
    .map(({ name, type, optional }) => `  ${name}${optional ? '?' : ''}: ${type}`)
    .join('\n')

  return `// ==================== ${pascalName} 模块类型定义 ====================

// ${pascalName} 实体
export interface ${pascalName} {
  id: string
${fieldsInterface}
  created_at: string
  updated_at: string
}

// 创建 ${camelName} 请求
export interface ${pascalName}Create {
${parsedFields
    .filter(f => f.name !== 'id')
    .map(({ name, type, optional }) => `  ${name}${optional ? '?' : ''}: ${type}`)
    .join('\n')}
}

// 更新 ${camelName} 请求
export interface ${pascalName}Update {
${parsedFields
    .filter(f => f.name !== 'id')
    .map(({ name, type }) => `  ${name}?: ${type}`)
    .join('\n')}
}

// 查询参数
export interface ${pascalName}QueryParams extends PaginationParams, SearchParams, DateRangeParams, IdsParams {
${parsedFields.map(({ name, type }) => {
    if (type === 'string') {
      return `  ${name}?: string | string[]`
    } else {
      return `  ${name}?: ${type} | ${type}[]`
    }
  }).join('\n')}
}

// ${pascalName} 统计信息
export interface ${pascalName}Stats {
  total: number
  active: number
  inactive: number
${parsedFields
    .filter(f => f.type === 'enum')
    .map(({ name }) => `  ${name}: Record<string, number>`)
    .join('\n')}
}

// 批量操作请求
export interface ${pascalName}BulkUpdate {
  ids: string[]
  updates: ${pascalName}Update
}

export interface ${pascalName}BulkDelete {
  ids: string[]
  reason?: string
}

// 导入请求
export interface ${pascalName}ImportRequest {
  file: File
  format: 'csv' | 'json' | 'xlsx'
  options?: {
    skipErrors?: boolean
    updateExisting?: boolean
  }
}
`
}

// 生成 API 服务
function generateApiService(options: GenerateOptions): string {
  const { pascalName, camelName, kebabName } = options

  return `import { BaseApiService } from './base-service'
import type {
  ${pascalName},
  ${pascalName}Create,
  ${pascalName}Update,
  ${pascalName}QueryParams,
  ${pascalName}Stats,
  ${pascalName}BulkUpdate,
  ${pascalName}BulkDelete,
  ${pascalName}ImportRequest,
  PaginatedResponse,
  BulkOperationResult,
  ImportResult,
  ExportResult,
} from './types'

/**
 * ${pascalName} 管理服务
 */
export class ${pascalName}Service extends BaseApiService<
  ${pascalName},
  ${pascalName}Create,
  ${pascalName}Update,
  ${pascalName}QueryParams
> {
  protected endpoint = '/${kebabName}'
  protected entityName = '${camelName}'

  // ==================== 统计信息 ====================

  /**
   * 获取 ${camelName} 统计信息
   */
  async get${pascalName}Stats(params?: Record<string, unknown>): Promise<${pascalName}Stats> {
    return this.stats(params)
  }

  // ==================== 自定义操作 ====================

  /**
   * 激活 ${camelName}
   */
  async activate${pascalName}(id: string): Promise<{ message: string }> {
    return post<{ message: string }>(\`\${this.endpoint}/activate\`, { id })
  }

  /**
   * 停用 ${camelName}
   */
  async deactivate${pascalName}(id: string): Promise<{ message: string }> {
    return post<{ message: string }>(\`\${this.endpoint}/deactivate\`, { id })
  }
}

/**
 * 导出便捷方法
 */
export const ${camelName}Api = {
  // 基础 CRUD
  get${pascalName}s: ${pascalName}Service.prototype.list.bind(new ${pascalName}Service()),
  get${pascalName}: ${pascalName}Service.prototype.detail.bind(new ${pascalName}Service()),
  create${pascalName}: ${pascalName}Service.prototype.create.bind(new ${pascalName}Service()),
  update${pascalName}: ${pascalName}Service.prototype.update.bind(new ${pascalName}Service()),
  delete${pascalName}: ${pascalName}Service.prototype.delete.bind(new ${pascalName}Service()),

  // 批量操作
  bulkUpdate${pascalName}s: ${pascalName}Service.prototype.bulkUpdate.bind(new ${pascalName}Service()),
  bulkDelete${pascalName}s: ${pascalName}Service.prototype.bulkDelete.bind(new ${pascalName}Service()),

  // 搜索
  search${pascalName}s: ${pascalName}Service.prototype.search.bind(new ${pascalName}Service()),

  // 导入导出
  import${pascalName}s: ${pascalName}Service.prototype.import.bind(new ${pascalName}Service()),
  export${pascalName}s: ${pascalName}Service.prototype.export.bind(new ${pascalName}Service()),
  download${pascalName}Template: ${pascalName}Service.prototype.downloadTemplate.bind(new ${pascalName}Service()),

  // 统计
  get${pascalName}Stats: ${pascalName}Service.prototype.get${pascalName}Stats.bind(new ${pascalName}Service()),

  // 自定义操作
  activate${pascalName}: ${pascalName}Service.prototype.activate${pascalName}.bind(new ${pascalName}Service()),
  deactivate${pascalName}: ${pascalName}Service.prototype.deactivate${pascalName}.bind(new ${pascalName}Service()),
}
`
}

// 生成 React Query Hooks
function generateHooks(options: GenerateOptions): string {
  const { pascalName, camelName, kebabName } = options

  return `import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import type {
  ${pascalName},
  ${pascalName}Create,
  ${pascalName}Update,
  ${pascalName}QueryParams,
  ${pascalName}Stats,
  ${pascalName}BulkUpdate,
  ${pascalName}BulkDelete,
  ${pascalName}ImportRequest,
  PaginatedResponse,
  ImportResult,
  ExportResult,
} from '../api/types'
import { ${camelName}Api } from '../api/${kebabName}'

/**
 * ${pascalName} 管理 React Query Hooks
 */

// 查询 Keys
const ${pascalName.toUpperCase()}_QUERY_KEYS = {
  all: ['${kebabName}'] as const,
  lists: () => [...${pascalName.toUpperCase()}_QUERY_KEYS.all, 'list'] as const,
  list: (params?: ${pascalName}QueryParams) => [...${pascalName.toUpperCase()}_QUERY_KEYS.lists(), params] as const,
  details: () => [...${pascalName.toUpperCase()}_QUERY_KEYS.all, 'detail'] as const,
  detail: (id: string) => [...${pascalName.toUpperCase()}_QUERY_KEYS.details(), id] as const,
  stats: () => [...${pascalName.toUpperCase()}_QUERY_KEYS.all, 'stats'] as const,
  search: (query: string) => [...${pascalName.toUpperCase()}_QUERY_KEYS.all, 'search', query] as const,
} as const

// ==================== 查询 Hooks ====================

/**
 * 获取 ${camelName} 列表
 */
export function use${pascalName}s(params?: ${pascalName}QueryParams) {
  return useQuery({
    queryKey: ${pascalName.toUpperCase()}_QUERY_KEYS.list(params),
    queryFn: () => ${camelName}Api.get${pascalName}s(params),
    staleTime: 5 * 60 * 1000, // 5分钟
    gcTime: 10 * 60 * 1000, // 10分钟
  })
}

/**
 * 获取单个 ${camelName}
 */
export function use${pascalName}(id: string) {
  return useQuery({
    queryKey: ${pascalName.toUpperCase()}_QUERY_KEYS.detail(id),
    queryFn: () => ${camelName}Api.get${pascalName}(id),
    enabled: !!id,
    staleTime: 2 * 60 * 1000, // 2分钟
  })
}

/**
 * 获取 ${camelName} 统计信息
 */
export function use${pascalName}Stats() {
  return useQuery({
    queryKey: ${pascalName.toUpperCase()}_QUERY_KEYS.stats(),
    queryFn: () => ${camelName}Api.get${pascalName}Stats(),
    staleTime: 10 * 60 * 1000, // 10分钟
    refetchInterval: 5 * 60 * 1000, // 5分钟自动刷新
  })
}

/**
 * 搜索 ${camelName}
 */
export function use${pascalName}Search(query: string, enabled = true) {
  return useQuery({
    queryKey: ${pascalName.toUpperCase()}_QUERY_KEYS.search(query),
    queryFn: () => ${camelName}Api.search${pascalName}s(query),
    enabled: enabled && query.length > 0,
    staleTime: 30 * 1000, // 30秒
  })
}

// ==================== 变更 Hooks ====================

/**
 * 创建 ${camelName}
 */
export function useCreate${pascalName}() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: ${pascalName}Create) => ${camelName}Api.create${pascalName}(data),
    onSuccess: (new${pascalName}) => {
      // 刷新列表
      queryClient.invalidateQueries({ queryKey: ${pascalName.toUpperCase()}_QUERY_KEYS.lists() })
      queryClient.invalidateQueries({ queryKey: ${pascalName.toUpperCase()}_QUERY_KEYS.stats() })

      // 添加到详情缓存
      queryClient.setQueryData(
        ${pascalName.toUpperCase()}_QUERY_KEYS.detail(new${pascalName}.id),
        new${pascalName}
      )

      toast.success('${pascalName} 创建成功')
    },
    onError: (error: unknown) => {
      const errorMessage = error instanceof Error ? error.message : '${pascalName} 创建失败'
      toast.error(errorMessage)
    },
  })
}

/**
 * 更新 ${camelName}
 */
export function useUpdate${pascalName}() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ${pascalName}Update }) =>
      ${camelName}Api.update${pascalName}(id, data),
    onSuccess: (updated${pascalName}, { id }) => {
      // 更新详情缓存
      queryClient.setQueryData(
        ${pascalName.toUpperCase()}_QUERY_KEYS.detail(id),
        updated${pascalName}
      )

      // 刷新列表
      queryClient.invalidateQueries({ queryKey: ${pascalName.toUpperCase()}_QUERY_KEYS.lists() })
      queryClient.invalidateQueries({ queryKey: ${pascalName.toUpperCase()}_QUERY_KEYS.stats() })

      toast.success('${pascalName} 更新成功')
    },
    onError: (error: unknown) => {
      const errorMessage = error instanceof Error ? error.message : '${pascalName} 更新失败'
      toast.error(errorMessage)
    },
  })
}

/**
 * 删除 ${camelName}
 */
export function useDelete${pascalName}() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => ${camelName}Api.delete${pascalName}(id),
    onSuccess: (_, id) => {
      // 从缓存中移除
      queryClient.removeQueries({ queryKey: ${pascalName.toUpperCase()}_QUERY_KEYS.detail(id) })

      // 刷新列表
      queryClient.invalidateQueries({ queryKey: ${pascalName.toUpperCase()}_QUERY_KEYS.lists() })
      queryClient.invalidateQueries({ queryKey: ${pascalName.toUpperCase()}_QUERY_KEYS.stats() })

      toast.success('${pascalName} 删除成功')
    },
    onError: (error: unknown) => {
      const errorMessage = error instanceof Error ? error.message : '${pascalName} 删除失败'
      toast.error(errorMessage)
    },
  })
}

/**
 * 批量更新 ${camelName}
 */
export function useBulkUpdate${pascalName}s() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: ${pascalName}BulkUpdate) => ${camelName}Api.bulkUpdate${pascalName}s(data),
    onSuccess: (result) => {
      // 刷新列表
      queryClient.invalidateQueries({ queryKey: ${pascalName.toUpperCase()}_QUERY_KEYS.lists() })
      queryClient.invalidateQueries({ queryKey: ${pascalName.toUpperCase()}_QUERY_KEYS.stats() })

      if (result.failed_count > 0) {
        toast.warning(\`部分更新失败，成功更新 \${result.success_count} 个，失败 \${result.failed_count} 个\`)
      } else {
        toast.success(\`批量更新成功，共更新 \${result.success_count} 个 ${pascalName}\`)
      }
    },
    onError: (error: unknown) => {
      const errorMessage = error instanceof Error ? error.message : '批量更新失败'
      toast.error(errorMessage)
    },
  })
}

/**
 * 批量删除 ${camelName}
 */
export function useBulkDelete${pascalName}s() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: ${pascalName}BulkDelete) => ${camelName}Api.bulkDelete${pascalName}s(data),
    onSuccess: (result) => {
      // 刷新列表
      queryClient.invalidateQueries({ queryKey: ${pascalName.toUpperCase()}_QUERY_KEYS.lists() })
      queryClient.invalidateQueries({ queryKey: ${pascalName.toUpperCase()}_QUERY_KEYS.stats() })

      if (result.failed_count > 0) {
        toast.warning(\`部分删除失败，成功删除 \${result.success_count} 个，失败 \${result.failed_count} 个\`)
      } else {
        toast.success(\`批量删除成功，共删除 \${result.success_count} 个 ${pascalName}\`)
      }
    },
    onError: (error: unknown) => {
      const errorMessage = error instanceof Error ? error.message : '批量删除失败'
      toast.error(errorMessage)
    },
  })
}

/**
 * 导入 ${camelName}
 */
export function useImport${pascalName}s() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: ${pascalName}ImportRequest) => ${camelName}Api.import${pascalName}s(data),
    onSuccess: (result) => {
      // 刷新列表
      queryClient.invalidateQueries({ queryKey: ${pascalName.toUpperCase()}_QUERY_KEYS.lists() })
      queryClient.invalidateQueries({ queryKey: ${pascalName.toUpperCase()}_QUERY_KEYS.stats() })

      if (result.failed_count > 0) {
        toast.warning(\`部分导入失败，成功导入 \${result.imported_count} 个，失败 \${result.failed_count} 个\`)
      } else {
        toast.success(\`${pascalName} 导入成功，共导入 \${result.imported_count} 个\`)
      }
    },
    onError: (error: unknown) => {
      const errorMessage = error instanceof Error ? error.message : '${pascalName} 导入失败'
      toast.error(errorMessage)
    },
  })
}

/**
 * 导出 ${camelName}
 */
export function useExport${pascalName}s() {
  return useMutation({
    mutationFn: (filters?: ${pascalName}QueryParams) => ${camelName}Api.export${pascalName}s(filters),
    onSuccess: (result) => {
      window.open(result.download_url, '_blank')
      toast.success('${pascalName} 数据导出成功')
    },
    onError: (error: unknown) => {
      const errorMessage = error instanceof Error ? error.message : '导出失败'
      toast.error(errorMessage)
    },
  })
}

/**
 * 激活 ${camelName}
 */
export function useActivate${pascalName}() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => ${camelName}Api.activate${pascalName}(id),
    onSuccess: (_, id) => {
      // 刷新相关数据
      queryClient.invalidateQueries({ queryKey: ${pascalName.toUpperCase()}_QUERY_KEYS.lists() })
      queryClient.invalidateQueries({ queryKey: ${pascalName.toUpperCase()}_QUERY_KEYS.detail(id) })
      queryClient.invalidateQueries({ queryKey: ${pascalName.toUpperCase()}_QUERY_KEYS.stats() })

      toast.success('${pascalName} 激活成功')
    },
    onError: (error: unknown) => {
      const errorMessage = error instanceof Error ? error.message : '激活失败'
      toast.error(errorMessage)
    },
  })
}

/**
 * 停用 ${camelName}
 */
export function useDeactivate${pascalName}() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => ${camelName}Api.deactivate${pascalName}(id),
    onSuccess: (_, id) => {
      // 刷新相关数据
      queryClient.invalidateQueries({ queryKey: ${pascalName.toUpperCase()}_QUERY_KEYS.lists() })
      queryClient.invalidateQueries({ queryKey: ${pascalName.toUpperCase()}_QUERY_KEYS.detail(id) })
      queryClient.invalidateQueries({ queryKey: ${pascalName.toUpperCase()}_QUERY_KEYS.stats() })

      toast.success('${pascalName} 停用成功')
    },
    onError: (error: unknown) => {
      const errorMessage = error instanceof Error ? error.message : '停用失败'
      toast.error(errorMessage)
    },
  })
}
`
}

// 主函数
function main() {
  const args = process.argv.slice(2)

  if (args.length < 3) {
    console.log('使用方法: npm run generate:api -- <PascalName> <camelName> <kebabName> [field1:type1,field2:type2,...]')
    console.log('示例: npm run generate:api -- User user users name:string,email:string,role:string')
    process.exit(1)
  }

  const options: GenerateOptions = {
    pascalName: args[0],
    camelName: args[1],
    kebabName: args[2],
    fields: args[3] ? args[3].split(',') : undefined,
  }

  console.log(`生成 ${options.pascalName} 模块 API 代码...`)

  // 创建目录
  const apiDir = path.join(process.cwd(), 'src/develop/(services)/api')
  const hooksDir = path.join(process.cwd(), 'src/develop/(services)/hooks')

  fs.mkdirSync(apiDir, { recursive: true })
  fs.mkdirSync(hooksDir, { recursive: true })

  // 生成文件
  const typesPath = path.join(apiDir, `${options.kebabName}-types.ts`)
  const servicePath = path.join(apiDir, `${options.kebabName}.ts`)
  const hooksPath = path.join(hooksDir, `use${options.pascalName}Api.ts`)

  // 生成类型定义
  const typesContent = generateTypes(options)
  fs.writeFileSync(typesPath, typesContent)
  console.log(`✅ 生成类型定义: ${typesPath}`)

  // 生成 API 服务
  const serviceContent = generateApiService(options)
  fs.writeFileSync(servicePath, serviceContent)
  console.log(`✅ 生成 API 服务: ${servicePath}`)

  // 生成 React Query Hooks
  const hooksContent = generateHooks(options)
  fs.writeFileSync(hooksPath, hooksContent)
  console.log(`✅ 生成 React Query Hooks: ${hooksPath}`)

  console.log(`\\n🎉 ${options.pascalName} 模块 API 代码生成完成！`)
  console.log('\\n接下来请:')
  console.log(`1. 在 ${typesPath} 中完善类型定义`)
  console.log(`2. 在 ${servicePath} 中实现自定义 API 方法`)
  console.log(`3. 在组件中使用生成的 Hooks`)
  console.log(`4. 更新路由和组件文件`)
}

if (require.main === module) {
  main()
}
```

#### 2.2 生成器使用方法

**添加到 package.json**
```json
{
  "scripts": {
    "generate:api": "ts-node scripts/generate-module-api.ts"
  }
}
```

**使用示例**
```bash
# 生成 User 模块 API
npm run generate:api -- User user users name:string,email:string,role:string,active:boolean

# 生成 Product 模块 API
npm run generate:api -- Product product products title:string,price:number,category:string,stock:number

# 生成 Order 模块 API
npm run generate:api -- Order order orders orderNumber:string,status:string,totalAmount:number,customerId:string
```

### 阶段 3: 组件集成模板

#### 3.1 Provider 组件模板

**Context Provider 模板** (`src/develop/(views)/[module]/context/[module]-provider.tsx`)
```typescript
import React, { useState } from 'react'
import useDialogState from '@/develop/(hooks)/use-dialog-state.tsx'
import { type [Module]DialogType } from './[module]-context-types.tsx'
import { type [Module] } from '../data/schema.ts'
import { [Module]Context } from './[module]-context.tsx'

// 导入 API Hooks
import {
  use[Module]s,
  useCreate[Module],
  useUpdate[Module],
  useDelete[Module],
  useBulkDelete[Module]s,
  useImport[Module]s,
  useExport[Module]s,
  use[Module]Stats,
  type [Module]QueryParams,
} from '@/develop/(services)/hooks/use[Module]Api'

// [Module] 管理状态提供者组件
export function [Module]Provider({ children }: { children: React.ReactNode }) {
  // 现有的对话框状态管理
  const [open, setOpen] = useDialogState<[Module]DialogType>(null)
  const [currentRow, setCurrentRow] = useState<[Module] | null>(null)
  const [selectedRows, setSelectedRows] = useState<[Module][]>([])

  // 查询参数状态
  const [queryParams, setQueryParams] = useState<[Module]QueryParams>({
    page: 1,
    pageSize: 10,
    sortBy: 'created_at',
    sortOrder: 'desc',
  })

  // API 数据和操作
  const [module]sQuery = use[Module]s(queryParams)
  const [module]StatsQuery = use[Module]Stats()

  // Mutations
  const create[Module]Mutation = useCreate[Module]()
  const update[Module]Mutation = useUpdate[Module]()
  const delete[Module]Mutation = useDelete[Module]()
  const bulkDelete[Module]sMutation = useBulkDelete[Module]s()
  const import[Module]sMutation = useImport[Module]s()
  const export[Module]sMutation = useExport[Module]s()

  // 处理查询参数变化
  const handleQueryParamsChange = (newParams: Partial<[Module]QueryParams>) => {
    setQueryParams(prev => ({ ...prev, ...newParams }))
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
      sortBy: sortBy as [Module]QueryParams['sortBy'],
      sortOrder,
      page: 1
    })
  }

  // 处理多选
  const handleSelectRows = (rows: [Module][]) => {
    setSelectedRows(rows)
  }

  // 处理全选
  const handleSelectAll = () => {
    if ([module]sQuery.data?.list) {
      setSelectedRows(
        selectedRows.length === [module]sQuery.data.list.length
          ? []
          : [module]sQuery.data.list
      )
    }
  }

  // 清除选择
  const handleClearSelection = () => {
    setSelectedRows([])
  }

  // 导出选中的数据
  const exportSelected[Module]s = () => {
    if (selectedRows.length > 0) {
      export[Module]sMutation.mutate({
        ids: selectedRows.map(item => item.id),
      })
    }
  }

  // 批量删除选中的数据
  const bulkDeleteSelected[Module]s = () => {
    if (selectedRows.length > 0) {
      bulkDelete[Module]sMutation.mutate({
        ids: selectedRows.map(item => item.id),
        reason: '批量删除',
      })
      setSelectedRows([])
    }
  }

  // 刷新数据
  const refetch = () => {
    [module]sQuery.refetch()
    [module]StatsQuery.refetch()
  }

  return (
    <[Module]Context
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
        [module]s: [module]sQuery.data?.list || [],
        [module]Stats: [module]StatsQuery.data,
        isLoading: [module]sQuery.isLoading,
        isStatsLoading: [module]StatsQuery.isLoading,
        error: [module]sQuery.error,
        statsError: [module]StatsQuery.error,

        // 分页信息
        pagination: {
          page: [module]sQuery.data?.page || 1,
          pageSize: [module]sQuery.data?.pageSize || 10,
          total: [module]sQuery.data?.total || 0,
          totalPages: [module]sQuery.data?.totalPages || 0,
        },

        // 查询参数
        queryParams,
        onQueryParamsChange: handleQueryParamsChange,
        onPageChange: handlePageChange,
        onSearch: handleSearch,
        onSort: handleSort,

        // 操作方法
        create[Module]: create[Module]Mutation.mutate,
        update[Module]: update[Module]Mutation.mutate,
        delete[Module]: delete[Module]Mutation.mutate,
        bulkDelete[Module]s: bulkDelete[Module]sMutation.mutate,
        import[Module]s: import[Module]sMutation.mutate,
        export[Module]s: export[Module]sMutation.mutate,
        exportSelected[Module]s,

        // 加载状态
        isCreating: create[Module]Mutation.isPending,
        isUpdating: update[Module]Mutation.isPending,
        isDeleting: delete[Module]Mutation.isPending,
        isBulkDeleting: bulkDelete[Module]sMutation.isPending,
        isImporting: import[Module]sMutation.isPending,
        isExporting: export[Module]sMutation.isPending,

        // 刷新方法
        refetch,
      }}
    >
      {children}
    </[Module]Context>
  )
}
```

#### 3.2 数据表格组件模板

**表格组件模板** (`src/develop/(views)/[module]/components/[module]-table.tsx`)
```typescript
import * as React from 'react'
import { DataTable, type DataTableProps } from '@/components/data-table'
import { columns } from './[module]-columns'
import { use[Module]Context } from '../context/use-[module]'
import { DataTableSkeleton } from '@/components/data-table-skeleton'
import { ErrorMessage } from '@/components/error-message'
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import { Trash2, Download } from 'lucide-react'

interface [Module]TableProps extends Partial<DataTableProps<[Module]>> {
  className?: string
}

export function [Module]Table({ className, ...props }: [Module]TableProps) {
  const {
    [module]s,
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
    exportSelected[Module]s,
    bulkDeleteSelected[Module]s,
    isBulkDeleting,
    isExporting,
  } = use[Module]Context()

  // 处理表格变化
  const handleSortingChange: DataTableProps<[Module]>['onSortingChange'] = (sorting) => {
    if (sorting.length > 0) {
      const { id, desc } = sorting[0]
      onSort(id as string, desc ? 'desc' : 'asc')
    }
  }

  const handlePaginationChange: DataTableProps<[Module]>['onPaginationChange'] = (updater) => {
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
    const selected[Module]s = [module]s.filter(item => selectedRowIds.includes(item.id))
    setSelectedRows(selected[Module]s)
  }

  // 全选处理
  const handleSelectAllChange = (checked: boolean) => {
    if (checked) {
      setSelectedRows([module]s)
    } else {
      setSelectedRows([])
    }
  }

  // 批量操作
  const handleBulkDelete = () => {
    if (selectedRows.length > 0) {
      bulkDeleteSelected[Module]s()
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
        description="无法加载数据，请稍后重试"
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
            已选择 {selectedRows.length} 个项目
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
              onClick={exportSelected[Module]s}
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
      <DataTable<[Module]>
        data={[module]s}
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

### 阶段 4: 验证清单

#### 4.1 功能验证

```markdown
## [Module] 模块 API 集成验证清单

### 基础功能
- [ ] [module] 列表正确加载和显示
- [ ] 分页功能正常工作
- [ ] 搜索功能正常工作
- [ ] 排序功能正常工作
- [ ] 创建 [module] 功能正常
- [ ] 编辑 [module] 功能正常
- [ ] 删除 [module] 功能正常

### 高级功能
- [ ] 批量操作功能正常
- [ ] [module] 导入功能正常
- [ ] [module] 导出功能正常
- [ ] 统计信息正确显示
- [ ] 数据筛选功能正常
- [ ] 多选功能正常

### 用户体验
- [ ] 加载状态正确显示
- [ ] 错误状态正确处理
- [ ] 成功操作有适当提示
- [ ] 表单验证正常工作
- [ ] 响应式设计适配

### 性能
- [ ] 数据缓存正常工作
- [ ] 网络请求优化
- [ ] 页面加载速度良好
- [ ] 内存使用合理

### 安全
- [ ] 认证令牌正确传递
- [ ] 错误信息不泄露敏感数据
- [ ] 输入验证充分
- [ ] 权限控制正确
```

---

## 🎯 最佳实践

### 1. 代码组织

```
src/develop/
├── (services)/
│   ├── api/                    # API 服务层
│   │   ├── types.ts           # 通用类型定义
│   │   ├── base-service.ts   # 基础服务类
│   │   ├── users.ts          # User API 服务
│   │   ├── tasks.ts          # Task API 服务
│   │   └── [module].ts       # 新模块 API 服务
│   ├── hooks/                 # React Query Hooks
│   │   ├── useUsersApi.ts    # User hooks
│   │   ├── useTasksApi.ts    # Task hooks
│   │   └── use[Module]Api.ts # 新模块 hooks
│   └── request/               # HTTP 请求工具
├── (views)/
│   └── official-api/          # API 集成模块
│       ├── users/            # User 模块
│       ├── tasks/            # Task 模块
│       └── [module]/         # 新模块
│           ├── context/       # 状态管理
│           ├── components/    # 组件
│           ├── data/          # 数据模型
│           └── API_INTEGRATION_GUIDE.md
```

### 2. 命名约定

**文件命名**
- API 服务: `kebab-case.ts` (e.g., `users.ts`, `product-categories.ts`)
- Hooks: `usePascalCaseApi.ts` (e.g., `useUsersApi.ts`, `useProductCategoriesApi.ts`)
- 类型: `kebab-case-types.ts` (e.g., `users-types.ts`)
- 组件: `kebab-case.tsx` (e.g., `users-table.tsx`, `product-form.tsx`)

**变量命名**
- API 实例: `camelCaseApi` (e.g., `usersApi`, `productCategoriesApi`)
- Query Keys: `PASCAL_CASE_KEYS` (e.g., `USERS_QUERY_KEYS`, `PRODUCT_QUERY_KEYS`)
- Hook 函数: `use[Module]` (e.g., `useUsers`, `useProduct`)

### 3. 错误处理策略

```typescript
// 统一错误处理
export class ApiError extends Error {
  constructor(
    message: string,
    public code?: number | string,
    public details?: any
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

// 全局错误边界
export function useErrorHandler() {
  const handleError = useCallback((error: unknown) => {
    if (error instanceof ApiError) {
      // 处理 API 错误
      switch (error.code) {
        case 401:
          toast.error('请重新登录')
          router.navigate({ to: '/sign-in' })
          break
        case 403:
          toast.error('权限不足')
          break
        case 500:
          toast.error('服务器错误，请稍后重试')
          break
        default:
          toast.error(error.message || '操作失败')
      }
    } else {
      // 处理其他错误
      toast.error('发生未知错误')
      console.error('Unhandled error:', error)
    }
  }, [])

  return { handleError }
}
```

### 4. 缓存策略

```typescript
// 缓存配置
export const cacheConfig = {
  // 用户数据 - 5分钟
  user: {
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  },
  // 任务数据 - 2分钟
  task: {
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
  },
  // 统计数据 - 10分钟
  stats: {
    staleTime: 10 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
  },
  // 搜索结果 - 30秒
  search: {
    staleTime: 30 * 1000,
    gcTime: 60 * 1000,
  },
}
```

### 5. 性能优化

```typescript
// 防抖搜索
export function useDebounceSearch<T>(
  searchFn: (query: string) => Promise<T>,
  delay = 300
) {
  const [query, setQuery] = useState('')
  const debouncedQuery = useDebounce(query, delay)

  const result = useQuery({
    queryKey: ['search', debouncedQuery],
    queryFn: () => searchFn(debouncedQuery),
    enabled: debouncedQuery.length > 0,
  })

  return {
    query,
    setQuery,
    ...result,
  }
}

// 虚拟滚动 (大数据量)
export function useVirtualTable<T>(data: T[], itemHeight = 50) {
  const [containerHeight, setContainerHeight] = useState(400)
  const [scrollTop, setScrollTop] = useState(0)

  const visibleCount = Math.ceil(containerHeight / itemHeight)
  const startIndex = Math.floor(scrollTop / itemHeight)
  const endIndex = Math.min(startIndex + visibleCount, data.length)

  const visibleData = data.slice(startIndex, endIndex)

  return {
    visibleData,
    containerHeight,
    scrollTop,
    setScrollTop,
    totalHeight: data.length * itemHeight,
    offsetY: startIndex * itemHeight,
  }
}
```

---

## 🔧 故障排除

### 常见问题

#### 1. API 请求失败

**症状**: 网络请求返回错误或超时

**解决方案**:
```typescript
// 检查网络配置
const checkNetworkConfig = () => {
  console.log('API Base URL:', import.meta.env.VITE_API_BASE_URL)
  console.log('API Prefix:', import.meta.env.VITE_API_PREFIX)
  console.log('Environment:', import.meta.env.VITE_APP_ENV)
}

// 添加请求拦截器调试
request.interceptors.request.use((config) => {
  console.log('Request:', config.method?.toUpperCase(), config.url, config.data)
  return config
})

// 添加响应拦截器调试
request.interceptors.response.use(
  (response) => {
    console.log('Response:', response.status, response.data)
    return response
  },
  (error) => {
    console.error('Response Error:', error.response?.data, error.config)
    return Promise.reject(error)
  }
)
```

#### 2. TanStack Query 数据不更新

**症状**: 数据变更后界面没有自动刷新

**解决方案**:
```typescript
// 确保使用正确的 queryKey
const queryKey = ['users', { page: 1, pageSize: 10 }]

// 在 mutation 成功后正确地失效查询
onSuccess: () => {
  queryClient.invalidateQueries({ queryKey: ['users'] })
  // 或者更精确的失效
  queryClient.invalidateQueries({
    queryKey: ['users', { page: currentPage }]
  })
}

// 手动触发重新获取
const { refetch } = useUsers()
refetch()
```

#### 3. 类型错误

**症状**: TypeScript 编译错误

**解决方案**:
```typescript
// 确保类型定义正确
interface User {
  id: string
  name: string
  email: string
  // 明确所有字段类型
}

// 使用类型断言时小心
const user = data as User // 避免过度使用

// 使用类型守卫
function isUser(obj: any): obj is User {
  return obj && typeof obj.id === 'string' && typeof obj.name === 'string'
}
```

#### 4. 内存泄漏

**症状**: 页面切换后内存占用持续增长

**解决方案**:
```typescript
// 在组件卸载时清理订阅
useEffect(() => {
  const subscription = someApi.subscribe()

  return () => {
    subscription.unsubscribe()
  }
}, [])

// 清理定时器
useEffect(() => {
  const timer = setInterval(() => {
    // 定时任务
  }, 1000)

  return () => {
    clearInterval(timer)
  }
}, [])

// 取消未完成的请求
useEffect(() => {
  const controller = new AbortController()

  fetchData({ signal: controller.signal })

  return () => {
    controller.abort()
  }
}, [])
```

### 调试工具

#### 1. React Query DevTools

```typescript
// 在 main.tsx 中启用
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

<QueryClientProvider client={queryClient}>
  <App />
  <ReactQueryDevtools initialIsOpen={false} />
</QueryClientProvider>
```

#### 2. TanStack Router DevTools

```typescript
// 在 main.tsx 中启用
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'

<RouterProvider router={router} />
<TanStackRouterDevtools position="bottom-right" />
```

#### 3. 自定义调试 Hook

```typescript
// useDebugInfo Hook
export function useDebugInfo(name: string, data: any) {
  useEffect(() => {
    if (import.meta.env.DEV) {
      console.group(`🔍 ${name} Debug Info`)
      console.log('Data:', data)
      console.log('Timestamp:', new Date().toISOString())
      console.groupEnd()
    }
  }, [name, data])
}

// 使用示例
const { data: users } = useUsers()
useDebugInfo('Users Data', users)
```

---

## ⚡ 性能优化

### 1. 网络优化

```typescript
// 请求合并
export function useBatchRequests<T>(requests: Array<() => Promise<T>>) {
  return useQuery({
    queryKey: ['batch', requests.length],
    queryFn: async () => {
      return Promise.all(requests.map(req => req()))
    },
    staleTime: 60 * 1000, // 1分钟
  })
}

// 条件请求
export function useConditionalRequest<T>(
  condition: boolean,
  requestFn: () => Promise<T>
) {
  return useQuery({
    queryKey: ['conditional', condition],
    queryFn: requestFn,
    enabled: condition,
  })
}

// 预加载
export function usePrefetchData() {
  const queryClient = useQueryClient()

  const prefetchData = () => {
    queryClient.prefetchQuery({
      queryKey: ['users'],
      queryFn: () => usersApi.getUsers(),
      staleTime: 5 * 60 * 1000,
    })
  }

  return { prefetchData }
}
```

### 2. 渲染优化

```typescript
// 组件记忆化
export const UserTable = memo(function UserTable({ users }: { users: User[] }) {
  // 组件逻辑
})

// 列表项记忆化
export const UserListItem = memo(function UserListItem({ user }: { user: User }) {
  return <div>{user.name}</div>
}, (prevProps, nextProps) => {
  return prevProps.user.id === nextProps.user.id
})

// 计算属性缓存
export const useFilteredUsers = (users: User[], filter: string) => {
  return useMemo(() => {
    return users.filter(user =>
      user.name.toLowerCase().includes(filter.toLowerCase())
    )
  }, [users, filter])
}
```

### 3. 数据优化

```typescript
// 选择性获取
export function useUserFields(userId: string, fields: string[]) {
  return useQuery({
    queryKey: ['user', userId, fields],
    queryFn: () => usersApi.getUser(userId, { fields }),
    select: (data) => {
      // 只返回需要的字段
      return fields.reduce((acc, field) => {
        acc[field] = data[field]
        return acc
      }, {} as any)
    }
  })
}

// 增量更新
export function useInfiniteUsers() {
  return useInfiniteQuery({
    queryKey: ['users', 'infinite'],
    queryFn: ({ pageParam = 1 }) => usersApi.getUsers({ page: pageParam }),
    getNextPageParam: (lastPage) => {
      if (lastPage.page < lastPage.totalPages) {
        return lastPage.page + 1
      }
      return undefined
    }
  })
}
```

---

## 🔒 安全考虑

### 1. 认证和授权

```typescript
// 认证拦截器
request.interceptors.request.use((config) => {
  const token = getAuthToken()
  if (token) {
    config.headers.Authorization = \`Bearer \${token}\`
  }
  return config
})

// 权限检查
export function usePermissions() {
  const { user } = useAuth()

  const hasPermission = useCallback((permission: string) => {
    return user?.permissions?.includes(permission) || false
  }, [user?.permissions])

  return { hasPermission }
}
```

### 2. 输入验证

```typescript
// 服务端验证
export const userSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email(),
  age: z.number().min(0).max(150),
})

// 客户端验证
export function useValidatedForm<T>(schema: z.ZodSchema<T>) {
  const form = useForm<T>({
    resolver: zodResolver(schema),
  })

  return form
}
```

### 3. 错误信息安全

```typescript
// 安全错误处理
export const handleSecureError = (error: any) => {
  if (import.meta.env.DEV) {
    console.error('Full error:', error)
  }

  // 只显示用户友好的错误信息
  const userMessage = error.response?.data?.message || '操作失败'
  toast.error(userMessage)

  // 记录详细错误到日志服务
  logError({
    message: error.message,
    stack: error.stack,
    timestamp: new Date().toISOString(),
  })
}
```

---

## 📚 扩展指南

### 1. 添加新模块

使用代码生成器快速创建新模块：

```bash
# 生成新模块
npm run generate:api -- Category category categories name:string,description:string,parentId:string
```

### 2. 集成第三方服务

```typescript
// 第三方服务适配器
export class ThirdPartyAdapter {
  private apiKey: string

  constructor(apiKey: string) {
    this.apiKey = apiKey
  }

  async getData(params: any): Promise<any> {
    const response = await fetch(\`https://api.example.com/data\`, {
      headers: {
        'Authorization': \`Bearer \${this.apiKey}\`,
        'Content-Type': 'application/json',
      },
      method: 'POST',
      body: JSON.stringify(params),
    })

    return response.json()
  }
}
```

### 3. 添加自定义 Hook

```typescript
// 自定义 Hook 模板
export function useCustomHook<T>(initialValue: T) {
  const [state, setState] = useState<T>(initialValue)

  const updateState = useCallback((newValue: T) => {
    setState(newValue)
  }, [])

  const resetState = useCallback(() => {
    setState(initialValue)
  }, [initialValue])

  return {
    state,
    updateState,
    resetState,
  }
}
```

---

## 🎉 总结

这个通用指南为你提供了在 shadcn-admin 项目中实现任何模块 API 接入的完整解决方案。通过使用代码生成器和标准化模板，你可以：

1. **快速创建新模块** - 使用代码生成器一键生成所有必要文件
2. **保持代码一致性** - 遵循统一的架构模式和代码风格
3. **确保类型安全** - 全链路 TypeScript 支持
4. **提供良好体验** - 标准化的加载状态、错误处理和用户反馈
5. **优化性能** - 智能缓存和数据管理策略

遵循这些最佳实践，你可以构建可维护、可扩展的高质量应用程序。