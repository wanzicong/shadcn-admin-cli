import { ChevronLeftIcon, ChevronRightIcon, DoubleArrowLeftIcon, DoubleArrowRightIcon } from '@radix-ui/react-icons'
import { type Table } from '@tanstack/react-table'
import { cn, getPageNumbers } from '@/develop/(lib)/utils.ts'
import { Button } from '@/components/ui/button.tsx'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.tsx'

/**
 * 表格分页组件的 Props 类型定义
 * @template TData 表格数据的类型
 */
type DataTablePaginationProps<TData> = {
     table: Table<TData>
     className?: string
}

/**
 * 数据表格分页组件
 *
 * 提供完整的分页功能，包括：
 * - 页码导航（首页、上一页、下一页、末页）
 * - 页码按钮显示（当前页及前后页）
 * - 每页数量选择（10、20、30、40、50）
 * - 页面信息显示（当前页/总页数）
 * - 响应式设计（移动端优化）
 *
 * @template TData 表格数据的类型
 * @param props 组件属性
 * @param props.table TanStack Table 实例
 * @param props.className 自定义样式类名
 * @returns 分页组件
 */
export function DataTablePagination<TData>({ table, className }: DataTablePaginationProps<TData>) {
     // 当前页码（从 1 开始，table 内部使用从 0 开始的索引）
     const currentPage = table.getState().pagination.pageIndex + 1
     // 总页数
     const totalPages = table.getPageCount()
     // 计算要显示的页码数组（包含省略号处理）
     const pageNumbers = getPageNumbers(currentPage, totalPages)

     return (
          <div
               className={cn('flex items-center justify-between overflow-clip px-2', '@max-2xl/content:flex-col-reverse @max-2xl/content:gap-4', className)}
               style={{ overflowClipMargin: 1 }}
          >
               {/* 左侧区域：页面信息（移动端）和每页数量选择 */}
               <div className='flex w-full items-center justify-between'>
                    {/* 移动端显示的页面信息（小屏幕时显示，大屏幕隐藏） */}
                    <div className='flex w-[100px] items-center justify-center text-sm font-medium @2xl/content:hidden'>
                         Page {currentPage} of {totalPages}
                    </div>

                    {/* 每页数量选择器 */}
                    <div className='flex items-center gap-2 @max-2xl/content:flex-row-reverse'>
                         <Select
                              value={`${table.getState().pagination.pageSize}`}
                              onValueChange={(value) => {
                                   // 更新每页显示的数量
                                   table.setPageSize(Number(value))
                              }}
                         >
                              <SelectTrigger className='h-8 w-[70px]'>
                                   <SelectValue placeholder={table.getState().pagination.pageSize} />
                              </SelectTrigger>
                              <SelectContent side='top'>
                                   {/* 每页数量选项：10、20、30、40、50 */}
                                   {[10, 20, 30, 40, 50].map((pageSize) => (
                                        <SelectItem key={pageSize} value={`${pageSize}`}>
                                             {pageSize}
                                        </SelectItem>
                                   ))}
                              </SelectContent>
                         </Select>
                         {/* 每页数量标签（移动端隐藏） */}
                         <p className='hidden text-sm font-medium sm:block'>每页行数</p>
                    </div>
               </div>

               {/* 右侧区域：页面信息（桌面端）和页码导航 */}
               <div className='flex items-center sm:space-x-6 lg:space-x-8'>
                    {/* 桌面端显示的页面信息（中等屏幕时显示） */}
                    <div className='flex w-[100px] items-center justify-center text-sm font-medium @max-3xl/content:hidden'>
                         Page {currentPage} of {totalPages}
                    </div>

                    {/* 页码导航按钮组 */}
                    <div className='flex items-center space-x-2'>
                         {/* 首页按钮：跳转到第一页（移动端隐藏） */}
                         <Button
                              variant='outline'
                              className='size-8 p-0 @max-md/content:hidden'
                              onClick={() => table.setPageIndex(0)}
                              disabled={!table.getCanPreviousPage()}
                         >
                              <span className='sr-only'>Go to first page</span>
                              <DoubleArrowLeftIcon className='h-4 w-4' />
                         </Button>

                         {/* 上一页按钮：跳转到上一页 */}
                         <Button variant='outline' className='size-8 p-0' onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>
                              <span className='sr-only'>Go to previous page</span>
                              <ChevronLeftIcon className='h-4 w-4' />
                         </Button>

                         {/* 页码按钮：显示当前页及前后页，使用省略号处理大量页码 */}
                         {pageNumbers.map((pageNumber, index) => (
                              <div key={`${pageNumber}-${index}`} className='flex items-center'>
                                   {pageNumber === '...' ? (
                                        // 省略号显示
                                        <span className='text-muted-foreground px-1 text-sm'>...</span>
                                   ) : (
                                        // 页码按钮：当前页高亮显示
                                        <Button
                                             variant={currentPage === pageNumber ? 'default' : 'outline'}
                                             className='h-8 min-w-8 px-2'
                                             onClick={() => table.setPageIndex((pageNumber as number) - 1)}
                                        >
                                             <span className='sr-only'>Go to page {pageNumber}</span>
                                             {pageNumber}
                                        </Button>
                                   )}
                              </div>
                         ))}

                         {/* 下一页按钮：跳转到下一页 */}
                         <Button variant='outline' className='size-8 p-0' onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
                              <span className='sr-only'>Go to next page</span>
                              <ChevronRightIcon className='h-4 w-4' />
                         </Button>

                         {/* 末页按钮：跳转到最后一页（移动端隐藏） */}
                         <Button
                              variant='outline'
                              className='size-8 p-0 @max-md/content:hidden'
                              onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                              disabled={!table.getCanNextPage()}
                         >
                              <span className='sr-only'>Go to last page</span>
                              <DoubleArrowRightIcon className='h-4 w-4' />
                         </Button>
                    </div>
               </div>
          </div>
     )
}
