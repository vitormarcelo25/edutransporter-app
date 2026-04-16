import React, { useEffect } from 'react';
import { Stack, useRouter } from 'expo-router';
import { useApp } from '../../contexts/AppContext';

export default function AuthLayout() {
  const router = useRouter();
  const { authToken, isLoadingAuth } = useApp();

  useEffect(() => {
    if (!isLoadingAuth && authToken) {
      router.replace('/(tabs)/home');
    }
  }, [isLoadingAuth, authToken]);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      {/* Aqui ficam as nossas rotas da zona sem login (autenticação) */}
      <Stack.Screen name="index" />
      <Stack.Screen name="registo" />
    </Stack>
  );
}
