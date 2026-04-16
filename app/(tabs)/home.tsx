import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, Text, View, TouchableOpacity, SafeAreaView, ScrollView, Platform
} from 'react-native';
import { Feather, FontAwesome5, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import { useApp } from '../_layout';

export default function HomeScreen() {
  const router = useRouter();
  const { theme, userRole, selectedSeat } = useApp();
  
  const [currentDate, setCurrentDate] = useState('');
  const [currentTime, setCurrentTime] = useState('');

  const mockRotaInfo = {
    escola: 'EE Prof. João Silva',
    tipo: 'Ida',
    previsao: '07:45',
    lotacao: 15,
    total: 40,
    progresso: 40, // Percentual do percurso já feito
    paradas: [
      { horario: '07:00', nome: 'Escola' },
      { horario: '07:15', nome: 'Parada 1' },
      { horario: '07:30', nome: 'Parada 2' },
      { horario: '07:45', nome: 'Seu Ponto' },
    ]
  };

  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date();
      const options: Intl.DateTimeFormatOptions = { weekday: 'long', day: 'numeric', month: 'long' };
      setCurrentDate(now.toLocaleDateString('pt-BR', options));
      setCurrentTime(now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }));
    };

    updateDateTime();
    const timer = setInterval(updateDateTime, 10000); 
    return () => clearInterval(timer);
  }, []);

  const getTipoRota = () => {
    return mockRotaInfo.tipo;
  };

  const progressLotacao = (mockRotaInfo.lotacao / mockRotaInfo.total) * 100;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]}>
      
      {/* CABEÇALHO */}
      <View style={[styles.header, { backgroundColor: theme.card, borderBottomColor: theme.border }]}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.welcomeText, { color: theme.text }]}>Olá!</Text>
          <Text style={[styles.statusSub, { color: theme.subtext }]}>
            {currentDate} • {currentTime}
          </Text>
        </View>

        <View style={styles.headerRight}>
          <TouchableOpacity style={[styles.profileBtn, { backgroundColor: theme.gold }]} onPress={() => router.push('/(tabs)/perfil')}>
            <FontAwesome5 name="user-alt" size={16} color="#1A253A" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        
        {userRole === 'aluno' && (
          <>
            {/* HERO CARD - Informações da Rota */}
            <TouchableOpacity 
              style={[styles.heroCard, { backgroundColor: theme.card, borderColor: theme.border }]}
              onPress={() => router.push('/listas')}
              activeOpacity={0.9}
            >
              {/* Badge Rota */}
              <View style={[styles.heroBadge, { backgroundColor: theme.gold }]}>
                <Text style={styles.heroBadgeText}>ROTA {getTipoRota()}</Text>
              </View>

              {/* Título */}
              <Text style={[styles.heroTitle, { color: theme.text }]}>
                {mockRotaInfo.escola}
              </Text>

              {/* Info Grid */}
              <View style={styles.heroInfoGrid}>
                <View style={styles.heroInfoItem}>
                  <Feather name="clock" size={16} color={theme.gold} />
                  <Text style={[styles.heroInfoLabel, { color: theme.subtext }]}>Previsão</Text>
                  <Text style={[styles.heroInfoValue, { color: theme.gold }]}>{mockRotaInfo.previsao}</Text>
                </View>

                <View style={styles.heroInfoItem}>
                  <FontAwesome5 name="chair" size={16} color={theme.gold} />
                  <Text style={[styles.heroInfoLabel, { color: theme.subtext }]}>Assento</Text>
                  <Text style={[styles.heroInfoValue, { color: theme.text }]}>
                    {selectedSeat ? `#${selectedSeat}` : 'Não reservado'}
                  </Text>
                </View>

                <View style={styles.heroInfoItem}>
                  <MaterialCommunityIcons name="seat-passenger" size={16} color={theme.gold} />
                  <Text style={[styles.heroInfoLabel, { color: theme.subtext }]}>Lotação</Text>
                  <Text style={[styles.heroInfoValue, { color: theme.text }]}>
                    {mockRotaInfo.lotacao}/{mockRotaInfo.total}
                  </Text>
                </View>
              </View>

              {/* Barra de Lotação */}
              <View style={[styles.lotacaoBar, { backgroundColor: theme.inputBg }]}>
                <View style={[styles.lotacaoFill, { width: `${progressLotacao}%`, backgroundColor: '#F472B6' }]} />
              </View>
              <Text style={[styles.barraLabel, { color: theme.subtext }]}>Lotação do ônibus</Text>

              {/* Barra de Progresso do Percurso */}
              <View style={styles.percursoContainer}>
                <View style={styles.percursoRow}>
                  <MaterialCommunityIcons name="map-marker" size={14} color={theme.gold} />
                  <Text style={[styles.percursoLabel, { color: theme.subtext }]}>Progresso da rota</Text>
                  <Text style={[styles.percursoValue, { color: theme.gold }]}>{mockRotaInfo.progresso}%</Text>
                </View>
                <View style={[styles.percursoBar, { backgroundColor: theme.inputBg }]}>
                  <View style={[styles.percursoFill, { width: `${mockRotaInfo.progresso}%`, backgroundColor: theme.gold }]} />
                </View>
              </View>

              <View style={styles.heroFooter}>
                <Text style={[styles.heroTapHint, { color: theme.text }]}>
                  Toque para selecionar assento →
                </Text>
              </View>
            </TouchableOpacity>

            {/* CRONOGRAMA */}
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Cronograma</Text>
            
            <View style={[styles.cronograma, { backgroundColor: theme.card, borderColor: theme.border }]}>
              {mockRotaInfo.paradas.map((parada, index) => (
                <View key={index} style={styles.cronogramaItem}>
                  <View style={[styles.cronogramaDot, { backgroundColor: index === mockRotaInfo.paradas.length - 1 ? theme.gold : theme.subtext }]} />
                  <Text style={[styles.cronogramaHorario, { color: theme.text }]}>{parada.horario}</Text>
                  <Text style={[styles.cronogramaNome, { color: theme.subtext }]}>{parada.nome}</Text>
                </View>
              ))}
            </View>
          </>
        )}

        {userRole === 'motorista' && (
          <TouchableOpacity 
            style={[styles.heroCard, { backgroundColor: theme.card, borderColor: theme.border }]}
            onPress={() => router.push('/listas')}
            activeOpacity={0.9}
          >
            <View style={[styles.busIcon, { backgroundColor: theme.gold }]}>
              <FontAwesome5 name="bus" size={30} color="#1A253A" />
            </View>
            
            <View style={styles.busInfo}>
              <Text style={[styles.busTitle, { color: theme.text }]}>Painel de Gestão</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4, gap: 5 }}>
                <MaterialCommunityIcons name="account-group" size={14} color={theme.gold} />
                <Text style={{ fontSize: 12, fontWeight: 'bold', color: theme.gold }}>
                  Lista de alunos atualizada
                </Text>
              </View>
            </View>
            
            <Feather name="chevron-right" size={20} color={theme.subtext} />
          </TouchableOpacity>
        )}

        {userRole === 'admin' && (
          <>
            {/* Admin Stats Hero */}
            <View style={styles.adminStatsRow}>
              <View style={[styles.adminStatCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
                <FontAwesome5 name="user-graduate" size={18} color="#4299E1" />
                <Text style={[styles.adminStatNumber, { color: theme.text }]}>48</Text>
                <Text style={[styles.adminStatLabel, { color: theme.subtext }]}>Alunos</Text>
              </View>
              <View style={[styles.adminStatCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
                <FontAwesome5 name="bus" size={18} color="#48BB78" />
                <Text style={[styles.adminStatNumber, { color: theme.text }]}>5</Text>
                <Text style={[styles.adminStatLabel, { color: theme.subtext }]}>Motoristas</Text>
              </View>
              <View style={[styles.adminStatCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
                <FontAwesome5 name="route" size={18} color={theme.gold} />
                <Text style={[styles.adminStatNumber, { color: theme.text }]}>12</Text>
                <Text style={[styles.adminStatLabel, { color: theme.subtext }]}>Rotas</Text>
              </View>
            </View>

            {/* Admin Menu Card */}
            <TouchableOpacity
              style={[styles.heroCard, { backgroundColor: theme.card, borderColor: theme.border }]}
              onPress={() => router.push('/admin/')}
              activeOpacity={0.9}
            >
              <View style={styles.adminMenuRow}>
                <View style={[styles.adminMenuIcon, { backgroundColor: 'rgba(159,122,234,0.15)' }]}>
                  <FontAwesome5 name="shield-alt" size={22} color="#9F7AEA" />
                </View>
                <View style={styles.adminMenuInfo}>
                  <Text style={[styles.adminMenuTitle, { color: theme.text }]}>Painel Administrativo</Text>
                  <Text style={[styles.adminMenuSub, { color: theme.subtext }]}>Rotas, usuários, avisos e mais</Text>
                </View>
                <Feather name="chevron-right" size={20} color={theme.subtext} />
              </View>
            </TouchableOpacity>
          </>
        )}

        {/* AÇÕES RÁPIDAS */}
        <Text style={[styles.sectionTitle, { color: theme.text }]}>Ações Rápidas</Text>

        <View style={styles.grid}>
          {userRole === 'aluno' && (
            <>
              <TouchableOpacity style={[styles.gridItem, { backgroundColor: theme.card, borderColor: theme.border }]} onPress={() => router.push('/listas')}>
                <View style={[styles.iconCircle, { backgroundColor: 'rgba(72,187,120,0.1)' }]}>
                  <FontAwesome5 name="route" size={22} color="#48BB78" />
                </View>
                <Text style={[styles.gridLabel, { color: theme.text }]}>Ver Mapa</Text>
              </TouchableOpacity>

              <TouchableOpacity style={[styles.gridItem, { backgroundColor: theme.card, borderColor: theme.border }]} onPress={() => router.push('/avisos')}>
                <View style={[styles.iconCircle, { backgroundColor: 'rgba(239,68,68,0.1)' }]}>
                  <Feather name="bell" size={22} color="#EF4444" />
                </View>
                <Text style={[styles.gridLabel, { color: theme.text }]}>Mural Avisos</Text>
              </TouchableOpacity>

              <TouchableOpacity style={[styles.gridItem, { backgroundColor: theme.card, borderColor: theme.border }]} onPress={() => router.push('/(tabs)/chat')}>
                <View style={[styles.iconCircle, { backgroundColor: 'rgba(66,153,225,0.1)' }]}>
                  <Feather name="message-circle" size={22} color="#4299E1" />
                </View>
                <Text style={[styles.gridLabel, { color: theme.text }]}>Chat Rota</Text>
              </TouchableOpacity>

              <TouchableOpacity style={[styles.gridItem, { backgroundColor: theme.card, borderColor: theme.border }]} onPress={() => router.push('/(tabs)/calendario')}>
                <View style={[styles.iconCircle, { backgroundColor: 'rgba(159,122,234,0.1)' }]}>
                  <Feather name="calendar" size={22} color="#9F7AEA" />
                </View>
                <Text style={[styles.gridLabel, { color: theme.text }]}>Agenda</Text>
              </TouchableOpacity>

              <TouchableOpacity style={[styles.gridItem, { backgroundColor: theme.card, borderColor: theme.border }]} onPress={() => router.push('/(tabs)/mapa')}>
                <View style={[styles.iconCircle, { backgroundColor: 'rgba(245,166,35,0.1)' }]}>
                  <Feather name="compass" size={22} color={theme.gold} />
                </View>
                <Text style={[styles.gridLabel, { color: theme.text }]}>Acompanhar ao Vivo</Text>
              </TouchableOpacity>

              <TouchableOpacity style={[styles.gridItem, { backgroundColor: theme.card, borderColor: theme.border }]} onPress={() => router.push('/ajuda')}>
                <View style={[styles.iconCircle, { backgroundColor: 'rgba(49,130,206,0.1)' }]}>
                  <Feather name="help-circle" size={22} color="#3182CE" />
                </View>
                <Text style={[styles.gridLabel, { color: theme.text }]}>Ajuda</Text>
              </TouchableOpacity>
            </>
          )}

          {userRole === 'motorista' && (
            <>
              <TouchableOpacity style={[styles.gridItem, { backgroundColor: theme.card, borderColor: theme.border }]} onPress={() => router.push('/(tabs)/iniciar-rota')}>
                <View style={[styles.iconCircle, { backgroundColor: 'rgba(245,166,35,0.1)' }]}>
                  <Feather name="navigation" size={22} color={theme.gold} />
                </View>
                <Text style={[styles.gridLabel, { color: theme.text }]}>Iniciar Rota</Text>
              </TouchableOpacity>

              <TouchableOpacity style={[styles.gridItem, { backgroundColor: theme.card, borderColor: theme.border }]} onPress={() => router.push('/(tabs)/presenca')}>
                <View style={[styles.iconCircle, { backgroundColor: 'rgba(72,187,120,0.1)' }]}>
                  <MaterialCommunityIcons name="checkbox-marked-circle" size={22} color="#48BB78" />
                </View>
                <Text style={[styles.gridLabel, { color: theme.text }]}>Presença</Text>
              </TouchableOpacity>

              <TouchableOpacity style={[styles.gridItem, { backgroundColor: theme.card, borderColor: theme.border }]} onPress={() => router.push('/listas')}>
                <View style={[styles.iconCircle, { backgroundColor: 'rgba(66,153,225,0.1)' }]}>
                  <FontAwesome5 name="users" size={22} color="#4299E1" />
                </View>
                <Text style={[styles.gridLabel, { color: theme.text }]}>Alunos</Text>
              </TouchableOpacity>

              <TouchableOpacity style={[styles.gridItem, { backgroundColor: theme.card, borderColor: theme.border }]} onPress={() => router.push('/(tabs)/chat')}>
                <View style={[styles.iconCircle, { backgroundColor: 'rgba(159,122,234,0.1)' }]}>
                  <Feather name="message-circle" size={22} color="#9F7AEA" />
                </View>
                <Text style={[styles.gridLabel, { color: theme.text }]}>Chat</Text>
              </TouchableOpacity>

              <TouchableOpacity style={[styles.gridItem, { backgroundColor: theme.card, borderColor: theme.border }]} onPress={() => router.push('/(tabs)/calendario')}>
                <View style={[styles.iconCircle, { backgroundColor: 'rgba(245,166,35,0.1)' }]}>
                  <Feather name="calendar" size={22} color={theme.gold} />
                </View>
                <Text style={[styles.gridLabel, { color: theme.text }]}>Agenda</Text>
              </TouchableOpacity>

              <TouchableOpacity style={[styles.gridItem, { backgroundColor: theme.card, borderColor: theme.border }]} onPress={() => router.push('/ajuda')}>
                <View style={[styles.iconCircle, { backgroundColor: 'rgba(49,130,206,0.1)' }]}>
                  <Feather name="help-circle" size={22} color="#3182CE" />
                </View>
                <Text style={[styles.gridLabel, { color: theme.text }]}>Ajuda</Text>
              </TouchableOpacity>
            </>
          )}

          {userRole === 'admin' && (
            <>
              <TouchableOpacity style={[styles.gridItem, { backgroundColor: theme.card, borderColor: theme.border }]} onPress={() => router.push('/admin/gerenciar-rotas')}>
                <View style={[styles.iconCircle, { backgroundColor: 'rgba(72,187,120,0.1)' }]}>
                  <FontAwesome5 name="route" size={22} color="#48BB78" />
                </View>
                <Text style={[styles.gridLabel, { color: theme.text }]}>Gerenciar Rotas</Text>
              </TouchableOpacity>

              <TouchableOpacity style={[styles.gridItem, { backgroundColor: theme.card, borderColor: theme.border }]} onPress={() => router.push('/admin/gerenciar-avisos')}>
                <View style={[styles.iconCircle, { backgroundColor: 'rgba(245,166,35,0.1)' }]}>
                  <Feather name="bell" size={22} color={theme.gold} />
                </View>
                <Text style={[styles.gridLabel, { color: theme.text }]}>Gerenciar Avisos</Text>
              </TouchableOpacity>

              <TouchableOpacity style={[styles.gridItem, { backgroundColor: theme.card, borderColor: theme.border }]} onPress={() => router.push('/admin/gerenciar-feriados')}>
                <View style={[styles.iconCircle, { backgroundColor: 'rgba(159,122,234,0.1)' }]}>
                  <Feather name="calendar" size={22} color="#9F7AEA" />
                </View>
                <Text style={[styles.gridLabel, { color: theme.text }]}>Feriados</Text>
              </TouchableOpacity>

              <TouchableOpacity style={[styles.gridItem, { backgroundColor: theme.card, borderColor: theme.border }]} onPress={() => router.push('/admin/gerenciar-usuarios')}>
                <View style={[styles.iconCircle, { backgroundColor: 'rgba(66,153,225,0.1)' }]}>
                  <FontAwesome5 name="users" size={22} color="#4299E1" />
                </View>
                <Text style={[styles.gridLabel, { color: theme.text }]}>Usuários</Text>
              </TouchableOpacity>

              <TouchableOpacity style={[styles.gridItem, { backgroundColor: theme.card, borderColor: theme.border }]} onPress={() => router.push('/admin/gerar-convites')}>
                <View style={[styles.iconCircle, { backgroundColor: 'rgba(239,68,68,0.1)' }]}>
                  <Feather name="key" size={22} color="#EF4444" />
                </View>
                <Text style={[styles.gridLabel, { color: theme.text }]}>Gerar Convites</Text>
              </TouchableOpacity>

              <TouchableOpacity style={[styles.gridItem, { backgroundColor: theme.card, borderColor: theme.border }]} onPress={() => router.push('/ajuda')}>
                <View style={[styles.iconCircle, { backgroundColor: 'rgba(49,130,206,0.1)' }]}>
                  <Feather name="help-circle" size={22} color="#3182CE" />
                </View>
                <Text style={[styles.gridLabel, { color: theme.text }]}>Ajuda</Text>
              </TouchableOpacity>
            </>
          )}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    paddingHorizontal: 20, 
    paddingTop: Platform.OS === 'ios' ? 10 : 25, 
    paddingBottom: 20, 
    borderBottomWidth: 1,
    elevation: 4
  },
  welcomeText: { fontSize: 24, fontWeight: 'bold' },
  statusSub: { fontSize: 13, marginTop: 4, fontWeight: '500' },
  
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  profileBtn: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },

  scroll: { padding: 20 },

  /* HERO CARD */
  heroCard: { 
    padding: 18, 
    borderRadius: 20, 
    borderWidth: 1, 
    marginBottom: 25, 
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8
  },
  heroBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 12,
  },
  heroBadgeText: { color: '#1A253A', fontSize: 10, fontWeight: 'bold' },
  heroTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 16 },
  
  heroInfoGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  heroInfoItem: {
    alignItems: 'center',
  },
  heroInfoLabel: { fontSize: 10, marginTop: 4 },
  heroInfoValue: { fontSize: 14, fontWeight: 'bold' },

  lotacaoBar: {
    height: 6,
    borderRadius: 3,
    marginBottom: 6,
    overflow: 'hidden',
  },
  lotacaoFill: {
    height: '100%',
    borderRadius: 3,
  },
  barraLabel: { fontSize: 10, marginBottom: 12 },

  /* BARRA DE PROGRESSO DO PERCURSO */
  percursoContainer: {
    marginBottom: 8,
  },
  percursoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  percursoLabel: { fontSize: 11, marginLeft: 4 },
  percursoValue: { fontSize: 11, fontWeight: 'bold', marginLeft: 'auto' },
  percursoBar: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  percursoFill: {
    height: '100%',
    borderRadius: 4,
  },

  heroFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  heroTapHint: { fontSize: 12 },

  /* CRONOGRAMA */
  cronograma: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 25,
  },
  cronogramaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  cronogramaDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 12,
  },
  cronogramaHorario: { fontSize: 14, fontWeight: 'bold', width: 50 },
  cronogramaNome: { fontSize: 14 },

  /* ADMIN */
  adminStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  adminStatCard: {
    flex: 1,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  adminStatNumber: { fontSize: 24, fontWeight: 'bold', marginTop: 6 },
  adminStatLabel: { fontSize: 11, marginTop: 2 },

  adminMenuRow: { flexDirection: 'row', alignItems: 'center' },
  adminMenuIcon: {
    width: 48, height: 48, borderRadius: 14,
    justifyContent: 'center', alignItems: 'center',
  },
  adminMenuInfo: { flex: 1, marginLeft: 14 },
  adminMenuTitle: { fontSize: 16, fontWeight: '700' },
  adminMenuSub: { fontSize: 12, marginTop: 3 },

  /* BUS CARD LEGACY */
  busCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 18,
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 35,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8
  },
  busIcon: { width: 54, height: 54, borderRadius: 15, justifyContent: 'center', alignItems: 'center' },
  busInfo: { flex: 1, marginLeft: 15 },
  busTitle: { fontSize: 18, fontWeight: 'bold' },

  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 20, marginLeft: 5 },
  
  grid: { 
    flexDirection: 'row', 
    flexWrap: 'wrap', 
    justifyContent: 'space-between' 
  },
  gridItem: { 
    width: '48%', 
    paddingVertical: 20, 
    borderRadius: 16, 
    borderWidth: 1, 
    marginBottom: 15,
    alignItems: 'center',
    elevation: 3
  },
  iconCircle: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
  gridLabel: { fontSize: 12, fontWeight: 'bold' },
});