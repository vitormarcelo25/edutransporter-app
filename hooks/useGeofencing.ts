/**
 * v10.1.0 - Beta Release
 * EduTransporter
 * 
 * Hook de Geofencing - Detecta proximidade de paradas
 * Fórmula de Haversine para calcular distância GPS
 * Notifica quando ônibus entra no raio (200m)
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import * as Location from 'expo-location';
import * as Notifications from 'expo-notifications';
import { Parada } from '../services/api';

const GEOFENCE_RADIUS_METERS = 200;
const CHECK_INTERVAL_MS = 30000;

const haversineDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371e3;
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
};

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export const useGeofencing = (paradas: Parada[], enabled: boolean = true) => {
  const [currentLocation, setCurrentLocation] = useState<Location.LocationObject | null>(null);
  const [nearestParada, setNearestParada] = useState<Parada | null>(null);
  const [distanceToParada, setDistanceToParada] = useState<number | null>(null);
  const [isWithinGeofence, setIsWithinGeofence] = useState(false);
  const [hasPermission, setHasPermission] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const notifiedParadasRef = useRef<Set<string>>(new Set());

  const requestPermission = useCallback(async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    const permitted = status === 'granted';
    setHasPermission(permitted);
    
    if (!permitted) {
      setError('Permissão de localização negada');
    }
    
    return permitted;
  }, []);

  const sendNotification = useCallback(async (parada: Parada, type: 'parada' | 'escola') => {
    const title = type === 'escola' 
      ? 'Chegou na Escola!' 
      : 'Ônibus se aproximando!';
    
    const body = type === 'escola'
      ? `Você chegou na ${parada.nome}`
      : `O ônibus está a ${Math.round(distanceToParada || 0)}m de ${parada.nome}`;
    
    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        sound: true,
      },
      trigger: null,
    });
  }, [distanceToParada]);

  const checkDistance = useCallback(async () => {
    if (!paradas.length || !hasPermission) return;

    try {
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      
      setCurrentLocation(location);

      let minDistance = Infinity;
      let closest: Parada | null = null;
      let isInside = false;

      for (const parada of paradas) {
        const distance = haversineDistance(
          location.coords.latitude,
          location.coords.longitude,
          parada.latitude,
          parada.longitude
        );

        if (distance < minDistance) {
          minDistance = distance;
          closest = parada;
        }

        if (distance < GEOFENCE_RADIUS_METERS) {
          isInside = true;
          
          if (!notifiedParadasRef.current.has(parada.id)) {
            const isEscola = parada.nome.toLowerCase().includes('escola');
            await sendNotification(parada, isEscola ? 'escola' : 'parada');
            notifiedParadasRef.current.add(parada.id);
          }
        }
      }

      setDistanceToParada(minDistance);
      setNearestParada(closest);
      setIsWithinGeofence(isInside);
      setError(null);
    } catch (err) {
      setError('Erro ao obter localização');
    }
  }, [paradas, hasPermission, sendNotification]);

  useEffect(() => {
    if (!enabled || !paradas.length) return;

    const init = async () => {
      const permitted = await requestPermission();
      if (permitted) {
        await checkDistance();
        
        intervalRef.current = setInterval(checkDistance, CHECK_INTERVAL_MS);
      }
    };

    init();

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [enabled, paradas, requestPermission, checkDistance]);

  const refresh = useCallback(async () => {
    notifiedParadasRef.current.clear();
    await checkDistance();
  }, [checkDistance]);

  return {
    currentLocation,
    nearestParada,
    distanceToParada,
    isWithinGeofence,
    hasPermission,
    error,
    refresh,
    requestPermission,
  };
};