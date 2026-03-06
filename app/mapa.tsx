import React from 'react';
import { 
  StyleSheet, Text, View, TouchableOpacity, 
  SafeAreaView, StatusBar 
} from 'react-native';
import { Feather, FontAwesome5 } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';

export default function Mapa() {
  const router = useRouter();

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="dark-content" backgroundColor="#E8EAED" />

        {/* 1. FUNDO DO MAPA (Estilo Google Maps Limpo) */}
        {/* Na versão final com internet, substituirias esta View pelo <MapView> do react-native-maps */}
        <View style={styles.mapContainer}>
          
          {/* Ruas Falsas (Apenas para efeito visual de mapa) */}
          <View style={styles.roadHorizontal} />
          <View style={styles.roadVertical} />
          <View style={styles.roadDiagonal} />
          
          {/* Rota traçada a azul (Caminho do Autocarro) */}
          <View style={styles.routeLine} />

          {/* Marcador do Destino (Escola) - Vermelho */}
          <View style={styles.schoolMarker}>
            <FontAwesome5 name="map-marker-alt" size={16} color="#EA4335" />
          </View>
          <Text style={styles.schoolLabel}>Escola Central</Text>

          {/* Marcador do Autocarro (Posição Atual) - Azul */}
          <View style={styles.busMarker}>
            <FontAwesome5 name="bus" size={14} color="#FFF" />
          </View>
          
        </View>

        {/* 2. BOTÃO VOLTAR FLUTUANTE */}
        {/* Usamos router.replace('/') para garantir que volta à Home sem falhas */}
        <TouchableOpacity style={styles.backButton} onPress={() => router.replace('/')}>
          <Feather name="arrow-left" size={24} color="#333" />
        </TouchableOpacity>

        {/* 3. CARTÃO DE INFORMAÇÃO INFERIOR (Muito mais limpo) */}
        <View style={styles.bottomCard}>
          <View style={styles.dragHandle} />
          
          <View style={styles.cardHeader}>
            <Text style={styles.statusTitle}>A caminho do destino</Text>
            <Text style={styles.etaText}>12 min</Text>
          </View>
          
          <Text style={styles.destinationText}>Escola Estadual Central</Text>
          <Text style={styles.distanceText}>2.4 km • Chegada prevista às 07:45</Text>

          {/* Usamos router.replace('/') para garantir que volta à Home sem falhas */}
          <TouchableOpacity style={styles.primaryButton} onPress={() => router.replace('/')}>
            <Text style={styles.primaryButtonText}>Fechar Navegação</Text>
          </TouchableOpacity>
        </View>

      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  safeArea: { 
    flex: 1, 
    backgroundColor: '#E8EAED' 
  },
  
  // --- ESTILOS DO MAPA SIMULADO ---
  mapContainer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#E8EAED', // Cor base de mapa limpo
    overflow: 'hidden',
  },
  roadHorizontal: {
    position: 'absolute',
    top: '40%',
    width: '100%',
    height: 18,
    backgroundColor: '#FFF',
  },
  roadVertical: {
    position: 'absolute',
    left: '30%',
    width: 18,
    height: '100%',
    backgroundColor: '#FFF',
  },
  roadDiagonal: {
    position: 'absolute',
    top: '40%',
    left: '30%',
    width: '100%',
    height: 18,
    backgroundColor: '#FFF',
    transform: [{ rotate: '-25deg' }],
    transformOrigin: 'top left',
  },
  routeLine: {
    position: 'absolute',
    top: '25%',
    left: '30%',
    width: 150,
    height: '15%',
    borderLeftWidth: 6,
    borderBottomWidth: 6,
    borderColor: '#4285F4', // Azul estilo Google Maps
    borderBottomLeftRadius: 16,
  },
  busMarker: {
    position: 'absolute',
    top: '22%',
    left: '27%',
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#4285F4',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#FFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  schoolMarker: {
    position: 'absolute',
    top: '36%',
    left: '60%',
    alignItems: 'center',
  },
  schoolLabel: {
    position: 'absolute',
    top: '41%',
    left: '55%',
    fontSize: 12,
    fontWeight: 'bold',
    color: '#333',
    backgroundColor: 'rgba(255,255,255,0.8)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },

  // --- OVERLAYS (Botão e Cartão) ---
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    elevation: 4,
  },
  
  bottomCard: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingTop: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 10,
  },
  dragHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#E0E0E0',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 20,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 8,
  },
  statusTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#38b29c', // Verde do projeto
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  etaText: {
    fontSize: 24,
    fontWeight: '900',
    color: '#28A745',
  },
  destinationText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  distanceText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 24,
  },
  primaryButton: {
    backgroundColor: '#F4F7F6',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
});