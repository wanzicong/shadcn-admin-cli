import { Header } from '@/develop/(layout)/header.tsx'
import { Main } from '@/develop/(layout)/main.tsx'
import { ConfigDrawer } from '@/components/config-drawer.tsx'
import { ProfileDropdown } from '@/components/profile-dropdown.tsx'
import { Search } from '@/components/search.tsx'
import { ThemeSwitch } from '@/components/theme-switch.tsx'
import { TasksDialogs } from './components/dialogs/tasks-dialogs.tsx'
import { TasksPrimaryButtons } from './components/tasks-primary-buttons.tsx'
import { TasksTable } from './components/tasks-table.tsx'
import { TasksProvider } from './context/tasks-provider.tsx'
import { tasks } from '@/develop/(views)/official/tasks/services/data/tasks.ts'

export function Tasks() {
     return (
          <TasksProvider>
               {/* 顶部导航栏 */}
               <Header fixed>
                    <Search />
                    <div className='ms-auto flex items-center space-x-4'>
                         <ThemeSwitch />
                         <ConfigDrawer />
                         <ProfileDropdown />
                    </div>
               </Header>

               {/* 主要内容区域 */}
               <Main className='flex flex-1 flex-col gap-4 sm:gap-6'>
                    {/* 页面标题和操作按钮 */}
                    <div className='flex flex-wrap items-end justify-between gap-2'>
                         <div>
                              <h2 className='text-2xl font-bold tracking-tight'>Tasks</h2>
                              <p className='text-muted-foreground'>Here&apos;s a list of your tasks for this month!</p>
                         </div>
                         <TasksPrimaryButtons />
                    </div>

                    {/* 任务列表 */}
                    <TasksTable data={tasks} />
               </Main>

               {/* 任务弹窗 */}
               <TasksDialogs />
          </TasksProvider>
     )
}
