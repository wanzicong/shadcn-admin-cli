/**
 * 布局组件类型定义
 *
 * 定义侧边栏和导航系统所需的 TypeScript 类型
 */
import { type LinkProps } from '@tanstack/react-router'

/**
 * 用户信息类型
 *
 * 定义侧边栏底部用户导航所需的用户信息
 */
type User = {
     name: string // 用户姓名
     email: string // 用户邮箱
     avatar: string // 用户头像 URL
}

/**
 * 团队信息类型
 *
 * 定义团队切换器中的团队信息
 */
type Team = {
     name: string // 团队名称
     logo: React.ElementType // 团队图标组件
     plan: string // 团队计划类型
}

/**
 * 基础导航项类型
 *
 * 定义所有导航项共有的基本属性
 */
type BaseNavItem = {
     title: string // 导航项标题
     badge?: string // 徽章文本（如未读数量），可选
     icon?: React.ElementType // 导航图标组件，可选
}

/**
 * 普通导航链接类型
 *
 * 定义直接跳转的导航项，没有子菜单
 * - url: 目标路由地址
 * - items: 明确设置为 never，表示没有子项
 */
type NavLink = BaseNavItem & {
     url: LinkProps['to'] | (string & {}) // 目标路由地址
     items?: never // 明确表示没有子项
}

/**
 * 可折叠导航项类型
 *
 * 定义包含子菜单的导航项
 * - items: 子导航项数组
 * - url: 明确设置为 never，表示不直接跳转
 */
type NavCollapsible = BaseNavItem & {
     items: (BaseNavItem & { url: LinkProps['to'] | (string & {}) })[] // 子导航项数组
     url?: never // 明确表示不直接跳转
}

/**
 * 导航项联合类型
 *
 * 导航项可以是普通链接或可折叠菜单
 */
type NavItem = NavCollapsible | NavLink

/**
 * 导航组类型
 *
 * 定义侧边栏中的导航分组
 */
type NavGroup = {
     title: string // 导航组标题
     items: NavItem[] // 导航项数组
}

/**
 * 侧边栏数据类型
 *
 * 定义侧边栏所需的所有数据结构
 */
type SidebarData = {
     user: User // 用户信息
     teams: Team[] // 团队列表
     navGroups: NavGroup[] // 导航组列表
}

// 导出类型供其他组件使用
export type { SidebarData, NavGroup, NavItem, NavCollapsible, NavLink }
