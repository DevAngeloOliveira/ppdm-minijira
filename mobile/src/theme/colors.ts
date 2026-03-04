// Tema de cores baseado no protótipo
export const colors = {
  // Cores primárias
  primary: '#0ea5e9',      // Cyan/Turquesa - cor de destaque
  primaryDark: '#0284c7',  // Cyan escuro
  primaryLight: '#38bdf8', // Cyan claro

  // Cores de fundo
  background: {
    dark: '#0f172a',       // Fundo principal escuro (sidebar)
    darker: '#0b1120',     // Fundo mais escuro
    card: '#1e293b',       // Fundo dos cards
    cardHover: '#334155',  // Card hover
    light: '#f8fafc',      // Fundo claro
    white: '#ffffff',
  },

  // Textos
  text: {
    primary: '#ffffff',    // Texto principal (branco)
    secondary: '#94a3b8',  // Texto secundário (cinza claro)
    muted: '#64748b',      // Texto mutado
    dark: '#1e293b',       // Texto escuro
    accent: '#0ea5e9',     // Texto destaque
  },

  // Status
  status: {
    success: '#10b981',    // Verde
    warning: '#f59e0b',    // Amarelo/Laranja
    error: '#ef4444',      // Vermelho
    info: '#3b82f6',       // Azul
  },

  // Bordas
  border: {
    light: '#334155',
    dark: '#1e293b',
    accent: '#0ea5e9',
  },

  // Badges de status do projeto
  projectStatus: {
    active: '#10b981',        // Ativo - Verde
    inProgress: '#3b82f6',    // Em Andamento - Azul
    completed: '#10b981',     // Concluído - Verde
  },

  // Gradientes (para usar com LinearGradient)
  gradients: {
    primary: ['#0ea5e9', '#0284c7'],
    sidebar: ['#0f172a', '#1e293b'],
    card: ['#1e293b', '#334155'],
  },
};

// Espaçamentos padrão
export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

// Tamanhos de fonte
export const fontSize = {
  xs: 10,
  sm: 12,
  md: 14,
  lg: 16,
  xl: 18,
  xxl: 24,
  title: 28,
};

// Border radius
export const borderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  full: 9999,
};

export default {
  colors,
  spacing,
  fontSize,
  borderRadius,
};
