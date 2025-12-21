import { useState, useEffect, useCallback } from 'react'
import { Cross2Icon, MagnifyingGlassIcon } from '@radix-ui/react-icons'
import { type Table } from '@tanstack/react-table'
import { Button } from '@/components/ui/button.tsx'
import { Input } from '@/components/ui/input.tsx'
import { DataTableFacetedFilter } from './faceted-filter-server'
import { DataTableViewOptions } from './view-options.tsx'

type DataTableToolbarProps<TData> = {
     table: Table<TData>
     searchPlaceholder?: string
     searchKey?: string
     filters?: {
          columnId: string
          title: string
          options: {
               label: string
               value: string
               icon?: React.ComponentType<{ className?: string }>
          }[]
     }[]
     // 搜索模式
     searchMode?: 'instant' | 'manual'
     // 统一筛选触发模式
     filterMode?: 'instant' | 'manual'
     // 统一应用筛选回调
     onApplyFilters?: (filters: Record<string, string | string[]>) => void
}

export function DataTableToolbar<TData>({
     table,
     searchPlaceholder = '请输入搜索内容...',
     searchKey,
     filters = [],
     searchMode = 'manual', // 搜索默认手动
     filterMode = 'manual', // 筛选默认手动
     onApplyFilters,
}: DataTableToolbarProps<TData>) {
     // 搜索输入状态
     const [searchInput, setSearchInput] = useState('')
     // 筛选器状态
     const [filterStates, setFilterStates] = useState<Record<string, Set<string>>>({})
     // 加载状态
     const [isApplying, setIsApplying] = useState(false)

     // 初始化状态
     useEffect(() => {
          // 初始化搜索输入
          if (searchKey) {
               const currentValue = (table.getColumn(searchKey)?.getFilterValue() as string) ?? ''
               setSearchInput(currentValue)
          } else {
               const currentValue = table.getState().globalFilter ?? ''
               setSearchInput(currentValue)
          }

          // 初始化筛选器状态
          const initialFilterStates: Record<string, Set<string>> = {}
          filters.forEach((filter) => {
               const column = table.getColumn(filter.columnId)
               if (column) {
                    const currentValues = column.getFilterValue() as string[] | undefined
                    initialFilterStates[filter.columnId] = new Set(currentValues || [])
               }
          })
          setFilterStates(initialFilterStates)
     }, [table, searchKey, filters])

     // 应用所有筛选和搜索
     const applyAllFilters = useCallback(async () => {
          setIsApplying(true)

          try {
               // 收集所有筛选条件
               const allFilters: Record<string, string | string[]> = {}

               // 处理搜索
               if (searchKey && searchInput.trim()) {
                    allFilters[searchKey] = searchInput.trim()
               } else if (!searchKey && searchInput.trim()) {
                    // 全局搜索的处理
                    table.setGlobalFilter(searchInput.trim())
               }

               // 处理筛选器
               Object.entries(filterStates).forEach(([columnId, values]) => {
                    if (values.size > 0) {
                         allFilters[columnId] = Array.from(values)
                    }
               })

               // 调用回调（如果有）
               if (onApplyFilters) {
                    await onApplyFilters(allFilters)
               } else {
                    // 如果没有回调，直接应用到 table
                    filters.forEach((filter) => {
                         const column = table.getColumn(filter.columnId)
                         if (column) {
                              const values = filterStates[filter.columnId]
                              column.setFilterValue(values.size > 0 ? Array.from(values) : undefined)
                         }
                    })

                    if (searchKey) {
                         table.getColumn(searchKey)?.setFilterValue(searchInput.trim() || undefined)
                    }

                    // 重置到第一页
                    table.resetPageIndex()
               }
          } finally {
               setIsApplying(false)
          }
     }, [searchInput, filterStates, searchKey, table, filters, onApplyFilters])

     // 重置所有
     const resetAll = useCallback(() => {
          setSearchInput('')
          const resetFilterStates: Record<string, Set<string>> = {}
          filters.forEach((filter) => {
               resetFilterStates[filter.columnId] = new Set()
          })
          setFilterStates(resetFilterStates)

          // 重置 table
          table.resetColumnFilters()
          table.setGlobalFilter('')
          table.resetPageIndex()
     }, [table, filters])

     // 处理搜索输入变化
     const handleSearchChange = (value: string) => {
          setSearchInput(value)
          if (searchMode === 'instant') {
               applyAllFilters()
          }
     }

     // 处理筛选器变化
     const handleFilterChange = (columnId: string, values: Set<string>) => {
          setFilterStates((prev) => ({
               ...prev,
               [columnId]: values,
          }))

          if (filterMode === 'instant') {
               applyAllFilters()
          }
     }

     // 检查是否有任何筛选条件
     const hasActiveFilters = () => {
          if (searchInput.trim()) return true

          return Object.values(filterStates).some((values) => values && values.size > 0)
     }

     // 处理键盘事件
     const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
          if (event.key === 'Enter' && searchMode === 'manual') {
               event.preventDefault()
               applyAllFilters()
          }
     }

     return (
          <div className='flex items-center justify-between'>
               <div className='flex flex-1 flex-col-reverse items-start gap-y-2 sm:flex-row sm:items-center sm:space-x-2'>
                    {/* 搜索区域 */}
                    <div className='flex items-center gap-2'>
                         <div className='relative'>
                              <Input
                                   placeholder={searchPlaceholder}
                                   value={searchInput}
                                   onChange={(e) => handleSearchChange(e.target.value)}
                                   onKeyDown={handleKeyDown}
                                   className='h-8 w-[150px] pr-10 pl-8 lg:w-[250px]'
                                   disabled={isApplying}
                              />

                              <MagnifyingGlassIcon className='text-muted-foreground absolute top-1/2 left-2 h-4 w-4 -translate-y-1/2' />

                              {searchMode === 'manual' && (
                                   <Button
                                        size='sm'
                                        variant='secondary'
                                        className='absolute top-1/2 right-1 h-6 w-6 -translate-y-1/2 p-0'
                                        onClick={applyAllFilters}
                                        disabled={isApplying || !searchInput.trim()}
                                   >
                                        {isApplying ? (
                                             <div className='h-3 w-3 animate-spin rounded-full border border-t-transparent' />
                                        ) : (
                                             <MagnifyingGlassIcon className='h-3 w-3' />
                                        )}
                                   </Button>
                              )}
                         </div>
                    </div>

                    {/* 筛选器 */}
                    <div className='flex gap-x-2'>
                         {filters.map((filter) => {
                              const column = table.getColumn(filter.columnId)
                              if (!column) return null

                              return (
                                   <DataTableFacetedFilter
                                        key={filter.columnId}
                                        column={column}
                                        title={filter.title}
                                        options={filter.options}
                                        manualTrigger={filterMode === 'manual'}
                                        onApplyFilter={(values) => handleFilterChange(filter.columnId, values)}
                                   />
                              )
                         })}
                    </div>

                    {/* 统一应用按钮（手动模式） */}
                    {(searchMode === 'manual' || filterMode === 'manual') && hasActiveFilters() && (
                         <Button size='sm' onClick={applyAllFilters} disabled={isApplying} className='h-8'>
                              {isApplying ? '应用中...' : '应用筛选'}
                         </Button>
                    )}

                    {/* 重置按钮 */}
                    {hasActiveFilters() && (
                         <Button variant='ghost' size='sm' onClick={resetAll} className='h-8 px-2 lg:px-3' disabled={isApplying}>
                              重置
                              <Cross2Icon className='ms-2 h-4 w-4' />
                         </Button>
                    )}
               </div>

               <DataTableViewOptions table={table} />
          </div>
     )
}
