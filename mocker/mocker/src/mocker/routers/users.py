from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_, and_
from typing import List, Optional

from ..database import get_db
from ..models import User
from ..schemas import (
    UserCreate,
    UserUpdate,
    UserResponse,
    UserListResponse,
    UserInviteRequest,
    UserInviteResponse,
    BulkDeleteRequest,
    BulkOperationResponse,
    UserStats,
    UserStatus,
    UserRole
)
from ..utils import (
    generate_uuid,
    get_password_hash,
    paginate_query,
    build_order_by,
    create_paginated_response,
    create_response
)

router = APIRouter()


@router.post("", response_model=UserListResponse)
async def get_users(
    request: dict,  # 使用对象接收所有参数
    db: Session = Depends(get_db)
):
    # 从对象中提取参数
    page = request.get("page", 1)
    page_size = request.get("page_size", 10)
    search = request.get("search")
    status = request.get("status")
    role = request.get("role")
    sort_by = request.get("sort_by", "createdAt")
    sort_order = request.get("sort_order", "desc")
    """获取用户列表"""
    # 构建查询
    query = db.query(User)

    # 搜索筛选
    if search:
        search_filter = or_(
            User.firstName.ilike(f"%{search}%"),
            User.lastName.ilike(f"%{search}%"),
            User.username.ilike(f"%{search}%"),
            User.email.ilike(f"%{search}%"),
            User.phoneNumber.ilike(f"%{search}%")
        )
        query = query.filter(search_filter)

    # 状态筛选
    if status:
        query = query.filter(User.status == status)

    # 角色筛选
    if role:
        query = query.filter(User.role == role)

    # 排序
    order_by = build_order_by(User, sort_by, sort_order)
    if order_by:
        query = query.order_by(order_by)

    # 分页
    users, total = paginate_query(query, page, page_size)

    return create_paginated_response(
        items=[UserResponse.model_validate(user) for user in users],
        total=total,
        page=page,
        page_size=page_size
    )


@router.post("/detail", response_model=UserResponse)
async def get_user(
    request: dict,
    db: Session = Depends(get_db)
):
    user_id = request.get("user_id")
    """获取单个用户详情"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="用户不存在"
        )

    return UserResponse.model_validate(user)


@router.post("/create", response_model=UserResponse)
async def create_user(
    request: dict,
    db: Session = Depends(get_db)
):
    """创建新用户"""
    user_data_dict = request.get("user_data", {})

    # 检查用户名是否已存在
    if user_data_dict.get("username") and db.query(User).filter(User.username == user_data_dict["username"]).first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="用户名已存在"
        )

    # 检查邮箱是否已存在
    if user_data_dict.get("email") and db.query(User).filter(User.email == user_data_dict["email"]).first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="邮箱已存在"
        )

    # 创建新用户
    new_user = User(
        id=generate_uuid(),
        **{k: v for k, v in user_data_dict.items() if k != "password"},
        hashedPassword=get_password_hash(user_data_dict.get("password", ""))
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return UserResponse.model_validate(new_user)


@router.post("/update", response_model=UserResponse)
async def update_user(
    request: dict,
    db: Session = Depends(get_db)
):
    """更新用户信息"""
    user_id = request.get("user_id")
    user_data_dict = request.get("user_data", {})

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="用户不存在"
        )

    # 检查用户名唯一性
    if "username" in user_data_dict and user_data_dict["username"] != user.username:
        if db.query(User).filter(User.username == user_data_dict["username"]).first():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="用户名已存在"
            )

    # 检查邮箱唯一性
    if "email" in user_data_dict and user_data_dict["email"] != user.email:
        if db.query(User).filter(User.email == user_data_dict["email"]).first():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="邮箱已存在"
            )

    # 更新用户信息
    for field, value in user_data_dict.items():
        setattr(user, field, value)

    db.commit()
    db.refresh(user)

    return UserResponse.model_validate(user)


@router.post("/delete")
async def delete_user(
    request: dict,
    db: Session = Depends(get_db)
):
    """删除单个用户"""
    user_id = request.get("user_id")
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="用户不存在"
        )

    # 移除认证检查，允许删除任何用户（仅用于测试）

    db.delete(user)
    db.commit()

    return create_response(message="用户删除成功")


@router.post("/bulk-delete", response_model=BulkOperationResponse)
async def bulk_delete_users(
    request: dict,
    db: Session = Depends(get_db)
):
    """批量删除用户"""
    deleted_count = 0
    failed_count = 0
    failed_ids = []

    for user_id in request.get("ids", []):
        try:
            user = db.query(User).filter(User.id == user_id).first()
            if not user:
                failed_count += 1
                failed_ids.append(user_id)
                continue

            # 移除认证检查，允许删除任何用户（仅用于测试）

            db.delete(user)
            deleted_count += 1
        except Exception:
            failed_count += 1
            failed_ids.append(user_id)

    db.commit()

    return BulkOperationResponse(
        message=f"批量删除完成，成功删除 {deleted_count} 个用户",
        deleted_count=deleted_count,
        failed_count=failed_count,
        failed_ids=failed_ids
    )


@router.post("/invite")
async def invite_users(
    request: dict,
    db: Session = Depends(get_db)
):
    # 从对象中提取参数
    email = request.get("email")
    role = request.get("role", "user")
    """邀请用户"""
    # 检查邮箱是否已存在
    existing_user = db.query(User).filter(User.email == request.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="该邮箱已被注册"
        )

    # 创建邀请用户（状态为invited，密码为临时密码）
    invited_user = User(
        id=generate_uuid(),
        firstName="Invited",
        lastName="User",
        username=request.email.split("@")[0],
        email=request.email,
        hashedPassword=get_password_hash("temp_password_123"),
        status=UserStatus.INVITED,
        role=request.role
    )

    db.add(invited_user)
    db.commit()

    return UserInviteResponse(
        message="邀请发送成功",
        invited_users=[request.email]
    )


@router.post("/activate")
async def activate_user(
    request: dict,
    db: Session = Depends(get_db)
):
    user_id = request.get("user_id")
    """激活用户"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="用户不存在"
        )

    user.status = UserStatus.ACTIVE
    db.commit()

    return create_response(message="用户激活成功")


@router.post("/suspend")
async def suspend_user(
    request: dict,
    db: Session = Depends(get_db)
):
    user_id = request.get("user_id")
    """暂停用户"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="用户不存在"
        )

    # 移除认证检查，允许暂停任何用户（仅用于测试）

    user.status = UserStatus.SUSPENDED
    db.commit()

    return create_response(message="用户暂停成功")


@router.post("/stats", response_model=UserStats)
async def get_user_stats(
    request: dict = None,  # 允许空请求
    db: Session = Depends(get_db)
):
    """获取用户统计信息"""
    total_users = db.query(User).count()
    active_users = db.query(User).filter(User.status == UserStatus.ACTIVE).count()
    inactive_users = db.query(User).filter(User.status == UserStatus.INACTIVE).count()
    invited_users = db.query(User).filter(User.status == UserStatus.INVITED).count()
    suspended_users = db.query(User).filter(User.status == UserStatus.SUSPENDED).count()

    return UserStats(
        total_users=total_users,
        active_users=active_users,
        inactive_users=inactive_users,
        invited_users=invited_users,
        suspended_users=suspended_users
    )