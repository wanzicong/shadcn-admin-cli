import { UsersActionDialog } from './users-action-dialog.tsx'
import { UsersDeleteDialog } from './users-delete-dialog.tsx'
import { UsersInviteDialog } from './users-invite-dialog.tsx'
import { useUsers } from './users-provider.tsx'

/**
 * 用户管理对话框容器组件
 * 管理所有用户相关的对话框状态和渲染逻辑
 * 包括：添加用户、邀请用户、编辑用户、删除用户等对话框
 */
export function UsersDialogs() {
     // 从用户状态上下文获取共享状态和方法
     const { open, setOpen, currentRow, setCurrentRow } = useUsers()

     return (
          <>
               {/* 添加用户对话框 - 独立存在，不需要当前用户数据 */}
               <UsersActionDialog
                    key='user-add'
                    open={open === 'add'}
                    onOpenChange={() => setOpen('add')}
               />

               {/* 邀请用户对话框 - 独立存在，不需要当前用户数据 */}
               <UsersInviteDialog
                    key='user-invite'
                    open={open === 'invite'}
                    onOpenChange={() => setOpen('invite')}
               />

               {/* 编辑和删除对话框 - 只有在选中用户时才显示 */}
               {currentRow && (
                    <>
                         {/* 编辑用户对话框 - 需要当前用户数据 */}
                         <UsersActionDialog
                              key={`user-edit-${currentRow.id}`}
                              open={open === 'edit'}
                              onOpenChange={() => {
                                   // 关闭编辑对话框
                                   setOpen('edit')
                                   // 延迟清空当前选中用户，避免动画问题
                                   setTimeout(() => {
                                        setCurrentRow(null)
                                   }, 500)
                              }}
                              currentRow={currentRow}
                         />

                         {/* 删除用户对话框 - 需要当前用户数据 */}
                         <UsersDeleteDialog
                              key={`user-delete-${currentRow.id}`}
                              open={open === 'delete'}
                              onOpenChange={() => {
                                   // 关闭删除对话框
                                   setOpen('delete')
                                   // 延迟清空当前选中用户，避免动画问题
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
