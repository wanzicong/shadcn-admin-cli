from sqlalchemy import Column, String, DateTime, Enum, Text, Integer
from sqlalchemy.sql import func
from .database import Base
from .schemas import UserStatus, UserRole, TaskStatus, TaskLabel, TaskPriority


class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, index=True)
    firstName = Column(String(50), nullable=False)
    lastName = Column(String(50), nullable=False)
    username = Column(String(30), unique=True, index=True, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    phoneNumber = Column(String(20), nullable=True)
    hashedPassword = Column(String, nullable=False)
    status = Column(Enum(UserStatus), default=UserStatus.ACTIVE, nullable=False)
    role = Column(Enum(UserRole), default=UserRole.CASHIER, nullable=False)
    createdAt = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updatedAt = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)


class Task(Base):
    __tablename__ = "tasks"

    id = Column(String, primary_key=True, index=True)
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=True)
    status = Column(Enum(TaskStatus), default=TaskStatus.TODO, nullable=False)
    label = Column(Enum(TaskLabel), default=TaskLabel.FEATURE, nullable=False)
    priority = Column(Enum(TaskPriority), default=TaskPriority.MEDIUM, nullable=False)
    dueDate = Column(DateTime(timezone=True), nullable=True)
    assignee = Column(String, nullable=True, index=True)  # 用户ID
    createdAt = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updatedAt = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)