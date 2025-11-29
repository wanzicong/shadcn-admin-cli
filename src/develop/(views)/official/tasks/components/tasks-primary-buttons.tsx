import { Download, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button.tsx'
import { useTasks } from '../hooks/use-tasks.tsx'

// 任务主要操作按钮组件 - 提供页面顶部的核心任务操作按钮
export function TasksPrimaryButtons() {
     // 获取任务上下文的状态管理函数
     const { setOpen } = useTasks()

     return (
          // 按钮容器 - 水平排列，控制按钮间距
          <div className='flex gap-2'>
               {/* 导入任务按钮 - 轮廓样式，次要操作 */}
               <Button variant='outline' className='space-x-1' onClick={() => setOpen('import')}>
                    <span>Import</span> <Download size={18} />
               </Button>

               {/* 创建任务按钮 - 填充样式，主要操作 */}
               <Button className='space-x-1' onClick={() => setOpen('create')}>
                    <span>Create</span> <Plus size={18} />
               </Button>
          </div>
     )
}
