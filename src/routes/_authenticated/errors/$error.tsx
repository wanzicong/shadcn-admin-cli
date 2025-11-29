import { createFileRoute } from '@tanstack/react-router'
import { Header } from '@/routes/(components)/layout/header'
import { ForbiddenError } from '@/routes/(views)/errors/forbidden'
import { GeneralError } from '@/routes/(views)/errors/general-error'
import { MaintenanceError } from '@/routes/(views)/errors/maintenance-error'
import { NotFoundError } from '@/routes/(views)/errors/not-found-error'
import { UnauthorisedError } from '@/routes/(views)/errors/unauthorized-error'
import { ConfigDrawer } from '@/components/config-drawer'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'

export const Route = createFileRoute('/_authenticated/errors/$error')({
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
