import { MailPlus, UserPlus } from 'lucide-react'
import { Button } from '@/components/ui/button.tsx'
import { useUsers } from './users-provider.tsx'

/**
 * 用户管理主要操作按钮组件
 * 提供邀请用户和添加用户的快捷操作入口
 * 通常放置在页面顶部的操作区域
 */
export function UsersPrimaryButtons() {
     // 从用户状态上下文中获取打开对话框的方法
     const { setOpen } = useUsers()

     return (
          <div className='flex gap-2'>
               {/* 邀请用户按钮 - 用于向外部用户发送系统邀请 */}
               <Button
                    variant='outline' // 使用轮廓样式，与主要操作按钮形成视觉层次
                    className='space-x-1' // 图标和文字之间的间距
                    onClick={() => setOpen('invite')} // 打开邀请对话框
               >
                    <span>Invite User</span>
                    <MailPlus size={18} /> {/* 邮件加号图标，表示邀请功能 */}
               </Button>

               {/* 添加用户按钮 - 用于直接在系统中创建新用户 */}
               <Button
                    className='space-x-1' // 图标和文字之间的间距
                    onClick={() => setOpen('add')} // 打开添加用户对话框
               >
                    <span>Add User</span>
                    <UserPlus size={18} /> {/* 用户加号图标，表示添加功能 */}
               </Button>
          </div>
     )
}
