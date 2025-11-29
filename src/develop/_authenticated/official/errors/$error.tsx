import { createFileRoute } from '@tanstack/react-router'
import { Header } from '@/develop/(layout)/header.tsx'
import { ForbiddenError } from '@/develop/(views)/official/errors/forbidden.tsx'
import { GeneralError } from '@/develop/(views)/official/errors/general-error.tsx'
import { MaintenanceError } from '@/develop/(views)/official/errors/maintenance-error.tsx'
import { NotFoundError } from '@/develop/(views)/official/errors/not-found-error.tsx'
import { UnauthorisedError } from '@/develop/(views)/official/errors/unauthorized-error.tsx'
import { ConfigDrawer } from '@/components/config-drawer.tsx'
import { ProfileDropdown } from '@/components/profile-dropdown.tsx'
import { Search } from '@/components/search.tsx'
import { ThemeSwitch } from '@/components/theme-switch.tsx'

export const Route = createFileRoute('/_authenticated/official/errors/$error')({
     component: RouteComponent,
})

function RouteComponent() {
     const { error } = Route.useParams()

     const errorMap: Record<string, React.ComponentType> = {
          unauthorized: UnauthorisedError,
          forbidden: ForbiddenError,
          'not-found': NotFoundError,
          'internal-server-error': GeneralError,
          'maintenance-error': MaintenanceError,
     }
     const ErrorComponent = errorMap[error] || NotFoundError

     return (
          <>
               <Header fixed className='border-b'>
                    <Search />
                    <div className='ms-auto flex items-center space-x-4'>
                         <ThemeSwitch />
                         <ConfigDrawer />
                         <ProfileDropdown />
                    </div>
               </Header>
               <div className='flex-1 [&>div]:h-full'>
                    <ErrorComponent />
               </div>
          </>
     )
}
