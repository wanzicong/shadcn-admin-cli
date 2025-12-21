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
import { DataTableViewOptions } from './view-options.tsx'

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
export function DataTableFacetedFilter<TData, TValue>({ column, title, options }: DataTableFacetedFilterProps<TData, TValue>) {
     // 获取每个选项的唯一值及其对应的数据数量（用于显示计数）
     const facets = column?.getFacetedUniqueValues()
     // 获取当前选中的过滤值（转换为 Set 以便快速查找）
     const selectedValues = new Set(column?.getFilterValue() as string[])

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
                                                       // 将 Set 转换为数组并更新列过滤值
                                                       const filterValues = Array.from(selectedValues)
                                                       // 如果有选中值则设置过滤，否则清除过滤
                                                       column?.setFilterValue(filterValues.length ? filterValues : undefined)
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
                                             <CommandItem onSelect={() => column?.setFilterValue(undefined)} className='justify-center text-center'>
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
 * 表格工具栏组件的 Props 类型定义
 * @template TData 表格数据的类型
 */
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
}

/**
 * 数据表格工具栏组件
 *
 * 提供表格的搜索、过滤和重置功能，包括：
 * - 全局搜索或列搜索
 * - 多选过滤（Faceted Filter）
 * - 重置所有过滤条件
 * - 列显示选项控制
 *
 * @template TData 表格数据的类型
 * @param props 组件属性
 * @param props.table TanStack Table 实例
 * @param props.searchPlaceholder 搜索框占位符文本，默认为 'Filter...'
 * @param props.searchKey 指定列的搜索键，如果提供则进行列搜索，否则进行全局搜索
 * @param props.filters 过滤配置数组，每个配置包含列ID、标题和选项列表
 * @returns 工具栏组件
 */
export function DataTableToolbar<TData>({ table, searchPlaceholder = 'Filter...', searchKey, filters = [] }: DataTableToolbarProps<TData>) {
     // 检查是否有任何过滤条件被应用（列过滤或全局过滤）
     const isFiltered = table.getState().columnFilters.length > 0 || table.getState().globalFilter

     return (
          <div className='flex items-center justify-between'>
               {/* 左侧工具栏区域：搜索框、过滤器和重置按钮 */}
               <div className='flex flex-1 flex-col-reverse items-start gap-y-2 sm:flex-row sm:items-center sm:space-x-2'>
                    {/* 搜索输入框：根据 searchKey 决定是列搜索还是全局搜索 */}
                    {searchKey ? (
                         // 列搜索模式：搜索指定列的值
                         <Input
                              placeholder={searchPlaceholder}
                              value={(table.getColumn(searchKey)?.getFilterValue() as string) ?? ''}
                              onChange={(event) => table.getColumn(searchKey)?.setFilterValue(event.target.value)}
                              className='h-8 w-[150px] lg:w-[250px]'
                         />
                    ) : (
                         // 全局搜索模式：搜索所有列的值
                         <Input
                              placeholder={searchPlaceholder}
                              value={table.getState().globalFilter ?? ''}
                              onChange={(event) => table.setGlobalFilter(event.target.value)}
                              className='h-8 w-[150px] lg:w-[250px]'
                         />
                    )}

                    {/* 多选过滤器组：渲染每个配置的过滤器 */}
                    <div className='flex gap-x-2'>
                         {filters.map((filter) => {
                              // 获取对应的列对象
                              const column = table.getColumn(filter.columnId)
                              // 如果列不存在，跳过渲染
                              if (!column) return null
                              // 渲染多选过滤器组件
                              return <DataTableFacetedFilter key={filter.columnId} column={column} title={filter.title} options={filter.options} />
                         })}
                    </div>

                    {/* 重置按钮：当有任何过滤条件时显示，点击后清除所有过滤 */}
                    {isFiltered && (
                         <Button
                              variant='ghost'
                              onClick={() => {
                                   // 重置所有列过滤
                                   table.resetColumnFilters()
                                   // 重置全局过滤
                                   table.setGlobalFilter('')
                              }}
                              className='h-8 px-2 lg:px-3'
                         >
                              重置
                              <Cross2Icon className='ms-2 h-4 w-4' />
                         </Button>
                    )}
               </div>

               {/* 右侧工具栏区域：列显示选项控制 */}
               <DataTableViewOptions table={table} />
          </div>
     )
}
