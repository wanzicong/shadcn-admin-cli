import { type ColumnDef } from '@tanstack/react-table'
import { DataTableColumnHeader } from '@/develop/(components)/data-table'
import { cn } from '@/develop/(lib)/utils.ts'
import { Badge } from '@/components/ui/badge.tsx'
import { Checkbox } from '@/components/ui/checkbox.tsx'
import { LongText } from '@/components/long-text.tsx'
import { callTypes, roles } from '../data/data.ts'
import { type User } from '../data/schema.ts'
import { DataTableRowActions } from './data-table-row-actions.tsx'

// 用户表格列定义
export const usersColumns: ColumnDef<User>[] = [
     // 选择列：用于批量选择用户行
     {
          id: 'select',
          // 全选复选框
          header: ({ table }) => (
               <Checkbox
                    checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && 'indeterminate')}
                    onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                    aria-label='Select all'
                    className='translate-y-[2px]'
               />
          ),
          // 单行选择复选框
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
          meta: {
               className: cn('max-md:sticky start-0 z-10 rounded-tl-[inherit]'),
          },
     },
     // 用户名列：显示用户登录名
     {
          accessorKey: 'username',
          header: ({ column }) => <DataTableColumnHeader column={column} title='Username' />,
          cell: ({ row }) => <LongText className='max-w-36 ps-3'>{row.getValue('username')}</LongText>,
          meta: {
               className: cn(
                    'drop-shadow-[0_1px_2px_rgb(0_0_0_/_0.1)] dark:drop-shadow-[0_1px_2px_rgb(255_255_255_/_0.1)]',
                    'ps-0.5 max-md:sticky start-6 @4xl/content:table-cell @4xl/content:drop-shadow-none'
               ),
          },
          enableHiding: false,
     },
     // 全名列：组合显示用户的名字和姓氏
     {
          id: 'fullName',
          header: ({ column }) => <DataTableColumnHeader column={column} title='Name' />,
          cell: ({ row }) => {
               const { firstName, lastName } = row.original
               const fullName = `${firstName} ${lastName}`
               return <LongText className='max-w-36'>{fullName}</LongText>
          },
          meta: { className: 'w-36' },
     },
     // 邮箱列：显示用户邮箱地址
     {
          accessorKey: 'email',
          header: ({ column }) => <DataTableColumnHeader column={column} title='Email' />,
          cell: ({ row }) => <div className='w-fit ps-2 text-nowrap'>{row.getValue('email')}</div>,
     },
     // 电话号码列：显示用户联系方式
     {
          accessorKey: 'phoneNumber',
          header: ({ column }) => <DataTableColumnHeader column={column} title='Phone Number' />,
          cell: ({ row }) => <div>{row.getValue('phoneNumber')}</div>,
          enableSorting: false,
     },
     // 状态列：显示用户当前状态，使用不同颜色的徽章
     {
          accessorKey: 'status',
          header: ({ column }) => <DataTableColumnHeader column={column} title='Status' />,
          cell: ({ row }) => {
               const { status } = row.original
               const badgeColor = callTypes.get(status)
               return (
                    <div className='flex space-x-2'>
                         <Badge variant='outline' className={cn('capitalize', badgeColor)}>
                              {row.getValue('status')}
                         </Badge>
                    </div>
               )
          },
          filterFn: (row, id, value) => {
               return value.includes(row.getValue(id))
          },
          enableHiding: false,
          enableSorting: false,
     },
     // 角色列：显示用户权限角色，包含图标
     {
          accessorKey: 'role',
          header: ({ column }) => <DataTableColumnHeader column={column} title='Role' />,
          cell: ({ row }) => {
               const { role } = row.original
               const userType = roles.find(({ value }) => value === role)

               if (!userType) {
                    return null
               }

               return (
                    <div className='flex items-center gap-x-2'>
                         {userType.icon && <userType.icon size={16} className='text-muted-foreground' />}
                         <span className='text-sm capitalize'>{row.getValue('role')}</span>
                    </div>
               )
          },
          filterFn: (row, id, value) => {
               return value.includes(row.getValue(id))
          },
          enableSorting: false,
          enableHiding: false,
     },
     // 操作列：显示每行可执行的操作
     {
          id: 'actions',
          cell: DataTableRowActions,
     },
]
