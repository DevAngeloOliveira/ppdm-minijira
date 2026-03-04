import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { View, ActivityIndicator, StyleSheet, Text, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../src/store/auth';
import { colors, spacing, fontSize, borderRadius } from '../src/theme/colors';

export default function Index() {
  const router = useRouter();
  const { isAuthenticated, isLoading, loadToken } = useAuthStore();

  useEffect(() => {
    loadToken();
  }, []);

  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated) {
        router.replace('/(drawer)/dashboard');
      } else {
        router.replace('/login');
      }
    }
  }, [isAuthenticated, isLoading]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background.dark} />
      <View style={styles.logo}>
        <Ionicons name="layers" size={40} color={colors.primary} />
      </View>
      <Text style={styles.title}>
        Mini<Text style={styles.titleAccent}>Jira</Text>
      </Text>
      <Text style={styles.subtitle}>Gerenciamento de projetos</Text>
      <ActivityIndicator size="large" color={colors.primary} style={styles.loader} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background.dark,
  },
  logo: {
    width: 80,
    height: 80,
    borderRadius: borderRadius.xl,
    backgroundColor: colors.background.card,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  title: {
    fontSize: fontSize.title,
    fontWeight: 'bold',
    color: colors.text.primary,
  },
  titleAccent: {
    color: colors.primary,
  },
  subtitle: {
    fontSize: fontSize.md,
    color: colors.text.secondary,
    marginTop: spacing.xs,
  },
  loader: {
    marginTop: spacing.xl,
  },
});

