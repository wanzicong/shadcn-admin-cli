/**
 * 应用标题组件
 *
 * 显示在侧边栏顶部的应用标题和副标题，
 * 作为 TeamSwitcher 的简化替代方案
 *
 * 功能：
 * - 点击标题返回首页
 * - 在移动端自动关闭侧边栏
 * - 包含切换侧边栏的按钮
 *
 * @component
 * @returns {JSX.Element} 应用标题组件
 */
import { Link } from '@tanstack/react-router'
import { cn } from '@/develop/(lib)/utils.ts'
import { Menu, X } from 'lucide-react'
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from '@/components/ui/sidebar.tsx'
import { Button } from '../../components/ui/button.tsx'

export function AppTitle() {
     // 获取移动端侧边栏的开关状态
     const { setOpenMobile } = useSidebar()
     return (
          <SidebarMenu>
               <SidebarMenuItem>
                    {/* 使用大号按钮样式，移除悬停和激活状态背景 */}
                    <SidebarMenuButton size='lg' className='gap-0 py-0 hover:bg-transparent active:bg-transparent' asChild>
                         <div>
                              {/* 应用标题链接：点击返回首页并在移动端关闭侧边栏 */}
                              <Link to='/' onClick={() => setOpenMobile(false)} className='grid flex-1 text-start text-sm leading-tight'>
                                   <span className='truncate font-bold'>Shadcn-Admin</span>
                                   <span className='truncate text-xs'>Vite + ShadcnUI</span>
                              </Link>

                              {/* 侧边栏切换按钮 */}
                              <ToggleSidebar />
                         </div>
                    </SidebarMenuButton>
               </SidebarMenuItem>
          </SidebarMenu>
     )
}

/**
 * 侧边栏切换按钮组件
 *
 * 提供切换侧边栏显示/隐藏的功能
 * - 在桌面端显示菜单图标
 * - 在移动端显示关闭图标
 * - 支持自定义样式和点击事件
 *
 * @param props - Button 组件的所有属性
 * @returns {JSX.Element} 切换按钮
 */
function ToggleSidebar({ className, onClick, ...props }: React.ComponentProps<typeof Button>) {
     // 获取切换侧边栏的方法
     const { toggleSidebar } = useSidebar()

     return (
          <Button
               data-sidebar='trigger' // 标识为侧边栏触发器
               data-slot='sidebar-trigger' // 标识为侧边栏插槽
               variant='ghost' // 幽灵按钮样式
               size='icon' // 图标尺寸
               className={cn('aspect-square size-8 max-md:scale-125', className)} // 在移动端放大按钮
               onClick={(event) => {
                    onClick?.(event) // 执行传入的点击事件
                    toggleSidebar() // 切换侧边栏状态
               }}
               {...props}
          >
               {/* 移动端显示关闭图标，桌面端隐藏 */}
               <X className='md:hidden' />
               {/* 桌面端显示菜单图标，移动端隐藏 */}
               <Menu className='max-md:hidden' />

               {/* 屏幕阅读器文本 */}
               <span className='sr-only'>Toggle Sidebar</span>
          </Button>
     )
}
