import { useEffect, useState, useCallback } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
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
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTaskStore } from '../../src/store/tasks';
import { useProjectStore } from '../../src/store/projects';
import { 
  Task,
  TaskStatus, 
  TaskPriority,
  STATUS_LABELS, 
  STATUS_COLORS,
  PRIORITY_LABELS,
  PRIORITY_COLORS,
} from '../../src/types';
import { ApiError } from '../../src/lib/api';

export default function ProjectScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { 
    tasks, 
    isLoading, 
    loadTasks, 
    createTask, 
    changeStatus,
    setFilters,
    filters,
  } = useTaskStore();
  const { currentProject, loadProject } = useProjectStore();

  const [refreshing, setRefreshing] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDescription, setNewTaskDescription] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState<TaskPriority>('MEDIUM');
  const [creating, setCreating] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<TaskStatus | null>(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  useEffect(() => {
    if (id) {
      loadTasks(parseInt(id));
      loadProject(parseInt(id));
    }
  }, [id]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadTasks(parseInt(id!));
    setRefreshing(false);
  }, [id]);

  const handleCreateTask = async () => {
    if (!newTaskTitle.trim()) {
      Alert.alert('Erro', 'Digite o título da tarefa');
      return;
    }

    setCreating(true);
    try {
      await createTask(parseInt(id!), {
        title: newTaskTitle.trim(),
        description: newTaskDescription.trim() || undefined,
        priority: newTaskPriority,
      });
      setShowCreateModal(false);
      setNewTaskTitle('');
      setNewTaskDescription('');
      setNewTaskPriority('MEDIUM');
    } catch (error) {
      const apiError = error as ApiError;
      Alert.alert('Erro', apiError.detail);
    } finally {
      setCreating(false);
    }
  };

  const handleChangeStatus = async (newStatus: TaskStatus) => {
    if (!selectedTask) return;
    try {
      await changeStatus(selectedTask.id, newStatus);
      setShowStatusModal(false);
      setSelectedTask(null);
    } catch (error) {
      const apiError = error as ApiError;
      Alert.alert('Erro', apiError.detail);
    }
  };

  const handleTaskPress = (task: Task) => {
    // Navegar para a tela de detalhes da tarefa
    router.push({
      pathname: '/task/[taskId]',
      params: { taskId: task.id.toString(), projectId: id },
    });
  };

  const handleTaskLongPress = (task: Task) => {
    setSelectedTask(task);
    setShowStatusModal(true);
  };

  const handleFilterPress = (status: TaskStatus | null) => {
    setSelectedStatus(status);
    setFilters({ status: status || undefined });
    // loadTasks usa os filtros do estado automaticamente
    loadTasks(parseInt(id!));
  };

  const renderTask = ({ item }: { item: Task }) => (
    <TouchableOpacity
      style={styles.taskCard}
      onPress={() => handleTaskPress(item)}
      onLongPress={() => handleTaskLongPress(item)}
    >
      <View style={styles.taskHeader}>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: STATUS_COLORS[item.status] + '20' },
          ]}
        >
          <View style={[styles.statusDot, { backgroundColor: STATUS_COLORS[item.status] }]} />
          <Text
            style={[styles.statusText, { color: STATUS_COLORS[item.status] }]}
          >
            {STATUS_LABELS[item.status]}
          </Text>
        </View>
        <View
          style={[
            styles.priorityBadge,
            { backgroundColor: PRIORITY_COLORS[item.priority] + '20' },
          ]}
        >
          <Text style={[styles.priorityText, { color: PRIORITY_COLORS[item.priority] }]}>
            {PRIORITY_LABELS[item.priority]}
          </Text>
        </View>
      </View>
      <Text style={styles.taskTitle}>{item.title}</Text>
      {item.description && (
        <Text style={styles.taskDescription} numberOfLines={2}>
          {item.description}
        </Text>
      )}
      {item.assignee && (
        <View style={styles.assignee}>
          <View style={styles.assigneeAvatar}>
            <Text style={styles.assigneeAvatarText}>
              {item.assignee.name[0].toUpperCase()}
            </Text>
          </View>
          <Text style={styles.assigneeText}>{item.assignee.name}</Text>
        </View>
      )}
      <View style={styles.taskFooter}>
        <Ionicons name="chevron-forward" size={16} color="#9ca3af" />
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header com nome do projeto */}
      {currentProject && (
        <View style={styles.projectHeader}>
          <Text style={styles.projectName}>{currentProject.name}</Text>
          <Text style={styles.projectStats}>
            {tasks.length} tarefa{tasks.length !== 1 ? 's' : ''}
          </Text>
        </View>
      )}

      {/* Filtros de status */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterContainer}
        contentContainerStyle={styles.filterContent}
      >
        <TouchableOpacity
          style={[styles.filterButton, !selectedStatus && styles.filterButtonActive]}
          onPress={() => handleFilterPress(null)}
        >
          <Text style={[styles.filterText, !selectedStatus && styles.filterTextActive]}>
            Todas
          </Text>
        </TouchableOpacity>
        {(['TODO', 'DOING', 'DONE'] as TaskStatus[]).map((status) => (
          <TouchableOpacity
            key={status}
            style={[
              styles.filterButton,
              selectedStatus === status && styles.filterButtonActive,
            ]}
            onPress={() => handleFilterPress(status)}
          >
            <Text
              style={[
                styles.filterText,
                selectedStatus === status && styles.filterTextActive,
              ]}
            >
              {STATUS_LABELS[status]}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <FlatList
        data={tasks}
        renderItem={renderTask}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          !isLoading ? (
            <View style={styles.empty}>
              <Ionicons name="checkbox-outline" size={64} color="#d1d5db" />
              <Text style={styles.emptyText}>Nenhuma tarefa encontrada</Text>
              <Text style={styles.emptySubtext}>
                Toque no botão + para criar uma nova tarefa
              </Text>
            </View>
          ) : (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#2563eb" />
            </View>
          )
        }
      />

      <TouchableOpacity style={styles.fab} onPress={() => setShowCreateModal(true)}>
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>

      {/* Modal de criar tarefa */}
      <Modal visible={showCreateModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Nova Tarefa</Text>
              <TouchableOpacity onPress={() => setShowCreateModal(false)}>
                <Ionicons name="close" size={24} color="#6b7280" />
              </TouchableOpacity>
            </View>

            <Text style={styles.inputLabel}>Título *</Text>
            <TextInput
              style={styles.input}
              placeholder="Digite o título da tarefa"
              placeholderTextColor="#9ca3af"
              value={newTaskTitle}
              onChangeText={setNewTaskTitle}
            />

            <Text style={styles.inputLabel}>Descrição</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Descrição da tarefa (opcional)"
              placeholderTextColor="#9ca3af"
              value={newTaskDescription}
              onChangeText={setNewTaskDescription}
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
                    newTaskPriority === p && styles.priorityOptionActive,
                    newTaskPriority === p && { borderColor: PRIORITY_COLORS[p] },
                  ]}
                  onPress={() => setNewTaskPriority(p)}
                >
                  <View
                    style={[
                      styles.priorityDot,
                      { backgroundColor: PRIORITY_COLORS[p] },
                    ]}
                  />
                  <Text
                    style={[
                      styles.priorityOptionText,
                      newTaskPriority === p && { color: PRIORITY_COLORS[p], fontWeight: '600' },
                    ]}
                  >
                    {PRIORITY_LABELS[p]}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity 
              style={[styles.createButton, creating && styles.buttonDisabled]} 
              onPress={handleCreateTask}
              disabled={creating}
            >
              {creating ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.createButtonText}>Criar Tarefa</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Modal de alteração de status */}
      <Modal visible={showStatusModal} animationType="fade" transparent>
        <TouchableOpacity
          style={styles.statusModalOverlay}
          activeOpacity={1}
          onPress={() => {
            setShowStatusModal(false);
            setSelectedTask(null);
          }}
        >
          <View style={styles.statusModalContent}>
            <Text style={styles.statusModalTitle}>Alterar Status</Text>
            {selectedTask && (
              <Text style={styles.statusModalSubtitle}>{selectedTask.title}</Text>
            )}
            {(['TODO', 'DOING', 'DONE'] as TaskStatus[]).map((status) => (
              <TouchableOpacity
                key={status}
                style={[
                  styles.statusOption,
                  selectedTask?.status === status && styles.statusOptionActive,
                ]}
                onPress={() => handleChangeStatus(status)}
              >
                <View style={[styles.statusDot, { backgroundColor: STATUS_COLORS[status] }]} />
                <Text
                  style={[
                    styles.statusOptionText,
                    selectedTask?.status === status && { fontWeight: '600' },
                  ]}
                >
                  {STATUS_LABELS[status]}
                </Text>
                {selectedTask?.status === status && (
                  <Ionicons name="checkmark" size={20} color="#2563eb" />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  projectHeader: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  projectName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  projectStats: {
    fontSize: 13,
    color: '#6b7280',
    marginTop: 2,
  },
  filterContainer: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    maxHeight: 56,
  },
  filterContent: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    flexDirection: 'row',
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    marginRight: 8,
  },
  filterButtonActive: {
    backgroundColor: '#2563eb',
  },
  filterText: {
    fontSize: 14,
    color: '#6b7280',
  },
  filterTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  list: {
    padding: 16,
    flexGrow: 1,
  },
  taskCard: {
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
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  priorityBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  priorityText: {
    fontSize: 11,
    fontWeight: '500',
  },
  priorityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  taskDescription: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 8,
    lineHeight: 20,
  },
  assignee: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  assigneeAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#2563eb',
    justifyContent: 'center',
    alignItems: 'center',
  },
  assigneeAvatarText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#fff',
  },
  assigneeText: {
    fontSize: 13,
    color: '#6b7280',
    marginLeft: 8,
  },
  taskFooter: {
    position: 'absolute',
    right: 12,
    top: '50%',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 64,
  },
  empty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 64,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#6b7280',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#9ca3af',
    marginTop: 4,
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
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
    textAlignVertical: 'top',
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
  priorityOptionText: {
    fontSize: 14,
    color: '#6b7280',
  },
  createButton: {
    backgroundColor: '#2563eb',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  createButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
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
    marginBottom: 4,
    textAlign: 'center',
  },
  statusModalSubtitle: {
    fontSize: 14,
    color: '#6b7280',
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
  },
});
