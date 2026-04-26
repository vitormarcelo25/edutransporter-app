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
    text: '#FFFFFF',
    textMain: '#FFFFFF',
    textLight: '#94A3B8',
    subtext: '#94A3B8',
    border: '#37474F',
    status: 'light-content' as StatusBarStyle,
    inputBg: '#121A2F',
    darkBlue: '#3D5A80',
  },
  light: {
    gold: '#F5A623',
    bg: '#F8FAFC',
    card: '#FFFFFF',
    text: '#0F172A',
    textMain: '#0F172A',
    textLight: '#64748B',
    subtext: '#64748B',
    border: '#E2E8F0',
    status: 'dark-content' as StatusBarStyle,
    inputBg: '#F1F5F9',
    darkBlue: '#1A253A',
  }
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
