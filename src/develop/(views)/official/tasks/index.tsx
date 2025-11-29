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
          /**
           * TasksProvider - 任务状态管理上下文
           * 作用：为整个任务模块提供统一的状态管理
           * 管理：对话框状态、当前操作任务、全局任务数据
           * 使用 React Context 模式，避免 prop drilling
           */
          <TasksProvider>
               {/*
                Header - 固定顶部导航栏
                功能：固定在页面顶部，包含全局搜索和系统功能
                布局：左侧搜索框，右侧用户操作按钮组
                样式：fixed 确保滚动时保持可见
               */}
               <Header fixed>
                    {/*
                     全局搜索组件
                     功能：支持跨模块的任务和内容搜索
                     位置：导航栏左侧，便于用户快速访问
                    */}
                    <Search />

                    {/*
                     用户操作按钮组
                     位置：导航栏右侧，自动margin左边距实现右对齐
                     布局：flex布局，items-center实现垂直居中，space-x-4控制间距
                    */}
                    <div className='ms-auto flex items-center space-x-4'>
                         {/* 主题切换按钮 - 支持明暗主题切换 */}
                         <ThemeSwitch />

                         {/* 系统配置抽屉 - 用于配置主题、布局等系统设置 */}
                         <ConfigDrawer />

                         {/* 用户个人资料下拉菜单 - 显示用户信息和登出选项 */}
                         <ProfileDropdown />
                    </div>
               </Header>

               {/*
                Main - 主要内容区域
                样式：flex-1 占据剩余空间，flex-col 垂直布局，gap控制间距
                响应式：sm:gap-6 在小屏幕及以上设备使用更大间距
               */}
               <Main className='flex flex-1 flex-col gap-4 sm:gap-6'>
                    {/*
                     页面头部区域
                     功能：显示页面标题、描述和主要操作按钮
                     布局：flex布局，justify-between实现两端对齐，flex-wrap支持响应式换行
                     间距：gap-2 控制标题区域和按钮区域之间的间距
                    */}
                    <div className='flex flex-wrap items-end justify-between gap-2'>
                         {/*
                          标题和描述区域
                          功能：显示页面标题和副标题说明
                         */}
                         <div>
                              {/*
                               页面主标题
                               内容：Tasks - 表明这是任务管理页面
                               样式：text-2xl大号字体，font-bold粗体，tracking-tight紧致字距
                              */}
                              <h2 className='text-2xl font-bold tracking-tight'>Tasks</h2>

                              {/*
                               页面副标题/描述
                               内容：提示用户这是本月任务列表
                               样式：text-muted-foreground 使用前景色中的次要颜色
                              */}
                              <p className='text-muted-foreground'>Here&apos;s a list of your tasks for this month!</p>
                         </div>

                         {/*
                          主要操作按钮区域
                          功能：提供添加任务、导入任务等主要操作按钮
                          位置：页面头部右侧，与标题区域水平对齐
                         */}
                         <TasksPrimaryButtons />
                    </div>

                    {/*
                     任务数据表格
                     功能：展示任务列表，支持搜索、排序、分页等操作
                     数据：传入模拟的任务数据数组
                     交互：支持行选择、批量操作、任务编辑删除等
                    */}
                    <TasksTable data={tasks} />
               </Main>

               {/*
                任务对话框管理组件
                功能：统一管理所有任务相关的弹窗对话框
                包含：创建/编辑任务抽屉、删除确认对话框、导入对话框等
                位置：Provider内部，确保可以访问全局状态
               */}
               <TasksDialogs />
          </TasksProvider>
     )
}
