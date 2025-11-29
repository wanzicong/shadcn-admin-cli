import { menus } from '@/develop/(layout)/data/navGroups.ts'
import { AudioWaveform, Command, GalleryVerticalEnd } from 'lucide-react'
import { type SidebarData } from '../types.ts'

/**
 * 侧边栏数据配置
 * 
 * 包含侧边栏所需的所有数据：
 * - user: 用户信息（头像、名称、邮箱）
 * - teams: 团队列表（用于团队切换器）
 * - navGroups: 导航组列表（用于导航菜单）
 * 
 * 使用方式：
 * 在 AppSidebar 组件中导入此配置，传递给相应的子组件
 */
export const sidebarData: SidebarData = {
     // 用户信息：显示在侧边栏底部
     user: {
          name: 'satnaing',
          email: 'satnaingdev@gmail.com',
          avatar: '/avatars/shadcn.jpg',
     },
     
     // 团队列表：用于团队切换器下拉菜单
     teams: [
          {
               name: 'Shadcn Admin 脚手架',
               logo: Command,
               plan: 'Vite + ShadcnUI',
          },
          {
               name: 'Acme Inc',
               logo: GalleryVerticalEnd,
               plan: 'Enterprise',
          },
          {
               name: 'Acme Corp.',
               logo: AudioWaveform,
               plan: 'Startup',
          },
     ],
     
     // 导航组列表：从 navGroups.ts 导入
     navGroups: menus,
}
