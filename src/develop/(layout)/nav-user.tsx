/**
 * 用户导航组件
 *
 * 显示在侧边栏底部的用户信息菜单，包含：
 * - 用户头像、姓名和邮箱
 * - 升级到专业版选项
 * - 用户设置相关链接
 * - 退出登录功能
 *
 * 特性：
 * - 响应式设计，移动端和桌面端有不同的弹出方向
 * - 退出登录确认对话框
 * - 用户信息展示和快捷操作入口
 *
 * @component
 * @param user - 用户信息对象
 * @param user.name - 用户姓名
 * @param user.email - 用户邮箱
 * @param user.avatar - 用户头像URL
 * @returns {JSX.Element} 用户导航组件
 */
import { Link } from '@tanstack/react-router'
import useDialogState from '@/develop/(hooks)/use-dialog-state.tsx'
import { BadgeCheck, Bell, ChevronsUpDown, CreditCard, LogOut, Sparkles } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar.tsx'
import {
     DropdownMenu,
     DropdownMenuContent,
     DropdownMenuGroup,
     DropdownMenuItem,
     DropdownMenuLabel,
     DropdownMenuSeparator,
     DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu.tsx'
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from '@/components/ui/sidebar.tsx'
import { SignOutDialog } from '@/components/sign-out-dialog.tsx'

type NavUserProps = {
     user: {
          name: string
          email: string
          avatar: string
     }
}

export function NavUser({ user }: NavUserProps) {
     // 获取侧边栏移动端状态
     const { isMobile } = useSidebar()
     // 获取退出登录对话框状态
     const [open, setOpen] = useDialogState()

     return (
          <>
               {/* 用户信息侧边栏菜单 */}
               <SidebarMenu>
                    <SidebarMenuItem>
                         <DropdownMenu>
                              {/* 用户信息下拉菜单触发器 */}
                              <DropdownMenuTrigger asChild>
                                   <SidebarMenuButton
                                        size='lg'
                                        className='data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground'
                                   >
                                        {/* 用户头像 */}
                                        <Avatar className='h-8 w-8 rounded-lg'>
                                             <AvatarImage src={user.avatar} alt={user.name} />
                                             <AvatarFallback className='rounded-lg'>SN</AvatarFallback>
                                        </Avatar>

                                        {/* 用户信息：姓名和邮箱 */}
                                        <div className='grid flex-1 text-start text-sm leading-tight'>
                                             <span className='truncate font-semibold'>{user.name}</span>
                                             <span className='truncate text-xs'>{user.email}</span>
                                        </div>

                                        {/* 下拉指示箭头 */}
                                        <ChevronsUpDown className='ms-auto size-4' />
                                   </SidebarMenuButton>
                              </DropdownMenuTrigger>

                              {/* 用户操作下拉菜单内容 */}
                              <DropdownMenuContent
                                   className='w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg'
                                   side={isMobile ? 'bottom' : 'right'} // 移动端向下，桌面端向右
                                   align='end'
                                   sideOffset={4}
                              >
                                   {/* 用户信息展示区 */}
                                   <DropdownMenuLabel className='p-0 font-normal'>
                                        <div className='flex items-center gap-2 px-1 py-1.5 text-start text-sm'>
                                             <Avatar className='h-8 w-8 rounded-lg'>
                                                  <AvatarImage src={user.avatar} alt={user.name} />
                                                  <AvatarFallback className='rounded-lg'>SN</AvatarFallback>
                                             </Avatar>
                                             <div className='grid flex-1 text-start text-sm leading-tight'>
                                                  <span className='truncate font-semibold'>{user.name}</span>
                                                  <span className='truncate text-xs'>{user.email}</span>
                                             </div>
                                        </div>
                                   </DropdownMenuLabel>

                                   {/* 分隔线 */}
                                   <DropdownMenuSeparator />

                                   {/* 升级选项组 */}
                                   <DropdownMenuGroup>
                                        <DropdownMenuItem>
                                             <Sparkles />
                                             Upgrade to Pro
                                        </DropdownMenuItem>
                                   </DropdownMenuGroup>

                                   {/* 分隔线 */}
                                   <DropdownMenuSeparator />

                                   {/* 账户相关操作组 */}
                                   <DropdownMenuGroup>
                                        {/* 账户设置 */}
                                        <DropdownMenuItem asChild>
                                             <Link to='/official/settings/account'>
                                                  <BadgeCheck />
                                                  Account
                                             </Link>
                                        </DropdownMenuItem>

                                        {/* 账单管理 */}
                                        <DropdownMenuItem asChild>
                                             <Link to='/official/settings'>
                                                  <CreditCard />
                                                  Billing
                                             </Link>
                                        </DropdownMenuItem>

                                        {/* 通知设置 */}
                                        <DropdownMenuItem asChild>
                                             <Link to='/official/settings/notifications'>
                                                  <Bell />
                                                  Notifications
                                             </Link>
                                        </DropdownMenuItem>
                                   </DropdownMenuGroup>

                                   {/* 分隔线 */}
                                   <DropdownMenuSeparator />

                                   {/* 退出登录（危险操作） */}
                                   <DropdownMenuItem variant='destructive' onClick={() => setOpen(true)}>
                                        <LogOut />
                                        Sign out
                                   </DropdownMenuItem>
                              </DropdownMenuContent>
                         </DropdownMenu>
                    </SidebarMenuItem>
               </SidebarMenu>

               {/* 退出登录确认对话框 */}
               <SignOutDialog open={!!open} onOpenChange={setOpen} />
          </>
     )
}
