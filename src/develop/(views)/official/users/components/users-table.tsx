// Import React hooks for state management and side effects
import { useEffect, useState } from 'react'

// Import TanStack Table utilities for building powerful data tables
import {
     type SortingState,              // Type for table sorting state
     type VisibilityState,           // Type for column visibility state
     flexRender,                     // Utility to render table cell content
     getCoreRowModel,                // Core row model for basic table functionality
     getFacetedRowModel,             // Row model for faceted filtering (counts)
     getFacetedUniqueValues,         // Utility for getting unique values for filters
     getFilteredRowModel,            // Row model for filtering functionality
     getPaginationRowModel,          // Row model for pagination
     getSortedRowModel,              // Row model for sorting
     useReactTable,                  // Main hook for creating table instance
} from '@tanstack/react-table'

// Import shared data table components
import { DataTablePagination, DataTableToolbar } from '@/develop/(components)/data-table'

// Import custom hook for URL state management
import { type NavigateFn, useTableUrlState } from '@/develop/(hooks)/use-table-url-state.ts'

// Import utility functions
import { cn } from '@/develop/(lib)/utils.ts'

// Import UI components from Shadcn
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table.tsx'

// Import data types and mock data
import { roles } from '../data/data.ts'
import { type User } from '../data/schema.ts'

// Import component-specific components
import { DataTableBulkActions } from './data-table-bulk-actions.tsx'
import { usersColumns as columns } from './users-columns.tsx'

// Component props interface
type DataTableProps = {
     data: User[]                     // Array of user data to display
     search: Record<string, unknown>  // URL search parameters from route
     navigate: NavigateFn            // Navigation function for URL updates
}

/**
 * UsersTable - A comprehensive data table component for managing users
 * Features: sorting, filtering, pagination, row selection, and URL state synchronization
 */
export function UsersTable({ data, search, navigate }: DataTableProps) {
     // ============= LOCAL UI STATES =============
     // These states are managed locally and not synced with URL

     // Row selection state - tracks which rows are currently selected
     const [rowSelection, setRowSelection] = useState({})

     // Column visibility state - controls which columns are visible/hidden
     const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})

     // Sorting state - manages column sorting (column id + direction)
     const [sorting, setSorting] = useState<SortingState>([])

     // ============= LOCAL-ONLY STATES (DISABLED) =============
     // Uncomment to use local state instead of URL-synced state
     // const [columnFilters, onColumnFiltersChange] = useState<ColumnFiltersState>([])
     // const [pagination, onPaginationChange] = useState<PaginationState>({ pageIndex: 0, pageSize: 10 })

     // ============= URL-SYNCED STATES =============
     // These states are automatically synchronized with URL search parameters
     // This enables shareable URLs that preserve table state across browser sessions

     const { columnFilters, onColumnFiltersChange, pagination, onPaginationChange, ensurePageInRange } = useTableUrlState({
          search,                            // Current URL search parameters
          navigate,                          // Navigation function for URL updates
          pagination: {
               defaultPage: 1,               // Default page number
               defaultPageSize: 10           // Default page size (rows per page)
          },
          globalFilter: {
               enabled: false                // Disable global search filtering
          },
          columnFilters: [
               // Define column filters that sync with URL parameters
               // username filter: text-based search
               { columnId: 'username', searchKey: 'username', type: 'string' },

               // status filter: array-based multi-select (e.g., ?status=active&status=inactive)
               { columnId: 'status', searchKey: 'status', type: 'array' },

               // role filter: array-based multi-select (e.g., ?role=admin&role=user)
               { columnId: 'role', searchKey: 'role', type: 'array' },
          ],
     })

     // ============= TABLE INSTANCE CREATION =============
     // Create the main table instance with TanStack Table
     // Note: ESLint rule disabled because this hook is used correctly but triggers
     // a false positive with the react-hooks-incompatible-library rule
     // eslint-disable-next-line react-hooks/incompatible-library
     const table = useReactTable({
          data,                             // User data array
          columns,                          // Column definitions from users-columns.tsx
          state: {
               sorting,                     // Current sorting state
               pagination,                  // Current pagination state (URL-synced)
               rowSelection,                // Selected rows state
               columnFilters,               // Column filters state (URL-synced)
               columnVisibility,            // Column visibility state
          },
          enableRowSelection: true,         // Enable row selection functionality
          onPaginationChange,              // Handler for pagination changes (updates URL)
          onColumnFiltersChange,            // Handler for column filter changes (updates URL)
          onRowSelectionChange: setRowSelection,  // Handler for row selection changes
          onSortingChange: setSorting,      // Handler for sorting changes
          onColumnVisibilityChange: setColumnVisibility, // Handler for column visibility changes
          getPaginationRowModel: getPaginationRowModel(), // Enable pagination
          getCoreRowModel: getCoreRowModel(),           // Core table functionality
          getFilteredRowModel: getFilteredRowModel(),   // Enable filtering
          getSortedRowModel: getSortedRowModel(),       // Enable sorting
          getFacetedRowModel: getFacetedRowModel(),     // Enable faceted filtering (counts)
          getFacetedUniqueValues: getFacetedUniqueValues(), // Enable unique value extraction
     })

     // ============= PAGE VALIDATION =============
     // Ensure current page is within valid range when table state changes
     // This prevents users from landing on invalid pages after filters change
     useEffect(() => {
          ensurePageInRange(table.getPageCount())
     }, [table, ensurePageInRange])

     // ============= RENDER =============
     return (
          <div
               className={cn(
                    // Add margin bottom on mobile when toolbar is visible
                    // This prevents the toolbar from covering the table content
                    'max-sm:has-[div[role="toolbar"]]:mb-16',
                    'flex flex-1 flex-col gap-4'
               )}
          >
               {/* ============= TABLE TOOLBAR =============
                   - Global search input
                   - Column filter dropdowns (Status, Role)
                   - Column visibility toggle
                   - Clear filters button */}
               <DataTableToolbar
                    table={table}
                    searchPlaceholder='Filter users...'
                    searchKey='username'             // Column to search when using global search
                    filters={[
                         {
                              columnId: 'status',      // Status column filter
                              title: 'Status',         // Filter title in dropdown
                              options: [
                                   { label: 'Active', value: 'active' },
                                   { label: 'Inactive', value: 'inactive' },
                                   { label: 'Invited', value: 'invited' },
                                   { label: 'Suspended', value: 'suspended' },
                              ],
                         },
                         {
                              columnId: 'role',        // Role column filter
                              title: 'Role',           // Filter title in dropdown
                              options: roles.map((role) => ({ ...role })), // Use roles from data.ts
                         },
                    ]}
               />

               {/* ============= DATA TABLE ============= */}
               <div className='overflow-hidden rounded-md border'>
                    <Table>
                         {/* ============= TABLE HEADER ============= */}
                         <TableHeader>
                              {table.getHeaderGroups().map((headerGroup) => (
                                   <TableRow key={headerGroup.id} className='group/row'>
                                        {headerGroup.headers.map((header) => {
                                             return (
                                                  <TableHead
                                                       key={header.id}
                                                       colSpan={header.colSpan}
                                                       className={cn(
                                                            // Dynamic background colors based on state:
                                                            // - Regular: bg-background
                                                            // - Row hover: group-hover/row:bg-muted
                                                            // - Row selected: group-data-[state=selected]/row:bg-muted
                                                            'bg-background group-hover/row:bg-muted group-data-[state=selected]/row:bg-muted',
                                                            // Apply custom classes from column definitions
                                                            header.column.columnDef.meta?.className,
                                                            header.column.columnDef.meta?.thClassName
                                                       )}
                                                  >
                                                       {/* Render column header (sortable, resizble, etc) */}
                                                       {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                                                  </TableHead>
                                             )
                                        })}
                                   </TableRow>
                              ))}
                         </TableHeader>

                         {/* ============= TABLE BODY ============= */}
                         <TableBody>
                              {table.getRowModel().rows?.length ? (
                                   // Render data rows when available
                                   table.getRowModel().rows.map((row) => (
                                        <TableRow
                                             key={row.id}
                                             data-state={row.getIsSelected() && 'selected'}
                                             className='group/row'
                                        >
                                             {row.getVisibleCells().map((cell) => (
                                                  <TableCell
                                                       key={cell.id}
                                                       className={cn(
                                                            // Dynamic background colors matching header pattern
                                                            'bg-background group-hover/row:bg-muted group-data-[state=selected]/row:bg-muted',
                                                            // Apply custom classes from column definitions
                                                            cell.column.columnDef.meta?.className,
                                                            cell.column.columnDef.meta?.tdClassName
                                                       )}
                                                  >
                                                       {/* Render cell content (data, actions, etc) */}
                                                       {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                                  </TableCell>
                                             ))}
                                        </TableRow>
                                   ))
                              ) : (
                                   // Show empty state when no data matches filters
                                   <TableRow>
                                        <TableCell colSpan={columns.length} className='h-24 text-center'>
                                             No results.
                                        </TableCell>
                                   </TableRow>
                              )}
                         </TableBody>
                    </Table>
               </div>

               {/* ============= TABLE PAGINATION ============= */}
               {/* Shows: Page navigation, rows per page selector, row count */}
               <DataTablePagination table={table} className='mt-auto' />

               {/* ============= BULK ACTIONS ============= */}
               {/* Appears when rows are selected, provides actions like delete, edit */}
               <DataTableBulkActions table={table} />
          </div>
     )
}