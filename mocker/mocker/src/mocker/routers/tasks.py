from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_, and_, func
from typing import List, Optional
from datetime import datetime

from ..database import get_db
from ..models import Task, User
from ..schemas import (
    TaskCreate,
    TaskUpdate,
    TaskResponse,
    TaskListResponse,
    TaskImportRequest,
    TaskImportResponse,
    BulkDeleteRequest,
    BulkOperationResponse,
    TaskStats,
    TaskStatus,
    TaskLabel,
    TaskPriority
)
from ..utils import (
    get_current_user,
    generate_task_id,
    paginate_query,
    build_order_by,
    create_paginated_response,
    create_response
)

router = APIRouter()


@router.get("/", response_model=TaskListResponse)
async def get_tasks(
    page: int = Query(1, ge=1, description="页码"),
    page_size: int = Query(10, ge=1, le=100, description="每页数量"),
    search: Optional[str] = Query(None, description="搜索关键词"),
    status: Optional[TaskStatus] = Query(None, description="任务状态筛选"),
    label: Optional[TaskLabel] = Query(None, description="任务标签筛选"),
    priority: Optional[TaskPriority] = Query(None, description="优先级筛选"),
    assignee: Optional[str] = Query(None, description="分配人员筛选"),
    sort_by: Optional[str] = Query("createdAt", description="排序字段"),
    sort_order: str = Query("desc", description="排序方向"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """获取任务列表"""
    # 构建查询
    query = db.query(Task)

    # 搜索筛选
    if search:
        search_filter = or_(
            Task.title.ilike(f"%{search}%"),
            Task.description.ilike(f"%{search}%"),
            Task.id.ilike(f"%{search}%")
        )
        query = query.filter(search_filter)

    # 状态筛选
    if status:
        query = query.filter(Task.status == status)

    # 标签筛选
    if label:
        query = query.filter(Task.label == label)

    # 优先级筛选
    if priority:
        query = query.filter(Task.priority == priority)

    # 分配人员筛选
    if assignee:
        query = query.filter(Task.assignee == assignee)

    # 排序
    order_by = build_order_by(Task, sort_by, sort_order)
    if order_by:
        query = query.order_by(order_by)

    # 分页
    tasks, total = paginate_query(query, page, page_size)

    return create_paginated_response(
        items=[TaskResponse.model_validate(task) for task in tasks],
        total=total,
        page=page,
        page_size=page_size
    )


@router.get("/{task_id}", response_model=TaskResponse)
async def get_task(
    task_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """获取单个任务详情"""
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="任务不存在"
        )

    return TaskResponse.model_validate(task)


@router.post("/", response_model=TaskResponse)
async def create_task(
    task_data: TaskCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """创建新任务"""
    # 验证分配人员是否存在
    if task_data.assignee:
        assignee = db.query(User).filter(User.id == task_data.assignee).first()
        if not assignee:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="分配人员不存在"
            )

    # 创建新任务
    new_task = Task(
        id=generate_task_id(),
        **task_data.model_dump()
    )

    db.add(new_task)
    db.commit()
    db.refresh(new_task)

    return TaskResponse.model_validate(new_task)


@router.put("/{task_id}", response_model=TaskResponse)
async def update_task(
    task_id: str,
    task_data: TaskUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """更新任务信息"""
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="任务不存在"
        )

    # 验证分配人员是否存在
    if task_data.assignee:
        assignee = db.query(User).filter(User.id == task_data.assignee).first()
        if not assignee:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="分配人员不存在"
            )

    # 更新任务信息
    update_data = task_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(task, field, value)

    db.commit()
    db.refresh(task)

    return TaskResponse.model_validate(task)


@router.delete("/{task_id}")
async def delete_task(
    task_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """删除单个任务"""
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="任务不存在"
        )

    db.delete(task)
    db.commit()

    return create_response(message="任务删除成功")


@router.delete("/", response_model=BulkOperationResponse)
async def bulk_delete_tasks(
    request: BulkDeleteRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """批量删除任务"""
    deleted_count = 0
    failed_count = 0
    failed_ids = []

    for task_id in request.ids:
        try:
            task = db.query(Task).filter(Task.id == task_id).first()
            if not task:
                failed_count += 1
                failed_ids.append(task_id)
                continue

            db.delete(task)
            deleted_count += 1
        except Exception:
            failed_count += 1
            failed_ids.append(task_id)

    db.commit()

    return BulkOperationResponse(
        message=f"批量删除完成，成功删除 {deleted_count} 个任务",
        deleted_count=deleted_count,
        failed_count=failed_count,
        failed_ids=failed_ids
    )


@router.put("/{task_id}/status")
async def update_task_status(
    task_id: str,
    status: TaskStatus,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """更新任务状态"""
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="任务不存在"
        )

    task.status = status
    db.commit()

    return create_response(message="任务状态更新成功")


@router.put("/{task_id}/assign")
async def assign_task(
    task_id: str,
    assignee_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """分配任务"""
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="任务不存在"
        )

    # 验证分配人员是否存在
    assignee = db.query(User).filter(User.id == assignee_id).first()
    if not assignee:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="分配人员不存在"
        )

    task.assignee = assignee_id
    db.commit()

    return create_response(message="任务分配成功")


@router.post("/import", response_model=TaskImportResponse)
async def import_tasks(
    request: TaskImportRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """批量导入任务"""
    imported_count = 0
    failed_count = 0
    failed_tasks = []

    for task_data in request.tasks:
        try:
            # 验证分配人员是否存在
            if task_data.assignee:
                assignee = db.query(User).filter(User.id == task_data.assignee).first()
                if not assignee:
                    failed_count += 1
                    failed_tasks.append(task_data.title)
                    continue

            # 创建任务
            new_task = Task(
                id=generate_task_id(),
                **task_data.model_dump()
            )
            db.add(new_task)
            imported_count += 1
        except Exception:
            failed_count += 1
            failed_tasks.append(task_data.title)

    db.commit()

    return TaskImportResponse(
        message=f"批量导入完成，成功导入 {imported_count} 个任务",
        imported_count=imported_count,
        failed_count=failed_count,
        failed_tasks=failed_tasks
    )


@router.get("/export")
async def export_tasks(
    status: Optional[TaskStatus] = Query(None, description="任务状态筛选"),
    label: Optional[TaskLabel] = Query(None, description="任务标签筛选"),
    priority: Optional[TaskPriority] = Query(None, description="优先级筛选"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """导出任务数据"""
    # 构建查询
    query = db.query(Task)

    # 应用筛选
    if status:
        query = query.filter(Task.status == status)
    if label:
        query = query.filter(Task.label == label)
    if priority:
        query = query.filter(Task.priority == priority)

    tasks = query.all()

    # 转换为导出格式
    export_data = [
        {
            "id": task.id,
            "title": task.title,
            "description": task.description,
            "status": task.status,
            "label": task.label,
            "priority": task.priority,
            "assignee": task.assignee,
            "dueDate": task.dueDate.isoformat() if task.dueDate else None,
            "createdAt": task.createdAt.isoformat(),
            "updatedAt": task.updatedAt.isoformat()
        }
        for task in tasks
    ]

    return create_response(
        data=export_data,
        message=f"成功导出 {len(export_data)} 个任务"
    )


@router.get("/stats/summary", response_model=TaskStats)
async def get_task_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """获取任务统计信息"""
    # 基础统计
    total_tasks = db.query(Task).count()
    backlog_tasks = db.query(Task).filter(Task.status == TaskStatus.BACKLOG).count()
    todo_tasks = db.query(Task).filter(Task.status == TaskStatus.TODO).count()
    in_progress_tasks = db.query(Task).filter(Task.status == TaskStatus.IN_PROGRESS).count()
    done_tasks = db.query(Task).filter(Task.status == TaskStatus.DONE).count()
    canceled_tasks = db.query(Task).filter(Task.status == TaskStatus.CANCELED).count()

    # 按优先级统计
    priority_stats = db.query(
        Task.priority,
        func.count(Task.id).label('count')
    ).group_by(Task.priority).all()
    tasks_by_priority = {item.priority: item.count for item in priority_stats}

    # 按标签统计
    label_stats = db.query(
        Task.label,
        func.count(Task.id).label('count')
    ).group_by(Task.label).all()
    tasks_by_label = {item.label: item.count for item in label_stats}

    return TaskStats(
        total_tasks=total_tasks,
        backlog_tasks=backlog_tasks,
        todo_tasks=todo_tasks,
        in_progress_tasks=in_progress_tasks,
        done_tasks=done_tasks,
        canceled_tasks=canceled_tasks,
        tasks_by_priority=tasks_by_priority,
        tasks_by_label=tasks_by_label
    )


@router.get("/dashboard")
async def get_dashboard_data(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """获取仪表板数据"""
    # 最近任务
    recent_tasks = db.query(Task).order_by(Task.createdAt.desc()).limit(5).all()

    # 任务分布统计
    status_distribution = db.query(
        Task.status,
        func.count(Task.id).label('count')
    ).group_by(Task.status).all()

    # 优先级分布
    priority_distribution = db.query(
        Task.priority,
        func.count(Task.id).label('count')
    ).group_by(Task.priority).all()

    return create_response(
        data={
            "recent_tasks": [TaskResponse.model_validate(task) for task in recent_tasks],
            "status_distribution": {item.status: item.count for item in status_distribution},
            "priority_distribution": {item.priority: item.count for item in priority_distribution}
        },
        message="仪表板数据获取成功"
    )