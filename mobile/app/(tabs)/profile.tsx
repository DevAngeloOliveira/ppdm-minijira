import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../src/store/auth';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, logout, loadUser } = useAuthStore();

  useEffect(() => {
    if (!user) {
      loadUser();
    }
  }, []);

  const handleLogout = () => {
    Alert.alert(
      'Sair',
      'Deseja realmente sair da sua conta?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Sair',
          style: 'destructive',
          onPress: async () => {
            await logout();
            router.replace('/login');
          },
        },
      ]
    );
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {user?.name?.[0]?.toUpperCase() || 'U'}
          </Text>
        </View>
        <Text style={styles.name}>{user?.name || 'Carregando...'}</Text>
        <Text style={styles.email}>{user?.email}</Text>
        {user?.created_at && (
          <Text style={styles.since}>
            Membro desde {formatDate(user.created_at)}
          </Text>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Conta</Text>
        
        <TouchableOpacity style={styles.menuItem}>
          <View style={[styles.iconContainer, { backgroundColor: '#eff6ff' }]}>
            <Ionicons name="person-outline" size={20} color="#2563eb" />
          </View>
          <View style={styles.menuContent}>
            <Text style={styles.menuText}>Editar Perfil</Text>
            <Text style={styles.menuSubtext}>Nome, email</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <View style={[styles.iconContainer, { backgroundColor: '#fef3c7' }]}>
            <Ionicons name="lock-closed-outline" size={20} color="#d97706" />
          </View>
          <View style={styles.menuContent}>
            <Text style={styles.menuText}>Alterar Senha</Text>
            <Text style={styles.menuSubtext}>Atualize sua senha</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Preferências</Text>
        
        <TouchableOpacity style={styles.menuItem}>
          <View style={[styles.iconContainer, { backgroundColor: '#f3e8ff' }]}>
            <Ionicons name="notifications-outline" size={20} color="#9333ea" />
          </View>
          <View style={styles.menuContent}>
            <Text style={styles.menuText}>Notificações</Text>
            <Text style={styles.menuSubtext}>Alertas e avisos</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <View style={[styles.iconContainer, { backgroundColor: '#ecfdf5' }]}>
            <Ionicons name="color-palette-outline" size={20} color="#059669" />
          </View>
          <View style={styles.menuContent}>
            <Text style={styles.menuText}>Aparência</Text>
            <Text style={styles.menuSubtext}>Tema claro/escuro</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Sobre</Text>
        
        <TouchableOpacity style={styles.menuItem}>
          <View style={[styles.iconContainer, { backgroundColor: '#f3f4f6' }]}>
            <Ionicons name="information-circle-outline" size={20} color="#6b7280" />
          </View>
          <View style={styles.menuContent}>
            <Text style={styles.menuText}>Sobre o App</Text>
            <Text style={styles.menuSubtext}>Versão 1.0.0</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={20} color="#ef4444" />
          <Text style={styles.logoutText}>Sair da Conta</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.footer}>
        Mini Jira v1.0.0{'\n'}
        Projeto Acadêmico - PPDM
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    alignItems: 'center',
    paddingVertical: 32,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: '#2563eb',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  avatarText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#fff',
  },
  name: {
    fontSize: 22,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 8,
  },
  since: {
    fontSize: 12,
    color: '#9ca3af',
  },
  section: {
    backgroundColor: '#fff',
    marginTop: 16,
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#e5e7eb',
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6b7280',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    paddingVertical: 12,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuContent: {
    flex: 1,
    marginLeft: 12,
  },
  menuText: {
    fontSize: 16,
    color: '#111827',
    fontWeight: '500',
  },
  menuSubtext: {
    fontSize: 13,
    color: '#6b7280',
    marginTop: 2,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
  },
  logoutText: {
    fontSize: 16,
    color: '#ef4444',
    fontWeight: '600',
    marginLeft: 8,
  },
  footer: {
    textAlign: 'center',
    color: '#9ca3af',
    fontSize: 12,
    lineHeight: 18,
    padding: 24,
  },
});
