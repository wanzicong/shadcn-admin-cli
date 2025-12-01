import uuid
from datetime import datetime, timedelta
from typing import Optional, Any, List
from passlib.context import CryptContext
from jose import JWTError, jwt
from sqlalchemy.orm import Session
from fastapi import HTTPException, status, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

from .database import get_db
from .models import User
from .schemas import TokenData

# 密码加密上下文
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# JWT 配置
SECRET_KEY = "your-secret-key-here-change-in-production"  # 生产环境应该使用环境变量
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# HTTP Bearer 认证
security = HTTPBearer()


def generate_uuid() -> str:
    """生成UUID字符串"""
    return str(uuid.uuid4())


def generate_task_id() -> str:
    """生成任务ID (TASK-XXXX 格式)"""
    return f"TASK-{uuid.uuid4().hex[:8].upper()}"


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """验证密码"""
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    """获取密码哈希"""
    return pwd_context.hash(password)


def create_access_token(data: dict, expires_delta: Optional[Any] = None):
    """创建访问令牌"""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)

    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


def verify_token(token: str) -> Optional[str]:
    """验证令牌并返回用户名"""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            return None
        return username
    except JWTError:
        return None


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
) -> User:
    """获取当前用户"""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    token = credentials.credentials

    # 开发环境：允许 mock token
    if token == "mock-token-for-development":
        # 返回第一个用户作为当前用户
        user = db.query(User).first()
        if user is None:
            raise credentials_exception
        return user

    username = verify_token(token)
    if username is None:
        raise credentials_exception

    user = db.query(User).filter(User.username == username).first()
    if user is None:
        raise credentials_exception

    return user


def paginate_query(
    query: Any,
    page: int = 1,
    page_size: int = 10,
    max_page_size: int = 100
) -> tuple[list[Any], int]:
    """
    分页查询工具函数

    Args:
        query: SQLAlchemy 查询对象
        page: 页码，从1开始
        page_size: 每页数量
        max_page_size: 最大每页数量限制

    Returns:
        tuple: (数据列表, 总数量)
    """
    # 限制每页最大数量
    if page_size > max_page_size:
        page_size = max_page_size

    # 确保页码至少为1
    if page < 1:
        page = 1

    # 计算偏移量
    offset = (page - 1) * page_size

    # 获取总数
    total = query.count()

    # 应用分页
    items = query.offset(offset).limit(page_size).all()

    return items, total


def build_order_by(model: Any, sort_by: Optional[str] = None, sort_order: str = "asc"):
    """构建排序条件"""
    if not sort_by:
        return None

    column = getattr(model, sort_by, None)
    if column is None:
        return None

    if sort_order.lower() == "desc":
        return column.desc()
    else:
        return column.asc()


def create_response(
    data: Any = None,
    message: str = "success",
    code: int = 200,
    success: bool = True
) -> dict:
    """创建标准响应格式"""
    response = {
        "code": code,
        "message": message,
        "success": success
    }

    if data is not None:
        response["data"] = data

    return response


def create_paginated_response(
    items: List[Any],
    total: int,
    page: int,
    page_size: int,
    message: str = "success",
    code: int = 200,
    success: bool = True
) -> dict:
    """创建分页响应格式"""
    return {
        "code": code,
        "message": message,
        "success": success,
        "data": items,
        "total": total,
        "page": page,
        "pageSize": page_size
    }


