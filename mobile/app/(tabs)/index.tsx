import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'expo-router';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  Alert,
  Modal,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useProjectStore } from '../../src/store/projects';
import { Project, ROLE_LABELS } from '../../src/types';
import { ApiError } from '../../src/lib/api';

export default function ProjectsScreen() {
  const router = useRouter();
  const { projects, isLoading, loadProjects, createProject } = useProjectStore();
  const [refreshing, setRefreshing] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectDescription, setNewProjectDescription] = useState('');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    loadProjects();
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadProjects();
    setRefreshing(false);
  }, []);

  const handleCreateProject = async () => {
    if (!newProjectName.trim()) {
      Alert.alert('Erro', 'Digite o nome do projeto');
      return;
    }

    setCreating(true);
    try {
      await createProject({ 
        name: newProjectName.trim(), 
        description: newProjectDescription.trim() || undefined 
      });
      setShowCreateModal(false);
      setNewProjectName('');
      setNewProjectDescription('');
    } catch (error) {
      const apiError = error as ApiError;
      Alert.alert('Erro', apiError.detail || 'Erro ao criar projeto');
    } finally {
      setCreating(false);
    }
  };

  const renderProject = ({ item }: { item: Project }) => (
    <TouchableOpacity
      style={styles.projectCard}
      onPress={() => router.push(`/project/${item.id}`)}
      activeOpacity={0.7}
    >
      <View style={styles.projectIcon}>
        <Ionicons name="folder" size={24} color="#2563eb" />
      </View>
      <View style={styles.projectInfo}>
        <Text style={styles.projectName}>{item.name}</Text>
        {item.description && (
          <Text style={styles.projectDescription} numberOfLines={2}>
            {item.description}
          </Text>
        )}
        <View style={styles.projectMeta}>
          <View style={styles.metaItem}>
            <Ionicons name="people-outline" size={14} color="#6b7280" />
            <Text style={styles.projectMetaText}>
              {item.members?.length || 1} {item.members?.length === 1 ? 'membro' : 'membros'}
            </Text>
          </View>
        </View>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={projects}
        renderItem={renderProject}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={[
          styles.list,
          projects.length === 0 && styles.listEmpty
        ]}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh}
            colors={['#2563eb']}
            tintColor="#2563eb"
          />
        }
        ListEmptyComponent={
          !isLoading ? (
            <View style={styles.empty}>
              <View style={styles.emptyIcon}>
                <Ionicons name="folder-open-outline" size={48} color="#9ca3af" />
              </View>
              <Text style={styles.emptyTitle}>Nenhum projeto</Text>
              <Text style={styles.emptyText}>
                Crie seu primeiro projeto para começar a gerenciar suas tarefas
              </Text>
              <TouchableOpacity 
                style={styles.emptyButton}
                onPress={() => setShowCreateModal(true)}
              >
                <Text style={styles.emptyButtonText}>Criar Projeto</Text>
              </TouchableOpacity>
            </View>
          ) : null
        }
      />

      {isLoading && projects.length === 0 && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2563eb" />
        </View>
      )}

      <TouchableOpacity 
        style={styles.fab} 
        onPress={() => setShowCreateModal(true)}
        activeOpacity={0.8}
      >
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>

      {/* Modal de criação de projeto */}
      <Modal 
        visible={showCreateModal} 
        animationType="slide" 
        transparent
        onRequestClose={() => setShowCreateModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Novo Projeto</Text>
              <TouchableOpacity 
                onPress={() => setShowCreateModal(false)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons name="close" size={24} color="#6b7280" />
              </TouchableOpacity>
            </View>

            <Text style={styles.inputLabel}>Nome do Projeto *</Text>
            <TextInput
              style={styles.input}
              placeholder="Ex: App Mobile"
              placeholderTextColor="#9ca3af"
              value={newProjectName}
              onChangeText={setNewProjectName}
              autoFocus
            />

            <Text style={styles.inputLabel}>Descrição (opcional)</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Descreva o projeto..."
              placeholderTextColor="#9ca3af"
              value={newProjectDescription}
              onChangeText={setNewProjectDescription}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />

            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={() => setShowCreateModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.createButton, creating && styles.buttonDisabled]}
                onPress={handleCreateProject}
                disabled={creating}
              >
                {creating ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={styles.createButtonText}>Criar</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  list: {
    padding: 16,
  },
  listEmpty: {
    flex: 1,
  },
  projectCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  projectIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#eff6ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  projectInfo: {
    flex: 1,
  },
  projectName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  projectDescription: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 8,
    lineHeight: 20,
  },
  projectMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  projectMetaText: {
    fontSize: 12,
    color: '#6b7280',
    marginLeft: 4,
  },
  empty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  emptyButton: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  emptyButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  loadingContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(249, 250, 251, 0.8)',
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#2563eb',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    marginBottom: 16,
    color: '#111827',
  },
  textArea: {
    minHeight: 80,
    paddingTop: 14,
  },
  modalActions: {
    flexDirection: 'row',
    marginTop: 8,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
    marginRight: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6b7280',
  },
  createButton: {
    flex: 1,
    backgroundColor: '#2563eb',
    paddingVertical: 14,
    alignItems: 'center',
    marginLeft: 8,
    borderRadius: 12,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  createButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});
