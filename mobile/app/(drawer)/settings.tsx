import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  StatusBar,
} from 'react-native';
import { useRouter } from 'expo-router';
import { DrawerActions, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, fontSize, borderRadius } from '../../src/theme/colors';
import { useAuthStore } from '../../src/store/auth';

interface SettingItem {
  id: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  title: string;
  subtitle?: string;
  type: 'navigation' | 'toggle' | 'action';
  value?: boolean;
  onPress?: () => void;
}

export default function SettingsScreen() {
  const router = useRouter();
  const navigation = useNavigation();
  const { user, logout } = useAuthStore();
  
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [emailNotifications, setEmailNotifications] = useState(true);

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

  const handleLogout = async () => {
    Alert.alert(
      'Sair da conta',
      'Tem certeza que deseja sair?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Sair', 
          style: 'destructive',
          onPress: async () => {
            await logout();
            router.replace('/login');
          }
        },
      ]
    );
  };

  const accountSettings: SettingItem[] = [
    {
      id: 'profile',
      icon: 'person-outline',
      iconColor: colors.primary,
      title: 'Perfil',
      subtitle: 'Editar informações pessoais',
      type: 'navigation',
    },
    {
      id: 'password',
      icon: 'lock-closed-outline',
      iconColor: colors.status.warning,
      title: 'Alterar senha',
      subtitle: 'Atualizar sua senha de acesso',
      type: 'navigation',
    },
    {
      id: 'email',
      icon: 'mail-outline',
      iconColor: colors.status.info,
      title: 'Email',
      subtitle: user?.email || 'Não definido',
      type: 'navigation',
    },
  ];

  const preferencesSettings: SettingItem[] = [
    {
      id: 'notifications',
      icon: 'notifications-outline',
      iconColor: colors.status.success,
      title: 'Notificações push',
      subtitle: 'Receber alertas no dispositivo',
      type: 'toggle',
      value: notifications,
      onPress: () => setNotifications(!notifications),
    },
    {
      id: 'emailNotifications',
      icon: 'mail-unread-outline',
      iconColor: colors.primary,
      title: 'Notificações por email',
      subtitle: 'Receber atualizações por email',
      type: 'toggle',
      value: emailNotifications,
      onPress: () => setEmailNotifications(!emailNotifications),
    },
    {
      id: 'darkMode',
      icon: 'moon-outline',
      iconColor: colors.text.muted,
      title: 'Modo escuro',
      subtitle: 'Alterar tema do aplicativo',
      type: 'toggle',
      value: darkMode,
      onPress: () => setDarkMode(!darkMode),
    },
  ];

  const supportSettings: SettingItem[] = [
    {
      id: 'help',
      icon: 'help-circle-outline',
      iconColor: colors.status.info,
      title: 'Central de ajuda',
      subtitle: 'Dúvidas e documentação',
      type: 'navigation',
    },
    {
      id: 'feedback',
      icon: 'chatbox-outline',
      iconColor: colors.status.success,
      title: 'Enviar feedback',
      subtitle: 'Nos ajude a melhorar',
      type: 'navigation',
    },
    {
      id: 'about',
      icon: 'information-circle-outline',
      iconColor: colors.text.muted,
      title: 'Sobre o app',
      subtitle: 'Versão 1.0.0',
      type: 'navigation',
    },
  ];

  const renderSettingItem = (item: SettingItem) => (
    <TouchableOpacity
      key={item.id}
      style={styles.settingItem}
      onPress={item.type === 'toggle' ? item.onPress : undefined}
      activeOpacity={item.type === 'toggle' ? 1 : 0.7}
    >
      <View style={[styles.settingIcon, { backgroundColor: `${item.iconColor}15` }]}>
        <Ionicons name={item.icon} size={20} color={item.iconColor} />
      </View>
      <View style={styles.settingContent}>
        <Text style={styles.settingTitle}>{item.title}</Text>
        {item.subtitle && (
          <Text style={styles.settingSubtitle}>{item.subtitle}</Text>
        )}
      </View>
      {item.type === 'toggle' ? (
        <Switch
          value={item.value}
          onValueChange={item.onPress}
          trackColor={{ false: colors.border.light, true: `${colors.primary}50` }}
          thumbColor={item.value ? colors.primary : colors.text.secondary}
        />
      ) : (
        <Ionicons name="chevron-forward" size={20} color={colors.text.muted} />
      )}
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

        <Text style={styles.headerTitle}>Configurações</Text>

        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.profileAvatar}>
            <Text style={styles.profileAvatarText}>
              {user ? getInitials(user.name) : 'U'}
            </Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{user?.name || 'Usuário'}</Text>
            <Text style={styles.profileEmail}>{user?.email || ''}</Text>
            <View style={styles.profileBadge}>
              <Text style={styles.profileBadgeText}>
                {user?.is_admin ? 'Administrador' : 'Membro'}
              </Text>
            </View>
          </View>
        </View>

        {/* Account Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>CONTA</Text>
          <View style={styles.sectionContent}>
            {accountSettings.map(renderSettingItem)}
          </View>
        </View>

        {/* Preferences Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>PREFERÊNCIAS</Text>
          <View style={styles.sectionContent}>
            {preferencesSettings.map(renderSettingItem)}
          </View>
        </View>

        {/* Support Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>SUPORTE</Text>
          <View style={styles.sectionContent}>
            {supportSettings.map(renderSettingItem)}
          </View>
        </View>

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={20} color={colors.status.error} />
          <Text style={styles.logoutText}>Sair da conta</Text>
        </TouchableOpacity>

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
  headerSpacer: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.white,
    padding: spacing.lg,
    marginHorizontal: spacing.md,
    marginTop: spacing.md,
    borderRadius: borderRadius.xl,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  profileAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileAvatarText: {
    fontSize: fontSize.xxl,
    fontWeight: 'bold',
    color: colors.text.primary,
  },
  profileInfo: {
    marginLeft: spacing.md,
    flex: 1,
  },
  profileName: {
    fontSize: fontSize.xl,
    fontWeight: '600',
    color: colors.text.dark,
  },
  profileEmail: {
    fontSize: fontSize.sm,
    color: colors.text.muted,
    marginTop: spacing.xs,
  },
  profileBadge: {
    alignSelf: 'flex-start',
    backgroundColor: `${colors.primary}15`,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.md,
    marginTop: spacing.sm,
  },
  profileBadgeText: {
    fontSize: fontSize.xs,
    fontWeight: '600',
    color: colors.primary,
  },
  section: {
    marginTop: spacing.lg,
    paddingHorizontal: spacing.md,
  },
  sectionTitle: {
    fontSize: fontSize.xs,
    fontWeight: '600',
    color: colors.text.muted,
    letterSpacing: 1,
    marginBottom: spacing.sm,
    marginLeft: spacing.sm,
  },
  sectionContent: {
    backgroundColor: colors.background.white,
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.background.light,
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: fontSize.md,
    fontWeight: '500',
    color: colors.text.dark,
  },
  settingSubtitle: {
    fontSize: fontSize.sm,
    color: colors.text.muted,
    marginTop: 2,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: `${colors.status.error}10`,
    marginHorizontal: spacing.md,
    marginTop: spacing.lg,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    gap: spacing.sm,
  },
  logoutText: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: colors.status.error,
  },
  bottomPadding: {
    height: spacing.xxl,
  },
});
