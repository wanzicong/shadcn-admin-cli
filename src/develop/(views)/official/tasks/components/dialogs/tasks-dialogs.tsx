import { showSubmittedData } from '@/develop/(lib)/show-submitted-data.tsx'
import { ConfirmDialog } from '@/components/confirm-dialog.tsx'
import { TasksImportDialog } from './tasks-import-dialog.tsx'
import { TasksMutateDrawer } from '../tasks-mutate-drawer.tsx'
import { useTasks } from '../../context/use-tasks.tsx'

// 任务对话框管理组件 - 统一管理所有任务相关的弹窗对话框
export function TasksDialogs() {
     const { open, setOpen, currentRow, setCurrentRow } = useTasks()
     return (
          <>
               {/* 创建任务对话框 */}
               <TasksMutateDrawer key='task-create' open={open === 'create'} onOpenChange={() => setOpen('create')} />

               {/* 导入任务对话框 */}
               <TasksImportDialog key='tasks-import' open={open === 'import'} onOpenChange={() => setOpen('import')} />

               {/* 条件渲染：编辑和删除对话框 - 只有在选中任务时才渲染 */}
               {currentRow && (
                    <>
                         {/* 编辑任务对话框 */}
                         <TasksMutateDrawer
                              key={`task-update-${currentRow.id}`}
                              open={open === 'update'}
                              onOpenChange={() => {
                                   setOpen('update')
                                   setTimeout(() => {
                                        setCurrentRow(null)
                                   }, 500)
                              }}
                              currentRow={currentRow}
                         />

                         {/* 删除任务确认对话框 */}
                         <ConfirmDialog
                              key='task-delete'
                              destructive
                              open={open === 'delete'}
                              onOpenChange={() => {
                                   setOpen('delete')
                                   setTimeout(() => {
                                        setCurrentRow(null)
                                   }, 500)
                              }}
                              handleConfirm={() => {
                                   setOpen(null)
                                   setTimeout(() => {
                                        setCurrentRow(null)
                                   }, 500)
                                   showSubmittedData(currentRow, 'The following task has been deleted:')
                              }}
                              className='max-w-md'
                              title={`Delete this task: ${currentRow.id} ?`}
                              desc={
                                   <>
                                        You are about to delete a task with ID <strong>{currentRow.id}</strong>. <br />
                                        This action cannot be undone.
                                   </>
                              }
                              confirmText='Delete'
                         />
                    </>
               )}
          </>
     )
}
