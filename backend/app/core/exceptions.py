"""
Exceções customizadas da aplicação - Single Responsibility Principle (SRP)
Cada exceção tem uma responsabilidade clara e específica
"""
from typing import Optional, Any


class AppException(Exception):
    """Exceção base da aplicação"""
    def __init__(
        self,
        message: str,
        status_code: int = 500,
        detail: Optional[Any] = None
    ):
        self.message = message
        self.status_code = status_code
        self.detail = detail
        super().__init__(self.message)


# ============== Exceções de Autenticação ==============

class AuthenticationError(AppException):
    """Erro de autenticação"""
    def __init__(self, message: str = "Authentication failed"):
        super().__init__(message, status_code=401)


class InvalidCredentialsError(AuthenticationError):
    """Credenciais inválidas"""
    def __init__(self):
        super().__init__("Incorrect email or password")


class InvalidTokenError(AuthenticationError):
    """Token inválido ou expirado"""
    def __init__(self):
        super().__init__("Invalid or expired token")


class TokenExpiredError(AuthenticationError):
    """Token expirado"""
    def __init__(self):
        super().__init__("Token has expired")


# ============== Exceções de Autorização ==============

class AuthorizationError(AppException):
    """Erro de autorização"""
    def __init__(self, message: str = "Access denied"):
        super().__init__(message, status_code=403)


class InsufficientPermissionsError(AuthorizationError):
    """Permissões insuficientes"""
    def __init__(self, action: str = "perform this action"):
        super().__init__(f"You don't have permission to {action}")


class ProjectAccessDeniedError(AuthorizationError):
    """Acesso ao projeto negado"""
    def __init__(self):
        super().__init__("Access denied to this project")


class AdminRequiredError(AuthorizationError):
    """Ação requer privilégios de admin"""
    def __init__(self, action: str = "perform this action"):
        super().__init__(f"Only admins can {action}")


# ============== Exceções de Recursos ==============

class ResourceNotFoundError(AppException):
    """Recurso não encontrado"""
    def __init__(self, resource: str = "Resource", id: Optional[int] = None):
        message = f"{resource} not found" if id is None else f"{resource} with id {id} not found"
        super().__init__(message, status_code=404)


class UserNotFoundError(ResourceNotFoundError):
    """Usuário não encontrado"""
    def __init__(self, id: Optional[int] = None):
        super().__init__("User", id)


class ProjectNotFoundError(ResourceNotFoundError):
    """Projeto não encontrado"""
    def __init__(self, id: Optional[int] = None):
        super().__init__("Project", id)


class TaskNotFoundError(ResourceNotFoundError):
    """Tarefa não encontrada"""
    def __init__(self, id: Optional[int] = None):
        super().__init__("Task", id)


class MemberNotFoundError(ResourceNotFoundError):
    """Membro não encontrado"""
    def __init__(self):
        super().__init__("Member")


# ============== Exceções de Validação ==============

class ValidationError(AppException):
    """Erro de validação"""
    def __init__(self, message: str, detail: Optional[Any] = None):
        super().__init__(message, status_code=400, detail=detail)


class DuplicateResourceError(ValidationError):
    """Recurso duplicado"""
    def __init__(self, resource: str, field: str):
        super().__init__(f"{resource} with this {field} already exists")


class EmailAlreadyRegisteredError(DuplicateResourceError):
    """Email já registrado"""
    def __init__(self):
        super().__init__("User", "email")


class MemberAlreadyExistsError(ValidationError):
    """Membro já existe no projeto"""
    def __init__(self):
        super().__init__("User is already a member of this project")


class InvalidAssignmentError(ValidationError):
    """Atribuição inválida"""
    def __init__(self):
        super().__init__("Assigned user is not a member of the project")


class CannotRemoveLastAdminError(ValidationError):
    """Não pode remover último admin"""
    def __init__(self):
        super().__init__("Cannot remove the last admin from the project")


class WeakPasswordError(ValidationError):
    """Senha fraca"""
    def __init__(self, requirements: str):
        super().__init__(f"Password is too weak. {requirements}")


# ============== Exceções de Rate Limiting ==============

class RateLimitExceededError(AppException):
    """Rate limit excedido"""
    def __init__(self, retry_after: int = 60):
        super().__init__(
            f"Too many requests. Please try again in {retry_after} seconds",
            status_code=429
        )
        self.retry_after = retry_after
