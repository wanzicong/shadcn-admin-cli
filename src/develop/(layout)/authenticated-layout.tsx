/**
 * 认证布局组件 (AuthenticatedLayout)
 *
 * 为需要认证的页面提供完整的布局结构和上下文支持
 *
 * === 布局结构组成 ===
 * 1. SearchProvider - 提供全局搜索功能和状态管理
 * 2. LayoutProvider - 提供布局配置（固定/浮动、侧边栏变体等）
 * 3. SidebarProvider - 提供侧边栏状态管理（展开/折叠）
 * 4. AppSidebar - 渲染侧边栏导航和用户菜单
 * 5. SidebarInset - 主内容区域容器
 * 6. SkipToMain - 无障碍访问支持
 *
 * === 核心功能特性 ===
 * ✅ Cookie 持久化：侧边栏开关状态保存到浏览器 Cookie
 * ✅ 响应式设计：自适应不同屏幕尺寸和设备类型
 * ✅ 固定布局支持：防止内容溢出，适配移动端视窗
 * ✅ 容器查询：支持基于容器尺寸的样式调整
 * ✅ 条件渲染：支持子组件优先或路由出口
 *
 * === 使用场景 ===
 * 适用于所有需要用户认证的页面，如：
 * • 仪表板和管理工作台
 * • 用户设置和个人资料页面
 * • 数据表格和报表页面
 * • 应用配置和系统管理
 */
import { Outlet } from '@tanstack/react-router'
import { LayoutProvider } from '@/develop/(context)/layout-provider.tsx'
import { SearchProvider } from '@/develop/(context)/search-provider.tsx'
import { AppSidebar } from '@/develop/(layout)/app-sidebar.tsx'
import { getCookie } from '@/develop/(lib)/cookies.ts'
import { cn } from '@/develop/(lib)/utils.ts'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar.tsx'
import { SkipToMain } from '@/components/skip-to-main.tsx'

/**
 * 认证布局组件属性类型
 */
type AuthenticatedLayoutProps = {
     children?: React.ReactNode // 可选的子组件内容
}

export function AuthenticatedLayout({ children }: AuthenticatedLayoutProps) {
     // 从 Cookie 读取侧边栏默认开关状态，支持用户偏好记忆
     const defaultOpen = getCookie('sidebar_state') !== 'false'

     return (
          <SearchProvider>
               {/* 提供布局配置管理 */}
               <LayoutProvider>
                    {/* 提供侧边栏状态管理 */}
                    <SidebarProvider defaultOpen={defaultOpen}>
                         {/* 无障碍访问支持 */}
                         <SkipToMain />

                         {/* 侧边栏组件 */}
                         <AppSidebar />

                         {/* 主内容区域 */}
                         <SidebarInset
                              className={cn(
                                   // 设置内容容器，支持容器查询
                                   '@container/content',

                                   // 固定布局时设置高度为视窗高度，防止溢出
                                   'has-data-[layout=fixed]:h-svh',

                                   // 固定布局且侧边栏为内嵌模式时，计算精确高度
                                   'peer-data-[variant=inset]:has-data-[layout=fixed]:h-[calc(100svh-(var(--spacing)*4)]'
                              )}
                         >
                              {/* 条件渲染：子组件或路由出口 */}
                              {children ?? <Outlet />}
                         </SidebarInset>
                    </SidebarProvider>
               </LayoutProvider>
          </SearchProvider>
     )
}
