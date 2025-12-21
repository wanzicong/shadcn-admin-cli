// faceted-filter.tsx
import * as React from 'react'
import { type Column } from '@tanstack/react-table'
import { Check, ChevronsUpDown } from 'lucide-react'
import { cn } from '@/develop/(lib)/utils'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator } from '@/components/ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Separator } from '@/components/ui/separator'

interface DataTableFacetedFilterProps<TData, TValue> {
     column?: Column<TData, TValue>
     title?: string
     options: {
          label: string
          value: string
          icon?: React.ComponentType<{ className?: string }>
     }[]
     // 新增：手动触发模式
     manualTrigger?: boolean
     // 新增：应用筛选的回调
     onApplyFilter?: (selectedValues: Set<string>) => void
}

export function DataTableFacetedFilter<TData, TValue>({
     column,
     title,
     options,
     manualTrigger = false, // 默认为自动触发
     onApplyFilter,
}: DataTableFacetedFilterProps<TData, TValue>) {
     const facets = column?.getFacetedUniqueValues()
     const selectedValues = new Set(column?.getFilterValue() as string[])

     // 本地状态管理选择的值
     const [localSelectedValues, setLocalSelectedValues] = React.useState<Set<string>>(selectedValues)
     const [open, setOpen] = React.useState(false)

     // 当 column 的筛选值变化时，同步到本地状态
     React.useEffect(() => {
          setLocalSelectedValues(new Set((column?.getFilterValue() as string[]) || []))
     }, [column])

     // 应用筛选
     const applyFilter = () => {
          if (manualTrigger) {
               // 手动触发模式：调用回调函数
               if (onApplyFilter) {
                    onApplyFilter(localSelectedValues)
               }
          } else {
               // 自动触发模式：直接设置到 column
               column?.setFilterValue(localSelectedValues.size > 0 ? Array.from(localSelectedValues) : undefined)
          }
          setOpen(false)
     }

     // 清除筛选
     const clearFilter = () => {
          setLocalSelectedValues(new Set())
          if (manualTrigger) {
               if (onApplyFilter) {
                    onApplyFilter(new Set())
               }
          } else {
               column?.setFilterValue(undefined)
          }
     }

     // 切换选择
     const toggleValue = (value: string) => {
          const newSelectedValues = new Set(localSelectedValues)
          if (newSelectedValues.has(value)) {
               newSelectedValues.delete(value)
          } else {
               newSelectedValues.add(value)
          }
          setLocalSelectedValues(newSelectedValues)

          // 如果是自动模式，立即应用
          if (!manualTrigger) {
               column?.setFilterValue(newSelectedValues.size > 0 ? Array.from(newSelectedValues) : undefined)
          }
     }

     return (
          <Popover open={open} onOpenChange={setOpen}>
               <PopoverTrigger asChild>
                    <Button variant='outline' size='sm' className='h-8 border-dashed'>
                         <ChevronsUpDown className='mr-2 h-4 w-4' />
                         {title}
                         {localSelectedValues.size > 0 && (
                              <>
                                   <Separator orientation='vertical' className='mx-2 h-4' />
                                   <Badge variant='secondary' className='rounded-sm px-1 font-normal lg:hidden'>
                                        {localSelectedValues.size}
                                   </Badge>
                                   <div className='hidden space-x-1 lg:flex'>
                                        {localSelectedValues.size > 2 ? (
                                             <Badge variant='secondary' className='rounded-sm px-1 font-normal'>
                                                  {localSelectedValues.size} 个已选
                                             </Badge>
                                        ) : (
                                             options
                                                  .filter((option) => localSelectedValues.has(option.value))
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
               <PopoverContent className='w-[200px] p-0' align='start'>
                    <Command>
                         <CommandInput placeholder={`搜索 ${title.toLowerCase()}...`} />
                         <CommandList>
                              <CommandEmpty>未找到结果</CommandEmpty>
                              <CommandGroup>
                                   {options.map((option) => {
                                        const isSelected = localSelectedValues.has(option.value)
                                        return (
                                             <CommandItem key={option.value} onSelect={() => toggleValue(option.value)}>
                                                  <div
                                                       className={cn(
                                                            'border-primary mr-2 flex h-4 w-4 items-center justify-center rounded-sm border',
                                                            isSelected ? 'bg-primary text-primary-foreground' : 'opacity-50 [&_svg]:invisible'
                                                       )}
                                                  >
                                                       <Check className={cn('h-4 w-4')} />
                                                  </div>
                                                  {option.icon && <option.icon className='text-muted-foreground mr-2 h-4 w-4' />}
                                                  <span>{option.label}</span>
                                                  {facets?.get(option.value) && (
                                                       <span className='ml-auto flex h-4 w-4 items-center justify-center font-mono text-xs'>
                                                            {facets.get(option.value)}
                                                       </span>
                                                  )}
                                             </CommandItem>
                                        )
                                   })}
                              </CommandGroup>
                              {localSelectedValues.size > 0 && (
                                   <>
                                        <CommandSeparator />
                                        <CommandGroup>
                                             {manualTrigger ? (
                                                  // 手动触发模式：显示应用按钮
                                                  <>
                                                       <CommandItem onSelect={applyFilter} className='justify-center text-center'>
                                                            应用筛选
                                                       </CommandItem>
                                                       <CommandItem onSelect={clearFilter} className='justify-center text-center'>
                                                            清除筛选
                                                       </CommandItem>
                                                  </>
                                             ) : (
                                                  // 自动触发模式：只显示清除按钮
                                                  <CommandItem onSelect={clearFilter} className='justify-center text-center'>
                                                       清除筛选
                                                  </CommandItem>
                                             )}
                                        </CommandGroup>
                                   </>
                              )}
                         </CommandList>
                    </Command>
               </PopoverContent>
          </Popover>
     )
}
