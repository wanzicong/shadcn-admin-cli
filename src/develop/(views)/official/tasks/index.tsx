import { Header } from '@/develop/(layout)/header.tsx'
import { Main } from '@/develop/(layout)/main.tsx'
import { ConfigDrawer } from '@/components/config-drawer.tsx'
import { ProfileDropdown } from '@/components/profile-dropdown.tsx'
import { Search } from '@/components/search.tsx'
import { ThemeSwitch } from '@/components/theme-switch.tsx'
import { TasksDialogs } from './components/tasks-dialogs.tsx'
import { TasksPrimaryButtons } from './components/tasks-primary-buttons.tsx'
import { TasksProvider } from './components/tasks-provider.tsx'
import { TasksTable } from './components/tasks-table.tsx'
import { tasks } from './data/tasks.ts'

export function Tasks() {
     return (
          <TasksProvider>
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
                              <h2 className='text-2xl font-bold tracking-tight'>Tasks</h2>
                              <p className='text-muted-foreground'>Here&apos;s a list of your tasks for this month!</p>
                         </div>
                         <TasksPrimaryButtons />
                    </div>
                    <TasksTable data={tasks} />
               </Main>

               <TasksDialogs />
          </TasksProvider>
     )
}
