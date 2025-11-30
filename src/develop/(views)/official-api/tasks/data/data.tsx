/**
 * 导入 Lucide React 图标库
 * 提供了现代化、可定制的 SVG 图标组件
 * 用于在用户界面中直观地表示不同的任务状态和优先级
 */
import {
     ArrowDown,
     // 向下箭头 - 表示低优先级
     ArrowRight,
     // 向右箭头 - 表示中等优先级
     ArrowUp,
     // 向上箭头 - 表示高优先级
     Circle,
     // 圆圈 - 表示待办状态
     CheckCircle,
     // 勾选圆圈 - 表示完成状态
     AlertCircle,
     // 警告圆圈 - 表示紧急优先级
     Timer,
     // 计时器 - 表示进行中状态
     HelpCircle,
     // 问号圆圈 - 表示待办事项状态
     CircleOff, // 禁用圆圈 - 表示取消状态
} from 'lucide-react'

/**
 * 任务标签配置数据
 *
 * 用途：对任务进行分类管理，帮助团队快速识别任务类型
 * 使用场景：在任务卡片、表格、筛选器中显示任务分类
 * 扩展性：可根据项目需求添加更多标签类型（如 "enhancement", "hotfix", "research"）
 *
 * 数据结构说明：
 * - value: 内部存储值，用于数据库存储和API传输
 * - label: 用户界面显示文本，支持国际化
 *
 * 建议使用模式：
 * - Bug: 程序缺陷修复，通常需要优先处理
 * - Feature: 新功能开发，通常有明确的需求和验收标准
 * - Documentation: 文档相关工作，包括编写、更新、翻译等
 */
export const labels = [
     {
          /**
           * Bug 缺陷标签
           *
           * 说明：用于标记程序中的错误、缺陷或不符合预期行为的问题
           * 优先级：通常较高，可能影响用户体验或系统稳定性
           * 处理方式：需要开发人员进行代码修复和测试验证
           * 示例场景：登录失败、数据计算错误、界面显示异常等
           */
          value: 'bug',
          label: 'Bug',
     },
     {
          /**
           * Feature 功能标签
           *
           * 说明：用于标记新功能开发或功能增强的任务
           * 优先级：根据产品规划和用户需求决定
           * 处理方式：需要完整的需求分析、设计、开发、测试流程
           * 示例场景：添加用户导出功能、实现消息通知、新的报表功能等
           */
          value: 'feature',
          label: 'Feature',
     },
     {
          /**
           * Documentation 文档标签
           *
           * 说明：用于标记与文档相关的任务
           * 优先级：通常较低，但对项目维护和用户帮助很重要
           * 处理方式：需要技术写作能力和对系统的深入理解
           * 示例场景：API文档更新、用户手册编写、代码注释补充等
           */
          value: 'documentation',
          label: 'Documentation',
     },
]

/**
 * 任务状态配置数据
 *
 * 用途：跟踪任务在不同阶段的执行状态，支持敏捷开发流程
 * 使用场景：在任务看板、进度跟踪、状态筛选中使用
 * 可视化：每个状态都配有对应的图标，提供直观的视觉识别
 *
 * 状态流转说明（典型流程）：
 * Backlog → Todo → In Progress → Done
 *    ↓           ↓           ↓
 *  Canceled ← ────┴─── Canceled ←┘
 *
 * 状态转换规则：
 * - 未开始的任务通常在 Backlog 中
 * - 计划执行的任务移至 Todo
 * - 正在执行的任务标记为 In Progress
 * - 完成的任务标记为 Done
 * - 不再需要的任务可以标记为 Canceled
 */
export const statuses = [
     {
          /**
           * 待办事项状态
           *
           * 说明：任务已识别但尚未规划或排期
           * 图标：HelpCircle - 问号圆圈，表示需要进一步规划
           * 位置：通常是任务的初始状态
           * 特征：任务信息可能不够完整，需要进一步细化
           * 适用场景：想法收集、需求待确认、优先级未确定
           */
          label: 'Backlog',
          value: 'backlog' as const,
          icon: HelpCircle,
     },
     {
          /**
           * 待执行状态
           *
           * 说明：任务已规划完成，等待开始执行
           * 图标：Circle - 空心圆圈，表示准备开始但尚未行动
           * 位置：从 Backlog 移动过来的任务，已明确需求和计划
           * 特征：需求清晰，资源分配确定，可以随时开始
           * 适用场景：已分配给具体人员的任务，等待排期开始
           */
          label: 'Todo',
          value: 'todo' as const,
          icon: Circle,
     },
     {
          /**
           * 进行中状态
           *
           * 说明：任务正在执行过程中
           * 图标：Timer - 计时器图标，表示时间正在流逝，工作正在进行
           * 位置：当前正在积极处理的任务
           * 特征：开发人员正在编码，测试人员正在验证，或者正在其他形式的执行
           * 适用场景：代码编写、功能测试、文档编写等执行阶段
           */
          label: 'In Progress',
          value: 'in progress' as const,
          icon: Timer,
     },
     {
          /**
           * 已完成状态
           *
           * 说明：任务已完成并通过验收
           * 图标：CheckCircle - 勾选圆圈，表示任务成功完成
           * 位置：任务生命周期的最终状态
           * 特征：工作成果已交付，质量已验证，可以投入生产使用
           * 适用场景：功能已上线，bug已修复，文档已发布
           */
          label: 'Done',
          value: 'done' as const,
          icon: CheckCircle,
     },
     {
          /**
           * 已取消状态
           *
           * 说明：任务被取消，不再需要执行
           * 图标：CircleOff - 禁用圆圈，表示任务被中止或废弃
           * 位置：任务的中止状态，不再进行后续工作
           * 特征：由于各种原因（需求变更、优先级调整等）决定不再执行
           * 适用场景：需求被取消、技术方案变更、项目方向调整
           */
          label: 'Canceled',
          value: 'canceled' as const,
          icon: CircleOff,
     },
]

/**
 * 任务优先级配置数据
 *
 * 用途：标识任务的重要性和紧急程度，帮助团队合理安排工作顺序
 * 使用场景：在任务排序、资源分配、进度规划中使用
 * 可视化：不同方向的箭头表示不同程度的紧急性和重要性
 *
 * 优先级决策矩阵：
 * 紧急/重要  ── Critical (紧急)
 * 重要/不紧急 ── High (重要)
 * 紧急/不重要  ── Medium (一般)
 * 不紧急/不重要 ── Low (低)
 *
 * 处理建议：
 * - Critical：立即处理，分配最优资源
 * - High：优先处理，合理安排时间
 * - Medium：按计划处理，不影响核心功能
 * - Low：有时间时处理，或考虑延后
 */
export const priorities = [
     {
          /**
           * 低优先级
           *
           * 说明：任务重要性和紧急性都较低
           * 图标：ArrowDown - 向下箭头，表示优先级较低
           * 处理时机：有空闲时间时处理，通常不影响核心功能
           * 特征：改进类任务、优化建议、非必要的功能增强
           * 示例：界面美化、代码优化、文档完善
           */
          label: 'Low',
          value: 'low' as const,
          icon: ArrowDown,
     },
     {
          /**
           * 中等优先级
           *
           * 说明：任务重要性适中，需要按计划处理
           * 图标：ArrowRight - 向右箭头，表示正常流程中的任务
           * 处理时机：按正常工作流程和排期处理
           * 特征：常规的功能开发、计划内的维护工作
           * 示例：新功能开发、常规bug修复、性能优化
           */
          label: 'Medium',
          value: 'medium' as const,
          icon: ArrowRight,
     },
     {
          /**
           * 高优先级
           *
           * 说明：任务重要性高或紧急性高，需要尽快处理
           * 图标：ArrowUp - 向上箭头，表示优先级较高，需要向上关注
           * 处理时机：尽快处理，可能需要调整其他任务排期
           * 特征：影响用户体验、系统稳定性的重要问题
           * 示例：用户反馈的重要bug、关键功能故障、安全漏洞
           */
          label: 'High',
          value: 'high' as const,
          icon: ArrowUp,
     },
     {
          /**
           * 紧急优先级
           *
           * 说明：任务具有最高重要性和紧急性，需要立即处理
           * 图标：AlertCircle - 警告圆圈，表示紧急状态，需要立即关注
           * 处理时机：立即处理，可能需要暂停其他工作，分配最优资源
           * 特征：系统严重故障、安全威胁、数据丢失风险等
           * 示例：生产环境宕机、数据泄露、支付功能故障、用户数据错误
           */
          label: 'Critical',
          value: 'critical' as const,
          icon: AlertCircle,
     },
]

/**
 * 使用示例：
 *
 * ```typescript
 * // 在 React 组件中使用配置数据
 * import { labels, statuses, priorities } from './data.tsx'
 *
 * // 渲染标签选择器
 * <Select>
 *   {labels.map(label => (
 *     <SelectItem key={label.value} value={label.value}>
 *       {label.label}
 *     </SelectItem>
 *   ))}
 * </Select>
 *
 * // 渲染状态图标
 * {statuses.map(status => (
 *   <div key={status.value}>
 *     <status.icon className="w-4 h-4" />
 *     <span>{status.label}</span>
 *   </div>
 * ))}
 *
 * // 获取特定优先级的图标
 * const highPriorityIcon = priorities.find(p => p.value === 'high')?.icon
 * ```
 *
 * 类型安全说明：
 *
 * ```typescript
 * // 使用 const 确保字面量类型而不是 string 类型
 * type Status = 'backlog' | 'todo' | 'in progress' | 'done' | 'canceled'
 * type Priority = 'low' | 'medium' | 'high' | 'critical'
 * type Label = 'bug' | 'feature' | 'documentation'
 * ```
 *
 * 国际化支持：
 *
 * 可以通过创建对应的中文配置数组来支持国际化：
 * ```typescript
 * export const statusesCN = statuses.map(status => ({
 *   ...status,
 *   label: getChineseLabel(status.value) // 获取中文标签
 * }))
 * ```
 */
