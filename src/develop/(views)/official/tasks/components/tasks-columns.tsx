import { type ColumnDef } from '@tanstack/react-table'
import { DataTableColumnHeader } from '@/develop/(components)/data-table'
import { Badge } from '@/components/ui/badge.tsx'
import { Checkbox } from '@/components/ui/checkbox.tsx'
import { labels, priorities, statuses } from '../data/data.tsx'
import { type Task } from '../data/schema.ts'
import { DataTableRowActions } from './data-table-row-actions.tsx'

// 任务表格列定义
export const tasksColumns: ColumnDef<Task>[] = [
     // 行选择列 - 提供单行和全选功能
     {
          id: 'select',
          // 全选复选框 - 支持全选/部分选中状态切换
          header: ({ table }) => (
               <Checkbox
                    checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && 'indeterminate')}
                    onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                    aria-label='Select all'
                    className='translate-y-[2px]'
               />
          ),
          // 单行选择复选框 - 控制单行选中状态
          cell: ({ row }) => (
               <Checkbox
                    checked={row.getIsSelected()}
                    onCheckedChange={(value) => row.toggleSelected(!!value)}
                    aria-label='Select row'
                    className='translate-y-[2px]'
               />
          ),
          enableSorting: false,
          enableHiding: false,
     },
     // 任务ID列 - 固定宽度显示任务编号
     {
          accessorKey: 'id',
          header: ({ column }) => <DataTableColumnHeader column={column} title='Task' />,
          cell: ({ row }) => <div className='w-[80px]'>{row.getValue('id')}</div>,
          enableSorting: false,
          enableHiding: false,
     },
     // 任务标题列 - 显示任务标题和标签，支持响应式宽度
     {
          accessorKey: 'title',
          header: ({ column }) => <DataTableColumnHeader column={column} title='Title' />,
          meta: { className: 'ps-1', tdClassName: 'ps-4' },
          cell: ({ row }) => {
               // 查找对应的任务标签
               const label = labels.find((label) => label.value === row.original.label)

               // 标题和标签组合显示
               return (
                    <div className='flex space-x-2'>
                         {/* 任务标签徽章 */}
                         {label && <Badge variant='outline'>{label.label}</Badge>}
                         {/* 任务标题 - 响应式宽度，自动截断 */}
                         <span className='max-w-32 truncate font-medium sm:max-w-72 md:max-w-[31rem]'>{row.getValue('title')}</span>
                    </div>
               )
          },
     },
     // 任务状态列 - 图标+文字显示任务状态
     {
          accessorKey: 'status',
          header: ({ column }) => <DataTableColumnHeader column={column} title='Status' />,
          meta: { className: 'ps-1', tdClassName: 'ps-4' },
          cell: ({ row }) => {
               // 查找对应的任务状态
               const status = statuses.find((status) => status.value === row.getValue('status'))

               if (!status) {
                    return null
               }

               // 图标和状态文本组合显示
               return (
                    <div className='flex w-[100px] items-center gap-2'>
                         {status.icon && <status.icon className='text-muted-foreground size-4' />}
                         <span>{status.label}</span>
                    </div>
               )
          },
          // 状态过滤函数 - 支持多选过滤
          filterFn: (row, id, value) => {
               return value.includes(row.getValue(id))
          },
     },
     // 任务优先级列 - 图标+文字显示优先级
     {
          accessorKey: 'priority',
          header: ({ column }) => <DataTableColumnHeader column={column} title='Priority' />,
          meta: { className: 'ps-1', tdClassName: 'ps-3' },
          cell: ({ row }) => {
               // 查找对应的任务优先级
               const priority = priorities.find((priority) => priority.value === row.getValue('priority'))

               if (!priority) {
                    return null
               }

               // 图标和优先级文本组合显示
               return (
                    <div className='flex items-center gap-2'>
                         {priority.icon && <priority.icon className='text-muted-foreground size-4' />}
                         <span>{priority.label}</span>
                    </div>
               )
          },
          // 优先级过滤函数 - 支持多选过滤
          filterFn: (row, id, value) => {
               return value.includes(row.getValue(id))
          },
     },
     // 操作列 - 提供行级操作菜单
     {
          id: 'actions',
          cell: ({ row }) => <DataTableRowActions row={row} />,
     },
]
