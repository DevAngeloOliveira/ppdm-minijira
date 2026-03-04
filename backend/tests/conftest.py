"""
Configuração de testes - Fixtures compartilhadas
"""
import pytest
from typing import Generator
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.pool import StaticPool
from fastapi.testclient import TestClient

from app.main import app
from app.core.database import get_db, Base
from app.core.security import get_password_hash
from app.models.user import User
from app.models.project import Project, ProjectMember, ProjectRole
from app.models.task import Task, TaskStatus, TaskPriority


# Banco de dados em memória para testes
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def override_get_db():
    """Override da dependência de banco de dados para testes"""
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


# Override da dependência
app.dependency_overrides[get_db] = override_get_db


@pytest.fixture(scope="function")
def db() -> Generator[Session, None, None]:
    """Fixture que cria um banco de dados limpo para cada teste"""
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()
        Base.metadata.drop_all(bind=engine)


@pytest.fixture(scope="function")
def client(db: Session) -> Generator[TestClient, None, None]:
    """Cliente de teste do FastAPI"""
    yield TestClient(app)


@pytest.fixture
def test_user(db: Session) -> User:
    """Fixture que cria um usuário de teste"""
    user = User(
        name="Test User",
        email="test@example.com",
        password_hash=get_password_hash("Test@123456")
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@pytest.fixture
def test_user_2(db: Session) -> User:
    """Fixture que cria um segundo usuário de teste"""
    user = User(
        name="Test User 2",
        email="test2@example.com",
        password_hash=get_password_hash("Test@123456")
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@pytest.fixture
def test_project(db: Session, test_user: User) -> Project:
    """Fixture que cria um projeto de teste"""
    project = Project(
        name="Test Project",
        description="Test Description",
        owner_id=test_user.id
    )
    db.add(project)
    db.commit()
    db.refresh(project)
    
    # Adicionar o owner como admin
    member = ProjectMember(
        user_id=test_user.id,
        project_id=project.id,
        role=ProjectRole.ADMIN
    )
    db.add(member)
    db.commit()
    
    db.refresh(project)
    return project


@pytest.fixture
def test_task(db: Session, test_project: Project) -> Task:
    """Fixture que cria uma tarefa de teste"""
    task = Task(
        title="Test Task",
        description="Test Description",
        status=TaskStatus.TODO,
        priority=TaskPriority.MEDIUM,
        project_id=test_project.id
    )
    db.add(task)
    db.commit()
    db.refresh(task)
    return task


@pytest.fixture(autouse=True)
def reset_rate_limiter():
    """Reset rate limiter antes de cada teste"""
    from app.core.validators import login_rate_limiter
    # Limpar cache do rate limiter
    login_rate_limiter._requests.clear()
    yield


@pytest.fixture
def auth_headers(client: TestClient, test_user: User) -> dict:
    """Fixture que retorna headers de autenticação"""
    response = client.post(
        "/api/v1/auth/login",
        json={"email": "test@example.com", "password": "Test@123456"}
    )
    assert response.status_code == 200, f"Login failed: {response.json()}"
    token = response.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}
