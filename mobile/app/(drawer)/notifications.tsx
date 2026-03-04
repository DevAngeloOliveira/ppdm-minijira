import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  StatusBar,
} from 'react-native';
import { DrawerActions, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, fontSize, borderRadius } from '../../src/theme/colors';
import { useAuthStore } from '../../src/store/auth';

interface Notification {
  id: string;
  type: 'task_assigned' | 'comment' | 'status_change' | 'project_invite' | 'mention';
  title: string;
  message: string;
  time: string;
  read: boolean;
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
}

const mockNotifications: Notification[] = [
  {
    id: '1',
    type: 'task_assigned',
    title: 'Nova tarefa atribuída',
    message: 'Você foi atribuído à tarefa "Implementar autenticação"',
    time: '5 min atrás',
    read: false,
    icon: 'person-add',
    iconColor: colors.primary,
  },
  {
    id: '2',
    type: 'status_change',
    title: 'Status alterado',
    message: 'A tarefa "Criar API REST" foi movida para "Em Progresso"',
    time: '1 hora atrás',
    read: false,
    icon: 'swap-horizontal',
    iconColor: colors.status.warning,
  },
  {
    id: '3',
    type: 'comment',
    title: 'Novo comentário',
    message: 'João comentou na tarefa "Design do dashboard"',
    time: '2 horas atrás',
    read: true,
    icon: 'chatbubble',
    iconColor: colors.status.info,
  },
  {
    id: '4',
    type: 'project_invite',
    title: 'Convite para projeto',
    message: 'Você foi convidado para o projeto "E-commerce"',
    time: '1 dia atrás',
    read: true,
    icon: 'mail',
    iconColor: colors.status.success,
  },
  {
    id: '5',
    type: 'mention',
    title: 'Você foi mencionado',
    message: 'Maria mencionou você em um comentário',
    time: '2 dias atrás',
    read: true,
    icon: 'at',
    iconColor: colors.primary,
  },
];

export default function NotificationsScreen() {
  const navigation = useNavigation();
  const { user } = useAuthStore();
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
  const [refreshing, setRefreshing] = useState(false);

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

  const onRefresh = async () => {
    setRefreshing(true);
    // Simular refresh
    await new Promise(resolve => setTimeout(resolve, 1000));
    setRefreshing(false);
  };

  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const renderNotification = ({ item }: { item: Notification }) => (
    <TouchableOpacity
      style={[styles.notificationCard, !item.read && styles.notificationUnread]}
      onPress={() => markAsRead(item.id)}
      activeOpacity={0.7}
    >
      <View style={[styles.notificationIcon, { backgroundColor: `${item.iconColor}15` }]}>
        <Ionicons name={item.icon} size={20} color={item.iconColor} />
      </View>
      <View style={styles.notificationContent}>
        <View style={styles.notificationHeader}>
          <Text style={styles.notificationTitle}>{item.title}</Text>
          {!item.read && <View style={styles.unreadDot} />}
        </View>
        <Text style={styles.notificationMessage} numberOfLines={2}>
          {item.message}
        </Text>
        <Text style={styles.notificationTime}>{item.time}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background.light} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.menuButton} onPress={openDrawer}>
          <Ionicons name="menu" size={24} color={colors.text.dark} />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Notificações</Text>

        <TouchableOpacity style={styles.profileButton}>
          <Text style={styles.profileText}>{user ? getInitials(user.name) : 'U'}</Text>
        </TouchableOpacity>
      </View>

      {/* Subheader */}
      <View style={styles.subheader}>
        <Text style={styles.subheaderText}>
          {unreadCount > 0 
            ? `${unreadCount} ${unreadCount === 1 ? 'não lida' : 'não lidas'}`
            : 'Todas lidas'
          }
        </Text>
        {unreadCount > 0 && (
          <TouchableOpacity onPress={markAllAsRead}>
            <Text style={styles.markAllText}>Marcar todas como lidas</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Notifications List */}
      <FlatList
        data={notifications}
        renderItem={renderNotification}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <View style={styles.emptyIcon}>
              <Ionicons name="notifications-off-outline" size={48} color={colors.text.muted} />
            </View>
            <Text style={styles.emptyTitle}>Sem notificações</Text>
            <Text style={styles.emptyText}>
              Você será notificado sobre atualizações nos seus projetos
            </Text>
          </View>
        }
      />
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
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.xl + 20,
    paddingBottom: spacing.md,
    backgroundColor: colors.background.white,
  },
  menuButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: fontSize.xl,
    fontWeight: '600',
    color: colors.text.dark,
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
  subheader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.background.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.background.light,
  },
  subheaderText: {
    fontSize: fontSize.sm,
    color: colors.text.muted,
  },
  markAllText: {
    fontSize: fontSize.sm,
    color: colors.primary,
    fontWeight: '600',
  },
  list: {
    padding: spacing.md,
  },
  notificationCard: {
    flexDirection: 'row',
    backgroundColor: colors.background.white,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  notificationUnread: {
    backgroundColor: `${colors.primary}08`,
    borderLeftWidth: 3,
    borderLeftColor: colors.primary,
  },
  notificationIcon: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  notificationContent: {
    flex: 1,
  },
  notificationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  notificationTitle: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: colors.text.dark,
    flex: 1,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
    marginLeft: spacing.sm,
  },
  notificationMessage: {
    fontSize: fontSize.sm,
    color: colors.text.muted,
    lineHeight: 20,
    marginBottom: spacing.xs,
  },
  notificationTime: {
    fontSize: fontSize.xs,
    color: colors.text.muted,
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
  },
});
