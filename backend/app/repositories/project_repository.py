from typing import Optional, List, Tuple

from sqlalchemy.orm import Session

from app.models.project import Project, ProjectMember, ProjectRole


class ProjectRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_by_id(self, project_id: int) -> Optional[Project]:
        return self.db.query(Project).filter(Project.id == project_id).first()

    def get_user_projects(self, user_id: int, page: int = 1, size: int = 10) -> Tuple[List[Project], int]:
        query = self.db.query(Project).join(ProjectMember).filter(
            ProjectMember.user_id == user_id
        )
        total = query.count()
        projects = query.offset((page - 1) * size).limit(size).all()
        return projects, total

    def create(self, name: str, description: Optional[str], owner_id: int) -> Project:
        project = Project(
            name=name,
            description=description,
            owner_id=owner_id
        )
        self.db.add(project)
        self.db.commit()
        self.db.refresh(project)
        return project

    def update(self, project: Project, **kwargs) -> Project:
        for key, value in kwargs.items():
            if value is not None:
                setattr(project, key, value)
        self.db.commit()
        self.db.refresh(project)
        return project

    def delete(self, project: Project) -> None:
        self.db.delete(project)
        self.db.commit()

    def is_member(self, project_id: int, user_id: int) -> bool:
        member = self.db.query(ProjectMember).filter(
            ProjectMember.project_id == project_id,
            ProjectMember.user_id == user_id
        ).first()
        return member is not None

    def is_admin(self, project_id: int, user_id: int) -> bool:
        member = self.db.query(ProjectMember).filter(
            ProjectMember.project_id == project_id,
            ProjectMember.user_id == user_id,
            ProjectMember.role == ProjectRole.ADMIN
        ).first()
        return member is not None


class ProjectMemberRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_by_id(self, member_id: int) -> Optional[ProjectMember]:
        return self.db.query(ProjectMember).filter(ProjectMember.id == member_id).first()

    def get_by_user_and_project(self, user_id: int, project_id: int) -> Optional[ProjectMember]:
        return self.db.query(ProjectMember).filter(
            ProjectMember.user_id == user_id,
            ProjectMember.project_id == project_id
        ).first()

    def get_project_members(self, project_id: int) -> List[ProjectMember]:
        return self.db.query(ProjectMember).filter(
            ProjectMember.project_id == project_id
        ).all()

    def create(self, user_id: int, project_id: int, role: ProjectRole = ProjectRole.MEMBER) -> ProjectMember:
        member = ProjectMember(
            user_id=user_id,
            project_id=project_id,
            role=role
        )
        self.db.add(member)
        self.db.commit()
        self.db.refresh(member)
        return member

    def delete(self, member: ProjectMember) -> None:
        self.db.delete(member)
        self.db.commit()
