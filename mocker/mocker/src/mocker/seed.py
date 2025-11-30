"""
种子数据脚本
用于初始化数据库中的基础数据
"""

from sqlalchemy.orm import Session
from .database import SessionLocal, engine
from .models import User, Task, Base
from .schemas import UserStatus, UserRole, TaskStatus, TaskLabel, TaskPriority
from .utils import generate_uuid, generate_task_id, get_password_hash
import json
from datetime import datetime, timedelta


def create_sample_users(db: Session):
    """创建示例用户数据"""
    users_data = [
        {
            "id": generate_uuid(),
            "firstName": "超级",
            "lastName": "管理员",
            "username": "superadmin",
            "email": "superadmin@example.com",
            "phoneNumber": "13900000001",
            "hashedPassword": get_password_hash("admin123"),
            "status": UserStatus.ACTIVE,
            "role": UserRole.SUPERADMIN
        },
        {
            "id": generate_uuid(),
            "firstName": "张",
            "lastName": "三",
            "username": "zhangsan",
            "email": "zhangsan@example.com",
            "phoneNumber": "13900000002",
            "hashedPassword": get_password_hash("user123"),
            "status": UserStatus.ACTIVE,
            "role": UserRole.ADMIN
        },
        {
            "id": generate_uuid(),
            "firstName": "李",
            "lastName": "四",
            "username": "lisi",
            "email": "lisi@example.com",
            "phoneNumber": "13900000003",
            "hashedPassword": get_password_hash("user123"),
            "status": UserStatus.ACTIVE,
            "role": UserRole.MANAGER
        },
        {
            "id": generate_uuid(),
            "firstName": "王",
            "lastName": "五",
            "username": "wangwu",
            "email": "wangwu@example.com",
            "phoneNumber": "13900000004",
            "hashedPassword": get_password_hash("user123"),
            "status": UserStatus.INACTIVE,
            "role": UserRole.CASHIER
        },
        {
            "id": generate_uuid(),
            "firstName": "赵",
            "lastName": "六",
            "username": "zhaoliu",
            "email": "zhaoliu@example.com",
            "phoneNumber": "13900000005",
            "hashedPassword": get_password_hash("user123"),
            "status": UserStatus.INVITED,
            "role": UserRole.CASHIER
        },
        {
            "id": generate_uuid(),
            "firstName": "钱",
            "lastName": "七",
            "username": "qianqi",
            "email": "qianqi@example.com",
            "phoneNumber": "13900000006",
            "hashedPassword": get_password_hash("user123"),
            "status": UserStatus.SUSPENDED,
            "role": UserRole.CASHIER
        }
    ]

    for user_data in users_data:
        db_user = User(**user_data)
        db.add(db_user)

    db.commit()
    print(f"✅ 创建了 {len(users_data)} 个示例用户")


def create_sample_tasks(db: Session, user_ids: list):
    """创建示例任务数据"""
    tasks_data = [
        {
            "id": generate_task_id(),
            "title": "完成用户管理模块开发",
            "description": "实现用户的增删改查功能，包括分页、搜索、筛选等功能",
            "status": TaskStatus.DONE,
            "label": TaskLabel.FEATURE,
            "priority": TaskPriority.HIGH,
            "assignee": user_ids[1],
            "dueDate": datetime.now() + timedelta(days=7)
        },
        {
            "id": generate_task_id(),
            "title": "修复登录页面响应式布局问题",
            "description": "在移动端设备上登录按钮显示异常，需要调整CSS样式",
            "status": TaskStatus.TODO,
            "label": TaskLabel.BUG,
            "priority": TaskPriority.MEDIUM,
            "assignee": user_ids[2],
            "dueDate": datetime.now() + timedelta(days=3)
        },
        {
            "id": generate_task_id(),
            "title": "编写API文档",
            "description": "为所有后端API接口编写详细的文档，包括请求参数和响应格式",
            "status": TaskStatus.IN_PROGRESS,
            "label": TaskLabel.DOCUMENTATION,
            "priority": TaskPriority.LOW,
            "assignee": user_ids[0]
        },
        {
            "id": generate_task_id(),
            "title": "优化数据库查询性能",
            "description": "对慢查询进行优化，添加必要的索引",
            "status": TaskStatus.BACKLOG,
            "label": TaskLabel.FEATURE,
            "priority": TaskPriority.CRITICAL,
            "assignee": user_ids[1]
        },
        {
            "id": generate_task_id(),
            "title": "实现任务导出功能",
            "description": "支持将任务列表导出为Excel和PDF格式",
            "status": TaskStatus.TODO,
            "label": TaskLabel.FEATURE,
            "priority": TaskPriority.MEDIUM,
            "assignee": user_ids[2]
        },
        {
            "id": generate_task_id(),
            "title": "修复用户权限验证BUG",
            "description": "某些情况下用户可以访问未授权的资源",
            "status": TaskStatus.DONE,
            "label": TaskLabel.BUG,
            "priority": TaskPriority.HIGH,
            "assignee": user_ids[0]
        },
        {
            "id": generate_task_id(),
            "title": "添加单元测试",
            "description": "为核心业务逻辑添加单元测试覆盖",
            "status": TaskStatus.BACKLOG,
            "label": TaskLabel.FEATURE,
            "priority": TaskPriority.LOW
        },
        {
            "id": generate_task_id(),
            "title": "集成第三方支付接口",
            "description": "集成支付宝和微信支付接口",
            "status": TaskStatus.CANCELED,
            "label": TaskLabel.FEATURE,
            "priority": TaskPriority.HIGH,
            "assignee": user_ids[3]
        },
        {
            "id": generate_task_id(),
            "title": "更新用户操作手册",
            "description": "根据新版本功能更新用户操作手册",
            "status": TaskStatus.TODO,
            "label": TaskLabel.DOCUMENTATION,
            "priority": TaskPriority.LOW,
            "assignee": user_ids[2]
        },
        {
            "id": generate_task_id(),
            "title": "实现数据备份功能",
            "description": "定期自动备份数据库数据到云存储",
            "status": TaskStatus.IN_PROGRESS,
            "label": TaskLabel.FEATURE,
            "priority": TaskPriority.CRITICAL,
            "assignee": user_ids[1]
        }
    ]

    for task_data in tasks_data:
        db_task = Task(**task_data)
        db.add(db_task)

    db.commit()
    print(f"✅ 创建了 {len(tasks_data)} 个示例任务")


def init_database():
    """初始化数据库"""
    print("🚀 开始初始化数据库...")

    # 创建所有表
    Base.metadata.create_all(bind=engine)
    print("✅ 数据库表创建成功")

    db = SessionLocal()

    try:
        # 检查是否已有数据
        existing_users = db.query(User).count()
        if existing_users > 0:
            print("⚠️ 数据库中已有数据，跳过初始化")
            return

        # 创建示例用户
        create_sample_users(db)

        # 获取用户ID用于创建任务
        users = db.query(User).all()
        user_ids = [user.id for user in users]

        # 创建示例任务
        create_sample_tasks(db, user_ids)

        print("🎉 数据库初始化完成！")
        print("\n📋 默认登录账号：")
        print("超级管理员: superadmin / admin123")
        print("管理员: zhangsan / user123")
        print("经理: lisi / user123")
        print("收银员: wangwu / user123")

    except Exception as e:
        print(f"❌ 数据库初始化失败: {e}")
        db.rollback()
    finally:
        db.close()


if __name__ == "__main__":
    init_database()