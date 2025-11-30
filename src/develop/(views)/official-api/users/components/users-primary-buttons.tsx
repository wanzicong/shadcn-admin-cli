import { MailPlus, UserPlus } from 'lucide-react'
import { Button } from '@/components/ui/button.tsx'
import { useUsers } from '../context/use-users.tsx'

// 用户管理主要操作按钮组件 - 提供邀请用户和添加用户的快捷操作入口
export function UsersPrimaryButtons() {
     // 从用户状态上下文中获取打开对话框的方法
     const { setOpen } = useUsers()

     return (
          <div className='flex gap-2'>
               {/* 邀请用户按钮 */}
               <Button variant='outline' className='space-x-1' onClick={() => setOpen('invite')}>
                    <span>Invite User</span>
                    <MailPlus size={18} />
               </Button>

               {/* 添加用户按钮 */}
               <Button className='space-x-1' onClick={() => setOpen('add')}>
                    <span>Add User</span>
                    <UserPlus size={18} />
               </Button>
          </div>
     )
}
