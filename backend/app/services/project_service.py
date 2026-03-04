"""
Serviço de projetos - Refatorado com SOLID

SRP: Responsabilidade única de gerenciar projetos
OCP: Extensível através de injeção de dependência
LSP: Segue contratos de interface
DIP: Depende de abstrações
"""
from typing import Tuple, List, Optional

from sqlalchemy.orm import Session

from app.repositories.project_repository import ProjectRepository, ProjectMemberRepository
from app.repositories.user_repository import UserRepository
from app.models.project import Project, ProjectMember, ProjectRole
from app.schemas.project import ProjectCreate, ProjectUpdate, ProjectMemberCreate
from app.core.exceptions import (
    ProjectNotFoundError,
    UserNotFoundError,
    ProjectAccessDeniedError,
    AdminRequiredError,
    MemberAlreadyExistsError,
    MemberNotFoundError,
    CannotRemoveLastAdminError,
)
from app.core.validators import InputSanitizer


class ProjectService:
    """
    Serviço de gerenciamento de projetos - SRP
    """
    
    def __init__(
        self,
        db: Session,
        project_repo: Optional[ProjectRepository] = None,
        member_repo: Optional[ProjectMemberRepository] = None,
        user_repo: Optional[UserRepository] = None
    ):
        self.db = db
        # DIP: Permite injeção de dependência para testes
        self.project_repo = project_repo or ProjectRepository(db)
        self.member_repo = member_repo or ProjectMemberRepository(db)
        self.user_repo = user_repo or UserRepository(db)

    def _check_access(self, project_id: int, user_id: int) -> Project:
        """Verifica acesso ao projeto - DRY principle"""
        project = self.project_repo.get_by_id(project_id)
        if not project:
            raise ProjectNotFoundError(project_id)
        
        if not self.project_repo.is_member(project_id, user_id):
            raise ProjectAccessDeniedError()
        
        return project
    
    def _require_admin(self, project_id: int, user_id: int, action: str) -> None:
        """Verifica se usuário é admin - DRY principle"""
        if not self.project_repo.is_admin(project_id, user_id):
            raise AdminRequiredError(action)

    def create_project(self, user_id: int, project_data: ProjectCreate) -> Project:
        """Cria um novo projeto"""
        # Sanitizar inputs
        name = InputSanitizer.sanitize_string(project_data.name)
        description = InputSanitizer.sanitize_string(project_data.description or "")
        
        project = self.project_repo.create(
            name=name,
            description=description,
            owner_id=user_id
        )
        
        # Creator is automatically ADMIN
        self.member_repo.create(
            user_id=user_id,
            project_id=project.id,
            role=ProjectRole.ADMIN
        )
        
        return project

    def get_project(self, project_id: int, user_id: int) -> Project:
        """Obtém um projeto com verificação de acesso"""
        return self._check_access(project_id, user_id)

    def list_user_projects(self, user_id: int, page: int = 1, size: int = 10) -> Tuple[List[Project], int]:
        """Lista projetos do usuário com paginação"""
        return self.project_repo.get_user_projects(user_id, page, size)

    def update_project(self, project_id: int, user_id: int, project_data: ProjectUpdate) -> Project:
        """Atualiza projeto - somente admin"""
        project = self._check_access(project_id, user_id)
        self._require_admin(project_id, user_id, "update the project")
        
        update_data = project_data.model_dump(exclude_unset=True)
        
        # Sanitizar inputs
        if "name" in update_data:
            update_data["name"] = InputSanitizer.sanitize_string(update_data["name"])
        if "description" in update_data:
            update_data["description"] = InputSanitizer.sanitize_string(update_data["description"])
        
        return self.project_repo.update(project, **update_data)

    def delete_project(self, project_id: int, user_id: int) -> None:
        """Deleta projeto - somente admin"""
        project = self._check_access(project_id, user_id)
        self._require_admin(project_id, user_id, "delete the project")
        self.project_repo.delete(project)

    def add_member(self, project_id: int, user_id: int, member_data: ProjectMemberCreate) -> ProjectMember:
        """Adiciona membro ao projeto - somente admin"""
        self._check_access(project_id, user_id)
        self._require_admin(project_id, user_id, "add members")
        
        # Check if user exists
        target_user = self.user_repo.get_by_id(member_data.user_id)
        if not target_user:
            raise UserNotFoundError(member_data.user_id)
        
        # Check if already a member
        existing = self.member_repo.get_by_user_and_project(member_data.user_id, project_id)
        if existing:
            raise MemberAlreadyExistsError()
        
        return self.member_repo.create(
            user_id=member_data.user_id,
            project_id=project_id,
            role=member_data.role
        )

    def remove_member(self, project_id: int, user_id: int, member_user_id: int) -> None:
        """Remove membro do projeto - somente admin"""
        self._check_access(project_id, user_id)
        self._require_admin(project_id, user_id, "remove members")
        
        member = self.member_repo.get_by_user_and_project(member_user_id, project_id)
        if not member:
            raise MemberNotFoundError()
        
        # Prevent removing the last admin
        if member.role == ProjectRole.ADMIN:
            project = self.project_repo.get_by_id(project_id)
            admin_count = sum(1 for m in project.members if m.role == ProjectRole.ADMIN)
            if admin_count <= 1:
                raise CannotRemoveLastAdminError()
        
        self.member_repo.delete(member)

    def get_project_members(self, project_id: int, user_id: int) -> List[ProjectMember]:
        """Lista membros do projeto"""
        self._check_access(project_id, user_id)
        return self.member_repo.get_project_members(project_id)
