/**
 * 应用侧边栏组件
 *
 * 构成侧边栏的主要结构，包含：
 * - 侧边栏头部：团队切换器（或应用标题）
 * - 侧边栏内容：导航组列表
 * - 侧边栏底部：用户信息
 * - 侧边栏轨道：用于拖拽调整宽度
 *
 * @component
 * @returns {JSX.Element} 完整的侧边栏组件
 */
// import { AppTitle } from './app-title'  // 备选：使用普通应用标题而非团队切换器
import { useLayout } from '@/develop/(context)/layout-provider.tsx'
import { sidebarData } from '@/develop/(layout)/data/sidebar-data.ts'
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarRail } from '@/components/ui/sidebar.tsx'
import { NavGroup } from './nav-group.tsx'
import { NavUser } from './nav-user.tsx'
import { TeamSwitcher } from './team-switcher.tsx'

export function AppSidebar() {
     // 从布局上下文获取侧边栏的折叠状态和变体配置
     const { collapsible, variant } = useLayout()
     return (
          <Sidebar collapsible={collapsible} variant={variant}>
               {/* 侧边栏头部：显示团队切换器 */}
               <SidebarHeader>
                    <TeamSwitcher teams={sidebarData.teams} />

                    {/*
                     * 备选方案：如果不想使用团队切换器下拉菜单，
                     * 可以使用下面的普通应用标题组件替代
                     */}
                    {/* <AppTitle /> */}
               </SidebarHeader>

               {/* 侧边栏内容区域：渲染所有导航组 */}
               <SidebarContent>
                    {sidebarData.navGroups.map((props) => (
                         <NavGroup key={props.title} {...props} />
                    ))}
               </SidebarContent>

               {/* 侧边栏底部：显示用户信息和操作菜单 */}
               <SidebarFooter>
                    <NavUser user={sidebarData.user} />
               </SidebarFooter>

               {/* 侧边栏轨道：提供拖拽调整侧边栏宽度的功能 */}
               <SidebarRail />
          </Sidebar>
     )
}
