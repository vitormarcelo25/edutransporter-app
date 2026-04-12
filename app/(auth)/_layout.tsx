import React from 'react';
import { Stack } from 'expo-router';

export default function AuthLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      {/* Aqui ficam as nossas rotas da zona sem login (autenticação) */}
      <Stack.Screen name="index" />
      <Stack.Screen name="registo" />
      <Stack.Screen name="token" />
    </Stack>
  );
}
