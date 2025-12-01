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
    generate_task_id,
    paginate_query,
    build_order_by,
    create_paginated_response,
    create_response
)

router = APIRouter()


@router.post("/", response_model=TaskListResponse)
async def get_tasks(
    request: dict,  # 使用对象接收所有参数
    db: Session = Depends(get_db)
):
    # 从对象中提取参数
    page = request.get("page", 1)
    page_size = request.get("page_size", 10)
    search = request.get("search")
    status = request.get("status")
    label = request.get("label")
    priority = request.get("priority")
    assignee = request.get("assignee")
    sort_by = request.get("sort_by", "createdAt")
    sort_order = request.get("sort_order", "desc")
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


@router.post("/detail", response_model=TaskResponse)
async def get_task(
    request: dict,
    db: Session = Depends(get_db)
):
    task_id = request.get("task_id")
    """获取单个任务详情"""
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="任务不存在"
        )

    return TaskResponse.model_validate(task)


@router.post("/create", response_model=TaskResponse)
async def create_task(
    request: dict,
    db: Session = Depends(get_db)
):
    """创建新任务"""
    task_data_dict = request.get("task_data", {})

    # 验证分配人员是否存在
    if task_data_dict.get("assignee"):
        assignee = db.query(User).filter(User.id == task_data_dict["assignee"]).first()
        if not assignee:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="分配人员不存在"
            )

    # 创建新任务
    new_task = Task(
        id=generate_task_id(),
        **task_data_dict
    )

    db.add(new_task)
    db.commit()
    db.refresh(new_task)

    return TaskResponse.model_validate(new_task)


@router.post("/update", response_model=TaskResponse)
async def update_task(
    request: dict,
    db: Session = Depends(get_db)
):
    """更新任务信息"""
    task_id = request.get("task_id")
    task_data_dict = request.get("task_data", {})

    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="任务不存在"
        )

    # 验证分配人员是否存在
    if task_data_dict.get("assignee"):
        assignee = db.query(User).filter(User.id == task_data_dict["assignee"]).first()
        if not assignee:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="分配人员不存在"
            )

    # 更新任务信息
    for field, value in task_data_dict.items():
        setattr(task, field, value)

    db.commit()
    db.refresh(task)

    return TaskResponse.model_validate(task)


@router.post("/delete")
async def delete_task(
    request: dict,
    db: Session = Depends(get_db)
):
    """删除单个任务"""
    task_id = request.get("task_id")
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="任务不存在"
        )

    db.delete(task)
    db.commit()

    return create_response(message="任务删除成功")


@router.post("/bulk-delete", response_model=BulkOperationResponse)
async def bulk_delete_tasks(
    request: dict,
    db: Session = Depends(get_db)
):
    """批量删除任务"""
    deleted_count = 0
    failed_count = 0
    failed_ids = []

    for task_id in request.get("ids", []):
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


@router.post("/status")
async def update_task_status(
    request: dict,
    db: Session = Depends(get_db)
):
    task_id = request.get("task_id")
    status = request.get("status")
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


@router.post("/assign")
async def assign_task(
    request: dict,
    db: Session = Depends(get_db)
):
    task_id = request.get("task_id")
    assignee_id = request.get("assignee_id")
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
    db: Session = Depends(get_db)
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
                **task_data.__dict__
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


@router.post("/export")
async def export_tasks(
    request: dict,  # 使用对象接收所有参数
    db: Session = Depends(get_db)
):
    # 从对象中提取参数
    status = request.get("status")
    label = request.get("label")
    priority = request.get("priority")
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


@router.post("/stats", response_model=TaskStats)
async def get_task_stats(
    request: dict,
    db: Session = Depends(get_db)
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


@router.post("/dashboard")
async def get_dashboard_data(
    request: dict,
    db: Session = Depends(get_db)
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