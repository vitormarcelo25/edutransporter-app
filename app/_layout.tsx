import React, { useEffect, useState } from 'react';
import { Stack, useRouter } from 'expo-router';
import { StatusBar, View, Platform } from 'react-native';
import { AppProvider, useApp } from '../contexts/AppContext';
import { ToastProvider } from '../contexts/ToastContext';
import { useNotifications } from '../hooks/useNotifications';
import SplashScreen from '../components/SplashScreen';

export { useApp };

function NotificationsSetup() {
  useNotifications();
  return null;
}

function RootLayoutNav() {
  const { theme, isDark, isLoadingAuth } = useApp();
  const router = useRouter();
  const [splashFinished, setSplashFinished] = useState(false);
  const isMobile = Platform.OS !== 'web';

  useEffect(() => {
    if (!isMobile) return;
    const timer = setTimeout(() => {
      setSplashFinished(true);
    }, 4000);
    return () => clearTimeout(timer);
  }, [isMobile]);

  if (isMobile && !splashFinished) {
    return (
      <View style={{ flex: 1, backgroundColor: '#1A2436' }}>
        <StatusBar barStyle="light-content" backgroundColor="#1A2436" />
        <SplashScreen />
      </View>
    );
  }

  if (isLoadingAuth) {
    return (
      <View style={{ flex: 1, backgroundColor: '#1A253A', justifyContent: 'center', alignItems: 'center' }}>
        <StatusBar barStyle="light-content" backgroundColor="#1A253A" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: theme.bg }}>
      <StatusBar
        barStyle={theme.status}
        backgroundColor={isDark ? '#1A253A' : '#F8FAFC'}
      />

      <NotificationsSetup />

      <Stack screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: theme.bg }
      }}>
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