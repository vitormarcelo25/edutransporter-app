/**
 * v1.0 - O Retorno
 * Vitor Santana no código
 * 
 * Gerenciar Avisos - Lista de avisos do sistema
 * Tipos: urgente, sucesso, info
 * Apenas admin acessa
 */

import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, SafeAreaView, ScrollView, Platform, ActivityIndicator, Alert } from 'react-native';
import { Feather, FontAwesome5 } from '@expo/vector-icons';
import { useRouter, Stack } from 'expo-router';
import { useApp } from '../_layout';
import { getAvisos, AvisosResponse, Aviso } from '../../services/api';

export default function GerenciarAvisos() {
  const router = useRouter();
  const { theme, userRole } = useApp();
  const [loading, setLoading] = useState(true);
  const [avisos, setAvisos] = useState<Aviso[]>([]);

  useEffect(() => {
    loadAvisos();
  }, []);

  const loadAvisos = async () => {
    setLoading(true);
    const result: AvisosResponse = await getAvisos();
    setLoading(false);
    if (result.success && result.avisos) {
      setAvisos(result.avisos);
    }
  };

  const getTipoColor = (tipo: string) => {
    switch (tipo) {
      case 'urgente': return '#EF4444';
      case 'sucesso': return '#48BB78';
      default: return theme.gold;
    }
  };

  const getTipoIcon = (tipo: string) => {
    switch (tipo) {
      case 'urgente': return 'alert-circle';
      case 'sucesso': return 'check-circle';
      default: return 'info';
    }
  };

  if (userRole !== 'admin') {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]}>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Feather name="arrow-left" size={24} color={theme.text} />
          </TouchableOpacity>
          <Text style={[styles.title, { color: theme.text }]}>Gerenciar Avisos</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.centerContent}>
          <Feather name="lock" size={64} color={theme.gold} />
          <Text style={[styles.accessDeniedText, { color: theme.text }]}>
            Acesso restrito a administradores
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]}>
      <Stack.Screen options={{ headerShown: false }} />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Feather name="arrow-left" size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.text }]}>Gerenciar Avisos</Text>
        <TouchableOpacity onPress={() => Alert.alert('Em breve', 'Funcionalidade em desenvolvimento')}>
          <Feather name="plus" size={24} color={theme.gold} />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color={theme.gold} />
          <Text style={[styles.loadingText, { color: theme.subtext }]}>Carregando...</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {avisos.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Feather name="bell" size={48} color={theme.subtext} />
              <Text style={[styles.emptyText, { color: theme.subtext }]}>Nenhum aviso cadastrado</Text>
            </View>
          ) : (
            avisos.map((aviso) => (
              <View key={aviso.id} style={[styles.avisoCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
                <View style={styles.avisoHeader}>
                  <View style={[styles.avisoIcon, { backgroundColor: `${getTipoColor(aviso.tipo)}20` }]}>
                    <Feather name={getTipoIcon(aviso.tipo) as any} size={20} color={getTipoColor(aviso.tipo)} />
                  </View>
                  <View style={styles.avisoInfo}>
                    <Text style={[styles.avisoTitulo, { color: theme.text }]}>{aviso.titulo}</Text>
                    <Text style={[styles.avisoData, { color: theme.subtext }]}>{aviso.data}</Text>
                  </View>
                </View>
                <Text style={[styles.avisoDesc, { color: theme.subtext }]}>{aviso.descricao}</Text>
              </View>
            ))
          )}
          <View style={{ height: 40 }} />
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 10 : 25,
    paddingBottom: 15,
  },
  title: { fontSize: 18, fontWeight: 'bold' },
  centerContent: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { fontSize: 16, marginTop: 10 },
  accessDeniedText: { fontSize: 16, marginTop: 10, textAlign: 'center' },
  scrollContent: { padding: 20 },
  emptyContainer: { alignItems: 'center', paddingVertical: 40 },
  emptyText: { fontSize: 16, marginTop: 10 },
  avisoCard: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    marginBottom: 12,
  },
  avisoHeader: { flexDirection: 'row', alignItems: 'center' },
  avisoIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avisoInfo: { flex: 1, marginLeft: 12 },
  avisoTitulo: { fontSize: 16, fontWeight: 'bold' },
  avisoData: { fontSize: 12, marginTop: 2 },
  avisoDesc: { fontSize: 14, marginTop: 12, lineHeight: 20 },
});