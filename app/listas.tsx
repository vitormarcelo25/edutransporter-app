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
  Platform
} from 'react-native';
import { Feather, FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter, Stack } from 'expo-router';

import { useApp } from './_layout';
import { getRotaDoDia, Rota, RotaResponse, RotaAluno } from '@/services/api';

const { width } = Dimensions.get('window');

export default function Listas() {
  const router = useRouter();
  const { theme, isDark, userRole, userData, confirmouPresenca, assentoAutomatico, ordemChegada } = useApp();
  
  const [rota, setRota] = useState<Rota | null>(null);
  const [loading, setLoading] = useState(false);

  // Assentos ocupados (mock)
  const occupiedSeats = [2, 5, 8, 12, 15, 20, 24, 30, 31, 35, 40, 44, 52, 58, 63];
  const SEAT_SIZE = (width - 100) / 5;

  const loadRota = async () => {
    setLoading(true);
    const result: RotaResponse = await getRotaDoDia(userRole === 'aluno' ? userData?.id : undefined);
    setLoading(false);
    if (result.success && result.rota) {
      setRota(result.rota);
    }
  };

  useEffect(() => {
    loadRota();
  }, []);

// Se for motorista ou admin, mostrar lista de alunos (não o mapa de assentos)
  if (userRole !== 'aluno') {
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
          <TouchableOpacity onPress={loadRota} style={styles.backBtn}>
            <Feather name="refresh-cw" size={22} color={theme.gold} />
          </TouchableOpacity>
        </View>

        <FlatList
            data={rota?.alunos || []}
            keyExtractor={(item) => item.id}
            renderItem={({ item: aluno }) => (
              <View style={[styles.alunoCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
                <View style={[styles.alunoAvatar, { backgroundColor: theme.inputBg }]}>
                  <Text style={[styles.alunoInicial, { color: theme.gold }]}>
                    {aluno.nome.charAt(0)}
                  </Text>
                </View>
                <View style={styles.alunoInfo}>
                  <Text style={[styles.alunoNome, { color: theme.text }]}>{aluno.nome}</Text>
                  <Text style={[styles.alunoParada, { color: theme.subtext }]}>{aluno.parada}</Text>
                </View>
                <View style={[styles.presencaStatus, { backgroundColor: aluno.presente ? '#48BB78' : '#EF4444' }]}>
                  <Text style={styles.presencaText}>
                    {aluno.presente ? 'Presente' : 'Ausente'}
                  </Text>
                </View>
              </View>
            )}
            ListHeaderComponent={
              <View>
                <View style={[styles.infoCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
                  <View style={[styles.infoRow, { borderBottomColor: theme.border }]}>
                    <FontAwesome5 name="users" size={20} color={theme.gold} />
                    <Text style={[styles.infoLabel, { color: theme.subtext }]}>Total de Alunos</Text>
                    <Text style={[styles.infoValue, { color: theme.text }]}>{rota?.alunos.length || 0}</Text>
                  </View>
                  <View style={[styles.infoRow, { borderBottomColor: theme.border }]}>
                    <MaterialCommunityIcons name="checkbox-marked" size={20} color="#48BB78" />
                    <Text style={[styles.infoLabel, { color: theme.subtext }]}>Presentes</Text>
                    <Text style={[styles.infoValue, { color: '#48BB78' }]}>{rota?.alunos.filter(a => a.presente).length || 0}/40</Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Feather name="map-pin" size={20} color="#3182CE" />
                    <Text style={[styles.infoLabel, { color: theme.subtext }]}>Rota</Text>
                    <Text style={[styles.infoValue, { color: theme.text }]}>{rota?.nome || '-'}</Text>
                  </View>
                </View>
                <Text style={[styles.sectionTitle, { color: theme.text }]}>Lista de Alunos Presentes</Text>
              </View>
            }
            ListEmptyComponent={
              !rota ? (
                <TouchableOpacity style={[styles.loadBtn, { backgroundColor: theme.gold }]} onPress={loadRota}>
                  <Text style={styles.loadBtnText}>Carregar Lista</Text>
                </TouchableOpacity>
              ) : null
            }
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          />
      </SafeAreaView>
    );
  }

  // Para aluno - Mostrar apenas assento atribuído automaticamente
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]}>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar barStyle={theme.status as any} />

      <View style={[styles.headerPremium, { backgroundColor: theme.card }]}>
        <TouchableOpacity onPress={() => router.replace('/home')} style={styles.backBtn}>
          <Feather name="arrow-left" size={22} color={theme.text} />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={[styles.headerTitle, { color: theme.text }]}>Minha Viagem</Text>
          <Text style={[styles.headerSubtitle, { color: theme.subtext }]}>Hoje • HOJE</Text>
        </View>
        <TouchableOpacity style={styles.headerBtn}>
          <MaterialCommunityIcons name="bell-outline" size={22} color={theme.text} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Card Principal - Visual Premium */}
        <View style={[styles.seatCard, { backgroundColor: theme.card }]}>
          {/* Barra decorativa */}
          <View style={[styles.seatCardBar, { backgroundColor: confirmouPresenca ? '#48BB78' : theme.gold }]} />
          
          <View style={styles.seatCardContent}>
            {/* Status Badge */}
            <View style={[styles.statusBadge, { backgroundColor: confirmouPresenca ? 'rgba(72,187,120,0.15)' : 'rgba(245,166,35,0.15)' }]}>
              <View style={[styles.statusDot, { backgroundColor: confirmouPresenca ? '#48BB78' : theme.gold }]} />
              <Text style={[styles.statusText, { color: confirmouPresenca ? '#48BB78' : theme.gold }]}>
                {confirmouPresenca ? 'Viagem Confirmada' : 'Aguardando Confirmação'}
              </Text>
            </View>

            {/* Assento - Visual Grande e Impactante */}
            <View style={styles.seatVisualContainer}>
              {confirmouPresenca && assentoAutomatico ? (
                <>
                  <View style={[styles.seatCircle, { borderColor: theme.gold }]}>
                    <FontAwesome5 name="chair" size={48} color={theme.gold} />
                  </View>
                  <Text style={[styles.seatNumber, { color: theme.gold }]}>#{assentoAutomatico}</Text>
                  <Text style={[styles.seatLabel, { color: theme.subtext }]}>SEU ASSENTO</Text>
                </>
              ) : (
                <>
                  <View style={[styles.seatCircle, { borderColor: theme.subtext, opacity: 0.5 }]}>
                    <FontAwesome5 name="chair" size={48} color={theme.subtext} />
                  </View>
                  <Text style={[styles.seatNumberPending, { color: theme.subtext }]}>--</Text>
                  <Text style={[styles.seatLabel, { color: theme.subtext }]}>AGUARDANDO</Text>
                </>
              )}
            </View>

            {/* Ordem na fila */}
            {confirmouPresenca && ordemChegada && (
              <View style={styles.queueContainer}>
                <View style={[styles.queueBadge, { backgroundColor: 'rgba(245,166,35,0.15)' }]}>
                  <MaterialCommunityIcons name="run" size={16} color={theme.gold} />
                  <Text style={[styles.queueText, { color: theme.gold }]}>
                    {ordemChegada}º na fila de confirmação
                  </Text>
                </View>
              </View>
            )}
          </View>
        </View>

        {/* Cards de Informação - Grid 2x2 */}
        <View style={styles.infoGrid}>
          <View style={[styles.infoCard, { backgroundColor: theme.card }]}>
            <View style={[styles.infoCardIcon, { backgroundColor: 'rgba(72,187,120,0.15)' }]}>
              <MaterialCommunityIcons name="clock-outline" size={20} color="#48BB78" />
            </View>
            <Text style={[styles.infoCardLabel, { color: theme.subtext }]}>Saída</Text>
            <Text style={[styles.infoCardValue, { color: theme.text }]}>06:30</Text>
            <Text style={[styles.infoCardSub, { color: theme.subtext }]}>Manhã</Text>
          </View>

          <View style={[styles.infoCard, { backgroundColor: theme.card }]}>
            <View style={[styles.infoCardIcon, { backgroundColor: 'rgba(66,153,225,0.15)' }]}>
              <MaterialCommunityIcons name="school" size={20} color="#4299E1" />
            </View>
            <Text style={[styles.infoCardLabel, { color: theme.subtext }]}>Destino</Text>
            <Text style={[styles.infoCardValue, { color: theme.text }]}>{rota?.escola || '-'}</Text>
            <Text style={[styles.infoCardSub, { color: theme.subtext }]}>{rota?.tipo || '-'}</Text>
          </View>

          <View style={[styles.infoCard, { backgroundColor: theme.card }]}>
            <View style={[styles.infoCardIcon, { backgroundColor: 'rgba(245,166,35,0.15)' }]}>
              <FontAwesome5 name="bus-school" size={20} color={theme.gold} />
            </View>
            <Text style={[styles.infoCardLabel, { color: theme.subtext }]}>Horário</Text>
            <Text style={[styles.infoCardValue, { color: theme.text }]}>{rota?.horario || '--:--'}</Text>
            <Text style={[styles.infoCardSub, { color: theme.subtext }]}>{rota?.tipo || '-'}</Text>
          </View>

            <View style={[styles.infoCard, { backgroundColor: theme.card }]}>
              <View style={[styles.infoCardIcon, { backgroundColor: 'rgba(159,122,234,0.15)' }]}>
                <FontAwesome5 name="users" size={20} color="#9F7AEA" />
              </View>
              <Text style={[styles.infoCardLabel, { color: theme.subtext }]}>Ocupação</Text>
              <Text style={[styles.infoCardValue, { color: theme.text }]}>
                {rota?.alunos.filter((a: any) => a.presente).length || 0}/40
              </Text>
              <View style={[styles.progressBar, { backgroundColor: theme.inputBg }]}>
                <View style={[styles.progressFill, { width: `${(rota?.alunos.filter((a: any) => a.presente).length || 0) / 40 * 100}%`, backgroundColor: '#9F7AEA' }]} />
              </View>
            </View>
        </View>

        {/* Card de Ação - se não confirmou */}
        {!confirmouPresenca && (
          <TouchableOpacity 
            style={[styles.ctaButton, { backgroundColor: theme.gold }]}
            onPress={() => router.replace('/home')}
          >
            <View style={styles.ctaContent}>
              <View style={styles.ctaIcon}>
                <Feather name="check-circle" size={28} color="#1A253A" />
              </View>
              <View style={styles.ctaText}>
                <Text style={[styles.ctaTitle, { color: '#1A253A' }]}>Confirmar Presença</Text>
                <Text style={[styles.ctaSub, { color: '#1A253A' }]}>Toque para confirmar sua viagem</Text>
              </View>
            </View>
            <Feather name="chevron-right" size={24} color="#1A253A" />
          </TouchableOpacity>
        )}

        {/* Card de Cancelamento - se confirmou */}
        {confirmouPresenca && (
          <TouchableOpacity 
            style={[styles.cancelButton, { borderColor: '#EF4444' }]}
            onPress={() => router.replace('/home')}
          >
            <Feather name="x-circle" size={20} color="#EF4444" />
            <Text style={[styles.cancelText, { color: '#EF4444' }]}>Cancelar minha confirmação</Text>
          </TouchableOpacity>
        )}

        {/* Informações Adicionais */}
        <View style={[styles.helpCard, { backgroundColor: theme.card }]}>
          <View style={styles.helpHeader}>
            <MaterialCommunityIcons name="information" size={18} color={theme.gold} />
            <Text style={[styles.helpTitle, { color: theme.text }]}>Como funciona</Text>
          </View>
          <View style={styles.helpItem}>
            <View style={[styles.helpDot, { backgroundColor: '#48BB78' }]} />
            <Text style={[styles.helpText, { color: theme.subtext }]}>Confirme sua presença antes das 06:00</Text>
          </View>
          <View style={styles.helpItem}>
            <View style={[styles.helpDot, { backgroundColor: theme.gold }]} />
            <Text style={[styles.helpText, { color: theme.subtext }]}>O assento é definido automaticamente</Text>
          </View>
          <View style={styles.helpItem}>
            <View style={[styles.helpDot, { backgroundColor: '#4299E1' }]} />
            <Text style={[styles.helpText, { color: theme.subtext }]}>Primeiros a confirmar sentam mais à frente</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: Platform.OS === 'ios' ? 10 : 20, paddingBottom: 15, borderBottomWidth: 1, elevation: 5, zIndex: 100 },
  backBtn: { padding: 5 },
  titleContainer: { alignItems: 'center' },
  title: { fontSize: 16, fontWeight: 'bold' },
  plateBadge: { paddingHorizontal: 10, paddingVertical: 2, borderRadius: 5, marginTop: 4 },
  plateText: { color: '#1A253A', fontSize: 9, fontWeight: '900', letterSpacing: 0.5 },
  
  scrollContent: { padding: 20, alignItems: 'center' },
  infoCard: { borderRadius: 16, borderWidth: 1, marginBottom: 20, overflow: 'hidden' },
  infoRow: { flexDirection: 'row', alignItems: 'center', padding: 15, borderBottomWidth: 1 },
  infoLabel: { flex: 1, fontSize: 14, marginLeft: 10 },
  infoValue: { fontSize: 16, fontWeight: 'bold' },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 15 },
  alunoCard: { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 12, borderWidth: 1, marginBottom: 10 },
  alunoAvatar: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  alunoInicial: { fontSize: 16, fontWeight: 'bold' },
  alunoInfo: { flex: 1, marginLeft: 12 },
  alunoNome: { fontSize: 14, fontWeight: 'bold' },
  alunoParada: { fontSize: 12, marginTop: 2 },
  presencaStatus: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  presencaText: { color: '#FFF', fontSize: 11, fontWeight: 'bold' },
  loadBtn: { height: 50, borderRadius: 25, justifyContent: 'center', alignItems: 'center', marginTop: 20 },
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