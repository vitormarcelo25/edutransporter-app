/**
 * v1.0 - O Retorno
 * Vitor Santana no código
 * 
 * Gerenciar Rotas - CRUD de rotas
 * Lista de rotas com botão de excluir
 * Apenas admin acessa
 */

import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, SafeAreaView, ScrollView, Platform, ActivityIndicator, Alert } from 'react-native';
import { Feather, FontAwesome5 } from '@expo/vector-icons';
import { useRouter, Stack } from 'expo-router';
import { useApp } from '../_layout';
import { getAdminRotas, deleteRota, AdminRotasResponse, Rota } from '../../services/api';

export default function GerenciarRotas() {
  const router = useRouter();
  const { theme, userRole } = useApp();
  const [loading, setLoading] = useState(true);
  const [rotas, setRotas] = useState<Rota[]>([]);

  useEffect(() => {
    loadRotas();
  }, []);

  const loadRotas = async () => {
    setLoading(true);
    const result: AdminRotasResponse = await getAdminRotas();
    setLoading(false);
    if (result.success && result.rotas) {
      setRotas(result.rotas);
    }
  };

  const handleDelete = (rotaId: string) => {
    Alert.alert(
      'Confirmar',
      'Deseja excluir esta rota?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Excluir', 
          style: 'destructive',
          onPress: async () => {
            await deleteRota(rotaId);
            loadRotas();
          }
        },
      ]
    );
  };

  if (userRole !== 'admin') {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]}>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Feather name="arrow-left" size={24} color={theme.text} />
          </TouchableOpacity>
          <Text style={[styles.title, { color: theme.text }]}>Gerenciar Rotas</Text>
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
        <Text style={[styles.title, { color: theme.text }]}>Gerenciar Rotas</Text>
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
          {rotas.length === 0 ? (
            <View style={styles.emptyContainer}>
              <FontAwesome5 name="route" size={48} color={theme.subtext} />
              <Text style={[styles.emptyText, { color: theme.subtext }]}>Nenhuma rota cadastrada</Text>
            </View>
          ) : (
            rotas.map((rota) => (
              <View key={rota.id} style={[styles.rotaCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
                <View style={styles.rotaHeader}>
                  <View style={[styles.rotaIcon, { backgroundColor: 'rgba(72,187,120,0.1)' }]}>
                    <FontAwesome5 name="bus" size={20} color="#48BB78" />
                  </View>
                  <View style={styles.rotaInfo}>
                    <Text style={[styles.rotaNome, { color: theme.text }]}>{rota.nome}</Text>
                    <Text style={[styles.rotaEscola, { color: theme.subtext }]}>{rota.escola}</Text>
                  </View>
                  <TouchableOpacity onPress={() => handleDelete(rota.id)}>
                    <Feather name="trash-2" size={20} color="#EF4444" />
                  </TouchableOpacity>
                </View>
                <View style={[styles.divider, { backgroundColor: theme.border }]} />
                <View style={styles.rotaDetails}>
                  <View style={styles.detailItem}>
                    <Feather name="clock" size={14} color={theme.gold} />
                    <Text style={[styles.detailText, { color: theme.text }]}>{rota.horario}</Text>
                  </View>
                  <View style={styles.detailItem}>
                    <FontAwesome5 name="school" size={14} color={theme.gold} />
                    <Text style={[styles.detailText, { color: theme.text }]}>{rota.tipo}</Text>
                  </View>
                </View>
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
  rotaCard: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    marginBottom: 12,
  },
  rotaHeader: { flexDirection: 'row', alignItems: 'center' },
  rotaIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rotaInfo: { flex: 1, marginLeft: 12 },
  rotaNome: { fontSize: 16, fontWeight: 'bold' },
  rotaEscola: { fontSize: 13, marginTop: 2 },
  divider: { height: 1, marginVertical: 12 },
  rotaDetails: { flexDirection: 'row', justifyContent: 'space-between' },
  detailItem: { flexDirection: 'row', alignItems: 'center' },
  detailText: { fontSize: 13, marginLeft: 6 },
});