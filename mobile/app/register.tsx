import { useState } from 'react';
import { useRouter } from 'expo-router';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../src/store/auth';
import { ApiError } from '../src/lib/api';
import { colors, spacing, fontSize, borderRadius } from '../src/theme/colors';

// Validação de senha igual ao backend
const validatePassword = (password: string): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (password.length < 8) {
    errors.push('Mínimo 8 caracteres');
  }
  if (password.length > 72) {
    errors.push('Máximo 72 caracteres');
  }
  if (!/[A-Z]/.test(password)) {
    errors.push('Uma letra maiúscula');
  }
  if (!/[a-z]/.test(password)) {
    errors.push('Uma letra minúscula');
  }
  if (!/[0-9]/.test(password)) {
    errors.push('Um número');
  }
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Um caractere especial (!@#$%...)');
  }
  
  return { valid: errors.length === 0, errors };
};

export default function RegisterScreen() {
  const router = useRouter();
  const { register } = useAuthStore();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const passwordValidation = validatePassword(password);

  const handleRegister = async () => {
    if (!name || !email || !password || !confirmPassword) {
      Alert.alert('Erro', 'Preencha todos os campos');
      return;
    }

    if (!passwordValidation.valid) {
      Alert.alert('Senha Fraca', 'A senha não atende aos requisitos de segurança.');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Erro', 'As senhas não conferem');
      return;
    }

    setLoading(true);
    try {
      await register({ name, email, password });
      Alert.alert('Sucesso', 'Conta criada com sucesso!', [
        { text: 'OK', onPress: () => router.replace('/login') },
      ]);
    } catch (error) {
      const apiError = error as ApiError;
      Alert.alert('Erro', apiError.detail || 'Erro ao registrar');
    } finally {
      setLoading(false);
    }
  };

  const renderPasswordRequirement = (text: string, met: boolean) => (
    <View style={styles.requirement} key={text}>
      <Ionicons 
        name={met ? 'checkmark-circle' : 'ellipse-outline'} 
        size={16} 
        color={met ? colors.status.success : colors.text.muted} 
      />
      <Text style={[styles.requirementText, met && styles.requirementMet]}>
        {text}
      </Text>
    </View>
  );

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <StatusBar barStyle="dark-content" backgroundColor={colors.background.light} />
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          {/* Back Button */}
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color={colors.text.dark} />
          </TouchableOpacity>

          {/* Logo */}
          <View style={styles.logoContainer}>
            <View style={styles.logo}>
              <Ionicons name="layers" size={28} color={colors.primary} />
            </View>
            <Text style={styles.logoTitle}>
              Mini<Text style={styles.logoAccent}>Jira</Text>
            </Text>
          </View>

          {/* Form Card */}
          <View style={styles.formCard}>
            <Text style={styles.welcomeTitle}>Criar Conta</Text>
            <Text style={styles.welcomeSubtitle}>
              Preencha os dados para solicitar acesso
            </Text>

            {/* Name Field */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Nome Completo</Text>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  placeholder="Seu nome completo"
                  placeholderTextColor={colors.text.muted}
                  value={name}
                  onChangeText={setName}
                  autoCapitalize="words"
                />
              </View>
            </View>

            {/* Email Field */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>E-mail</Text>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  placeholder="seu@email.com"
                  placeholderTextColor={colors.text.muted}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>
            </View>

            {/* Password Field */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Senha</Text>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  placeholder="••••••••"
                  placeholderTextColor={colors.text.muted}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity 
                  style={styles.eyeButton}
                  onPress={() => setShowPassword(!showPassword)}
                >
                  <Ionicons 
                    name={showPassword ? 'eye-off-outline' : 'eye-outline'} 
                    size={22} 
                    color={colors.text.muted} 
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Password Requirements */}
            {password.length > 0 && (
              <View style={styles.requirements}>
                {renderPasswordRequirement('Mínimo 8 caracteres', password.length >= 8)}
                {renderPasswordRequirement('Uma letra maiúscula', /[A-Z]/.test(password))}
                {renderPasswordRequirement('Uma letra minúscula', /[a-z]/.test(password))}
                {renderPasswordRequirement('Um número', /[0-9]/.test(password))}
                {renderPasswordRequirement('Um caractere especial', /[!@#$%^&*(),.?":{}|<>]/.test(password))}
              </View>
            )}

            {/* Confirm Password Field */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Confirmar Senha</Text>
              <View style={[
                styles.inputContainer,
                confirmPassword.length > 0 && password !== confirmPassword && styles.inputError
              ]}>
                <TextInput
                  style={styles.input}
                  placeholder="••••••••"
                  placeholderTextColor={colors.text.muted}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={!showPassword}
                />
              </View>
              {confirmPassword.length > 0 && password !== confirmPassword && (
                <Text style={styles.errorText}>As senhas não conferem</Text>
              )}
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleRegister}
              disabled={loading}
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator color={colors.text.primary} />
              ) : (
                <Text style={styles.buttonText}>Criar Conta</Text>
              )}
            </TouchableOpacity>

            {/* Login Link */}
            <View style={styles.loginContainer}>
              <Text style={styles.loginText}>Já tem conta? </Text>
              <TouchableOpacity onPress={() => router.push('/login')}>
                <Text style={styles.loginLink}>Fazer login</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.light,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xxl,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.full,
    backgroundColor: colors.background.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  logo: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.lg,
    backgroundColor: `${colors.primary}15`,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  logoTitle: {
    fontSize: fontSize.xl,
    fontWeight: 'bold',
    color: colors.text.dark,
  },
  logoAccent: {
    color: colors.primary,
  },
  formCard: {
    backgroundColor: colors.background.white,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 4,
  },
  welcomeTitle: {
    fontSize: fontSize.xxl,
    fontWeight: 'bold',
    color: colors.text.dark,
    marginBottom: spacing.xs,
  },
  welcomeSubtitle: {
    fontSize: fontSize.md,
    color: colors.text.muted,
    marginBottom: spacing.lg,
  },
  inputGroup: {
    marginBottom: spacing.md,
  },
  inputLabel: {
    fontSize: fontSize.sm,
    fontWeight: '500',
    color: colors.text.dark,
    marginBottom: spacing.sm,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.light,
    borderWidth: 1,
    borderColor: colors.border.dark,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
  },
  inputError: {
    borderColor: colors.status.error,
  },
  input: {
    flex: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    fontSize: fontSize.md,
    color: colors.text.dark,
  },
  eyeButton: {
    padding: spacing.md,
  },
  requirements: {
    backgroundColor: colors.background.light,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  requirement: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  requirementText: {
    fontSize: fontSize.sm,
    color: colors.text.muted,
    marginLeft: spacing.sm,
  },
  requirementMet: {
    color: colors.status.success,
  },
  errorText: {
    color: colors.status.error,
    fontSize: fontSize.xs,
    marginTop: spacing.xs,
  },
  button: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.md + 2,
    alignItems: 'center',
    marginTop: spacing.md,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: colors.text.primary,
    fontSize: fontSize.md,
    fontWeight: '600',
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.lg,
  },
  loginText: {
    fontSize: fontSize.md,
    color: colors.text.muted,
  },
  loginLink: {
    fontSize: fontSize.md,
    color: colors.primary,
    fontWeight: '600',
  },
});
