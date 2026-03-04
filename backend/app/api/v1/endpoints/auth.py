"""
Endpoints de autenticação - Refatorado com segurança aprimorada
"""
from fastapi import APIRouter, Depends, Request
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.schemas.user import UserCreate, UserResponse
from app.schemas.auth import Token, LoginRequest
from app.services.auth_service import AuthService

router = APIRouter()


@router.post("/register", response_model=UserResponse, status_code=201)
def register(user_data: UserCreate, db: Session = Depends(get_db)):
    """
    Registra um novo usuário.
    
    Validações:
    - Email único e formato válido
    - Senha forte (8+ chars, maiúscula, minúscula, número, especial)
    """
    service = AuthService(db)
    user = service.register(user_data)
    return user


@router.post("/login", response_model=Token)
def login(
    request: Request,
    login_data: LoginRequest,
    db: Session = Depends(get_db)
):
    """
    Autentica usuário e retorna token JWT.
    
    Rate limited: 5 tentativas por minuto por IP
    """
    # Obter IP do cliente para rate limiting
    client_ip = request.client.host if request.client else "unknown"
    
    service = AuthService(db)
    return service.authenticate(
        login_data.email,
        login_data.password,
        client_ip=client_ip
    )
