from typing import Tuple, List, Optional

from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from app.repositories.task_repository import TaskRepository, TaskHistoryRepository
from app.repositories.project_repository import ProjectRepository, ProjectMemberRepository
from app.models.task import Task, TaskHistory, TaskStatus, ActionType
from app.schemas.task import TaskCreate, TaskUpdate, TaskStatusUpdate, TaskAssignmentUpdate


class TaskService:
    def __init__(self, db: Session):
        self.db = db
        self.task_repo = TaskRepository(db)
        self.history_repo = TaskHistoryRepository(db)
        self.project_repo = ProjectRepository(db)
        self.member_repo = ProjectMemberRepository(db)

    def _check_project_access(self, project_id: int, user_id: int) -> None:
        project = self.project_repo.get_by_id(project_id)
        if not project:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Project not found"
            )
        
        if not self.project_repo.is_member(project_id, user_id):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied to this project"
            )

    def create_task(self, project_id: int, user_id: int, task_data: TaskCreate) -> Task:
        self._check_project_access(project_id, user_id)
        
        return self.task_repo.create(
            title=task_data.title,
            description=task_data.description,
            priority=task_data.priority,
            project_id=project_id
        )

    def get_task(self, task_id: int, user_id: int) -> Task:
        task = self.task_repo.get_by_id(task_id)
        if not task:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Task not found"
            )
        
        self._check_project_access(task.project_id, user_id)
        return task

    def list_project_tasks(
        self,
        project_id: int,
        user_id: int,
        status: Optional[TaskStatus] = None,
        page: int = 1,
        size: int = 10
    ) -> Tuple[List[Task], int]:
        self._check_project_access(project_id, user_id)
        return self.task_repo.get_project_tasks(project_id, status, page, size)

    def update_task(self, task_id: int, user_id: int, task_data: TaskUpdate) -> Task:
        task = self.get_task(task_id, user_id)
        
        # Check if assigned_to is a valid project member
        if task_data.assigned_to is not None:
            if not self.project_repo.is_member(task.project_id, task_data.assigned_to):
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Assigned user is not a member of the project"
                )
        
        update_data = task_data.model_dump(exclude_unset=True)
        return self.task_repo.update(task, **update_data)

    def update_task_status(self, task_id: int, user_id: int, status_data: TaskStatusUpdate) -> Task:
        task = self.get_task(task_id, user_id)
        
        old_status = task.status.value
        new_status = status_data.status.value
        
        if old_status != new_status:
            # Update status
            task = self.task_repo.update(task, status=status_data.status)
            
            # Record history
            self.history_repo.create(
                task_id=task_id,
                action_type=ActionType.STATUS_CHANGE,
                old_value=old_status,
                new_value=new_status,
                changed_by=user_id
            )
        
        return task

    def update_task_assignment(self, task_id: int, user_id: int, assignment_data: TaskAssignmentUpdate) -> Task:
        task = self.get_task(task_id, user_id)
        
        # Check if assigned_to is a valid project member
        if assignment_data.assigned_to is not None:
            if not self.project_repo.is_member(task.project_id, assignment_data.assigned_to):
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Assigned user is not a member of the project"
                )
        
        old_assignee = str(task.assigned_to) if task.assigned_to else None
        new_assignee = str(assignment_data.assigned_to) if assignment_data.assigned_to else None
        
        if old_assignee != new_assignee:
            # Update assignment
            task = self.task_repo.update(task, assigned_to=assignment_data.assigned_to)
            
            # Record history
            self.history_repo.create(
                task_id=task_id,
                action_type=ActionType.ASSIGNMENT_CHANGE,
                old_value=old_assignee,
                new_value=new_assignee,
                changed_by=user_id
            )
        
        return task

    def delete_task(self, task_id: int, user_id: int) -> None:
        task = self.get_task(task_id, user_id)
        self.task_repo.delete(task)

    def get_task_history(self, task_id: int, user_id: int) -> List[TaskHistory]:
        task = self.get_task(task_id, user_id)
        return self.history_repo.get_task_history(task_id)
