/**
 * v10.1.0 - Beta Release
 * EduTransporter
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
import { getRotaDoDia, getGpsPosition, Rota } from '@/services/api';
import { useGeofencing } from '@/hooks/useGeofencing';
import MapViewComponent from '../../components/MapViewComponent';

const INITIAL_REGION = {
  latitude: -23.5505,
  longitude: -46.6333,
  latitudeDelta: 0.02,
  longitudeDelta: 0.02,
};

const darkMapStyle = [
  { elementType: 'geometry', stylers: [{ color: '#1A253A' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#8F9CAE' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#1A253A' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#1F2C42' }] },
  { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#F5A623' }, { lightness: -40 }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#0F172A' }] },
];

export default function Mapa() {
  const { theme, userRole, isDark } = useApp();
  const mapRef = useRef<any>(null);
  const [loading, setLoading] = useState(true);
  const [rota, setRota] = useState<Rota | null>(null);
  const [hasCentered, setHasCentered] = useState(false);
  const [busLocation, setBusLocation] = useState<any>(null);

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

  useEffect(() => {
    if (!rota || !rota.paradas.length) return;

    setBusLocation({
      latitude: rota.paradas[0].latitude,
      longitude: rota.paradas[0].longitude
    });

    const checkRealGps = async () => {
      try {
        const res = await getGpsPosition(rota.id);
        if (res.success && res.position) {
          setBusLocation(res.position);
          return true;
        }
      } catch (err) {
        console.log('Erro ao buscar GPS real:', err);
      }
      return false;
    };

    checkRealGps();

    let currentIndex = 0;
    const interval = setInterval(async () => {
      const hasRealGps = await checkRealGps();
      if (!hasRealGps) {
        currentIndex = (currentIndex + 1) % rota.paradas.length;
        const nextStop = rota.paradas[currentIndex];
        setBusLocation({
          latitude: nextStop.latitude,
          longitude: nextStop.longitude
        });
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [rota]);

  useEffect(() => {
    if (currentLocation && !hasCentered && mapRef.current) {
      mapRef.current.animateToRegion?.({
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      }, 1000);
      setHasCentered(true);
    }
  }, [currentLocation, hasCentered]);

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

  const recenterMap = () => {
    if (mapRef.current && typeof mapRef.current.animateToRegion === 'function') {
      if (currentLocation) {
        mapRef.current.animateToRegion({
          latitude: currentLocation.coords.latitude,
          longitude: currentLocation.coords.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }, 1000);
      } else if (rota && rota.paradas.length > 0) {
        mapRef.current.animateToRegion({
          latitude: rota.paradas[0].latitude,
          longitude: rota.paradas[0].longitude,
          latitudeDelta: 0.015,
          longitudeDelta: 0.015,
        }, 1000);
      } else {
        mapRef.current.animateToRegion(INITIAL_REGION, 1000);
      }
    }
  };

  const handleRefresh = async () => {
    await initMaps();
    await refreshGeo();
    recenterMap();
  };

  const formatDistance = (meters: number | null): string => {
    if (meters === null) return '--';
    if (meters < 1000) return `${Math.round(meters)}m`;
    return `${(meters / 1000).toFixed(1)}km`;
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

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.bg }]}>
      <Stack.Screen options={{ headerShown: false }} />

      <MapViewComponent
        mapRef={mapRef}
        theme={theme}
        isDark={isDark}
        hasPermission={hasPermission}
        rota={rota}
        busLocation={busLocation}
        INITIAL_REGION={INITIAL_REGION}
        darkMapStyle={darkMapStyle}
      />

      <TouchableOpacity
        style={[styles.recenterBtn, { backgroundColor: theme.card, borderColor: theme.border }]}
        onPress={handleRefresh}
      >
        <Feather name="refresh-cw" size={20} color={theme.gold} />
      </TouchableOpacity>

      {isWithinGeofence && (
        <View style={[styles.geofenceAlert, { backgroundColor: '#48BB78' }]}>
          <Feather name="bell" size={16} color="#FFF" />
          <Text style={styles.geofenceAlertText}>
            {nearestParada?.nome.includes('Escola') ? 'Chegou na Escola!' : 'Onibus se aproximando!'}
          </Text>
        </View>
      )}

      <View style={[styles.bottomCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
        <View style={styles.cardHeader}>
          <View>
            <Text style={[styles.statusTitle, { color: theme.gold }]}>
              {userRole === 'aluno' ? 'Onibus a caminho' : 'Rota em andamento'}
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
          Chegada prevista as {rota?.horario || '07:45'}
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { fontSize: 16, marginTop: 10 },
  recenterBtn: { position: 'absolute', top: Platform.OS === 'ios' ? 50 : 30, right: 20, width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center', borderWidth: 1, elevation: 4, zIndex: 10 },
  bottomCard: { position: 'absolute', bottom: 100, left: 15, right: 15, borderRadius: 24, padding: 20, borderWidth: 1, elevation: 10, zIndex: 10 },
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
    position: 'absolute', top: Platform.OS === 'ios' ? 60 : 40, left: 20, right: 20,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingVertical: 12, paddingHorizontal: 20, borderRadius: 12, elevation: 4, zIndex: 20,
  },
  geofenceAlertText: { color: '#FFF', fontSize: 14, fontWeight: 'bold', marginLeft: 8 },
});
