import { Outlet } from '@tanstack/react-router'
import { getCookie } from '@/routes/(lib)/cookies.ts'
import { cn } from '@/routes/(lib)/utils.ts'
import { LayoutProvider } from '@/context/layout-provider.tsx'
import { SearchProvider } from '@/context/search-provider.tsx'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar.tsx'
import { AppSidebar } from '@/routes/(components)/layout/app-sidebar.tsx'
import { SkipToMain } from '@/components/skip-to-main.tsx'

type AuthenticatedLayoutProps = {
  children?: React.ReactNode
}

export function AuthenticatedLayout({ children }: AuthenticatedLayoutProps) {
  const defaultOpen = getCookie('sidebar_state') !== 'false'
  return (
    <SearchProvider>
      <LayoutProvider>
        <SidebarProvider defaultOpen={defaultOpen}>
          <SkipToMain />
          <AppSidebar />
          <SidebarInset
            className={cn(
              // Set content container, so we can use container queries
              '@container/content',

              // If layout is fixed, set the height
              // to 100svh to prevent overflow
              'has-data-[layout=fixed]:h-svh',

              // If layout is fixed and sidebar is inset,
              // set the height to 100svh - spacing (total margins) to prevent overflow
              'peer-data-[variant=inset]:has-data-[layout=fixed]:h-[calc(100svh-(var(--spacing)*4))]'
            )}
          >
            {children ?? <Outlet />}
          </SidebarInset>
        </SidebarProvider>
      </LayoutProvider>
    </SearchProvider>
  )
}
