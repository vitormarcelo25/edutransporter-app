/**
 * v10.1.0 - Beta Release
 * EduTransporter
 * 
 * API Service - Camada de comunicação com backend
 * Usa dados mock quando USE_MOCK = true
 * Alterna automaticamente para API real em produção
 */

// ====== URL DO BACKEND ======
// No mesmo PC:            http://localhost:3000/api
// No celular (Expo Go):   http://SEU_IP:3000/api
// Pra descobrir seu IP:   rode 'ipconfig' e pegue o IPv4 do Wi-Fi
// Exemplo:                http://192.168.1.100:3000/api
const API_BASE_URL = 'http://localhost:3000/api';
const USE_MOCK = false;

export interface LoginResponse {
    success: boolean;
    token?: string;
    user?: {
        id: string;
        nome: string;
        email: string;
        role: 'motorista' | 'aluno';
    };
    message?: string;
}

export interface RegisterResponse {
    success: boolean;
    message?: string;
    userId?: string;
}

export interface ApiError {
    success: false;
    message: string;
}

type ApiResponse = LoginResponse | RegisterResponse | ApiError;

// Função utilitária pra fazer requests. Usa fetch nativo pra não precisar de axios
const apiRequest = async (endpoint: string, method: string, body?: object): Promise<ApiResponse> => {
    try {
        const options: RequestInit = {
            method,
            headers: {
                'Content-Type': 'application/json',
            },
        };

        if (body) {
            options.body = JSON.stringify(body);
        }

        const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
        const data = await response.json();

        if (!response.ok) {
            return { success: false, message: data.message || 'Erro na requisição' };
        }

        return data;
    } catch (error) {
        return { success: false, message: 'Erro de conexão com o servidor' };
    }
};

// FUNÇÕES MOCK (usadas quando USE_MOCK = true)
// Função fake de login por enquanto. Depois a gente liga na API de verdade!
const mockLogin = async (email: string, pass: string): Promise<LoginResponse> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({ success: true, token: '123', user: { id: '1', nome: 'Teste', email, role: 'aluno' as const } });
        }, 1000);
    });
};

// Função fake de registo
const mockRegister = async (data: object): Promise<RegisterResponse> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({ success: true, message: 'Conta criada com sucesso!', userId: '123' });
        }, 1000);
    });
};

// EXPORTADAS - alternam entre mock e real dependendo da config
export const login = async (email: string, pass: string): Promise<LoginResponse> => {
    if (USE_MOCK) {
        return mockLogin(email, pass);
    }
    return apiRequest('/auth/login', 'POST', { email, password: pass }) as Promise<LoginResponse>;
};

export const register = async (data: {
    nome: string;
    email: string;
    telefone: string;
    cidade: string;
    role: 'motorista' | 'aluno';
    escola?: string;
    matriculaEscolar?: string;
    matriculaVeiculo?: string;
    cartaConducao?: string;
    password: string;
}): Promise<RegisterResponse> => {
    if (USE_MOCK) {
        return mockRegister(data);
    }
    return apiRequest('/auth/register', 'POST', data) as Promise<RegisterResponse>;
};

// Mantido pra compatibilidade
export const fakeLogin = login;

// Tipos para Histórico
export interface Viagem {
  id: string;
  data: string;
  escola: string;
  horario: string;
  tipo: 'Ida' | 'Volta';
}

export interface HistoricoResponse {
  success: boolean;
  viagens?: Viagem[];
  message?: string;
}

// Mock de histórico
const mockGetHistorico = async (): Promise<HistoricoResponse> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        viagens: [
          { id: '1', data: '12/04/2026', escola: 'EE Prof. João Silva', horario: '07:30', tipo: 'Ida' },
          { id: '2', data: '12/04/2026', escola: 'EE Prof. João Silva', horario: '17:45', tipo: 'Volta' },
          { id: '3', data: '11/04/2026', escola: 'EE Prof. João Silva', horario: '07:15', tipo: 'Ida' },
          { id: '4', data: '11/04/2026', escola: 'EE Prof. João Silva', horario: '17:30', tipo: 'Volta' },
          { id: '5', data: '10/04/2026', escola: 'EE Prof. João Silva', horario: '07:20', tipo: 'Ida' },
          { id: '6', data: '10/04/2026', escola: 'EE Prof. João Silva', horario: '17:00', tipo: 'Volta' },
          { id: '7', data: '09/04/2026', escola: 'EE Prof. João Silva', horario: '07:10', tipo: 'Ida' },
          { id: '8', data: '09/04/2026', escola: 'EE Prof. João Silva', horario: '17:20', tipo: 'Volta' },
        ],
      });
    }, 500);
  });
};

// Função exportada - alterna entre mock e real
export const getHistorico = async (): Promise<HistoricoResponse> => {
  if (USE_MOCK) {
    return mockGetHistorico();
  }
  return apiRequest('/viagens/historico', 'GET') as Promise<HistoricoResponse>;
};

// Tipos para Avisos
export interface Aviso {
  id: string;
  tipo: 'urgente' | 'info' | 'sucesso';
  titulo: string;
  descricao: string;
  data: string;
  icon: string;
}

export interface AvisosResponse {
  success: boolean;
  avisos?: Aviso[];
  message?: string;
}

// Mock de avisos
const mockGetAvisos = async (): Promise<AvisosResponse> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        avisos: [
          { id: '1', tipo: 'urgente', titulo: 'Alteração de Rota', descricao: 'Devido a obras na Rua Principal, o ônibus hará um desvio pela Avenida das Flores hoje à tarde.', data: 'Hoje, 08:30', icon: 'warning' },
          { id: '2', tipo: 'info', titulo: 'Manutenção Preventiva', descricao: 'O veículo ORE 3 pasará por manutenção na próxima sexta-feira. Um veículo reserva será utilizado.', data: '24 Fev, 15:00', icon: 'settings' },
          { id: '3', tipo: 'sucesso', titulo: 'Nova Funcionalidade', descricao: 'Agora já pode consultar o histórico de presenças diretamente no seu perfil.', data: '22 Fev, 10:20', icon: 'notifications' },
        ],
      });
    }, 300);
  });
};

// Função exportada - alterna entre mock e real
export const getAvisos = async (): Promise<AvisosResponse> => {
  if (USE_MOCK) {
    return mockGetAvisos();
  }
  return apiRequest('/avisos', 'GET') as Promise<AvisosResponse>;
};

// ==========================================
// GPS E ROTA
// ==========================================

export interface GpsPosition {
  latitude: number;
  longitude: number;
  velocidade?: number;
  heading?: number;
  timestamp: number;
}

export interface RotaAluno {
  id: string;
  nome: string;
  escola: string;
  parada: string;
  presente: boolean;
}

export interface Parada {
  id: string;
  nome: string;
  endereco: string;
  latitude: number;
  longitude: number;
}

export interface RotaAgenda {
  id: string;
  data: string;
  nome: string;
  escola: string;
  horario: string;
  tipo: 'Ida' | 'Volta';
  status: 'agendada' | 'em_andamento' | 'encerrada';
  paradas: Parada[];
}

export interface Rota {
  id: string;
  nome: string;
  escola: string;
  horario: string;
  tipo: 'Ida' | 'Volta';
  alunos: RotaAluno[];
  status: 'agendada' | 'em_andamento' | 'encerrada';
  paradas: Parada[];
}

export interface GpsResponse {
  success: boolean;
  message?: string;
}

export interface RotaResponse {
  success: boolean;
  rota?: Rota;
  message?: string;
}

const PARADAS_MOCK: Parada[] = [
  { id: 'p1', nome: 'Rua das Flores, 45', endereco: 'Rua das Flores, 45 - São Paulo, SP', latitude: -23.5505, longitude: -46.6333 },
  { id: 'p2', nome: 'Av. Principal, 123', endereco: 'Av. Principal, 123 - São Paulo, SP', latitude: -23.5520, longitude: -46.6350 },
  { id: 'p3', nome: 'Rua Nova, 78', endereco: 'Rua Nova, 78 - São Paulo, SP', latitude: -23.5540, longitude: -46.6370 },
  { id: 'p4', nome: 'Rua Brasil, 32', endereco: 'Rua Brasil, 32 - São Paulo, SP', latitude: -23.5560, longitude: -46.6390 },
  { id: 'p5', nome: 'Escola Central', endereco: 'EE Prof. João Silva', latitude: -23.5580, longitude: -46.6410 },
];

// Mock de rota do dia
const mockGetRotaDoDia = async (): Promise<RotaResponse> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        rota: {
          id: '1',
          nome: 'Rota ORE 3',
          escola: 'EE Prof. João Silva',
          horario: '07:30',
          tipo: 'Ida',
          status: 'agendada',
          alunos: [
            { id: '1', nome: 'Gabriel Silva', escola: 'EEProf. João Silva', parada: 'Rua das Flores, 45', presente: false },
            { id: '2', nome: 'Maria Santos', escola: 'EEProf. João Silva', parada: 'Av. Principal, 123', presente: false },
            { id: '3', nome: 'Pedro Costa', escola: 'EEProf. João Silva', parada: 'Rua Nova, 78', presente: false },
            { id: '4', nome: 'Ana Oliveira', escola: 'EEProf. João Silva', parada: 'Rua Brasil, 32', presente: false },
            { id: '5', nome: 'Lucas Rodrigues', escola: 'EEProf. João Silva', parada: 'Av. Central, 90', presente: false },
          ],
          paradas: PARADAS_MOCK,
        },
      });
    }, 500);
  });
};

// Mock iniciar rota
const mockIniciarRota = async (rotaId: string): Promise<GpsResponse> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ success: true, message: 'Rota iniciada com sucesso!' });
    }, 500);
  });
};

// Mock encerrar rota
const mockEncerrarRota = async (rotaId: string): Promise<GpsResponse> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ success: true, message: 'Rota encerrada com sucesso!' });
    }, 500);
  });
};

// Mock atualizar GPS
const mockUpdateGps = async (data: { rotaId: string; position: GpsPosition }): Promise<GpsResponse> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ success: true });
    }, 200);
  });
};

// Funções exportadas
export const getRotaDoDia = async (): Promise<RotaResponse> => {
  if (USE_MOCK) return mockGetRotaDoDia();
  return apiRequest('/rotas/hoje', 'GET') as Promise<RotaResponse>;
};

export const iniciarRota = async (rotaId: string): Promise<GpsResponse> => {
  if (USE_MOCK) return mockIniciarRota(rotaId);
  return apiRequest('/rotas/iniciar', 'POST', { rotaId }) as Promise<GpsResponse>;
};

export const encerrarRota = async (rotaId: string): Promise<GpsResponse> => {
  if (USE_MOCK) return mockEncerrarRota(rotaId);
  return apiRequest('/rotas/encerrar', 'POST', { rotaId }) as Promise<GpsResponse>;
};

export const updateGpsPosition = async (data: { rotaId: string; position: GpsPosition }): Promise<GpsResponse> => {
  if (USE_MOCK) return mockUpdateGps(data);
  return apiRequest('/gps/update', 'POST', data) as Promise<GpsResponse>;
};

// ==========================================
// PRESENÇA
// ==========================================

export interface PresencaResponse {
  success: boolean;
  message?: string;
}

const mockMarcarPresenca = async (alunoId: string, presente: boolean): Promise<PresencaResponse> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ success: true, message: presente ? 'Presença confirmada!' : 'Aluno marcado como ausente' });
    }, 300);
  });
};

export const marcarPresenca = async (alunoId: string, presente: boolean): Promise<PresencaResponse> => {
  if (USE_MOCK) return mockMarcarPresenca(alunoId, presente);
  return apiRequest('/presenca/marcar', 'POST', { alunoId, presente }) as Promise<PresencaResponse>;
};

// ==========================================
// PERFIL
// ==========================================

export interface Usuario {
  id: string;
  nome: string;
  email: string;
  telefone: string;
  cidade: string;
  role: 'motorista' | 'aluno';
  escola?: string;
  foto?: string;
}

export interface PerfilResponse {
  success: boolean;
  usuario?: Usuario;
  message?: string;
}

export interface NotificacoesConfig {
  avisos: boolean;
  presenca: boolean;
  mensagens: boolean;
  rotas: boolean;
}

export interface PerfilUpdateResponse {
  success: boolean;
  message?: string;
}

const mockGetPerfil = async (): Promise<PerfilResponse> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        usuario: {
          id: '1',
          nome: 'Gabriel Silva',
          email: 'gabriel@email.com',
          telefone: '(11) 99999-9999',
          cidade: 'São Paulo',
          role: 'aluno',
          escola: 'EE Prof. João Silva',
        },
      });
    }, 300);
  });
};

const mockUpdatePerfil = async (data: Partial<Usuario>): Promise<PerfilUpdateResponse> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ success: true, message: 'Perfil atualizado com sucesso!' });
    }, 500);
  });
};

const mockUpdateNotificacoes = async (config: NotificacoesConfig): Promise<PerfilUpdateResponse> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ success: true, message: 'Notificações atualizadas!' });
    }, 300);
  });
};

const mockAlterarSenha = async (senhaAtual: string, novaSenha: string): Promise<PerfilUpdateResponse> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ success: true, message: 'Senha alterada com sucesso!' });
    }, 500);
  });
};

export const getPerfil = async (): Promise<PerfilResponse> => {
  if (USE_MOCK) return mockGetPerfil();
  return apiRequest('/usuarios/perfil', 'GET') as Promise<PerfilResponse>;
};

export const updatePerfil = async (data: Partial<Usuario>): Promise<PerfilUpdateResponse> => {
  if (USE_MOCK) return mockUpdatePerfil(data);
  return apiRequest('/usuarios/perfil', 'PUT', data) as Promise<PerfilUpdateResponse>;
};

export const updateNotificacoes = async (config: NotificacoesConfig): Promise<PerfilUpdateResponse> => {
  if (USE_MOCK) return mockUpdateNotificacoes(config);
  return apiRequest('/usuarios/notificacoes', 'PUT', config) as Promise<PerfilUpdateResponse>;
};

export const alterarSenha = async (senhaAtual: string, novaSenha: string): Promise<PerfilUpdateResponse> => {
  if (USE_MOCK) return mockAlterarSenha(senhaAtual, novaSenha);
  return apiRequest('/auth/alterar-senha', 'PUT', { senhaAtual, novaSenha }) as Promise<PerfilUpdateResponse>;
};

// ==========================================
// AGENDA DE ROTAS
// ==========================================

export interface AgendaResponse {
  success: boolean;
  rotas?: RotaAgenda[];
  message?: string;
}

const mockGetRotasAgenda = async (): Promise<AgendaResponse> => {
  return new Promise((resolve) => {
    const hoje = new Date();
    const rotas: RotaAgenda[] = [];
    
    for (let i = 0; i < 7; i++) {
      const data = new Date(hoje);
      data.setDate(hoje.getDate() + i);
      const dataStr = data.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
      const diaSemana = data.toLocaleDateString('pt-BR', { weekday: 'long' });
      
      rotas.push({
        id: `${i}-ida`,
        data: `${dataStr} - ${diaSemana.charAt(0).toUpperCase() + diaSemana.slice(1)}`,
        nome: 'Rota ORE 3',
        escola: 'EE Prof. João Silva',
        horario: '07:30',
        tipo: 'Ida',
        status: i === 0 ? 'agendada' : 'agendada',
        paradas: PARADAS_MOCK,
      });
      
      rotas.push({
        id: `${i}-volta`,
        data: `${dataStr} - ${diaSemana.charAt(0).toUpperCase() + diaSemana.slice(1)}`,
        nome: 'Rota ORE 3',
        escola: 'EE Prof. João Silva',
        horario: '17:45',
        tipo: 'Volta',
        status: i === 0 ? 'agendada' : 'agendada',
        paradas: PARADAS_MOCK,
      });
    }
    
    setTimeout(() => {
      resolve({ success: true, rotas });
    }, 500);
  });
};

export const getRotasAgenda = async (): Promise<AgendaResponse> => {
  if (USE_MOCK) return mockGetRotasAgenda();
  return apiRequest('/rotas/agenda', 'GET') as Promise<AgendaResponse>;
};

// ==========================================
// ADMIN - DASHBOARD
// ==========================================

export interface AdminStats {
  totalAlunos: number;
  totalMotoristas: number;
  totalRotasAtivas: number;
  totalAvisos: number;
}

export interface AdminDashboardResponse {
  success: boolean;
  stats?: AdminStats;
  message?: string;
}

const mockGetAdminDashboard = async (): Promise<AdminDashboardResponse> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        stats: {
          totalAlunos: 48,
          totalMotoristas: 5,
          totalRotasAtivas: 12,
          totalAvisos: 3,
        },
      });
    }, 300);
  });
};

export const getAdminDashboard = async (): Promise<AdminDashboardResponse> => {
  if (USE_MOCK) return mockGetAdminDashboard();
  return apiRequest('/admin/dashboard', 'GET') as Promise<AdminDashboardResponse>;
};

// ==========================================
// ADMIN - ROTAS
// ==========================================

export interface CreateRotaInput {
  nome: string;
  escola: string;
  horario: string;
  tipo: 'Ida' | 'Volta';
  diasSemana: string[];
  alunosIds: string[];
  motoristaId: string;
}

export interface AdminRotasResponse {
  success: boolean;
  rotas?: Rota[];
  message?: string;
}

const mockGetAdminRotas = async (): Promise<AdminRotasResponse> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        rotas: [
          {
            id: '1',
            nome: 'Rota ORE 3',
            escola: 'EE Prof. João Silva',
            horario: '07:30',
            tipo: 'Ida',
            status: 'agendada',
            paradas: PARADAS_MOCK,
            alunos: [],
          },
          {
            id: '2',
            nome: 'Rota ORE 3',
            escola: 'EE Prof. João Silva',
            horario: '17:45',
            tipo: 'Volta',
            status: 'agendada',
            paradas: PARADAS_MOCK,
            alunos: [],
          },
        ],
      });
    }, 300);
  });
};

const mockCreateRota = async (data: CreateRotaInput): Promise<ApiError> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ success: true, message: 'Rota criada com sucesso!' });
    }, 500);
  });
};

const mockDeleteRota = async (rotaId: string): Promise<ApiError> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ success: true, message: 'Rota excluída com sucesso!' });
    }, 300);
  });
};

export const getAdminRotas = async (): Promise<AdminRotasResponse> => {
  if (USE_MOCK) return mockGetAdminRotas();
  return apiRequest('/admin/rotas', 'GET') as Promise<AdminRotasResponse>;
};

export const createRota = async (data: CreateRotaInput): Promise<ApiError> => {
  if (USE_MOCK) return mockCreateRota(data);
  return apiRequest('/admin/rotas', 'POST', data) as Promise<ApiError>;
};

export const deleteRota = async (rotaId: string): Promise<ApiError> => {
  if (USE_MOCK) return mockDeleteRota(rotaId);
  return apiRequest(`/admin/rotas/${rotaId}`, 'DELETE') as Promise<ApiError>;
};

// ==========================================
// ADMIN - FERIADOS
// ==========================================

export interface Feriado {
  id: string;
  nome: string;
  data: string;
  motivo: string;
}

export interface FeriadosResponse {
  success: boolean;
  feriados?: Feriado[];
  message?: string;
}

const mockGetFeriados = async (): Promise<FeriadosResponse> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        feriados: [
          { id: '1', nome: 'Páscoa', data: '20/04/2026', motivo: 'Feriado religioso' },
          { id: '2', nome: 'Tiradentes', data: '21/04/2026', motivo: 'Feriado nacional' },
          { id: '3', nome: 'Dia do Trabalho', data: '01/05/2026', motivo: 'Feriado nacional' },
        ],
      });
    }, 300);
  });
};

const mockCreateFeriado = async (data: { nome: string; data: string; motivo: string }): Promise<ApiError> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ success: true, message: 'Feriado criado com sucesso!' });
    }, 500);
  });
};

const mockDeleteFeriado = async (feriadoId: string): Promise<ApiError> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ success: true, message: 'Feriado excluído com sucesso!' });
    }, 300);
  });
};

export const getFeriados = async (): Promise<FeriadosResponse> => {
  if (USE_MOCK) return mockGetFeriados();
  return apiRequest('/admin/feriados', 'GET') as Promise<FeriadosResponse>;
};

export const createFeriado = async (data: { nome: string; data: string; motivo: string }): Promise<ApiError> => {
  if (USE_MOCK) return mockCreateFeriado(data);
  return apiRequest('/admin/feriados', 'POST', data) as Promise<ApiError>;
};

export const deleteFeriado = async (feriadoId: string): Promise<ApiError> => {
  if (USE_MOCK) return mockDeleteFeriado(feriadoId);
  return apiRequest(`/admin/feriados/${feriadoId}`, 'DELETE') as Promise<ApiError>;
};

// ==========================================
// ADMIN - CONVITES
// ==========================================

export interface Convite {
  id: string;
  codigo: string;
  usado: boolean;
  criadoEm: string;
  expiraEm: string;
}

export interface ConvitesResponse {
  success: boolean;
  convites?: Convite[];
  message?: string;
}

const mockGetConvites = async (): Promise<ConvitesResponse> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        convites: [
          { id: '1', codigo: 'ADMIN-ABC123', usado: false, criadoEm: '13/04/2026', expiraEm: '14/04/2026' },
        ],
      });
    }, 300);
  });
};

const mockCreateConvite = async (): Promise<{ success: boolean; convite?: Convite; message?: string }> => {
  return new Promise((resolve) => {
    const codigo = 'ADMIN-' + Math.random().toString(36).substring(2, 8).toUpperCase();
    const agora = new Date();
    const amanha = new Date(agora);
    amanha.setDate(amanha.getDate() + 1);
    
    setTimeout(() => {
      resolve({
        success: true,
        convite: {
          id: Date.now().toString(),
          codigo,
          usado: false,
          criadoEm: agora.toLocaleDateString('pt-BR'),
          expiraEm: amanha.toLocaleDateString('pt-BR'),
        },
      });
    }, 500);
  });
};

export const getConvites = async (): Promise<ConvitesResponse> => {
  if (USE_MOCK) return mockGetConvites();
  return apiRequest('/admin/convites', 'GET') as Promise<ConvitesResponse>;
};

export const createConvite = async (): Promise<{ success: boolean; convite?: Convite; message?: string }> => {
  if (USE_MOCK) return mockCreateConvite();
  return apiRequest('/admin/convites', 'POST') as Promise<{ success: boolean; convite?: Convite; message?: string }>;
};
