import React from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TouchableOpacity, 
  SafeAreaView, 
  ScrollView, 
  StatusBar,
  Dimensions,
  Platform
} from 'react-native';
import { Feather, FontAwesome5 } from '@expo/vector-icons';
import { useRouter, Stack } from 'expo-router';

// Puxando o contexto global certinho! No VS Code roda liso.
import { useApp } from './_layout';

const { width } = Dimensions.get('window');

export default function Listas() {
  const router = useRouter();
  
  // Pegando as variáveis do nosso estado global lá do _layout.tsx
  // Assim, a escolha feita aqui espelha-se na Home e no resto do app.
  const { theme, isDark, selectedSeat, setSelectedSeat } = useApp();
  
  // Fingindo que essa galera já marcou esses lugares
  const occupiedSeats = [2, 5, 8, 12, 15, 20, 24, 30, 31, 35, 40, 44, 52, 58, 63];

  // O nosso busão ORE 3 tem 15 filas no meio
  const totalRows = 15;
  
  // Calculando o tamanho de cada banco pra tela não cortar no celular
  const SEAT_SIZE = (width - 100) / 5; 

  const renderSeat = (seatId: number) => {
    // Checa se o lugar é o meu ou se já tem gente
    const isSelected = selectedSeat === seatId;
    const isOccupied = occupiedSeats.includes(seatId);

    return (
      <TouchableOpacity 
        key={`seat-${seatId}`}
        disabled={isOccupied} // Trava o clique se já tiver ocupado
        onPress={() => setSelectedSeat && setSelectedSeat(seatId)} // Salva a escolha pra tela Home ver!
        style={[
          styles.seat, 
          { 
            width: SEAT_SIZE,
            height: SEAT_SIZE,
            backgroundColor: isDark ? '#1E2A3E' : '#E2E8F0', 
            borderColor: theme.border 
          },
          isOccupied && styles.seatOccupied,
          isSelected && { backgroundColor: theme.gold, borderColor: theme.gold }
        ]}
      >
        <FontAwesome5 
          name="chair" 
          size={SEAT_SIZE * 0.4} 
          color={isSelected ? '#1A253A' : isOccupied ? '#64748B' : theme.subtext} 
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

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]}>
      {/* Escondendo a barra feia de navegação padrão */}
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar barStyle={theme.status as any} />

      {/* Cabeçalho */}
      <View style={[styles.header, { borderBottomColor: theme.border, backgroundColor: theme.card }]}>
        <TouchableOpacity onPress={() => router.replace('/home')} style={styles.backBtn}>
          <Feather name="arrow-left" size={24} color={theme.text} />
        </TouchableOpacity>
        <View style={styles.titleContainer}>
          <Text style={[styles.title, { color: theme.text }]}>Mapa de Assentos</Text>
          <View style={[styles.plateBadge, { backgroundColor: theme.gold }]}>
            <Text style={styles.plateText}>ORE 3 • ESCOLAR</Text>
          </View>
        </View>
        <View style={{ width: 40 }} />
      </View>

      {/* ScrollView pra gente conseguir rolar o ônibus até o fundo */}
      <ScrollView 
        style={styles.scrollContainer}
        contentContainerStyle={styles.busScroll} 
        showsVerticalScrollIndicator={false}
      >
        
        {/* Cabine do motorista */}
        <View style={[styles.driverSection, { borderColor: theme.border, backgroundColor: theme.card }]}>
          <View style={styles.frontGlass}>
            <View style={[styles.steeringWheel, { backgroundColor: isDark ? '#121A2F' : '#F1F5F9', borderColor: theme.border }]}>
              <FontAwesome5 name="dharmachakra" size={24} color={theme.gold} />
            </View>
            <View style={styles.driverInfo}>
              <Text style={[styles.driverLabel, { color: theme.subtext }]}>MOTORISTA RESPONSÁVEL</Text>
              <Text style={[styles.driverName, { color: theme.text }]}>Carlos Oliveira</Text>
            </View>
          </View>
          <View style={[styles.stairs, { backgroundColor: theme.border }]} />
        </View>

        {/* Corpo do ônibus */}
        <View style={[styles.busFrame, { backgroundColor: isDark ? 'rgba(255,255,255,0.02)' : '#F1F5F9', borderColor: theme.border }]}>
          
          {/* Loop pra não ter que escrever as 15 fileiras na mão */}
          {Array.from({ length: totalRows }).map((_, rowIndex) => (
            <View key={`row-${rowIndex}`} style={styles.row}>
              <View style={styles.seatPair}>
                {renderSeat(rowIndex * 4 + 1)}
                {renderSeat(rowIndex * 4 + 2)}
              </View>
              
              <View style={styles.aisle} />

              <View style={styles.seatPair}>
                {renderSeat(rowIndex * 4 + 3)}
                {renderSeat(rowIndex * 4 + 4)}
              </View>
            </View>
          ))}

          {/* Bancão do fundo com 5 lugares */}
          <View style={styles.lastRowContainer}>
             <View style={styles.lastRow}>
               {renderSeat(61)}
               {renderSeat(62)}
               {renderSeat(63)}
               {renderSeat(64)}
               {renderSeat(65)}
             </View>
          </View>
        </View>

        {/* Espaço morto no final pra barra debaixo não tapar as últimas cadeiras */}
        <View style={{ height: 280 }} />
      </ScrollView>

      {/* Barra fixa de confirmar embaixo */}
      <View style={[styles.footer, { backgroundColor: theme.card, borderTopColor: theme.border }]}>
        <View style={styles.legendContainer}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#475569' }]} />
            <Text style={[styles.legendText, { color: theme.subtext }]}>Ocupado</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: theme.gold }]} />
            <Text style={[styles.legendText, { color: theme.subtext }]}>Meu Lugar</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: isDark ? '#1E2A3E' : '#E2E8F0' }]} />
            <Text style={[styles.legendText, { color: theme.subtext }]}>Livre</Text>
          </View>
        </View>

        <TouchableOpacity 
          style={[
            styles.confirmBtn, 
            { backgroundColor: selectedSeat ? theme.gold : theme.border }
          ]}
          disabled={!selectedSeat}
          onPress={() => router.replace('/home')}
        >
          <Text style={[styles.confirmText, { color: selectedSeat ? '#1A253A' : theme.subtext }]}>
            {selectedSeat ? `Confirmar Lugar ${selectedSeat}` : 'Escolha um lugar'}
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
  
  scrollContainer: { flex: 1 },
  busScroll: { padding: 20, alignItems: 'center', flexGrow: 1 },
  
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
  
  seat: { borderRadius: 10, borderWidth: 1, justifyContent: 'center', alignItems: 'center', elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 1 },
  seatOccupied: { opacity: 0.3 },
  seatNum: { fontWeight: 'bold', marginTop: 3 },
  
  lastRowContainer: { width: '100%', marginTop: 5, paddingTop: 15 },
  lastRow: { flexDirection: 'row', justifyContent: 'center', gap: 6, width: '100%' },
  
  footer: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 24, borderTopWidth: 1, paddingBottom: Platform.OS === 'ios' ? 40 : 25, elevation: 20, zIndex: 100, shadowColor: '#000', shadowOffset: { width: 0, height: -3 }, shadowOpacity: 0.1, shadowRadius: 5 },
  legendContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot: { width: 10, height: 10, borderRadius: 5 },
  legendText: { fontSize: 10, fontWeight: '600' },
  confirmBtn: { height: 54, borderRadius: 18, justifyContent: 'center', alignItems: 'center', elevation: 4 },
  confirmText: { fontSize: 16, fontWeight: 'bold' }
});