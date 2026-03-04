"""
Validadores de segurança - Single Responsibility Principle (SRP)
"""
import re
from typing import List, Tuple


class PasswordValidator:
    """
    Validador de senhas forte - SRP
    Cada método tem uma responsabilidade única
    """
    
    MIN_LENGTH = 8
    MAX_LENGTH = 72  # Limite do bcrypt
    
    REQUIREMENTS = [
        ("pelo menos 8 caracteres", lambda p: len(p) >= 8),
        ("pelo menos uma letra maiúscula", lambda p: bool(re.search(r'[A-Z]', p))),
        ("pelo menos uma letra minúscula", lambda p: bool(re.search(r'[a-z]', p))),
        ("pelo menos um número", lambda p: bool(re.search(r'\d', p))),
        ("pelo menos um caractere especial (!@#$%^&*)", lambda p: bool(re.search(r'[!@#$%^&*(),.?":{}|<>]', p))),
    ]
    
    @classmethod
    def validate(cls, password: str) -> Tuple[bool, List[str]]:
        """
        Valida a senha e retorna tupla (is_valid, errors)
        """
        if len(password) > cls.MAX_LENGTH:
            return False, [f"Senha não pode ter mais de {cls.MAX_LENGTH} caracteres"]
        
        errors = []
        for requirement, check in cls.REQUIREMENTS:
            if not check(password):
                errors.append(requirement)
        
        return len(errors) == 0, errors
    
    @classmethod
    def get_requirements_text(cls) -> str:
        """Retorna texto com todos os requisitos"""
        return "A senha deve conter: " + ", ".join([req for req, _ in cls.REQUIREMENTS])


class EmailValidator:
    """Validador de email - SRP"""
    
    EMAIL_PATTERN = re.compile(
        r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    )
    
    BLOCKED_DOMAINS = [
        'tempmail.com',
        'throwaway.com',
        'guerrillamail.com',
    ]
    
    @classmethod
    def validate(cls, email: str) -> Tuple[bool, str]:
        """Valida email e retorna tupla (is_valid, error_message)"""
        if not cls.EMAIL_PATTERN.match(email):
            return False, "Formato de email inválido"
        
        domain = email.split('@')[1].lower()
        if domain in cls.BLOCKED_DOMAINS:
            return False, "Domínio de email não permitido"
        
        return True, ""


class InputSanitizer:
    """Sanitizador de inputs - SRP"""
    
    # Padrões perigosos para SQL Injection
    SQL_PATTERNS = [
        r"(\s|^)(SELECT|INSERT|UPDATE|DELETE|DROP|UNION|ALTER)(\s|$)",
        r"--",
        r";.*--",
        r"'.*OR.*'",
    ]
    
    # Padrões perigosos para XSS
    XSS_PATTERNS = [
        r"<script.*?>",
        r"javascript:",
        r"on\w+\s*=",
    ]
    
    @classmethod
    def sanitize_string(cls, value: str) -> str:
        """Remove caracteres perigosos de strings"""
        # Remove tags HTML
        value = re.sub(r'<[^>]*>', '', value)
        # Remove caracteres de controle
        value = re.sub(r'[\x00-\x1f\x7f-\x9f]', '', value)
        return value.strip()
    
    @classmethod
    def is_safe(cls, value: str) -> bool:
        """Verifica se o valor é seguro"""
        value_upper = value.upper()
        
        for pattern in cls.SQL_PATTERNS:
            if re.search(pattern, value_upper, re.IGNORECASE):
                return False
        
        for pattern in cls.XSS_PATTERNS:
            if re.search(pattern, value, re.IGNORECASE):
                return False
        
        return True


class RateLimiter:
    """
    Rate limiter simples em memória - SRP
    Para produção, usar Redis
    """
    
    def __init__(self, max_requests: int = 100, window_seconds: int = 60):
        self.max_requests = max_requests
        self.window_seconds = window_seconds
        self._requests: dict = {}
    
    def is_allowed(self, identifier: str) -> bool:
        """Verifica se a requisição é permitida"""
        import time
        
        current_time = time.time()
        window_start = current_time - self.window_seconds
        
        # Limpa requisições antigas
        if identifier in self._requests:
            self._requests[identifier] = [
                t for t in self._requests[identifier] if t > window_start
            ]
        else:
            self._requests[identifier] = []
        
        # Verifica limite
        if len(self._requests[identifier]) >= self.max_requests:
            return False
        
        # Registra requisição
        self._requests[identifier].append(current_time)
        return True
    
    def get_remaining(self, identifier: str) -> int:
        """Retorna requisições restantes"""
        import time
        
        current_time = time.time()
        window_start = current_time - self.window_seconds
        
        if identifier not in self._requests:
            return self.max_requests
        
        current_requests = len([
            t for t in self._requests[identifier] if t > window_start
        ])
        
        return max(0, self.max_requests - current_requests)


# Instância global do rate limiter
rate_limiter = RateLimiter(max_requests=100, window_seconds=60)

# Rate limiter específico para login (mais restritivo)
login_rate_limiter = RateLimiter(max_requests=5, window_seconds=60)
