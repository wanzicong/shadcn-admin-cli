import { useState } from 'react'
import { Cross2Icon, MagnifyingGlassIcon } from '@radix-ui/react-icons'
import { type Table } from '@tanstack/react-table'
import { Button } from '@/components/ui/button.tsx'
import { Input } from '@/components/ui/input.tsx'
import { DataTableFacetedFilter } from './faceted-filter.tsx'
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
}

export function DataTableToolbar<TData>({ table, searchPlaceholder = '请输入搜索内容...', searchKey, filters = [] }: DataTableToolbarProps<TData>) {
     const [searchInput, setSearchInput] = useState('')
     const [isSearching, setIsSearching] = useState(false)

     // 执行搜索
     const performSearch = () => {
          setIsSearching(true)

          setTimeout(() => {
               if (searchKey) {
                    table.getColumn(searchKey)?.setFilterValue(searchInput)
               } else {
                    table.setGlobalFilter(searchInput)
               }
               table.resetPageIndex()
               setIsSearching(false)
          }, 300) // 模拟搜索延迟
     }

     // 处理回车键
     const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
          if (event.key === 'Enter') {
               event.preventDefault()
               performSearch()
          }
     }

     // 重置
     const handleReset = () => {
          setSearchInput('')
          table.resetColumnFilters()
          table.setGlobalFilter('')
          table.resetPageIndex()
     }

     const isFiltered = table.getState().columnFilters.length > 0 || table.getState().globalFilter || searchInput.trim() !== ''

     return (
          <div className='flex items-center justify-between'>
               <div className='flex flex-1 flex-col-reverse items-start gap-y-2 sm:flex-row sm:items-center sm:space-x-2'>
                    {/* 搜索区域 */}
                    <div className='flex items-center gap-2'>
                         <div className='relative'>
                              <Input
                                   placeholder={searchPlaceholder}
                                   value={searchInput}
                                   onChange={(e) => setSearchInput(e.target.value)}
                                   onKeyDown={handleKeyDown}
                                   className='h-8 w-[150px] pr-10 pl-8 lg:w-[250px]'
                              />

                              <MagnifyingGlassIcon className='text-muted-foreground absolute top-1/2 left-2 h-4 w-4 -translate-y-1/2' />

                              <Button
                                   size='sm'
                                   variant='secondary'
                                   className='absolute top-1/2 right-1 h-6 w-6 -translate-y-1/2 p-0'
                                   onClick={performSearch}
                                   disabled={isSearching || !searchInput.trim()}
                              >
                                   {isSearching ? (
                                        <div className='h-3 w-3 animate-spin rounded-full border border-t-transparent' />
                                   ) : (
                                        <MagnifyingGlassIcon className='h-3 w-3' />
                                   )}
                              </Button>
                         </div>
                    </div>

                    {/* 过滤器 */}
                    <div className='flex gap-x-2'>
                         {filters.map((filter) => {
                              const column = table.getColumn(filter.columnId)
                              if (!column) return null
                              return <DataTableFacetedFilter key={filter.columnId} column={column} title={filter.title} options={filter.options} />
                         })}
                    </div>

                    {/* 重置按钮 */}
                    {isFiltered && (
                         <Button variant='ghost' onClick={handleReset} className='h-8 px-2 lg:px-3'>
                              重置
                              <Cross2Icon className='ms-2 h-4 w-4' />
                         </Button>
                    )}
               </div>

               <DataTableViewOptions table={table} />
          </div>
     )
}
