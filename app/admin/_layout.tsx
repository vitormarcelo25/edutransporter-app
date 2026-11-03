import React from 'react';
import { Stack, Redirect } from 'expo-router';
import { useApp } from '../_layout';

/**
 * Protege todo o painel administrativo: só entra quem fez login de admin
 * pelo backend e recebeu um token com role ADMIN.
 */
export default function AdminLayout() {
  const { authToken, userRole, isLoadingAuth } = useApp();

  if (!isLoadingAuth && (!authToken || userRole !== 'admin')) {
    return <Redirect href="/admin-login" />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="gerenciar-usuarios" />
      <Stack.Screen name="gerenciar-rotas" />
      <Stack.Screen name="gerenciar-avisos" />
      <Stack.Screen name="gerenciar-feriados" />
      <Stack.Screen name="gerar-convites" />
    </Stack>
  );
}
