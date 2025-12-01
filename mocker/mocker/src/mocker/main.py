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

# CORS 配置 - 允许所有来源用于测试
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 允许所有来源用于测试
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 注册路由
app.include_router(auth.router, prefix="/api/auth", tags=["认证"])
app.include_router(users.router, prefix="/api/users", tags=["用户管理"])
app.include_router(tasks.router, prefix="/api/tasks", tags=["任务管理"])


@app.get("/")
async def root():
    return {"message": "Mock API Server is running"}


@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "mock-api-server"}