import React, { createContext, useContext, useState } from 'react';
import { Stack } from 'expo-router';
import { StatusBar, View, StatusBarStyle } from 'react-native';

export type UserRole = 'aluno' | 'motorista';

export const Colors = {
  dark: {
    gold: '#F5A623',
    bg: '#121A2F',
    card: '#233248',
    text: '#FFFFFF',
    subtext: '#94A3B8',
    border: '#37474F',
    status: 'light-content' as StatusBarStyle,
    inputBg: '#121A2F'
  },
  light: {
    gold: '#F5A623',
    bg: '#F8FAFC',
    card: '#FFFFFF',
    text: '#0F172A',
    subtext: '#64748B',
    border: '#E2E8F0',
    status: 'dark-content' as StatusBarStyle,
    inputBg: '#F1F5F9'
  }
};

// Aqui o nosso contexto tem de ter o selectedSeat e o setSelectedSeat!
const AppContext = createContext({
  isDark: true,
  toggleTheme: () => {},
  theme: Colors.dark,
  userRole: 'aluno' as UserRole,
  setUserRole: (role: UserRole) => {},
  selectedSeat: null as number | null,
  setSelectedSeat: (seat: number | null) => {},
});

export const useApp = () => useContext(AppContext);

export default function App() {
  const [isDark, setIsDark] = useState(true);
  const [userRole, setUserRole] = useState<UserRole>('aluno');
  
  // Estado global para o lugar escolhido do autocarro
  const [selectedSeat, setSelectedSeat] = useState<number | null>(null);

  const toggleTheme = () => {
    setIsDark((prev) => !prev);
  };

  const theme = isDark ? Colors.dark : Colors.light;

  return (
    <AppContext.Provider value={{ isDark, toggleTheme, theme, userRole, setUserRole, selectedSeat, setSelectedSeat }}>
      <View style={{ flex: 1, backgroundColor: theme.bg }}>
        <StatusBar 
          barStyle={theme.status} 
          backgroundColor={isDark ? '#1A253A' : '#F8FAFC'} 
        />
        
        <Stack screenOptions={{ 
          headerShown: false,
          contentStyle: { backgroundColor: theme.bg }
        }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="login" />
          <Stack.Screen name="home" />
          <Stack.Screen name="listas" />
          <Stack.Screen name="perfil" />
          <Stack.Screen name="mapa" />
          <Stack.Screen name="chat" />
          <Stack.Screen name="avisos" />
          <Stack.Screen name="ajuda" />
        </Stack>
      </View>
    </AppContext.Provider>
  );
}