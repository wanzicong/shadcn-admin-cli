/**
 * 导航组组件
 *
 * 渲染侧边栏中的导航组，包含多个导航项
 * 支持三种渲染模式：
 * 1. 普通链接：直接跳转的菜单项
 * 2. 可折叠菜单：展开/收起的子菜单
 * 3. 下拉菜单：侧边栏折叠时的下拉式菜单
 *
 * @component
 * @param title - 导航组标题
 * @param items - 导航项数组
 * @returns {JSX.Element} 导航组组件
 */
import { type ReactNode } from 'react'
import { Link, useLocation } from '@tanstack/react-router'
import { ChevronRight } from 'lucide-react'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible.tsx'
import {
     SidebarGroup,
     SidebarGroupLabel,
     SidebarMenu,
     SidebarMenuButton,
     SidebarMenuItem,
     SidebarMenuSub,
     SidebarMenuSubButton,
     SidebarMenuSubItem,
     useSidebar,
} from '@/components/ui/sidebar.tsx'
import { Badge } from '../../components/ui/badge.tsx'
import {
     DropdownMenu,
     DropdownMenuContent,
     DropdownMenuItem,
     DropdownMenuLabel,
     DropdownMenuSeparator,
     DropdownMenuTrigger,
} from '../../components/ui/dropdown-menu.tsx'
import { type NavCollapsible, type NavItem, type NavLink, type NavGroup as NavGroupProps } from './types.ts'

export function NavGroup({ title, items }: NavGroupProps) {
     // 获取侧边栏状态（展开/折叠）和设备类型（移动端/桌面端）
     const { state, isMobile } = useSidebar()
     // 获取当前页面路由
     const href = useLocation({ select: (location) => location.href })

     return (
          <SidebarGroup>
               {/* 导航组标题标签 */}
               <SidebarGroupLabel>{title}</SidebarGroupLabel>

               {/* 导航菜单容器 */}
               <SidebarMenu>
                    {items.map((item) => {
                         // 生成唯一键值
                         const key = `${item.title}-${item.url}`

                         // 判断导航项类型并渲染对应组件
                         if (!item.items) {
                              // 普通链接：没有子项的导航
                              return <SidebarMenuLink key={key} item={item} href={href} />
                         }

                         if (state === 'collapsed' && !isMobile) {
                              // 下拉菜单：侧边栏折叠时在桌面端显示下拉菜单
                              return <SidebarMenuCollapsedDropdown key={key} item={item} href={href} />
                         }

                         // 可折叠菜单：侧边栏展开时显示可展开的子菜单
                         return <SidebarMenuCollapsible key={key} item={item} href={href} />
                    })}
               </SidebarMenu>
          </SidebarGroup>
     )
}

/**
 * 导航徽章组件
 *
 * 用于显示导航项的状态信息，如未读消息数量等
 *
 * @component
 * @param children - 徽章内容
 * @returns {JSX.Element} 徽章组件
 */
function NavBadge({ children }: { children: ReactNode }) {
     return <Badge className='rounded-full px-1 py-0 text-xs'>{children}</Badge>
}

/**
 * 侧边栏菜单链接组件
 *
 * 渲染普通的导航链接项，没有子菜单
 *
 * @component
 * @param item - 导航项配置
 * @param href - 当前页面路由
 * @returns {JSX.Element} 菜单链接组件
 */
function SidebarMenuLink({ item, href }: { item: NavLink; href: string }) {
     // 获取移动端侧边栏关闭方法
     const { setOpenMobile } = useSidebar()

     return (
          <SidebarMenuItem>
               <SidebarMenuButton
                    asChild
                    isActive={checkIsActive(href, item)} // 检查是否为当前活跃页面
                    tooltip={item.title} // 悬停提示
               >
                    <Link to={item.url} onClick={() => setOpenMobile(false)}>
                         {/* 导航图标 */}
                         {item.icon && <item.icon />}

                         {/* 导航标题 */}
                         <span>{item.title}</span>

                         {/* 徽章（如果存在） */}
                         {item.badge && <NavBadge>{item.badge}</NavBadge>}
                    </Link>
               </SidebarMenuButton>
          </SidebarMenuItem>
     )
}

/**
 * 侧边栏可折叠菜单组件
 *
 * 渲染包含子菜单的导航项，支持展开/收起操作
 * 在侧边栏展开状态下显示
 *
 * @component
 * @param item - 可折叠导航项配置
 * @param href - 当前页面路由
 * @returns {JSX.Element} 可折叠菜单组件
 */
function SidebarMenuCollapsible({ item, href }: { item: NavCollapsible; href: string }) {
     // 获取移动端侧边栏关闭方法
     const { setOpenMobile } = useSidebar()

     return (
          <Collapsible
               asChild
               defaultOpen={checkIsActive(href, item, true)} // 如果当前页面或子页面活跃，默认展开
               className='group/collapsible'
          >
               <SidebarMenuItem>
                    {/* 可折叠触发器：点击展开/收起子菜单 */}
                    <CollapsibleTrigger asChild>
                         <SidebarMenuButton tooltip={item.title}>
                              {/* 主导航图标 */}
                              {item.icon && <item.icon />}

                              {/* 主导航标题 */}
                              <span>{item.title}</span>

                              {/* 徽章（如果存在） */}
                              {item.badge && <NavBadge>{item.badge}</NavBadge>}

                              {/* 展开/收起指示箭头 */}
                              <ChevronRight className='ms-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90 rtl:rotate-180' />
                         </SidebarMenuButton>
                    </CollapsibleTrigger>

                    {/* 可折叠内容区域：子菜单项 */}
                    <CollapsibleContent className='CollapsibleContent'>
                         <SidebarMenuSub>
                              {item.items.map((subItem) => (
                                   <SidebarMenuSubItem key={subItem.title}>
                                        <SidebarMenuSubButton
                                             asChild
                                             isActive={checkIsActive(href, subItem)} // 检查子页面是否活跃
                                        >
                                             <Link to={subItem.url} onClick={() => setOpenMobile(false)}>
                                                  {/* 子导航图标 */}
                                                  {subItem.icon && <subItem.icon />}

                                                  {/* 子导航标题 */}
                                                  <span>{subItem.title}</span>

                                                  {/* 子导航徽章（如果存在） */}
                                                  {subItem.badge && <NavBadge>{subItem.badge}</NavBadge>}
                                             </Link>
                                        </SidebarMenuSubButton>
                                   </SidebarMenuSubItem>
                              ))}
                         </SidebarMenuSub>
                    </CollapsibleContent>
               </SidebarMenuItem>
          </Collapsible>
     )
}

/**
 * 侧边栏折叠下拉菜单组件
 *
 * 在侧边栏折叠且桌面端状态下，以下拉菜单形式显示子菜单项
 * 节省侧边栏空间的同时保持导航功能
 *
 * @component
 * @param item - 可折叠导航项配置
 * @param href - 当前页面路由
 * @returns {JSX.Element} 下拉菜单组件
 */
function SidebarMenuCollapsedDropdown({ item, href }: { item: NavCollapsible; href: string }) {
     return (
          <SidebarMenuItem>
               <DropdownMenu>
                    {/* 下拉菜单触发器：点击显示子菜单 */}
                    <DropdownMenuTrigger asChild>
                         <SidebarMenuButton
                              tooltip={item.title}
                              isActive={checkIsActive(href, item)} // 检查是否为当前活跃页面
                         >
                              {/* 主导航图标 */}
                              {item.icon && <item.icon />}

                              {/* 主导航标题 */}
                              <span>{item.title}</span>

                              {/* 徽章（如果存在） */}
                              {item.badge && <NavBadge>{item.badge}</NavBadge>}

                              {/* 下拉指示箭头 */}
                              <ChevronRight className='ms-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90' />
                         </SidebarMenuButton>
                    </DropdownMenuTrigger>

                    {/* 下拉菜单内容 */}
                    <DropdownMenuContent side='right' align='start' sideOffset={4}>
                         {/* 下拉菜单标题 */}
                         <DropdownMenuLabel>
                              {item.title} {item.badge ? `(${item.badge})` : ''}
                         </DropdownMenuLabel>

                         {/* 分隔线 */}
                         <DropdownMenuSeparator />

                         {/* 子菜单项列表 */}
                         {item.items.map((sub) => (
                              <DropdownMenuItem key={`${sub.title}-${sub.url}`} asChild>
                                   <Link
                                        to={sub.url}
                                        className={`${checkIsActive(href, sub) ? 'bg-secondary' : ''}`} // 高亮活跃页面
                                   >
                                        {/* 子导航图标 */}
                                        {sub.icon && <sub.icon />}

                                        {/* 子导航标题，限制最大宽度并支持换行 */}
                                        <span className='max-w-52 text-wrap'>{sub.title}</span>

                                        {/* 子导航徽章，右对齐小字体 */}
                                        {sub.badge && <span className='ms-auto text-xs'>{sub.badge}</span>}
                                   </Link>
                              </DropdownMenuItem>
                         ))}
                    </DropdownMenuContent>
               </DropdownMenu>
          </SidebarMenuItem>
     )
}

/**
 * 检查导航项是否为活跃状态
 *
 * 支持多种匹配规则：
 * 1. 精确匹配：包含查询参数的完整 URL
 * 2. 路径匹配：忽略查询参数的路径
 * 3. 子页面匹配：导航项的子页面是否活跃
 * 4. 一级路径匹配：用于主导航的一级路径匹配
 *
 * @param href - 当前页面 URL
 * @param item - 要检查的导航项
 * @param mainNav - 是否为一级导航，默认 false
 * @returns {boolean} 是否为活跃状态
 */
function checkIsActive(href: string, item: NavItem, mainNav = false) {
     return (
          href === item.url || // 精确匹配：包含查询参数的完整 URL (/endpoint?search=param)
          href.split('?')[0] === item.url || // 路径匹配：忽略查询参数 (/endpoint)
          !!item?.items?.filter((i) => i.url === href).length || // 子页面匹配：检查是否有子页面为活跃状态
          (mainNav && // 一级导航匹配：
               href.split('/')[1] !== '' && // 排除空路径
               href.split('/')[1] === item?.url?.split('/')[1]) // 匹配一级路径
     )
}
