/**
 * 主内容区域组件
 *
 * 为页面提供主要内容区域的布局容器
 *
 * 特性：
 * - 支持固定布局模式，使用 flexbox 布局
 * - 可选流体布局或固定宽度布局
 * - 响应式设计，支持容器查询
 *
 * @component
 * @param fixed - 是否启用固定布局模式，默认 false
 * @param className - 自定义 CSS 类名
 * @param fluid - 是否使用流体布局（无最大宽度限制），默认 true
 * @param props - 其他 main 元素属性
 * @returns {JSX.Element} 主内容区域
 */
import { cn } from '@/develop/(lib)/utils.ts'

type MainProps = React.HTMLAttributes<HTMLElement> & {
     fixed?: boolean
     fluid?: boolean
     ref?: React.Ref<HTMLElement>
}

export function Main({ fixed, className, fluid, ...props }: MainProps) {
     return (
          <main
               // 设置布局模式标识，用于 CSS 选择器
               data-layout={fixed ? 'fixed' : 'auto'}
               className={cn(
                    'px-4 py-6', // 基础内边距

                    // 固定布局模式：使用 flexbox 布局，垂直方向增长，隐藏溢出
                    fixed && 'flex grow flex-col overflow-hidden',

                    // 非流体布局：设置最大宽度限制（已注释，可根据需要启用）
                    // !fluid && '@7xl/content:mx-auto @7xl/content:w-full @7xl/content:max-w-7xl',
                    className
               )}
               {...props}
          />
     )
}
