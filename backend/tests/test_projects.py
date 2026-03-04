"""
Testes unitários para serviço de projetos
"""
import pytest

from app.models.project import ProjectRole


class TestProjectService:
    """Testes para ProjectService"""
    
    def test_create_project_success(self, db, client, test_user, auth_headers):
        """Teste de criação de projeto com sucesso"""
        response = client.post(
            "/api/v1/projects",
            headers=auth_headers,
            json={
                "name": "New Project",
                "description": "Project Description"
            }
        )
        
        assert response.status_code == 201
        data = response.json()
        assert data["name"] == "New Project"
        assert data["description"] == "Project Description"
        assert len(data["members"]) == 1
        assert data["members"][0]["role"] == "ADMIN"
    
    def test_create_project_unauthorized(self, db, client):
        """Teste de criação de projeto sem autenticação"""
        response = client.post(
            "/api/v1/projects",
            json={
                "name": "New Project",
                "description": "Description"
            }
        )
        
        assert response.status_code == 401
    
    def test_list_projects(self, db, client, test_user, test_project, auth_headers):
        """Teste de listagem de projetos"""
        response = client.get(
            "/api/v1/projects",
            headers=auth_headers
        )
        
        assert response.status_code == 200
        data = response.json()
        assert "items" in data
        assert len(data["items"]) >= 1
    
    def test_get_project_success(self, db, client, test_user, test_project, auth_headers):
        """Teste de obter projeto por ID"""
        response = client.get(
            f"/api/v1/projects/{test_project.id}",
            headers=auth_headers
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["name"] == "Test Project"
    
    def test_get_project_not_found(self, db, client, test_user, auth_headers):
        """Teste de obter projeto inexistente"""
        response = client.get(
            "/api/v1/projects/99999",
            headers=auth_headers
        )
        
        assert response.status_code == 404
    
    def test_update_project_success(self, db, client, test_user, test_project, auth_headers):
        """Teste de atualização de projeto"""
        response = client.patch(
            f"/api/v1/projects/{test_project.id}",
            headers=auth_headers,
            json={"name": "Updated Project Name"}
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["name"] == "Updated Project Name"
    
    def test_delete_project_success(self, db, client, test_user, test_project, auth_headers):
        """Teste de exclusão de projeto"""
        response = client.delete(
            f"/api/v1/projects/{test_project.id}",
            headers=auth_headers
        )
        
        assert response.status_code == 204


class TestProjectMembers:
    """Testes para gerenciamento de membros do projeto"""
    
    def test_add_member_success(self, db, client, test_user, test_user_2, test_project, auth_headers):
        """Teste de adicionar membro ao projeto"""
        response = client.post(
            f"/api/v1/projects/{test_project.id}/members",
            headers=auth_headers,
            json={
                "user_id": test_user_2.id,
                "role": "MEMBER"
            }
        )
        
        assert response.status_code == 201
        data = response.json()
        assert data["user_id"] == test_user_2.id
        assert data["role"] == "MEMBER"
    
    def test_add_member_already_exists(self, db, client, test_user, test_project, auth_headers):
        """Teste de adicionar membro que já existe"""
        response = client.post(
            f"/api/v1/projects/{test_project.id}/members",
            headers=auth_headers,
            json={
                "user_id": test_user.id,  # Já é membro
                "role": "MEMBER"
            }
        )
        
        assert response.status_code == 400
    
    def test_add_member_user_not_found(self, db, client, test_user, test_project, auth_headers):
        """Teste de adicionar membro com usuário inexistente"""
        response = client.post(
            f"/api/v1/projects/{test_project.id}/members",
            headers=auth_headers,
            json={
                "user_id": 99999,
                "role": "MEMBER"
            }
        )
        
        assert response.status_code == 404
    
    def test_remove_member_success(self, db, client, test_user, test_user_2, test_project, auth_headers):
        """Teste de remover membro do projeto"""
        # Primeiro adicionar o membro
        client.post(
            f"/api/v1/projects/{test_project.id}/members",
            headers=auth_headers,
            json={
                "user_id": test_user_2.id,
                "role": "MEMBER"
            }
        )
        
        # Agora remover
        response = client.delete(
            f"/api/v1/projects/{test_project.id}/members/{test_user_2.id}",
            headers=auth_headers
        )
        
        assert response.status_code == 204
    
    def test_cannot_remove_last_admin(self, db, client, test_user, test_project, auth_headers):
        """Teste de não permitir remover último admin"""
        response = client.delete(
            f"/api/v1/projects/{test_project.id}/members/{test_user.id}",
            headers=auth_headers
        )
        
        assert response.status_code == 400
