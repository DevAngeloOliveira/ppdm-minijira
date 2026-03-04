# Mini Jira - Sistema de Gestão de Projetos e Tarefas

## 📋 Descrição

Sistema full stack para gestão de projetos e tarefas com fluxo Kanban, desenvolvido como projeto acadêmico para a Cadeira de Programação para Dispositivos Móveis (PPDM).

## 🏗️ Arquitetura

- **Backend:** FastAPI (Python 3.11)
- **Web:** Next.js 14 (TypeScript)
- **Mobile:** React Native / Expo
- **Banco de Dados:** PostgreSQL 15

## 📁 Estrutura do Projeto

```
ppdm-minijira/
├── backend/              # API REST FastAPI
│   ├── app/
│   │   ├── api/v1/       # Endpoints da API
│   │   ├── core/         # Configurações e segurança
│   │   ├── models/       # Modelos SQLAlchemy
│   │   ├── repositories/ # Camada de acesso a dados
│   │   ├── schemas/      # DTOs Pydantic
│   │   └── services/     # Lógica de negócio
│   └── alembic/          # Migrations
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

## 🚀 Como Executar

### Pré-requisitos

- Docker e Docker Compose
- Node.js 18+ (para desenvolvimento local)
- Python 3.11+ (para desenvolvimento local)
- Expo CLI (para mobile)

### Com Docker Compose (Backend + Web)

```bash
# Iniciar todos os serviços
docker-compose up -d

# Visualizar logs
docker-compose logs -f

# Parar serviços
docker-compose down
```

**URLs disponíveis:**
- Web: http://localhost:3000
- API: http://localhost:8000
- Swagger: http://localhost:8000/docs

### Desenvolvimento Local

#### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate  # Linux/Mac
# ou
.\venv\Scripts\activate   # Windows

pip install -r requirements.txt
cp .env.example .env
alembic upgrade head
uvicorn app.main:app --reload
```

#### Web

```bash
cd web
npm install
npm run dev
```

#### Mobile

```bash
cd mobile
npm install
npx expo start
```

Para testar no emulador:
- Android: `npx expo start --android`
- iOS: `npx expo start --ios`
- Web: `npx expo start --web`

## 📚 Documentação da API

Após iniciar o backend, acesse:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## 🔑 Endpoints Principais

### Autenticação
| Método | Endpoint | Descrição |
|--------|----------|-----------|
| POST | `/api/v1/auth/register` | Registrar usuário |
| POST | `/api/v1/auth/login` | Login (retorna JWT) |

### Usuários
| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/v1/users/me` | Dados do usuário logado |

### Projetos
| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/v1/projects` | Listar projetos |
| POST | `/api/v1/projects` | Criar projeto |
| GET | `/api/v1/projects/{id}` | Detalhes do projeto |
| PUT | `/api/v1/projects/{id}` | Atualizar projeto |
| DELETE | `/api/v1/projects/{id}` | Excluir projeto |
| POST | `/api/v1/projects/{id}/members` | Adicionar membro |
| DELETE | `/api/v1/projects/{id}/members/{user_id}` | Remover membro |

### Tarefas
| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/v1/projects/{id}/tasks` | Listar tarefas |
| POST | `/api/v1/projects/{id}/tasks` | Criar tarefa |
| GET | `/api/v1/tasks/{id}` | Detalhes da tarefa |
| PUT | `/api/v1/tasks/{id}` | Atualizar tarefa |
| DELETE | `/api/v1/tasks/{id}` | Excluir tarefa |
| PATCH | `/api/v1/tasks/{id}/status` | Alterar status |
| PATCH | `/api/v1/tasks/{id}/assign` | Atribuir responsável |
| GET | `/api/v1/tasks/{id}/history` | Ver histórico |

## 👥 Papéis (RBAC)

- **ADMIN:** Criador do projeto. Pode gerenciar membros, editar/excluir projeto e tarefas.
- **MEMBER:** Pode criar, editar e gerenciar tarefas.

## 📊 Fluxo Kanban

As tarefas seguem o fluxo:

```
TODO → DOING → DONE
```

- **TODO:** A fazer
- **DOING:** Em progresso
- **DONE:** Concluído

## 🔒 Segurança

- Autenticação via JWT (Bearer Token)
- Senhas hasheadas com bcrypt
- Tokens expiram em 7 dias (configurável)
- CORS configurado para origens permitidas

## 🛠️ Tecnologias

### Backend
- FastAPI, SQLAlchemy 2.0, Alembic
- python-jose (JWT), passlib (bcrypt)
- PostgreSQL 15

### Web
- Next.js 14, React 18, TypeScript
- Tailwind CSS, Zustand
- React Hook Form, Zod, Axios

### Mobile
- Expo SDK 50, React Native
- Expo Router, Expo Secure Store
- Zustand, Axios

## 📝 Licença

Projeto acadêmico - PPDM

Projeto acadêmico - PPDM
