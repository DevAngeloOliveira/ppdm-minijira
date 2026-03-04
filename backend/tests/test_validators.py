"""
Testes unitários para validadores de segurança
"""
import pytest

from app.core.validators import (
    PasswordValidator,
    EmailValidator,
    InputSanitizer,
    RateLimiter,
)


class TestPasswordValidator:
    """Testes para validador de senhas"""
    
    def test_valid_password(self):
        """Teste de senha válida"""
        is_valid, errors = PasswordValidator.validate("Strong@Pass123")
        assert is_valid is True
        assert len(errors) == 0
    
    def test_password_too_short(self):
        """Teste de senha muito curta"""
        is_valid, errors = PasswordValidator.validate("Abc@1")
        assert is_valid is False
        assert any("8 caracteres" in error for error in errors)
    
    def test_password_no_uppercase(self):
        """Teste de senha sem maiúscula"""
        is_valid, errors = PasswordValidator.validate("strong@pass123")
        assert is_valid is False
        assert any("maiúscula" in error for error in errors)
    
    def test_password_no_lowercase(self):
        """Teste de senha sem minúscula"""
        is_valid, errors = PasswordValidator.validate("STRONG@PASS123")
        assert is_valid is False
        assert any("minúscula" in error for error in errors)
    
    def test_password_no_number(self):
        """Teste de senha sem número"""
        is_valid, errors = PasswordValidator.validate("Strong@Password")
        assert is_valid is False
        assert any("número" in error for error in errors)
    
    def test_password_no_special(self):
        """Teste de senha sem caractere especial"""
        is_valid, errors = PasswordValidator.validate("StrongPass123")
        assert is_valid is False
        assert any("especial" in error for error in errors)
    
    def test_password_too_long(self):
        """Teste de senha muito longa (limite bcrypt)"""
        long_password = "A" * 73 + "@1a"
        is_valid, errors = PasswordValidator.validate(long_password)
        assert is_valid is False
        assert any("72" in error for error in errors)


class TestEmailValidator:
    """Testes para validador de email"""
    
    def test_valid_email(self):
        """Teste de email válido"""
        is_valid, error = EmailValidator.validate("user@example.com")
        assert is_valid is True
        assert error == ""
    
    def test_invalid_email_no_at(self):
        """Teste de email sem @"""
        is_valid, error = EmailValidator.validate("userexample.com")
        assert is_valid is False
        assert "inválido" in error.lower()
    
    def test_invalid_email_no_domain(self):
        """Teste de email sem domínio"""
        is_valid, error = EmailValidator.validate("user@")
        assert is_valid is False
    
    def test_blocked_domain(self):
        """Teste de domínio bloqueado"""
        is_valid, error = EmailValidator.validate("user@tempmail.com")
        assert is_valid is False
        assert "não permitido" in error.lower()


class TestInputSanitizer:
    """Testes para sanitizador de input"""
    
    def test_sanitize_removes_html(self):
        """Teste de remoção de HTML"""
        result = InputSanitizer.sanitize_string("<script>alert('xss')</script>Test")
        assert "<script>" not in result
        assert "Test" in result
    
    def test_sanitize_removes_control_chars(self):
        """Teste de remoção de caracteres de controle"""
        result = InputSanitizer.sanitize_string("Test\x00\x1fString")
        assert "\x00" not in result
        assert "\x1f" not in result
    
    def test_is_safe_normal_input(self):
        """Teste de input normal é seguro"""
        assert InputSanitizer.is_safe("Normal text input") is True
    
    def test_is_safe_sql_injection(self):
        """Teste de detecção de SQL injection"""
        assert InputSanitizer.is_safe("'; DROP TABLE users; --") is False
    
    def test_is_safe_xss(self):
        """Teste de detecção de XSS"""
        assert InputSanitizer.is_safe("<script>alert('xss')</script>") is False


class TestRateLimiter:
    """Testes para rate limiter"""
    
    def test_allows_within_limit(self):
        """Teste de permitir requisições dentro do limite"""
        limiter = RateLimiter(max_requests=5, window_seconds=60)
        
        for _ in range(5):
            assert limiter.is_allowed("test_client") is True
    
    def test_blocks_over_limit(self):
        """Teste de bloquear requisições acima do limite"""
        limiter = RateLimiter(max_requests=3, window_seconds=60)
        
        for _ in range(3):
            limiter.is_allowed("test_client")
        
        # Quarta requisição deve ser bloqueada
        assert limiter.is_allowed("test_client") is False
    
    def test_different_clients_separate_limits(self):
        """Teste de limites separados por cliente"""
        limiter = RateLimiter(max_requests=2, window_seconds=60)
        
        # Cliente 1 usa suas 2 requisições
        limiter.is_allowed("client1")
        limiter.is_allowed("client1")
        
        # Cliente 2 ainda pode fazer requisições
        assert limiter.is_allowed("client2") is True
    
    def test_get_remaining(self):
        """Teste de obter requisições restantes"""
        limiter = RateLimiter(max_requests=5, window_seconds=60)
        
        assert limiter.get_remaining("test_client") == 5
        
        limiter.is_allowed("test_client")
        assert limiter.get_remaining("test_client") == 4
