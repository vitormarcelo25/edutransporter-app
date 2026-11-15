/**
 * v10.1.0 - Beta Release
 * EduTransporter
 *
 * AppContext - Estado global da aplicação
 * Gerencia: tema (dark/light), role do usuário, assento selecionado, auth
 * Disponibiliza useApp() para qualquer componente
 */

import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { Platform } from 'react-native';
import * as Location from 'expo-location';
import { Colors, getThemeForRole, ThemeColors } from '../constants/theme';
import { storageHelper, setOnUnauthorized } from '../services/client';
import { getRotaDoDia, updateGpsPosition } from '../services/api';

export type UserRole = 'aluno' | 'motorista' | 'admin';
export type AdminSection = 'dashboard' | 'rotas' | 'avisos' | 'feriados' | 'usuarios';

const AUTH_TOKEN_KEY = 'auth_token_v2';
const USER_ROLE_KEY = 'user_role_v2';
const USER_DATA_KEY = 'user_data_v2';

interface UserData {
  id: string;
  nome: string;
  email: string;
  role: UserRole;
  rotaNome?: string;
  escola?: string;
  cidade?: string;
  telefone?: string;
}

const AppContext = createContext({
  isDark: true,
  toggleTheme: () => {},
  theme: Colors.dark,
  userRole: 'aluno' as UserRole,
  setUserRole: (role: UserRole) => {},
  // Sistema de confirmação de presença (fila de assentos)
  confirmouPresenca: false,
  setConfirmouPresenca: (confirmou: boolean) => {},
  assentoAutomatico: null as number | null,
  setAssentoAutomatico: (assento: number | null) => {},
  ordemChegada: null as number | null,
  setOrdemChegada: (ordem: number | null) => {},
  // Sistema antigo removido: selectedSeat
  adminSection: 'dashboard' as AdminSection,
  setAdminSection: (section: AdminSection) => {},
  isAdmin: false,
  setAdminRole: () => {},
  // Persistência de auth
  authToken: null as string | null,
  userData: null as UserData | null,
  setAuth: (token: string, user: UserData, role: UserRole) => {},
  clearAuth: () => {},
  isLoadingAuth: true,
  // Rastreamento GPS global da viagem do motorista
  gpsTrackingActive: false,
  activeTripRotaId: null as string | null,
  lastGpsUpdate: null as number | null,
  gpsError: null as string | null,
  startTripGps: async (_rotaId: string): Promise<{ permissionGranted: boolean }> => ({ permissionGranted: false }),
  stopTripGps: () => {},
});

export const useApp = () => useContext(AppContext);

export const AppProvider = ({ children }: { children: React.ReactNode }) => {
  const [isDark, setIsDark] = useState(true);
  const [userRole, setUserRole] = useState<UserRole>('aluno');
  // Sistema de confirmação de presença (fila de assentos)
  const [confirmouPresenca, setConfirmouPresenca] = useState(false);
  const [assentoAutomatico, setAssentoAutomatico] = useState<number | null>(null);
  const [ordemChegada, setOrdemChegada] = useState<number | null>(null);
  // Sistema antigo removido: selectedSeat
  const [adminSection, setAdminSection] = useState<AdminSection>('dashboard');
  const [authToken, setAuthTokenState] = useState<string | null>(null);
  const [userData, setUserDataState] = useState<UserData | null>(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);

  const [gpsTrackingActive, setGpsTrackingActive] = useState(false);
  const [activeTripRotaId, setActiveTripRotaId] = useState<string | null>(null);
  const [lastGpsUpdate, setLastGpsUpdate] = useState<number | null>(null);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const gpsIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const activeRotaIdRef = useRef<string | null>(null);

  const isAdmin = userRole === 'admin';

  const getCurrentGpsCoords = async (): Promise<{ latitude: number; longitude: number } | null> => {
    if (Platform.OS === 'web' && typeof navigator !== 'undefined' && navigator.geolocation) {
      return new Promise((resolve) => {
        navigator.geolocation.getCurrentPosition(
          (pos) => resolve({ latitude: pos.coords.latitude, longitude: pos.coords.longitude }),
          () => resolve(null),
          { enableHighAccuracy: true, timeout: 8000 }
        );
      });
    }

    try {
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      return {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };
    } catch {
      return null;
    }
  };

  const enviarPontoGps = useCallback(async (rotaId: string) => {
    try {
      const coords = await getCurrentGpsCoords();
      if (!coords) {
        setGpsError('Aguardando sinal de GPS...');
        return;
      }
      const agora = Date.now();
      const res = await updateGpsPosition({
        rotaId,
        position: {
          latitude: coords.latitude,
          longitude: coords.longitude,
          timestamp: agora,
        },
      });
      if (res.success) {
        setLastGpsUpdate(agora);
        setGpsError(null);
      } else {
        setGpsError(res.message || 'Falha ao enviar posição GPS');
      }
    } catch {
      setGpsError('Erro ao capturar coordenadas do dispositivo');
    }
  }, []);

  const stopTripGps = useCallback(() => {
    if (gpsIntervalRef.current) {
      clearInterval(gpsIntervalRef.current);
      gpsIntervalRef.current = null;
    }
    activeRotaIdRef.current = null;
    setActiveTripRotaId(null);
    setGpsTrackingActive(false);
    setGpsError(null);
  }, []);

  const startTripGps = useCallback(async (rotaId: string): Promise<{ permissionGranted: boolean }> => {
    if (!rotaId) return { permissionGranted: false };

    let hasPermission = false;
    try {
      if (Platform.OS === 'web') {
        hasPermission = typeof navigator !== 'undefined' && Boolean(navigator.geolocation);
      } else {
        const { status } = await Location.requestForegroundPermissionsAsync();
        hasPermission = status === 'granted';
      }
    } catch {
      hasPermission = false;
    }

    if (gpsIntervalRef.current) {
      clearInterval(gpsIntervalRef.current);
      gpsIntervalRef.current = null;
    }

    activeRotaIdRef.current = rotaId;
    setActiveTripRotaId(rotaId);
    setGpsTrackingActive(true);
    setGpsError(hasPermission ? null : 'Permissão de localização pendente');

    enviarPontoGps(rotaId);

    gpsIntervalRef.current = setInterval(() => {
      if (activeRotaIdRef.current) {
        enviarPontoGps(activeRotaIdRef.current);
      }
    }, 5000);

    return { permissionGranted: hasPermission };
  }, [enviarPontoGps]);

  // Carrega auth persistido ao iniciar e registra interceptor de 401
  useEffect(() => {
    setOnUnauthorized(() => {
      stopTripGps();
      setAuthTokenState(null);
      setUserDataState(null);
      setUserRole('aluno');
    });

    (async () => {
      try {
        const token = await storageHelper.getItem(AUTH_TOKEN_KEY);
        const role = await storageHelper.getItem(USER_ROLE_KEY);
        const dataStr = await storageHelper.getItem(USER_DATA_KEY);

        if (token && role && dataStr) {
          setAuthTokenState(token);
          const parsedData = JSON.parse(dataStr);
          setUserDataState(parsedData);
          setUserRole(role as UserRole);
        }
      } catch (e) {
        console.error('Erro ao carregar auth:', e);
      } finally {
        setIsLoadingAuth(false);
      }
    })();

    return () => {
      stopTripGps();
      setOnUnauthorized(null);
    };
  }, [stopTripGps]);

  // Retoma GPS automaticamente caso motorista já tenha viagem em_andamento ao abrir/navegar
  useEffect(() => {
    if (isLoadingAuth || !authToken || userRole !== 'motorista') return;
    if (gpsTrackingActive && activeTripRotaId) return;

    let cancelled = false;
    getRotaDoDia()
      .then((res) => {
        if (!cancelled && res.success && res.rota?.status === 'em_andamento' && res.rota.id) {
          startTripGps(res.rota.id);
        }
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, [isLoadingAuth, authToken, userRole, gpsTrackingActive, activeTripRotaId, startTripGps]);

  const toggleTheme = () => {
    setIsDark((prev) => !prev);
  };

  const theme = getThemeForRole(userRole, isDark);

  const setAdminRole = () => {
    setUserRole('admin');
  };

  const setAuth = async (token: string, user: UserData, role: UserRole) => {
    setAuthTokenState(token);
    setUserDataState(user);
    setUserRole(role);
    try {
      await storageHelper.setItem(AUTH_TOKEN_KEY, token);
      await storageHelper.setItem(USER_ROLE_KEY, role);
      await storageHelper.setItem(USER_DATA_KEY, JSON.stringify(user));
    } catch (e) {
      console.error('Erro ao salvar auth:', e);
    }
  };

  const clearAuth = async () => {
    stopTripGps();
    setAuthTokenState(null);
    setUserDataState(null);
    setUserRole('aluno');
    try {
      await storageHelper.clearAuth();
    } catch (e) {
      console.error('Erro ao limpar auth:', e);
    }
  };

  return (
    <AppContext.Provider value={{
      isDark,
      toggleTheme,
      theme,
      userRole,
      setUserRole,
      confirmouPresenca,
      setConfirmouPresenca,
      assentoAutomatico,
      setAssentoAutomatico,
      ordemChegada,
      setOrdemChegada,
      adminSection,
      setAdminSection,
      isAdmin,
      setAdminRole,
      authToken,
      userData,
      setAuth,
      clearAuth,
      isLoadingAuth,
      gpsTrackingActive,
      activeTripRotaId,
      lastGpsUpdate,
      gpsError,
      startTripGps,
      stopTripGps,
    }}>
      {children}
    </AppContext.Provider>
  );
};
