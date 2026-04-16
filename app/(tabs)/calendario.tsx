/**
 * v10.1.0 - Beta Release
 * EduTransporter
 * 
 * Agenda de Rotas - Visualização semanal
 * Selector de dias (14 dias) com scroll horizontal
 * Lista de rotas filtrada por data selecionada
 */

import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, SafeAreaView, ScrollView, Platform, ActivityIndicator } from 'react-native';
import { Feather, FontAwesome5 } from '@expo/vector-icons';
import { useRouter, Stack } from 'expo-router';
import { useApp } from '../_layout';
import { getRotasAgenda, RotaAgenda, AgendaResponse } from '@/services/api';

const DAYS_OF_WEEK = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

export default function Calendario() {
  const router = useRouter();
  const { theme } = useApp();
  const [loading, setLoading] = useState(true);
  const [rotas, setRotas] = useState<RotaAgenda[]>([]);
  const [error, setError] = useState('');
  const [selectedDate, setSelectedDate] = useState(0);

  useEffect(() => {
    loadAgenda();
  }, []);

  const loadAgenda = async () => {
    setLoading(true);
    setError('');
    const result: AgendaResponse = await getRotasAgenda();
    setLoading(false);
    if (result.success && result.rotas) {
      setRotas(result.rotas);
    } else {
      setError(result.message || 'Erro ao carregar agenda');
    }
  };

  const getDiasSemana = () => {
    const hoje = new Date();
    const dias = [];
    for (let i = 0; i < 14; i++) {
      const data = new Date(hoje);
      data.setDate(hoje.getDate() + i);
      dias.push({
        diaSemana: DAYS_OF_WEEK[data.getDay()],
        numero: data.getDate(),
        data: i,
        hoje: i === 0,
      });
    }
    return dias;
  };

  const getRotasDoDia = (index: number) => {
    return rotas.filter(rota => {
      const parts = rota.data.split(' - ');
      return parts[0].includes(getDiasSemana()[index].numero.toString().padStart(2, '0'));
    });
  };

  const dias = getDiasSemana();
  const rotasDoDia = getRotasDoDia(selectedDate);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'em_andamento': return '#48BB78';
      case 'encerrada': return '#718096';
      default: return theme.gold;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'em_andamento': return 'Em Andamento';
      case 'encerrada': return 'Encerrada';
      default: return 'Agendada';
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]}>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color={theme.gold} />
          <Text style={[styles.loadingText, { color: theme.subtext }]}>Carregando...</Text>
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
        <Text style={[styles.title, { color: theme.text }]}>Agenda de Rotas</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Selector de Dias */}
        <View style={[styles.daysSelector, { backgroundColor: theme.card }]}>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.daysScroll}
          >
            {dias.map((dia, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.dayItem,
                  selectedDate === index && { backgroundColor: theme.gold },
                ]}
                onPress={() => setSelectedDate(index)}
              >
                <Text style={[
                  styles.dayName,
                  { color: selectedDate === index ? '#1A253A' : theme.subtext }
                ]}>
                  {dia.diaSemana}
                </Text>
                <Text style={[
                  styles.dayNumber,
                  { color: selectedDate === index ? '#1A253A' : theme.text }
                ]}>
                  {dia.numero}
                </Text>
                {dia.hoje && (
                  <View style={[
                    styles.todayDot,
                    { backgroundColor: selectedDate === index ? '#1A253A' : theme.gold }
                  ]} />
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Data Selecionada */}
        <Text style={[styles.selectedDateText, { color: theme.text }]}>
          {dias[selectedDate]?.numero} de {new Date().toLocaleDateString('pt-BR', { month: 'long' })}
        </Text>

        {/* Lista de Rotas */}
        <View style={styles.rotasContainer}>
          {rotasDoDia.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Feather name="calendar" size={48} color={theme.subtext} />
              <Text style={[styles.emptyText, { color: theme.subtext }]}>
                Nenhuma rota agendada
              </Text>
            </View>
          ) : (
            rotasDoDia.map((rota) => (
              <TouchableOpacity 
                key={rota.id}
                style={[styles.rotaCard, { backgroundColor: theme.card, borderColor: theme.border }]}
              >
                <View style={styles.rotaHeader}>
                  <View style={[styles.rotaIcon, { backgroundColor: 'rgba(245,166,35,0.1)' }]}>
                    <FontAwesome5 name="bus" size={20} color={theme.gold} />
                  </View>
                  <View style={styles.rotaInfo}>
                    <Text style={[styles.rotaNome, { color: theme.text }]}>{rota.nome}</Text>
                    <Text style={[styles.rotaEscola, { color: theme.subtext }]}>{rota.escola}</Text>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: getStatusColor(rota.status) }]}>
                    <Text style={styles.statusText}>{getStatusText(rota.status)}</Text>
                  </View>
                </View>

                <View style={[styles.divider, { backgroundColor: theme.border }]} />

                <View style={styles.rotaDetails}>
                  <View style={styles.detailItem}>
                    <Feather name="clock" size={16} color={theme.gold} />
                    <Text style={[styles.detailText, { color: theme.text }]}>{rota.horario}</Text>
                  </View>
                  <View style={styles.detailItem}>
                    <FontAwesome5 name="school" size={16} color={theme.gold} />
                    <Text style={[styles.detailText, { color: theme.text }]}>{rota.tipo}</Text>
                  </View>
                  <View style={styles.detailItem}>
                    <Feather name="map-pin" size={16} color={theme.gold} />
                    <Text style={[styles.detailText, { color: theme.text }]}>
                      {rota.paradas.length} paradas
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
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
  
  daysSelector: {
    marginHorizontal: 20,
    marginTop: 10,
    borderRadius: 16,
    paddingVertical: 12,
  },
  daysScroll: { paddingHorizontal: 8 },
  dayItem: {
    width: 52,
    height: 70,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 4,
  },
  dayName: { fontSize: 12, fontWeight: '600' },
  dayNumber: { fontSize: 20, fontWeight: 'bold', marginTop: 4 },
  todayDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 4,
  },

  selectedDateText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 15,
  },

  rotasContainer: { paddingHorizontal: 20 },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: { fontSize: 16, marginTop: 10 },

  rotaCard: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    marginBottom: 12,
  },
  rotaHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rotaIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rotaInfo: { flex: 1, marginLeft: 12 },
  rotaNome: { fontSize: 16, fontWeight: 'bold' },
  rotaEscola: { fontSize: 13, marginTop: 2 },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: { color: '#FFF', fontSize: 11, fontWeight: 'bold' },

  divider: { height: 1, marginVertical: 12 },

  rotaDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailText: { fontSize: 13, marginLeft: 6 },
});