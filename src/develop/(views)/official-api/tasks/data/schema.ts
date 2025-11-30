/**
 * 导入 Zod 库 - 用于运行时数据验证和类型推断
 * Zod 提供了 TypeScript 优先的模式验证，确保数据类型安全
 */
import { z } from 'zod'

/**
 * 任务数据模型 Schema 定义
 *
 * 设计说明：
 * - 这是一个简化版的非关系型数据结构，适用于演示和开发
 * - 在实际项目中，通常会包含更多字段和复杂的关系结构
 * - 使用 Zod 进行运行时验证，确保数据的完整性和一致性
 *
 * 使用场景：
 * - 表单验证：确保用户输入的数据符合预期格式
 * - API 响应验证：验证后端返回的数据结构
 * - 类型安全：自动推断 TypeScript 类型，避免类型错误
 */
export const taskSchema = z.object({
     /**
      * 任务唯一标识符
      *
      * 格式：字符串类型，通常是 "TASK-" 前缀加数字（如 "TASK-1234"）
      * 用途：在系统中唯一标识一个任务，用于查找、更新和删除操作
      * 示例："TASK-1234", "TASK-5678"
      */
     id: z.string(),

     /**
      * 任务标题
      *
      * 格式：字符串类型，用户可读的任务名称
      * 用途：简要描述任务内容，在列表和详情中显示
      * 建议：长度控制在 10-100 字符，简洁明了地描述任务
      * 示例："修复登录页面Bug", "添加用户导出功能", "更新API文档"
      */
     title: z.string(),

     /**
      * 任务状态
      *
      * 格式：字符串类型，表示任务当前的执行状态
      * 用途：跟踪任务进度，帮助团队了解任务完成情况
      * 取值范围：通常来自预定义的状态列表（见 data.tsx）
      * 可能值："backlog", "todo", "in progress", "done", "canceled"
      *
      * 状态说明：
      * - backlog：待办事项，尚未开始规划
      * - todo：已规划，等待开始执行
      * - in progress：正在执行中
      * - done：已完成，验收通过
      * - canceled：已取消，不再需要执行
      */
     status: z.string(),

     /**
      * 任务标签/分类
      *
      * 格式：字符串类型，用于对任务进行分类
      * 用途：帮助团队快速识别任务类型和性质
      * 取值范围：通常来自预定义的标签列表（见 data.tsx）
      * 可能值："bug", "feature", "documentation"
      *
      * 标签说明：
      * - bug：程序缺陷，需要修复的问题
      * - feature：新功能开发，增强产品功能
      * - documentation：文档相关，改进或补充文档
      */
     label: z.string(),

     /**
      * 任务优先级
      *
      * 格式：字符串类型，表示任务的重要性和紧急程度
      * 用途：帮助团队合理安排工作优先级，优先处理重要任务
      * 取值范围：通常来自预定义的优先级列表（见 data.tsx）
      * 可能值："low", "medium", "high", "critical"
      *
      * 优先级说明：
      * - low：低优先级，有时间时处理
      * - medium：中等优先级，按计划执行
      * - high：高优先级，尽快处理
      * - critical：紧急优先级，立即处理
      */
     priority: z.string(),

     /**
      * 注意：在实际项目中，还可能包含以下字段：
      *
      * assignee: z.string().optional()           // 任务分配人员
      * description: z.string().optional()         // 详细描述
      * dueDate: z.date().optional()               // 截止日期
      * createdAt: z.date()                        // 创建时间
      * updatedAt: z.date()                        // 更新时间
      * completedAt: z.date().optional()          // 完成时间
      * estimatedHours: z.number().optional()      // 预估工时
      * actualHours: z.number().optional()        // 实际工时
      * tags: z.array(z.string()).optional()      // 标签数组
      * attachments: z.array(z.string()).optional() // 附件列表
      * comments: z.array(z.object({...})).optional() // 评论列表
      */
})

/**
 * 任务类型定义
 *
 * 通过 Zod 的类型推断功能，从 taskSchema 自动生成 TypeScript 类型
 * 这确保了类型定义与验证规则的一致性，避免了重复定义
 *
 * 使用优势：
 * 1. 类型安全：编译时检查，避免类型错误
 * 2. 自动推导：类型定义与 Schema 同步更新
 * 3. 智能提示：IDE 提供完整的代码补全和类型检查
 * 4. 重构安全：修改 Schema 时类型自动更新
 *
 * @type {object} 任务对象类型
 */
export type Task = z.infer<typeof taskSchema>

/**
 * 使用示例：
 *
 * ```typescript
 * // 创建一个符合 Task 类型的对象
 * const newTask: Task = {
 *      id: 'TASK-1234',
 *      title: '修复登录页面Bug',
 *      status: 'todo',
 *      label: 'bug',
 *      priority: 'high'
 * }
 *
 * // 验证数据是否符合 schema
 * const validationResult = taskSchema.safeParse(newTask)
 * if (validationResult.success) {
 *      console.log('数据验证通过')
 * } else {
 *      console.log('数据验证失败:', validationResult.error)
 * }
 * ```
 */
