"""
Handler global de exceções - Converte exceções customizadas em respostas HTTP
"""
from fastapi import Request, status
from fastapi.responses import JSONResponse

from app.core.exceptions import (
    AppException,
    AuthenticationError,
    AuthorizationError,
    ResourceNotFoundError,
    ValidationError,
    RateLimitExceededError,
)


async def app_exception_handler(request: Request, exc: AppException) -> JSONResponse:
    """Handler para exceções da aplicação"""
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "detail": exc.message,
            "type": exc.__class__.__name__,
        }
    )


async def authentication_exception_handler(request: Request, exc: AuthenticationError) -> JSONResponse:
    """Handler para exceções de autenticação"""
    return JSONResponse(
        status_code=status.HTTP_401_UNAUTHORIZED,
        content={"detail": exc.message},
        headers={"WWW-Authenticate": "Bearer"},
    )


async def rate_limit_exception_handler(request: Request, exc: RateLimitExceededError) -> JSONResponse:
    """Handler para rate limit"""
    return JSONResponse(
        status_code=status.HTTP_429_TOO_MANY_REQUESTS,
        content={"detail": exc.message},
        headers={"Retry-After": str(exc.retry_after)},
    )


def register_exception_handlers(app):
    """Registra todos os handlers de exceção"""
    app.add_exception_handler(AppException, app_exception_handler)
    app.add_exception_handler(AuthenticationError, authentication_exception_handler)
    app.add_exception_handler(RateLimitExceededError, rate_limit_exception_handler)
