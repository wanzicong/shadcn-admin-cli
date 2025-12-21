import { useMemo, useState } from 'react'
import type { ColumnFiltersState, OnChangeFn, PaginationState, SortingState } from '@tanstack/react-table'

type SearchRecord = Record<string, unknown>

export type NavigateFn = (opts: { search: true | SearchRecord | ((prev: SearchRecord) => Partial<SearchRecord> | SearchRecord); replace?: boolean }) => void

type UseTableUrlStateParams = {
     search: SearchRecord
     navigate: NavigateFn
     pagination?: {
          pageKey?: string
          pageSizeKey?: string
          defaultPage?: number
          defaultPageSize?: number
     }
     globalFilter?: {
          enabled?: boolean
          key?: string
          trim?: boolean
     }
     columnFilters?: Array<
          | {
                 columnId: string
                 searchKey: string
                 type?: 'string'
                 serialize?: (value: unknown) => unknown
                 deserialize?: (value: unknown) => unknown
            }
          | {
                 columnId: string
                 searchKey: string
                 type: 'array'
                 serialize?: (value: unknown) => unknown
                 deserialize?: (value: unknown) => unknown
            }
     >
     sorting?: {
          enabled?: boolean
          sortByKey?: string
          sortOrderKey?: string
          defaultSortBy?: string
          defaultSortOrder?: 'asc' | 'desc'
          // 支持多列排序
          multiSort?: {
               enabled?: boolean
               key?: string
               separator?: string
          }
     }
}

type UseTableUrlStateReturn = {
     // Global filter
     globalFilter?: string
     onGlobalFilterChange?: OnChangeFn<string>
     // Column filters
     columnFilters: ColumnFiltersState
     onColumnFiltersChange: OnChangeFn<ColumnFiltersState>
     // Pagination
     pagination: PaginationState
     onPaginationChange: OnChangeFn<PaginationState>
     // Sorting
     sorting: SortingState
     onSortingChange: OnChangeFn<SortingState>
     // Helpers
     ensurePageInRange: (pageCount: number, opts?: { resetTo?: 'first' | 'last' }) => void
}

export function useTableUrlState(params: UseTableUrlStateParams): UseTableUrlStateReturn {
     const {
          search,
          navigate,
          pagination: paginationCfg,
          globalFilter: globalFilterCfg,
          columnFilters: columnFiltersCfg = [],
          sorting: sortingCfg = {},
     } = params

     // ============= 分页配置 =============
     const pageKey = paginationCfg?.pageKey ?? ('page' as string)
     const pageSizeKey = paginationCfg?.pageSizeKey ?? ('pageSize' as string)
     const defaultPage = paginationCfg?.defaultPage ?? 1
     const defaultPageSize = paginationCfg?.defaultPageSize ?? 10

     // ============= 全局筛选配置 =============
     const globalFilterKey = globalFilterCfg?.key ?? ('filter' as string)
     const globalFilterEnabled = globalFilterCfg?.enabled ?? true
     const trimGlobal = globalFilterCfg?.trim ?? true

     // ============= 排序配置 =============
     const sortingEnabled = sortingCfg.enabled ?? true
     const sortByKey = sortingCfg.sortByKey ?? ('sort_by' as string)
     const sortOrderKey = sortingCfg.sortOrderKey ?? ('sort_order' as string)
     const defaultSortBy = sortingCfg.defaultSortBy
     const defaultSortOrder = sortingCfg.defaultSortOrder ?? 'asc'
     const multiSortEnabled = sortingCfg.multiSort?.enabled ?? false
     const multiSortKey = sortingCfg.multiSort?.key ?? ('sort' as string)
     const multiSortSeparator = sortingCfg.multiSort?.separator ?? ','

     // ============= 列筛选初始化 =============
     const initialColumnFilters: ColumnFiltersState = useMemo(() => {
          const collected: ColumnFiltersState = []
          for (const cfg of columnFiltersCfg) {
               const raw = (search as SearchRecord)[cfg.searchKey]
               const deserialize = cfg.deserialize ?? ((v: unknown) => v)
               if (cfg.type === 'string') {
                    const value = (deserialize(raw) as string) ?? ''
                    if (typeof value === 'string' && value.trim() !== '') {
                         collected.push({ id: cfg.columnId, value })
                    }
               } else {
                    // default to array type
                    const value = (deserialize(raw) as unknown[]) ?? []
                    if (Array.isArray(value) && value.length > 0) {
                         collected.push({ id: cfg.columnId, value })
                    }
               }
          }
          return collected
     }, [columnFiltersCfg, search])

     const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>(initialColumnFilters)

     // ============= 分页初始化 =============
     const pagination: PaginationState = useMemo(() => {
          const rawPage = (search as SearchRecord)[pageKey]
          const rawPageSize = (search as SearchRecord)[pageSizeKey]
          const pageNum = typeof rawPage === 'number' ? rawPage : defaultPage
          const pageSizeNum = typeof rawPageSize === 'number' ? rawPageSize : defaultPageSize
          return { pageIndex: Math.max(0, pageNum - 1), pageSize: pageSizeNum }
     }, [search, pageKey, pageSizeKey, defaultPage, defaultPageSize])

     const onPaginationChange: OnChangeFn<PaginationState> = (updater) => {
          const next = typeof updater === 'function' ? updater(pagination) : updater
          const nextPage = next.pageIndex + 1
          const nextPageSize = next.pageSize
          navigate({
               search: (prev) => ({
                    ...(prev as SearchRecord),
                    [pageKey]: nextPage <= defaultPage ? undefined : nextPage,
                    [pageSizeKey]: nextPageSize === defaultPageSize ? undefined : nextPageSize,
               }),
          })
     }

     // ============= 全局筛选初始化 =============
     const [globalFilter, setGlobalFilter] = useState<string | undefined>(() => {
          if (!globalFilterEnabled) return undefined
          const raw = (search as SearchRecord)[globalFilterKey]
          return typeof raw === 'string' ? raw : ''
     })

     const onGlobalFilterChange: OnChangeFn<string> | undefined = globalFilterEnabled
          ? (updater) => {
                 const next = typeof updater === 'function' ? updater(globalFilter ?? '') : updater
                 const value = trimGlobal ? next.trim() : next
                 setGlobalFilter(value)
                 navigate({
                      search: (prev) => ({
                           ...(prev as SearchRecord),
                           [pageKey]: undefined,
                           [globalFilterKey]: value ? value : undefined,
                      }),
                 })
            }
          : undefined

     // ============= 列筛选变化处理 =============
     const onColumnFiltersChange: OnChangeFn<ColumnFiltersState> = (updater) => {
          const next = typeof updater === 'function' ? updater(columnFilters) : updater
          setColumnFilters(next)

          const patch: Record<string, unknown> = {}

          for (const cfg of columnFiltersCfg) {
               const found = next.find((f) => f.id === cfg.columnId)
               const serialize = cfg.serialize ?? ((v: unknown) => v)
               if (cfg.type === 'string') {
                    const value = typeof found?.value === 'string' ? (found.value as string) : ''
                    patch[cfg.searchKey] = value.trim() !== '' ? serialize(value) : undefined
               } else {
                    const value = Array.isArray(found?.value) ? (found!.value as unknown[]) : []
                    patch[cfg.searchKey] = value.length > 0 ? serialize(value) : undefined
               }
          }

          navigate({
               search: (prev) => ({
                    ...(prev as SearchRecord),
                    [pageKey]: undefined,
                    ...patch,
               }),
          })
     }

     // ============= 排序初始化 =============
     const sorting: SortingState = useMemo(() => {
          if (!sortingEnabled) return []

          if (multiSortEnabled) {
               // 多列排序模式
               const rawSort = (search as SearchRecord)[multiSortKey]
               if (typeof rawSort === 'string' && rawSort.trim() !== '') {
                    const sortItems = rawSort.split(multiSortSeparator)
                    return sortItems
                         .map((item) => {
                              const match = item.match(/^(-?)(.+)$/)
                              if (match) {
                                   const [_, direction, column] = match
                                   return {
                                        id: column,
                                        desc: direction === '-',
                                   }
                              }
                              return null
                         })
                         .filter(Boolean) as SortingState
               }
               return []
          } else {
               // 单列排序模式
               const rawSortBy = (search as SearchRecord)[sortByKey]
               const rawSortOrder = (search as SearchRecord)[sortOrderKey]

               const sortBy = typeof rawSortBy === 'string' ? rawSortBy : defaultSortBy
               const sortOrder = typeof rawSortOrder === 'string' ? (rawSortOrder.toLowerCase() === 'desc' ? 'desc' : 'asc') : defaultSortOrder

               if (!sortBy) return []

               return [
                    {
                         id: sortBy,
                         desc: sortOrder === 'desc',
                    },
               ]
          }
     }, [search, sortingEnabled, multiSortEnabled, multiSortKey, multiSortSeparator, sortByKey, sortOrderKey, defaultSortBy, defaultSortOrder])

     // ============= 排序变化处理 =============
     const onSortingChange: OnChangeFn<SortingState> = (updater) => {
          if (!sortingEnabled) return

          const next = typeof updater === 'function' ? updater(sorting) : updater

          if (multiSortEnabled) {
               // 多列排序：转换为 "-column1,column2" 格式
               const sortString = next.map((sort) => `${sort.desc ? '-' : ''}${sort.id}`).join(multiSortSeparator)

               navigate({
                    search: (prev) => ({
                         ...(prev as SearchRecord),
                         [pageKey]: undefined, // 重置页码
                         [multiSortKey]: sortString || undefined,
                         // 清理单列排序参数（如果存在）
                         ...(sortByKey && { [sortByKey]: undefined }),
                         ...(sortOrderKey && { [sortOrderKey]: undefined }),
                    }),
               })
          } else {
               // 单列排序
               const newSort = next.length > 0 ? next[0] : null

               navigate({
                    search: (prev) => ({
                         ...(prev as SearchRecord),
                         [pageKey]: undefined, // 重置页码
                         [sortByKey]: newSort?.id || undefined,
                         [sortOrderKey]: newSort ? (newSort.desc ? 'desc' : 'asc') : undefined,
                         // 清理多列排序参数（如果存在）
                         ...(multiSortKey && { [multiSortKey]: undefined }),
                    }),
               })
          }
     }

     // ============= 辅助函数 =============
     const ensurePageInRange = (pageCount: number, opts: { resetTo?: 'first' | 'last' } = { resetTo: 'first' }) => {
          const currentPage = (search as SearchRecord)[pageKey]
          const pageNum = typeof currentPage === 'number' ? currentPage : defaultPage
          if (pageCount > 0 && pageNum > pageCount) {
               navigate({
                    replace: true,
                    search: (prev) => ({
                         ...(prev as SearchRecord),
                         [pageKey]: opts.resetTo === 'last' ? pageCount : undefined,
                    }),
               })
          }
     }

     // ============= 返回值 =============
     return {
          globalFilter: globalFilterEnabled ? (globalFilter ?? '') : undefined,
          onGlobalFilterChange,
          columnFilters,
          onColumnFiltersChange,
          pagination,
          onPaginationChange,
          sorting,
          onSortingChange,
          ensurePageInRange,
     }
}

// ============= 辅助函数：排序状态转换 =============
/**
 * 将排序状态转换为查询参数对象
 */
export function sortingToQueryParams(
     sorting: SortingState,
     options?: {
          sortByKey?: string
          sortOrderKey?: string
          multiSortKey?: string
          multiSortSeparator?: string
          multiSortEnabled?: boolean
     }
): Record<string, unknown> {
     const { sortByKey = 'sort_by', sortOrderKey = 'sort_order', multiSortKey = 'sort', multiSortSeparator = ',', multiSortEnabled = false } = options || {}

     if (!sorting || sorting.length === 0) {
          return {}
     }

     if (multiSortEnabled) {
          // 多列排序
          const sortString = sorting.map((sort) => `${sort.desc ? '-' : ''}${sort.id}`).join(multiSortSeparator)

          return {
               [multiSortKey]: sortString,
          }
     } else {
          // 单列排序
          const firstSort = sorting[0]
          return {
               [sortByKey]: firstSort.id,
               [sortOrderKey]: firstSort.desc ? 'desc' : 'asc',
          }
     }
}

/**
 * 从查询参数解析排序状态
 */
export function queryParamsToSorting(
     search: SearchRecord,
     options?: {
          sortByKey?: string
          sortOrderKey?: string
          multiSortKey?: string
          multiSortSeparator?: string
          multiSortEnabled?: boolean
     }
): SortingState {
     const { sortByKey = 'sort_by', sortOrderKey = 'sort_order', multiSortKey = 'sort', multiSortSeparator = ',', multiSortEnabled = false } = options || {}

     if (multiSortEnabled) {
          // 多列排序
          const rawSort = search[multiSortKey]
          if (typeof rawSort === 'string' && rawSort.trim() !== '') {
               const sortItems = rawSort.split(multiSortSeparator)
               return sortItems
                    .map((item) => {
                         const match = item.match(/^(-?)(.+)$/)
                         if (match) {
                              const [_, direction, column] = match
                              return {
                                   id: column,
                                   desc: direction === '-',
                              }
                         }
                         return null
                    })
                    .filter(Boolean) as SortingState
          }
          return []
     } else {
          // 单列排序
          const rawSortBy = search[sortByKey]
          const rawSortOrder = search[sortOrderKey]

          if (typeof rawSortBy !== 'string' || !rawSortBy.trim()) {
               return []
          }

          const sortOrder = typeof rawSortOrder === 'string' ? (rawSortOrder.toLowerCase() === 'desc' ? 'desc' : 'asc') : 'asc'

          return [
               {
                    id: rawSortBy.trim(),
                    desc: sortOrder === 'desc',
               },
          ]
     }
}
