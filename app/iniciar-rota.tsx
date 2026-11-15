/**
 * v10.1.0 - Beta Release
 * EduTransporter
 * 
 * Iniciar Rota - Controle de viagem pelo motorista
 * Botão para iniciar/encerrar rota
 * Tracking GPS em tempo real (a cada 5s)
 * Lista de alunos com presença
 */

import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Platform, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather, FontAwesome5 } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useApp } from './_layout';
import { getRotaDoDia, iniciarRota, encerrarRota, Rota, RotaResponse } from '@/services/api';
import { Alert } from '@/components/Alert';

export default function IniciarRota() {
  const router = useRouter();
  const voltar = () => router.navigate('/(tabs)/home');
  const {
    theme,
    userRole,
    gpsTrackingActive,
    activeTripRotaId,
    lastGpsUpdate,
    gpsError,
    startTripGps,
    stopTripGps,
  } = useApp();
  const [loading, setLoading] = useState(true);
  const [rota, setRota] = useState<Rota | null>(null);
  const [error, setError] = useState('');
  const [iniciada, setiniciada] = useState(false);
  const [encerrada, setEncerrada] = useState(false);

  const loadRota = async () => {
    setLoading(true);
    setError('');
    const result: RotaResponse = await getRotaDoDia();
    setLoading(false);
    if (result.success && result.rota) {
      setRota(result.rota);
      if (result.rota.status === 'em_andamento') {
        setiniciada(true);
        setEncerrada(false);
        if (
          userRole === 'motorista' &&
          (!gpsTrackingActive || activeTripRotaId !== result.rota.id)
        ) {
          startTripGps(result.rota.id).catch(() => {});
        }
      } else if (result.rota.status === 'encerrada') {
        setiniciada(false);
        setEncerrada(true);
      } else {
        setiniciada(false);
        setEncerrada(false);
      }
    } else {
      setError(result.message || 'Erro ao carregar rota');
    }
  };

  useEffect(() => {
    loadRota();
  }, []);

  const handleIniciarRota = async () => {
    if (!rota) return;
    
    Alert.alert(
      'Iniciar Rota',
      `Deseja iniciar a rota "${rota.nome}" agora?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Iniciar', 
          onPress: async () => {
            const result = await iniciarRota(rota.id);
            if (result.success) {
              setiniciada(true);
              const gpsRes = await startTripGps(rota.id);
              if (!gpsRes.permissionGranted && Platform.OS !== 'web') {
                Alert.alert(
                  'Viagem iniciada (GPS pendente)',
                  'A viagem foi iniciada, mas a permissão de localização não foi concedida. Ative o GPS para os alunos acompanharem o ônibus.'
                );
              } else {
                Alert.alert('Sucesso', 'Rota iniciada! O GPS está sendo transmitido continuamente.');
              }
            } else {
              Alert.alert('Erro', result.message || 'Erro ao iniciar rota');
            }
          }
        }
      ]
    );
  };

  const handleEncerrarRota = async () => {
    if (!rota) return;

    Alert.alert(
      'Encerrar Rota',
      'Deseja encerrar esta rota?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Encerrar', 
          onPress: async () => {
            stopTripGps();
            const result = await encerrarRota(rota.id);
            if (result.success) {
              setiniciada(false);
              setEncerrada(true);
              Alert.alert('Sucesso', 'Rota encerrada!');
            } else {
              Alert.alert('Erro', result.message || 'Erro ao encerrar rota');
            }
          }
        }
      ]
    );
  };

  if (userRole === 'aluno') {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.replace('/(tabs)/home')} style={{ padding: 8 }}>
            <Feather name="arrow-left" size={24} color={theme.text} />
          </TouchableOpacity>
          <Text style={[styles.title, { color: theme.text }]}>Iniciar Rota</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.centerContent}>
          <Feather name="alert-circle" size={64} color={theme.gold} />
          <Text style={[styles.accessDeniedText, { color: theme.text }]}>
            Apenas motoristas podem iniciar rotas
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.replace('/(tabs)/home')} style={{ padding: 8 }}>
          <Feather name="arrow-left" size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.text }]}>Iniciar Rota</Text>
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
          <Feather name="map" size={64} color={theme.subtext} />
          <Text style={[styles.emptyText, { color: theme.subtext }]}>Nenhuma rota agendada para hoje</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Card Principal */}
          <View style={[styles.mainCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <View style={styles.cardHeader}>
              <View style={[styles.iconCircle, { backgroundColor: 'rgba(245,166,35,0.1)' }]}>
                <FontAwesome5 name="bus" size={28} color={theme.gold} />
              </View>
              <View style={styles.cardInfo}>
                <Text style={[styles.rotaNome, { color: theme.text }]}>{rota.nome}</Text>
                <Text style={[styles.rotaEscola, { color: theme.subtext }]}>{rota.escola}</Text>
              </View>
            </View>
            
            <View style={[styles.divider, { backgroundColor: theme.border }]} />
            
            <View style={styles.details}>
              <View style={styles.detailItem}>
                <Feather name="clock" size={18} color={theme.gold} />
                <Text style={[styles.detailLabel, { color: theme.subtext }]}>Horário</Text>
                <Text style={[styles.detailValue, { color: theme.text }]}>{rota.horario}</Text>
              </View>
              <View style={styles.detailItem}>
                <Feather name="map-pin" size={18} color={theme.gold} />
                <Text style={[styles.detailLabel, { color: theme.subtext }]}>Tipo</Text>
                <Text style={[styles.detailValue, { color: theme.text }]}>{rota.tipo}</Text>
              </View>
              <View style={styles.detailItem}>
                <Feather name="users" size={18} color={theme.gold} />
                <Text style={[styles.detailLabel, { color: theme.subtext }]}>Alunos</Text>
                <Text style={[styles.detailValue, { color: theme.text }]}>{rota.alunos.length}</Text>
              </View>
            </View>

            {/* Status Badge */}
            <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 8, marginTop: 15 }}>
              <View style={[styles.statusBadge, { marginTop: 0, backgroundColor: iniciada ? '#48BB78' : encerrada ? '#718096' : theme.gold }]}>
                <Text style={styles.statusText}>
                  {iniciada ? 'Em Andamento' : encerrada ? 'Encerrada' : 'Agendada'}
                </Text>
              </View>

              {iniciada && !encerrada && (
                <View style={[styles.statusBadge, { marginTop: 0, flexDirection: 'row', alignItems: 'center', backgroundColor: gpsError ? '#F59E0B20' : '#48BB7820', borderWidth: 1, borderColor: gpsError ? '#F59E0B' : '#48BB78' }]}>
                  <Feather name={gpsError ? 'alert-triangle' : 'radio'} size={13} color={gpsError ? '#F59E0B' : '#48BB78'} style={{ marginRight: 6 }} />
                  <Text style={[styles.statusText, { fontSize: 12, color: gpsError ? '#F59E0B' : '#48BB78' }]}>
                    {gpsError
                      ? gpsError
                      : gpsTrackingActive && lastGpsUpdate
                        ? `GPS ativo (${new Date(lastGpsUpdate).toLocaleTimeString('pt-BR')})`
                        : gpsTrackingActive
                          ? 'GPS ativo em segundo plano'
                          : 'GPS aguardando sinal'}
                  </Text>
                </View>
              )}
            </View>
          </View>

          {/* Botão de Ação */}
          <View style={styles.actions}>
            {!iniciada && !encerrada ? (
              <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#48BB78' }]} onPress={handleIniciarRota}>
                <Feather name="play" size={24} color="#FFF" />
                <Text style={styles.actionBtnText}>Iniciar Viagem</Text>
              </TouchableOpacity>
            ) : iniciada && !encerrada ? (
              <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#EF4444' }]} onPress={handleEncerrarRota}>
                <Feather name="stop-circle" size={24} color="#FFF" />
                <Text style={styles.actionBtnText}>Encerrar Viagem</Text>
              </TouchableOpacity>
            ) : null}
          </View>

          {/* Lista de Alunos */}
          {iniciada && (
            <View style={styles.alunosSection}>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>Lista de Alunos</Text>
              <Text style={[styles.sectionSubtitle, { color: theme.subtext }]}>Toque em um aluno para marcar presença</Text>
              
              {rota.alunos.map((aluno) => (
                <TouchableOpacity 
                  key={aluno.id} 
                  style={[styles.alunoCard, { backgroundColor: theme.card, borderColor: theme.border }]}
                  onPress={() => router.push('/presenca')}
                >
                  <View style={[styles.alunoAvatar, { backgroundColor: theme.inputBg }]}>
                    <Text style={[styles.alunoInicial, { color: theme.gold }]}>
                      {aluno.nome.charAt(0)}
                    </Text>
                  </View>
                  <View style={styles.alunoInfo}>
                    <Text style={[styles.alunoNome, { color: theme.text }]}>{aluno.nome}</Text>
                    <Text style={[styles.alunoParada, { color: theme.subtext }]}>{aluno.parada}</Text>
                  </View>
                  <View style={[styles.presencaBadge, { backgroundColor: aluno.presente ? '#48BB78' : '#EF4444' }]}>
                    <Text style={styles.presencaText}>
                      {aluno.presente ? 'Presente' : 'Ausente'}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
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
  errorText: { fontSize: 16, marginTop: 10 },
  accessDeniedText: { fontSize: 16, marginTop: 10, textAlign: 'center' },
  retryBtn: {
    marginTop: 20,
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: '#F5A623',
    borderRadius: 24,
  },
  retryBtnText: { color: '#1A253A', fontSize: 14, fontWeight: 'bold' },
  mainCard: {
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardInfo: { flex: 1, marginLeft: 15 },
  rotaNome: { fontSize: 20, fontWeight: 'bold' },
  rotaEscola: { fontSize: 14, marginTop: 4 },
  divider: { height: 1, marginVertical: 15 },
  details: { flexDirection: 'row', justifyContent: 'space-between' },
  detailItem: { alignItems: 'center' },
  detailLabel: { fontSize: 12, marginTop: 4 },
  detailValue: { fontSize: 16, fontWeight: 'bold', marginTop: 2 },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginTop: 15,
  },
  statusText: { color: '#FFF', fontWeight: 'bold', fontSize: 14 },
  actions: { marginTop: 25 },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 18,
    borderRadius: 30,
  },
  actionBtnText: { color: '#FFF', fontSize: 18, fontWeight: 'bold', marginLeft: 10 },
  alunosSection: { marginTop: 30 },
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
  presencaBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  presencaText: { color: '#FFF', fontSize: 12, fontWeight: 'bold' },
});
