import * as React from 'react'
import { CheckIcon, PlusCircledIcon } from '@radix-ui/react-icons'
import { type Column, type Table } from '@tanstack/react-table'
import { DataTableViewOptions } from '@/develop/(components)/data-table/view-options.tsx'
import { cn } from '@/develop/(lib)/utils.ts'
import { Badge } from '@/components/ui/badge.tsx'
import { Button } from '@/components/ui/button.tsx'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator } from '@/components/ui/command.tsx'
import { Input } from '@/components/ui/input.tsx'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover.tsx'
import { Separator } from '@/components/ui/separator.tsx'

/**
 * 多选过滤组件的 Props 类型定义
 * @template TData 表格数据的类型
 * @template TValue 列值的类型
 */
type DataTableFacetedFilterProps<TData, TValue> = {
     column?: Column<TData, TValue>
     title?: string
     options: {
          label: string
          value: string
          icon?: React.ComponentType<{ className?: string }>
     }[]
     /** 临时选中的值 */
     tempValue?: string[]
     /** 临时值变化回调 */
     onTempValueChange?: (value: string[]) => void
     /** 是否有筛选值 */
     hasFilterValue?: boolean
}

/**
 * 数据表格多选过滤组件（纯API版本）
 *
 * 提供多选过滤功能，支持从下拉菜单中选择多个值进行过滤
 * 不依赖table对象，直接通过回调函数处理值变化
 */
export function DataTableFacetedFilter<TData, TValue>({
     column,
     title,
     options,
     tempValue = [],
     onTempValueChange,
     hasFilterValue = false,
}: DataTableFacetedFilterProps<TData, TValue>) {
     // 获取每个选项的唯一值及其对应的数据数量（用于显示计数）
     const facets = column?.getFacetedUniqueValues()
     // 获取当前选中的过滤值（优先使用临时值，否则使用列的当前值）
     const selectedValues = new Set(tempValue.length > 0 ? tempValue : (column?.getFilterValue() as string[]) || [])
     // 是否显示有筛选值的指示器
     const hasActiveFilter = hasFilterValue || selectedValues.size > 0

     return (
          <Popover>
               {/* 触发按钮：显示过滤器标题和已选值 */}
               <PopoverTrigger asChild>
                    <Button
                         variant='outline'
                         size='sm'
                         className={cn(
                              'h-8 min-w-[80px] border-dashed transition-all duration-200',
                              hasActiveFilter
                                   ? 'border-orange-300 bg-orange-50 text-orange-700 hover:bg-orange-100 dark:border-orange-600 dark:bg-orange-950/30 dark:text-orange-300'
                                   : 'hover:border-orange-200 hover:bg-orange-50/50'
                         )}
                    >
                         <div className='flex items-center gap-1'>
                              {hasActiveFilter ? (
                                   <div className='flex items-center gap-1'>
                                        <div className='h-1.5 w-1.5 animate-pulse rounded-full bg-orange-500'></div>
                                   </div>
                              ) : (
                                   <PlusCircledIcon className='size-3' />
                              )}
                              <span className='text-xs font-medium'>{title}</span>
                         </div>
                         {/* 如果有选中的值，显示徽章 */}
                         {selectedValues?.size > 0 && (
                              <>
                                   <Separator orientation='vertical' className='mx-1 h-4' />
                                   {/* 移动端：只显示选中数量 */}
                                   <Badge variant='secondary' className='rounded-full px-1.5 py-0.5 text-xs font-medium lg:hidden'>
                                        {selectedValues.size}
                                   </Badge>
                                   {/* 桌面端：显示选中项的标签或数量 */}
                                   <div className='hidden space-x-1 lg:flex'>
                                        {selectedValues.size > 2 ? (
                                             // 选中超过 2 项时，只显示数量
                                             <Badge variant='secondary' className='rounded-full px-1.5 py-0.5 text-xs font-medium'>
                                                  {selectedValues.size} 项
                                             </Badge>
                                        ) : (
                                             // 选中 2 项或更少时，显示每个选中项的标签
                                             options
                                                  .filter((option) => selectedValues.has(option.value))
                                                  .map((option) => (
                                                       <Badge
                                                            key={option.value}
                                                            className='rounded-full border-orange-200 bg-orange-100 px-1.5 py-0.5 text-xs font-medium text-orange-800'
                                                       >
                                                            {option.label}
                                                       </Badge>
                                                  ))
                                        )}
                                   </div>
                              </>
                         )}
                    </Button>
               </PopoverTrigger>

               {/* 弹出内容：包含选项列表和搜索功能 */}
               <PopoverContent className='w-[200px] p-0' align='start'>
                    <Command>
                         {/* 搜索输入框：用于过滤选项 */}
                         <CommandInput placeholder={title} />
                         <CommandList>
                              {/* 无搜索结果时的提示 */}
                              <CommandEmpty>No results found.</CommandEmpty>

                              {/* 选项组 */}
                              <CommandGroup>
                                   {options.map((option) => {
                                        // 检查当前选项是否被选中
                                        const isSelected = selectedValues.has(option.value)
                                        return (
                                             <CommandItem
                                                  key={option.value}
                                                  onSelect={() => {
                                                       // 切换选中状态：如果已选中则移除，否则添加
                                                       if (isSelected) {
                                                            selectedValues.delete(option.value)
                                                       } else {
                                                            selectedValues.add(option.value)
                                                       }
                                                       // 将 Set 转换为数组并更新临时值
                                                       const filterValues = Array.from(selectedValues)
                                                       // 调用临时值变化回调
                                                       onTempValueChange?.(filterValues)
                                                  }}
                                             >
                                                  {/* 复选框：显示选中状态 */}
                                                  <div
                                                       className={cn(
                                                            'border-primary flex size-4 items-center justify-center rounded-sm border',
                                                            isSelected ? 'bg-primary text-primary-foreground' : 'opacity-50 [&_svg]:invisible'
                                                       )}
                                                  >
                                                       <CheckIcon className={cn('text-background h-4 w-4')} />
                                                  </div>
                                                  {/* 选项图标（如果提供） */}
                                                  {option.icon && <option.icon className='text-muted-foreground size-4' />}
                                                  {/* 选项标签 */}
                                                  <span>{option.label}</span>
                                                  {/* 选项计数：显示该选项对应的数据数量 */}
                                                  {facets?.get(option.value) && (
                                                       <span className='ms-auto flex h-4 w-4 items-center justify-center font-mono text-xs'>
                                                            {facets.get(option.value)}
                                                       </span>
                                                  )}
                                             </CommandItem>
                                        )
                                   })}
                              </CommandGroup>

                              {/* 如果有选中的值，显示清除按钮 */}
                              {selectedValues.size > 0 && (
                                   <>
                                        <CommandSeparator />
                                        <CommandGroup>
                                             {/* 清除所有过滤 */}
                                             <CommandItem onSelect={() => onTempValueChange?.([])} className='justify-center text-center'>
                                                  Clear filters
                                             </CommandItem>
                                        </CommandGroup>
                                   </>
                              )}
                         </CommandList>
                    </Command>
               </PopoverContent>
          </Popover>
     )
}

/**
 * 搜索字段配置类型定义
 */
type SearchField = {
     /** 搜索字段对应的列 ID */
     columnId: string
     /** 输入框占位符文本 */
     placeholder?: string
     /** 显示标签（可选） */
     label?: string
}

/**
 * 临时搜索状态类型
 */
interface TempSearchState {
     searchFields: Record<string, string>
     filters: Record<string, string[]>
}

/**
 * 表格工具栏组件的 Props 类型定义
 * @template TData 表格数据的类型
 */
type DataTableToolbarProps<TData> = {
     table: Table<TData>
     /** 全局搜索占位符（当使用全局搜索时） */
     globalSearchPlaceholder?: string
     /** 单个搜索字段（向后兼容旧用法） */
     searchKey?: string
     /** 单个搜索字段占位符（向后兼容旧用法） */
     searchPlaceholder?: string
     /** 多个搜索字段配置 */
     searchFields?: SearchField[]
     /** 多选过滤配置 */
     filters?: {
          columnId: string
          title: string
          options: {
               label: string
               value: string
               icon?: React.ComponentType<{ className?: string }>
          }[]
     }[]
     /** 手动搜索回调函数 */
     onManualSearch?: () => void
     /** 是否正在加载中 */
     isLoading?: boolean
}

/**
 * 数据表格工具栏组件（单行版本）
 *
 * 提供表格的搜索、过滤和重置功能，所有元素都在同一行显示
 * 包括：搜索框、筛选器、操作按钮
 *
 * @template TData 表格数据的类型
 * @param props 组件属性
 * @param props.table TanStack Table 实例
 * @param props.globalSearchPlaceholder 全局搜索框占位符文本，默认为 'Search...'
 * @param props.searchKey 单个搜索字段的列ID（向后兼容）
 * @param props.searchPlaceholder 单个搜索字段占位符（向后兼容）
 * @param props.searchFields 多个搜索字段配置数组
 * @param props.filters 多选过滤配置数组
 * @param props.onManualSearch 手动搜索回调函数
 * @param props.isLoading 是否正在加载中
 * @returns 工具栏组件
 */
export function DataTableToolbar<TData>({
     table,
     globalSearchPlaceholder = 'Search...',
     searchKey,
     searchPlaceholder = 'Filter...',
     searchFields = [],
     filters = [],
     onManualSearch,
     isLoading = false,
}: DataTableToolbarProps<TData>) {
     // 检查是否有任何过滤条件被应用（列过滤或全局过滤）
     const isFiltered = table.getState().columnFilters.length > 0 || table.getState().globalFilter

     // 处理向后兼容：将单个 searchKey 转换为 searchFields 格式
     const effectiveSearchFields = React.useMemo(() => {
          if (searchKey) {
               return [
                    {
                         columnId: searchKey,
                         placeholder: searchPlaceholder,
                         label: undefined,
                    },
               ]
          }
          return searchFields
     }, [searchKey, searchPlaceholder, searchFields])

     // 临时搜索状态管理
     const [tempSearchState, setTempSearchState] = React.useState<TempSearchState>({
          searchFields: {},
          filters: {},
     })

     // 更新临时搜索字段值
     const updateTempSearchField = React.useCallback((columnId: string, value: string) => {
          setTempSearchState((prev) => ({
               ...prev,
               searchFields: {
                    ...prev.searchFields,
                    [columnId]: value,
               },
          }))
     }, [])

     // 更新临时筛选值
     const updateTempFilter = React.useCallback((columnId: string, value: string[]) => {
          setTempSearchState((prev) => ({
               ...prev,
               filters: {
                    ...prev.filters,
                    [columnId]: value,
               },
          }))
     }, [])

     // 应用临时搜索条件到表格
     const applySearchConditions = React.useCallback(() => {
          // 应用搜索字段
          Object.entries(tempSearchState.searchFields).forEach(([columnId, value]) => {
               const column = table.getColumn(columnId)
               if (column) {
                    column.setFilterValue(value || undefined)
               }
          })

          // 应用筛选字段
          Object.entries(tempSearchState.filters).forEach(([columnId, values]) => {
               const column = table.getColumn(columnId)
               if (column) {
                    column.setFilterValue(values.length > 0 ? values : undefined)
               }
          })

          // 触发手动搜索
          onManualSearch?.()
     }, [tempSearchState, table, onManualSearch])

     // 清除临时搜索条件
     const clearTempSearchConditions = React.useCallback(() => {
          // 清除临时状态
          setTempSearchState({
               searchFields: {},
               filters: {},
          })

          // 清除表格中的搜索字段
          effectiveSearchFields.forEach((field) => {
               const column = table.getColumn(field.columnId)
               if (column) {
                    column.setFilterValue(undefined)
               }
          })

          // 清除表格中的筛选字段
          filters.forEach((filter) => {
               const column = table.getColumn(filter.columnId)
               if (column) {
                    column.setFilterValue(undefined)
               }
          })

          // 触发手动搜索以更新显示
          onManualSearch?.()
     }, [effectiveSearchFields, filters, table, onManualSearch])

     // 单行布局 - 所有元素都在一行
     return (
          <div className='flex items-center gap-3 overflow-x-auto pb-2'>
               {/* 搜索字段 */}
               {effectiveSearchFields.length > 0 && (
                    <div className='flex flex-shrink-0 items-center gap-2'>
                         {effectiveSearchFields.map((field) => {
                              const column = table.getColumn(field.columnId)
                              if (!column) return null

                              const hasValue = tempSearchState.searchFields[field.columnId]?.trim()

                              return (
                                   <div key={field.columnId} className='flex min-w-0 items-center gap-1.5'>
                                        {field.label && (
                                             <label className='text-muted-foreground flex-shrink-0 text-xs font-medium whitespace-nowrap'>{field.label}:</label>
                                        )}
                                        <div className='relative'>
                                             <Input
                                                  placeholder={field.placeholder || field.label}
                                                  value={tempSearchState.searchFields[field.columnId] || ''}
                                                  onChange={(event) => updateTempSearchField(field.columnId, event.target.value)}
                                                  className={cn(
                                                       'h-8 w-32 text-sm transition-all duration-200',
                                                       hasValue && 'border-primary/50 bg-primary/5',
                                                       'focus:border-primary focus:ring-primary/20 focus:ring-1'
                                                  )}
                                                  onKeyDown={(event) => {
                                                       if (event.key === 'Enter') {
                                                            event.preventDefault()
                                                            applySearchConditions()
                                                       }
                                                  }}
                                             />
                                             {hasValue && (
                                                  <div className='absolute top-1/2 right-2 -translate-y-1/2'>
                                                       <div className='bg-primary h-1.5 w-1.5 rounded-full'></div>
                                                  </div>
                                             )}
                                        </div>
                                   </div>
                              )
                         })}
                    </div>
               )}

               {/* 全局搜索模式 */}
               {effectiveSearchFields.length === 0 && (
                    <div className='flex flex-shrink-0 items-center gap-1.5'>
                         <label className='text-muted-foreground flex-shrink-0 text-xs font-medium whitespace-nowrap'>搜索:</label>
                         <div className='relative'>
                              <Input
                                   placeholder={globalSearchPlaceholder}
                                   value={table.getState().globalFilter ?? ''}
                                   onChange={(event) => table.setGlobalFilter(event.target.value)}
                                   className='focus:border-primary focus:ring-primary/20 h-8 w-40 pr-3 pl-8 text-sm transition-all duration-200 focus:ring-1'
                              />
                              <svg
                                   className='text-muted-foreground absolute top-1/2 left-2 h-3 w-3 -translate-y-1/2'
                                   fill='none'
                                   stroke='currentColor'
                                   viewBox='0 0 24 24'
                              >
                                   <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z' />
                              </svg>
                         </div>
                    </div>
               )}

               {/* 筛选器 */}
               {filters.length > 0 && (
                    <div className='border-border ml-1 flex flex-shrink-0 items-center gap-2 border-l pl-3'>
                         {filters.map((filter) => {
                              const column = table.getColumn(filter.columnId)
                              if (!column) return null

                              const hasFilterValue = tempSearchState.filters[filter.columnId]?.length > 0

                              return (
                                   <DataTableFacetedFilter
                                        key={filter.columnId}
                                        column={column}
                                        title={filter.title}
                                        options={filter.options}
                                        tempValue={tempSearchState.filters[filter.columnId] || []}
                                        onTempValueChange={(value) => updateTempFilter(filter.columnId, value)}
                                        hasFilterValue={hasFilterValue}
                                   />
                              )
                         })}
                    </div>
               )}

               {/* 操作按钮 */}
               <div className='border-border ml-1 flex flex-shrink-0 items-center gap-1.5 border-l pl-3'>
                    {/* 重置按钮 */}
                    {isFiltered && (
                         <Button
                              variant='ghost'
                              size='sm'
                              onClick={() => {
                                   table.resetColumnFilters()
                                   table.setGlobalFilter('')
                              }}
                              className='text-muted-foreground hover:text-foreground h-7 px-2'
                              title='重置筛选条件'
                         >
                              <svg className='h-3 w-3' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                   <path
                                        strokeLinecap='round'
                                        strokeLinejoin='round'
                                        strokeWidth={2}
                                        d='M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15'
                                   />
                              </svg>
                         </Button>
                    )}

                    {/* 清除搜索按钮 */}
                    {(Object.keys(tempSearchState.searchFields).length > 0 || Object.keys(tempSearchState.filters).length > 0) && (
                         <Button
                              variant='ghost'
                              size='sm'
                              onClick={clearTempSearchConditions}
                              className='text-muted-foreground hover:text-destructive hover:border-destructive/50 h-7 px-2'
                              title='清除所有搜索条件'
                         >
                              <svg className='h-3 w-3' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                   <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M6 18L18 6M6 6l12 12' />
                              </svg>
                         </Button>
                    )}

                    {/* 统一搜索按钮 */}
                    {onManualSearch && (
                         <Button
                              onClick={applySearchConditions}
                              disabled={isLoading}
                              className={cn(
                                   'h-8 px-3 font-medium shadow-sm transition-all duration-200',
                                   'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800',
                                   'border-0 text-white hover:shadow-md',
                                   isLoading && 'cursor-not-allowed opacity-75'
                              )}
                         >
                              <svg className={cn('mr-1 h-3.5 w-3.5', isLoading && 'animate-spin')} fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                   <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z' />
                              </svg>
                              <span className='text-xs'>{isLoading ? '搜索中...' : '搜索'}</span>
                         </Button>
                    )}

                    {/* 视图选项 */}
                    <DataTableViewOptions table={table} />
               </div>
          </div>
     )
}
