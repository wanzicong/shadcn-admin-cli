/**
 * 页面头部组件
 *
 * 提供页面顶部的头部导航区域，包含：
 * - 侧边栏切换按钮
 * - 分隔线
 * - 自定义内容区域
 *
 * 特性：
 * - 支持固定模式，滚动时显示阴影和背景模糊效果
 * - 响应式设计，移动端按钮放大
 * - 监听滚动位置，动态更新样式
 *
 * @component
 * @param className - 自定义 CSS 类名
 * @param fixed - 是否启用固定模式，默认 false
 * @param children - 子组件内容
 * @param props - 其他 header 元素属性
 * @returns {JSX.Element} 头部组件
 */
import { useEffect, useState } from 'react'
import { cn } from '@/develop/(lib)/utils.ts'
import { Separator } from '@/components/ui/separator.tsx'
import { SidebarTrigger } from '@/components/ui/sidebar.tsx'

type HeaderProps = React.HTMLAttributes<HTMLElement> & {
     fixed?: boolean
     ref?: React.Ref<HTMLElement>
}

export function Header({ className, fixed, children, ...props }: HeaderProps) {
     // 状态：记录页面滚动偏移量
     const [offset, setOffset] = useState(0)

     useEffect(() => {
          // 滚动事件处理函数：更新页面滚动偏移量
          const onScroll = () => {
               // 兼容不同浏览器的滚动位置获取方式
               setOffset(document.body.scrollTop || document.documentElement.scrollTop)
          }

          // 添加滚动监听器，使用被动监听提高性能
          document.addEventListener('scroll', onScroll, { passive: true })

          // 组件卸载时清理事件监听器，防止内存泄漏
          return () => document.removeEventListener('scroll', onScroll)
     }, [])

     return (
          <header
               className={cn(
                    'z-50 h-16', // 基础样式：高层级和固定高度
                    fixed && 'header-fixed peer/header sticky top-0 w-[inherit]', // 固定模式：粘性定位
                    offset > 10 && fixed ? 'shadow' : 'shadow-none', // 滚动超过10px时显示阴影
                    className
               )}
               {...props}
          >
               <div
                    className={cn(
                         'relative flex h-full items-center gap-3 p-4 sm:gap-4', // 内容布局样式
                         // 固定模式下滚动时添加背景模糊效果
                         offset > 10 && fixed && 'after:bg-background/20 after:absolute after:inset-0 after:-z-10 after:backdrop-blur-lg'
                    )}
               >
                    {/* 侧边栏切换按钮 */}
                    <SidebarTrigger variant='outline' className='max-md:scale-125' />

                    {/* 垂直分隔线 */}
                    <Separator orientation='vertical' className='h-6' />

                    {/* 自定义内容区域 */}
                    {children}
               </div>
          </header>
     )
}
