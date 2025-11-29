# 公共 Stores 解读

## 概述

本项目使用 **Zustand** 作为全局状态管理库，提供了轻量级、类型安全的全局状态管理方案。目前项目包含一个核心 Store：**AuthStore**（认证状态管理）。

## Store 列表

1. **AuthStore** - 用户认证状态管理

---

## AuthStore - 认证状态管理

### 功能说明

`AuthStore` 负责管理用户的认证状态，包括用户信息、访问令牌等。使用 Zustand 实现，结合 Cookie 进行持久化存储。

### 核心特性

- ✅ 用户信息管理（账号、邮箱、角色等）
- ✅ 访问令牌管理（Token 存储和刷新）
- ✅ Cookie 持久化（跨会话保持登录状态）
- ✅ 类型安全的 TypeScript 支持
- ✅ 简洁的 API 设计

### 实现细节

**文件位置**: `src/develop/(stores)/auth-store.ts`

**依赖库**:
- `zustand` - 轻量级状态管理库
- Cookie 工具（`@/develop/(lib)/cookies.ts`）

**状态结构**:
```typescript
interface AuthUser {
  accountNo: string    // 账号编号
  email: string        // 邮箱
  role: string[]       // 角色数组
  exp: number          // 过期时间（时间戳）
}

interface AuthState {
  auth: {
    user: AuthUser | null           // 当前用户信息
    setUser: (user: AuthUser | null) => void  // 设置用户信息
    
    accessToken: string             // 访问令牌
    setAccessToken: (accessToken: string) => void  // 设置访问令牌
    
    resetAccessToken: () => void   // 重置访问令牌（登出时清除 Token）
    reset: () => void              // 重置所有认证状态（完全登出）
  }
}
```

**Cookie 存储**:
- Cookie 名称: `thisisjustarandomstring`（实际项目中应使用更安全的名称）
- 存储内容: 访问令牌（JSON 字符串）
- 初始化: 从 Cookie 读取已保存的 Token

### 使用方法

#### 基本使用

```typescript
import { useAuthStore } from '@/develop/(stores)/auth-store'

function UserProfile() {
  const { user, accessToken, setUser, setAccessToken, reset } = useAuthStore(
    (state) => state.auth
  )
  
  return (
    <div>
      {user ? (
        <div>
          <p>账号: {user.accountNo}</p>
          <p>邮箱: {user.email}</p>
          <p>角色: {user.role.join(', ')}</p>
          <button onClick={reset}>登出</button>
        </div>
      ) : (
        <p>未登录</p>
      )}
    </div>
  )
}
```

#### 登录流程

```typescript
async function handleLogin(email: string, password: string) {
  try {
    // 调用登录 API
    const response = await login({ email, password })
    
    // 保存 Token
    useAuthStore.getState().auth.setAccessToken(response.token)
    
    // 保存用户信息
    useAuthStore.getState().auth.setUser({
      accountNo: response.accountNo,
      email: response.email,
      role: response.roles,
      exp: response.exp,
    })
    
    // 跳转到首页
    router.navigate({ to: '/' })
  } catch (error) {
    console.error('登录失败', error)
  }
}
```

#### 登出流程

```typescript
function handleLogout() {
  // 重置所有认证状态（包括清除 Cookie）
  useAuthStore.getState().auth.reset()
  
  // 跳转到登录页
  router.navigate({ to: '/sign-in' })
}
```

#### 检查登录状态

```typescript
function ProtectedRoute({ children }) {
  const { user, accessToken } = useAuthStore((state) => state.auth)
  
  if (!user || !accessToken) {
    return <Navigate to="/sign-in" />
  }
  
  // 检查 Token 是否过期
  if (user.exp * 1000 < Date.now()) {
    useAuthStore.getState().auth.reset()
    return <Navigate to="/sign-in" />
  }
  
  return children
}
```

### API 详解

#### 1. setUser

设置用户信息，通常用于登录后保存用户数据。

```typescript
const setUser = useAuthStore((state) => state.auth.setUser)

setUser({
  accountNo: '12345',
  email: 'user@example.com',
  role: ['admin', 'user'],
  exp: Math.floor(Date.now() / 1000) + 3600, // 1小时后过期
})
```

#### 2. setAccessToken

设置访问令牌，会自动保存到 Cookie。

```typescript
const setAccessToken = useAuthStore((state) => state.auth.setAccessToken)

setAccessToken('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...')
```

**注意**: Token 会自动保存到 Cookie，刷新页面后仍然可用。

#### 3. resetAccessToken

清除访问令牌（但保留用户信息），用于 Token 刷新场景。

```typescript
const resetAccessToken = useAuthStore((state) => state.auth.resetAccessToken)

// 清除 Token（但保留用户信息）
resetAccessToken()
```

#### 4. reset

完全重置认证状态，清除用户信息和 Token，用于登出。

```typescript
const reset = useAuthStore((state) => state.auth.reset)

// 完全登出
reset()
```

### 与网络请求集成

Store 中的 Token 可以在网络请求拦截器中自动使用：

```typescript
// src/develop/(services)/request/interceptors.ts
export function requestInterceptor(config: InternalAxiosRequestConfig) {
  const token = useAuthStore.getState().auth.accessToken
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
}
```

### 状态持久化机制

#### Cookie 存储

Token 通过 Cookie 持久化存储：

```typescript
// 设置 Token 时
setCookie(ACCESS_TOKEN, JSON.stringify(accessToken))

// 初始化时读取
const cookieState = getCookie(ACCESS_TOKEN)
const initToken = cookieState ? JSON.parse(cookieState) : ''
```

#### 初始化流程

1. Store 创建时从 Cookie 读取 Token
2. 如果存在 Token，设置为初始状态
3. 用户信息需要重新获取（Token 刷新后）

### 使用场景

#### 1. 登录页面

```typescript
function SignInPage() {
  const setUser = useAuthStore((state) => state.auth.setUser)
  const setAccessToken = useAuthStore((state) => state.auth.setAccessToken)
  
  const handleSubmit = async (data: LoginFormData) => {
    const response = await login(data)
    setAccessToken(response.token)
    setUser(response.user)
  }
  
  return <SignInForm onSubmit={handleSubmit} />
}
```

#### 2. 受保护的路由

```typescript
function AuthenticatedRoute() {
  const { user, accessToken } = useAuthStore((state) => state.auth)
  
  if (!user || !accessToken) {
    return <Navigate to="/sign-in" />
  }
  
  return <Outlet />
}
```

#### 3. 用户信息显示

```typescript
function UserMenu() {
  const { user } = useAuthStore((state) => state.auth)
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        {user?.email}
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem>个人资料</DropdownMenuItem>
        <DropdownMenuItem onClick={handleLogout}>登出</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
```

#### 4. Token 刷新

```typescript
async function refreshToken() {
  try {
    const response = await api.post('/auth/refresh')
    useAuthStore.getState().auth.setAccessToken(response.token)
  } catch (error) {
    // Token 刷新失败，登出用户
    useAuthStore.getState().auth.reset()
    router.navigate({ to: '/sign-in' })
  }
}
```

### 安全考虑

#### 1. Token 存储

- ✅ 使用 Cookie 存储 Token（支持 HttpOnly，更安全）
- ⚠️ 当前实现使用普通 Cookie，建议使用 HttpOnly Cookie
- ⚠️ Cookie 名称应该更安全（当前为示例名称）

#### 2. Token 过期检查

```typescript
function checkTokenExpiry() {
  const { user } = useAuthStore((state) => state.auth)
  
  if (user && user.exp * 1000 < Date.now()) {
    // Token 已过期
    useAuthStore.getState().auth.reset()
    return false
  }
  
  return true
}
```

#### 3. 角色权限检查

```typescript
function hasRole(requiredRole: string): boolean {
  const { user } = useAuthStore((state) => state.auth)
  
  if (!user) return false
  
  return user.role.includes(requiredRole)
}

// 使用
if (hasRole('admin')) {
  // 显示管理员功能
}
```

### 最佳实践

#### 1. 选择器优化

使用 Zustand 的选择器避免不必要的重渲染：

```typescript
// ✅ 好的做法：只订阅需要的状态
const user = useAuthStore((state) => state.auth.user)

// ❌ 不好的做法：订阅整个状态
const auth = useAuthStore((state) => state.auth)
```

#### 2. 在组件外使用

```typescript
// ✅ 可以在组件外使用
const token = useAuthStore.getState().auth.accessToken

// 在 API 拦截器中使用
axios.interceptors.request.use((config) => {
  const token = useAuthStore.getState().auth.accessToken
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})
```

#### 3. 类型安全

```typescript
// 使用类型推断
const { user } = useAuthStore((state) => state.auth)

// user 的类型自动推断为 AuthUser | null
if (user) {
  // TypeScript 知道 user 不为 null
  console.log(user.email)
}
```

### 扩展建议

#### 1. 添加 Token 刷新逻辑

```typescript
interface AuthState {
  auth: {
    // ... 现有字段
    refreshToken: string
    setRefreshToken: (token: string) => void
    refreshAccessToken: () => Promise<void>
  }
}
```

#### 2. 添加权限检查方法

```typescript
interface AuthState {
  auth: {
    // ... 现有字段
    hasRole: (role: string) => boolean
    hasAnyRole: (roles: string[]) => boolean
    hasAllRoles: (roles: string[]) => boolean
  }
}
```

#### 3. 添加用户偏好设置

```typescript
interface AuthUser {
  // ... 现有字段
  preferences?: {
    theme?: 'light' | 'dark'
    language?: string
  }
}
```

---

## Zustand 优势

### 1. 轻量级

- 包体积小（~1KB）
- 无依赖
- 性能优秀

### 2. 简洁的 API

```typescript
// 创建 Store
const useStore = create((set) => ({
  count: 0,
  increment: () => set((state) => ({ count: state.count + 1 })),
}))

// 使用
const count = useStore((state) => state.count)
const increment = useStore((state) => state.increment)
```

### 3. 类型安全

完整的 TypeScript 支持，类型推断准确。

### 4. 灵活性

- 支持中间件（如持久化、日志等）
- 支持选择器优化
- 支持在组件外使用

---

## 总结

`AuthStore` 提供了完整的认证状态管理功能：

- ✅ 用户信息管理
- ✅ Token 管理
- ✅ Cookie 持久化
- ✅ 类型安全
- ✅ 简洁的 API

通过 Zustand 的轻量级状态管理，实现了高效、类型安全的全局状态管理方案。结合 Cookie 持久化，确保了用户登录状态的跨会话保持。

