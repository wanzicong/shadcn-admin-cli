import { useState, useEffect, useRef } from 'react'
import { type Table } from '@tanstack/react-table'
import { cn } from '@/develop/(lib)/utils.ts'
import { X } from 'lucide-react'
import { Badge } from '@/components/ui/badge.tsx'
import { Button } from '@/components/ui/button.tsx'
import { Separator } from '@/components/ui/separator.tsx'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip.tsx'

/**
 * 批量操作工具栏组件的 Props 类型定义
 * @template TData 表格数据的类型
 */
type DataTableBulkActionsProps<TData> = {
     table: Table<TData>
     entityName: string
     children: React.ReactNode
}

/**
 * 数据表格批量操作工具栏组件
 *
 * 提供批量操作工具栏，当选中多行时显示浮动工具栏，包括：
 * - 选中行数量显示
 * - 浮动工具栏（固定在底部）
 * - 键盘导航支持（方向键、Home、End、Escape）
 * - 无障碍支持（ARIA 标签、屏幕阅读器）
 * - 清除选择功能
 *
 * @template TData 表格数据的类型
 * @param props 组件属性
 * @param props.table TanStack Table 实例
 * @param props.entityName 实体名称（如 "task"、"user"），用于显示选中信息
 * @param props.children 要渲染在工具栏内的操作按钮
 * @returns 批量操作工具栏组件，如果没有选中行则返回 null
 */
export function DataTableBulkActions<TData>({ table, entityName, children }: DataTableBulkActionsProps<TData>): React.ReactNode | null {
     // 获取过滤后的选中行（只计算当前可见的选中行）
     const selectedRows = table.getFilteredSelectedRowModel().rows
     // 选中行的数量
     const selectedCount = selectedRows.length
     // 工具栏 DOM 引用，用于键盘导航
     const toolbarRef = useRef<HTMLDivElement>(null)
     // 屏幕阅读器公告文本
     const [announcement, setAnnouncement] = useState('')

     // 当选中数量变化时，向屏幕阅读器公告选中信息
     useEffect(() => {
          if (selectedCount > 0) {
               // 生成公告消息（处理单复数）
               const message = `${selectedCount} ${entityName}${selectedCount > 1 ? 's' : ''} selected. Bulk actions toolbar is available.`

               // 使用 queueMicrotask 延迟状态更新，避免级联渲染
               queueMicrotask(() => {
                    setAnnouncement(message)
               })

               // 3 秒后清除公告
               const timer = setTimeout(() => setAnnouncement(''), 3000)
               return () => clearTimeout(timer)
          }
     }, [selectedCount, entityName])

     /**
      * 清除所有选中行
      */
     const handleClearSelection = () => {
          table.resetRowSelection()
     }

     /**
      * 处理键盘导航事件
      * 支持方向键、Home、End、Escape 键
      */
     const handleKeyDown = (event: React.KeyboardEvent) => {
          // 获取工具栏中的所有按钮
          const buttons = toolbarRef.current?.querySelectorAll('button')
          if (!buttons) return

          // 找到当前聚焦的按钮索引
          const currentIndex = Array.from(buttons).findIndex((button) => button === document.activeElement)

          switch (event.key) {
               case 'ArrowRight': {
                    // 右箭头：聚焦下一个按钮（循环）
                    event.preventDefault()
                    const nextIndex = (currentIndex + 1) % buttons.length
                    buttons[nextIndex]?.focus()
                    break
               }
               case 'ArrowLeft': {
                    // 左箭头：聚焦上一个按钮（循环）
                    event.preventDefault()
                    const prevIndex = currentIndex === 0 ? buttons.length - 1 : currentIndex - 1
                    buttons[prevIndex]?.focus()
                    break
               }
               case 'Home':
                    // Home 键：聚焦第一个按钮
                    event.preventDefault()
                    buttons[0]?.focus()
                    break
               case 'End':
                    // End 键：聚焦最后一个按钮
                    event.preventDefault()
                    buttons[buttons.length - 1]?.focus()
                    break
               case 'Escape': {
                    // Escape 键：清除选中（除非焦点在下拉菜单中）
                    // 检查 Escape 键是否来自下拉菜单触发器或内容
                    // 因为 Radix UI 会在我们的处理器运行之前关闭下拉菜单，所以无法检查下拉菜单状态
                    const target = event.target as HTMLElement
                    const activeElement = document.activeElement as HTMLElement

                    // 检查事件目标或当前聚焦的元素是否是下拉菜单触发器
                    const isFromDropdownTrigger =
                         target?.getAttribute('data-slot') === 'dropdown-menu-trigger' ||
                         activeElement?.getAttribute('data-slot') === 'dropdown-menu-trigger' ||
                         target?.closest('[data-slot="dropdown-menu-trigger"]') ||
                         activeElement?.closest('[data-slot="dropdown-menu-trigger"]')

                    // 检查聚焦的元素是否在下拉菜单内容中（下拉菜单内容是通过 portal 渲染的）
                    const isFromDropdownContent =
                         activeElement?.closest('[data-slot="dropdown-menu-content"]') || target?.closest('[data-slot="dropdown-menu-content"]')

                    if (isFromDropdownTrigger || isFromDropdownContent) {
                         // Escape 键是用于下拉菜单的，不清除选中
                         return
                    }

                    // Escape 键是用于工具栏的，清除选中
                    event.preventDefault()
                    handleClearSelection()
                    break
               }
          }
     }

     // 如果没有选中行，不渲染组件
     if (selectedCount === 0) {
          return null
     }

     return (
          <>
               {/* 屏幕阅读器公告区域：用于无障碍访问 */}
               <div aria-live='polite' aria-atomic='true' className='sr-only' role='status'>
                    {announcement}
               </div>

               {/* 工具栏容器：固定在底部中央，支持键盘导航 */}
               <div
                    ref={toolbarRef}
                    role='toolbar'
                    aria-label={`Bulk actions for ${selectedCount} selected ${entityName}${selectedCount > 1 ? 's' : ''}`}
                    aria-describedby='bulk-actions-description'
                    tabIndex={-1}
                    onKeyDown={handleKeyDown}
                    className={cn(
                         'fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-xl',
                         'transition-all delay-100 duration-300 ease-out hover:scale-105',
                         'focus-visible:ring-ring/50 focus-visible:ring-2 focus-visible:outline-none'
                    )}
               >
                    {/* 工具栏内容：包含清除按钮、选中信息和使用者提供的操作按钮 */}
                    <div
                         className={cn(
                              'p-2 shadow-xl',
                              'rounded-xl border',
                              'bg-background/95 supports-[backdrop-filter]:bg-background/60 backdrop-blur-lg',
                              'flex items-center gap-x-2'
                         )}
                    >
                         {/* 清除选中按钮：带提示工具 */}
                         <Tooltip>
                              <TooltipTrigger asChild>
                                   <Button
                                        variant='outline'
                                        size='icon'
                                        onClick={handleClearSelection}
                                        className='size-6 rounded-full'
                                        aria-label='Clear selection'
                                        title='Clear selection (Escape)'
                                   >
                                        <X />
                                        <span className='sr-only'>Clear selection</span>
                                   </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                   <p>Clear selection (Escape)</p>
                              </TooltipContent>
                         </Tooltip>

                         {/* 分隔符 */}
                         <Separator className='h-5' orientation='vertical' aria-hidden='true' />

                         {/* 选中信息显示：显示选中数量和实体名称 */}
                         <div className='flex items-center gap-x-1 text-sm' id='bulk-actions-description'>
                              <Badge variant='default' className='min-w-8 rounded-lg' aria-label={`${selectedCount} selected`}>
                                   {selectedCount}
                              </Badge>{' '}
                              {/* 移动端隐藏实体名称 */}
                              <span className='hidden sm:inline'>
                                   {entityName}
                                   {selectedCount > 1 ? 's' : ''}
                              </span>{' '}
                              selected
                         </div>

                         {/* 分隔符 */}
                         <Separator className='h-5' orientation='vertical' aria-hidden='true' />

                         {/* 使用者提供的操作按钮 */}
                         {children}
                    </div>
               </div>
          </>
     )
}
