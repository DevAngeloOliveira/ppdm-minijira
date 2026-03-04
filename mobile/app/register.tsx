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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../src/store/auth';
import { ApiError } from '../src/lib/api';

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
        color={met ? '#16a34a' : '#9ca3af'} 
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
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.content}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color="#374151" />
          </TouchableOpacity>

          <View style={styles.header}>
            <Text style={styles.title}>Criar Conta</Text>
            <Text style={styles.subtitle}>Preencha os dados para se registrar</Text>
          </View>

          <View style={styles.form}>
            <Text style={styles.inputLabel}>Nome Completo</Text>
            <TextInput
              style={styles.input}
              placeholder="Digite seu nome"
              placeholderTextColor="#9ca3af"
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
            />

            <Text style={styles.inputLabel}>Email</Text>
            <TextInput
              style={styles.input}
              placeholder="Digite seu email"
              placeholderTextColor="#9ca3af"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />

            <Text style={styles.inputLabel}>Senha</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.passwordInput}
                placeholder="Digite sua senha"
                placeholderTextColor="#9ca3af"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity 
                style={styles.eyeButton}
                onPress={() => setShowPassword(!showPassword)}
              >
                <Ionicons 
                  name={showPassword ? 'eye-off' : 'eye'} 
                  size={20} 
                  color="#6b7280" 
                />
              </TouchableOpacity>
            </View>

            {password.length > 0 && (
              <View style={styles.requirements}>
                {renderPasswordRequirement('Mínimo 8 caracteres', password.length >= 8)}
                {renderPasswordRequirement('Uma letra maiúscula', /[A-Z]/.test(password))}
                {renderPasswordRequirement('Uma letra minúscula', /[a-z]/.test(password))}
                {renderPasswordRequirement('Um número', /[0-9]/.test(password))}
                {renderPasswordRequirement('Um caractere especial', /[!@#$%^&*(),.?":{}|<>]/.test(password))}
              </View>
            )}

            <Text style={styles.inputLabel}>Confirmar Senha</Text>
            <TextInput
              style={[
                styles.input,
                confirmPassword.length > 0 && password !== confirmPassword && styles.inputError
              ]}
              placeholder="Confirme sua senha"
              placeholderTextColor="#9ca3af"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={!showPassword}
            />
            {confirmPassword.length > 0 && password !== confirmPassword && (
              <Text style={styles.errorText}>As senhas não conferem</Text>
            )}

            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleRegister}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Criar Conta</Text>
              )}
            </TouchableOpacity>
          </View>

          <TouchableOpacity 
            style={styles.linkContainer}
            onPress={() => router.push('/login')}
          >
            <Text style={styles.link}>
              Já tem uma conta? <Text style={styles.linkBold}>Entrar</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 32,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  header: {
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
  },
  form: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    marginBottom: 16,
    color: '#111827',
  },
  inputError: {
    borderColor: '#ef4444',
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 12,
    marginBottom: 8,
  },
  passwordInput: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#111827',
  },
  eyeButton: {
    padding: 12,
  },
  requirements: {
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  requirement: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  requirementText: {
    fontSize: 13,
    color: '#6b7280',
    marginLeft: 8,
  },
  requirementMet: {
    color: '#16a34a',
  },
  errorText: {
    color: '#ef4444',
    fontSize: 12,
    marginTop: -12,
    marginBottom: 16,
  },
  button: {
    backgroundColor: '#2563eb',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  linkContainer: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  link: {
    color: '#6b7280',
    fontSize: 14,
  },
  linkBold: {
    color: '#2563eb',
    fontWeight: '600',
  },
});
