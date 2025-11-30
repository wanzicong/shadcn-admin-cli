import { faker } from '@faker-js/faker'

// 设置固定种子值，确保每次生成相同的模拟数据，便于开发和测试
faker.seed(67890)

// 生成500个模拟用户数据，用于展示数据表格功能
export const users = Array.from({ length: 500 }, () => {
     // 随机生成用户姓名
     const firstName = faker.person.firstName()
     const lastName = faker.person.lastName()

     return {
          // 生成唯一标识符
          id: faker.string.uuid(),
          // 使用生成的姓名
          firstName,
          lastName,
          // 基于姓名生成用户名，并转换为小写
          username: faker.internet.username({ firstName, lastName }).toLocaleLowerCase(),
          // 基于名字生成邮箱地址，并转换为小写
          email: faker.internet.email({ firstName }).toLocaleLowerCase(),
          // 生成国际格式的电话号码
          phoneNumber: faker.phone.number({ style: 'international' }),
          // 随机分配用户状态，模拟真实的用户分布
          status: faker.helpers.arrayElement(['active', 'inactive', 'invited', 'suspended']),
          // 随机分配用户角色，模拟不同的权限级别
          role: faker.helpers.arrayElement(['superadmin', 'admin', 'cashier', 'manager']),
          // 生成过去的创建时间
          createdAt: faker.date.past(),
          // 生成最近的更新时间
          updatedAt: faker.date.recent(),
     }
})
