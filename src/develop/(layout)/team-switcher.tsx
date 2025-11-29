/**
 * 团队切换器组件
 *
 * 显示在侧边栏顶部的团队选择器，支持：
 * - 显示当前活跃团队的名称和计划
 * - 切换不同的团队/项目
 * - 添加新团队（占位功能）
 * - 键盘快捷键支持（⌘1, ⌘2 等）
 *
 * 特性：
 * - 响应式设计，移动端和桌面端有不同的弹出方向
 * - 团队图标显示
 * - 当前活跃状态高亮
 *
 * @component
 * @param teams - 团队数组
 * @returns {JSX.Element} 团队切换器组件
 */
import * as React from 'react'
import { ChevronsUpDown, Plus } from 'lucide-react'
import {
     DropdownMenu,
     DropdownMenuContent,
     DropdownMenuItem,
     DropdownMenuLabel,
     DropdownMenuSeparator,
     DropdownMenuShortcut,
     DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu.tsx'
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from '@/components/ui/sidebar.tsx'

type TeamSwitcherProps = {
     teams: {
          name: string
          logo: React.ElementType
          plan: string
     }[]
}

export function TeamSwitcher({ teams }: TeamSwitcherProps) {
     // 获取侧边栏移动端状态
     const { isMobile } = useSidebar()
     // 当前活跃团队状态，默认为第一个团队
     const [activeTeam, setActiveTeam] = React.useState(teams[0])

     return (
          <SidebarMenu>
               <SidebarMenuItem>
                    <DropdownMenu>
                         {/* 团队切换器触发器 */}
                         <DropdownMenuTrigger asChild>
                              <SidebarMenuButton size='lg' className='data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground'>
                                   {/* 团队图标显示区域 */}
                                   <div className='bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg'>
                                        <activeTeam.logo className='size-4' />
                                   </div>

                                   {/* 团队信息：名称和计划 */}
                                   <div className='grid flex-1 text-start text-sm leading-tight'>
                                        <span className='truncate font-semibold'>{activeTeam.name}</span>
                                        <span className='truncate text-xs'>{activeTeam.plan}</span>
                                   </div>

                                   {/* 下拉指示箭头 */}
                                   <ChevronsUpDown className='ms-auto' />
                              </SidebarMenuButton>
                         </DropdownMenuTrigger>

                         {/* 团队选择下拉菜单 */}
                         <DropdownMenuContent
                              className='w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg'
                              align='start'
                              side={isMobile ? 'bottom' : 'right'} // 移动端向下，桌面端向右
                              sideOffset={4}
                         >
                              {/* 下拉菜单标题 */}
                              <DropdownMenuLabel className='text-muted-foreground text-xs'>Teams</DropdownMenuLabel>

                              {/* 团队列表 */}
                              {teams.map((team, index) => (
                                   <DropdownMenuItem
                                        key={team.name}
                                        onClick={() => setActiveTeam(team)} // 点击切换活跃团队
                                        className='gap-2 p-2'
                                   >
                                        {/* 团队图标 */}
                                        <div className='flex size-6 items-center justify-center rounded-sm border'>
                                             <team.logo className='size-4 shrink-0' />
                                        </div>

                                        {/* 团队名称 */}
                                        {team.name}

                                        {/* 键盘快捷键提示 */}
                                        <DropdownMenuShortcut>⌘{index + 1}</DropdownMenuShortcut>
                                   </DropdownMenuItem>
                              ))}

                              {/* 分隔线 */}
                              <DropdownMenuSeparator />

                              {/* 添加新团队选项 */}
                              <DropdownMenuItem className='gap-2 p-2'>
                                   <div className='bg-background flex size-6 items-center justify-center rounded-md border'>
                                        <Plus className='size-4' />
                                   </div>
                                   <div className='text-muted-foreground font-medium'>Add team</div>
                              </DropdownMenuItem>
                         </DropdownMenuContent>
                    </DropdownMenu>
               </SidebarMenuItem>
          </SidebarMenu>
     )
}
