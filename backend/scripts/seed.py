"""
Script de Seed - Popular banco de dados com dados de demonstração

Uso:
    python -m scripts.seed          # Executa o seed
    python -m scripts.seed --reset  # Limpa e recria os dados
"""

import sys
import os
from datetime import datetime, timedelta
from random import choice, randint

# Adiciona o diretório backend ao path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy.orm import Session
from app.core.database import SessionLocal, engine, Base
from app.core.security import get_password_hash
from app.models.user import User
from app.models.project import Project, ProjectMember, ProjectRole
from app.models.task import Task, TaskHistory, TaskStatus, TaskPriority, ActionType


# ============================================================================
# DADOS DE EXEMPLO
# ============================================================================

USERS_DATA = [
    {
        "name": "Admin Sistema",
        "email": "admin@minijira.com",
        "password": "Admin@123"
    },
    {
        "name": "João Silva",
        "email": "joao.silva@email.com",
        "password": "Joao@123"
    },
    {
        "name": "Maria Santos",
        "email": "maria.santos@email.com",
        "password": "Maria@123"
    },
    {
        "name": "Pedro Oliveira",
        "email": "pedro.oliveira@email.com",
        "password": "Pedro@123"
    },
    {
        "name": "Ana Costa",
        "email": "ana.costa@email.com",
        "password": "Ana@1234"
    },
]

PROJECTS_DATA = [
    {
        "name": "Mini Jira - Backend",
        "description": "Desenvolvimento da API REST do sistema Mini Jira com FastAPI, incluindo autenticação JWT, gerenciamento de projetos e tarefas.",
        "owner_index": 0,  # Admin
        "members_indices": [1, 2, 3],  # João, Maria, Pedro
    },
    {
        "name": "Mini Jira - Mobile",
        "description": "Aplicativo mobile desenvolvido com React Native e Expo para gerenciamento de tarefas em dispositivos móveis.",
        "owner_index": 0,  # Admin
        "members_indices": [1, 4],  # João, Ana
    },
    {
        "name": "E-commerce Platform",
        "description": "Plataforma de e-commerce completa com catálogo de produtos, carrinho de compras, checkout e integração com gateways de pagamento.",
        "owner_index": 1,  # João
        "members_indices": [2, 3],  # Maria, Pedro
    },
    {
        "name": "Sistema de RH",
        "description": "Sistema de gerenciamento de recursos humanos com controle de funcionários, folha de pagamento e ponto eletrônico.",
        "owner_index": 2,  # Maria
        "members_indices": [3, 4],  # Pedro, Ana
    },
]

TASKS_DATA = [
    # Projeto 1 - Mini Jira Backend
    {
        "project_index": 0,
        "tasks": [
            {"title": "Configurar estrutura do projeto FastAPI", "description": "Criar estrutura de pastas, configurar dependências e setup inicial do projeto.", "status": TaskStatus.DONE, "priority": TaskPriority.HIGH, "assignee_index": 1},
            {"title": "Implementar autenticação JWT", "description": "Criar endpoints de login, registro e middleware de autenticação com tokens JWT.", "status": TaskStatus.DONE, "priority": TaskPriority.HIGH, "assignee_index": 1},
            {"title": "Criar modelos de dados", "description": "Implementar modelos SQLAlchemy para User, Project, Task e TaskHistory.", "status": TaskStatus.DONE, "priority": TaskPriority.HIGH, "assignee_index": 2},
            {"title": "Implementar CRUD de projetos", "description": "Criar endpoints REST para criar, listar, atualizar e deletar projetos.", "status": TaskStatus.DONE, "priority": TaskPriority.MEDIUM, "assignee_index": 2},
            {"title": "Implementar CRUD de tarefas", "description": "Criar endpoints para gerenciamento completo de tarefas dentro de projetos.", "status": TaskStatus.DONE, "priority": TaskPriority.MEDIUM, "assignee_index": 3},
            {"title": "Adicionar sistema de membros", "description": "Implementar funcionalidade para adicionar e remover membros de projetos.", "status": TaskStatus.DOING, "priority": TaskPriority.MEDIUM, "assignee_index": 1},
            {"title": "Criar histórico de tarefas", "description": "Registrar todas as alterações de status e atribuição das tarefas.", "status": TaskStatus.DOING, "priority": TaskPriority.LOW, "assignee_index": 2},
            {"title": "Implementar paginação", "description": "Adicionar paginação em todos os endpoints de listagem.", "status": TaskStatus.TODO, "priority": TaskPriority.LOW, "assignee_index": None},
            {"title": "Escrever testes unitários", "description": "Criar suite de testes com pytest para garantir qualidade do código.", "status": TaskStatus.TODO, "priority": TaskPriority.MEDIUM, "assignee_index": 3},
            {"title": "Documentar API com Swagger", "description": "Garantir que todos os endpoints estejam documentados no OpenAPI.", "status": TaskStatus.TODO, "priority": TaskPriority.LOW, "assignee_index": None},
        ]
    },
    # Projeto 2 - Mini Jira Mobile
    {
        "project_index": 1,
        "tasks": [
            {"title": "Setup projeto Expo", "description": "Configurar projeto React Native com Expo SDK e dependências necessárias.", "status": TaskStatus.DONE, "priority": TaskPriority.HIGH, "assignee_index": 1},
            {"title": "Criar tela de login", "description": "Implementar interface de autenticação com validação de formulário.", "status": TaskStatus.DONE, "priority": TaskPriority.HIGH, "assignee_index": 4},
            {"title": "Criar tela de registro", "description": "Implementar cadastro de novos usuários com validação de senha forte.", "status": TaskStatus.DONE, "priority": TaskPriority.HIGH, "assignee_index": 4},
            {"title": "Implementar navegação", "description": "Configurar expo-router para navegação entre telas.", "status": TaskStatus.DONE, "priority": TaskPriority.MEDIUM, "assignee_index": 1},
            {"title": "Criar listagem de projetos", "description": "Tela principal com lista de projetos do usuário.", "status": TaskStatus.DOING, "priority": TaskPriority.HIGH, "assignee_index": 1},
            {"title": "Criar tela de tarefas", "description": "Implementar visualização e gerenciamento de tarefas por projeto.", "status": TaskStatus.DOING, "priority": TaskPriority.HIGH, "assignee_index": 4},
            {"title": "Integrar com API backend", "description": "Conectar aplicativo com endpoints da API REST.", "status": TaskStatus.TODO, "priority": TaskPriority.HIGH, "assignee_index": 1},
            {"title": "Implementar pull-to-refresh", "description": "Adicionar funcionalidade de atualização ao puxar lista.", "status": TaskStatus.TODO, "priority": TaskPriority.LOW, "assignee_index": None},
            {"title": "Adicionar notificações push", "description": "Implementar notificações para atualizações de tarefas.", "status": TaskStatus.TODO, "priority": TaskPriority.LOW, "assignee_index": None},
        ]
    },
    # Projeto 3 - E-commerce
    {
        "project_index": 2,
        "tasks": [
            {"title": "Modelar banco de dados", "description": "Criar esquema do banco com produtos, categorias, pedidos e usuários.", "status": TaskStatus.DONE, "priority": TaskPriority.HIGH, "assignee_index": 2},
            {"title": "Criar catálogo de produtos", "description": "Implementar listagem e busca de produtos com filtros.", "status": TaskStatus.DOING, "priority": TaskPriority.HIGH, "assignee_index": 2},
            {"title": "Implementar carrinho de compras", "description": "Sistema de carrinho com sessão persistente.", "status": TaskStatus.DOING, "priority": TaskPriority.HIGH, "assignee_index": 3},
            {"title": "Criar checkout", "description": "Fluxo completo de finalização de compra.", "status": TaskStatus.TODO, "priority": TaskPriority.HIGH, "assignee_index": None},
            {"title": "Integrar gateway de pagamento", "description": "Conectar com Stripe/PagSeguro para processamento de pagamentos.", "status": TaskStatus.TODO, "priority": TaskPriority.HIGH, "assignee_index": 3},
            {"title": "Sistema de cupons de desconto", "description": "Implementar códigos promocionais e descontos.", "status": TaskStatus.TODO, "priority": TaskPriority.MEDIUM, "assignee_index": None},
            {"title": "Painel administrativo", "description": "Dashboard para gerenciamento de produtos e pedidos.", "status": TaskStatus.TODO, "priority": TaskPriority.MEDIUM, "assignee_index": 2},
        ]
    },
    # Projeto 4 - Sistema RH
    {
        "project_index": 3,
        "tasks": [
            {"title": "Cadastro de funcionários", "description": "CRUD completo para gestão de dados dos colaboradores.", "status": TaskStatus.DONE, "priority": TaskPriority.HIGH, "assignee_index": 3},
            {"title": "Controle de ponto", "description": "Sistema de registro de entrada e saída dos funcionários.", "status": TaskStatus.DOING, "priority": TaskPriority.HIGH, "assignee_index": 4},
            {"title": "Cálculo de folha de pagamento", "description": "Automatizar cálculos de salário, descontos e benefícios.", "status": TaskStatus.TODO, "priority": TaskPriority.HIGH, "assignee_index": 3},
            {"title": "Gestão de férias", "description": "Controle de período aquisitivo e agendamento de férias.", "status": TaskStatus.TODO, "priority": TaskPriority.MEDIUM, "assignee_index": 4},
            {"title": "Relatórios gerenciais", "description": "Dashboards e relatórios de indicadores de RH.", "status": TaskStatus.TODO, "priority": TaskPriority.LOW, "assignee_index": None},
        ]
    },
]


# ============================================================================
# FUNÇÕES DE SEED
# ============================================================================

def clear_database(db: Session):
    """Limpa todas as tabelas do banco de dados."""
    print("🗑️  Limpando banco de dados...")
    db.query(TaskHistory).delete()
    db.query(Task).delete()
    db.query(ProjectMember).delete()
    db.query(Project).delete()
    db.query(User).delete()
    db.commit()
    print("✅ Banco de dados limpo!")


def seed_users(db: Session) -> list[User]:
    """Cria usuários de demonstração."""
    print("\n👥 Criando usuários...")
    users = []
    
    for user_data in USERS_DATA:
        # Verificar se usuário já existe
        existing = db.query(User).filter(User.email == user_data["email"]).first()
        if existing:
            print(f"   ⚠️  Usuário {user_data['email']} já existe, pulando...")
            users.append(existing)
            continue
            
        user = User(
            name=user_data["name"],
            email=user_data["email"],
            password_hash=get_password_hash(user_data["password"])
        )
        db.add(user)
        users.append(user)
        print(f"   ✅ {user_data['name']} ({user_data['email']})")
    
    db.commit()
    for user in users:
        db.refresh(user)
    
    print(f"✅ {len(users)} usuários criados!")
    return users


def seed_projects(db: Session, users: list[User]) -> list[Project]:
    """Cria projetos de demonstração."""
    print("\n📁 Criando projetos...")
    projects = []
    
    for project_data in PROJECTS_DATA:
        owner = users[project_data["owner_index"]]
        
        # Verificar se projeto já existe
        existing = db.query(Project).filter(
            Project.name == project_data["name"],
            Project.owner_id == owner.id
        ).first()
        if existing:
            print(f"   ⚠️  Projeto '{project_data['name']}' já existe, pulando...")
            projects.append(existing)
            continue
        
        project = Project(
            name=project_data["name"],
            description=project_data["description"],
            owner_id=owner.id
        )
        db.add(project)
        db.flush()  # Para obter o ID
        
        # Adicionar owner como admin
        owner_member = ProjectMember(
            user_id=owner.id,
            project_id=project.id,
            role=ProjectRole.ADMIN
        )
        db.add(owner_member)
        
        # Adicionar outros membros
        for member_index in project_data["members_indices"]:
            member_user = users[member_index]
            member = ProjectMember(
                user_id=member_user.id,
                project_id=project.id,
                role=ProjectRole.MEMBER
            )
            db.add(member)
        
        projects.append(project)
        member_count = len(project_data["members_indices"]) + 1
        print(f"   ✅ {project_data['name']} (owner: {owner.name}, {member_count} membros)")
    
    db.commit()
    for project in projects:
        db.refresh(project)
    
    print(f"✅ {len(projects)} projetos criados!")
    return projects


def seed_tasks(db: Session, users: list[User], projects: list[Project]) -> list[Task]:
    """Cria tarefas de demonstração."""
    print("\n📋 Criando tarefas...")
    all_tasks = []
    
    for tasks_group in TASKS_DATA:
        project = projects[tasks_group["project_index"]]
        
        for task_data in tasks_group["tasks"]:
            assignee_id = None
            if task_data["assignee_index"] is not None:
                assignee_id = users[task_data["assignee_index"]].id
            
            # Verificar se tarefa já existe
            existing = db.query(Task).filter(
                Task.title == task_data["title"],
                Task.project_id == project.id
            ).first()
            if existing:
                all_tasks.append(existing)
                continue
            
            # Criar tarefa com data de criação variada
            days_ago = randint(1, 30)
            created_at = datetime.utcnow() - timedelta(days=days_ago)
            
            task = Task(
                title=task_data["title"],
                description=task_data["description"],
                status=task_data["status"],
                priority=task_data["priority"],
                project_id=project.id,
                assigned_to=assignee_id,
                created_at=created_at,
                updated_at=created_at
            )
            db.add(task)
            all_tasks.append(task)
        
        print(f"   ✅ {len(tasks_group['tasks'])} tarefas para '{project.name}'")
    
    db.commit()
    print(f"✅ {len(all_tasks)} tarefas criadas!")
    return all_tasks


def seed_task_history(db: Session, tasks: list[Task], users: list[User]):
    """Cria histórico de tarefas para tarefas que não estão em TODO."""
    print("\n📜 Criando histórico de tarefas...")
    history_count = 0
    
    for task in tasks:
        if task.status == TaskStatus.TODO:
            continue
        
        # Verificar se já existe histórico
        existing = db.query(TaskHistory).filter(TaskHistory.task_id == task.id).first()
        if existing:
            continue
        
        # Escolher um usuário aleatório do projeto como autor da mudança
        changer = choice(users)
        
        if task.status == TaskStatus.DOING:
            # Mudou de TODO para DOING
            history = TaskHistory(
                task_id=task.id,
                action_type=ActionType.STATUS_CHANGE,
                old_value="TODO",
                new_value="DOING",
                changed_by=changer.id,
                changed_at=task.updated_at
            )
            db.add(history)
            history_count += 1
            
        elif task.status == TaskStatus.DONE:
            # Mudou de TODO para DOING
            doing_date = task.created_at + timedelta(days=randint(1, 5))
            history1 = TaskHistory(
                task_id=task.id,
                action_type=ActionType.STATUS_CHANGE,
                old_value="TODO",
                new_value="DOING",
                changed_by=changer.id,
                changed_at=doing_date
            )
            db.add(history1)
            
            # Mudou de DOING para DONE
            done_date = doing_date + timedelta(days=randint(1, 5))
            history2 = TaskHistory(
                task_id=task.id,
                action_type=ActionType.STATUS_CHANGE,
                old_value="DOING",
                new_value="DONE",
                changed_by=changer.id,
                changed_at=done_date
            )
            db.add(history2)
            history_count += 2
    
    db.commit()
    print(f"✅ {history_count} registros de histórico criados!")


def print_summary(users: list[User], projects: list[Project], tasks: list[Task]):
    """Imprime resumo dos dados criados."""
    print("\n" + "="*60)
    print("📊 RESUMO DO SEED")
    print("="*60)
    
    print(f"\n👥 Usuários: {len(users)}")
    for user in users:
        print(f"   • {user.name} ({user.email})")
    
    print(f"\n📁 Projetos: {len(projects)}")
    for project in projects:
        task_count = len([t for t in tasks if t.project_id == project.id])
        print(f"   • {project.name} ({task_count} tarefas)")
    
    print(f"\n📋 Tarefas: {len(tasks)}")
    todo = len([t for t in tasks if t.status == TaskStatus.TODO])
    doing = len([t for t in tasks if t.status == TaskStatus.DOING])
    done = len([t for t in tasks if t.status == TaskStatus.DONE])
    print(f"   • TODO: {todo}")
    print(f"   • DOING: {doing}")
    print(f"   • DONE: {done}")
    
    print("\n" + "="*60)
    print("🔐 CREDENCIAIS DE ACESSO")
    print("="*60)
    print("\n   Email: admin@minijira.com")
    print("   Senha: Admin@123")
    print("\n   Outros usuários usam a senha: Nome@123")
    print("   (Ex: joao.silva@email.com / Joao@123)")
    print("="*60 + "\n")


def run_seed(reset: bool = False):
    """Executa o processo de seed."""
    print("\n" + "="*60)
    print("🌱 MINI JIRA - SEED DE DADOS")
    print("="*60)
    
    db = SessionLocal()
    
    try:
        if reset:
            clear_database(db)
        
        users = seed_users(db)
        projects = seed_projects(db, users)
        tasks = seed_tasks(db, users, projects)
        seed_task_history(db, tasks, users)
        
        print_summary(users, projects, tasks)
        
        print("✅ Seed concluído com sucesso!\n")
        
    except Exception as e:
        print(f"\n❌ Erro durante o seed: {e}")
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    reset = "--reset" in sys.argv
    run_seed(reset=reset)
