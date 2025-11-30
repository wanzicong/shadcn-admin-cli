import { useUsers } from '../../context/use-users.tsx'
import { UsersActionDialog } from './users-action-dialog.tsx'
import { UsersDeleteDialog } from './users-delete-dialog.tsx'
import { UsersInviteDialog } from './users-invite-dialog.tsx'

// 用户管理对话框容器组件 - 管理所有用户相关的对话框状态和渲染逻辑
export function UsersDialogs() {
     // 从用户状态上下文获取共享状态和方法
     const { open, setOpen, currentRow, setCurrentRow } = useUsers()

     return (
          <>
               {/* 添加用户对话框 */}
               <UsersActionDialog key='user-add' open={open === 'add'} onOpenChange={() => setOpen('add')} />

               {/* 邀请用户对话框 */}
               <UsersInviteDialog key='user-invite' open={open === 'invite'} onOpenChange={() => setOpen('invite')} />

               {/* 编辑和删除对话框 - 只有在选中用户时才显示 */}
               {currentRow && (
                    <>
                         {/* 编辑用户对话框 */}
                         <UsersActionDialog
                              key={`user-edit-${currentRow.id}`}
                              open={open === 'edit'}
                              onOpenChange={() => {
                                   setOpen('edit')
                                   setTimeout(() => {
                                        setCurrentRow(null)
                                   }, 500)
                              }}
                              currentRow={currentRow}
                         />

                         {/* 删除用户对话框 */}
                         <UsersDeleteDialog
                              key={`user-delete-${currentRow.id}`}
                              open={open === 'delete'}
                              onOpenChange={() => {
                                   setOpen('delete')
                                   setTimeout(() => {
                                        setCurrentRow(null)
                                   }, 500)
                              }}
                              currentRow={currentRow}
                         />
                    </>
               )}
          </>
     )
}
