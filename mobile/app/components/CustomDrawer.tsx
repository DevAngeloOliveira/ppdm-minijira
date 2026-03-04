import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { DrawerContentScrollView, DrawerContentComponentProps } from '@react-navigation/drawer';
import { useRouter, usePathname } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, fontSize, borderRadius } from '../../src/theme/colors';
import { useAuthStore } from '../../src/store/auth';
import { useProjectStore } from '../../src/store/projects';

interface MenuItem {
  name: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  route: string;
  badge?: number;
}

export default function CustomDrawer(props: DrawerContentComponentProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout } = useAuthStore();
  const { projects } = useProjectStore();

  const menuItems: MenuItem[] = [
    {
      name: 'dashboard',
      label: 'Dashboard',
      icon: 'grid-outline',
      route: '/(drawer)/dashboard',
    },
    {
      name: 'projects',
      label: 'Projetos',
      icon: 'folder-outline',
      route: '/(drawer)/projects',
      badge: projects.length || undefined,
    },
    {
      name: 'notifications',
      label: 'Notificações',
      icon: 'notifications-outline',
      route: '/(drawer)/notifications',
      badge: 3, // TODO: Implementar contagem real
    },
    {
      name: 'settings',
      label: 'Configurações',
      icon: 'settings-outline',
      route: '/(drawer)/settings',
    },
  ];

  const isActive = (route: string) => {
    return pathname.includes(route.replace('/(drawer)', ''));
  };

  const handleNavigation = (route: string) => {
    router.push(route as any);
    props.navigation.closeDrawer();
  };

  const handleLogout = async () => {
    await logout();
    router.replace('/login');
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <View style={styles.logo}>
            <Ionicons name="layers" size={24} color={colors.primary} />
          </View>
          <View>
            <Text style={styles.logoText}>
              Mini<Text style={styles.logoAccent}>Jira</Text>
            </Text>
          </View>
        </View>
        <TouchableOpacity
          style={styles.closeButton}
          onPress={() => props.navigation.closeDrawer()}
        >
          <Ionicons name="close" size={24} color={colors.text.secondary} />
        </TouchableOpacity>
      </View>

      {/* Menu Label */}
      <Text style={styles.menuLabel}>MENU</Text>

      {/* Menu Items */}
      <DrawerContentScrollView {...props} contentContainerStyle={styles.scrollContent}>
        <View style={styles.menuContainer}>
          {menuItems.map((item) => (
            <TouchableOpacity
              key={item.name}
              style={[
                styles.menuItem,
                isActive(item.route) && styles.menuItemActive,
              ]}
              onPress={() => handleNavigation(item.route)}
            >
              <Ionicons
                name={isActive(item.route) ? item.icon.replace('-outline', '') as any : item.icon}
                size={22}
                color={isActive(item.route) ? colors.text.primary : colors.text.secondary}
              />
              <Text
                style={[
                  styles.menuItemText,
                  isActive(item.route) && styles.menuItemTextActive,
                ]}
              >
                {item.label}
              </Text>
              {item.badge && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{item.badge}</Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>
      </DrawerContentScrollView>

      {/* User Profile */}
      <View style={styles.userSection}>
        <TouchableOpacity style={styles.userProfile} onPress={() => handleNavigation('/(drawer)/settings')}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {user ? getInitials(user.name) : 'U'}
            </Text>
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{user?.name || 'Usuário'}</Text>
            <Text style={styles.userRole}>
              {user?.is_admin ? 'Admin' : 'Membro'}
            </Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={20} color={colors.text.secondary} />
          <Text style={styles.logoutText}>Sair da conta</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.dark,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl + 20,
    paddingBottom: spacing.md,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  logo: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.background.card,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoText: {
    fontSize: fontSize.xl,
    fontWeight: 'bold',
    color: colors.text.primary,
  },
  logoAccent: {
    color: colors.primary,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: borderRadius.full,
    backgroundColor: colors.background.card,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuLabel: {
    fontSize: fontSize.xs,
    fontWeight: '600',
    color: colors.text.muted,
    paddingHorizontal: spacing.lg,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
    letterSpacing: 1,
  },
  scrollContent: {
    paddingTop: 0,
  },
  menuContainer: {
    paddingHorizontal: spacing.md,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.xs,
  },
  menuItemActive: {
    backgroundColor: colors.primary,
  },
  menuItemText: {
    flex: 1,
    fontSize: fontSize.lg,
    color: colors.text.secondary,
    marginLeft: spacing.md,
  },
  menuItemTextActive: {
    color: colors.text.primary,
    fontWeight: '600',
  },
  badge: {
    minWidth: 24,
    height: 24,
    borderRadius: borderRadius.full,
    backgroundColor: colors.background.card,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
  },
  badgeText: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.text.primary,
  },
  userSection: {
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.lg,
  },
  userProfile: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.md,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.full,
    backgroundColor: colors.background.dark,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: fontSize.md,
    fontWeight: 'bold',
    color: colors.text.primary,
  },
  userInfo: {
    marginLeft: spacing.md,
    flex: 1,
  },
  userName: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    color: colors.text.primary,
  },
  userRole: {
    fontSize: fontSize.sm,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
  },
  logoutText: {
    fontSize: fontSize.md,
    color: colors.text.secondary,
    marginLeft: spacing.sm,
  },
});
