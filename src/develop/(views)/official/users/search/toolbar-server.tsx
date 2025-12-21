import * as React from 'react'
import { CheckIcon, Cross2Icon, PlusCircledIcon } from '@radix-ui/react-icons'
import { type Column, type Table } from '@tanstack/react-table'
import { cn } from '@/develop/(lib)/utils.ts'
import { Badge } from '@/components/ui/badge.tsx'
import { Button } from '@/components/ui/button.tsx'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator } from '@/components/ui/command.tsx'
import { Input } from '@/components/ui/input.tsx'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover.tsx'
import { Separator } from '@/components/ui/separator.tsx'
import { DataTableViewOptions } from '@/develop/(components)/data-table/view-options.tsx'

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
}

/**
 * 数据表格多选过滤组件
 *
 * 提供多选过滤功能，支持从下拉菜单中选择多个值进行过滤，包括：
 * - 多选过滤
 * - 选项计数显示（显示每个选项对应的数据数量）
 * - 已选值徽章显示
 * - 搜索过滤选项
 * - 清除过滤功能
 *
 * @template TData 表格数据的类型
 * @template TValue 列值的类型
 * @param props 组件属性
 * @param props.column TanStack Table 列对象
 * @param props.title 过滤器标题
 * @param props.options 过滤选项数组，每个选项包含标签、值和可选的图标
 * @returns 多选过滤组件
 */
export function DataTableFacetedFilter<TData, TValue>({ 
     column, 
     title, 
     options, 
     tempValue = [], 
     onTempValueChange 
}: DataTableFacetedFilterProps<TData, TValue>) {
     // 获取每个选项的唯一值及其对应的数据数量（用于显示计数）
     const facets = column?.getFacetedUniqueValues()
     // 获取当前选中的过滤值（优先使用临时值，否则使用列的当前值）
     const selectedValues = new Set(tempValue.length > 0 ? tempValue : (column?.getFilterValue() as string[] || []))

     return (
          <Popover>
               {/* 触发按钮：显示过滤器标题和已选值 */}
               <PopoverTrigger asChild>
                    <Button variant='outline' size='sm' className='h-8 border-dashed'>
                         <PlusCircledIcon className='size-4' />
                         {title}
                         {/* 如果有选中的值，显示徽章 */}
                         {selectedValues?.size > 0 && (
                              <>
                                   <Separator orientation='vertical' className='mx-2 h-4' />
                                   {/* 移动端：只显示选中数量 */}
                                   <Badge variant='secondary' className='rounded-sm px-1 font-normal lg:hidden'>
                                        {selectedValues.size}
                                   </Badge>
                                   {/* 桌面端：显示选中项的标签或数量 */}
                                   <div className='hidden space-x-1 lg:flex'>
                                        {selectedValues.size > 2 ? (
                                             // 选中超过 2 项时，只显示数量
                                             <Badge variant='secondary' className='rounded-sm px-1 font-normal'>
                                                  {selectedValues.size} selected
                                             </Badge>
                                        ) : (
                                             // 选中 2 项或更少时，显示每个选中项的标签
                                             options
                                                  .filter((option) => selectedValues.has(option.value))
                                                  .map((option) => (
                                                       <Badge variant='secondary' key={option.value} className='rounded-sm px-1 font-normal'>
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
                                             <CommandItem 
                                                  onSelect={() => onTempValueChange?.([])} 
                                                  className='justify-center text-center'
                                             >
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
 * 数据表格工具栏组件
 *
 * 提供表格的搜索、过滤和重置功能，包括：
 * - 多列搜索或全局搜索
 * - 多选过滤（Faceted Filter）
 * - 重置所有过滤条件
 * - 列显示选项控制
 *
 * @template TData 表格数据的类型
 * @param props 组件属性
 * @param props.table TanStack Table 实例
 * @param props.globalSearchPlaceholder 全局搜索框占位符文本，默认为 'Search...'
 * @param props.searchKey 单个搜索字段的列ID（向后兼容）
 * @param props.searchPlaceholder 单个搜索字段占位符（向后兼容）
 * @param props.searchFields 多个搜索字段配置数组
 * @param props.filters 多选过滤配置数组
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
          setTempSearchState(prev => ({
               ...prev,
               searchFields: {
                    ...prev.searchFields,
                    [columnId]: value,
               },
          }))
     }, [])

     // 更新临时筛选值
     const updateTempFilter = React.useCallback((columnId: string, value: string[]) => {
          setTempSearchState(prev => ({
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
          effectiveSearchFields.forEach(field => {
               const column = table.getColumn(field.columnId)
               if (column) {
                    column.setFilterValue(undefined)
               }
          })

          // 清除表格中的筛选字段
          filters.forEach(filter => {
               const column = table.getColumn(filter.columnId)
               if (column) {
                    column.setFilterValue(undefined)
               }
          })

          // 触发手动搜索以更新显示
          onManualSearch?.()
     }, [effectiveSearchFields, filters, table, onManualSearch])

     return (
          <div className='flex flex-col gap-4'>
               {/* 搜索区域：多个搜索框或全局搜索 */}
               <div className='flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4'>
                     {/* 多个搜索字段模式 */}
                     {effectiveSearchFields.length > 0 &&
                          effectiveSearchFields.map((field) => {
                               const column = table.getColumn(field.columnId)
                               if (!column) return null

                               return (
                                    <div key={field.columnId} className='flex flex-col gap-1'>
                                         {field.label && <label className='text-muted-foreground text-sm font-medium'>{field.label}</label>}
                                         <Input
                                              placeholder={field.placeholder || `Search ${field.columnId}...`}
                                              value={tempSearchState.searchFields[field.columnId] || ''}
                                              onChange={(event) => updateTempSearchField(field.columnId, event.target.value)}
                                              className='h-8 w-full sm:w-[180px] lg:w-[220px]'
                                              onKeyDown={(event) => {
                                                   if (event.key === 'Enter') {
                                                        event.preventDefault()
                                                        // 应用搜索条件并触发搜索
                                                        applySearchConditions()
                                                   }
                                              }}
                                         />
                                    </div>
                               )
                          })}

                    {/* 全局搜索模式（当没有指定任何搜索字段时） */}
                    {effectiveSearchFields.length === 0 && (
                         <div className='flex-1'>
                              <Input
                                   placeholder={globalSearchPlaceholder}
                                   value={table.getState().globalFilter ?? ''}
                                   onChange={(event) => table.setGlobalFilter(event.target.value)}
                                   className='h-8 w-full sm:w-[200px] lg:w-[300px]'
                              />
                         </div>
                    )}
               </div>

               {/* 过滤器和操作区域 */}
               <div className='flex flex-col-reverse items-start justify-between gap-3 sm:flex-row sm:items-center'>
                    {/* 左侧：过滤器和重置按钮 */}
                    <div className='flex flex-1 flex-wrap items-center gap-2'>
                         {/* 多选过滤器组 */}
                         <div className='flex flex-wrap gap-2'>
                              {filters.map((filter) => {
                                   const column = table.getColumn(filter.columnId)
                                   if (!column) return null
                                   return (
                                        <DataTableFacetedFilter 
                                             key={filter.columnId} 
                                             column={column} 
                                             title={filter.title} 
                                             options={filter.options}
                                             tempValue={tempSearchState.filters[filter.columnId] || []}
                                             onTempValueChange={(value) => updateTempFilter(filter.columnId, value)}
                                        />
                                   )
                              })}
                         </div>

                          {/* 重置按钮 */}
                          {isFiltered && (
                               <Button
                                    variant='ghost'
                                    onClick={() => {
                                         table.resetColumnFilters()
                                         table.setGlobalFilter('')
                                    }}
                                    className='h-8 px-2 lg:px-3'
                               >
                                    重置
                                    <Cross2Icon className='ms-2 h-4 w-4' />
                               </Button>
                          )}
                          
                          {/* 清除搜索按钮 */}
                          {(Object.keys(tempSearchState.searchFields).length > 0 || Object.keys(tempSearchState.filters).length > 0) && (
                               <Button
                                    variant='ghost'
                                    onClick={clearTempSearchConditions}
                                    className='h-8 px-2 lg:px-3'
                                    title='清除所有搜索条件'
                               >
                                    清除搜索
                                    <Cross2Icon className='ms-2 h-4 w-4' />
                               </Button>
                          )}
                    </div>

                    {/* 右侧：列显示选项控制和统一搜索按钮 */}
                    <div className='flex items-center gap-2'>
                         {/* 统一搜索按钮 */}
                         {onManualSearch && (
                              <Button
                                   variant='default'
                                   size='sm'
                                   onClick={applySearchConditions}
                                   disabled={isLoading}
                                   className='h-8 px-4'
                              >
                                   <svg className={cn('h-4 w-4 mr-1', isLoading && 'animate-spin')} fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z' />
                                   </svg>
                                   搜索
                              </Button>
                         )}
                         <DataTableViewOptions table={table} />
                    </div>
               </div>
          </div>
     )
}
