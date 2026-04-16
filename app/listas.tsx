import React, { useState } from 'react';
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
  const { theme, isDark, selectedSeat, setSelectedSeat, userRole } = useApp();
  
  const [rota, setRota] = useState<Rota | null>(null);
  const [loading, setLoading] = useState(false);

  // Assentos ocupados (mock)
  const occupiedSeats = [2, 5, 8, 12, 15, 20, 24, 30, 31, 35, 40, 44, 52, 58, 63];
  const SEAT_SIZE = (width - 100) / 5;

  const loadRota = async () => {
    setLoading(true);
    const result: RotaResponse = await getRotaDoDia();
    setLoading(false);
    if (result.success && result.rota) {
      setRota(result.rota);
    }
  };

const handleSeatPress = (seatId: number) => {
    if (userRole !== 'aluno') return; // Apenas aluno escolhe lugar
    const isOccupied = occupiedSeats.includes(seatId);
    if (!isOccupied && setSelectedSeat) {
      setSelectedSeat(seatId);
    }
  };

  const renderSeat = (seatId: number) => {
    const isSelected = selectedSeat === seatId;
    const isOccupied = occupiedSeats.includes(seatId);
    const canChoose = userRole === 'aluno';

    // Para motorist ou admin, mostrar como ocupado
    const showAsOccupied = isOccupied || !canChoose;

    return (
      <TouchableOpacity 
        key={`seat-${seatId}`}
        disabled={!canChoose}
        onPress={() => handleSeatPress(seatId)}
        style={[
          styles.seat, 
          { 
            width: SEAT_SIZE,
            height: SEAT_SIZE,
            backgroundColor: isDark ? '#1E2A3E' : '#E2E8F0', 
            borderColor: theme.border 
          },
          showAsOccupied && styles.seatOccupied,
          isSelected && { backgroundColor: theme.gold, borderColor: theme.gold }
        ]}
      >
        <FontAwesome5 
          name="chair" 
          size={SEAT_SIZE * 0.4} 
          color={isSelected ? '#1A253A' : showAsOccupied ? '#64748B' : theme.subtext} 
        />
        <Text style={[
          styles.seatNum, 
          { color: isSelected ? '#1A253A' : theme.subtext, fontSize: SEAT_SIZE * 0.25 }
        ]}>
          {seatId}
        </Text>
      </TouchableOpacity>
    );
  };

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
                    <Text style={[styles.infoValue, { color: theme.text }]}>64</Text>
                  </View>
                  <View style={[styles.infoRow, { borderBottomColor: theme.border }]}>
                    <MaterialCommunityIcons name="checkbox-marked" size={20} color="#48BB78" />
                    <Text style={[styles.infoLabel, { color: theme.subtext }]}>Presentes Hoje</Text>
                    <Text style={[styles.infoValue, { color: '#48BB78' }]}>{occupiedSeats.length}</Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Feather name="map-pin" size={20} color="#3182CE" />
                    <Text style={[styles.infoLabel, { color: theme.subtext }]}>Rota</Text>
                    <Text style={[styles.infoValue, { color: theme.text }]}>ORE 3 - Ida</Text>
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

  // Para aluno - Layout estilo ônibus com fileiras
  const totalRows = 11;
  const seatsPerRow = 4; // 2 esquerda, 2 direita
  
  const renderBusSeat = (seatId: number, row: number, position: 'left-outer' | 'left-inner' | 'right-inner' | 'right-outer') => {
    const isSelected = selectedSeat === seatId;
    const isOccupied = occupiedSeats.includes(seatId);
    
    let bg = '#48BB78';
    let borderColor = '#2D7A4E';
    let textColor = '#FFF';
    let iconColor = '#FFF';
    
    if (isSelected) {
      bg = theme.gold;
      borderColor = '#D4920A';
      textColor = '#1A253A';
      iconColor = '#1A253A';
    } else if (isOccupied) {
      bg = '#6B7280';
      borderColor = '#4B5563';
      textColor = '#9CA3AF';
      iconColor = '#9CA3AF';
    }

    return (
      <TouchableOpacity
        key={`seat-${seatId}`}
        disabled={isOccupied || isSelected}
        onPress={() => handleSeatPress(seatId)}
        activeOpacity={0.7}
        style={{
          width: 65,
          height: 65,
          borderRadius: 12,
          backgroundColor: bg,
          borderWidth: 2,
          borderColor: borderColor,
          alignItems: 'center',
          justifyContent: 'center',
          marginHorizontal: 4,
          marginVertical: 6,
          elevation: 3,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.2,
          shadowRadius: 3,
        }}
      >
        <FontAwesome5 name="chair" size={20} color={iconColor} />
        <Text style={{
          fontSize: 14,
          fontWeight: 'bold',
          color: textColor,
          marginTop: 2,
        }}>
          {seatId}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderRow = (row: number) => {
    const leftOuter = row * 4 + 1;
    const leftInner = row * 4 + 2;
    const rightInner = row * 4 + 3;
    const rightOuter = row * 4 + 4;
    
    if (leftOuter > 44) return null;
    
    return (
      <View key={`row-${row}`} style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginBottom: 8 }}>
        {/* Lado esquerdo */}
        <View style={{ flexDirection: 'row' }}>
          {renderBusSeat(leftOuter, row, 'left-outer')}
          {leftInner <= 44 && renderBusSeat(leftInner, row, 'left-inner')}
        </View>
        
        {/* Corredor */}
        <View style={{ width: 30 }} />
        
        {/* Lado direito */}
        <View style={{ flexDirection: 'row' }}>
          {rightInner <= 44 && renderBusSeat(rightInner, row, 'right-inner')}
          {rightOuter <= 44 && renderBusSeat(rightOuter, row, 'right-outer')}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: '#1A253A' }]}>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar barStyle="light-content" />

      {/* Header estilo ônibus */}
      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: Platform.OS === 'ios' ? 15 : 25,
        paddingBottom: 15,
        backgroundColor: '#0F172A',
        borderBottomWidth: 1,
        borderBottomColor: '#334155',
      }}>
        <TouchableOpacity onPress={() => router.replace('/home')} style={{ padding: 5 }}>
          <Feather name="arrow-left" size={24} color="#FFF" />
        </TouchableOpacity>
        <View style={{ flex: 1, alignItems: 'center' }}>
          <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#FFF' }}>Escolha seu Lugar</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4, gap: 8 }}>
            <View style={{ backgroundColor: theme.gold, paddingHorizontal: 12, paddingVertical: 3, borderRadius: 8 }}>
              <Text style={{ color: '#1A253A', fontSize: 12, fontWeight: 'bold' }}>ORE 3</Text>
            </View>
            <Text style={{ color: '#48BB78', fontSize: 13 }}>{44 - occupiedSeats.length} vagas</Text>
          </View>
        </View>
        <View style={{ width: 34 }} />
      </View>

      {/* Representação visual do ônibus */}
      <View style={{ flex: 1, paddingTop: 20, paddingHorizontal: 10 }}>
        {/* Parte da frente (motorista) */}
        <View style={{ alignItems: 'center', marginBottom: 15 }}>
          <View style={{ 
            width: 100, 
            height: 35, 
            backgroundColor: '#334155', 
            borderTopLeftRadius: 15, 
            borderTopRightRadius: 15,
            justifyContent: 'center',
            alignItems: 'center',
            borderWidth: 2,
            borderBottomWidth: 0,
            borderColor: '#475569'
          }}>
            <Text style={{ color: '#94A3B8', fontSize: 10, fontWeight: 'bold', letterSpacing: 1 }}>MOTORISTA</Text>
          </View>
        </View>

        {/* Fileiras de assentos */}
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 180 }}>
          {Array.from({ length: totalRows }).map((_, i) => renderRow(i))}
        </ScrollView>
      </View>

      {/* Footer com seleção */}
      <View style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: 20,
        backgroundColor: '#0F172A',
        borderTopWidth: 1,
        borderTopColor: '#334155',
        paddingBottom: Platform.OS === 'ios' ? 40 : 25,
      }}>
        {selectedSeat ? (
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 15 }}>
            <View style={{ width: 50, height: 50, borderRadius: 25, backgroundColor: '#48BB7833', justifyContent: 'center', alignItems: 'center' }}>
              <FontAwesome5 name="check" size={24} color="#48BB78" />
            </View>
            <View style={{ marginLeft: 12 }}>
              <Text style={{ fontSize: 12, color: '#94A3B8' }}>Assento selecionado</Text>
              <Text style={{ fontSize: 24, fontWeight: 'bold', color: theme.gold }}>#{selectedSeat}</Text>
            </View>
          </View>
        ) : (
          <Text style={{ textAlign: 'center', color: '#94A3B8', marginBottom: 15 }}>
            Toque em um assento verde para selecionar
          </Text>
        )}
        
        <TouchableOpacity 
          style={{
            height: 56,
            borderRadius: 28,
            backgroundColor: selectedSeat ? theme.gold : '#334155',
            justifyContent: 'center',
            alignItems: 'center',
          }}
          disabled={!selectedSeat}
          onPress={() => router.replace('/home')}
        >
          <Text style={{
            fontSize: 17,
            fontWeight: 'bold',
            color: selectedSeat ? '#1A253A' : '#64748B',
          }}>
            {selectedSeat ? `Confirmar Assento #${selectedSeat}` : 'Selecione um lugar'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

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
  busConfirmText: { fontSize: 16, fontWeight: 'bold' }
});