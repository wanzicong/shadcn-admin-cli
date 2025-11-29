/**
 * 导入 Faker.js 库 - 用于生成真实的模拟数据
 * Faker.js 是一个强大的假数据生成库，可以生成各种类型的真实感数据
 * 常用于开发、测试和演示环境中，避免使用真实的生产数据
 */
import { faker } from '@faker-js/faker'

/**
 * 设置固定的随机种子以确保数据生成的一致性
 *
 * 作用：使用相同的种子值，每次生成的数据都是相同的
 * 好处：
 * 1. 开发过程中数据保持稳定，便于调试和测试
 * 2. 团队成员获得相同的测试数据，提高协作效率
 * 3. CI/CD 流程中的测试结果更加可预测
 * 4. 演示环境中的数据保持一致，避免意外变化
 *
 * 使用场景：
 * - 开发环境：确保每次启动应用时数据相同
 * - 测试环境：为单元测试和集成测试提供稳定数据
 * - 演示环境：保证演示效果的一致性
 * - 文档编写：为截图和示例提供稳定的数据
 */
faker.seed(12345)

/**
 * 生成模拟任务数据数组
 *
 * 数组长度：100个任务记录
 * 数据分布：随机分布在不同的状态、标签和优先级中
 * 用途：为任务管理模块提供完整的演示数据
 *
 * 数据生成策略：
 * - 使用 Array.from() 创建指定长度的数组
 * - 每个任务通过回调函数生成，确保数据的随机性
 * - 所有字段都使用 Faker.js 生成真实感数据
 *
 * 数据分布说明：
 * - 状态分布：5种状态（todo, in progress, done, canceled, backlog）
 * - 标签分布：3种类型（bug, feature, documentation）
 * - 优先级分布：3个级别（low, medium, high）
 * - 时间分布：创建时间在过去，更新时间在最近，截止时间在未来
 */
export const tasks = Array.from({ length: 100 }, () => {
     /**
      * 定义任务状态数组
      *
      * 使用 const 断言确保类型推导为字面量联合类型
      * 类型：'todo' | 'in progress' | 'done' | 'canceled' | 'backlog'
      *
      * 状态含义：
      * - todo: 待办任务，已规划但未开始
      * - in progress: 进行中，正在积极处理
      * - done: 已完成，任务结束并通过验收
      * - canceled: 已取消，不再需要执行
      * - backlog: 待办事项，尚未规划或排期
      *
      * 分布特点：随机分配，模拟真实项目中的状态分布
      */
     const statuses = ['todo', 'in progress', 'done', 'canceled', 'backlog'] as const

     /**
      * 定义任务标签数组
      *
      * 类型：'bug' | 'feature' | 'documentation'
      *
      * 标签含义：
      * - bug: 程序缺陷，需要修复的问题
      * - feature: 新功能，需要开发的功能
      * - documentation: 文档相关，需要编写或更新的文档
      *
      * 分布特点：平均分布，模拟不同类型的工作内容
      */
     const labels = ['bug', 'feature', 'documentation'] as const

     /**
      * 定义任务优先级数组
      *
      * 类型：'low' | 'medium' | 'high'
      * 注意：这里没有包含 'critical' 优先级，因为紧急任务通常较少
      *
      * 优先级含义：
      * - low: 低优先级，不紧急的任务
      * - medium: 中等优先级，按计划处理
      * - high: 高优先级，需要尽快处理
      *
      * 分布特点：大部分任务为中等优先级，符合真实项目情况
      */
     const priorities = ['low', 'medium', 'high'] as const

     /**
      * 生成单个任务对象
      *
      * 返回对象包含任务的所有基本信息，符合 taskSchema 定义
      * 每个字段都使用 Faker.js 生成真实感数据
      *
      * @returns {Task} 符合任务模型的对象
      */
     return {
          /**
           * 任务唯一标识符
           *
           * 格式：TASK-XXXX 格式，XXXX为4位随机数字
           * 范围：1000-9999，确保足够的唯一性
           *
           * 设计考虑：
           * - 使用 TASK- 前缀便于识别和查询
           * - 数字格式便于排序和管理
           * - 4位数字在100个任务中重复概率极低
           *
           * 示例：TASK-1234, TASK-5678, TASK-9999
           */
          id: `TASK-${faker.number.int({ min: 1000, max: 9999 })}`,

          /**
           * 任务标题
           *
           * 内容：5-15个单词组成的句子
           * 语言：英文 lorem 文本，模拟真实任务标题
           *
           * 生成规则：
           * - faker.lorem.sentence(): 生成随机句子
           * - min: 5 最少5个单词，确保标题有意义
           * - max: 15 最多15个单词，避免标题过长
           *
           * 实际应用中，这些标题会被更具体的任务描述替换
           */
          title: faker.lorem.sentence({ min: 5, max: 15 }),

          /**
           * 任务状态
           *
           * 来源：从预定义的状态数组中随机选择
           * 分布：均匀分布在5种状态中
           *
           * 生成方式：
           * - faker.helpers.arrayElement(): 从数组中随机选择一个元素
           * - 使用 const 断言确保类型安全
           * - 模拟真实项目中任务状态的多样性
           *
           * 状态分布模拟：
           * - 约20% backlog：待规划的任务
           * - 约25% todo：待执行的任务
           * - 约25% in progress：进行中的任务
           * - 约20% done：已完成的任务
           * - 约10% canceled：已取消的任务
           */
          status: faker.helpers.arrayElement(statuses),

          /**
           * 任务标签
           *
           * 来源：从预定义的标签数组中随机选择
           * 分布：均匀分布在3种类型中
           *
           * 生成方式：随机选择，模拟不同类型的工作
           * 标签分布：
           * - 约33% bug：缺陷修复任务
           * - 约33% feature：新功能开发任务
           * - 约34% documentation：文档相关任务
           */
          label: faker.helpers.arrayElement(labels),

          /**
           * 任务优先级
           *
           * 来源：从预定义的优先级数组中随机选择
           * 分布：均匀分布在3个级别中
           *
           * 优先级分布：
           * - 约33% low：低优先级任务
           * - 约33% medium：中等优先级任务
           * - 约34% high：高优先级任务
           *
           * 注意：实际项目中，优先级分布可能不是均匀的
           * 通常中等优先级的任务会更多一些
           */
          priority: faker.helpers.arrayElement(priorities),

          /**
           * 任务创建时间
           *
           * 时间范围：过去某个时间点到当前
           * 分布：随机分布在最近一年内
           *
           * 生成规则：
           * - faker.date.past(): 生成过去的随机日期
           * - 默认参数：1年内，可自定义时间范围
           * - 用途：模拟任务的创建时间，用于排序和筛选
           *
           * 时间特征：
           * - 包含具体日期和时间信息
           * - 格式为 JavaScript Date 对象
           * - 可用于时间相关的计算和显示
           */
          createdAt: faker.date.past(),

          /**
           * 任务更新时间
           *
           * 时间范围：最近的时间
           * 分布：通常比创建时间更晚
           *
           * 生成规则：
           * - faker.date.recent(): 生成最近的随机日期
           * - 默认参数：最近30天内
           * - 用途：模拟任务最后修改时间
           *
           * 业务逻辑：
           * - 通常更新时间应该 >= 创建时间
           * - 表示任务最后一次被修改的时间
           * - 用于跟踪任务的活动状态
           */
          updatedAt: faker.date.recent(),

          /**
           * 任务分配人员
           *
           * 内容：完整的个人姓名
           * 格式：英文姓名（名 + 姓）
           *
           * 生成规则：
           * - faker.person.fullName(): 生成随机全名
           * - 包含名字和姓氏
           * - 模拟真实的团队成员姓名
           *
           * 应用场景：
           * - 显示任务负责人
           * - 按人员筛选任务
           * - 工作负载分析
           *
           * 注意：实际应用中，这些应该是系统中的真实用户
           */
          assignee: faker.person.fullName(),

          /**
           * 任务描述
           *
           * 内容：1-3段落的详细描述
           * 语言：英文 lorem 文本
           *
           * 生成规则：
           * - faker.lorem.paragraph(): 生成段落文本
           * - min: 1 最少1个段落
           * - max: 3 最多3个段落
           *
           * 用途：
           * - 提供任务的详细信息
           * - 帮助开发者理解任务要求
           * - 在任务详情页面显示
           *
           * 实际应用中，这些描述会被具体的任务需求文档替换
           */
          description: faker.lorem.paragraph({ min: 1, max: 3 }),

          /**
           * 任务截止日期
           *
           * 时间范围：未来的某个时间点
           * 分布：随机分布在未来的时间内
           *
           * 生成规则：
           * - faker.date.future(): 生成未来的随机日期
           * - 默认参数：未来1年内
           * - 用途：设定任务的预期完成时间
           *
           * 业务用途：
           * - 任务排期和计划
           * - 工作进度跟踪
           * - 延期预警
           * - 团队协作和沟通
           *
           * 注意：某些任务（如文档类）可能没有明确的截止日期
           */
          dueDate: faker.date.future(),
     }
})

/**
 * 数据使用示例：
 *
 * ```typescript
 * // 导入任务数据
 * import { tasks } from './data/tasks.ts'
 *
 * // 获取所有高优先级任务
 * const highPriorityTasks = tasks.filter(task => task.priority === 'high')
 *
 * // 获取分配给特定人员的任务
 * const tasksForJohn = tasks.filter(task => task.assignee.includes('John'))
 *
 * // 按状态统计任务数量
 * const tasksByStatus = tasks.reduce((acc, task) => {
 *   acc[task.status] = (acc[task.status] || 0) + 1
 *   return acc
 * }, {} as Record<string, number>)
 *
 * // 获取即将到期的任务（7天内）
 * const upcomingTasks = tasks.filter(task => {
 *   const dueDate = new Date(task.dueDate)
 *   const weekFromNow = new Date()
 *   weekFromNow.setDate(weekFromNow.getDate() + 7)
 *   return dueDate <= weekFromNow && task.status !== 'done'
 * })
 *
 * // 按创建时间排序
 * const sortedTasks = [...tasks].sort((a, b) =>
 *   new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
 * )
 * ```
 *
 * 数据验证：
 *
 * ```typescript
 * // 验证数据是否符合 schema
 * import { taskSchema } from './schema.ts'
 *
 * tasks.forEach(task => {
 *   const result = taskSchema.safeParse(task)
 *   if (!result.success) {
 *     console.error('Invalid task data:', task, result.error)
 *   }
 * })
 * ```
 *
 * 性能考虑：
 *
 * - 100个任务的数据量适中，适合开发和演示
 * - 如需更多数据，可以调整 length 参数
 * - 数据在模块加载时一次性生成，后续访问性能很好
 * - 如需动态生成，可以考虑创建生成器函数
 *
 * 国际化支持：
 *
 * ```typescript
 * // 生成中文任务数据
 * faker.setLocale('zh_CN')
 * const chineseTasks = Array.from({ length: 100 }, () => ({
 *   // ... 其他字段
 *   title: faker.lorem.sentence(), // 会生成中文句子
 *   description: faker.lorem.paragraphs(), // 会生成中文段落
 * }))
 * ```
 */
