/**
 * v1.0 - O Retorno
 * Vitor Santana no código
 * 
 * Presença - Marcação de presença dos alunos
 * Motorista toca para alternar presença/ausência
 * Apenas role motorista pode acessar
 */

import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, SafeAreaView, ScrollView, Platform, ActivityIndicator } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter, Stack } from 'expo-router';
import { useApp } from '../_layout';
import { getRotaDoDia, marcarPresenca, Rota, RotaResponse, PresencaResponse } from '@/services/api';

export default function Presenca() {
  const router = useRouter();
  const { theme, userRole } = useApp();
  const [loading, setLoading] = useState(true);
  const [rota, setRota] = useState<Rota | null>(null);
  const [error, setError] = useState('');
  const [salvando, setSalvando] = useState<string | null>(null);

  const loadRota = async () => {
    setLoading(true);
    setError('');
    const result: RotaResponse = await getRotaDoDia();
    setLoading(false);
    if (result.success && result.rota) {
      setRota(result.rota);
    } else {
      setError(result.message || 'Erro ao carregar rota');
    }
  };

  useEffect(() => {
    loadRota();
  }, []);

  const handleTogglePresenca = async (alunoId: string) => {
    const aluno = rota?.alunos.find(a => a.id === alunoId);
    if (!aluno) return;

    const novoStatus = !aluno.presente;
    setSalvando(alunoId);

    const result: PresencaResponse = await marcarPresenca(alunoId, novoStatus);

    setSalvando(null);

    if (result.success) {
      // Atualiza o estado local
      setRota(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          alunos: prev.alunos.map(a => 
            a.id === alunoId ? { ...a, presente: novoStatus } : a
          ),
        };
      });
    }
  };

  // Contadores
  const presentes = rota?.alunos.filter(a => a.presente).length || 0;
  const ausentes = (rota?.alunos.length || 0) - presentes;

  if (userRole !== 'motorista') {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]}>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Feather name="arrow-left" size={24} color={theme.text} />
          </TouchableOpacity>
          <Text style={[styles.title, { color: theme.text }]}>Presença</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.centerContent}>
          <Feather name="alert-circle" size={64} color={theme.gold} />
          <Text style={[styles.accessDeniedText, { color: theme.text }]}>
            Apenas motoristas podem marcar presença
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
        <Text style={[styles.title, { color: theme.text }]}>Presença</Text>
        <View style={{ width: 40 }} />
      </View>

      {loading ? (
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color={theme.gold} />
          <Text style={[styles.loadingText, { color: theme.subtext }]}>Carregando...</Text>
        </View>
      ) : error ? (
        <View style={styles.centerContent}>
          <Feather name="alert-circle" size={64} color="#EF4444" />
          <Text style={[styles.errorText, { color: '#EF4444' }]}>{error}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={loadRota}>
            <Text style={styles.retryBtnText}>Tentar novamente</Text>
          </TouchableOpacity>
        </View>
      ) : !rota ? (
        <View style={styles.centerContent}>
          <Feather name="users" size={64} color={theme.subtext} />
          <Text style={[styles.emptyText, { color: theme.subtext }]}>Nenhuma rota ativa</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Card de Resumo */}
          <View style={[styles.resumoCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <Text style={[styles.resumoTitle, { color: theme.text }]}>Resumo da Presença</Text>
            <View style={styles.resumoRow}>
              <View style={styles.resumoItem}>
                <View style={[styles.resumoBadge, { backgroundColor: 'rgba(72,187,120,0.1)' }]}>
                  <Feather name="check-circle" size={24} color="#48BB78" />
                </View>
                <Text style={[styles.resumoNum, { color: '#48BB78' }]}>{presentes}</Text>
                <Text style={[styles.resumoLabel, { color: theme.subtext }]}>Presentes</Text>
              </View>
              <View style={styles.resumoItem}>
                <View style={[styles.resumoBadge, { backgroundColor: 'rgba(239,68,68,0.1)' }]}>
                  <Feather name="x-circle" size={24} color="#EF4444" />
                </View>
                <Text style={[styles.resumoNum, { color: '#EF4444' }]}>{ausentes}</Text>
                <Text style={[styles.resumoLabel, { color: theme.subtext }]}>Ausentes</Text>
              </View>
              <View style={styles.resumoItem}>
                <View style={[styles.resumoBadge, { backgroundColor: 'rgba(245,166,35,0.1)' }]}>
                  <Feather name="users" size={24} color={theme.gold} />
                </View>
                <Text style={[styles.resumoNum, { color: theme.gold }]}>{rota.alunos.length}</Text>
                <Text style={[styles.resumoLabel, { color: theme.subtext }]}>Total</Text>
              </View>
            </View>
          </View>

          {/* Lista de Alunos */}
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Lista de Alunos</Text>
          <Text style={[styles.sectionSubtitle, { color: theme.subtext }]}>Toque para marcar presença</Text>
          
          {rota.alunos.map((aluno) => (
            <TouchableOpacity 
              key={aluno.id} 
              style={[
                styles.alunoCard, 
                { backgroundColor: theme.card, borderColor: theme.border }
              ]}
              onPress={() => handleTogglePresenca(aluno.id)}
              disabled={!!salvando}
            >
              <View style={[styles.alunoAvatar, { backgroundColor: theme.inputBg }]}>
                {salvando === aluno.id ? (
                  <ActivityIndicator size="small" color={theme.gold} />
                ) : (
                  <Text style={[styles.alunoInicial, { color: theme.gold }]}>
                    {aluno.nome.charAt(0)}
                  </Text>
                )}
              </View>
              <View style={styles.alunoInfo}>
                <Text style={[styles.alunoNome, { color: theme.text }]}>{aluno.nome}</Text>
                <Text style={[styles.alunoParada, { color: theme.subtext }]}>{aluno.parada}</Text>
              </View>
              <TouchableOpacity 
                style={[
                  styles.presencaToggle, 
                  { backgroundColor: aluno.presente ? '#48BB78' : '#EF4444' }
                ]}
                onPress={() => handleTogglePresenca(aluno.id)}
                disabled={!!salvando}
              >
                <Feather 
                  name={aluno.presente ? 'check' : 'x'} 
                  size={18} 
                  color="#FFF" 
                />
              </TouchableOpacity>
            </TouchableOpacity>
          ))}

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
    borderBottomWidth: 1,
    borderBottomColor: '#37474F',
  },
  title: { fontSize: 18, fontWeight: 'bold' },
  scrollContent: { padding: 20 },
  centerContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: { fontSize: 16, marginTop: 10 },
  emptyText: { fontSize: 16, marginTop: 10 },
  accessDeniedText: { fontSize: 16, marginTop: 10, textAlign: 'center' },
  errorText: { fontSize: 16, marginTop: 10 },
  retryBtn: {
    marginTop: 20,
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: '#F5A623',
    borderRadius: 24,
  },
  retryBtnText: { color: '#1A253A', fontSize: 14, fontWeight: 'bold' },
  resumoCard: {
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    marginBottom: 25,
  },
  resumoTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 20 },
  resumoRow: { flexDirection: 'row', justifyContent: 'space-around' },
  resumoItem: { alignItems: 'center' },
  resumoBadge: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  resumoNum: { fontSize: 24, fontWeight: 'bold', marginTop: 8 },
  resumoLabel: { fontSize: 12, marginTop: 4 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold' },
  sectionSubtitle: { fontSize: 14, marginTop: 4, marginBottom: 15 },
  alunoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 10,
  },
  alunoAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  alunoInicial: { fontSize: 18, fontWeight: 'bold' },
  alunoInfo: { flex: 1, marginLeft: 12 },
  alunoNome: { fontSize: 16, fontWeight: 'bold' },
  alunoParada: { fontSize: 13, marginTop: 2 },
  presencaToggle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
});