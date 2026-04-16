/**
 * v1.0 - O Retorno
 * Vitor Santana no código
 * 
 * Mapa - Visualização de rota em tempo real
 * Mapa simulado com marcadores (escola, onibus, paradas)
 * Geofencing para notificar proximidade
 */

import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, SafeAreaView, Platform, ActivityIndicator } from 'react-native';
import { Feather, FontAwesome5 } from '@expo/vector-icons';
import { Stack } from 'expo-router';
import { useApp } from '../_layout';
import { getRotaDoDia, Rota } from '@/services/api';
import { useGeofencing } from '@/hooks/useGeofencing';

const ESCOLA_COORD = { latitude: -23.5560, longitude: -46.6390 };

const INITIAL_REGION = {
  latitude: -23.5505,
  longitude: -46.6333,
  latitudeDelta: 0.02,
  longitudeDelta: 0.02,
};

export default function Mapa() {
  const { theme, userRole } = useApp();
  const mapRef = useRef<any>(null);
  const [loading, setLoading] = useState(true);
  const [rota, setRota] = useState<Rota | null>(null);
  
  const {
    currentLocation,
    nearestParada,
    distanceToParada,
    isWithinGeofence,
    hasPermission,
    error: geoError,
    refresh: refreshGeo,
  } = useGeofencing(rota?.paradas || [], userRole === 'aluno');

  useEffect(() => {
    initMaps();
  }, []);

  const initMaps = async () => {
    setLoading(true);
    try {
      const result = await getRotaDoDia();
      if (result.success && result.rota) {
        setRota(result.rota);
      }
    } catch (error) {
      console.log('Erro ao carregar rota');
    }
    setLoading(false);
  };

  const handleRefresh = async () => {
    await initMaps();
    await refreshGeo();
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.bg }]}>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.gold} />
          <Text style={[styles.loadingText, { color: theme.subtext }]}>Carregando mapa...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const formatDistance = (meters: number | null): string => {
    if (meters === null) return '--';
    if (meters < 1000) return `${Math.round(meters)}m`;
    return `${(meters / 1000).toFixed(1)}km`;
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.bg }]}>
      <Stack.Screen options={{ headerShown: false }} />
      
      {/* Mapa Simulado */}
      <View style={[styles.mapContainer, { backgroundColor: theme.inputBg }]}>
        {/* Ruas */}
        <View style={[styles.roadH, { backgroundColor: theme.card }]} />
        <View style={[styles.roadV, { backgroundColor: theme.card }]} />
        
        {/* Rota */}
        <View style={[styles.routeLine, { borderColor: theme.gold }]} />
        
        {/* Escola */}
        <View style={[styles.schoolMarker, { backgroundColor: theme.gold }]}>
          <FontAwesome5 name="school" size={14} color="#1A253A" />
        </View>
        <Text style={[styles.schoolLabel, { backgroundColor: theme.gold, color: '#1A253A' }]}>Escola Central</Text>
        
        {/* Ônibus */}
        <View style={[styles.busMarker, { backgroundColor: theme.gold }]}>
          <FontAwesome5 name="bus" size={12} color="#1A253A" />
        </View>
      </View>

      {/* Botão Atualizar Localização */}
      <TouchableOpacity 
        style={[styles.recenterBtn, { backgroundColor: theme.card, borderColor: theme.border }]} 
        onPress={handleRefresh}
      >
        <Feather name="refresh-cw" size={20} color={theme.gold} />
      </TouchableOpacity>

      {/* Alerta de geofence */}
      {isWithinGeofence && (
        <View style={[styles.geofenceAlert, { backgroundColor: '#48BB78' }]}>
          <Feather name="bell" size={16} color="#FFF" />
          <Text style={styles.geofenceAlertText}>
            {nearestParada?.nome.includes('Escola') ? 'Chegou na Escola!' : 'Ônibus se aproximando!'}
          </Text>
        </View>
      )}

      {/* Card Inferior */}
      <View style={[styles.bottomCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
        <View style={styles.cardHeader}>
          <View>
            <Text style={[styles.statusTitle, { color: theme.gold }]}>
              {userRole === 'aluno' ? 'Ônibus a caminho' : 'Rota em andamento'}
            </Text>
            {nearestParada ? (
              <Text style={[styles.etaText, { color: theme.text }]}>
                {formatDistance(distanceToParada)}
              </Text>
            ) : (
              <Text style={[styles.etaText, { color: theme.text }]}>12 min</Text>
            )}
          </View>
          <View style={[styles.badge, { backgroundColor: theme.inputBg }]}>
            <Feather name="navigation" size={14} color={theme.gold} />
            <Text style={[styles.badgeText, { color: theme.gold }]}>
              {nearestParada ? nearestParada.nome : '2.4 km'}
            </Text>
          </View>
        </View>
        
        <View style={styles.routeInfo}>
          <View style={styles.routePoint}>
            <View style={[styles.routeDot, { backgroundColor: theme.gold }]} />
            <Text style={[styles.routeLabel, { color: theme.subtext }]}>
              {rota?.paradas[0]?.nome || 'Rua das Flores'}
            </Text>
          </View>
          <View style={styles.routeLineV} />
          <View style={styles.routePoint}>
            <View style={[styles.routeDot, { backgroundColor: theme.darkBlue }]} />
            <Text style={[styles.routeLabel, { color: theme.text }]}>Escola Central</Text>
          </View>
        </View>

        <Text style={[styles.arrivalText, { color: theme.subtext }]}>
          Chegada prevista às {rota?.horario || '07:45'}
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  mapContainer: { ...StyleSheet.absoluteFillObject },
  roadH: { position: 'absolute', top: '40%', width: '100%', height: 20 },
  roadV: { position: 'absolute', left: '30%', width: 20, height: '100%' },
  routeLine: { position: 'absolute', top: '25%', left: '30%', width: 150, height: '20%', borderLeftWidth: 4, borderBottomWidth: 4, borderBottomLeftRadius: 10 },
  schoolMarker: { position: 'absolute', top: '35%', left: '60%', width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  schoolLabel: { position: 'absolute', top: '40%', left: '52%', fontSize: 10, fontWeight: 'bold', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  busMarker: { position: 'absolute', top: '22%', left: '27%', width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { fontSize: 16, marginTop: 10 },
  recenterBtn: { position: 'absolute', top: Platform.OS === 'ios' ? 50 : 30, right: 20, width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center', borderWidth: 1, elevation: 4 },
  bottomCard: { position: 'absolute', bottom: 100, left: 15, right: 15, borderRadius: 24, padding: 20, borderWidth: 1, elevation: 10 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  statusTitle: { fontSize: 12, fontWeight: '600', textTransform: 'uppercase' },
  etaText: { fontSize: 28, fontWeight: '900', marginTop: 2 },
  badge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16 },
  badgeText: { fontSize: 13, fontWeight: 'bold', marginLeft: 6 },
  routeInfo: { flexDirection: 'row', alignItems: 'center', marginTop: 15 },
  routePoint: { alignItems: 'center' },
  routeDot: { width: 10, height: 10, borderRadius: 5 },
  routeLabel: { fontSize: 11, marginTop: 4 },
  routeLineV: { width: 2, height: 25, marginHorizontal: 4 },
  arrivalText: { fontSize: 13, marginTop: 15, textAlign: 'center' },
  geofenceAlert: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 40,
    left: 20,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    elevation: 4,
  },
  geofenceAlertText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 8,
  },
});