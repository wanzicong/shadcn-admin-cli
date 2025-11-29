import { Shield, UserCheck, Users, CreditCard } from 'lucide-react'
import { type UserStatus } from './schema.ts'

// 定义用户状态对应的样式类名，用于在UI中显示不同状态的视觉样式
export const callTypes = new Map<UserStatus, string>([
     // 活跃状态：使用青色背景，表示正常运行
     ['active', 'bg-teal-100/30 text-teal-900 dark:text-teal-200 border-teal-200'],
     // 非活跃状态：使用中性灰色，表示暂时不可用
     ['inactive', 'bg-neutral-300/40 border-neutral-300'],
     // 已邀请状态：使用天蓝色，表示待确认状态
     ['invited', 'bg-sky-200/40 text-sky-900 dark:text-sky-100 border-sky-300'],
     // 暂停状态：使用红色背景，表示被暂停或禁止
     ['suspended', 'bg-destructive/10 dark:bg-destructive/50 text-destructive dark:text-primary border-destructive/10'],
])

// 定义系统中支持的所有用户角色及其显示信息
export const roles = [
     {
          label: 'Superadmin', // 显示标签
          value: 'superadmin', // 内部值
          icon: Shield, // 对应的图标组件
     },
     {
          label: 'Admin',
          value: 'admin',
          icon: UserCheck,
     },
     {
          label: 'Manager',
          value: 'manager',
          icon: Users,
     },
     {
          label: 'Cashier',
          value: 'cashier',
          icon: CreditCard,
     },
] as const
