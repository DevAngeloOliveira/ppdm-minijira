"""
Interfaces (Protocols) para aplicar Dependency Inversion Principle (DIP)
"""
from typing import Protocol, Optional, List, Tuple, TypeVar, Generic
from abc import abstractmethod

T = TypeVar('T')


class IRepository(Protocol[T]):
    """Interface base para repositórios - DIP"""
    
    @abstractmethod
    def get_by_id(self, id: int) -> Optional[T]:
        """Buscar entidade por ID"""
        ...
    
    @abstractmethod
    def delete(self, entity: T) -> None:
        """Deletar entidade"""
        ...


class IUserRepository(Protocol):
    """Interface para UserRepository"""
    
    @abstractmethod
    def get_by_id(self, user_id: int) -> Optional["User"]:
        ...
    
    @abstractmethod
    def get_by_email(self, email: str) -> Optional["User"]:
        ...
    
    @abstractmethod
    def create(self, name: str, email: str, password: str) -> "User":
        ...
    
    @abstractmethod
    def update(self, user: "User", **kwargs) -> "User":
        ...
    
    @abstractmethod
    def delete(self, user: "User") -> None:
        ...


class IProjectRepository(Protocol):
    """Interface para ProjectRepository"""
    
    @abstractmethod
    def get_by_id(self, project_id: int) -> Optional["Project"]:
        ...
    
    @abstractmethod
    def create(self, name: str, description: str, owner_id: int) -> "Project":
        ...
    
    @abstractmethod
    def update(self, project: "Project", **kwargs) -> "Project":
        ...
    
    @abstractmethod
    def delete(self, project: "Project") -> None:
        ...
    
    @abstractmethod
    def is_member(self, project_id: int, user_id: int) -> bool:
        ...
    
    @abstractmethod
    def is_admin(self, project_id: int, user_id: int) -> bool:
        ...
    
    @abstractmethod
    def get_user_projects(self, user_id: int, page: int, size: int) -> Tuple[List["Project"], int]:
        ...


class ITaskRepository(Protocol):
    """Interface para TaskRepository"""
    
    @abstractmethod
    def get_by_id(self, task_id: int) -> Optional["Task"]:
        ...
    
    @abstractmethod
    def create(self, title: str, description: str, priority: str, project_id: int) -> "Task":
        ...
    
    @abstractmethod
    def update(self, task: "Task", **kwargs) -> "Task":
        ...
    
    @abstractmethod
    def delete(self, task: "Task") -> None:
        ...
    
    @abstractmethod
    def get_project_tasks(
        self, project_id: int, status: Optional[str], page: int, size: int
    ) -> Tuple[List["Task"], int]:
        ...


class IPasswordHasher(Protocol):
    """Interface para serviço de hash de senhas - SRP"""
    
    @abstractmethod
    def hash(self, password: str) -> str:
        ...
    
    @abstractmethod
    def verify(self, plain_password: str, hashed_password: str) -> bool:
        ...


class ITokenService(Protocol):
    """Interface para serviço de tokens JWT - SRP"""
    
    @abstractmethod
    def create_token(self, data: dict, expires_minutes: Optional[int] = None) -> str:
        ...
    
    @abstractmethod
    def decode_token(self, token: str) -> Optional[dict]:
        ...
