from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_, and_
from typing import List, Optional
import random

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
    username = request.get("username")
    phoneNumber = request.get("phoneNumber")
    status = request.get("status")
    role = request.get("role")
    sort_by = request.get("sort_by", "createdAt")
    sort_order = request.get("sort_order", "desc")
    """获取用户列表"""
    
    # 处理 status 参数：如果是列表，取第一个元素；如果是字符串，直接使用
    if isinstance(status, list) and len(status) > 0:
        status = status[0]
    elif not isinstance(status, str):
        status = None
    
    # 处理 role 参数：如果是列表，取第一个元素；如果是字符串，直接使用
    if isinstance(role, list) and len(role) > 0:
        role = role[0]
    elif not isinstance(role, str):
        role = None
    
    # 确保 page 和 page_size 是整数
    try:
        page = int(page) if page else 1
        page_size = int(page_size) if page_size else 10
    except (ValueError, TypeError):
        page = 1
        page_size = 10
    
    # 构建查询
    query = db.query(User)

    # 搜索筛选
    if search and isinstance(search, str) and search.strip():
        search_filter = or_(
            User.firstName.ilike(f"%{search}%"),
            User.lastName.ilike(f"%{search}%"),
            User.username.ilike(f"%{search}%"),
            User.email.ilike(f"%{search}%"),
            User.phoneNumber.ilike(f"%{search}%")
        )
        query = query.filter(search_filter)

    # 状态筛选
    if status and isinstance(status, str):
        query = query.filter(User.status == status)

    # 角色筛选
    if role and isinstance(role, str):
        query = query.filter(User.role == role)

    # 角色筛选
    if username and isinstance(username, str):
        query = query.filter(User.username == username)

    # 角色筛选
    if phoneNumber and isinstance(phoneNumber, str):
        query = query.filter(User.phoneNumber == phoneNumber)

    # 排序
    order_by = build_order_by(User, sort_by, sort_order)
    if order_by is not None:  # 修复：使用 is not None 而不是直接 if order_by
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
    print(user_data_dict)

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
    """邀请用户"""
    # 调试：打印接收到的请求数据
    print(f"[DEBUG] 邀请用户请求: {request}")
    
    # 从对象中提取参数
    email = request.get("email")
    role = request.get("role")
    
    print(f"[DEBUG] 提取的参数 - email: {email}, role: {role}")
    
    # 验证邮箱参数
    if not email:
        print("[DEBUG] 错误: 邮箱为空")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="邮箱不能为空"
        )
    
    # 验证邮箱格式（简单验证）
    email_parts = email.split("@")
    if len(email_parts) != 2 or not email_parts[1] or "." not in email_parts[1]:
        print(f"[DEBUG] 错误: 邮箱格式不正确 - {email}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="邮箱格式不正确"
        )
    
    # 检查邮箱是否已存在
    existing_user = db.query(User).filter(User.email == email).first()
    if existing_user:
        # 如果用户已存在，根据状态决定是否可以重新邀请
        if existing_user.status == UserStatus.INVITED:
            # 如果用户状态是 invited，允许更新邀请信息（如角色）
            print(f"[DEBUG] 用户已存在且状态为 invited，更新邀请信息 - {email}")
            # 更新角色（如果需要）
            if role:
                try:
                    role_lower = role.lower()
                    new_role = UserRole(role_lower)
                    if existing_user.role != new_role:
                        existing_user.role = new_role
                        db.commit()
                        print(f"[DEBUG] 已更新用户角色: {existing_user.role} -> {new_role}")
                except (ValueError, AttributeError):
                    pass  # 角色无效，保持原角色
            
            return UserInviteResponse(
                message="邀请已重新发送",
                invited_users=[email]
            )
        else:
            # 用户已激活或其他状态，不允许再次邀请
            status_messages = {
                UserStatus.ACTIVE: "该邮箱已被注册并激活",
                UserStatus.INACTIVE: "该邮箱已被注册但未激活",
                UserStatus.SUSPENDED: "该邮箱已被注册但已暂停",
            }
            message = status_messages.get(existing_user.status, "该邮箱已被注册")
            print(f"[DEBUG] 错误: 邮箱已存在且状态为 {existing_user.status} - {email}")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=message
            )
    
    # 验证并转换角色
    if not role:
        user_role = UserRole.CASHIER
        print(f"[DEBUG] 角色为空，使用默认值: {user_role}")
    else:
        try:
            # 尝试将字符串转换为枚举值
            role_lower = role.lower()
            print(f"[DEBUG] 尝试转换角色: {role} -> {role_lower}")
            user_role = UserRole(role_lower)  # 转换为小写以匹配枚举值
            print(f"[DEBUG] 角色转换成功: {user_role}")
        except (ValueError, AttributeError) as e:
            # 如果角色值无效，返回错误而不是使用默认值
            valid_roles = [r.value for r in UserRole]
            print(f"[DEBUG] 错误: 角色转换失败 - {role}, 错误: {e}, 有效角色: {valid_roles}")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"无效的角色值: {role}。有效角色: {', '.join(valid_roles)}"
            )
    
    # 创建邀请用户（状态为invited，密码为临时密码）
    # 从邮箱生成用户名（取 @ 前面的部分）
    username = email.split("@")[0]
    
    # 检查用户名是否已存在，如果存在则添加随机后缀
    existing_username = db.query(User).filter(User.username == username).first()
    if existing_username:
        username = f"{username}_{random.randint(1000, 9999)}"
    
    try:
        print(f"[DEBUG] 开始创建邀请用户 - username: {username}, email: {email}, role: {user_role}")
        invited_user = User(
            id=generate_uuid(),
            firstName="Invited",
            lastName="User",
            username=username,
            email=email,
            hashedPassword=get_password_hash("temp_password_123"),
            status=UserStatus.INVITED,
            role=user_role
        )

        db.add(invited_user)
        db.commit()
        db.refresh(invited_user)
        print(f"[DEBUG] 用户创建成功 - ID: {invited_user.id}")

        return UserInviteResponse(
            message="邀请发送成功",
            invited_users=[email]
        )
    except Exception as e:
        db.rollback()
        print(f"[DEBUG] 创建用户时发生错误: {type(e).__name__}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"创建用户失败: {str(e)}"
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