from pydantic import BaseModel, EmailStr, Field, ConfigDict
from typing import Optional, List
from datetime import datetime
from enum import Enum


# 用户相关枚举
class UserStatus(str, Enum):
    ACTIVE = "active"
    INACTIVE = "inactive"
    INVITED = "invited"
    SUSPENDED = "suspended"


class UserRole(str, Enum):
    SUPERADMIN = "superadmin"
    ADMIN = "admin"
    MANAGER = "manager"
    CASHIER = "cashier"


# 任务相关枚举
class TaskStatus(str, Enum):
    BACKLOG = "backlog"
    TODO = "todo"
    IN_PROGRESS = "in progress"
    DONE = "done"
    CANCELED = "canceled"


class TaskLabel(str, Enum):
    BUG = "bug"
    FEATURE = "feature"
    DOCUMENTATION = "documentation"


class TaskPriority(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


# 基础响应模型
class BaseResponse(BaseModel):
    code: int = 200
    message: str = "success"
    success: bool = True


# 分页响应模型
class PaginatedResponse(BaseResponse):
    total: int
    page: int
    pageSize: int


# 用户相关模型
class UserBase(BaseModel):
    firstName: str = Field(..., min_length=1, max_length=50)
    lastName: str = Field(..., min_length=1, max_length=50)
    username: str = Field(..., min_length=3, max_length=30)
    email: EmailStr
    phoneNumber: Optional[str] = Field(None, max_length=20)
    status: UserStatus = UserStatus.ACTIVE
    role: UserRole = UserRole.CASHIER


class UserCreate(UserBase):
    password: str = Field(..., min_length=6)


class UserUpdate(BaseModel):
    firstName: Optional[str] = Field(None, min_length=1, max_length=50)
    lastName: Optional[str] = Field(None, min_length=1, max_length=50)
    username: Optional[str] = Field(None, min_length=3, max_length=30)
    email: Optional[EmailStr] = None
    phoneNumber: Optional[str] = Field(None, max_length=20)
    status: Optional[UserStatus] = None
    role: Optional[UserRole] = None


class UserResponse(UserBase):
    model_config = ConfigDict(from_attributes=True)

    id: str
    createdAt: datetime
    updatedAt: datetime


class UserListResponse(PaginatedResponse):
    data: List[UserResponse]


# 认证相关模型
class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class TokenData(BaseModel):
    username: Optional[str] = None


class LoginRequest(BaseModel):
    username: str
    password: str


class UserProfile(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    username: str
    email: EmailStr
    firstName: str
    lastName: str
    role: UserRole
    status: UserStatus
    createdAt: datetime


# 任务相关模型
class TaskBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    description: Optional[str] = Field(None, max_length=2000)
    status: TaskStatus = TaskStatus.TODO
    label: TaskLabel = TaskLabel.FEATURE
    priority: TaskPriority = TaskPriority.MEDIUM
    dueDate: Optional[datetime] = None
    assignee: Optional[str] = None


class TaskCreate(TaskBase):
    pass


class TaskUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=200)
    description: Optional[str] = Field(None, max_length=2000)
    status: Optional[TaskStatus] = None
    label: Optional[TaskLabel] = None
    priority: Optional[TaskPriority] = None
    dueDate: Optional[datetime] = None
    assignee: Optional[str] = None


class TaskResponse(TaskBase):
    model_config = ConfigDict(from_attributes=True)

    id: str
    createdAt: datetime
    updatedAt: datetime


class TaskListResponse(PaginatedResponse):
    data: List[TaskResponse]


# 批量操作模型
class BulkDeleteRequest(BaseModel):
    ids: List[str] = Field(..., min_items=1)


class BulkOperationResponse(BaseResponse):
    deleted_count: int
    failed_count: int
    failed_ids: List[str] = []


# 用户邀请模型
class UserInviteRequest(BaseModel):
    email: EmailStr
    role: UserRole = UserRole.CASHIER


class UserInviteResponse(BaseResponse):
    invited_users: List[str]


# 任务导入导出模型
class TaskImportRequest(BaseModel):
    tasks: List[TaskCreate]


class TaskImportResponse(BaseResponse):
    imported_count: int
    failed_count: int
    failed_tasks: List[str] = []


# 统计模型
class UserStats(BaseModel):
    total_users: int
    active_users: int
    inactive_users: int
    invited_users: int
    suspended_users: int


class TaskStats(BaseModel):
    total_tasks: int
    backlog_tasks: int
    todo_tasks: int
    in_progress_tasks: int
    done_tasks: int
    canceled_tasks: int
    tasks_by_priority: dict
    tasks_by_label: dict