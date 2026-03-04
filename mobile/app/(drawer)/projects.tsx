import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  TextInput,
  Modal,
  Alert,
  ActivityIndicator,
  StatusBar,
} from 'react-native';
import { useRouter } from 'expo-router';
import { DrawerActions, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, fontSize, borderRadius } from '../../src/theme/colors';
import { useAuthStore } from '../../src/store/auth';
import { useProjectStore } from '../../src/store/projects';
import { Project } from '../../src/types';
import { ApiError } from '../../src/lib/api';

interface ProjectCardProps {
  project: Project;
  onPress: () => void;
}

function ProjectCard({ project, onPress }: ProjectCardProps) {
  const progress = Math.floor(Math.random() * 100);
  const statusColor = progress === 100 ? colors.status.success : 
                      progress > 50 ? colors.primary : colors.status.info;
  const statusLabel = progress === 100 ? 'Concluído' : 
                      progress > 0 ? 'Em Andamento' : 'Ativo';

  return (
    <TouchableOpacity style={styles.projectCard} onPress={onPress} activeOpacity={0.7}>
      <View style={[styles.projectCardBorder, { backgroundColor: statusColor }]} />
      <View style={styles.projectCardContent}>
        <View style={styles.projectCardHeader}>
          <View style={styles.projectIconContainer}>
            <Ionicons name="folder" size={20} color={colors.primary} />
          </View>
          <View style={[styles.projectStatusBadge, { backgroundColor: `${statusColor}15` }]}>
            <Text style={[styles.projectStatusText, { color: statusColor }]}>
              {statusLabel}
            </Text>
          </View>
        </View>

        <Text style={styles.projectName}>{project.name}</Text>
        {project.description && (
          <Text style={styles.projectDescription} numberOfLines={1}>
            {project.description}
          </Text>
        )}

        <View style={styles.projectProgress}>
          <Text style={styles.progressLabel}>Progresso</Text>
          <Text style={[styles.progressValue, { color: statusColor }]}>{progress}%</Text>
        </View>

        <View style={styles.progressBarContainer}>
          <View style={[styles.progressBar, { width: `${progress}%`, backgroundColor: statusColor }]} />
        </View>

        <View style={styles.projectFooter}>
          <View style={styles.taskCount}>
            <Ionicons name="time-outline" size={14} color={colors.text.muted} />
            <Text style={styles.taskCountText}>
              {project.members?.length || 1} tarefas
            </Text>
          </View>
          
          <View style={styles.memberAvatars}>
            {(project.members || []).slice(0, 3).map((member, index) => (
              <View 
                key={member.user_id} 
                style={[
                  styles.memberAvatar, 
                  { 
                    marginLeft: index > 0 ? -8 : 0,
                    backgroundColor: ['#3b82f6', '#10b981', '#f59e0b'][index % 3],
                  }
                ]}
              >
                <Text style={styles.memberAvatarText}>
                  {member.user?.name?.[0]?.toUpperCase() || '?'}
                </Text>
              </View>
            ))}
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default function ProjectsScreen() {
  const router = useRouter();
  const navigation = useNavigation();
  const { user } = useAuthStore();
  const { projects, isLoading, loadProjects, createProject } = useProjectStore();
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
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

  const openDrawer = () => {
    navigation.dispatch(DrawerActions.openDrawer());
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

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

  const filteredProjects = projects.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderProject = ({ item, index }: { item: Project; index: number }) => (
    <View style={[
      styles.projectCardWrapper,
      { marginLeft: index % 2 === 0 ? 0 : spacing.md }
    ]}>
      <ProjectCard
        project={item}
        onPress={() => router.push(`/project/${item.id}`)}
      />
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background.light} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.menuButton} onPress={openDrawer}>
          <Ionicons name="menu" size={24} color={colors.text.dark} />
        </TouchableOpacity>

        <View style={styles.searchContainer}>
          <Ionicons name="search" size={18} color={colors.text.muted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar projetos..."
            placeholderTextColor={colors.text.muted}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        <TouchableOpacity style={styles.notificationButton}>
          <Ionicons name="notifications-outline" size={24} color={colors.text.dark} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.profileButton}>
          <Text style={styles.profileText}>{user ? getInitials(user.name) : 'U'}</Text>
        </TouchableOpacity>
      </View>

      {/* Page Header */}
      <View style={styles.pageHeader}>
        <View>
          <Text style={styles.pageTitle}>Projetos</Text>
          <Text style={styles.pageSubtitle}>
            {projects.length} {projects.length === 1 ? 'projeto' : 'projetos'} encontrados
          </Text>
        </View>
        <TouchableOpacity 
          style={styles.newProjectButton}
          onPress={() => setShowCreateModal(true)}
        >
          <Ionicons name="add" size={18} color={colors.text.primary} />
          <Text style={styles.newProjectButtonText}>Novo Projeto</Text>
        </TouchableOpacity>
      </View>

      {/* Projects Grid */}
      <FlatList
        data={filteredProjects}
        renderItem={renderProject}
        keyExtractor={(item) => item.id.toString()}
        numColumns={2}
        contentContainerStyle={styles.projectsList}
        columnWrapperStyle={styles.projectsRow}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
        ListEmptyComponent={
          !isLoading ? (
            <View style={styles.emptyState}>
              <View style={styles.emptyIcon}>
                <Ionicons name="folder-open-outline" size={48} color={colors.text.muted} />
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
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      )}

      {/* FAB */}
      <TouchableOpacity 
        style={styles.fab} 
        onPress={() => setShowCreateModal(true)}
        activeOpacity={0.8}
      >
        <Ionicons name="add" size={28} color={colors.text.primary} />
      </TouchableOpacity>

      {/* Create Modal */}
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
                <Ionicons name="close" size={24} color={colors.text.muted} />
              </TouchableOpacity>
            </View>

            <Text style={styles.inputLabel}>Nome do Projeto *</Text>
            <TextInput
              style={styles.input}
              placeholder="Ex: App Mobile"
              placeholderTextColor={colors.text.muted}
              value={newProjectName}
              onChangeText={setNewProjectName}
              autoFocus
            />

            <Text style={styles.inputLabel}>Descrição (opcional)</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Descreva o projeto..."
              placeholderTextColor={colors.text.muted}
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
                  <ActivityIndicator color={colors.text.primary} size="small" />
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
    backgroundColor: colors.background.light,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.xl + 20,
    paddingBottom: spacing.md,
    backgroundColor: colors.background.white,
    gap: spacing.sm,
  },
  menuButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.light,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.md,
    height: 44,
    gap: spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: fontSize.md,
    color: colors.text.dark,
  },
  notificationButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileText: {
    fontSize: fontSize.sm,
    fontWeight: 'bold',
    color: colors.text.primary,
  },
  pageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    backgroundColor: colors.background.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.background.light,
  },
  pageTitle: {
    fontSize: fontSize.xxl,
    fontWeight: 'bold',
    color: colors.text.dark,
  },
  pageSubtitle: {
    fontSize: fontSize.sm,
    color: colors.text.muted,
    marginTop: spacing.xs,
  },
  newProjectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.lg,
    gap: spacing.xs,
  },
  newProjectButtonText: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.text.primary,
  },
  projectsList: {
    padding: spacing.md,
  },
  projectsRow: {
    justifyContent: 'flex-start',
  },
  projectCardWrapper: {
    width: '48%',
    marginBottom: spacing.md,
  },
  projectCard: {
    backgroundColor: colors.background.white,
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  projectCardBorder: {
    height: 4,
  },
  projectCardContent: {
    padding: spacing.md,
  },
  projectCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  projectIconContainer: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.lg,
    backgroundColor: `${colors.primary}15`,
    justifyContent: 'center',
    alignItems: 'center',
  },
  projectStatusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.md,
  },
  projectStatusText: {
    fontSize: fontSize.xs,
    fontWeight: '600',
  },
  projectName: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    color: colors.text.dark,
    marginBottom: spacing.xs,
  },
  projectDescription: {
    fontSize: fontSize.sm,
    color: colors.text.muted,
    marginBottom: spacing.md,
  },
  projectProgress: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  progressLabel: {
    fontSize: fontSize.xs,
    color: colors.text.muted,
  },
  progressValue: {
    fontSize: fontSize.sm,
    fontWeight: '600',
  },
  progressBarContainer: {
    height: 4,
    backgroundColor: colors.background.light,
    borderRadius: 2,
    marginBottom: spacing.md,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 2,
  },
  projectFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  taskCount: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  taskCountText: {
    fontSize: fontSize.xs,
    color: colors.text.muted,
  },
  memberAvatars: {
    flexDirection: 'row',
  },
  memberAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.background.white,
  },
  memberAvatarText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: colors.text.primary,
  },
  emptyState: {
    alignItems: 'center',
    padding: spacing.xxl,
    marginTop: spacing.xxl,
  },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.background.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  emptyTitle: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    color: colors.text.dark,
    marginTop: spacing.md,
  },
  emptyText: {
    fontSize: fontSize.md,
    color: colors.text.muted,
    textAlign: 'center',
    marginTop: spacing.sm,
    marginBottom: spacing.lg,
  },
  emptyButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
  },
  emptyButtonText: {
    color: colors.text.primary,
    fontSize: fontSize.md,
    fontWeight: '600',
  },
  loadingContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(248, 250, 252, 0.8)',
  },
  fab: {
    position: 'absolute',
    bottom: spacing.lg,
    right: spacing.lg,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.primary,
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
    backgroundColor: colors.background.white,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  modalTitle: {
    fontSize: fontSize.xl,
    fontWeight: 'bold',
    color: colors.text.dark,
  },
  inputLabel: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: colors.text.dark,
    marginBottom: spacing.sm,
  },
  input: {
    backgroundColor: colors.background.light,
    borderWidth: 1,
    borderColor: colors.border.dark,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    fontSize: fontSize.md,
    marginBottom: spacing.md,
    color: colors.text.dark,
  },
  textArea: {
    minHeight: 80,
    paddingTop: spacing.md,
  },
  modalActions: {
    flexDirection: 'row',
    marginTop: spacing.sm,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: spacing.md,
    alignItems: 'center',
    marginRight: spacing.sm,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border.dark,
  },
  cancelButtonText: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: colors.text.muted,
  },
  createButton: {
    flex: 1,
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    alignItems: 'center',
    marginLeft: spacing.sm,
    borderRadius: borderRadius.lg,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  createButtonText: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: colors.text.primary,
  },
});
