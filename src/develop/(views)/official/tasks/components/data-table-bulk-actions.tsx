import { useState } from 'react'
import { type Table } from '@tanstack/react-table'
import { DataTableBulkActions as BulkActionsToolbar } from '@/develop/(components)/data-table'
import { sleep } from '@/develop/(lib)/utils.ts'
import { Trash2, CircleArrowUp, ArrowUpDown, Download } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button.tsx'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu.tsx'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip.tsx'
import { priorities, statuses } from '../data/data.tsx'
import { type Task } from '../data/schema.ts'
import { TasksMultiDeleteDialog } from './tasks-multi-delete-dialog.tsx'

type DataTableBulkActionsProps<TData> = {
     table: Table<TData>
}

// 批量操作工具栏组件 - 提供多选任务时的批量操作功能
export function DataTableBulkActions<TData>({ table }: DataTableBulkActionsProps<TData>) {
     // 删除确认对话框状态
     const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

     // 获取当前选中的行数据
     const selectedRows = table.getFilteredSelectedRowModel().rows

     // 批量更新任务状态处理函数
     const handleBulkStatusChange = (status: string) => {
          const selectedTasks = selectedRows.map((row) => row.original as Task)
          toast.promise(sleep(2000), {
               loading: 'Updating status...',
               success: () => {
                    table.resetRowSelection()
                    return `Status updated to "${status}" for ${selectedTasks.length} task${selectedTasks.length > 1 ? 's' : ''}.`
               },
               error: 'Error',
          })
          table.resetRowSelection()
     }

     // 批量更新任务优先级处理函数
     const handleBulkPriorityChange = (priority: string) => {
          const selectedTasks = selectedRows.map((row) => row.original as Task)
          toast.promise(sleep(2000), {
               loading: 'Updating priority...',
               success: () => {
                    table.resetRowSelection()
                    return `Priority updated to "${priority}" for ${selectedTasks.length} task${selectedTasks.length > 1 ? 's' : ''}.`
               },
               error: 'Error',
          })
          table.resetRowSelection()
     }

     // 批量导出任务处理函数
     const handleBulkExport = () => {
          const selectedTasks = selectedRows.map((row) => row.original as Task)
          toast.promise(sleep(2000), {
               loading: 'Exporting tasks...',
               success: () => {
                    table.resetRowSelection()
                    return `Exported ${selectedTasks.length} task${selectedTasks.length > 1 ? 's' : ''} to CSV.`
               },
               error: 'Error',
          })
          table.resetRowSelection()
     }

     return (
          <>
               <BulkActionsToolbar table={table} entityName='task'>
                    {/* 更新状态下拉菜单 */}
                    <DropdownMenu>
                         <Tooltip>
                              <TooltipTrigger asChild>
                                   <DropdownMenuTrigger asChild>
                                        <Button variant='outline' size='icon' className='size-8' aria-label='Update status' title='Update status'>
                                             <CircleArrowUp />
                                             <span className='sr-only'>Update status</span>
                                        </Button>
                                   </DropdownMenuTrigger>
                              </TooltipTrigger>
                              <TooltipContent>
                                   <p>Update status</p>
                              </TooltipContent>
                         </Tooltip>
                         <DropdownMenuContent sideOffset={14}>
                              {statuses.map((status) => (
                                   <DropdownMenuItem key={status.value} defaultValue={status.value} onClick={() => handleBulkStatusChange(status.value)}>
                                        {status.icon && <status.icon className='text-muted-foreground size-4' />}
                                        {status.label}
                                   </DropdownMenuItem>
                              ))}
                         </DropdownMenuContent>
                    </DropdownMenu>

                    {/* 更新优先级下拉菜单 */}
                    <DropdownMenu>
                         <Tooltip>
                              <TooltipTrigger asChild>
                                   <DropdownMenuTrigger asChild>
                                        <Button variant='outline' size='icon' className='size-8' aria-label='Update priority' title='Update priority'>
                                             <ArrowUpDown />
                                             <span className='sr-only'>Update priority</span>
                                        </Button>
                                   </DropdownMenuTrigger>
                              </TooltipTrigger>
                              <TooltipContent>
                                   <p>Update priority</p>
                              </TooltipContent>
                         </Tooltip>
                         <DropdownMenuContent sideOffset={14}>
                              {priorities.map((priority) => (
                                   <DropdownMenuItem
                                        key={priority.value}
                                        defaultValue={priority.value}
                                        onClick={() => handleBulkPriorityChange(priority.value)}
                                   >
                                        {priority.icon && <priority.icon className='text-muted-foreground size-4' />}
                                        {priority.label}
                                   </DropdownMenuItem>
                              ))}
                         </DropdownMenuContent>
                    </DropdownMenu>

                    {/* 导出任务按钮 */}
                    <Tooltip>
                         <TooltipTrigger asChild>
                              <Button
                                   variant='outline'
                                   size='icon'
                                   onClick={() => handleBulkExport()}
                                   className='size-8'
                                   aria-label='Export tasks'
                                   title='Export tasks'
                              >
                                   <Download />
                                   <span className='sr-only'>Export tasks</span>
                              </Button>
                         </TooltipTrigger>
                         <TooltipContent>
                              <p>Export tasks</p>
                         </TooltipContent>
                    </Tooltip>

                    {/* 删除选中任务按钮 */}
                    <Tooltip>
                         <TooltipTrigger asChild>
                              <Button
                                   variant='destructive'
                                   size='icon'
                                   onClick={() => setShowDeleteConfirm(true)}
                                   className='size-8'
                                   aria-label='Delete selected tasks'
                                   title='Delete selected tasks'
                              >
                                   <Trash2 />
                                   <span className='sr-only'>Delete selected tasks</span>
                              </Button>
                         </TooltipTrigger>
                         <TooltipContent>
                              <p>Delete selected tasks</p>
                         </TooltipContent>
                    </Tooltip>
               </BulkActionsToolbar>

               {/* 批量删除确认对话框 */}
               <TasksMultiDeleteDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm} table={table} />
          </>
     )
}
