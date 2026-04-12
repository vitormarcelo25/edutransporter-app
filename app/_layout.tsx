import React, { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar, View } from 'react-native';
import { AppProvider, useApp } from '../contexts/AppContext';

export { useApp };

function RootLayoutNav() {
  const { theme, isDark } = useApp();

  return (
    <View style={{ flex: 1, backgroundColor: theme.bg }}>
      <StatusBar 
        barStyle={theme.status} 
        backgroundColor={isDark ? '#1A253A' : '#F8FAFC'} 
      />
      
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
      </Stack>
    </View>
  );
}

export default function App() {
  return (
    <AppProvider>
      <RootLayoutNav />
    </AppProvider>
  );
}