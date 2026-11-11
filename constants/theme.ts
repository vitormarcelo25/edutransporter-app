/**
 * Abaixo estão as cores usadas no app. As cores são definidas no modo claro e escuro.
 * Existem muitas outras formas de estilizar seu app. Por exemplo, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { Platform, StatusBarStyle } from 'react-native';

export const Colors = {
  dark: {
    gold: '#FFB347',
    bg: '#121A2F',
    card: '#233248',
    header: '#121A2F',
    inset: '#121A2F',
    text: '#FFFFFF',
    textMain: '#FFFFFF',
    textLight: '#94A3B8',
    subtext: '#94A3B8',
    border: '#37474F',
    status: 'light-content' as StatusBarStyle,
    inputBg: '#121A2F',
    darkBlue: '#3D5A80',
    accent: '#FFB347',
    onAccent: '#1A253A',
    coral: '#FF8A65',
    ok: '#48BB78',
    blue: '#4299E1',
  },
  light: {
    gold: '#F5A623',
    bg: '#F8FAFC',
    card: '#FFFFFF',
    header: '#FFFFFF',
    inset: '#F1F5F9',
    text: '#0F172A',
    textMain: '#0F172A',
    textLight: '#64748B',
    subtext: '#64748B',
    border: '#E2E8F0',
    status: 'dark-content' as StatusBarStyle,
    inputBg: '#F1F5F9',
    darkBlue: '#1A253A',
    accent: '#F5A623',
    onAccent: '#FFFFFF',
    coral: '#C2410C',
    ok: '#047857',
    blue: '#0369A1',
  }
};

export const MotoristaColors = {
  dark: {
    gold: '#2DD4BF',         // Aqua principal (--acc)
    bg: '#071A20',           // Fundo principal (--bg)
    card: '#0F2F3A',         // Cards (--card)
    header: '#0D2730',       // Header e TabBar (--hdr)
    inset: '#08212A',        // Áreas internas (--inset)
    text: '#EAF7F8',         // Texto principal (--ink)
    textMain: '#EAF7F8',
    textLight: '#9CC3C9',    // Subtexto (--mute)
    subtext: '#9CC3C9',
    border: '#1F4654',       // Bordas e linhas (--line)
    status: 'light-content' as StatusBarStyle,
    inputBg: '#08212A',
    darkBlue: '#0D2730',
    accent: '#2DD4BF',       // --acc
    onAccent: '#04201C',     // --on-acc
    coral: '#FF8A65',        // --acc2
    ok: '#6EE7B7',           // --ok
    blue: '#7DD3FC',         // --blue
  },
  light: {
    gold: '#0F766E',         // Teal/Aqua principal (--acc)
    bg: '#EAF6F6',           // Névoa suave (--bg)
    card: '#FFFFFF',         // Cards brancos (--card)
    header: '#FFFFFF',       // Header (--hdr)
    inset: '#DDEEEF',        // Insets (--inset)
    text: '#0B2A30',         // Texto escuro (--ink)
    textMain: '#0B2A30',
    textLight: '#46666C',    // Subtexto (--mute)
    subtext: '#46666C',
    border: '#C4DDDF',       // Bordas sutis (--line)
    status: 'dark-content' as StatusBarStyle,
    inputBg: '#DDEEEF',
    darkBlue: '#0F766E',
    accent: '#0F766E',       // --acc
    onAccent: '#FFFFFF',     // --on-acc
    coral: '#C2410C',        // --acc2
    ok: '#047857',           // --ok
    blue: '#0369A1',         // --blue
  }
};

export const AdminColors = {
  dark: {
    gold: '#8B7CFF',         // Violeta/Índigo principal (--acc)
    bg: '#0E0C24',           // Fundo principal (--bg)
    card: '#1D1A47',         // Cards (--card)
    header: '#17143A',       // Header (--hdr)
    inset: '#131030',        // Insets (--inset)
    text: '#F0EEFF',         // Texto principal (--ink)
    textMain: '#F0EEFF',
    textLight: '#AAA6D9',    // Subtexto (--mute)
    subtext: '#AAA6D9',
    border: '#34306B',       // Linhas e bordas (--line)
    status: 'light-content' as StatusBarStyle,
    inputBg: '#131030',
    darkBlue: '#17143A',
    accent: '#8B7CFF',       // --acc
    onAccent: '#0E0C24',
    coral: '#FBBF24',        // --c3 âmbar
    ok: '#4ADE80',           // --c2 verde
    blue: '#7DD3FC',         // --c1 azul
    danger: '#F87171',
  },
  light: {
    gold: '#5B3FE0',         // Lavanda vibrante principal
    bg: '#F1EFFC',           // Fundo lavanda claro (--bg)
    card: '#FFFFFF',         // Cards brancos (--card)
    header: '#FFFFFF',       // Header (--hdr)
    inset: '#E6E2F7',        // Insets
    text: '#1A1640',         // Texto escuro (--ink)
    textMain: '#1A1640',
    textLight: '#52508A',    // Subtexto (--mute)
    subtext: '#52508A',
    border: '#D5D0EE',       // Bordas sutis (--line)
    status: 'dark-content' as StatusBarStyle,
    inputBg: '#E6E2F7',
    darkBlue: '#5B3FE0',
    accent: '#5B3FE0',
    onAccent: '#FFFFFF',
    coral: '#B45309',
    ok: '#15803D',
    blue: '#0369A1',
    danger: '#B91C1C',
  }
};

export type ThemeColors = typeof Colors.dark;

export const getThemeForRole = (role?: string, isDark: boolean = true): ThemeColors => {
  if (role === 'motorista') {
    return isDark ? MotoristaColors.dark : MotoristaColors.light;
  }
  if (role === 'admin') {
    return isDark ? (AdminColors.dark as any) : (AdminColors.light as any);
  }
  return isDark ? Colors.dark : Colors.light;
};

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
