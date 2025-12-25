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
     /** 是否有待应用的更改 */
     isPending?: boolean
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
     isPending = false,
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
                              isPending
                                   ? 'border-orange-500 bg-orange-100 text-orange-800 hover:bg-orange-200 dark:border-orange-400 dark:bg-orange-950/50 dark:text-orange-300'
                                   : hasActiveFilter
                                   ? 'border-primary bg-primary/10 text-primary hover:bg-primary/20 dark:border-primary/50 dark:bg-primary/5'
                                   : 'hover:border-muted-foreground/30 hover:bg-muted/50'
                         )}
                    >
                         <div className='flex items-center gap-1'>
                              {isPending ? (
                                   <div className='flex items-center gap-1'>
                                        <div className='h-1.5 w-1.5 animate-pulse rounded-full bg-orange-500'></div>
                                   </div>
                              ) : hasActiveFilter ? (
                                   <div className='flex items-center gap-1'>
                                        <div className='bg-primary h-1.5 w-1.5 rounded-full dark:bg-primary-foreground'></div>
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
                                   <Badge
                                        variant='secondary'
                                        className={cn(
                                             'rounded-full px-1.5 py-0.5 text-xs font-medium lg:hidden',
                                             isPending && 'border-orange-400 bg-orange-200 text-orange-900'
                                        )}
                                   >
                                        {selectedValues.size}
                                   </Badge>
                                   {/* 桌面端：显示选中项的标签或数量 */}
                                   <div className='hidden space-x-1 lg:flex'>
                                        {selectedValues.size > 2 ? (
                                             // 选中超过 2 项时，只显示数量
                                             <Badge
                                                  variant='secondary'
                                                  className={cn(
                                                       'rounded-full px-1.5 py-0.5 text-xs font-medium',
                                                       isPending && 'border-orange-400 bg-orange-200 text-orange-900'
                                                  )}
                                             >
                                                  {selectedValues.size} 项
                                             </Badge>
                                        ) : (
                                             // 选中 2 项或更少时，显示每个选中项的标签
                                             options
                                                  .filter((option) => selectedValues.has(option.value))
                                                  .map((option) => (
                                                       <Badge
                                                            key={option.value}
                                                            className={cn(
                                                                 'rounded-full px-1.5 py-0.5 text-xs font-medium',
                                                                 isPending
                                                                      ? 'border-orange-400 bg-orange-200 text-orange-900'
                                                                      : 'border-primary/30 bg-primary/20 text-primary'
                                                            )}
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
     /** 查询后是否保留搜索条件（默认 true） */
     preserveSearchAfterQuery?: boolean
     /** 是否显示保留搜索条件的开关（默认 false） */
     showPreserveToggle?: boolean
}

/**
 * 数据表格工具栏组件（优化版本）
 *
 * 提供表格的搜索、过滤和重置功能，采用响应式布局
 * 优化：即时搜索、简化状态管理、更好的移动端体验
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
     preserveSearchAfterQuery = true,
     showPreserveToggle = false,
}: DataTableToolbarProps<TData>) {
     // 保留搜索条件的状态
     const [preserveSearch, setPreserveSearch] = React.useState(preserveSearchAfterQuery)

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

     // 优化：临时搜索状态管理 - 同步初始化
     const [tempSearchState, setTempSearchState] = React.useState<TempSearchState>(() => {
          const initialSearchFields: Record<string, string> = {}
          const initialFilters: Record<string, string[]> = {}

          // 从表格当前状态初始化
          effectiveSearchFields.forEach((field) => {
               const column = table.getColumn(field.columnId)
               const value = column?.getFilterValue() as string
               if (value) initialSearchFields[field.columnId] = value
          })

          filters.forEach((filter) => {
               const column = table.getColumn(filter.columnId)
               const value = column?.getFilterValue() as string[]
               if (value && value.length > 0) initialFilters[filter.columnId] = value
          })

          return { searchFields: initialSearchFields, filters: initialFilters }
     })

     // 检查是否有待应用的搜索条件（临时状态与表格状态不一致）
     const hasPendingChanges = React.useMemo(() => {
          // 检查搜索字段
          for (const [columnId, tempValue] of Object.entries(tempSearchState.searchFields)) {
               const column = table.getColumn(columnId)
               const currentValue = column?.getFilterValue() as string
               if (tempValue !== currentValue) return true
          }

          // 检查筛选字段
          for (const [columnId, tempValues] of Object.entries(tempSearchState.filters)) {
               const column = table.getColumn(columnId)
               const currentValues = column?.getFilterValue() as string[]
               if (!currentValues && tempValues.length > 0) return true
               if (currentValues && JSON.stringify(tempValues.sort()) !== JSON.stringify(currentValues.sort())) return true
          }

          // 检查是否有表格有值但临时状态没有的
          for (const field of effectiveSearchFields) {
               const column = table.getColumn(field.columnId)
               const currentValue = column?.getFilterValue() as string
               if (currentValue && !tempSearchState.searchFields[field.columnId]) return true
          }

          for (const filter of filters) {
               const column = table.getColumn(filter.columnId)
               const currentValues = column?.getFilterValue() as string[]
               if (currentValues && currentValues.length > 0 && !tempSearchState.filters[filter.columnId]) return true
          }

          return false
     }, [tempSearchState, table, effectiveSearchFields, filters])

     // 更新临时搜索字段值（不立即应用）
     const updateTempSearchField = React.useCallback((columnId: string, value: string) => {
          setTempSearchState((prev) => ({
               ...prev,
               searchFields: {
                    ...prev.searchFields,
                    [columnId]: value,
               },
          }))
     }, [])

     // 更新临时筛选值（不立即应用）
     const updateTempFilter = React.useCallback((columnId: string, value: string[]) => {
          setTempSearchState((prev) => ({
               ...prev,
               filters: {
                    ...prev.filters,
                    [columnId]: value,
               },
          }))
     }, [])

     // 应用搜索条件到表格并重置到第一页
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

          // 如果不保留搜索条件，清空临时状态
          if (!preserveSearch) {
               setTempSearchState({
                    searchFields: {},
                    filters: {},
               })
          }

          // 触发手动搜索回调（重置到第一页）
          onManualSearch?.()
     }, [tempSearchState, table, onManualSearch, preserveSearch])

     // 清除所有搜索条件（优化：统一清除逻辑）
     const clearAllConditions = React.useCallback(() => {
          // 清除临时状态
          setTempSearchState({
               searchFields: {},
               filters: {},
          })

          // 清除表格状态
          table.resetColumnFilters()
          table.setGlobalFilter('')

          // 触发搜索更新
          onManualSearch?.()
     }, [table, onManualSearch])

     // 优化：响应式布局 - 桌面端多行，移动端垂直堆叠
     return (
          <div className='space-y-3'>
               {/* 第一行：搜索字段 */}
               {effectiveSearchFields.length > 0 && (
                    <div className='flex flex-wrap items-center gap-3'>
                         {effectiveSearchFields.map((field) => {
                              const column = table.getColumn(field.columnId)
                              if (!column) return null

                              const tempValue = tempSearchState.searchFields[field.columnId] || ''
                              const currentValue = column?.getFilterValue() as string
                              const hasValue = tempValue?.trim()
                              const hasPendingValue = hasValue && tempValue !== currentValue

                              return (
                                   <div key={field.columnId} className='flex min-w-0 items-center gap-2'>
                                        {field.label && (
                                             <label className='text-muted-foreground flex-shrink-0 text-sm font-medium whitespace-nowrap'>
                                                  {field.label}:
                                             </label>
                                        )}
                                        <div className='relative'>
                                             <Input
                                                  placeholder={field.placeholder || field.label}
                                                  value={tempValue}
                                                  onChange={(event) => updateTempSearchField(field.columnId, event.target.value)}
                                                  className={cn(
                                                       'h-9 w-full min-w-[140px] max-w-[200px] text-sm transition-all duration-200',
                                                       'focus-visible:ring-primary/20',
                                                       hasPendingValue && 'border-orange-400 bg-orange-50/50',
                                                       hasValue && !hasPendingValue && 'border-primary/50 bg-primary/5'
                                                  )}
                                                  onKeyDown={(event) => {
                                                       if (event.key === 'Enter') {
                                                            event.preventDefault()
                                                            applySearchConditions()
                                                       }
                                                  }}
                                             />
                                             {hasPendingValue && (
                                                  <div className='absolute right-3 top-1/2 -translate-y-1/2' title='待应用'>
                                                       <div className='bg-orange-500 h-1.5 w-1.5 animate-pulse rounded-full'></div>
                                                  </div>
                                             )}
                                             {hasValue && !hasPendingValue && (
                                                  <div className='absolute right-3 top-1/2 -translate-y-1/2' title='已应用'>
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
                    <div className='flex items-center gap-2'>
                         <div className='relative flex-1 max-w-sm'>
                              <Input
                                   placeholder={globalSearchPlaceholder}
                                   value={table.getState().globalFilter ?? ''}
                                   onChange={(event) => table.setGlobalFilter(event.target.value)}
                                   className='h-9 pl-9 pr-4 text-sm'
                              />
                              <svg
                                   className='text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2'
                                   fill='none'
                                   stroke='currentColor'
                                   viewBox='0 0 24 24'
                              >
                                   <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z' />
                              </svg>
                         </div>
                    </div>
               )}

               {/* 第二行：筛选器和操作按钮 */}
               <div className='flex flex-wrap items-center justify-between gap-3'>
                    {/* 筛选器区域 */}
                    {filters.length > 0 && (
                         <div className='flex flex-wrap items-center gap-2'>
                              <span className='text-muted-foreground text-xs font-medium'>筛选:</span>
                              {filters.map((filter) => {
                                   const column = table.getColumn(filter.columnId)
                                   if (!column) return null

                                   const tempValues = tempSearchState.filters[filter.columnId] || []
                                   const currentValues = column?.getFilterValue() as string[]
                                   const hasFilterValue = tempValues.length > 0
                                   const hasPendingFilter =
                                        hasFilterValue &&
                                        (!currentValues ||
                                             JSON.stringify(tempValues.sort()) !== JSON.stringify(currentValues.sort()))

                                   return (
                                        <DataTableFacetedFilter
                                             key={filter.columnId}
                                             column={column}
                                             title={filter.title}
                                             options={filter.options}
                                             tempValue={tempValues}
                                             onTempValueChange={(value) => updateTempFilter(filter.columnId, value)}
                                             hasFilterValue={hasFilterValue}
                                             isPending={hasPendingFilter}
                                        />
                                   )
                              })}
                         </div>
                    )}

                    {/* 操作按钮区域 */}
                    <div className='flex items-center gap-2'>
                         {/* 保留搜索条件开关 */}
                         {showPreserveToggle && (
                              <div className='flex items-center gap-2 border-r pr-2'>
                                   <label
                                        htmlFor='preserve-search'
                                        className='text-muted-foreground cursor-pointer text-xs whitespace-nowrap'
                                        title='查询后是否保留搜索条件'
                                   >
                                        保留条件
                                   </label>
                                   <input
                                        id='preserve-search'
                                        type='checkbox'
                                        checked={preserveSearch}
                                        onChange={(e) => setPreserveSearch(e.target.checked)}
                                        className='border-primary h-4 w-4 rounded border focus:ring-primary focus:ring-2'
                                   />
                              </div>
                         )}

                         {/* 统一查询按钮 */}
                         <Button
                              onClick={applySearchConditions}
                              disabled={!hasPendingChanges}
                              className={cn(
                                   'h-8 px-4 text-xs font-medium shadow-sm transition-all duration-200',
                                   'bg-primary hover:bg-primary/90 text-primary-foreground',
                                   'disabled:opacity-50 disabled:cursor-not-allowed',
                                   hasPendingChanges && 'animate-pulse'
                              )}
                              title={hasPendingChanges ? '有未应用的筛选条件' : '查询'}
                         >
                              <svg className='mr-1.5 h-3.5 w-3.5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                   <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z' />
                              </svg>
                              查询
                         </Button>

                         {/* 清除按钮 */}
                         {isFiltered && (
                              <Button
                                   variant='outline'
                                   size='sm'
                                   onClick={clearAllConditions}
                                   className='h-8 text-xs'
                                   title='清除所有筛选条件'
                              >
                                   <svg className='mr-1.5 h-3.5 w-3.5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M6 18L18 6M6 6l12 12' />
                                   </svg>
                                   清除筛选
                              </Button>
                         )}

                         {/* 视图选项 */}
                         <DataTableViewOptions table={table} />
                    </div>
               </div>

               {/* 已选筛选条件提示条 */}
               {(isFiltered || hasPendingChanges) && (
                    <div className='bg-muted/50 flex flex-wrap items-center gap-2 rounded-md border px-3 py-2 text-xs'>
                         <span className='text-muted-foreground font-medium'>
                              {hasPendingChanges ? '待应用筛选:' : '已应用筛选:'}
                         </span>
                         {/* 显示搜索条件 */}
                         {Object.entries(tempSearchState.searchFields).map(([key, value]) => {
                              if (!value) return null
                              const field = effectiveSearchFields.find((f) => f.columnId === key)
                              const column = table.getColumn(key)
                              const currentValue = column?.getFilterValue() as string
                              const isPending = value !== currentValue

                              return (
                                   <Badge
                                        key={key}
                                        variant={isPending ? 'outline' : 'secondary'}
                                        className={cn('gap-1', isPending && 'border-orange-400 bg-orange-50 text-orange-700')}
                                   >
                                        <span>{field?.label || key}:</span>
                                        <span className='font-medium'>{value}</span>
                                        {isPending && (
                                             <svg className='h-3 w-3' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' />
                                             </svg>
                                        )}
                                   </Badge>
                              )
                         })}
                         {/* 显示筛选条件 */}
                         {Object.entries(tempSearchState.filters).map(([key, values]) => {
                              if (!values || values.length === 0) return null
                              const filter = filters.find((f) => f.columnId === key)
                              const labels = values
                                   .map((v) => filter?.options.find((o) => o.value === v)?.label || v)
                                   .join(', ')
                              const column = table.getColumn(key)
                              const currentValues = column?.getFilterValue() as string[]
                              const isPending =
                                   !currentValues ||
                                   JSON.stringify(values.sort()) !== JSON.stringify(currentValues.sort())

                              return (
                                   <Badge
                                        key={key}
                                        variant={isPending ? 'outline' : 'secondary'}
                                        className={cn('gap-1', isPending && 'border-orange-400 bg-orange-50 text-orange-700')}
                                   >
                                        <span>{filter?.title || key}:</span>
                                        <span className='font-medium'>{labels}</span>
                                        {isPending && (
                                             <svg className='h-3 w-3' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' />
                                             </svg>
                                        )}
                                   </Badge>
                              )
                         })}
                    </div>
               )}
          </div>
     )
}
