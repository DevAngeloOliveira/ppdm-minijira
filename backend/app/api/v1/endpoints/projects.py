from typing import Optional, List

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.api.v1.dependencies import get_current_user
from app.models.user import User
from app.models.task import TaskStatus
from app.schemas.project import (
    ProjectCreate,
    ProjectUpdate,
    ProjectResponse,
    ProjectListResponse,
    ProjectMemberCreate,
    ProjectMemberResponse
)
from app.schemas.task import TaskCreate, TaskResponse, TaskListResponse
from app.services.project_service import ProjectService
from app.services.task_service import TaskService

router = APIRouter()


@router.post("", response_model=ProjectResponse, status_code=201)
def create_project(
    project_data: ProjectCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new project. Creator becomes ADMIN."""
    service = ProjectService(db)
    project = service.create_project(current_user.id, project_data)
    return _project_to_response(project)


@router.get("", response_model=ProjectListResponse)
def list_projects(
    page: int = Query(1, ge=1),
    size: int = Query(10, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """List all projects the current user is a member of."""
    service = ProjectService(db)
    projects, total = service.list_user_projects(current_user.id, page, size)
    return ProjectListResponse(
        items=[_project_to_response(p) for p in projects],
        page=page,
        size=size,
        total=total
    )


@router.get("/{project_id}", response_model=ProjectResponse)
def get_project(
    project_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get a specific project by ID."""
    service = ProjectService(db)
    project = service.get_project(project_id, current_user.id)
    return _project_to_response(project)


@router.patch("/{project_id}", response_model=ProjectResponse)
def update_project(
    project_id: int,
    project_data: ProjectUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update a project. Only ADMINs can update."""
    service = ProjectService(db)
    project = service.update_project(project_id, current_user.id, project_data)
    return _project_to_response(project)


@router.delete("/{project_id}", status_code=204)
def delete_project(
    project_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete a project. Only ADMINs can delete."""
    service = ProjectService(db)
    service.delete_project(project_id, current_user.id)


# Members endpoints
@router.post("/{project_id}/members", response_model=ProjectMemberResponse, status_code=201)
def add_member(
    project_id: int,
    member_data: ProjectMemberCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Add a member to the project. Only ADMINs can add members."""
    service = ProjectService(db)
    member = service.add_member(project_id, current_user.id, member_data)
    return _member_to_response(member)


@router.get("/{project_id}/members", response_model=List[ProjectMemberResponse])
def list_members(
    project_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """List all members of a project."""
    service = ProjectService(db)
    members = service.get_project_members(project_id, current_user.id)
    return [_member_to_response(m) for m in members]


@router.delete("/{project_id}/members/{user_id}", status_code=204)
def remove_member(
    project_id: int,
    user_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Remove a member from the project. Only ADMINs can remove members."""
    service = ProjectService(db)
    service.remove_member(project_id, current_user.id, user_id)


# Tasks endpoints (nested under projects)
@router.post("/{project_id}/tasks", response_model=TaskResponse, status_code=201)
def create_task(
    project_id: int,
    task_data: TaskCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new task in the project."""
    service = TaskService(db)
    task = service.create_task(project_id, current_user.id, task_data)
    return _task_to_response(task)


@router.get("/{project_id}/tasks", response_model=TaskListResponse)
def list_tasks(
    project_id: int,
    status: Optional[TaskStatus] = None,
    page: int = Query(1, ge=1),
    size: int = Query(10, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """List all tasks in a project with optional status filter."""
    service = TaskService(db)
    tasks, total = service.list_project_tasks(project_id, current_user.id, status, page, size)
    return TaskListResponse(
        items=[_task_to_response(t) for t in tasks],
        page=page,
        size=size,
        total=total
    )


def _project_to_response(project) -> ProjectResponse:
    return ProjectResponse(
        id=project.id,
        name=project.name,
        description=project.description,
        owner_id=project.owner_id,
        created_at=project.created_at,
        members=[_member_to_response(m) for m in project.members]
    )


def _member_to_response(member) -> ProjectMemberResponse:
    return ProjectMemberResponse(
        id=member.id,
        user_id=member.user_id,
        project_id=member.project_id,
        role=member.role,
        user_name=member.user.name if member.user else None,
        user_email=member.user.email if member.user else None
    )


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
