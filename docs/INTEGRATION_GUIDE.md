# 前后端集成指南

本文档介绍如何启动和测试 FastAPI 后端服务与 Shadcn Admin 前端的集成。

## 🚀 快速开始

### 1. 启动后端服务

```bash
# 进入后端项目目录
cd mocker

# 安装依赖
poetry install

# 初始化数据库（创建示例数据）
poetry run python -m mocker.seed

# 启动开发服务器
poetry run python -m mocker.run
```

后端服务将在 `http://localhost:9000` 启动。

### 2. 启动前端服务

```bash
# 在项目根目录
pnpm install

# 启动开发服务器
pnpm dev
```

前端服务将在 `http://localhost:3000` 启动。

### 3. 访问应用

- **前端应用**: http://localhost:3000
- **后端 API 文档**: http://localhost:9000/docs
- **API 健康检查**: http://localhost:9000/health

## 🔐 默认登录账号

| 用户名 | 密码 | 角色 | 权限说明 |
|--------|------|------|----------|
| superadmin | admin123 | 超级管理员 | 所有权限 |
| zhangsan | user123 | 管理员 | 用户和任务管理 |
| lisi | user123 | 经理 | 任务管理 |
| wangwu | user123 | 收银员 | 基础权限（非活跃） |
| zhaoliu | user123 | 收银员 | 待激活 |
| qianqi | user123 | 收银员 | 已暂停 |

## 🧪 测试 API 对接

### 1. 认证测试

使用 superadmin 账号登录：
```javascript
// 在浏览器控制台测试
const loginData = {
  username: "superadmin",
  password: "admin123"
}

// 登录
const response = await fetch('/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(loginData)
})
const token = await response.json()
console.log('Token:', token.access_token)
```

### 2. 用户管理测试

获取用户列表：
```javascript
// 需要先登录获取 token
const token = localStorage.getItem('auth-storage') // 从 auth store 获取

const response = await fetch('/api/users/?page=1&page_size=10', {
  headers: { 'Authorization': `Bearer ${token}` }
})
const users = await response.json()
console.log('Users:', users)
```

### 3. 任务管理测试

获取任务列表：
```javascript
const response = await fetch('/api/tasks/?page=1&page_size=10', {
  headers: { 'Authorization': `Bearer ${token}` }
})
const tasks = await response.json()
console.log('Tasks:', tasks)
```

## 📱 在前端页面中使用

### 1. 认证 Hook 使用

```typescript
import { useLogin, useAuth } from '@/develop/(services)/hooks'

// 登录组件
function LoginForm() {
  const login = useLogin()

  const handleSubmit = (data: LoginRequest) => {
    login.mutate(data)
  }

  return <form onSubmit={handleSubmit}>...</form>
}

// 获取当前用户
function UserProfile() {
  const { user, isAuthenticated, isLoading } = useAuth()

  if (isLoading) return <div>Loading...</div>
  if (!isAuthenticated) return <div>Please login</div>

  return <div>Welcome, {user?.firstName}!</div>
}
```

### 2. 用户管理 Hook 使用

```typescript
import { useUsers, useCreateUser, useDeleteUser } from '@/develop/(services)/hooks'

// 用户列表页面
function UsersPage() {
  const { data: users, isLoading, error } = useUsers({
    page: 1,
    page_size: 10,
    search: '张'
  })

  const createUser = useCreateUser()
  const deleteUser = useDeleteUser()

  const handleCreateUser = (userData: UserCreate) => {
    createUser.mutate(userData)
  }

  const handleDeleteUser = (userId: string) => {
    deleteUser.mutate(userId)
  }

  if (isLoading) return <div>Loading...</div>
  if (error) return <div>Error: {error.message}</div>

  return (
    <div>
      {/* 用户列表渲染 */}
      {users?.data?.map(user => (
        <div key={user.id}>
          {user.firstName} {user.lastName}
          <button onClick={() => handleDeleteUser(user.id)}>删除</button>
        </div>
      ))}
    </div>
  )
}
```

### 3. 任务管理 Hook 使用

```typescript
import { useTasks, useCreateTask, useUpdateTaskStatus } from '@/develop/(services)/hooks'

// 任务列表页面
function TasksPage() {
  const { data: tasks, isLoading } = useTasks({
    page: 1,
    page_size: 10,
    status: 'todo'
  })

  const createTask = useCreateTask()
  const updateStatus = useUpdateTaskStatus()

  const handleCreateTask = (taskData: TaskCreate) => {
    createTask.mutate(taskData)
  }

  const handleStatusChange = (taskId: string, status: TaskStatus) => {
    updateStatus.mutate({ taskId, status })
  }

  return (
    <div>
      {/* 任务列表渲染 */}
      {tasks?.data?.map(task => (
        <div key={task.id}>
          <h3>{task.title}</h3>
          <p>Status: {task.status}</p>
          <select
            value={task.status}
            onChange={(e) => handleStatusChange(task.id, e.target.value as TaskStatus)}
          >
            <option value="todo">Todo</option>
            <option value="in progress">In Progress</option>
            <option value="done">Done</option>
          </select>
        </div>
      ))}
    </div>
  )
}
```

## 🔧 配置说明

### 前端环境变量

在 `.env.local` 文件中配置：

```env
# 后端 API 地址
VITE_API_BASE_URL=http://localhost:9000

# API 前缀（可选）
VITE_API_PREFIX=

# 请求超时时间
VITE_API_TIMEOUT=30000
```

### 后端环境变量

在 `mocker/.env` 文件中配置：

```env
# 数据库
DATABASE_URL=sqlite:///./mocker.db

# JWT 密钥（生产环境请修改）
SECRET_KEY=your-super-secret-key-change-in-production-2024

# 服务配置
API_HOST=0.0.0.0
API_PORT=9000

# CORS 允许的前端地址
ALLOWED_ORIGINS=http://localhost:3000
```

## 🐛 常见问题

### 1. CORS 错误

**问题**: 前端无法访问后端 API，出现跨域错误。

**解决方案**:
- 检查后端 `mocker/.env` 文件中的 `ALLOWED_ORIGINS` 配置
- 确保前端地址格式正确：`http://localhost:3000`
- 重启后端服务

### 2. 认证失败

**问题**: 登录成功后，API 调用返回 401 未授权。

**解决方案**:
- 检查 token 是否正确存储在 auth store 中
- 确认请求头中包含 `Authorization: Bearer <token>`
- 检查 JWT 密钥是否正确配置

### 3. 数据库连接失败

**问题**: 后端启动时数据库连接错误。

**解决方案**:
- 确保运行了 `poetry run python -m mocker.seed` 初始化数据库
- 检查 `mocker/` 目录下是否有 `mocker.db` 文件
- 检查数据库文件权限

### 4. 前端页面显示加载中

**问题**: 页面一直显示 Loading 状态。

**解决方案**:
- 检查浏览器开发者工具的网络请求
- 确认 API 请求是否正确发送
- 检查后端服务是否正在运行
- 查看控制台错误信息

## 📊 性能优化

### 1. 查询缓存

React Query 已配置缓存：
- 用户列表：5分钟
- 任务列表：5分钟
- 统计数据：10分钟

### 2. 分页加载

使用分页参数避免一次性加载大量数据：
```typescript
// 推荐的分页大小
const params = {
  page: 1,
  page_size: 20  // 每页20条记录
}
```

### 3. 条件查询

使用搜索和筛选减少数据传输：
```typescript
// 按状态筛选
const tasks = useTasks({ status: 'todo' })

// 搜索关键词
const users = useUsers({ search: '张三' })
```

## 🔄 数据同步

### 自动刷新

以下操作会自动刷新相关数据：
- 创建/更新/删除用户
- 创建/更新/删除任务
- 更新任务状态

### 手动刷新

```typescript
// 手动刷新用户列表
const queryClient = useQueryClient()
queryClient.invalidateQueries({ queryKey: ['users'] })
```

## 📚 API 参考

详细的 API 文档请访问：
- **Swagger UI**: http://localhost:9000/docs
- **ReDoc**: http://localhost:9000/redoc

## 🚨 安全提醒

1. **生产环境**：请修改默认 JWT 密钥
2. **HTTPS**：生产环境建议使用 HTTPS
3. **数据库**：生产环境建议使用 PostgreSQL 或 MySQL
4. **密码策略**：强制用户使用强密码
5. **日志监控**：配置日志记录和监控

## 📞 支持

如有问题，请：
1. 查看浏览器控制台错误
2. 检查后端服务日志
3. 确认网络连接正常
4. 参考本文档的常见问题部分