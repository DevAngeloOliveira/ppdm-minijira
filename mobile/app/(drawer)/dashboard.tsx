import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  TextInput,
  StatusBar,
} from 'react-native';
import { useRouter } from 'expo-router';
import { DrawerActions, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, fontSize, borderRadius } from '../../src/theme/colors';
import { useAuthStore } from '../../src/store/auth';
import { useProjectStore } from '../../src/store/projects';
import { Project } from '../../src/types';

interface StatCardProps {
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  iconBg: string;
  title: string;
  value: string | number;
  subtitle?: string;
  subtitleColor?: string;
}

function StatCard({ icon, iconColor, iconBg, title, value, subtitle, subtitleColor }: StatCardProps) {
  return (
    <View style={styles.statCard}>
      <View style={[styles.statIcon, { backgroundColor: iconBg }]}>
        <Ionicons name={icon} size={22} color={iconColor} />
      </View>
      <Text style={styles.statTitle}>{title}</Text>
      <Text style={styles.statValue}>{value}</Text>
      {subtitle && (
        <Text style={[styles.statSubtitle, subtitleColor ? { color: subtitleColor } : {}]}>
          {subtitle}
        </Text>
      )}
    </View>
  );
}

interface ProjectCardProps {
  project: Project;
  onPress: () => void;
}

function ProjectCard({ project, onPress }: ProjectCardProps) {
  // Calcular progresso baseado nas tasks (simulado por enquanto)
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

export default function DashboardScreen() {
  const router = useRouter();
  const navigation = useNavigation();
  const { user } = useAuthStore();
  const { projects, isLoading, loadProjects } = useProjectStore();
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadProjects();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadProjects();
    setRefreshing(false);
  };

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

  // Calcular estatísticas
  const totalProjects = projects.length;
  const inProgressProjects = Math.ceil(totalProjects * 0.5); // Simulado
  const completedProjects = Math.floor(totalProjects * 0.2); // Simulado
  const totalTasks = projects.reduce((acc, p) => acc + (p.members?.length || 1), 0);

  const filteredProjects = projects.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
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
          <View style={styles.notificationBadge}>
            <Text style={styles.notificationBadgeText}>2</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.profileButton}>
          <Text style={styles.profileText}>{user ? getInitials(user.name) : 'U'}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
      >
        {/* Título da página */}
        <View style={styles.pageHeader}>
          <Text style={styles.pageTitle}>Meus Projetos</Text>
          <Text style={styles.pageSubtitle}>Gerencie e acompanhe seus projetos em tempo real</Text>
        </View>

        {/* Stats Grid */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.statsContainer}
        >
          <StatCard
            icon="layers"
            iconColor={colors.primary}
            iconBg={`${colors.primary}15`}
            title="Total de Projetos"
            value={totalProjects}
            subtitle={`↗ +2 este mês`}
            subtitleColor={colors.status.success}
          />
          <StatCard
            icon="time"
            iconColor={colors.status.warning}
            iconBg={`${colors.status.warning}15`}
            title="Em Andamento"
            value={inProgressProjects}
          />
          <StatCard
            icon="checkmark-circle"
            iconColor={colors.status.success}
            iconBg={`${colors.status.success}15`}
            title="Concluídos"
            value={completedProjects}
            subtitle="↗ 100% no prazo"
            subtitleColor={colors.status.success}
          />
          <StatCard
            icon="list"
            iconColor={colors.status.info}
            iconBg={`${colors.status.info}15`}
            title="Total de Tarefas"
            value={totalTasks}
            subtitle="↗ +8 esta semana"
            subtitleColor={colors.status.success}
          />
        </ScrollView>

        {/* Projects Grid */}
        <View style={styles.projectsHeader}>
          <Text style={styles.sectionTitle}>Projetos Recentes</Text>
          <TouchableOpacity 
            style={styles.newProjectButton}
            onPress={() => router.push('/(drawer)/projects')}
          >
            <Ionicons name="add" size={18} color={colors.text.primary} />
            <Text style={styles.newProjectButtonText}>Novo Projeto</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.projectsGrid}>
          {filteredProjects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onPress={() => router.push(`/project/${project.id}`)}
            />
          ))}
        </View>

        {filteredProjects.length === 0 && !isLoading && (
          <View style={styles.emptyState}>
            <Ionicons name="folder-open-outline" size={48} color={colors.text.muted} />
            <Text style={styles.emptyTitle}>Nenhum projeto encontrado</Text>
            <Text style={styles.emptyText}>
              {searchQuery ? 'Tente buscar com outros termos' : 'Crie seu primeiro projeto para começar'}
            </Text>
          </View>
        )}

        <View style={styles.bottomPadding} />
      </ScrollView>
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
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: colors.status.error,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: colors.text.primary,
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
  content: {
    flex: 1,
  },
  pageHeader: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.sm,
  },
  pageTitle: {
    fontSize: fontSize.xxl,
    fontWeight: 'bold',
    color: colors.text.dark,
    marginBottom: spacing.xs,
  },
  pageSubtitle: {
    fontSize: fontSize.md,
    color: colors.text.muted,
  },
  statsContainer: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    gap: spacing.md,
  },
  statCard: {
    backgroundColor: colors.background.white,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    width: 160,
    marginRight: spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  statIcon: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  statTitle: {
    fontSize: fontSize.sm,
    color: colors.text.muted,
    marginBottom: spacing.xs,
  },
  statValue: {
    fontSize: fontSize.xxl,
    fontWeight: 'bold',
    color: colors.text.dark,
  },
  statSubtitle: {
    fontSize: fontSize.xs,
    color: colors.status.success,
    marginTop: spacing.xs,
  },
  projectsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    marginTop: spacing.md,
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    color: colors.text.dark,
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
  projectsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: spacing.md,
    gap: spacing.md,
  },
  projectCard: {
    backgroundColor: colors.background.white,
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    width: '47%',
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
  },
  bottomPadding: {
    height: spacing.xxl,
  },
});
