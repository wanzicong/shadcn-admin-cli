/**
 * 顶部导航组件
 *
 * 提供响应式的顶部导航菜单，支持：
 * - 桌面端：水平导航链接
 * - 移动端：下拉菜单导航
 * - 活跃状态高亮
 * - 禁用状态支持
 *
 * 特性：
 * - 响应式布局，大屏显示水平导航，小屏显示汉堡菜单
 * - 平滑的颜色过渡动画
 * - 无障碍访问支持
 *
 * @component
 * @param className - 自定义 CSS 类名
 * @param links - 导航链接数组
 * @param links.title - 链接标题
 * @param links.href - 链接地址
 * @param links.isActive - 是否为当前活跃页面
 * @param links.disabled - 是否禁用该链接，可选
 * @param props - 其他 nav 元素属性
 * @returns {JSX.Element} 顶部导航组件
 */
import { Link } from '@tanstack/react-router'
import { cn } from '@/develop/(lib)/utils.ts'
import { Menu } from 'lucide-react'
import { Button } from '@/components/ui/button.tsx'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu.tsx'

type TopNavProps = React.HTMLAttributes<HTMLElement> & {
     links: {
          title: string
          href: string
          isActive: boolean
          disabled?: boolean
     }[]
}

export function TopNav({ className, links, ...props }: TopNavProps) {
     return (
          <>
               {/* 移动端导航：下拉菜单 */}
               <div className='lg:hidden'>
                    <DropdownMenu modal={false}>
                         {/* 哈汉堡菜单按钮 */}
                         <DropdownMenuTrigger asChild>
                              <Button size='icon' variant='outline' className='md:size-7'>
                                   <Menu />
                              </Button>
                         </DropdownMenuTrigger>

                         {/* 移动端导航下拉内容 */}
                         <DropdownMenuContent side='bottom' align='start'>
                              {links.map(({ title, href, isActive, disabled }) => (
                                   <DropdownMenuItem key={`${title}-${href}`} asChild>
                                        <Link
                                             to={href}
                                             className={!isActive ? 'text-muted-foreground' : ''} // 非活跃状态使用灰色
                                             disabled={disabled}
                                        >
                                             {title}
                                        </Link>
                                   </DropdownMenuItem>
                              ))}
                         </DropdownMenuContent>
                    </DropdownMenu>
               </div>

               {/* 桌面端导航：水平链接 */}
               <nav
                    className={cn(
                         'hidden items-center space-x-4 lg:flex lg:space-x-4 xl:space-x-6', // 响应式显示和间距
                         className
                    )}
                    {...props}
               >
                    {links.map(({ title, href, isActive, disabled }) => (
                         <Link
                              key={`${title}-${href}`}
                              to={href}
                              disabled={disabled}
                              className={`hover:text-primary text-sm font-medium transition-colors ${
                                   isActive ? '' : 'text-muted-foreground' // 非活跃状态使用灰色
                              }`}
                         >
                              {title}
                         </Link>
                    ))}
               </nav>
          </>
     )
}
