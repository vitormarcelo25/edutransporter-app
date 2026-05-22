import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, Text, View, TouchableOpacity, SafeAreaView, ScrollView, Platform, ActivityIndicator
} from 'react-native';
import { Feather, FontAwesome5, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';

import { useApp } from '../_layout';
import { getRotaDoDia, confirmarPresenca, cancelarPresenca, Parada, Rota, ConfirmacaoResponse } from '../../services/api';

export default function HomeScreen() {
  const router = useRouter();
  const { theme, userRole, userData, confirmouPresenca, setConfirmouPresenca, assentoAutomatico, setAssentoAutomatico, ordemChegada, setOrdemChegada } = useApp();
  
  const [currentDate, setCurrentDate] = useState('');
  const [currentTime, setCurrentTime] = useState('');
  const [rota, setRota] = useState<Rota | null>(null);
  const [loadingRota, setLoadingRota] = useState(true);
  const [loadingConfirmacao, setLoadingConfirmacao] = useState(false);

  const handleConfirmarPresenca = async () => {
    setLoadingConfirmacao(true);
    try {
      if (!userData?.id) return;
      const result: ConfirmacaoResponse = await confirmarPresenca(userData.id);
      if (result.success) {
        setConfirmouPresenca(true);
        if (result.assento) setAssentoAutomatico(result.assento);
        if (result.ordem) setOrdemChegada(result.ordem);
        await loadRotaData();
      } else {
        alert(result.message || 'Erro ao confirmar presença');
      }
    } catch (error) {
      console.log('Erro ao confirmar:', error);
      alert('Erro de conexão ao confirmar presença');
    } finally {
      setLoadingConfirmacao(false);
    }
  };

  const handleCancelarPresenca = async () => {
    setLoadingConfirmacao(true);
    try {
      if (!userData?.id) return;
      const result: ConfirmacaoResponse = await cancelarPresenca(userData.id);
      if (result.success) {
        setConfirmouPresenca(false);
        setAssentoAutomatico(null);
        setOrdemChegada(null);
        await loadRotaData();
      } else {
        alert(result.message || 'Erro ao cancelar presença');
      }
    } catch (error) {
      console.log('Erro ao cancelar:', error);
      alert('Erro de conexão ao cancelar presença');
    } finally {
      setLoadingConfirmacao(false);
    }
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
    
    loadRotaData();
    return () => clearInterval(timer);
  }, []);

  const loadRotaData = async () => {
    setLoadingRota(true);
    try {
      const response = await getRotaDoDia(userRole === 'aluno' ? userData?.id : undefined);
      if (response.success && response.rota) {
        setRota(response.rota);
        const meuAluno = response.rota.alunos.find((a: any) => a.id === userData?.id);
        if (meuAluno) {
          setConfirmouPresenca(meuAluno.confirmouPresenca);
          setAssentoAutomatico(meuAluno.assentoAutomatico || null);
          setOrdemChegada(meuAluno.ordemChegada || null);
        }
      }
    } catch (error) {
      console.log('Erro ao carregar rota:', error);
    } finally {
      setLoadingRota(false);
    }
  };

  // Recarrega a rota sempre que a tela entra em foco (ex: voltar de outra tela)
  useFocusEffect(
    React.useCallback(() => {
      loadRotaData();
    }, [])
  );

  const mockRotaInfo = {
    escola: 'Faculdade Uninassau',
    tipo: 'Ida',
    previsao: '07:45',
    lotacao: 15,
    total: 40,
    progresso: 40,
    paradas: [
      { horario: '07:00', nome: 'Escola' },
      { horario: '07:15', nome: 'Parada 1' },
      { horario: '07:30', nome: 'Parada 2' },
      { horario: '07:45', nome: 'Seu Ponto' },
    ]
  };

  const getTipoRota = () => {
    return mockRotaInfo.tipo;
  };

  const progressLotacao = (mockRotaInfo.lotacao / mockRotaInfo.total) * 100;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]}>
      
      {/* CABEÇALHO */}
      <View style={[styles.header, { backgroundColor: theme.card, borderBottomColor: theme.border }]}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.welcomeText, { color: theme.text }]}>
            {userRole === 'admin' ? 'Olá, Administrador' : `Olá, ${userData?.nome || (userRole === 'aluno' ? 'Aluno' : 'Motorista')}!`}
          </Text>
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
                <Text style={styles.heroBadgeText}>ROTA {rota?.tipo || mockRotaInfo.tipo}</Text>
              </View>

              {/* Título */}
              <Text style={[styles.heroTitle, { color: theme.text }]}>
                {rota?.escola || mockRotaInfo.escola}
              </Text>

              {/* Info Grid - Sistema de Confirmação */}
              <View style={styles.heroInfoGrid}>
                <View style={styles.heroInfoItem}>
                  <FontAwesome5 name="chair" size={16} color={confirmouPresenca ? '#48BB78' : theme.gold} />
                  <Text style={[styles.heroInfoLabel, { color: theme.subtext }]}>Assento</Text>
                  <Text style={[styles.heroInfoValue, { color: theme.text }]}>
                    {assentoAutomatico ? `#${assentoAutomatico}` : 'A confirmar'}
                  </Text>
                </View>

                <View style={styles.heroInfoItem}>
                  <MaterialCommunityIcons name="account-group" size={16} color={theme.gold} />
                  <Text style={[styles.heroInfoLabel, { color: theme.subtext }]}>Presentes</Text>
                  <Text style={[styles.heroInfoValue, { color: theme.text }]}>
                    {rota?.alunos.filter((a: any) => a.presente).length || 0}/40
                  </Text>
                </View>
              </View>

              {/* Botão de Confirmação */}
              {userRole === 'aluno' && (
                <View style={styles.confirmacaoContainer}>
                  {confirmouPresenca ? (
                    <>
                      <View style={[styles.statusConfirmado, { backgroundColor: '#48BB78' }]}>
                        <Feather name="check-circle" size={16} color="#FFFFFF" />
                        <Text style={styles.statusConfirmadoText}>Confirmado!</Text>
                      </View>
                      {ordemChegada && (
                        <Text style={[styles.ordemText, { color: theme.subtext }]}>
                          Você é o {ordemChegada}º a confirmar
                        </Text>
                      )}
                      <TouchableOpacity
                        style={[styles.cancelarBtn, { borderColor: '#EF4444' }]}
                        onPress={handleCancelarPresenca}
                        disabled={loadingConfirmacao}
                      >
                        <Text style={[styles.cancelarBtnText, { color: '#EF4444' }]}>
                          {loadingConfirmacao ? 'Cancelando...' : 'Cancelar Presença'}
                        </Text>
                      </TouchableOpacity>
                    </>
                  ) : (
                    <TouchableOpacity
                      style={[styles.confirmarBtn, { backgroundColor: theme.gold }]}
                      onPress={handleConfirmarPresenca}
                      disabled={loadingConfirmacao}
                    >
                      <Feather name="check" size={20} color="#1A253A" />
                      <Text style={[styles.confirmarBtnText, { color: '#1A253A' }]}>
                        {loadingConfirmacao ? 'Confirmando...' : 'Confirmar Presença'}
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              )}

              {/* Barra de Lotação */}
              <View style={[styles.lotacaoBar, { backgroundColor: theme.inputBg }]}>
                <View style={[styles.lotacaoFill, { width: `${progressLotacao}%`, backgroundColor: '#F472B6' }]} />
              </View>
              <Text style={[styles.barraLabel, { color: theme.subtext }]}>Vagas disponíveis no ônibus</Text>

              <View style={styles.heroFooter}>
                <Text style={[styles.heroTapHint, { color: theme.subtext }]}>
                  Toque para ver cronograma →
                </Text>
              </View>
            </TouchableOpacity>

{/* CRONOGRAMA */}
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Cronograma da Rota</Text>
            
            <View style={[styles.cronogramaContainer, { backgroundColor: theme.card, borderColor: theme.border }]}>
              {/* Header com status e tipo */}
              <View style={styles.cronogramaHeader}>
                <View style={[styles.statusBadge, { 
                  backgroundColor: rota?.status === 'em_andamento' ? '#48BB78' : 
                                   rota?.status === 'encerrada' ? '#A0AEC0' : theme.gold 
                }]}>
                  <View style={styles.statusDot} />
                  <Text style={styles.statusText}>
                    {rota?.status === 'em_andamento' ? 'Em andamento' : 
                     rota?.status === 'encerrada' ? 'Encerrada' : 'Agendada'}
                  </Text>
                </View>
                <View style={[styles.rotaTipoBadge, { backgroundColor: theme.inputBg }]}>
                  <Text style={[styles.rotaTipoText, { color: theme.subtext }]}>{rota?.tipo || mockRotaInfo.tipo}</Text>
                </View>
              </View>

              {/* Info da Rota */}
              <View style={[styles.rotaInfoCard, { backgroundColor: theme.inputBg }]}>
                <View style={styles.rotaInfoRow}>
                  <View style={styles.rotaInfoItem}>
                    <MaterialCommunityIcons name="clock-outline" size={18} color={theme.gold} />
                    <Text style={[styles.rotaInfoLabel, { color: theme.subtext }]}>Saída</Text>
                    <Text style={[styles.rotaInfoValue, { color: theme.text }]}>06:30</Text>
                  </View>
                  <View style={styles.rotaInfoDivider} />
                  <View style={styles.rotaInfoItem}>
                    <MaterialCommunityIcons name="clock-check-outline" size={18} color="#48BB78" />
                    <Text style={[styles.rotaInfoLabel, { color: theme.subtext }]}>Chegada</Text>
                    <Text style={[styles.rotaInfoValue, { color: '#48BB78' }]}>07:50</Text>
                  </View>
                  <View style={styles.rotaInfoDivider} />
                  <View style={styles.rotaInfoItem}>
                    <MaterialCommunityIcons name="map-marker-distance" size={18} color="#4299E1" />
                    <Text style={[styles.rotaInfoLabel, { color: theme.subtext }]}>Paradas</Text>
                    <Text style={[styles.rotaInfoValue, { color: theme.text }]}>{rota?.paradas?.length || 0}</Text>
                  </View>
                </View>
              </View>

              {/* Lista de Paradas em Cards */}
              {loadingRota ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="small" color={theme.gold} />
                  <Text style={[styles.loadingText, { color: theme.subtext }]}>Carregando cronograma...</Text>
                </View>
              ) : rota?.paradas && rota?.paradas?.length > 0 ? (
                <View style={styles.paradasList}>
                  {rota?.paradas.map((parada, index) => {
                    const isLast = index === (rota?.paradas?.length || 0) - 1;
                    const isPrimeira = index === 0;
                    
                    const horarios = ['06:30', '06:50', '07:15', '07:35', '07:50'];
                    const icons = ['home', 'map-marker', 'map-marker', 'map-marker', 'school'];
                    const badgeLabels = ['', '', '', '', 'Faculdade'];
                    const hints = ['Ponto de embarque', '', '', '', 'Destino final'];
                    
                    return (
                      <View key={parada.id} style={styles.paradaCard}>
                        {/* Número da parada */}
                        <View style={[
                          styles.paradaNumber,
                          { backgroundColor: isPrimeira ? theme.gold : isLast ? '#48BB78' : theme.subtext }
                        ]}>
                          {isPrimeira ? (
                            <MaterialCommunityIcons name="home" size={16} color="#1A253A" />
                          ) : isLast ? (
                            <MaterialCommunityIcons name="school" size={16} color="#FFFFFF" />
                          ) : (
                            <Text style={styles.paradaNumberText}>{index + 1}</Text>
                          )}
                        </View>
                        
                        {/* Conteúdo do card */}
                        <View style={styles.paradaCardContent}>
                          <View style={styles.paradaCardHeader}>
                            <Text style={[
                              styles.paradaCardTime,
                              { color: isPrimeira ? theme.gold : isLast ? '#48BB78' : theme.text }
                            ]}>
                              {horarios[index] || `07:${10 + index * 10}`}
                            </Text>
                            {badgeLabels[index] && (
                              <View style={[
                                styles.paradaBadge,
                                { backgroundColor: isPrimeira ? theme.gold : '#48BB78' }
                              ]}>
                                <Text style={styles.paradaBadgeText}>{badgeLabels[index]}</Text>
                              </View>
                            )}
                          </View>
                          
                          <Text style={[styles.paradaCardNome, { color: theme.text }]}>{parada.nome}</Text>
                          <Text style={[styles.paradaCardEndereco, { color: theme.subtext }]} numberOfLines={1}>
                            {parada.endereco}
                          </Text>
                          
                          {hints[index] && (
                            <View style={styles.paradaHintRow}>
                              <Text style={[
                                styles.paradaHintText,
                                { color: isPrimeira ? theme.gold : '#48BB78' }
                              ]}>
                                {isPrimeira ? '🚐' : '🎓'} {hints[index]}
                              </Text>
                            </View>
                          )}
                        </View>
                      </View>
                    );
                  })}
                </View>
              ) : (
                <Text style={[styles.emptyText, { color: theme.subtext }]}>
                  Nenhuma parada encontrada
                </Text>
              )}
            </View>
          </>
        )}

        {userRole === 'motorista' && (
          <>
            {/* Painel de Gestão do Motorista */}
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

            {/* Info da Rota do Motorista */}
            {rota && (
              <View style={[styles.cronogramaContainer, { backgroundColor: theme.card, borderColor: theme.border }]}>
                <View style={styles.cronogramaHeader}>
                  <View style={[styles.statusBadge, { backgroundColor: theme.gold }]}>
                    <View style={styles.statusDot} />
                    <Text style={styles.statusText}>Rota do Dia</Text>
                  </View>
                  <View style={[styles.rotaTipoBadge, { backgroundColor: theme.inputBg }]}>
                    <Text style={[styles.rotaTipoText, { color: theme.subtext }]}>{rota?.tipo}</Text>
                  </View>
                </View>
                
                <View style={[styles.rotaInfoCard, { backgroundColor: theme.inputBg }]}>
                  <View style={styles.rotaInfoRow}>
                    <View style={styles.rotaInfoItem}>
                      <MaterialCommunityIcons name="clock-outline" size={18} color={theme.gold} />
                      <Text style={[styles.rotaInfoLabel, { color: theme.subtext }]}>Saída</Text>
                      <Text style={[styles.rotaInfoValue, { color: theme.text }]}>06:30</Text>
                    </View>
                    <View style={styles.rotaInfoDivider} />
                    <View style={styles.rotaInfoItem}>
                      <MaterialCommunityIcons name="clock-check-outline" size={18} color="#48BB78" />
                      <Text style={[styles.rotaInfoLabel, { color: theme.subtext }]}>Chegada</Text>
                      <Text style={[styles.rotaInfoValue, { color: '#48BB78' }]}>07:50</Text>
                    </View>
                    <View style={styles.rotaInfoDivider} />
                    <View style={styles.rotaInfoItem}>
                      <MaterialCommunityIcons name="account-group" size={18} color="#4299E1" />
                      <Text style={[styles.rotaInfoLabel, { color: theme.subtext }]}>Alunos</Text>
                      <Text style={[styles.rotaInfoValue, { color: theme.text }]}>{rota?.alunos?.length || 0}</Text>
                    </View>
                  </View>
                </View>
              </View>
            )}
          </>
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

  /* SISTEMA DE CONFIRMAÇÃO */
  confirmacaoContainer: {
    marginTop: 12,
    marginBottom: 12,
    alignItems: 'center',
  },
  confirmarBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    gap: 8,
  },
  confirmarBtnText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  statusConfirmado: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    gap: 6,
  },
  statusConfirmadoText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  ordemText: {
    fontSize: 12,
    marginTop: 8,
  },
  cancelarBtn: {
    marginTop: 10,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    borderWidth: 1,
  },
  cancelarBtnText: {
    fontSize: 14,
    fontWeight: '600',
  },

  /* CRONOGRAMA NOVO */
  cronogramaContainer: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 25,
  },
  cronogramaHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FFFFFF',
    marginRight: 6,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: 'bold',
  },
  rotaTipoBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  rotaTipoText: {
    fontSize: 11,
    fontWeight: '600',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  loadingText: {
    marginLeft: 10,
    fontSize: 13,
  },
  rotaInfoCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  rotaInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  rotaInfoItem: {
    alignItems: 'center',
  },
  rotaInfoLabel: {
    fontSize: 10,
    marginTop: 4,
  },
  rotaInfoValue: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 2,
  },
  rotaInfoDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#FFFFFF30',
  },
  paradasList: {
    gap: 12,
  },
  paradaCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  paradaNumber: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  paradaNumberText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  paradaCardContent: {
    flex: 1,
  },
  paradaCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  paradaCardTime: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  paradaBadge: {
    marginLeft: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  paradaBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  paradaCardNome: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  paradaCardEndereco: {
    fontSize: 11,
    marginBottom: 4,
  },
  paradaHintRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  paradaHintText: {
    fontSize: 11,
    fontWeight: '600',
  },
  paradaProgress: {
    width: 24,
    alignItems: 'center',
    marginLeft: 6,
    height: 60,
    justifyContent: 'center',
  },
  paradaProgressLine: {
    position: 'absolute',
    width: 2,
    height: '100%',
    top: -30,
  },
  paradaBusIcon: {
    position: 'absolute',
    bottom: -20,
    zIndex: 1,
  },

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