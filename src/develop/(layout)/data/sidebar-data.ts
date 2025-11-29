/**
 * 侧边栏数据配置文件
 *
 * 提供侧边栏组件所需的完整数据配置
 */
import { menus } from '@/develop/(layout)/data/navGroups.ts'
import { AudioWaveform, Command, GalleryVerticalEnd } from 'lucide-react'
import { type SidebarData } from '../types.ts'

/**
 * 侧边栏数据配置
 *
 * 包含侧边栏所需的所有数据：
 * - user: 用户信息（头像、名称、邮箱），显示在侧边栏底部
 * - teams: 团队列表，用于团队切换器的下拉菜单
 * - navGroups: 导航组列表，用于构建导航菜单结构
 *
 * 使用方式：
 * 在 AppSidebar 组件中导入此配置，传递给相应的子组件使用
 */
export const sidebarData: SidebarData = {
     // ===== 用户信息配置 =====
     // 显示在侧边栏底部的用户导航信息
     user: {
          name: 'satnaing', // 用户姓名
          email: 'satnaingdev@gmail.com', // 用户邮箱
          avatar: '/avatars/shadcn.jpg', // 用户头像图片路径
     },

     // ===== 团队列表配置 =====
     // 用于团队切换器的下拉菜单，支持多团队切换
     teams: [
          {
               name: 'Shadcn Admin 脚手架', // 团队名称
               logo: Command, // 团队图标组件
               plan: 'Vite + ShadcnUI', // 团队计划类型
          },
          {
               name: 'Acme Inc', // 企业版团队
               logo: GalleryVerticalEnd, // 团队图标组件
               plan: 'Enterprise', // 团队计划类型
          },
          {
               name: 'Acme Corp.', // 创业版团队
               logo: AudioWaveform, // 团队图标组件
               plan: 'Startup', // 团队计划类型
          },
     ],

     // ===== 导航组列表 =====
     // 从 navGroups.ts 导入的完整导航菜单配置
     // 包含所有导航组和导航项的定义
     navGroups: menus,
}
