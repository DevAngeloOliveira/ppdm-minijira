from datetime import datetime
from typing import Optional, List

from pydantic import BaseModel, ConfigDict

from app.models.project import ProjectRole


class ProjectBase(BaseModel):
    name: str
    description: Optional[str] = None


class ProjectCreate(ProjectBase):
    pass


class ProjectUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None


class ProjectMemberBase(BaseModel):
    user_id: int
    role: ProjectRole = ProjectRole.MEMBER


class ProjectMemberCreate(ProjectMemberBase):
    pass


class ProjectMemberResponse(ProjectMemberBase):
    id: int
    project_id: int
    user_name: Optional[str] = None
    user_email: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


class ProjectResponse(ProjectBase):
    id: int
    owner_id: int
    created_at: datetime
    members: List[ProjectMemberResponse] = []

    model_config = ConfigDict(from_attributes=True)


class ProjectListResponse(BaseModel):
    items: List[ProjectResponse]
    page: int
    size: int
    total: int
