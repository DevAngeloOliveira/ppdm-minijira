# Mini Jira - Sistema de Gestão de Projetos e Tarefas

## 📋 Descrição

Sistema full stack para gestão de projetos e tarefas com fluxo Kanban, desenvolvido como projeto acadêmico para a Cadeira de Programação para Dispositivos Móveis (PPDM).

## 🏗️ Arquitetura Geral

- **Backend:** FastAPI (Python 3.11+)
- **Web:** Next.js 14 (TypeScript)
- **Mobile:** React Native / Expo
- **Banco de Dados:** PostgreSQL 15

---

# 🐍 Backend - Documentação Completa

## Arquitetura

O backend segue uma arquitetura em camadas com princípios **SOLID**:

```
┌─────────────────────────────────────────────────────────────┐
│                        API Layer                            │
│                    (Routers/Endpoints)                      │
├─────────────────────────────────────────────────────────────┤
│                      Service Layer                          │
│                   (Business Logic)                          │
├─────────────────────────────────────────────────────────────┤
│                    Repository Layer                         │
│                    (Data Access)                            │
├─────────────────────────────────────────────────────────────┤
│                      Model Layer                            │
│                  (SQLAlchemy ORM)                           │
├─────────────────────────────────────────────────────────────┤
│                       Database                              │
│                    (PostgreSQL)                             │
└─────────────────────────────────────────────────────────────┘
```

### Princípios SOLID Aplicados

| Princípio | Implementação |
|-----------|---------------|
| **S** - Single Responsibility | Cada classe tem uma única responsabilidade (Services, Repositories, Validators) |
| **O** - Open/Closed | Uso de interfaces/protocols para extensibilidade |
| **L** - Liskov Substitution | Repositories implementam interfaces comuns |
| **I** - Interface Segregation | Interfaces específicas em `core/interfaces.py` |
| **D** - Dependency Inversion | Services dependem de abstrações, não implementações concretas |

## 📁 Estrutura do Backend

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py                    # Aplicação FastAPI principal
│   ├── api/
│   │   ├── __init__.py
│   │   └── v1/
│   │       ├── __init__.py
│   │       ├── router.py          # Agregador de rotas
│   │       ├── dependencies.py    # Injeção de dependências (auth)
│   │       └── endpoints/
│   │           ├── __init__.py
│   │           ├── auth.py        # Login, Registro
│   │           ├── users.py       # Gerenciamento de usuários
│   │           ├── projects.py    # CRUD de projetos
│   │           └── tasks.py       # CRUD de tarefas
│   ├── core/
│   │   ├── __init__.py
│   │   ├── config.py              # Configurações (Pydantic Settings)
│   │   ├── database.py            # Conexão SQLAlchemy
│   │   ├── security.py            # JWT, bcrypt
│   │   ├── interfaces.py          # Protocols/Interfaces (DIP)
│   │   ├── exceptions.py          # Exceções customizadas
│   │   ├── exception_handlers.py  # Handlers globais de erro
│   │   └── validators.py          # Validadores de segurança
│   ├── models/
│   │   ├── __init__.py
│   │   ├── user.py                # Modelo User
│   │   ├── project.py             # Modelos Project, ProjectMember
│   │   └── task.py                # Modelos Task, TaskHistory
│   ├── repositories/
│   │   ├── __init__.py
│   │   ├── user_repository.py     # Acesso a dados de usuários
│   │   ├── project_repository.py  # Acesso a dados de projetos
│   │   └── task_repository.py     # Acesso a dados de tarefas
│   ├── schemas/
│   │   ├── __init__.py
│   │   ├── auth.py                # DTOs de autenticação
│   │   ├── user.py                # DTOs de usuário
│   │   ├── project.py             # DTOs de projeto
│   │   ├── task.py                # DTOs de tarefa
│   │   └── common.py              # DTOs compartilhados
│   └── services/
│       ├── __init__.py
│       ├── auth_service.py        # Lógica de autenticação
│       ├── project_service.py     # Lógica de projetos
│       └── task_service.py        # Lógica de tarefas
├── tests/
│   ├── __init__.py
│   ├── conftest.py                # Fixtures pytest
│   ├── test_auth.py               # Testes de autenticação
│   ├── test_projects.py           # Testes de projetos
│   ├── test_tasks.py              # Testes de tarefas
│   └── test_validators.py         # Testes de validadores
├── alembic/
│   ├── versions/                  # Migrations
│   └── env.py
├── alembic.ini
├── requirements.txt
├── Dockerfile
└── .env.example
```

## 📊 Modelos de Dados

### User
```python
class User:
    id: int (PK)
    name: str
    email: str (unique)
    password_hash: str
    created_at: datetime (UTC)
```

### Project
```python
class Project:
    id: int (PK)
    name: str
    description: str (optional)
    owner_id: int (FK -> User)
    created_at: datetime (UTC)
```

### ProjectMember
```python
class ProjectMember:
    id: int (PK)
    user_id: int (FK -> User)
    project_id: int (FK -> Project)
    role: ProjectRole (ADMIN | MEMBER)
```

### Task
```python
class Task:
    id: int (PK)
    title: str
    description: str (optional)
    status: TaskStatus (TODO | DOING | DONE)
    priority: TaskPriority (LOW | MEDIUM | HIGH)
    project_id: int (FK -> Project)
    assigned_to: int (FK -> User, optional)
    created_at: datetime (UTC)
    updated_at: datetime (UTC)
```

### TaskHistory
```python
class TaskHistory:
    id: int (PK)
    task_id: int (FK -> Task)
    action_type: ActionType (STATUS_CHANGE | ASSIGNMENT_CHANGE)
    old_value: str (optional)
    new_value: str (optional)
    changed_by: int (FK -> User)
    changed_at: datetime (UTC)
```

### Diagrama ER

```
┌──────────┐       ┌─────────────────┐       ┌───────────┐
│  Users   │───1:N─│ ProjectMembers  │───N:1─│ Projects  │
└──────────┘       └─────────────────┘       └───────────┘
     │                                             │
     │                                            1:N
     │                                             │
     │              ┌─────────────────┐      ┌─────▼─────┐
     └───────1:N────│  TaskHistory    │──N:1─│   Tasks   │
                    └─────────────────┘      └───────────┘
```

## 🔐 Segurança

### Autenticação JWT
- Tokens Bearer no header `Authorization`
- Expiração configurável (padrão: 24 horas)
- Algoritmo: HS256

### Validação de Senha
```
✓ Mínimo 8 caracteres
✓ Pelo menos 1 letra maiúscula
✓ Pelo menos 1 letra minúscula
✓ Pelo menos 1 número
✓ Pelo menos 1 caractere especial (!@#$%^&*...)
✓ Máximo 72 caracteres (limite bcrypt)
```

### Rate Limiting
| Endpoint | Limite |
|----------|--------|
| Login | 5 req/min por IP |
| API Geral | 100 req/min por IP |

### Sanitização de Input
- Proteção contra SQL Injection
- Proteção contra XSS
- Remoção de caracteres de controle

### Headers de Segurança
```
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Strict-Transport-Security: max-age=31536000; includeSubDomains
Cache-Control: no-store
```

## 📚 API Endpoints

### Autenticação (`/api/v1/auth`)

| Método | Endpoint | Descrição | Auth |
|--------|----------|-----------|------|
| POST | `/register` | Criar conta | ❌ |
| POST | `/login` | Obter token JWT | ❌ |

**Registro - Request:**
```json
{
  "name": "João Silva",
  "email": "joao@email.com",
  "password": "Senha@123"
}
```

**Login - Request:**
```json
{
  "email": "joao@email.com",
  "password": "Senha@123"
}
```

**Login - Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "token_type": "bearer"
}
```

### Usuários (`/api/v1/users`)

| Método | Endpoint | Descrição | Auth |
|--------|----------|-----------|------|
| GET | `/me` | Dados do usuário logado | ✅ |
| GET | `/` | Listar todos usuários | ✅ |

### Projetos (`/api/v1/projects`)

| Método | Endpoint | Descrição | Auth | Permissão |
|--------|----------|-----------|------|-----------|
| GET | `/` | Listar projetos do usuário | ✅ | Membro |
| POST | `/` | Criar projeto | ✅ | - |
| GET | `/{id}` | Obter projeto | ✅ | Membro |
| PATCH | `/{id}` | Atualizar projeto | ✅ | Admin |
| DELETE | `/{id}` | Excluir projeto | ✅ | Admin |
| POST | `/{id}/members` | Adicionar membro | ✅ | Admin |
| DELETE | `/{id}/members/{user_id}` | Remover membro | ✅ | Admin |

**Criar Projeto - Request:**
```json
{
  "name": "Projeto Alpha",
  "description": "Descrição do projeto"
}
```

**Adicionar Membro - Request:**
```json
{
  "user_id": 2,
  "role": "MEMBER"
}
```

### Tarefas (`/api/v1/tasks` e `/api/v1/projects/{id}/tasks`)

| Método | Endpoint | Descrição | Auth |
|--------|----------|-----------|------|
| GET | `/projects/{id}/tasks` | Listar tarefas do projeto | ✅ |
| POST | `/projects/{id}/tasks` | Criar tarefa | ✅ |
| GET | `/tasks/{id}` | Obter tarefa | ✅ |
| PATCH | `/tasks/{id}` | Atualizar tarefa | ✅ |
| DELETE | `/tasks/{id}` | Excluir tarefa | ✅ |
| PATCH | `/tasks/{id}/status` | Alterar status | ✅ |
| PATCH | `/tasks/{id}/assignment` | Atribuir responsável | ✅ |
| GET | `/tasks/{id}/history` | Histórico de alterações | ✅ |

**Criar Tarefa - Request:**
```json
{
  "title": "Implementar login",
  "description": "Criar tela de login",
  "priority": "HIGH"
}
```

**Alterar Status - Request:**
```json
{
  "status": "DOING"
}
```

**Atribuir Responsável - Request:**
```json
{
  "assigned_to": 3
}
```

### Filtros e Paginação

```
GET /api/v1/projects/{id}/tasks?status=TODO&priority=HIGH&page=1&size=10
```

| Parâmetro | Tipo | Descrição |
|-----------|------|-----------|
| `status` | enum | TODO, DOING, DONE |
| `priority` | enum | LOW, MEDIUM, HIGH |
| `assigned_to` | int | ID do responsável |
| `page` | int | Página (default: 1) |
| `size` | int | Itens por página (default: 10, max: 100) |

## 🧪 Testes

### Executar Testes
```bash
cd backend

# Ativar ambiente virtual
.\venv\Scripts\activate  # Windows
source venv/bin/activate # Linux/Mac

# Executar todos os testes
python -m pytest tests/ -v

# Com cobertura de código
python -m pytest tests/ --cov=app --cov-report=term-missing

# Executar testes específicos
python -m pytest tests/test_auth.py -v
python -m pytest tests/test_projects.py -v
python -m pytest tests/test_tasks.py -v
python -m pytest tests/test_validators.py -v
```

### Cobertura Atual
```
Módulo                          Cobertura
───────────────────────────────────────────
app/api/v1/endpoints/auth.py       100%
app/api/v1/endpoints/tasks.py      100%
app/api/v1/endpoints/projects.py    95%
app/core/validators.py              99%
app/services/task_service.py        96%
app/services/project_service.py     92%
───────────────────────────────────────────
TOTAL                               90%
```

### Estrutura de Testes

| Arquivo | Testes | Descrição |
|---------|--------|-----------|
| `test_auth.py` | 8 | Registro, login, validação |
| `test_projects.py` | 12 | CRUD projetos, membros |
| `test_tasks.py` | 15 | CRUD tarefas, status, histórico |
| `test_validators.py` | 20 | Senha, email, sanitização, rate limit |
| **Total** | **55** | ✅ Todos passando |

## ⚙️ Configuração

### Variáveis de Ambiente (`.env`)

```env
# Database
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/minijira

# JWT
SECRET_KEY=your-super-secret-key-change-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440

# CORS
ALLOWED_ORIGINS=["http://localhost:3000","http://localhost:8081"]

# App
PROJECT_NAME=Mini Jira API
VERSION=1.0.0
```

### Dependências (`requirements.txt`)

```
# Core
fastapi>=0.109.0
uvicorn[standard]>=0.27.0
sqlalchemy>=2.0.25
psycopg2-binary>=2.9.9
pydantic>=2.5.3
pydantic-settings>=2.1.0

# Auth
python-jose[cryptography]>=3.3.0
bcrypt>=4.0.1

# Database
alembic>=1.13.1

# Utils
python-multipart>=0.0.6
email-validator>=2.1.0

# Test
pytest>=7.4.4
pytest-asyncio>=0.23.3
pytest-cov>=4.1.0
httpx>=0.26.0
aiosqlite>=0.19.0
```

## 🚀 Como Executar

### Com Docker Compose

```bash
# Iniciar todos os serviços
docker-compose up -d

# Visualizar logs
docker-compose logs -f backend

# Parar serviços
docker-compose down
```

### Desenvolvimento Local

```bash
cd backend

# Criar ambiente virtual
python -m venv venv

# Ativar ambiente virtual
.\venv\Scripts\activate  # Windows
source venv/bin/activate # Linux/Mac

# Instalar dependências
pip install -r requirements.txt

# Configurar variáveis de ambiente
cp .env.example .env
# Editar .env com suas configurações

# Executar migrations
alembic upgrade head

# Iniciar servidor de desenvolvimento
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### URLs Disponíveis
- API: http://localhost:8000
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc
- Health Check: http://localhost:8000/health

## 🔄 Migrations (Alembic)

```bash
# Criar nova migration
alembic revision --autogenerate -m "Descrição da mudança"

# Aplicar migrations
alembic upgrade head

# Reverter última migration
alembic downgrade -1

# Ver histórico
alembic history
```

## 📝 Exceções Customizadas

| Exceção | HTTP Status | Descrição |
|---------|-------------|-----------|
| `InvalidCredentialsError` | 401 | Credenciais inválidas |
| `AuthorizationError` | 403 | Sem permissão |
| `UserNotFoundError` | 404 | Usuário não encontrado |
| `ProjectNotFoundError` | 404 | Projeto não encontrado |
| `TaskNotFoundError` | 404 | Tarefa não encontrada |
| `EmailAlreadyRegisteredError` | 400 | Email já cadastrado |
| `WeakPasswordError` | 400 | Senha não atende requisitos |
| `RateLimitExceededError` | 429 | Limite de requisições excedido |
| `MemberAlreadyExistsError` | 400 | Membro já existe no projeto |
| `InvalidAssignmentError` | 400 | Usuário não é membro do projeto |

---

# 🌐 Web e Mobile

## 📁 Estrutura do Projeto Completo

```
ppdm-minijira/
├── backend/              # API REST FastAPI (documentado acima)
├── web/                  # Aplicação Web Next.js
│   └── src/
│       ├── app/          # Pages (App Router)
│       ├── components/   # Componentes React
│       ├── lib/          # Utilitários e API client
│       └── store/        # Estado global (Zustand)
├── mobile/               # Aplicação Mobile Expo
│   ├── app/              # Telas (Expo Router)
│   └── src/
│       ├── lib/          # API client
│       └── store/        # Estado global (Zustand)
├── docker-compose.yml
└── README.md
```

## 🛠️ Stack Tecnológica

### Backend
- FastAPI, SQLAlchemy 2.0, Alembic
- python-jose (JWT), bcrypt
- PostgreSQL 15
- Pytest (90% coverage)

### Web
- Next.js 14, React 18, TypeScript
- Tailwind CSS, Zustand
- React Hook Form, Zod, Axios

### Mobile
- Expo SDK 50, React Native
- Expo Router, Expo Secure Store
- Zustand, Axios

## 👥 Papéis (RBAC)

- **ADMIN:** Criador do projeto. Pode gerenciar membros, editar/excluir projeto e tarefas.
- **MEMBER:** Pode criar, editar e gerenciar tarefas.

## 📊 Fluxo Kanban

```
┌─────────┐      ┌─────────┐      ┌─────────┐
│  TODO   │ ───► │  DOING  │ ───► │  DONE   │
└─────────┘      └─────────┘      └─────────┘
```

## 📝 Licença

Projeto acadêmico - PPDM (Programação para Dispositivos Móveis)
