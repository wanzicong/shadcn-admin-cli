from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import timedelta

from ..database import get_db
from ..models import User
from ..schemas import LoginRequest, Token, UserProfile, UserResponse
from ..utils import (
    verify_password,
    create_access_token,
    get_current_user,
    ACCESS_TOKEN_EXPIRE_MINUTES,
    create_response
)

router = APIRouter()


@router.post("/login", response_model=Token)
async def login(request: LoginRequest, db: Session = Depends(get_db)):
    """用户登录"""
    # 查找用户
    user = db.query(User).filter(User.username == request.username).first()

    # 验证用户和密码
    if not user or not verify_password(request.password, user.hashedPassword):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="用户名或密码错误",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # 创建访问令牌
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )

    return {
        "access_token": access_token,
        "token_type": "bearer"
    }


@router.get("/profile", response_model=UserProfile)
async def get_profile(current_user: User = Depends(get_current_user)):
    """获取当前用户信息"""
    return UserProfile(
        id=current_user.id,
        username=current_user.username,
        email=current_user.email,
        firstName=current_user.firstName,
        lastName=current_user.lastName,
        role=current_user.role,
        status=current_user.status,
        createdAt=current_user.createdAt
    )


@router.post("/logout")
async def logout(current_user: User = Depends(get_current_user)):
    """用户登出"""
    # 在实际应用中，这里可以将令牌加入黑名单
    # 由于我们使用无状态的JWT，客户端删除令牌即可
    return create_response(message="登出成功")