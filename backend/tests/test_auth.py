"""
Testes unitários para serviço de autenticação
"""
import pytest
from unittest.mock import Mock, patch

from app.services.auth_service import AuthService, UserService
from app.core.exceptions import (
    InvalidCredentialsError,
    EmailAlreadyRegisteredError,
    WeakPasswordError,
    RateLimitExceededError,
    UserNotFoundError,
)
from app.schemas.user import UserCreate
from app.schemas.auth import Token


class TestAuthService:
    """Testes para AuthService"""
    
    def test_register_success(self, db, client):
        """Teste de registro com sucesso"""
        response = client.post(
            "/api/v1/auth/register",
            json={
                "name": "New User",
                "email": "newuser@example.com",
                "password": "Strong@Pass123"
            }
        )
        
        assert response.status_code == 201
        data = response.json()
        assert data["email"] == "newuser@example.com"
        assert data["name"] == "New User"
        assert "id" in data
    
    def test_register_duplicate_email(self, db, client, test_user):
        """Teste de registro com email duplicado"""
        response = client.post(
            "/api/v1/auth/register",
            json={
                "name": "Another User",
                "email": "test@example.com",  # Email já existe
                "password": "Strong@Pass123"
            }
        )
        
        assert response.status_code == 400
        assert "already" in response.json()["detail"].lower()
    
    def test_register_weak_password(self, db, client):
        """Teste de registro com senha fraca"""
        response = client.post(
            "/api/v1/auth/register",
            json={
                "name": "New User",
                "email": "weak@example.com",
                "password": "123"  # Senha muito fraca
            }
        )
        
        assert response.status_code == 400
        assert "senha" in response.json()["detail"].lower() or "password" in response.json()["detail"].lower()
    
    def test_login_success(self, db, client, test_user):
        """Teste de login com sucesso"""
        response = client.post(
            "/api/v1/auth/login",
            json={
                "email": "test@example.com",
                "password": "Test@123456"
            }
        )
        
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
    
    def test_login_invalid_credentials(self, db, client, test_user):
        """Teste de login com credenciais inválidas"""
        response = client.post(
            "/api/v1/auth/login",
            json={
                "email": "test@example.com",
                "password": "WrongPassword123!"
            }
        )
        
        assert response.status_code == 401
    
    def test_login_nonexistent_user(self, db, client):
        """Teste de login com usuário inexistente"""
        response = client.post(
            "/api/v1/auth/login",
            json={
                "email": "nonexistent@example.com",
                "password": "SomePassword123!"
            }
        )
        
        assert response.status_code == 401


class TestUserService:
    """Testes para UserService"""
    
    def test_get_current_user(self, db, client, test_user, auth_headers):
        """Teste de obter usuário atual"""
        response = client.get(
            "/api/v1/users/me",
            headers=auth_headers
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["email"] == "test@example.com"
    
    def test_get_current_user_unauthorized(self, db, client):
        """Teste de obter usuário atual sem autenticação"""
        response = client.get("/api/v1/users/me")
        
        assert response.status_code == 401
