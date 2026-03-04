import { useEffect, useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  Modal,
  TextInput,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTaskStore } from '../../src/store/tasks';
import { useProjectStore } from '../../src/store/projects';
import { 
  TaskStatus, 
  TaskPriority,
  STATUS_LABELS, 
  STATUS_COLORS,
  PRIORITY_LABELS,
  PRIORITY_COLORS,
  TaskHistory,
  ProjectMember,
} from '../../src/types';
import { ApiError } from '../../src/lib/api';

export default function TaskDetailScreen() {
  const { taskId, projectId } = useLocalSearchParams<{ taskId: string; projectId: string }>();
  const router = useRouter();
  const { 
    currentTask, 
    taskHistory,
    isLoading, 
    loadTask, 
    loadTaskHistory,
    updateTask,
    deleteTask,
    changeStatus,
    assignTask,
    clearCurrentTask,
  } = useTaskStore();
  const { currentProject, loadProject } = useProjectStore();

  const [showEditModal, setShowEditModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editPriority, setEditPriority] = useState<TaskPriority>('MEDIUM');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (taskId) {
      loadTask(parseInt(taskId));
      loadTaskHistory(parseInt(taskId));
    }
    if (projectId) {
      loadProject(parseInt(projectId));
    }

    return () => {
      clearCurrentTask();
    };
  }, [taskId, projectId]);

  useEffect(() => {
    if (currentTask) {
      setEditTitle(currentTask.title);
      setEditDescription(currentTask.description || '');
      setEditPriority(currentTask.priority);
    }
  }, [currentTask]);

  const handleSaveEdit = async () => {
    if (!editTitle.trim()) {
      Alert.alert('Erro', 'O título é obrigatório');
      return;
    }

    setSaving(true);
    try {
      await updateTask(parseInt(taskId!), {
        title: editTitle.trim(),
        description: editDescription.trim() || undefined,
        priority: editPriority,
      });
      setShowEditModal(false);
      await loadTaskHistory(parseInt(taskId!));
    } catch (error) {
      const apiError = error as ApiError;
      Alert.alert('Erro', apiError.detail);
    } finally {
      setSaving(false);
    }
  };

  const handleChangeStatus = async (status: TaskStatus) => {
    try {
      await changeStatus(parseInt(taskId!), status);
      setShowStatusModal(false);
      await loadTaskHistory(parseInt(taskId!));
    } catch (error) {
      const apiError = error as ApiError;
      Alert.alert('Erro', apiError.detail);
    }
  };

  const handleAssign = async (userId: number | null) => {
    try {
      await assignTask(parseInt(taskId!), userId);
      setShowAssignModal(false);
      await loadTaskHistory(parseInt(taskId!));
    } catch (error) {
      const apiError = error as ApiError;
      Alert.alert('Erro', apiError.detail);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Excluir Tarefa',
      'Tem certeza que deseja excluir esta tarefa? Esta ação não pode ser desfeita.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteTask(parseInt(taskId!));
              router.back();
            } catch (error) {
              const apiError = error as ApiError;
              Alert.alert('Erro', apiError.detail);
            }
          },
        },
      ]
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getHistoryIcon = (actionType: string) => {
    switch (actionType) {
      case 'STATUS_CHANGE':
        return 'swap-horizontal';
      case 'ASSIGNMENT_CHANGE':
        return 'person';
      case 'CREATED':
        return 'add-circle';
      default:
        return 'create';
    }
  };

  const getHistoryText = (item: TaskHistory) => {
    switch (item.action_type) {
      case 'STATUS_CHANGE':
        return `Status: ${STATUS_LABELS[item.old_value as TaskStatus] || item.old_value} → ${STATUS_LABELS[item.new_value as TaskStatus] || item.new_value}`;
      case 'ASSIGNMENT_CHANGE':
        return item.new_value 
          ? `Atribuído a: ${item.new_value}`
          : 'Responsável removido';
      case 'CREATED':
        return 'Tarefa criada';
      default:
        return 'Tarefa atualizada';
    }
  };

  if (isLoading && !currentTask) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  if (!currentTask) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Tarefa não encontrada</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>Voltar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.content}>
        {/* Header com status e prioridade */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={[styles.statusBadge, { backgroundColor: STATUS_COLORS[currentTask.status] + '20' }]}
            onPress={() => setShowStatusModal(true)}
          >
            <View style={[styles.statusDot, { backgroundColor: STATUS_COLORS[currentTask.status] }]} />
            <Text style={[styles.statusText, { color: STATUS_COLORS[currentTask.status] }]}>
              {STATUS_LABELS[currentTask.status]}
            </Text>
            <Ionicons name="chevron-down" size={16} color={STATUS_COLORS[currentTask.status]} />
          </TouchableOpacity>
          
          <View style={[styles.priorityBadge, { backgroundColor: PRIORITY_COLORS[currentTask.priority] + '20' }]}>
            <Text style={[styles.priorityText, { color: PRIORITY_COLORS[currentTask.priority] }]}>
              {PRIORITY_LABELS[currentTask.priority]}
            </Text>
          </View>
        </View>

        {/* Título e descrição */}
        <Text style={styles.title}>{currentTask.title}</Text>
        {currentTask.description && (
          <Text style={styles.description}>{currentTask.description}</Text>
        )}

        {/* Responsável */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Responsável</Text>
          <TouchableOpacity 
            style={styles.assigneeCard}
            onPress={() => setShowAssignModal(true)}
          >
            {currentTask.assignee ? (
              <>
                <View style={styles.assigneeAvatar}>
                  <Text style={styles.assigneeAvatarText}>
                    {currentTask.assignee.name[0].toUpperCase()}
                  </Text>
                </View>
                <View style={styles.assigneeInfo}>
                  <Text style={styles.assigneeName}>{currentTask.assignee.name}</Text>
                  <Text style={styles.assigneeEmail}>{currentTask.assignee.email}</Text>
                </View>
              </>
            ) : (
              <>
                <View style={[styles.assigneeAvatar, styles.assigneeAvatarEmpty]}>
                  <Ionicons name="person-add-outline" size={20} color="#9ca3af" />
                </View>
                <Text style={styles.noAssignee}>Clique para atribuir</Text>
              </>
            )}
            <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
          </TouchableOpacity>
        </View>

        {/* Datas */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Informações</Text>
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Criada em</Text>
              <Text style={styles.infoValue}>{formatDate(currentTask.created_at)}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Atualizada em</Text>
              <Text style={styles.infoValue}>{formatDate(currentTask.updated_at)}</Text>
            </View>
          </View>
        </View>

        {/* Histórico */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Histórico</Text>
          {taskHistory.length > 0 ? (
            <View style={styles.historyList}>
              {taskHistory.map((item) => (
                <View key={item.id} style={styles.historyItem}>
                  <View style={styles.historyIcon}>
                    <Ionicons 
                      name={getHistoryIcon(item.action_type) as any} 
                      size={16} 
                      color="#6b7280" 
                    />
                  </View>
                  <View style={styles.historyContent}>
                    <Text style={styles.historyText}>{getHistoryText(item)}</Text>
                    <Text style={styles.historyMeta}>
                      {item.changer?.name} • {formatDate(item.changed_at)}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          ) : (
            <Text style={styles.noHistory}>Nenhum histórico disponível</Text>
          )}
        </View>
      </ScrollView>

      {/* Ações */}
      <View style={styles.actions}>
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => setShowEditModal(true)}
        >
          <Ionicons name="create-outline" size={20} color="#2563eb" />
          <Text style={styles.actionButtonText}>Editar</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.actionButton, styles.deleteButton]}
          onPress={handleDelete}
        >
          <Ionicons name="trash-outline" size={20} color="#ef4444" />
          <Text style={[styles.actionButtonText, styles.deleteButtonText]}>Excluir</Text>
        </TouchableOpacity>
      </View>

      {/* Modal de edição */}
      <Modal visible={showEditModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Editar Tarefa</Text>
              <TouchableOpacity onPress={() => setShowEditModal(false)}>
                <Ionicons name="close" size={24} color="#6b7280" />
              </TouchableOpacity>
            </View>

            <Text style={styles.inputLabel}>Título *</Text>
            <TextInput
              style={styles.input}
              value={editTitle}
              onChangeText={setEditTitle}
              placeholder="Título da tarefa"
              placeholderTextColor="#9ca3af"
            />

            <Text style={styles.inputLabel}>Descrição</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={editDescription}
              onChangeText={setEditDescription}
              placeholder="Descrição da tarefa"
              placeholderTextColor="#9ca3af"
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />

            <Text style={styles.inputLabel}>Prioridade</Text>
            <View style={styles.priorityOptions}>
              {(['LOW', 'MEDIUM', 'HIGH'] as TaskPriority[]).map((p) => (
                <TouchableOpacity
                  key={p}
                  style={[
                    styles.priorityOption,
                    editPriority === p && styles.priorityOptionActive,
                    editPriority === p && { borderColor: PRIORITY_COLORS[p] },
                  ]}
                  onPress={() => setEditPriority(p)}
                >
                  <View style={[styles.priorityDot, { backgroundColor: PRIORITY_COLORS[p] }]} />
                  <Text style={[
                    styles.priorityOptionText,
                    editPriority === p && { color: PRIORITY_COLORS[p] },
                  ]}>
                    {PRIORITY_LABELS[p]}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={styles.cancelModalButton}
                onPress={() => setShowEditModal(false)}
              >
                <Text style={styles.cancelModalButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.saveButton, saving && styles.buttonDisabled]}
                onPress={handleSaveEdit}
                disabled={saving}
              >
                {saving ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={styles.saveButtonText}>Salvar</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal de status */}
      <Modal visible={showStatusModal} animationType="fade" transparent>
        <TouchableOpacity 
          style={styles.statusModalOverlay}
          activeOpacity={1}
          onPress={() => setShowStatusModal(false)}
        >
          <View style={styles.statusModalContent}>
            <Text style={styles.statusModalTitle}>Alterar Status</Text>
            {(['TODO', 'DOING', 'DONE'] as TaskStatus[]).map((status) => (
              <TouchableOpacity
                key={status}
                style={[
                  styles.statusOption,
                  currentTask.status === status && styles.statusOptionActive,
                ]}
                onPress={() => handleChangeStatus(status)}
              >
                <View style={[styles.statusDot, { backgroundColor: STATUS_COLORS[status] }]} />
                <Text style={[
                  styles.statusOptionText,
                  currentTask.status === status && { fontWeight: '600' },
                ]}>
                  {STATUS_LABELS[status]}
                </Text>
                {currentTask.status === status && (
                  <Ionicons name="checkmark" size={20} color="#2563eb" />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Modal de atribuição */}
      <Modal visible={showAssignModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Atribuir Responsável</Text>
              <TouchableOpacity onPress={() => setShowAssignModal(false)}>
                <Ionicons name="close" size={24} color="#6b7280" />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.memberOption}
              onPress={() => handleAssign(null)}
            >
              <View style={[styles.memberAvatar, styles.memberAvatarEmpty]}>
                <Ionicons name="close" size={20} color="#9ca3af" />
              </View>
              <Text style={styles.memberName}>Sem responsável</Text>
              {!currentTask?.assigned_to && (
                <Ionicons name="checkmark" size={20} color="#2563eb" />
              )}
            </TouchableOpacity>

            {currentProject?.members?.map((member) => (
              <TouchableOpacity
                key={member.user_id}
                style={styles.memberOption}
                onPress={() => handleAssign(member.user_id)}
              >
                <View style={styles.memberAvatar}>
                  <Text style={styles.memberAvatarText}>
                    {member.user?.name?.[0]?.toUpperCase() || '?'}
                  </Text>
                </View>
                <View style={styles.memberInfo}>
                  <Text style={styles.memberName}>{member.user?.name || 'Usuário'}</Text>
                  <Text style={styles.memberEmail}>{member.user?.email || ''}</Text>
                </View>
                {currentTask?.assigned_to === member.user_id && (
                  <Ionicons name="checkmark" size={20} color="#2563eb" />
                )}
              </TouchableOpacity>
            ))}
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
  content: {
    flex: 1,
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  errorText: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 16,
  },
  backButton: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginRight: 8,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '500',
    marginRight: 4,
  },
  priorityBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  priorityText: {
    fontSize: 14,
    fontWeight: '500',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    color: '#6b7280',
    lineHeight: 24,
    marginBottom: 24,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6b7280',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  assigneeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  assigneeAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#2563eb',
    justifyContent: 'center',
    alignItems: 'center',
  },
  assigneeAvatarEmpty: {
    backgroundColor: '#f3f4f6',
  },
  assigneeAvatarText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  assigneeInfo: {
    flex: 1,
    marginLeft: 12,
  },
  assigneeName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  assigneeEmail: {
    fontSize: 14,
    color: '#6b7280',
  },
  noAssignee: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: '#9ca3af',
  },
  infoCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  infoLabel: {
    fontSize: 14,
    color: '#6b7280',
  },
  infoValue: {
    fontSize: 14,
    color: '#111827',
    fontWeight: '500',
  },
  historyList: {
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  historyItem: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  historyIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  historyContent: {
    flex: 1,
  },
  historyText: {
    fontSize: 14,
    color: '#111827',
    marginBottom: 4,
  },
  historyMeta: {
    fontSize: 12,
    color: '#9ca3af',
  },
  noHistory: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
    paddingVertical: 24,
  },
  actions: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#2563eb',
    marginHorizontal: 4,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2563eb',
    marginLeft: 6,
  },
  deleteButton: {
    borderColor: '#ef4444',
  },
  deleteButtonText: {
    color: '#ef4444',
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
    maxHeight: '80%',
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
  priorityOptions: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  priorityOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginHorizontal: 4,
  },
  priorityOptionActive: {
    backgroundColor: '#f9fafb',
  },
  priorityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  priorityOptionText: {
    fontSize: 14,
    color: '#6b7280',
  },
  modalActions: {
    flexDirection: 'row',
  },
  cancelModalButton: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
    marginRight: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  cancelModalButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6b7280',
  },
  saveButton: {
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
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  statusModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  statusModalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    width: '100%',
    maxWidth: 320,
  },
  statusModalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
    textAlign: 'center',
  },
  statusOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  statusOptionActive: {
    backgroundColor: '#f3f4f6',
  },
  statusOptionText: {
    flex: 1,
    fontSize: 16,
    color: '#374151',
    marginLeft: 12,
  },
  memberOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  memberAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#2563eb',
    justifyContent: 'center',
    alignItems: 'center',
  },
  memberAvatarEmpty: {
    backgroundColor: '#f3f4f6',
  },
  memberAvatarText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  memberInfo: {
    flex: 1,
    marginLeft: 12,
  },
  memberName: {
    flex: 1,
    fontSize: 16,
    color: '#111827',
    marginLeft: 12,
  },
  memberEmail: {
    fontSize: 13,
    color: '#6b7280',
  },
});
