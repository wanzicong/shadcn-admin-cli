import { z } from 'zod'

// 定义用户状态枚举类型，确保只能是这四种状态之一
const userStatusSchema = z.union([
     z.literal('active'),    // 活跃状态 - 用户可以正常使用系统
     z.literal('inactive'),  // 非活跃状态 - 用户账户暂时禁用
     z.literal('invited'),   // 已邀请状态 - 用户已收到邀请但尚未注册
     z.literal('suspended') // 暂停状态 - 用户账户因违规等原因被暂停
])

// 导出用户状态类型供其他组件使用
export type UserStatus = z.infer<typeof userStatusSchema>

// 定义用户角色枚举类型，限制系统中的角色层级
const userRoleSchema = z.union([
     z.literal('superadmin'), // 超级管理员 - 拥有系统最高权限
     z.literal('admin'),      // 管理员 - 拥有管理权限但低于超级管理员
     z.literal('cashier'),    // 收银员 - 处理财务相关操作
     z.literal('manager')    // 经理 - 管理特定业务模块
])

// 定义完整的用户数据结构 schema，用于数据验证和类型安全
const userSchema = z.object({
     id: z.string(),           // 用户唯一标识符
     firstName: z.string(),    // 用户名字
     lastName: z.string(),     // 用户姓氏
     username: z.string(),    // 用户名（用于登录）
     email: z.string(),       // 用户邮箱地址
     phoneNumber: z.string(), // 用户手机号码
     status: userStatusSchema, // 用户状态（必须符合上面定义的四种状态）
     role: userRoleSchema,    // 用户角色（必须符合上面定义的四种角色）
     createdAt: z.coerce.date(), // 创建时间（自动转换为Date对象）
     updatedAt: z.coerce.date(), // 更新时间（自动转换为Date对象）
})

// 导出用户类型供组件使用
export type User = z.infer<typeof userSchema>

// 定义用户列表的 schema，用于批量数据验证
export const userListSchema = z.array(userSchema)
