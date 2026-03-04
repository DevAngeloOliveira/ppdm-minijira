from typing import Tuple, List

from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from app.repositories.project_repository import ProjectRepository, ProjectMemberRepository
from app.repositories.user_repository import UserRepository
from app.models.project import Project, ProjectMember, ProjectRole
from app.schemas.project import ProjectCreate, ProjectUpdate, ProjectMemberCreate


class ProjectService:
    def __init__(self, db: Session):
        self.db = db
        self.project_repo = ProjectRepository(db)
        self.member_repo = ProjectMemberRepository(db)
        self.user_repo = UserRepository(db)

    def create_project(self, user_id: int, project_data: ProjectCreate) -> Project:
        project = self.project_repo.create(
            name=project_data.name,
            description=project_data.description,
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
        
        return project

    def list_user_projects(self, user_id: int, page: int = 1, size: int = 10) -> Tuple[List[Project], int]:
        return self.project_repo.get_user_projects(user_id, page, size)

    def update_project(self, project_id: int, user_id: int, project_data: ProjectUpdate) -> Project:
        project = self.get_project(project_id, user_id)
        
        if not self.project_repo.is_admin(project_id, user_id):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only admins can update the project"
            )
        
        update_data = project_data.model_dump(exclude_unset=True)
        return self.project_repo.update(project, **update_data)

    def delete_project(self, project_id: int, user_id: int) -> None:
        project = self.get_project(project_id, user_id)
        
        if not self.project_repo.is_admin(project_id, user_id):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only admins can delete the project"
            )
        
        self.project_repo.delete(project)

    def add_member(self, project_id: int, user_id: int, member_data: ProjectMemberCreate) -> ProjectMember:
        self.get_project(project_id, user_id)
        
        if not self.project_repo.is_admin(project_id, user_id):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only admins can add members"
            )
        
        # Check if user exists
        target_user = self.user_repo.get_by_id(member_data.user_id)
        if not target_user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        # Check if already a member
        existing = self.member_repo.get_by_user_and_project(member_data.user_id, project_id)
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="User is already a member of this project"
            )
        
        return self.member_repo.create(
            user_id=member_data.user_id,
            project_id=project_id,
            role=member_data.role
        )

    def remove_member(self, project_id: int, user_id: int, member_user_id: int) -> None:
        self.get_project(project_id, user_id)
        
        if not self.project_repo.is_admin(project_id, user_id):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only admins can remove members"
            )
        
        member = self.member_repo.get_by_user_and_project(member_user_id, project_id)
        if not member:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Member not found"
            )
        
        # Prevent removing the last admin
        project = self.project_repo.get_by_id(project_id)
        if member.role == ProjectRole.ADMIN:
            admin_count = sum(1 for m in project.members if m.role == ProjectRole.ADMIN)
            if admin_count <= 1:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Cannot remove the last admin"
                )
        
        self.member_repo.delete(member)

    def get_project_members(self, project_id: int, user_id: int) -> List[ProjectMember]:
        self.get_project(project_id, user_id)
        return self.member_repo.get_project_members(project_id)
