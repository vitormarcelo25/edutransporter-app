/**
 * v1.0 - O Retorno
 * Vitor Santana no código
 * 
 * Gerenciar Feriados - Dias sem transporte
 * Lista de feriados com excluir
 * Apenas admin acessa
 */

import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, SafeAreaView, ScrollView, Platform, ActivityIndicator, Alert } from 'react-native';
import { Feather, FontAwesome5 } from '@expo/vector-icons';
import { useRouter, Stack } from 'expo-router';
import { useApp } from '../_layout';
import { getFeriados, deleteFeriado, FeriadosResponse, Feriado } from '../../services/api';

export default function GerenciarFeriados() {
  const router = useRouter();
  const { theme, userRole } = useApp();
  const [loading, setLoading] = useState(true);
  const [feriados, setFeriados] = useState<Feriado[]>([]);

  useEffect(() => {
    loadFeriados();
  }, []);

  const loadFeriados = async () => {
    setLoading(true);
    const result: FeriadosResponse = await getFeriados();
    setLoading(false);
    if (result.success && result.feriados) {
      setFeriados(result.feriados);
    }
  };

  const handleDelete = (feriadoId: string) => {
    Alert.alert(
      'Confirmar',
      'Deseja excluir este feriados?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Excluir', 
          style: 'destructive',
          onPress: async () => {
            await deleteFeriado(feriadoId);
            loadFeriados();
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
          <Text style={[styles.title, { color: theme.text }]}>Feriados</Text>
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
        <Text style={[styles.title, { color: theme.text }]}>Feriados</Text>
        <TouchableOpacity onPress={() => Alert.alert('Em breve', 'Funcionalidade em desenvolvimento')}>
          <Feather name="plus" size={24} color={theme.gold} />
        </TouchableOpacity>
      </View>

      <View style={[styles.infoBox, { backgroundColor: theme.card, borderColor: theme.border }]}>
        <Feather name="info" size={20} color={theme.gold} />
        <Text style={[styles.infoText, { color: theme.subtext }]}>
          Nos dias cadastrados aqui, o transporte escolar não funcionará.
        </Text>
      </View>

      {loading ? (
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color={theme.gold} />
          <Text style={[styles.loadingText, { color: theme.subtext }]}>Carregando...</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {feriados.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Feather name="calendar" size={48} color={theme.subtext} />
              <Text style={[styles.emptyText, { color: theme.subtext }]}>Nenhum feriado cadastrado</Text>
            </View>
          ) : (
            feriados.map((feriado) => (
              <View key={feriado.id} style={[styles.feriadoCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
                <View style={styles.feriadoHeader}>
                  <View style={[styles.feriadoIcon, { backgroundColor: 'rgba(159,122,234,0.1)' }]}>
                    <Feather name="calendar" size={20} color="#9F7AEA" />
                  </View>
                  <View style={styles.feriadoInfo}>
                    <Text style={[styles.feriadoNome, { color: theme.text }]}>{feriado.nome}</Text>
                    <Text style={[styles.feriadoMotivo, { color: theme.subtext }]}>{feriado.motivo}</Text>
                  </View>
                  <TouchableOpacity onPress={() => handleDelete(feriado.id)}>
                    <Feather name="trash-2" size={20} color="#EF4444" />
                  </TouchableOpacity>
                </View>
                <Text style={[styles.feriadoData, { color: theme.gold }]}>{feriado.data}</Text>
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
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: 15,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  infoText: { flex: 1, marginLeft: 8, fontSize: 13 },
  scrollContent: { padding: 20 },
  emptyContainer: { alignItems: 'center', paddingVertical: 40 },
  emptyText: { fontSize: 16, marginTop: 10 },
  feriadoCard: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    marginBottom: 12,
  },
  feriadoHeader: { flexDirection: 'row', alignItems: 'center' },
  feriadoIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  feriadoNome: { fontSize: 16, fontWeight: 'bold' },
  feriadoMotivo: { fontSize: 13, marginTop: 2 },
});