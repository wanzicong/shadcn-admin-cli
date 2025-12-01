from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from .database import engine, Base
from .routers import users, tasks, auth


@asynccontextmanager
async def lifespan(app: FastAPI):
    # 启动时创建数据库表和初始化数据
    Base.metadata.create_all(bind=engine)

    # 初始化种子数据
    from .seed import init_database
    init_database()

    yield
    # 关闭时清理资源
    pass


app = FastAPI(
    title="Mock API Server",
    description="Shadcn Admin Mock API Server",
    version="1.0.0",
    lifespan=lifespan
)

# CORS 配置
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173", "http://127.0.0.1:3000", "http://127.0.0.1:5173"],  # 前端开发服务器地址
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 注册路由（移除认证路由，用于测试）
app.include_router(users.router, prefix="/api/users", tags=["用户管理"])
app.include_router(tasks.router, prefix="/api/tasks", tags=["任务管理"])


@app.get("/")
async def root():
    return {"message": "Mock API Server is running"}


@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "mock-api-server"}