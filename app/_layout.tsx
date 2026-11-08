import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { AppProvider, useApp } from '../contexts/AppContext';
import { ToastProvider } from '../contexts/ToastContext';
import { useNotifications } from '../hooks/useNotifications';
import { warmUpBackend } from '../services/api';

export { useApp };

function NotificationsSetup() {
  useNotifications();
  return null;
}

function RootLayoutNav() {
  const { theme, isDark } = useApp();

  // Acorda o backend (Render free hiberna) em paralelo com a interface.
  useEffect(() => {
    warmUpBackend();
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: theme.bg }}>
      <StatusBar style={isDark ? 'light' : 'dark'} />

      <NotificationsSetup />

      <Stack screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: theme.bg }
      }}>
        {/* Ponto de Entrada / Splash Interativo */}
        <Stack.Screen name="index" />

        {/* Grupos de Rotas Principais */}
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />

        {/* Telas que podem ser abertas como modais ou fora da tab debaixo */}
        <Stack.Screen name="avisos" />
        <Stack.Screen name="ajuda" />
        <Stack.Screen name="listas" />

        {/* Admin */}
        <Stack.Screen name="admin" />
        <Stack.Screen name="admin-login" />
      </Stack>
    </View>
  );
}

export default function App() {
  return (
    <AppProvider>
      <ToastProvider>
        <RootLayoutNav />
      </ToastProvider>
    </AppProvider>
  );
}