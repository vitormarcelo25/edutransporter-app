import { Platform } from 'react-native';

const AUTH_TOKEN_KEY = 'auth_token_v2';
const USER_ROLE_KEY = 'user_role_v2';
const USER_DATA_KEY = 'user_data_v2';

// URL oficial do backend na nuvem e Supabase
export const SUPABASE_URL =
  process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://sdijocxwzzdoulgcxnic.supabase.co';
export const SUPABASE_ANON_KEY =
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_MOAD07HiYyyXZLbg5B43Mw_XX_1Bao-';

const PRODUCTION_API_URL = `${SUPABASE_URL}/rest/v1`;

const DEFAULT_API_URL = Platform.select({
  android: PRODUCTION_API_URL,
  ios: PRODUCTION_API_URL,
  default: PRODUCTION_API_URL,
});

export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL ||
  process.env.VITE_API_URL ||
  process.env.REACT_APP_API_URL ||
  process.env.API_URL ||
  DEFAULT_API_URL;

// Storage helper compatível com Web e Mobile
export const storageHelper = {
  async getItem(key: string): Promise<string | null> {
    try {
      if (Platform.OS === 'web') {
        if (typeof window !== 'undefined' && window.localStorage) {
          return window.localStorage.getItem(key);
        }
        return null;
      }
      const SecureStore = await import('expo-secure-store');
      return await SecureStore.getItemAsync(key);
    } catch {
      return null;
    }
  },

  async setItem(key: string, value: string): Promise<void> {
    try {
      if (Platform.OS === 'web') {
        if (typeof window !== 'undefined' && window.localStorage) {
          window.localStorage.setItem(key, value);
        }
        return;
      }
      const SecureStore = await import('expo-secure-store');
      await SecureStore.setItemAsync(key, value);
    } catch (e) {
      console.warn('Erro ao salvar no storage:', e);
    }
  },

  async removeItem(key: string): Promise<void> {
    try {
      if (Platform.OS === 'web') {
        if (typeof window !== 'undefined' && window.localStorage) {
          window.localStorage.removeItem(key);
        }
        return;
      }
      const SecureStore = await import('expo-secure-store');
      await SecureStore.deleteItemAsync(key);
    } catch (e) {
      console.warn('Erro ao remover do storage:', e);
    }
  },

  async clearAuth(): Promise<void> {
    await Promise.all([
      storageHelper.removeItem(AUTH_TOKEN_KEY),
      storageHelper.removeItem(USER_ROLE_KEY),
      storageHelper.removeItem(USER_DATA_KEY),
    ]);
  },
};

type UnauthorizedHandler = () => void;
let unauthorizedHandler: UnauthorizedHandler | null = null;

export const setOnUnauthorized = (handler: UnauthorizedHandler | null) => {
  unauthorizedHandler = handler;
};

export interface RequestOptions extends RequestInit {
  params?: Record<string, any>;
  timeout?: number;
}

export interface ApiResponse<T = any> {
  data: T;
  status: number;
  statusText: string;
  headers: Headers;
  ok: boolean;
}

/**
 * Cliente HTTP nativo (Fetch API) compatível 100% com Metro / React Native / Web
 * Injeta token Authorization Bearer e trata resposta 401 automaticamente.
 */
async function request<T = any>(endpoint: string, options: RequestOptions = {}): Promise<ApiResponse<T>> {
  const { params, timeout = 35000, headers = {}, ...customConfig } = options;

  let url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;

  if (params) {
    const searchParams = new URLSearchParams();
    Object.keys(params).forEach((key) => {
      const val = params[key];
      if (val !== undefined && val !== null) {
        searchParams.append(key, String(val));
      }
    });
    const queryString = searchParams.toString();
    if (queryString) {
      url += (url.includes('?') ? '&' : '?') + queryString;
    }
  }

  const token = await storageHelper.getItem(AUTH_TOKEN_KEY);

  const reqHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    ...(headers as Record<string, string>),
  };

  // Se a requisição for para o Supabase REST, injeta a apikey e o token
  if (url.includes('supabase.co')) {
    reqHeaders['apikey'] = SUPABASE_ANON_KEY;
    if (!reqHeaders['Authorization']) {
      reqHeaders['Authorization'] = `Bearer ${SUPABASE_ANON_KEY}`;
    }
  }

  if (token) {
    reqHeaders['Authorization'] = `Bearer ${token}`;
  }

  const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
  const timeoutId = controller ? setTimeout(() => controller.abort(), timeout) : null;

  try {
    const response = await fetch(url, {
      ...customConfig,
      headers: reqHeaders,
      signal: controller ? controller.signal : undefined,
    });

    if (timeoutId) clearTimeout(timeoutId);

    let data: any = null;
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      data = await response.json().catch(() => null);
    } else {
      const text = await response.text().catch(() => '');
      try {
        data = JSON.parse(text);
      } catch {
        data = text;
      }
    }

    // Só trata 401 como deslogamento se for especificamente em rota de validação de token
    if (response.status === 401 && url.includes('/auth/verify')) {
      console.warn('Token de sessão expirado. Limpando storage...');
      await storageHelper.clearAuth();
      if (unauthorizedHandler) {
        unauthorizedHandler();
      }
    }

    if (!response.ok) {
      const error: any = new Error(data?.message || data?.error || `Erro HTTP ${response.status}`);
      error.status = response.status;
      error.response = { data, status: response.status };
      throw error;
    }

    return {
      data,
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
      ok: response.ok,
    };
  } catch (err: any) {
    if (timeoutId) clearTimeout(timeoutId);
    throw err;
  }
}

export const apiClient = {
  get<T = any>(endpoint: string, options?: RequestOptions): Promise<ApiResponse<T>> {
    return request<T>(endpoint, { ...options, method: 'GET' });
  },
  post<T = any>(endpoint: string, body?: any, options?: RequestOptions): Promise<ApiResponse<T>> {
    return request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    });
  },
  put<T = any>(endpoint: string, body?: any, options?: RequestOptions): Promise<ApiResponse<T>> {
    return request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    });
  },
  patch<T = any>(endpoint: string, body?: any, options?: RequestOptions): Promise<ApiResponse<T>> {
    return request<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined,
    });
  },
  delete<T = any>(endpoint: string, options?: RequestOptions): Promise<ApiResponse<T>> {
    return request<T>(endpoint, { ...options, method: 'DELETE' });
  },
};

export function getApiErrorMessage(error: any, fallbackMessage = 'Ocorreu um erro na requisição'): string {
  if (error?.response?.data) {
    const data = error.response.data;
    if (typeof data === 'string' && data.trim()) return data;
    if (data.message) return data.message;
    if (data.error) return data.error;
  }
  if (error?.status === 401 || (error?.message && error.message.includes('401'))) {
    return 'CPF/E-mail ou senha incorretos.';
  }
  if (error?.status === 400 || (error?.message && error.message.includes('400'))) {
    return 'Dados informados inválidos. Verifique os campos.';
  }
  if (error?.name === 'AbortError') {
    return 'O tempo de resposta do servidor expirou. Tente novamente.';
  }
  if (error?.message && error.message.includes('Network request failed')) {
    return 'Não foi possível conectar ao servidor. Verifique sua conexão e se o backend está ativo.';
  }
  if (error?.status === 404) {
    return 'Recurso não encontrado no servidor (404).';
  }
  if (error?.status === 403) {
    return 'Acesso negado para esta operação (403).';
  }
  if (error?.status === 500) {
    return 'Erro interno do servidor backend (500).';
  }
  if (error?.message) {
    return error.message;
  }
  return fallbackMessage;
}
