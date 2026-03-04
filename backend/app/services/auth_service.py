"""
Serviços de autenticação e usuário - Refatorado com SOLID

SRP: Cada serviço tem uma responsabilidade única
OCP: Aberto para extensão através de interfaces
DIP: Depende de abstrações (repositórios injetados)
"""
from typing import Optional
from datetime import timedelta

from sqlalchemy.orm import Session

from app.repositories.user_repository import UserRepository
from app.core.security import verify_password, create_access_token
from app.core.config import settings
from app.core.validators import PasswordValidator, EmailValidator, login_rate_limiter
from app.core.exceptions import (
    InvalidCredentialsError,
    EmailAlreadyRegisteredError,
    UserNotFoundError,
    WeakPasswordError,
    RateLimitExceededError,
    ValidationError,
)
from app.models.user import User
from app.schemas.user import UserCreate, UserUpdate
from app.schemas.auth import Token


class AuthService:
    """
    Serviço de autenticação - SRP
    Responsabilidade: Gerenciar registro e login de usuários
    """
    
    def __init__(self, db: Session, user_repo: Optional[UserRepository] = None):
        self.db = db
        # DIP: Permite injeção de dependência para testes
        self.user_repo = user_repo or UserRepository(db)

    def register(self, user_data: UserCreate) -> User:
        """
        Registra um novo usuário com validações de segurança
        """
        # Validar email
        is_valid, error = EmailValidator.validate(user_data.email)
        if not is_valid:
            raise ValidationError(error)
        
        # Validar senha forte
        is_valid, errors = PasswordValidator.validate(user_data.password)
        if not is_valid:
            raise WeakPasswordError(
                "A senha deve conter: " + ", ".join(errors)
            )
        
        # Verificar email duplicado
        existing_user = self.user_repo.get_by_email(user_data.email)
        if existing_user:
            raise EmailAlreadyRegisteredError()
        
        # Criar usuário
        user = self.user_repo.create(
            name=user_data.name,
            email=user_data.email,
            password=user_data.password
        )
        return user

    def authenticate(self, email: str, password: str, client_ip: str = "unknown") -> Token:
        """
        Autentica usuário com rate limiting para prevenir brute force
        """
        # Rate limiting por IP
        if not login_rate_limiter.is_allowed(client_ip):
            raise RateLimitExceededError(retry_after=60)
        
        user = self.user_repo.get_by_email(email)
        if not user or not verify_password(password, user.password_hash):
            raise InvalidCredentialsError()
        
        access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={"sub": str(user.id)},
            expires_delta=access_token_expires
        )
        return Token(access_token=access_token)


class UserService:
    """
    Serviço de usuário - SRP
    Responsabilidade: Operações CRUD em usuários
    """
    
    def __init__(self, db: Session, user_repo: Optional[UserRepository] = None):
        self.db = db
        self.user_repo = user_repo or UserRepository(db)

    def get_user(self, user_id: int) -> User:
        user = self.user_repo.get_by_id(user_id)
        if not user:
            raise UserNotFoundError(user_id)
        return user

    def update_user(self, user_id: int, user_data: UserUpdate) -> User:
        user = self.get_user(user_id)
        
        if user_data.email:
            # Validar novo email
            is_valid, error = EmailValidator.validate(user_data.email)
            if not is_valid:
                raise ValidationError(error)
            
            existing = self.user_repo.get_by_email(user_data.email)
            if existing and existing.id != user_id:
                raise EmailAlreadyRegisteredError()
        
        if user_data.password:
            # Validar nova senha
            is_valid, errors = PasswordValidator.validate(user_data.password)
            if not is_valid:
                raise WeakPasswordError(
                    "A senha deve conter: " + ", ".join(errors)
                )
        
        update_data = user_data.model_dump(exclude_unset=True)
        return self.user_repo.update(user, **update_data)
