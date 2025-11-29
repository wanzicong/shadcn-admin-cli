# 网络请求工具

基于 Axios 封装的网络请求工具，支持环境变量配置、跨域请求和严格的 TypeScript 类型定义。

## 功能特性

- ✅ 严格的 TypeScript 类型定义
- ✅ 环境变量配置支持
- ✅ 跨域请求支持（开发环境代理）
- ✅ 自动 token 注入
- ✅ 请求/响应拦截器
- ✅ 统一错误处理
- ✅ 文件上传/下载支持
- ✅ 开发环境请求日志

## 环境变量配置

在项目根目录创建 `.env` 文件：

```env
# API 配置
VITE_API_BASE_URL=http://localhost:8080
VITE_API_TIMEOUT=30000
VITE_API_PREFIX=
VITE_APP_TITLE=Shadcn Admin 脚手架
VITE_APP_ENV=development
```

## 基本使用

### GET 请求

```typescript
import { get } from '@/develop/(services)/request'

// 简单请求
const users = await get<User[]>('/users')

// 带参数请求
const user = await get<User>('/users/1', { id: 1 })

// 自定义配置
const data = await get(
     '/users',
     {},
     {
          showLoading: true,
          showError: false,
          needToken: false,
     }
)
```

### POST 请求

```typescript
import { post } from '@/develop/(services)/request'

// 创建用户
const newUser = await post<User>('/users', {
     name: 'John',
     email: 'john@example.com',
})

// 自定义错误处理
const result = await post('/users', data, {
     customErrorHandler: (error) => {
          console.error('自定义错误处理:', error)
     },
})
```

### PUT/PATCH/DELETE 请求

```typescript
import { put, patch, del } from '@/develop/(services)/request'

// 更新用户
const updatedUser = await put<User>('/users/1', {
     name: 'Jane',
})

// 部分更新
const patchedUser = await patch<User>('/users/1', {
     name: 'Jane',
})

// 删除用户
await del('/users/1')
```

### 文件上传

```typescript
import { upload } from '@/develop/(services)/request'

// 上传单个文件
const file = document.querySelector('input[type="file"]')?.files?.[0]
if (file) {
     const result = await upload<{ url: string }>('/upload', file, {
          onUploadProgress: (progress) => {
               const percent = (progress.loaded / progress.total) * 100
               console.log(`上传进度: ${percent}%`)
          },
     })
}

// 上传多个文件
const formData = new FormData()
formData.append('file1', file1)
formData.append('file2', file2)
const result = await upload('/upload', formData)
```

### 文件下载

```typescript
import { download } from '@/develop/(services)/request'

// 下载文件
await download('/export/users', { format: 'excel' }, 'users.xlsx')
```

## 类型定义

### 请求配置

```typescript
interface RequestConfig {
     showLoading?: boolean // 是否显示加载提示
     showError?: boolean // 是否显示错误提示
     needToken?: boolean // 是否携带 token
     customErrorHandler?: (error: RequestError) => void // 自定义错误处理
     // ... 其他 AxiosRequestConfig 选项
}
```

### 响应数据结构

```typescript
interface ResponseData<T> {
     code: number
     message: string
     data: T
     success?: boolean
}
```

### 分页响应

```typescript
interface PageResponseData<T> {
     list: T[]
     total: number
     page: number
     pageSize: number
}
```

## 错误处理

### 自动错误处理

默认情况下，请求失败会自动显示错误提示。可以通过配置禁用：

```typescript
const data = await get(
     '/users',
     {},
     {
          showError: false, // 禁用自动错误提示
     }
)
```

### 自定义错误处理

```typescript
const data = await get(
     '/users',
     {},
     {
          customErrorHandler: (error) => {
               // 自定义错误处理逻辑
               if (error.errorCode === 401) {
                    // 处理未授权错误
                    router.navigate({ to: '/sign-in' })
               }
          },
     }
)
```

### 错误类型

```typescript
interface RequestError extends AxiosError<ResponseData> {
     errorCode?: number | string
     errorMessage?: string
}
```

## 跨域配置

### 开发环境

在 `vite.config.ts` 中已配置代理：

```typescript
server: {
  proxy: {
    '/api': {
      target: process.env.VITE_API_BASE_URL || 'http://localhost:8080',
      changeOrigin: true,
      secure: false,
      rewrite: (path) => path.replace(/^\/api/, ''),
    },
  },
}
```

### 生产环境

生产环境需要在后端配置 CORS，或使用 Nginx 等反向代理。

## 与 TanStack Query 集成

```typescript
import { useQuery } from '@tanstack/react-query'
import { get } from '@/develop/(services)/request'

function useUsers() {
     return useQuery({
          queryKey: ['users'],
          queryFn: () => get<User[]>('/users'),
     })
}
```

## 注意事项

1. 所有环境变量必须以 `VITE_` 开头才能在客户端访问
2. 开发环境会自动代理 `/api` 请求到后端服务器
3. Token 会自动从 `useAuthStore` 中获取并添加到请求头
4. 响应数据会自动提取 `data` 字段（如果存在）
5. 请求失败会自动显示错误提示（可通过配置禁用）
