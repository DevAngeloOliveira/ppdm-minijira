"""
Serviço de tarefas - Refatorado com SOLID

SRP: Responsabilidade única de gerenciar tarefas
OCP: Extensível através de injeção de dependência
LSP: Segue contratos de interface
DIP: Depende de abstrações
"""
from typing import Tuple, List, Optional

from sqlalchemy.orm import Session

from app.repositories.task_repository import TaskRepository, TaskHistoryRepository
from app.repositories.project_repository import ProjectRepository, ProjectMemberRepository
from app.models.task import Task, TaskHistory, TaskStatus, ActionType
from app.schemas.task import TaskCreate, TaskUpdate, TaskStatusUpdate, TaskAssignmentUpdate
from app.core.exceptions import (
    TaskNotFoundError,
    ProjectNotFoundError,
    ProjectAccessDeniedError,
    InvalidAssignmentError,
)
from app.core.validators import InputSanitizer


class TaskService:
    """
    Serviço de gerenciamento de tarefas - SRP
    """
    
    def __init__(
        self,
        db: Session,
        task_repo: Optional[TaskRepository] = None,
        history_repo: Optional[TaskHistoryRepository] = None,
        project_repo: Optional[ProjectRepository] = None,
        member_repo: Optional[ProjectMemberRepository] = None
    ):
        self.db = db
        # DIP: Permite injeção de dependência para testes
        self.task_repo = task_repo or TaskRepository(db)
        self.history_repo = history_repo or TaskHistoryRepository(db)
        self.project_repo = project_repo or ProjectRepository(db)
        self.member_repo = member_repo or ProjectMemberRepository(db)

    def _check_project_access(self, project_id: int, user_id: int) -> None:
        """Verifica acesso ao projeto - DRY principle"""
        project = self.project_repo.get_by_id(project_id)
        if not project:
            raise ProjectNotFoundError(project_id)
        
        if not self.project_repo.is_member(project_id, user_id):
            raise ProjectAccessDeniedError()
    
    def _validate_assignment(self, project_id: int, assigned_to: Optional[int]) -> None:
        """Valida se o usuário pode ser atribuído - DRY principle"""
        if assigned_to is not None:
            if not self.project_repo.is_member(project_id, assigned_to):
                raise InvalidAssignmentError()

    def create_task(self, project_id: int, user_id: int, task_data: TaskCreate) -> Task:
        """Cria uma nova tarefa"""
        self._check_project_access(project_id, user_id)
        
        # Sanitizar inputs
        title = InputSanitizer.sanitize_string(task_data.title)
        description = InputSanitizer.sanitize_string(task_data.description or "")
        
        return self.task_repo.create(
            title=title,
            description=description,
            priority=task_data.priority,
            project_id=project_id
        )

    def get_task(self, task_id: int, user_id: int) -> Task:
        """Obtém uma tarefa com verificação de acesso"""
        task = self.task_repo.get_by_id(task_id)
        if not task:
            raise TaskNotFoundError(task_id)
        
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
        """Lista tarefas do projeto com filtros e paginação"""
        self._check_project_access(project_id, user_id)
        return self.task_repo.get_project_tasks(project_id, status, page, size)

    def update_task(self, task_id: int, user_id: int, task_data: TaskUpdate) -> Task:
        """Atualiza uma tarefa"""
        task = self.get_task(task_id, user_id)
        
        # Validar atribuição se fornecida
        if task_data.assigned_to is not None:
            self._validate_assignment(task.project_id, task_data.assigned_to)
        
        update_data = task_data.model_dump(exclude_unset=True)
        
        # Sanitizar inputs
        if "title" in update_data:
            update_data["title"] = InputSanitizer.sanitize_string(update_data["title"])
        if "description" in update_data:
            update_data["description"] = InputSanitizer.sanitize_string(update_data["description"])
        
        return self.task_repo.update(task, **update_data)

    def update_task_status(self, task_id: int, user_id: int, status_data: TaskStatusUpdate) -> Task:
        """Atualiza status da tarefa e registra no histórico"""
        task = self.get_task(task_id, user_id)
        
        old_status = task.status.value
        new_status = status_data.status.value
        
        if old_status != new_status:
            # Update status
            task = self.task_repo.update(task, status=status_data.status)
            
            # Record history - Audit trail
            self.history_repo.create(
                task_id=task_id,
                action_type=ActionType.STATUS_CHANGE,
                old_value=old_status,
                new_value=new_status,
                changed_by=user_id
            )
        
        return task

    def update_task_assignment(self, task_id: int, user_id: int, assignment_data: TaskAssignmentUpdate) -> Task:
        """Atualiza responsável da tarefa e registra no histórico"""
        task = self.get_task(task_id, user_id)
        
        # Validar atribuição
        self._validate_assignment(task.project_id, assignment_data.assigned_to)
        
        old_assignee = str(task.assigned_to) if task.assigned_to else None
        new_assignee = str(assignment_data.assigned_to) if assignment_data.assigned_to else None
        
        if old_assignee != new_assignee:
            # Update assignment
            task = self.task_repo.update(task, assigned_to=assignment_data.assigned_to)
            
            # Record history - Audit trail
            self.history_repo.create(
                task_id=task_id,
                action_type=ActionType.ASSIGNMENT_CHANGE,
                old_value=old_assignee,
                new_value=new_assignee,
                changed_by=user_id
            )
        
        return task

    def delete_task(self, task_id: int, user_id: int) -> None:
        """Deleta uma tarefa"""
        task = self.get_task(task_id, user_id)
        self.task_repo.delete(task)

    def get_task_history(self, task_id: int, user_id: int) -> List[TaskHistory]:
        """Obtém histórico de alterações da tarefa"""
        task = self.get_task(task_id, user_id)
        return self.history_repo.get_task_history(task_id)
