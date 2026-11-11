import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TouchableOpacity, 
  SafeAreaView, 
  ScrollView,
  FlatList,
  StatusBar,
  Dimensions,
  Platform,
  TextInput,
  ActivityIndicator
} from 'react-native';
import { Alert } from '@/components/Alert';
import { Feather, FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter, Stack } from 'expo-router';

import { useApp } from './_layout';
import { LinearGradient } from 'expo-linear-gradient';
import { getRotaDoDia, Rota, RotaResponse, RotaAluno, marcarPresenca, confirmarPresenca, cancelarPresenca } from '@/services/api';

const { width } = Dimensions.get('window');

export default function Listas() {
  const router = useRouter();
  const { theme, isDark, userRole, userData, confirmouPresenca, setConfirmouPresenca, assentoAutomatico, setAssentoAutomatico, ordemChegada, setOrdemChegada } = useApp();
  
  const [rota, setRota] = useState<Rota | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [confirmando, setConfirmando] = useState(false);

  // Assentos ocupados (mock)
  const occupiedSeats = [2, 5, 8, 12, 15, 20, 24, 30, 31, 35, 40, 44, 52, 58, 63];
  const SEAT_SIZE = (width - 100) / 5;

  const loadRota = async () => {
    setLoading(true);
    const result: RotaResponse = await getRotaDoDia(userRole === 'aluno' ? userData?.id : undefined);
    setLoading(false);
    if (result.success && result.rota) {
      setRota(result.rota);
      // Sincroniza o status do aluno com o servidor (assento = ordem de confirmação)
      if (userRole === 'aluno' && userData?.id) {
        const eu = result.rota.alunos.find((a) => a.id === String(userData.id).replace(/\D/g, ''));
        if (eu) {
          setConfirmouPresenca(Boolean(eu.confirmouPresenca));
          setAssentoAutomatico(eu.assentoAutomatico ? Number(eu.assentoAutomatico) : null);
          setOrdemChegada(eu.ordemChegada || null);
        }
      }
    }
  };

  const handleTogglePresenca = async (alunoId: string, atual: boolean) => {
    try {
      const novoStatus = !atual;
      const res = await marcarPresenca(alunoId, novoStatus);
      if (res.success) {
        if (rota) {
          const alunosAtualizados = rota.alunos.map(a => 
            a.id === alunoId ? { ...a, presente: novoStatus } : a
          );
          setRota({ ...rota, alunos: alunosAtualizados });
        }
      } else {
        Alert.alert('Atenção', res.message || 'Erro ao alterar presença');
      }
    } catch (err) {
      console.log('Erro ao alterar presença:', err);
    }
  };

  useEffect(() => {
    loadRota();
  }, []);

// Se for motorista ou admin, mostrar lista de alunos (não o mapa de assentos)
  if (userRole !== 'aluno') {
    const filteredAlunos = rota?.alunos.filter(aluno => 
      aluno.nome.toLowerCase().includes(searchText.toLowerCase()) || 
      aluno.parada.toLowerCase().includes(searchText.toLowerCase())
    ) || [];

    const totalAlunos = rota?.alunos.length || 0;
    const presentes = rota?.alunos.filter(a => a.presente).length || 0;
    const faltantes = totalAlunos - presentes;

    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]}>
        <Stack.Screen options={{ headerShown: false }} />
        <StatusBar barStyle={theme.status as any} />

        <View style={[styles.header, { borderBottomColor: theme.border, backgroundColor: theme.card }]}>
          <TouchableOpacity onPress={() => router.replace('/home')} style={styles.backBtn}>
            <Feather name="arrow-left" size={24} color={theme.text} />
          </TouchableOpacity>
          <View style={styles.titleContainer}>
            <Text style={[styles.title, { color: theme.text }]}>Painel de Gestão</Text>
            <View style={[styles.plateBadge, { backgroundColor: theme.gold }]}>
              <Text style={styles.plateText}>ORE 3 • ESCOLAR</Text>
            </View>
          </View>
          <TouchableOpacity onPress={loadRota} style={styles.backBtn} disabled={loading}>
            {loading ? (
              <ActivityIndicator size="small" color={theme.gold} />
            ) : (
              <Feather name="refresh-cw" size={22} color={theme.gold} />
            )}
          </TouchableOpacity>
        </View>

        <FlatList
            data={filteredAlunos}
            keyExtractor={(item) => item.id}
            renderItem={({ item: aluno }) => (
              <TouchableOpacity 
                activeOpacity={0.8}
                onPress={() => handleTogglePresenca(aluno.id, aluno.presente)}
                style={[styles.alunoCard, { backgroundColor: theme.card, borderColor: theme.border }]}
              >
                <View style={[styles.alunoAvatar, { backgroundColor: theme.inputBg }]}>
                  <Text style={[styles.alunoInicial, { color: theme.gold }]}>
                    {aluno.nome.charAt(0)}
                  </Text>
                </View>
                <View style={styles.alunoInfo}>
                  <Text style={[styles.alunoNome, { color: theme.text }]}>{aluno.nome}</Text>
                  <Text style={[styles.alunoParada, { color: theme.subtext }]} numberOfLines={1}>{aluno.parada}</Text>
                </View>
                <View style={[styles.presencaStatus, { backgroundColor: aluno.presente ? '#48BB78' : '#EF4444' }]}>
                  <Text style={styles.presencaText}>
                    {aluno.presente ? 'Presente' : 'Ausente'}
                  </Text>
                </View>
              </TouchableOpacity>
            )}
            ListHeaderComponent={
              <View style={{ width: '100%' }}>
                {/* Cards de estatísticas horizontais */}
                <View style={styles.statsRow}>
                  <View style={[styles.statBox, { backgroundColor: theme.card, borderColor: theme.border }]}>
                    <FontAwesome5 name="users" size={16} color={theme.gold} />
                    <Text style={[styles.statValue, { color: theme.text }]}>{totalAlunos}</Text>
                    <Text style={[styles.statLabel, { color: theme.subtext }]}>Total Alunos</Text>
                  </View>
                  <View style={[styles.statBox, { backgroundColor: theme.card, borderColor: theme.border }]}>
                    <MaterialCommunityIcons name="checkbox-marked" size={18} color="#48BB78" />
                    <Text style={[styles.statValue, { color: '#48BB78' }]}>{presentes}</Text>
                    <Text style={[styles.statLabel, { color: theme.subtext }]}>Presentes</Text>
                  </View>
                  <View style={[styles.statBox, { backgroundColor: theme.card, borderColor: theme.border }]}>
                    <MaterialCommunityIcons name="close-box" size={18} color="#EF4444" />
                    <Text style={[styles.statValue, { color: '#EF4444' }]}>{faltantes}</Text>
                    <Text style={[styles.statLabel, { color: theme.subtext }]}>Faltantes</Text>
                  </View>
                </View>

                {/* Detalhes da Rota */}
                <View style={[styles.routeDetailCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
                  <Feather name="map-pin" size={20} color="#3182CE" />
                  <View style={styles.routeDetailText}>
                    <Text style={[styles.routeDetailLabel, { color: theme.subtext }]}>Rota Ativa</Text>
                    <Text style={[styles.routeDetailValue, { color: theme.text }]}>{rota?.nome || 'Nenhuma rota agendada'}</Text>
                  </View>
                </View>

                {/* Barra de Pesquisa */}
                <View style={[styles.searchBar, { backgroundColor: theme.card, borderColor: theme.border }]}>
                  <Feather name="search" size={16} color={theme.subtext} />
                  <TextInput
                    placeholder="Buscar aluno ou parada..."
                    placeholderTextColor={theme.subtext}
                    style={[styles.searchInput, { color: theme.text }]}
                    value={searchText}
                    onChangeText={setSearchText}
                  />
                  {searchText ? (
                    <TouchableOpacity onPress={() => setSearchText('')}>
                      <Feather name="x" size={16} color={theme.subtext} />
                    </TouchableOpacity>
                  ) : null}
                </View>

                <Text style={[styles.sectionTitle, { color: theme.text }]}>Lista de Alunos ({filteredAlunos.length})</Text>
              </View>
            }
            ListEmptyComponent={
              !rota ? (
                <TouchableOpacity style={[styles.loadBtn, { backgroundColor: theme.gold }]} onPress={loadRota}>
                  <Text style={styles.loadBtnText}>Carregar Lista</Text>
                </TouchableOpacity>
              ) : (
                <View style={{ alignItems: 'center', paddingVertical: 40, width: '100%' }}>
                  <Feather name="users" size={48} color={theme.subtext} style={{ opacity: 0.5, marginBottom: 10 }} />
                  <Text style={{ color: theme.subtext, fontSize: 14 }}>Nenhum aluno encontrado</Text>
                </View>
              )
            }
            contentContainerStyle={styles.driverScrollContent}
            showsVerticalScrollIndicator={false}
          />
      </SafeAreaView>
    );
  }

  // Para aluno - Passagem digital com assento automático
  const primeiroNome = (userData?.nome || 'Aluno').split(' ')[0];
  const presentesCount = rota?.alunos.filter((a: any) => a.presente).length || 0;
  const capacidade = 40;
  const ocupacaoPct = Math.min(100, (presentesCount / capacidade) * 100);
  const corStatus = confirmouPresenca ? '#48BB78' : theme.gold;
  const dataHoje = new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' });

  const handleConfirmar = async () => {
    if (!userData?.id) return;
    setConfirmando(true);
    try {
      const res = await confirmarPresenca(userData.id);
      if (res.success) {
        setConfirmouPresenca(true);
        setAssentoAutomatico(Number(res.assento) || 1);
        if (res.ordem) setOrdemChegada(Number(res.ordem));
        await loadRota();
      } else {
        Alert.alert('Atenção', res.message || 'Não foi possível confirmar a presença.');
      }
    } finally {
      setConfirmando(false);
    }
  };

  const handleCancelar = async () => {
    if (!userData?.id) return;
    setConfirmando(true);
    try {
      const res = await cancelarPresenca(userData.id);
      if (res.success) {
        setConfirmouPresenca(false);
        setAssentoAutomatico(null);
        setOrdemChegada(null);
        await loadRota();
      }
    } finally {
      setConfirmando(false);
    }
  };

  const passos = [
    { titulo: 'Confirme a presença', desc: 'Até 1h antes da saída', ok: confirmouPresenca },
    { titulo: 'Assento garantido', desc: 'Definido por ordem de confirmação', ok: confirmouPresenca && !!assentoAutomatico },
    { titulo: 'Embarque no ponto', desc: 'Apresente-se 5 min antes', ok: false },
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]}>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar barStyle={theme.status as any} />

      <ScrollView contentContainerStyle={vs.scroll} showsVerticalScrollIndicator={false}>
        {/* Topo */}
        <View style={vs.topRow}>
          <TouchableOpacity onPress={() => router.replace('/home')} style={[vs.roundBtn, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <Feather name="arrow-left" size={20} color={theme.text} />
          </TouchableOpacity>
          <View style={{ alignItems: 'center' }}>
            <Text style={[vs.topTitle, { color: theme.text }]}>Minha Viagem</Text>
            <Text style={[vs.topSub, { color: theme.subtext }]}>{dataHoje}</Text>
          </View>
          <TouchableOpacity onPress={loadRota} style={[vs.roundBtn, { backgroundColor: theme.card, borderColor: theme.border }]} disabled={loading}>
            {loading ? (
              <ActivityIndicator size="small" color={theme.gold} />
            ) : (
              <Feather name="refresh-cw" size={18} color={theme.gold} />
            )}
          </TouchableOpacity>
        </View>

        {/* Saudação */}
        <Text style={[vs.hello, { color: theme.text }]}>Olá, {primeiroNome} 👋</Text>
        <Text style={[vs.helloSub, { color: theme.subtext }]}>
          {confirmouPresenca ? 'Tudo certo! Seu lugar está reservado.' : 'Confirme sua presença para reservar seu lugar.'}
        </Text>

        {/* Passagem digital */}
        <View style={[vs.ticket, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <LinearGradient
            colors={confirmouPresenca ? ['#2F855A', '#276749'] : ['#F5A623', '#E08A00']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={vs.ticketHead}
          >
            <View style={vs.ticketHeadRow}>
              <View style={vs.statusPill}>
                <View style={[vs.statusDot, { backgroundColor: '#FFF' }]} />
                <Text style={vs.statusPillText}>{confirmouPresenca ? 'CONFIRMADA' : 'AGUARDANDO'}</Text>
              </View>
              <View style={vs.tipoPill}>
                <MaterialCommunityIcons name={rota?.tipo === 'Volta' ? 'arrow-left-bold' : 'arrow-right-bold'} size={14} color="#FFF" />
                <Text style={vs.tipoPillText}>{rota?.tipo || 'Ida'}</Text>
              </View>
            </View>

            <View style={vs.seatRow}>
              <View style={vs.seatBadge}>
                <MaterialCommunityIcons name="seat-passenger" size={44} color="#FFF" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={vs.seatSmall}>SEU ASSENTO</Text>
                <Text style={vs.seatBig}>
                  {confirmouPresenca && assentoAutomatico ? `#${assentoAutomatico}` : '—'}
                </Text>
                {confirmouPresenca && ordemChegada ? (
                  <Text style={vs.seatQueue}>{ordemChegada}º a confirmar</Text>
                ) : (
                  <Text style={vs.seatQueue}>Disponível após confirmar</Text>
                )}
              </View>
            </View>
          </LinearGradient>

          {/* Picote */}
          <View style={vs.notchRow}>
            <View style={[vs.notch, { backgroundColor: theme.bg, marginLeft: -12 }]} />
            <View style={[vs.dashed, { borderColor: theme.border }]} />
            <View style={[vs.notch, { backgroundColor: theme.bg, marginRight: -12 }]} />
          </View>

          <View style={vs.ticketBody}>
            <View style={vs.routeLine}>
              <View style={{ alignItems: 'center' }}>
                <View style={[vs.routeDot, { borderColor: theme.gold }]} />
                <View style={[vs.routeBar, { backgroundColor: theme.border }]} />
                <View style={[vs.routeDot, { backgroundColor: theme.gold, borderColor: theme.gold }]} />
              </View>
              <View style={{ flex: 1, justifyContent: 'space-between' }}>
                <View>
                  <Text style={[vs.routeLabel, { color: theme.subtext }]}>PARTIDA</Text>
                  <Text style={[vs.routeValue, { color: theme.text }]} numberOfLines={1}>
                    {rota?.paradas?.[0]?.nome || 'Ponto de embarque'}
                  </Text>
                </View>
                <View style={{ marginTop: 18 }}>
                  <Text style={[vs.routeLabel, { color: theme.subtext }]}>DESTINO</Text>
                  <Text style={[vs.routeValue, { color: theme.text }]} numberOfLines={1}>
                    {rota?.escola || rota?.nome || 'Instituição de ensino'}
                  </Text>
                </View>
              </View>
              <View style={[vs.timeBox, { backgroundColor: theme.inputBg }]}>
                <Text style={[vs.timeLabel, { color: theme.subtext }]}>SAÍDA</Text>
                <Text style={[vs.timeValue, { color: theme.gold }]}>{rota?.horario || '06:30'}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Métricas */}
        <View style={vs.metricsRow}>
          <View style={[vs.metric, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <MaterialCommunityIcons name="bus-school" size={22} color={theme.gold} />
            <Text style={[vs.metricValue, { color: theme.text }]} numberOfLines={1}>{rota?.nome || 'Linha 01 - Nassau Noturno'}</Text>
            <Text style={[vs.metricLabel, { color: theme.subtext }]}>Linha</Text>
          </View>
          <View style={[vs.metric, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <MaterialCommunityIcons name="account-group" size={22} color="#9F7AEA" />
            <Text style={[vs.metricValue, { color: theme.text }]}>{presentesCount}/{capacidade}</Text>
            <View style={[vs.progressTrack, { backgroundColor: theme.inputBg }]}>
              <View style={[vs.progressBarFill, { width: `${ocupacaoPct}%` }]} />
            </View>
            <Text style={[vs.metricLabel, { color: theme.subtext }]}>Ocupação</Text>
          </View>
        </View>

        {/* Itinerário de Paradas da Rota */}
        {rota?.paradas && rota.paradas.length > 0 && (
          <View style={[vs.itinerarioCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <View style={vs.itinerarioHeader}>
              <Feather name="map" size={18} color={theme.gold} />
              <Text style={[vs.itinerarioTitle, { color: theme.text }]}>Itinerário & Paradas</Text>
            </View>
            {rota.paradas.map((parada, idx) => (
              <View key={parada.id || idx} style={vs.paradaItem}>
                <View style={{ alignItems: 'center' }}>
                  <View style={[vs.paradaDot, { backgroundColor: idx === 0 ? '#48BB78' : theme.gold }]} />
                  {idx < rota.paradas.length - 1 && <View style={[vs.paradaLine, { backgroundColor: theme.border }]} />}
                </View>
                <View style={{ flex: 1, paddingBottom: idx < rota.paradas.length - 1 ? 14 : 0 }}>
                  <Text style={[vs.paradaNome, { color: theme.text }]}>{parada.nome}</Text>
                  <Text style={[vs.paradaEndereco, { color: theme.subtext }]}>{parada.endereco}</Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Ação principal */}
        {!confirmouPresenca ? (
          <TouchableOpacity activeOpacity={0.9} onPress={handleConfirmar} disabled={confirmando} style={vs.ctaWrap}>
            <LinearGradient colors={['#F5A623', '#E08A00']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={vs.cta}>
              {confirmando ? (
                <ActivityIndicator color="#1A253A" />
              ) : (
                <>
                  <Feather name="check-circle" size={22} color="#1A253A" />
                  <Text style={vs.ctaText}>Confirmar minha presença</Text>
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity activeOpacity={0.8} onPress={handleCancelar} disabled={confirmando} style={[vs.cancelBtn, { borderColor: '#EF4444' }]}>
            {confirmando ? <ActivityIndicator color="#EF4444" /> : (
              <>
                <Feather name="x-circle" size={18} color="#EF4444" />
                <Text style={vs.cancelBtnText}>Cancelar minha confirmação</Text>
              </>
            )}
          </TouchableOpacity>
        )}

        {/* Passo a passo */}
        <View style={[vs.stepsCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Text style={[vs.stepsTitle, { color: theme.text }]}>Como funciona</Text>
          {passos.map((p, i) => (
            <View key={p.titulo} style={vs.stepRow}>
              <View style={{ alignItems: 'center' }}>
                <View style={[vs.stepCircle, { backgroundColor: p.ok ? '#48BB78' : theme.inputBg, borderColor: p.ok ? '#48BB78' : theme.border }]}>
                  {p.ok ? <Feather name="check" size={14} color="#FFF" /> : <Text style={[vs.stepNum, { color: theme.subtext }]}>{i + 1}</Text>}
                </View>
                {i < passos.length - 1 && <View style={[vs.stepLine, { backgroundColor: theme.border }]} />}
              </View>
              <View style={{ flex: 1, paddingBottom: i < passos.length - 1 ? 16 : 0 }}>
                <Text style={[vs.stepTitle, { color: theme.text }]}>{p.titulo}</Text>
                <Text style={[vs.stepDesc, { color: theme.subtext }]}>{p.desc}</Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const vs = StyleSheet.create({
  scroll: { padding: 20, paddingTop: Platform.OS === 'ios' ? 10 : 28, paddingBottom: 40 },
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 },
  roundBtn: { width: 42, height: 42, borderRadius: 21, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  topTitle: { fontSize: 17, fontWeight: '800' },
  topSub: { fontSize: 12, marginTop: 2, textTransform: 'capitalize' },
  hello: { fontSize: 26, fontWeight: '800' },
  helloSub: { fontSize: 14, marginTop: 4, marginBottom: 20 },

  ticket: { borderRadius: 28, borderWidth: 1, overflow: 'hidden', marginBottom: 16, elevation: 6, shadowColor: '#000', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.25, shadowRadius: 14 },
  ticketHead: { padding: 22 },
  ticketHeadRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 22 },
  statusPill: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: 'rgba(0,0,0,0.22)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  statusPillText: { color: '#FFF', fontSize: 11, fontWeight: '800', letterSpacing: 1 },
  tipoPill: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(255,255,255,0.22)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  tipoPillText: { color: '#FFF', fontSize: 12, fontWeight: '700' },
  seatRow: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  seatBadge: { width: 84, height: 84, borderRadius: 26, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  seatSmall: { color: 'rgba(255,255,255,0.8)', fontSize: 11, fontWeight: '700', letterSpacing: 1.5 },
  seatBig: { color: '#FFF', fontSize: 46, fontWeight: '900', lineHeight: 52 },
  seatQueue: { color: 'rgba(255,255,255,0.85)', fontSize: 12, fontWeight: '600' },

  notchRow: { flexDirection: 'row', alignItems: 'center', height: 24 },
  notch: { width: 24, height: 24, borderRadius: 12 },
  dashed: { flex: 1, borderTopWidth: 1.5, borderStyle: 'dashed', marginHorizontal: 6 },

  ticketBody: { padding: 22, paddingTop: 12 },
  routeLine: { flexDirection: 'row', gap: 14, alignItems: 'stretch' },
  routeDot: { width: 14, height: 14, borderRadius: 7, borderWidth: 3, backgroundColor: 'transparent' },
  routeBar: { width: 2, flex: 1, marginVertical: 4, minHeight: 26 },
  routeLabel: { fontSize: 10, fontWeight: '700', letterSpacing: 1 },
  routeValue: { fontSize: 15, fontWeight: '700', marginTop: 2 },
  timeBox: { alignItems: 'center', justifyContent: 'center', paddingHorizontal: 14, borderRadius: 16 },
  timeLabel: { fontSize: 9, fontWeight: '700', letterSpacing: 1 },
  timeValue: { fontSize: 22, fontWeight: '900', marginTop: 2 },

  metricsRow: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  metric: { flex: 1, borderRadius: 20, borderWidth: 1, padding: 16, alignItems: 'flex-start', gap: 6 },
  metricValue: { fontSize: 16, fontWeight: '800' },
  metricLabel: { fontSize: 11, fontWeight: '600' },
  progressTrack: { width: '100%', height: 5, borderRadius: 3, overflow: 'hidden' },
  progressBarFill: { height: '100%', backgroundColor: '#9F7AEA', borderRadius: 3 },

  ctaWrap: { marginBottom: 16, borderRadius: 22, elevation: 6, shadowColor: '#F5A623', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.35, shadowRadius: 12 },
  cta: { height: 60, borderRadius: 22, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 },
  ctaText: { color: '#1A253A', fontSize: 17, fontWeight: '800' },
  cancelBtn: { height: 54, borderRadius: 20, borderWidth: 1.5, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 16 },
  cancelBtnText: { color: '#EF4444', fontSize: 14, fontWeight: '700' },

  stepsCard: { borderRadius: 22, borderWidth: 1, padding: 20 },
  stepsTitle: { fontSize: 16, fontWeight: '800', marginBottom: 16 },

  itinerarioCard: { borderRadius: 22, borderWidth: 1, padding: 20, marginBottom: 16 },
  itinerarioHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 16 },
  itinerarioTitle: { fontSize: 16, fontWeight: '800' },
  paradaItem: { flexDirection: 'row', gap: 14 },
  paradaDot: { width: 14, height: 14, borderRadius: 7, marginTop: 3 },
  paradaLine: { width: 2, flex: 1, marginVertical: 3 },
  paradaNome: { fontSize: 14, fontWeight: '700' },
  paradaEndereco: { fontSize: 12, marginTop: 2 },
  stepRow: { flexDirection: 'row', gap: 14 },
  stepCircle: { width: 28, height: 28, borderRadius: 14, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
  stepNum: { fontSize: 12, fontWeight: '800' },
  stepLine: { width: 2, flex: 1, marginVertical: 2 },
  stepTitle: { fontSize: 14, fontWeight: '700' },
  stepDesc: { fontSize: 12, marginTop: 2 },
});


const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: Platform.OS === 'ios' ? 10 : 20, paddingBottom: 15, borderBottomWidth: 1, elevation: 5, zIndex: 100 },
  backBtn: { padding: 5 },
  titleContainer: { alignItems: 'center' },
  title: { fontSize: 16, fontWeight: 'bold' },
  plateBadge: { paddingHorizontal: 10, paddingVertical: 2, borderRadius: 5, marginTop: 4 },
  plateText: { color: '#1A253A', fontSize: 9, fontWeight: '900', letterSpacing: 0.5 },
  
  scrollContent: { padding: 20, alignItems: 'center' },
  driverScrollContent: { padding: 20, width: '100%' },
  
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 10, marginBottom: 20, width: '100%' },
  statBox: { flex: 1, borderRadius: 16, borderWidth: 1, padding: 12, alignItems: 'center', justifyContent: 'center', elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2 },
  statValue: { fontSize: 18, fontWeight: '800', marginTop: 6 },
  statLabel: { fontSize: 10, marginTop: 2, fontWeight: '600', textAlign: 'center' },
  
  routeDetailCard: { flexDirection: 'row', alignItems: 'center', padding: 14, borderRadius: 16, borderWidth: 1, marginBottom: 20, gap: 12, width: '100%' },
  routeDetailText: { flex: 1 },
  routeDetailLabel: { fontSize: 9, fontWeight: 'bold', textTransform: 'uppercase' },
  routeDetailValue: { fontSize: 14, fontWeight: 'bold', marginTop: 2 },
  
  searchBar: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, height: 48, borderRadius: 24, borderWidth: 1, marginBottom: 20, gap: 10, width: '100%' },
  searchInput: { flex: 1, fontSize: 14, padding: 0, height: '100%' },

  sectionTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 15, width: '100%', alignSelf: 'flex-start' },
  alunoCard: { flexDirection: 'row', alignItems: 'center', padding: 14, borderRadius: 16, borderWidth: 1, marginBottom: 10, width: '100%', elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2 },
  alunoAvatar: { width: 42, height: 42, borderRadius: 21, justifyContent: 'center', alignItems: 'center' },
  alunoInicial: { fontSize: 16, fontWeight: 'bold' },
  alunoInfo: { flex: 1, marginLeft: 12, marginRight: 8 },
  alunoNome: { fontSize: 14, fontWeight: 'bold' },
  alunoParada: { fontSize: 12, marginTop: 2 },
  presencaStatus: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  presencaText: { color: '#FFF', fontSize: 11, fontWeight: 'bold' },
  loadBtn: { height: 50, borderRadius: 25, justifyContent: 'center', alignItems: 'center', marginTop: 20, width: '100%' },
  loadBtnText: { color: '#1A253A', fontSize: 16, fontWeight: 'bold' },

  scrollContainer: { flex: 1 },
  busPanelScroll: { padding: 20, alignItems: 'center', flexGrow: 1 },
  
  driverSection: { width: '100%', borderRadius: 20, borderWidth: 1.5, borderStyle: 'dashed', marginBottom: 25, overflow: 'hidden' },
  frontGlass: { flexDirection: 'row', alignItems: 'center', padding: 15, gap: 15 },
  steeringWheel: { width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center', borderWidth: 1 },
  driverInfo: { flex: 1 },
  driverLabel: { fontSize: 8, fontWeight: 'bold', letterSpacing: 0.5 },
  driverName: { fontSize: 14, fontWeight: 'bold' },
  stairs: { height: 8, width: '35%', alignSelf: 'flex-end', borderTopLeftRadius: 10 },
  
  busFrame: { width: '100%', paddingVertical: 30, borderRadius: 40, borderWidth: 1.5, alignItems: 'center', minHeight: 600 },
  row: { flexDirection: 'row', justifyContent: 'center', width: '100%', marginBottom: 16 },
  seatPair: { flexDirection: 'row', gap: 10 }, 
  aisle: { width: 35 },
  
  seat: { borderRadius: 10, borderWidth: 1, justifyContent: 'center', alignItems: 'center', elevation: 2 },
  seatOccupied: { opacity: 0.3 },
  seatNum: { fontWeight: 'bold', marginTop: 3 },
  
  lastRowContainer: { width: '100%', marginTop: 5, paddingTop: 15 },
  lastRow: { flexDirection: 'row', justifyContent: 'center', gap: 6, width: '100%' },
  
  footer: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 24, borderTopWidth: 1, paddingBottom: Platform.OS === 'ios' ? 40 : 25, elevation: 20 },
  legendContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot: { width: 10, height: 10, borderRadius: 5 },
  legendText: { fontSize: 10, fontWeight: '600' },
  confirmBtn: { height: 54, borderRadius: 18, justifyContent: 'center', alignItems: 'center', elevation: 4 },
  confirmText: { fontSize: 16, fontWeight: 'bold' },

  // ====== NOVOS ESTILOS MODERNOS ======
  modernHeader: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingTop: Platform.OS === 'ios' ? 15 : 25, paddingBottom: 15, borderBottomWidth: 1, elevation: 5, zIndex: 100 },
  modernBackBtn: { padding: 5 },
  modernTitleBox: { flex: 1 },
  modernTitle: { fontSize: 22, fontWeight: 'bold' },
  modernSubtitle: { fontSize: 13, fontWeight: '600', marginTop: 2 },
  
  modernScroll: { flex: 1 },
  modernGrid: { padding: 20 },
  modernGridContainer: { gap: 12 },
  modernGridRow5: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', gap: 8 },
  
  modernSeatCard: { 
    flex: 1,
    aspectRatio: 0.9,
    borderRadius: 12, 
    borderWidth: 2, 
    justifyContent: 'center', 
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    paddingVertical: 8,
  },
  modernSeatNumber: { fontSize: 16, fontWeight: '800', marginTop: 4 },
  modernSeatStatus: { fontSize: 9, fontWeight: 'bold', marginTop: 2 },
  
  modernFooter: { 
    position: 'absolute', 
    bottom: 0, 
    left: 0, 
    right: 0, 
    padding: 20, 
    borderTopWidth: 1, 
    paddingBottom: Platform.OS === 'ios' ? 40 : 25, 
    elevation: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  modernSelectionInfo: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  modernSelectedBadge: { width: 50, height: 50, borderRadius: 25, justifyContent: 'center', alignItems: 'center' },
  modernSelectedLabel: { fontSize: 12, marginLeft: 12 },
  modernSelectedNumber: { fontSize: 20, fontWeight: '900', marginLeft: 12 },
  modernSelectHint: { fontSize: 14, textAlign: 'center', marginBottom: 15 },
  
  modernConfirmBtn: { 
    height: 56, 
    borderRadius: 28, 
    flexDirection: 'row',
    justifyContent: 'center', 
    alignItems: 'center', 
    elevation: 5,
    shadowColor: '#F5A623',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  modernConfirmText: { fontSize: 17, fontWeight: 'bold' },

  // ====== ESTILOS ÔNIBUS ORE 3 ======
  busHeader: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingTop: Platform.OS === 'ios' ? 15 : 20, paddingBottom: 12, borderBottomWidth: 1, elevation: 5 },
  busBackBtn: { padding: 5 },
  busHeaderInfo: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 12 },
  busPlate: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },
  busPlateText: { color: '#1A253A', fontSize: 14, fontWeight: '900' },
  busHeaderTitle: { fontSize: 16, fontWeight: 'bold' },
  busHeaderSub: { fontSize: 12, marginTop: 2 },
  busBadge: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 12 },
  busBadgeText: { fontSize: 12, fontWeight: 'bold' },
  
  busScroll: { flex: 1 },
  busContent: { padding: 16, alignItems: 'center', justifyContent: 'center' },
  
  busFront: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 16, borderRadius: 16, borderWidth: 2, borderStyle: 'dashed', marginBottom: 16, gap: 12 },
  driverText: { fontSize: 11, fontWeight: 'bold', letterSpacing: 1 },
  
  busBody: { paddingVertical: 20, paddingHorizontal: 16, borderRadius: 20, borderWidth: 2, marginBottom: 16 },
  busRowContainer: { flexDirection: 'row', justifyContent: 'center', marginBottom: 14 },
  busSeatPair: { flexDirection: 'row', gap: 10 },
  busAisle: { width: 50, justifyContent: 'center', alignItems: 'center' },
  rowLabel: { fontSize: 12, fontWeight: '600' },
  
  busSeatItem: { 
    width: 52, 
    height: 52, 
    borderRadius: 12, 
    borderWidth: 2, 
    justifyContent: 'center', 
    alignItems: 'center',
    elevation: 2,
  },
  seatLeftSide: { marginBottom: 8 },
  seatRightSide: { marginBottom: 8 },
  busSeatLabel: { fontSize: 14, fontWeight: 'bold', marginTop: 4 },
  
  busRear: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 14, borderRadius: 16, borderWidth: 2, gap: 10 },
  
  busLegend: { flexDirection: 'row', justifyContent: 'center', gap: 24, marginTop: 16, paddingTop: 16, borderTopWidth: 1, borderTopColor: '#37474F' },
  busLegendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  busLegendDot: { width: 14, height: 14, borderRadius: 7 },
  busLegendLabel: { fontSize: 12 },
  
  busFooter: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 20, borderTopWidth: 1, paddingBottom: Platform.OS === 'ios' ? 40 : 25, elevation: 20 },
  busSelectionInfo: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  busSelLabel: { fontSize: 12 },
  busSelNumber: { fontSize: 18, fontWeight: '800' },
  busSelHint: { fontSize: 14, textAlign: 'center', marginBottom: 15 },
  
  busConfirmBtn: { height: 54, borderRadius: 27, justifyContent: 'center', alignItems: 'center', elevation: 5 },
  busConfirmText: { fontSize: 16, fontWeight: 'bold' },

  // Novos estilos para aluno - Assento Automático
  assentoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 30,
  },
  assentoNumero: {
    fontSize: 48,
    fontWeight: 'bold',
    marginTop: 10,
  },
  ordemBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    gap: 8,
    alignSelf: 'center',
  },
  ordemBadgeText: {
    fontSize: 14,
    fontWeight: '600',
  },
  legendaCard: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    marginTop: 16,
  },
  legendaTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  legendaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 10,
  },
  legendaDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  legendaText: {
    fontSize: 13,
    flex: 1,
  },

  // Novos estilos premium para a tela de aluno
  headerPremium: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 10 : 25,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#37474F',
  },
  headerTitleContainer: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  headerBtn: {
    padding: 8,
  },

  seatCard: {
    borderRadius: 24,
    overflow: 'hidden',
    marginBottom: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  seatCardBar: {
    height: 4,
    width: '100%',
  },
  seatCardContent: {
    padding: 24,
    alignItems: 'center',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 8,
    marginBottom: 20,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
  },

  seatVisualContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  seatCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  seatNumber: {
    fontSize: 42,
    fontWeight: 'bold',
  },
  seatNumberPending: {
    fontSize: 42,
    fontWeight: 'bold',
    opacity: 0.5,
  },
  seatLabel: {
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 1,
    marginTop: 4,
  },

  queueContainer: {
    marginTop: 16,
  },
  queueBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 16,
    gap: 8,
  },
  queueText: {
    fontSize: 14,
    fontWeight: '600',
  },

  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16,
  },
  infoCard: {
    width: '47%',
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  infoCardIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  infoCardLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  infoCardValue: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  infoCardSub: {
    fontSize: 11,
    marginTop: 2,
  },
  progressBar: {
    width: '100%',
    height: 4,
    borderRadius: 2,
    marginTop: 8,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },

  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 20,
    marginBottom: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  ctaContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  ctaIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  ctaText: {},
  ctaTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  ctaSub: {
    fontSize: 12,
    opacity: 0.8,
    marginTop: 2,
  },

  cancelButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
    borderRadius: 16,
    borderWidth: 1.5,
    gap: 8,
    marginBottom: 16,
  },
  cancelText: {
    fontSize: 14,
    fontWeight: '600',
  },

  helpCard: {
    padding: 16,
    borderRadius: 16,
    marginBottom: 20,
  },
  helpHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  helpTitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  helpItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 10,
  },
  helpDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  helpText: {
    fontSize: 13,
    flex: 1,
  },
});