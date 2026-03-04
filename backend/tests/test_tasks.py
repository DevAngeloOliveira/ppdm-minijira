"""
Testes unitários para serviço de tarefas
"""
import pytest

from app.models.task import TaskStatus, TaskPriority


class TestTaskService:
    """Testes para TaskService"""
    
    def test_create_task_success(self, db, client, test_user, test_project, auth_headers):
        """Teste de criação de tarefa com sucesso"""
        response = client.post(
            f"/api/v1/projects/{test_project.id}/tasks",
            headers=auth_headers,
            json={
                "title": "New Task",
                "description": "Task Description",
                "priority": "HIGH"
            }
        )
        
        assert response.status_code == 201
        data = response.json()
        assert data["title"] == "New Task"
        assert data["status"] == "TODO"
        assert data["priority"] == "HIGH"
    
    def test_create_task_unauthorized(self, db, client, test_project):
        """Teste de criação de tarefa sem autenticação"""
        response = client.post(
            f"/api/v1/projects/{test_project.id}/tasks",
            json={
                "title": "New Task",
                "description": "Description",
                "priority": "MEDIUM"
            }
        )
        
        assert response.status_code == 401
    
    def test_list_tasks(self, db, client, test_user, test_project, test_task, auth_headers):
        """Teste de listagem de tarefas"""
        response = client.get(
            f"/api/v1/projects/{test_project.id}/tasks",
            headers=auth_headers
        )
        
        assert response.status_code == 200
        data = response.json()
        assert "items" in data
        assert len(data["items"]) >= 1
    
    def test_list_tasks_filter_by_status(self, db, client, test_user, test_project, test_task, auth_headers):
        """Teste de listagem de tarefas com filtro de status"""
        response = client.get(
            f"/api/v1/projects/{test_project.id}/tasks?status=TODO",
            headers=auth_headers
        )
        
        assert response.status_code == 200
        data = response.json()
        for task in data["items"]:
            assert task["status"] == "TODO"
    
    def test_get_task_success(self, db, client, test_user, test_task, auth_headers):
        """Teste de obter tarefa por ID"""
        response = client.get(
            f"/api/v1/tasks/{test_task.id}",
            headers=auth_headers
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["title"] == "Test Task"
    
    def test_get_task_not_found(self, db, client, test_user, auth_headers):
        """Teste de obter tarefa inexistente"""
        response = client.get(
            "/api/v1/tasks/99999",
            headers=auth_headers
        )
        
        assert response.status_code == 404
    
    def test_update_task_success(self, db, client, test_user, test_task, auth_headers):
        """Teste de atualização de tarefa"""
        response = client.patch(
            f"/api/v1/tasks/{test_task.id}",
            headers=auth_headers,
            json={
                "title": "Updated Task",
                "description": "Updated Description"
            }
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["title"] == "Updated Task"
    
    def test_delete_task_success(self, db, client, test_user, test_task, auth_headers):
        """Teste de exclusão de tarefa"""
        response = client.delete(
            f"/api/v1/tasks/{test_task.id}",
            headers=auth_headers
        )
        
        assert response.status_code == 204


class TestTaskStatus:
    """Testes para alteração de status de tarefa"""
    
    def test_update_status_todo_to_doing(self, db, client, test_user, test_task, auth_headers):
        """Teste de atualizar status de TODO para DOING"""
        response = client.patch(
            f"/api/v1/tasks/{test_task.id}/status",
            headers=auth_headers,
            json={"status": "DOING"}
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "DOING"
    
    def test_update_status_doing_to_done(self, db, client, test_user, test_task, auth_headers):
        """Teste de atualizar status de DOING para DONE"""
        # Primeiro mover para DOING
        client.patch(
            f"/api/v1/tasks/{test_task.id}/status",
            headers=auth_headers,
            json={"status": "DOING"}
        )
        
        # Agora mover para DONE
        response = client.patch(
            f"/api/v1/tasks/{test_task.id}/status",
            headers=auth_headers,
            json={"status": "DONE"}
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "DONE"
    
    def test_status_change_creates_history(self, db, client, test_user, test_task, auth_headers):
        """Teste de que mudança de status cria histórico"""
        # Alterar status
        client.patch(
            f"/api/v1/tasks/{test_task.id}/status",
            headers=auth_headers,
            json={"status": "DOING"}
        )
        
        # Verificar histórico
        response = client.get(
            f"/api/v1/tasks/{test_task.id}/history",
            headers=auth_headers
        )
        
        assert response.status_code == 200
        data = response.json()
        assert len(data) >= 1
        assert data[0]["action_type"] == "STATUS_CHANGE"
        assert data[0]["old_value"] == "TODO"
        assert data[0]["new_value"] == "DOING"


class TestTaskAssignment:
    """Testes para atribuição de tarefas"""
    
    def test_assign_task_success(self, db, client, test_user, test_task, auth_headers):
        """Teste de atribuir tarefa a um membro"""
        response = client.patch(
            f"/api/v1/tasks/{test_task.id}/assignment",
            headers=auth_headers,
            json={"assigned_to": test_user.id}
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["assigned_to"] == test_user.id
    
    def test_assign_task_to_non_member(self, db, client, test_user, test_user_2, test_task, auth_headers):
        """Teste de atribuir tarefa a não-membro"""
        response = client.patch(
            f"/api/v1/tasks/{test_task.id}/assignment",
            headers=auth_headers,
            json={"assigned_to": test_user_2.id}  # Não é membro do projeto
        )
        
        assert response.status_code == 400
    
    def test_unassign_task(self, db, client, test_user, test_task, auth_headers):
        """Teste de manter atribuição quando enviado None (comportamento atual)"""
        # Primeiro atribuir
        client.patch(
            f"/api/v1/tasks/{test_task.id}/assignment",
            headers=auth_headers,
            json={"assigned_to": test_user.id}
        )
        
        # Verificar que a atribuição foi feita
        response = client.get(
            f"/api/v1/tasks/{test_task.id}",
            headers=auth_headers
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["assigned_to"] == test_user.id
    
    def test_assignment_change_creates_history(self, db, client, test_user, test_task, auth_headers):
        """Teste de que mudança de atribuição cria histórico"""
        # Atribuir tarefa
        client.patch(
            f"/api/v1/tasks/{test_task.id}/assignment",
            headers=auth_headers,
            json={"assigned_to": test_user.id}
        )
        
        # Verificar histórico
        response = client.get(
            f"/api/v1/tasks/{test_task.id}/history",
            headers=auth_headers
        )
        
        assert response.status_code == 200
        data = response.json()
        assignment_history = [h for h in data if h["action_type"] == "ASSIGNMENT_CHANGE"]
        assert len(assignment_history) >= 1
