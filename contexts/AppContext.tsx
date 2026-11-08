/**
 * v10.1.0 - Beta Release
 * EduTransporter
 *
 * AppContext - Estado global da aplicação
 * Gerencia: tema (dark/light), role do usuário, assento selecionado, auth
 * Disponibiliza useApp() para qualquer componente
 */

import React, { createContext, useContext, useEffect, useState } from 'react';
import * as SecureStore from 'expo-secure-store';
import { Colors } from '../constants/theme';
import { storageHelper, setOnUnauthorized } from '../services/client';

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

  const isAdmin = userRole === 'admin';

  // Carrega auth persistido ao iniciar e registra interceptor de 401
  useEffect(() => {
    setOnUnauthorized(() => {
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
      setOnUnauthorized(null);
    };
  }, []);

  const toggleTheme = () => {
    setIsDark((prev) => !prev);
  };

  const theme = isDark ? Colors.dark : Colors.light;

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
    }}>
      {children}
    </AppContext.Provider>
  );
};
