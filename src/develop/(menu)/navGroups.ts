import { ClerkLogo } from '@/static/assets/clerk-logo.tsx'
import {
     Bell,
     Bug,
     Construction,
     FileX,
     HelpCircle,
     LayoutDashboard,
     ListTodo,
     Lock,
     MessagesSquare,
     Monitor,
     Package,
     Palette,
     ServerOff,
     Settings,
     ShieldCheck,
     UserCog,
     Users,
     UserX,
     Wrench,
} from 'lucide-react'

/**
 * 导航菜单数据配置文件
 *
 * 定义侧边栏的所有导航组和导航项结构
 * 包含官方示例和自定义案例两个主要导航组
 *
 * === 导航项类型 ===
 * 1. 普通链接：直接跳转到指定路由的简单导航项
 * 2. 可折叠菜单：包含子项的导航项，支持展开/收起操作
 *
 * === 导航项属性说明 ===
 * - title: 导航项显示标题（必需）
 * - url: 路由路径（普通链接必需，可折叠菜单不需要）
 * - icon: 图标组件（可选，使用 Lucide React 图标）
 * - badge: 徽章文本（可选，用于显示未读消息数量等状态）
 * - items: 子导航项数组（可折叠菜单必需，普通链接为 never）
 *
 * === 使用说明 ===
 * 此配置会被 sidebar-data.ts 导入，最终传递给 AppSidebar 组件
 * 用于渲染完整的侧边栏导航结构
 */
export const menus = [
     {
          title: '官方示例',
          items: [
               // 仪表板：首页
               {
                    title: '仪表板',
                    url: '/',
                    icon: LayoutDashboard,
               },
               // 用户管理
               {
                    title: '用户',
                    url: '/official/users',
                    icon: Users,
               },
               // 任务管理
               {
                    title: '任务',
                    url: '/official/tasks',
                    icon: ListTodo,
               },
               // 应用列表
               {
                    title: '应用',
                    url: '/official/apps',
                    icon: Package,
               },
               // 聊天：带未读消息徽章
               {
                    title: '聊天',
                    url: '/official/chats',
                    badge: '3', // 显示 3 条未读消息
                    icon: MessagesSquare,
               },
               // Clerk 安全认证：可折叠菜单
               {
                    title: 'Clerk 安全认证',
                    icon: ClerkLogo,
                    items: [
                         {
                              title: '登录',
                              url: '/clerk/sign-in',
                         },
                         {
                              title: '注册',
                              url: '/clerk/sign-up',
                         },
                         {
                              title: '用户管理',
                              url: '/clerk/user-management',
                         },
                    ],
               },
               // 认证：可折叠菜单
               {
                    title: '认证',
                    icon: ShieldCheck,
                    items: [
                         {
                              title: '登录',
                              url: '/sign-in',
                         },
                         {
                              title: '登录（双栏）',
                              url: '/sign-in-2',
                         },
                         {
                              title: '注册',
                              url: '/sign-up',
                         },
                         {
                              title: '忘记密码',
                              url: '/forgot-password',
                         },
                         {
                              title: '验证码',
                              url: '/otp',
                         },
                    ],
               },
               // 错误页面：可折叠菜单
               {
                    title: '错误页面',
                    icon: Bug,
                    items: [
                         {
                              title: '未授权',
                              url: '/official/errors/unauthorized',
                              icon: Lock,
                         },
                         {
                              title: '禁止访问',
                              url: '/official/errors/forbidden',
                              icon: UserX,
                         },
                         {
                              title: '未找到',
                              url: '/official/errors/not-found',
                              icon: FileX,
                         },
                         {
                              title: '服务器内部错误',
                              url: '/official/errors/internal-server-error',
                              icon: ServerOff,
                         },
                         {
                              title: '维护中',
                              url: '/official/errors/maintenance-error',
                              icon: Construction,
                         },
                    ],
               },
               // 设置：可折叠菜单
               {
                    title: '设置',
                    icon: Settings,
                    items: [
                         {
                              title: '个人资料',
                              url: '/official/settings',
                              icon: UserCog,
                         },
                         {
                              title: '账户',
                              url: '/official/settings/account',
                              icon: Wrench,
                         },
                         {
                              title: '外观',
                              url: '/official/settings/appearance',
                              icon: Palette,
                         },
                         {
                              title: '通知',
                              url: '/official/settings/notifications',
                              icon: Bell,
                         },
                         {
                              title: '显示',
                              url: '/official/settings/display',
                              icon: Monitor,
                         },
                    ],
               },
               // 帮助中心
               {
                    title: '帮助中心',
                    url: '/official/help-center',
                    icon: HelpCircle,
               },
          ],
     },
     {
          title: '官方案例-API改造',
          items: [
               // 用户管理
               {
                    title: '用户',
                    url: '/official-api/users',
                    icon: Users,
               },
               // 任务管理
               {
                    title: '任务',
                    url: '/official-api/tasks',
                    icon: ListTodo,
               },
          ], // 空数组，可以添加自定义导航项
     },
     {
          title: '手写案例',
          items: [
               {
                    title: '案例Table1',
                    url: '/demos',
                    icon: Users,
               },
               {
                    title: '案例Table1',
                    url: '/demos/demo1',
                    icon: Users,
               },
               {
                    title: '案例Table1',
                    url: '/demos/demo2',
                    icon: Users,
               },
          ],
     },
]
