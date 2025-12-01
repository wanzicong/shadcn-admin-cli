from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os

# 获取当前脚本的绝对路径
current_dir = os.path.dirname(os.path.abspath(__file__))
# mocker/src/mocker -> mocker
mocker_dir = os.path.dirname(current_dir)
# mocker -> mocker (项目根目录)
project_dir = mocker_dir
db_path = os.path.join(project_dir, "mocker.db")

# 数据库配置 - 使用绝对路径
DATABASE_URL = os.getenv("DATABASE_URL", f"sqlite:///{db_path}")

# 创建数据库引擎
engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False} if "sqlite" in DATABASE_URL else {}
)

# 创建会话工厂
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# 创建基础模型类
Base = declarative_base()


# 数据库依赖
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()