from typing import List

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.api.v1.dependencies import get_current_user
from app.models.user import User
from app.schemas.task import (
    TaskResponse,
    TaskUpdate,
    TaskStatusUpdate,
    TaskAssignmentUpdate,
    TaskHistoryResponse
)
from app.services.task_service import TaskService

router = APIRouter()


@router.get("/{task_id}", response_model=TaskResponse)
def get_task(
    task_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get a specific task by ID."""
    service = TaskService(db)
    task = service.get_task(task_id, current_user.id)
    return _task_to_response(task)


@router.patch("/{task_id}", response_model=TaskResponse)
def update_task(
    task_id: int,
    task_data: TaskUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update a task."""
    service = TaskService(db)
    task = service.update_task(task_id, current_user.id, task_data)
    return _task_to_response(task)


@router.patch("/{task_id}/status", response_model=TaskResponse)
def update_task_status(
    task_id: int,
    status_data: TaskStatusUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update task status. This action is recorded in history."""
    service = TaskService(db)
    task = service.update_task_status(task_id, current_user.id, status_data)
    return _task_to_response(task)


@router.patch("/{task_id}/assignment", response_model=TaskResponse)
def update_task_assignment(
    task_id: int,
    assignment_data: TaskAssignmentUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update task assignment. This action is recorded in history."""
    service = TaskService(db)
    task = service.update_task_assignment(task_id, current_user.id, assignment_data)
    return _task_to_response(task)


@router.delete("/{task_id}", status_code=204)
def delete_task(
    task_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete a task."""
    service = TaskService(db)
    service.delete_task(task_id, current_user.id)


@router.get("/{task_id}/history", response_model=List[TaskHistoryResponse])
def get_task_history(
    task_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get the history of changes for a task."""
    service = TaskService(db)
    history = service.get_task_history(task_id, current_user.id)
    return [_history_to_response(h) for h in history]


def _task_to_response(task) -> TaskResponse:
    return TaskResponse(
        id=task.id,
        title=task.title,
        description=task.description,
        status=task.status,
        priority=task.priority,
        project_id=task.project_id,
        assigned_to=task.assigned_to,
        assignee_name=task.assignee.name if task.assignee else None,
        created_at=task.created_at,
        updated_at=task.updated_at
    )


def _history_to_response(history) -> TaskHistoryResponse:
    return TaskHistoryResponse(
        id=history.id,
        task_id=history.task_id,
        action_type=history.action_type,
        old_value=history.old_value,
        new_value=history.new_value,
        changed_by=history.changed_by,
        changed_by_name=history.changed_by_user.name if history.changed_by_user else None,
        changed_at=history.changed_at
    )
