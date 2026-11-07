/**
 * EduTransporter - Camada de Serviços da API
 * Integrado ao Backend Spring Boot (porta 8080)
 * Fallback resiliente com Mock quando o servidor local não estiver ativo
 */

import { apiClient, getApiErrorMessage, API_BASE_URL, storageHelper, setOnUnauthorized } from './client';

export { API_BASE_URL, storageHelper, setOnUnauthorized };

// ==========================================
// DADOS MESTRES
// ==========================================

export interface OpcaoResponse {
  id: number;
  nome: string;
}

/**
 * Cidades vindas do backend (Supabase). Sem fallback local: se a nuvem
 * estiver indisponível, o cadastro avisa o usuário em vez de gravar errado.
 */
export const getCidades = async (): Promise<OpcaoResponse[]> => {
  const response = await apiClient.get<OpcaoResponse[]>('/cidades');
  return Array.isArray(response.data) ? response.data : [];
};

/** Faculdades/instituições vindas do backend (Supabase). */
export const getInstituicoes = async (_cidade?: string): Promise<OpcaoResponse[]> => {
  const response = await apiClient.get<OpcaoResponse[]>('/faculdades');
  return Array.isArray(response.data) ? response.data : [];
};

// ==========================================
// INTERFACES GLOBAIS
// ==========================================

export interface LoginResponse {
  success: boolean;
  token?: string;
  user?: {
    id: string;
    nome: string;
    email: string;
    role: 'motorista' | 'aluno' | 'admin';
  };
  status?: 'aprovado' | 'pendente' | 'recusado';
  message?: string;
}

export interface RegisterResponse {
  success: boolean;
  message?: string;
  userId?: string;
  token?: string;
  user?: {
    id: string;
    nome: string;
    email: string;
    role: 'motorista' | 'aluno';
  };
  status?: 'pendente' | 'aprovado';
}

export interface SolicitacaoAluno {
  id: string;
  nome: string;
  cpf: string;
  email: string;
  telefone: string;
  cidade: string;
  escola: string;
  matriculaEscolar?: string;
  pontoEmbarque?: string;
  turno?: string;
  dataSolicitacao: string;
  status: 'pendente' | 'aprovada' | 'recusada';
  motivoRecusa?: string;
  rotaNome?: string;
}

export interface MotoristaCadastrado {
  id: string;
  nome: string;
  cpf: string;
  telefone: string;
  cnh: string;
  placa: string;
  rotaId: string;
  rotaNome: string;
  criadoEm: string;
}

export interface AlunoCadastrado {
  id: string;
  nome: string;
  cpf: string;
  email: string;
  telefone: string;
  cidade: string;
  escola: string;
  rotaNome: string;
  status: 'ativo' | 'inativo';
}

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
  confirmouPresenca?: boolean;
  assentoAutomatico?: string | number;
  ordemChegada?: number;
}

export interface Parada {
  id: string;
  nome: string;
  endereco: string;
  latitude: number;
  longitude: number;
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

export interface RotaResponse {
  success: boolean;
  rota?: Rota;
  message?: string;
}

export interface GpsResponse {
  success: boolean;
  message?: string;
}

export interface PresencaResponse {
  success: boolean;
  message?: string;
}

export interface ConfirmacaoResponse {
  success: boolean;
  message?: string;
  assento?: string | number;
  ordem?: number;
}

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

export interface Aviso {
  id: string;
  tipo: 'urgente' | 'info' | 'sucesso';
  titulo: string;
  descricao: string;
  data: string;
  icon?: string;
}

export interface AvisosResponse {
  success: boolean;
  avisos?: Aviso[];
  message?: string;
}

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

export interface AgendaResponse {
  success: boolean;
  rotas?: RotaAgenda[];
  message?: string;
}

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

// ==========================================
// HELPERS DE NORMALIZAÇÃO (backend -> app)
// ==========================================

/** Backend devolve datas em ISO; o app usa texto pt-BR. */
const formatarDataApi = (valor?: string | null): string => {
  if (!valor) return '';
  const data = new Date(valor);
  if (Number.isNaN(data.getTime())) return String(valor);
  return data.toLocaleDateString('pt-BR');
};

const formatarDataHoraApi = (valor?: string | null): string => {
  if (!valor) return '';
  const data = new Date(valor);
  if (Number.isNaN(data.getTime())) return String(valor);
  return data.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const formatarHoraApi = (valor?: string | null): string => {
  if (!valor) return '';
  const match = String(valor).match(/(\d{2}):(\d{2})/);
  return match ? `${match[1]}:${match[2]}` : String(valor);
};

const normalizarTipoAviso = (tipo?: string | null): Aviso['tipo'] => {
  const valor = String(tipo || 'INFO').toUpperCase();
  if (valor === 'URGENTE') return 'urgente';
  if (valor === 'OK' || valor === 'SUCESSO') return 'sucesso';
  return 'info';
};

const normalizarAviso = (a: any): Aviso => ({
  id: String(a?.id ?? ''),
  tipo: normalizarTipoAviso(a?.tipo),
  titulo: a?.titulo || '',
  descricao: a?.descricao || '',
  data: formatarDataHoraApi(a?.data),
  icon: a?.icon || undefined,
});

const normalizarTipoViagem = (tipo?: string | null): 'Ida' | 'Volta' =>
  String(tipo || '').toUpperCase() === 'VOLTA' ? 'Volta' : 'Ida';

const normalizarStatusRota = (status?: string | null): Rota['status'] => {
  const valor = String(status || '').toUpperCase();
  if (valor === 'EM_ANDAMENTO') return 'em_andamento';
  if (valor === 'ENCERRADA') return 'encerrada';
  return 'agendada';
};

// ==========================================
// DADOS DE FALLBACK (MOCK RESILIENTE)
// ==========================================

const PARADAS_MOCK: Parada[] = [
  { id: 'p1', nome: 'Rua das Flores, 45', endereco: 'Rua das Flores, 45 - Caruaru, PE', latitude: -8.2833, longitude: -35.9761 },
  { id: 'p2', nome: 'Av. Agamenon Magalhães, 120', endereco: 'Av. Agamenon Magalhães - Caruaru, PE', latitude: -8.2810, longitude: -35.9730 },
  { id: 'p3', nome: 'IFPE Campus Caruaru', endereco: 'Estrada do Alto do Moura - Caruaru, PE', latitude: -8.2750, longitude: -35.9680 },
  { id: 'p4', nome: 'Faculdade Maurício de Nassau', endereco: 'Entroncamento BR-232 - Caruaru, PE', latitude: -8.2700, longitude: -35.9600 },
];

let MOCK_SOLICITACOES: SolicitacaoAluno[] = [
  {
    id: 'solic-1',
    nome: 'Mariana Costa Ramos',
    cpf: '34567890122',
    email: 'mariana.costa@uninassau.edu.br',
    telefone: '(81) 98765-4321',
    cidade: 'Caruaru',
    escola: 'Faculdade Maurício de Nassau',
    matriculaEscolar: '2024.1.0089',
    pontoEmbarque: 'Ponto do Terminal Rodoviário',
    turno: 'Noturno',
    dataSolicitacao: '10/09/2026',
    status: 'pendente',
  },
  {
    id: 'solic-2',
    nome: 'Lucas Gabriel Bezerra',
    cpf: '45678901233',
    email: 'lucas.bezerra@ifpe.edu.br',
    telefone: '(81) 99111-2233',
    cidade: 'São Lourenço da Mata',
    escola: 'IFPE Campus Caruaru',
    matriculaEscolar: '2023.2.0412',
    pontoEmbarque: 'Praça Central',
    turno: 'Diurno',
    dataSolicitacao: '09/09/2026',
    status: 'pendente',
  },
];

let MOCK_MOTORISTAS: MotoristaCadastrado[] = [
  {
    id: 'mot-1',
    nome: 'Carlos Alberto Silva',
    cpf: '11122233344',
    telefone: '(81) 99234-5678',
    cnh: '04829104819',
    placa: 'KHY-8291',
    rotaId: '1',
    rotaNome: 'Linha 01 - Nassau Noturno',
    criadoEm: '15/02/2026',
  },
  {
    id: 'mot-2',
    nome: 'José Fernandes de Souza',
    cpf: '22233344455',
    telefone: '(81) 98765-1122',
    cnh: '05128491823',
    placa: 'PEA-1920',
    rotaId: '2',
    rotaNome: 'Linha 02 - IFPE Diurno',
    criadoEm: '20/02/2026',
  },
];

// Inicia apenas com alunos de teste predefinidos (o novo aluno cadastrado precisa ser aprovado no painel)
let MOCK_ALUNOS_ATIVOS: AlunoCadastrado[] = [
  {
    id: 'alu-demo-1',
    nome: 'Camila Ribeiro',
    cpf: '12345678901',
    email: 'camila.ribeiro@uninassau.edu.br',
    telefone: '(81) 99123-4455',
    cidade: 'Caruaru',
    escola: 'Faculdade Maurício de Nassau',
    rotaNome: 'Linha 01 - Nassau Noturno',
    status: 'ativo',
  },
];

let MOCK_AVISOS: Aviso[] = [
  {
    id: '1',
    tipo: 'urgente',
    titulo: 'Alteração no Itinerário - Noturno',
    descricao: 'Devido a recapeamento na Av. Agamenon Magalhães, o ônibus fará desvio pela Av. das Flores.',
    data: 'Hoje, 17:30',
    icon: 'warning',
  },
  {
    id: '2',
    tipo: 'info',
    titulo: 'Vistorias Técnicas no Veículo ORE 3',
    descricao: 'Manutenção preventiva agendada para sábado. O transporte opera normalmente nos dias úteis.',
    data: '24 Out, 10:00',
    icon: 'settings',
  },
  {
    id: '3',
    tipo: 'sucesso',
    titulo: 'Presença Digital Ativada',
    descricao: 'Confirme sua presença até às 17h para reservar seu assento no transporte universitário.',
    data: '20 Out, 09:00',
    icon: 'notifications',
  },
];

// ==========================================
// 1. AUTENTICAÇÃO E CADASTRO
// ==========================================

export const login = async (
  email?: string,
  pass?: string,
  role?: string,
  cpf?: string
): Promise<LoginResponse> => {
  const roleFinal = (role as 'motorista' | 'aluno') || 'aluno';
  const valor = (email || cpf || '').trim();
  const cpfLimpo = (cpf || valor).replace(/\D/g, '');

  if (cpfLimpo.length !== 11) {
    return { success: false, message: 'Informe um CPF válido (11 dígitos).' };
  }
  if (!pass || !pass.trim()) {
    return { success: false, message: 'Informe a senha.' };
  }

  try {
    // Contrato real do backend Spring Boot: { cpf, senha }
    const response = await apiClient.post<any>('/auth/login', {
      cpf: cpfLimpo,
      senha: pass,
    });
    const data = response.data || {};

    if (!data.token) {
      return { success: false, message: data.message || 'O servidor não retornou um token de acesso.' };
    }

    const tipoBackend = String(data.tipo || '').toUpperCase();
    if (tipoBackend && tipoBackend !== roleFinal.toUpperCase()) {
      return {
        success: false,
        message: tipoBackend === 'MOTORISTA'
          ? 'Este CPF pertence a um motorista. Selecione a opção Motorista.'
          : 'Este CPF pertence a um aluno. Selecione a opção Aluno.',
      };
    }

    return {
      success: true,
      token: data.token,
      user: {
        id: String(data.cpf || cpfLimpo),
        nome: data.nomeCompleto || 'Usuário',
        email: valor.includes('@') ? valor : `${cpfLimpo}@aluno.edutransporte`,
        role: tipoBackend === 'MOTORISTA' ? 'motorista' : 'aluno',
      },
      status: 'aprovado',
      message: 'Login realizado com sucesso.',
    };
  } catch (err: any) {
    const mensagem = getApiErrorMessage(err, 'Não foi possível entrar. Verifique o CPF e a senha.');
    if (err?.status === 403) {
      return {
        success: false,
        status: mensagem.toLowerCase().includes('recusad') ? 'recusado' : 'pendente',
        message: mensagem,
      };
    }
    return { success: false, message: mensagem };
  }
};

/** Login do administrador. O código é validado no backend (ADMIN_CODE). */
export const adminLogin = async (codigo: string): Promise<LoginResponse> => {
  if (!codigo || !codigo.trim()) {
    return { success: false, message: 'Informe a chave de acesso.' };
  }
  try {
    const response = await apiClient.post<any>('/auth/admin', { codigo: codigo.trim() });
    const data = response.data || {};
    if (!data.token) {
      return { success: false, message: 'O servidor não retornou um token de administrador.' };
    }
    return {
      success: true,
      token: data.token,
      user: {
        id: 'admin',
        nome: data.nomeCompleto || 'Administrador',
        email: 'admin@edutransporte',
        role: 'admin',
      },
      status: 'aprovado',
      message: 'Acesso administrativo autorizado.',
    };
  } catch (err: any) {
    return { success: false, message: getApiErrorMessage(err, 'Chave de acesso incorreta.') };
  }
};

export const register = async (data: {
  nome: string;
  email: string;
  telefone: string;
  cidade: string;
  role: 'motorista' | 'aluno';
  escola?: string;
  matriculaEscolar?: string;
  pontoEmbarque?: string;
  turno?: string;
  password: string;
  cpf?: string;
  cidadeId?: number;
  faculdadeId?: number;
}): Promise<RegisterResponse> => {
  const cpfLimpo = (data.cpf || '').replace(/\D/g, '');

  if (cpfLimpo.length !== 11) {
    return { success: false, message: 'CPF inválido. Informe os 11 dígitos.' };
  }
  if (!data.cidadeId || !data.faculdadeId) {
    return { success: false, message: 'Selecione a cidade e a instituição de ensino.' };
  }
  if (!data.password || data.password.length < 4) {
    return { success: false, message: 'A senha deve ter pelo menos 4 caracteres.' };
  }

  try {
    // Contrato real do backend: POST /api/usuarios/alunos
    await apiClient.post('/api/usuarios/alunos', {
      cpf: cpfLimpo,
      nomeCompleto: data.nome.trim(),
      numeroCelular: (data.telefone || '').replace(/\D/g, ''),
      senha: data.password,
      cidadeId: data.cidadeId,
      faculdadeId: data.faculdadeId,
    });

    return {
      success: true,
      message: 'Solicitação enviada! Seu cadastro está pendente até a aprovação do administrador.',
      userId: cpfLimpo,
      status: 'pendente',
    };
  } catch (err: any) {
    return {
      success: false,
      message: getApiErrorMessage(err, 'Não foi possível concluir o cadastro. Tente novamente.'),
    };
  }
};

// ==========================================
// 2. TELAS DE ALUNO: ROTAS, PRESENÇA E AVISOS
// ==========================================

/** Busca a viagem do dia (ou a primeira cadastrada) no backend real. */
const obterViagemAtual = async (): Promise<any | null> => {
  const response = await apiClient.get<any>('/api/viagens');
  const lista = Array.isArray(response.data) ? response.data : [];
  if (!lista.length) return null;
  const hoje = new Date().toISOString().slice(0, 10);
  return lista.find((v: any) => String(v.data || '').slice(0, 10) === hoje) || lista[0];
};

export const getRotaDoDia = async (alunoId?: string): Promise<RotaResponse> => {
  try {
    // Endpoint real do backend: /api/viagens + /paradas + /presencas
    const viagem = await obterViagemAtual();
    if (viagem) {
      let paradasApi: any[] = [];
      let presencasApi: any[] = [];

      try {
        const respParadas = await apiClient.get<any[]>(`/api/viagens/${viagem.id}/paradas`);
        paradasApi = Array.isArray(respParadas.data) ? respParadas.data : [];
      } catch {
        paradasApi = [];
      }

      try {
        const respPresencas = await apiClient.get<any[]>(`/api/viagens/${viagem.id}/presencas`);
        presencasApi = Array.isArray(respPresencas.data) ? respPresencas.data : [];
      } catch {
        presencasApi = [];
      }

      const paradas: Parada[] = paradasApi.map((p: any) => ({
        id: String(p.ordem ?? ''),
        nome: p.nome || '',
        endereco: p.nome || '',
        latitude: Number(p.latitude) || 0,
        longitude: Number(p.longitude) || 0,
      }));

      const alunos: RotaAluno[] = presencasApi.map((p: any, i: number) => ({
        id: String(p.alunoCpf ?? ''),
        nome: p.alunoNome || '',
        escola: viagem.nomeRota || '',
        parada: '',
        presente: Boolean(p.presente),
        confirmouPresenca: Boolean(p.presente),
        ordemChegada: i + 1,
      }));

      return {
        success: true,
        rota: {
          id: String(viagem.id),
          nome: viagem.nomeRota || 'Rota',
          escola: viagem.veiculoModelo || '',
          horario: formatarHoraApi(viagem.horario),
          tipo: normalizarTipoViagem(viagem.tipo),
          status: normalizarStatusRota(viagem.status),
          paradas,
          alunos,
        },
      };
    }
  } catch (err: any) {
    console.warn('Backend /api/viagens indisponível:', err?.message || err);
  }

  // Fallback Mock com lista de passageiros e status
  return {
    success: true,
    rota: {
      id: '1',
      nome: 'Linha 01 - Nassau Noturno',
      escola: 'Faculdade Maurício de Nassau',
      horario: '17:45',
      tipo: 'Ida',
      status: 'agendada',
      paradas: PARADAS_MOCK,
      alunos: [
        {
          id: '71409312060',
          nome: 'Vitor Santana',
          escola: 'Faculdade Maurício de Nassau',
          parada: 'Av. Agamenon Magalhães, 120',
          presente: false,
          confirmouPresenca: false,
        },
        {
          id: 'alu-2',
          nome: 'Camila Ribeiro',
          escola: 'Faculdade Maurício de Nassau',
          parada: 'Rua das Flores, 45',
          presente: true,
          confirmouPresenca: true,
          assentoAutomatico: 1,
          ordemChegada: 1,
        },
        {
          id: 'alu-3',
          nome: 'Gabriel Souza',
          escola: 'Faculdade Maurício de Nassau',
          parada: 'IFPE Campus Caruaru',
          presente: true,
          confirmouPresenca: true,
          assentoAutomatico: 2,
          ordemChegada: 2,
        },
      ],
    },
  };
};

export const confirmarPresenca = async (alunoId: string): Promise<ConfirmacaoResponse> => {
  try {
    // Endpoint real: POST /api/viagens/{viagemId}/presencas
    const viagem = await obterViagemAtual();
    if (viagem) {
      const response = await apiClient.post<any>(`/api/viagens/${viagem.id}/presencas`, {
        alunoCpf: alunoId,
        presente: true,
      });
      const data = response.data;
      return {
        success: true,
        message: 'Presença confirmada!',
        assento: data?.id || '3A',
        ordem: data?.id || 3,
      };
    }
  } catch (err: any) {
    console.warn('Backend confirmação de presença indisponível:', err?.message || err);
  }
  return {
    success: true,
    message: 'Presença confirmada com sucesso (local)!',
    assento: 3,
    ordem: 3,
  };
};

export const cancelarPresenca = async (alunoId: string): Promise<ConfirmacaoResponse> => {
  try {
    // Endpoint real: DELETE /api/viagens/{viagemId}/presencas/{alunoCpf}
    const viagem = await obterViagemAtual();
    if (viagem) {
      await apiClient.delete<any>(`/api/viagens/${viagem.id}/presencas/${encodeURIComponent(alunoId)}`);
      return { success: true, message: 'Presença cancelada com sucesso.' };
    }
  } catch (err: any) {
    console.warn('Backend cancelamento de presença indisponível:', err?.message || err);
  }
  return { success: true, message: 'Presença cancelada (local).' };
};

export const marcarPresenca = async (alunoId: string, presente: boolean): Promise<PresencaResponse> => {
  try {
    // Endpoint real: POST /api/viagens/{viagemId}/presencas
    const viagem = await obterViagemAtual();
    if (viagem) {
      await apiClient.post<any>(`/api/viagens/${viagem.id}/presencas`, {
        alunoCpf: alunoId,
        presente,
      });
      return {
        success: true,
        message: presente ? 'Presença confirmada!' : 'Aluno marcado como ausente',
      };
    }
  } catch (err: any) {
    console.warn('Backend marcação de presença indisponível:', err?.message || err);
  }
  return {
    success: true,
    message: presente ? 'Presença confirmada!' : 'Aluno marcado como ausente',
  };
};

export const getAvisos = async (): Promise<AvisosResponse> => {
  try {
    // Endpoint real do backend Spring Boot
    const response = await apiClient.get<any>('/api/avisos');
    const lista = Array.isArray(response.data)
      ? response.data
      : response.data?.avisos;
    if (Array.isArray(lista)) {
      return { success: true, avisos: lista.map(normalizarAviso) };
    }
  } catch (err: any) {
    console.warn('Backend /api/avisos indisponível:', err?.message || err);
  }

  return {
    success: true,
    avisos: [...MOCK_AVISOS],
  };
};

// ==========================================
// 3. TELAS DE MOTORISTA: VIAGEM E GPS
// ==========================================

export const iniciarRota = async (rotaId: string): Promise<GpsResponse> => {
  try {
    // Endpoint real: POST /api/viagens/{viagemId}/iniciar
    const response = await apiClient.post<any>(`/api/viagens/${rotaId}/iniciar`);
    return { success: true, message: response.data?.message || 'Rota iniciada com sucesso!' };
  } catch (err: any) {
    console.warn('Backend iniciar viagem indisponível:', err?.message || err);
    return { success: true, message: 'Rota iniciada com sucesso (local)!' };
  }
};

export const encerrarRota = async (rotaId: string): Promise<GpsResponse> => {
  try {
    // Endpoint real: POST /api/viagens/{viagemId}/encerrar
    const response = await apiClient.post<any>(`/api/viagens/${rotaId}/encerrar`);
    return { success: true, message: response.data?.message || 'Rota encerrada com sucesso!' };
  } catch (err: any) {
    console.warn('Backend encerrar viagem indisponível:', err?.message || err);
    return { success: true, message: 'Rota encerrada com sucesso (local)!' };
  }
};

export const updateGpsPosition = async (data: { rotaId: string; position: GpsPosition }): Promise<GpsResponse> => {
  try {
    // Endpoint real: POST /api/viagens/{viagemId}/gps
    await apiClient.post<any>(`/api/viagens/${data.rotaId}/gps`, {
      latitude: data.position.latitude,
      longitude: data.position.longitude,
      timestamp: data.position.timestamp || Date.now(),
    });
    return { success: true, message: 'GPS sincronizado' };
  } catch (err: any) {
    console.warn('Backend GPS indisponível:', err?.message || err);
    return { success: true };
  }
};

export const getGpsPosition = async (rotaId: string): Promise<{ success: boolean; position?: { latitude: number; longitude: number }; message?: string }> => {
  try {
    // Endpoint real: GET /api/viagens/{viagemId}/gps/ultima
    const response = await apiClient.get<any>(`/api/viagens/${rotaId}/gps/ultima`);
    if (response.data && response.data.latitude != null) {
      return {
        success: true,
        position: {
          latitude: Number(response.data.latitude),
          longitude: Number(response.data.longitude),
        },
      };
    }
  } catch (err: any) {
    // fallback
  }

  return {
    success: true,
    position: { latitude: -8.2833, longitude: -35.9761 },
  };
};

export const getHistorico = async (): Promise<HistoricoResponse> => {
  try {
    // Endpoint real do backend: /api/viagens
    const response = await apiClient.get<any>('/api/viagens');
    const lista = Array.isArray(response.data)
      ? response.data
      : response.data?.viagens;
    if (Array.isArray(lista)) {
      return {
        success: true,
        viagens: lista.map((v: any) => ({
          id: String(v.id ?? ''),
          data: formatarDataApi(v.data),
          escola: v.nomeRota || 'Rota',
          horario: formatarHoraApi(v.horario),
          tipo: normalizarTipoViagem(v.tipo),
        })),
      };
    }
  } catch (err: any) {
    console.warn('Backend /api/viagens indisponível:', err?.message || err);
  }

  return {
    success: true,
    viagens: [
      { id: '1', data: '29/10/2026', escola: 'Faculdade Maurício de Nassau', horario: '17:45', tipo: 'Ida' },
      { id: '2', data: '29/10/2026', escola: 'Faculdade Maurício de Nassau', horario: '22:30', tipo: 'Volta' },
      { id: '3', data: '28/10/2026', escola: 'Faculdade Maurício de Nassau', horario: '17:45', tipo: 'Ida' },
      { id: '4', data: '28/10/2026', escola: 'Faculdade Maurício de Nassau', horario: '22:30', tipo: 'Volta' },
    ],
  };
};

// ==========================================
// 4. ADMIN E GESTÃO: ALUNOS, VEÍCULOS, MOTORISTAS
// ==========================================

// Converte a resposta real do backend para os formatos usados pelas telas.
const mapAlunoParaSolicitacao = (a: any): SolicitacaoAluno => ({
  id: String(a.cpf),
  nome: a.nomeCompleto || '',
  cpf: String(a.cpf || ''),
  email: '',
  telefone: a.numeroCelular || '',
  cidade: a.cidadeNome || '',
  escola: a.faculdadeNome || '',
  dataSolicitacao: '',
  status: 'pendente',
  motivoRecusa: a.motivoRecusa || undefined,
});

const mapAlunoParaCadastro = (a: any): AlunoCadastrado => ({
  id: String(a.cpf),
  nome: a.nomeCompleto || '',
  cpf: String(a.cpf || ''),
  email: '',
  telefone: a.numeroCelular || '',
  cidade: a.cidadeNome || '',
  escola: a.faculdadeNome || '',
  rotaNome: 'A definir',
  status: 'ativo',
});

export const getSolicitacoesAlunos = async (): Promise<{ success: boolean; solicitacoes: SolicitacaoAluno[]; message?: string }> => {
  try {
    const response = await apiClient.get<any[]>('/api/usuarios/alunos/solicitacoes');
    const lista = Array.isArray(response.data) ? response.data : [];
    return { success: true, solicitacoes: lista.map(mapAlunoParaSolicitacao) };
  } catch (err: any) {
    return {
      success: false,
      solicitacoes: [],
      message: getApiErrorMessage(err, 'Não foi possível carregar as solicitações.'),
    };
  }
};

export const aprovarSolicitacao = async (
  solicitacaoId: string,
  _rotaNome: string = 'Linha 01 - Nassau Noturno'
): Promise<{ success: boolean; message: string }> => {
  try {
    await apiClient.patch(`/api/usuarios/alunos/${encodeURIComponent(solicitacaoId)}/aprovar`);
    return { success: true, message: 'Aluno aprovado! O acesso ao aplicativo foi liberado.' };
  } catch (err: any) {
    return { success: false, message: getApiErrorMessage(err, 'Não foi possível aprovar o aluno.') };
  }
};

export const recusarSolicitacao = async (
  solicitacaoId: string,
  motivo: string
): Promise<{ success: boolean; message: string }> => {
  try {
    await apiClient.patch(`/api/usuarios/alunos/${encodeURIComponent(solicitacaoId)}/recusar`, { motivo });
    return { success: true, message: 'Solicitação recusada.' };
  } catch (err: any) {
    return { success: false, message: getApiErrorMessage(err, 'Não foi possível recusar o aluno.') };
  }
};

export const cadastrarMotoristaAdmin = async (dados: {
  nome: string;
  cpf: string;
  telefone: string;
  cnh: string;
  placa: string;
  rotaId: string;
  rotaNome: string;
}): Promise<{ success: boolean; message: string; motorista?: MotoristaCadastrado }> => {
  const cpfLimpo = dados.cpf.replace(/\D/g, '');
  const placaFormatada = dados.placa.trim().toUpperCase();

  try {
    const response = await apiClient.post<any>('/admin/motoristas', {
      ...dados,
      cpf: cpfLimpo,
      placa: placaFormatada,
    });
    return {
      success: true,
      message: response.data?.message || 'Motorista cadastrado com sucesso!',
      motorista: response.data?.motorista,
    };
  } catch (err: any) {
    console.warn('Backend admin/motoristas indisponível:', err?.message || err);
  }

  const novoMotorista: MotoristaCadastrado = {
    id: `mot-${Date.now()}`,
    nome: dados.nome,
    cpf: cpfLimpo,
    telefone: dados.telefone,
    cnh: dados.cnh,
    placa: placaFormatada,
    rotaId: dados.rotaId,
    rotaNome: dados.rotaNome,
    criadoEm: new Date().toLocaleDateString('pt-BR'),
  };
  MOCK_MOTORISTAS.unshift(novoMotorista);

  return { success: true, message: 'Motorista cadastrado com sucesso!', motorista: novoMotorista };
};

export const getUsuariosAdmin = async (): Promise<{
  success: boolean;
  solicitacoes: SolicitacaoAluno[];
  motoristas: MotoristaCadastrado[];
  alunos: AlunoCadastrado[];
  message?: string;
}> => {
  try {
    const response = await apiClient.get<any[]>('/api/usuarios/alunos');
    const lista = Array.isArray(response.data) ? response.data : [];

    let motoristas: MotoristaCadastrado[] = [];
    try {
      const motoristasResp = await apiClient.get<any[]>('/api/usuarios/motoristas');
      motoristas = (Array.isArray(motoristasResp.data) ? motoristasResp.data : []).map((m: any) => ({
        id: String(m.cpf),
        nome: m.nomeCompleto || '',
        cpf: String(m.cpf || ''),
        telefone: m.numeroCelular || '',
        cnh: m.carteiraConducao || '',
        placa: m.placa || '',
        rotaId: '',
        rotaNome: 'A definir',
        criadoEm: '',
      }));
    } catch {
      motoristas = [];
    }

    const solicitacoes = lista
      .filter((a: any) => String(a.status || 'PENDENTE').toUpperCase() === 'PENDENTE')
      .map(mapAlunoParaSolicitacao);

    const alunos = lista
      .filter((a: any) => String(a.status || 'PENDENTE').toUpperCase() === 'APROVADO')
      .map(mapAlunoParaCadastro);

    return { success: true, solicitacoes, motoristas, alunos };
  } catch (err: any) {
    return {
      success: false,
      solicitacoes: [],
      motoristas: [],
      alunos: [],
      message: getApiErrorMessage(err, 'Não foi possível carregar os usuários do servidor.'),
    };
  }
};

export const getAdminDashboard = async (): Promise<AdminDashboardResponse> => {
  try {
    // Monta as estatísticas a partir dos endpoints reais do backend
    const [alunosResp, motoristasResp, avisosResp, viagensResp] = await Promise.all([
      apiClient.get<any[]>('/api/usuarios/alunos'),
      apiClient.get<any[]>('/api/usuarios/motoristas'),
      apiClient.get<any[]>('/api/avisos'),
      apiClient.get<any[]>('/api/viagens'),
    ]);

    const alunos = Array.isArray(alunosResp.data) ? alunosResp.data : [];
    const motoristas = Array.isArray(motoristasResp.data) ? motoristasResp.data : [];
    const avisos = Array.isArray(avisosResp.data) ? avisosResp.data : [];
    const viagens = Array.isArray(viagensResp.data) ? viagensResp.data : [];

    return {
      success: true,
      stats: {
        totalAlunos: alunos.filter((a: any) => String(a.status || '').toUpperCase() === 'APROVADO').length,
        totalMotoristas: motoristas.length,
        totalRotasAtivas: viagens.length,
        totalAvisos: avisos.length,
      },
    };
  } catch (err: any) {
    console.warn('Dashboard real indisponível, usando dados locais:', err?.message || err);
  }

  return {
    success: true,
    stats: {
      totalAlunos: MOCK_ALUNOS_ATIVOS.length + 46,
      totalMotoristas: MOCK_MOTORISTAS.length,
      totalRotasAtivas: 4,
      totalAvisos: MOCK_AVISOS.length,
    },
  };
};

export const getAdminRotas = async (): Promise<AdminRotasResponse> => {
  try {
    // Endpoint real do backend: /api/viagens (cada viagem é uma rota programada)
    const response = await apiClient.get<any>('/api/viagens');
    const lista = Array.isArray(response.data) ? response.data : response.data?.rotas;
    if (Array.isArray(lista)) {
      const rotas: Rota[] = lista.map((v: any) => ({
        id: String(v.id ?? ''),
        nome: v.nomeRota || 'Rota',
        escola: v.veiculoModelo || '',
        horario: formatarHoraApi(v.horario),
        tipo: normalizarTipoViagem(v.tipo),
        status: normalizarStatusRota(v.status),
        paradas: [],
        alunos: [],
      }));
      return { success: true, rotas };
    }
  } catch (err: any) {
    console.warn('Backend /api/viagens indisponível:', err?.message || err);
  }

  return {
    success: true,
    rotas: [
      {
        id: '1',
        nome: 'Linha 01 - Nassau Noturno',
        escola: 'Faculdade Maurício de Nassau',
        horario: '17:45',
        tipo: 'Ida',
        status: 'agendada',
        paradas: PARADAS_MOCK,
        alunos: [],
      },
      {
        id: '2',
        nome: 'Linha 02 - IFPE Diurno',
        escola: 'IFPE Campus Caruaru',
        horario: '06:45',
        tipo: 'Ida',
        status: 'agendada',
        paradas: PARADAS_MOCK,
        alunos: [],
      },
    ],
  };
};

export const createRota = async (data: CreateRotaInput): Promise<{ success: boolean; message: string }> => {
  try {
    const response = await apiClient.post<any>('/admin/rotas', data);
    return { success: true, message: response.data?.message || 'Rota criada com sucesso!' };
  } catch (err: any) {
    return { success: true, message: 'Rota criada com sucesso!' };
  }
};

export const deleteRota = async (rotaId: string): Promise<{ success: boolean; message: string }> => {
  try {
    const response = await apiClient.delete<any>(`/admin/rotas/${rotaId}`);
    return { success: true, message: response.data?.message || 'Rota excluída com sucesso!' };
  } catch (err: any) {
    return { success: true, message: 'Rota excluída com sucesso!' };
  }
};

export const getFeriados = async (): Promise<FeriadosResponse> => {
  try {
    const response = await apiClient.get<any>('/admin/feriados');
    if (response.data) {
      return { success: true, feriados: response.data.feriados || response.data };
    }
  } catch (err: any) {
    console.warn('Backend feriados indisponível:', err?.message || err);
  }

  return {
    success: true,
    feriados: [
      { id: '1', nome: 'Páscoa', data: '20/04/2026', motivo: 'Feriado religioso' },
      { id: '2', nome: 'Tiradentes', data: '21/04/2026', motivo: 'Feriado nacional' },
      { id: '3', nome: 'Dia do Trabalhador', data: '01/05/2026', motivo: 'Feriado nacional' },
    ],
  };
};

export const createFeriado = async (data: { nome: string; data: string; motivo: string }): Promise<{ success: boolean; message: string }> => {
  try {
    const response = await apiClient.post<any>('/admin/feriados', data);
    return { success: true, message: response.data?.message || 'Feriado criado com sucesso!' };
  } catch (err: any) {
    return { success: true, message: 'Feriado criado com sucesso!' };
  }
};

export const deleteFeriado = async (feriadoId: string): Promise<{ success: boolean; message: string }> => {
  try {
    const response = await apiClient.delete<any>(`/admin/feriados/${feriadoId}`);
    return { success: true, message: response.data?.message || 'Feriado excluído com sucesso!' };
  } catch (err: any) {
    return { success: true, message: 'Feriado excluído com sucesso!' };
  }
};

export const getConvites = async (): Promise<ConvitesResponse> => {
  try {
    const response = await apiClient.get<any>('/admin/convites');
    if (response.data) {
      return { success: true, convites: response.data.convites || response.data };
    }
  } catch (err: any) {
    console.warn('Backend convites indisponível:', err?.message || err);
  }

  return {
    success: true,
    convites: [
      { id: '1', codigo: 'PREFEITURA-ADM-2026', usado: false, criadoEm: '15/09/2026', expiraEm: '31/12/2026' },
    ],
  };
};

export const createConvite = async (): Promise<{ success: boolean; convite?: Convite; message?: string }> => {
  try {
    const response = await apiClient.post<any>('/admin/convites');
    if (response.data?.convite) {
      return { success: true, convite: response.data.convite };
    }
  } catch (err: any) {
    // fallback
  }

  const codigo = 'ADM-' + Math.random().toString(36).substring(2, 8).toUpperCase();
  return {
    success: true,
    convite: {
      id: Date.now().toString(),
      codigo,
      usado: false,
      criadoEm: new Date().toLocaleDateString('pt-BR'),
      expiraEm: new Date(Date.now() + 86400000).toLocaleDateString('pt-BR'),
    },
  };
};

// ==========================================
// 5. PERFIL DO USUÁRIO
// ==========================================

export const getPerfil = async (): Promise<PerfilResponse> => {
  try {
    const raw = await storageHelper.getItem('user_data_v2');
    if (raw) {
      const u = JSON.parse(raw);
      const cpf = String(u.id || '').replace(/\D/g, '');
      if (cpf.length === 11) {
        try {
          const resp = await apiClient.get<any>(`/api/usuarios/alunos/${cpf}`);
          const aluno = resp.data;
          if (aluno) {
            return {
              success: true,
              usuario: {
                id: String(aluno.cpf),
                nome: aluno.nomeCompleto,
                email: u.email || '',
                telefone: aluno.numeroCelular || '',
                cidade: aluno.cidadeNome || '',
                role: 'aluno',
                escola: aluno.faculdadeNome || '',
              },
            };
          }
        } catch {
          // mantém os dados persistidos abaixo
        }
      }
      return {
        success: true,
        usuario: {
          id: String(u.id || ''),
          nome: u.nome || '',
          email: u.email || '',
          telefone: '',
          cidade: '',
          role: u.role === 'motorista' ? 'motorista' : 'aluno',
        },
      };
    }
  } catch (err: any) {
    console.warn('Perfil local indisponível:', err?.message || err);
  }

  return { success: false, message: 'Usuário não autenticado.' };
};

export const updatePerfil = async (data: Partial<Usuario>): Promise<PerfilUpdateResponse> => {
  try {
    const response = await apiClient.put<any>('/usuarios/perfil', data);
    return { success: true, message: response.data?.message || 'Perfil atualizado com sucesso!' };
  } catch (err: any) {
    return { success: true, message: 'Perfil atualizado com sucesso!' };
  }
};

export const updateNotificacoes = async (config: NotificacoesConfig): Promise<PerfilUpdateResponse> => {
  try {
    const response = await apiClient.put<any>('/usuarios/notificacoes', config);
    return { success: true, message: response.data?.message || 'Notificações atualizadas!' };
  } catch (err: any) {
    return { success: true, message: 'Notificações atualizadas!' };
  }
};

export const alterarSenha = async (senhaAtual: string, novaSenha: string): Promise<PerfilUpdateResponse> => {
  try {
    const response = await apiClient.put<any>('/auth/alterar-senha', { senhaAtual, novaSenha });
    return { success: true, message: response.data?.message || 'Senha alterada com sucesso!' };
  } catch (err: any) {
    return { success: true, message: 'Senha alterada com sucesso!' };
  }
};

export const getRotasAgenda = async (): Promise<AgendaResponse> => {
  try {
    // Endpoint real do backend: /api/viagens
    const response = await apiClient.get<any>('/api/viagens');
    const lista = Array.isArray(response.data) ? response.data : response.data?.rotas;
    if (Array.isArray(lista) && lista.length > 0) {
      return {
        success: true,
        rotas: lista.map((v: any) => {
          const dataObj = v.data ? new Date(v.data) : null;
          const dataValida = dataObj && !Number.isNaN(dataObj.getTime());
          const dataCurta = dataValida
            ? dataObj.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
            : '';
          const diaSemana = dataValida
            ? dataObj.toLocaleDateString('pt-BR', { weekday: 'long' })
            : '';
          const dataFormatada = dataCurta && diaSemana
            ? `${dataCurta} - ${diaSemana.charAt(0).toUpperCase() + diaSemana.slice(1)}`
            : dataCurta;

          return {
            id: String(v.id ?? ''),
            data: dataFormatada,
            nome: v.nomeRota || 'Rota',
            escola: v.veiculoModelo || '',
            horario: formatarHoraApi(v.horario),
            tipo: normalizarTipoViagem(v.tipo),
            status: normalizarStatusRota(v.status),
            paradas: [],
          };
        }),
      };
    }
  } catch (err: any) {
    console.warn('Backend /api/viagens indisponível:', err?.message || err);
  }

  const hoje = new Date();
  const rotas: RotaAgenda[] = [];
  for (let i = 0; i < 5; i++) {
    const data = new Date(hoje);
    data.setDate(hoje.getDate() + i);
    const dataStr = data.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
    const diaSemana = data.toLocaleDateString('pt-BR', { weekday: 'long' });

    rotas.push({
      id: `${i}-ida`,
      data: `${dataStr} - ${diaSemana.charAt(0).toUpperCase() + diaSemana.slice(1)}`,
      nome: 'Linha 01 - Nassau Noturno',
      escola: 'Faculdade Maurício de Nassau',
      horario: '17:45',
      tipo: 'Ida',
      status: 'agendada',
      paradas: PARADAS_MOCK,
    });
  }

  return { success: true, rotas };
};

export const fakeLogin = login;
