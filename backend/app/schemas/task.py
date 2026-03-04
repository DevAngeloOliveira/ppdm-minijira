from datetime import datetime
from typing import Optional, List

from pydantic import BaseModel, ConfigDict

from app.models.task import TaskStatus, TaskPriority, ActionType


class TaskBase(BaseModel):
    title: str
    description: Optional[str] = None
    priority: TaskPriority = TaskPriority.MEDIUM


class TaskCreate(TaskBase):
    pass


class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    priority: Optional[TaskPriority] = None
    assigned_to: Optional[int] = None


class TaskStatusUpdate(BaseModel):
    status: TaskStatus


class TaskAssignmentUpdate(BaseModel):
    assigned_to: Optional[int] = None


class TaskResponse(TaskBase):
    id: int
    status: TaskStatus
    project_id: int
    assigned_to: Optional[int] = None
    assignee_name: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class TaskListResponse(BaseModel):
    items: List[TaskResponse]
    page: int
    size: int
    total: int


class TaskHistoryResponse(BaseModel):
    id: int
    task_id: int
    action_type: ActionType
    old_value: Optional[str] = None
    new_value: Optional[str] = None
    changed_by: int
    changed_by_name: Optional[str] = None
    changed_at: datetime

    model_config = ConfigDict(from_attributes=True)
