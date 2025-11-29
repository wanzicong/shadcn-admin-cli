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
import { ClerkLogo } from '@/assets/clerk-logo.tsx'

export const menus = [
     {
          title: '官方示例',
          items: [
               {
                    title: '仪表板',
                    url: '/',
                    icon: LayoutDashboard,
               },
               {
                    title: '任务',
                    url: '/official/tasks',
                    icon: ListTodo,
               },
               {
                    title: '应用',
                    url: '/official/apps',
                    icon: Package,
               },
               {
                    title: '聊天',
                    url: '/official/chats',
                    badge: '3',
                    icon: MessagesSquare,
               },
               {
                    title: '用户',
                    url: '/official/users',
                    icon: Users,
               },
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
               {
                    title: '帮助中心',
                    url: '/official/help-center',
                    icon: HelpCircle,
               },
          ],
     },
     {
          title: '自定义案例',
          items: [],
     },
]
