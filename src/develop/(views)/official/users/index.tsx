import { getRouteApi } from '@tanstack/react-router'
import { Header } from '@/develop/(layout)/header.tsx'
import { Main } from '@/develop/(layout)/main.tsx'
import { ConfigDrawer } from '@/components/config-drawer.tsx'
import { ProfileDropdown } from '@/components/profile-dropdown.tsx'
import { Search } from '@/components/search.tsx'
import { ThemeSwitch } from '@/components/theme-switch.tsx'
import { UsersDialogs } from './components/dialogs/users-dialogs.tsx'
import { UsersPrimaryButtons } from './components/users-primary-buttons.tsx'
import { UsersTable } from './components/users-table.tsx'
import { UsersProvider } from './context/users-provider.tsx'
import { users } from './data/users.ts'

const route = getRouteApi('/_authenticated/official/users/')

export function Users() {
     const search = route.useSearch()
     const navigate = route.useNavigate()

     return (
          <UsersProvider>
               <Header fixed>
                    <Search />
                    <div className='ms-auto flex items-center space-x-4'>
                         <ThemeSwitch />
                         <ConfigDrawer />
                         <ProfileDropdown />
                    </div>
               </Header>

               <Main className='flex flex-1 flex-col gap-4 sm:gap-6'>
                    <div className='flex flex-wrap items-end justify-between gap-2'>
                         <div>
                              <h2 className='text-2xl font-bold tracking-tight'>User List</h2>
                              <p className='text-muted-foreground'>Manage your users and their roles here.</p>
                         </div>
                         <UsersPrimaryButtons />
                    </div>
                    <UsersTable data={users} search={search} navigate={navigate} />
               </Main>

               <UsersDialogs />
          </UsersProvider>
     )
}
