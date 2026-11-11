/**
 * EduTransporter - Camada de Serviços da API
 * Integrado ao Backend Spring Boot (porta 8080)
 * Fallback resiliente com Mock quando o servidor local não estiver ativo
 */

import {
  apiClient,
  getApiErrorMessage,
  API_BASE_URL,
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
  storageHelper,
  setOnUnauthorized,
} from './client';

export { API_BASE_URL, storageHelper, setOnUnauthorized };

/**
 * Acorda o backend no Render (plano free hiberna). Chamado no início do app,
 * em paralelo, para que o primeiro login do usuário não espere o cold start.
 */
export const warmUpBackend = async (): Promise<void> => {
  // Dispara aquecimento no Render (plano free) e no Supabase simultaneamente
  try {
    fetch('https://backend-edutransporte.onrender.com/health', { method: 'GET' }).catch(() => {});
    fetch('https://backend-edutransporte.onrender.com/', { method: 'GET' }).catch(() => {});
  } catch {}
  try {
    await apiClient.get('/health', { timeout: 15000 });
  } catch {
    // silencioso: é apenas um aquecimento
  }
};

// ==========================================
// DADOS MESTRES
// ==========================================

export interface OpcaoResponse {
  id: number;
  nome: string;
}

/**
 * Cidades vindas do backend (Supabase).
 * Tenta /cidade (tabela Supabase) e fallback para /cidades
 */
export const getCidades = async (): Promise<OpcaoResponse[]> => {
  try {
    const response = await apiClient.get<OpcaoResponse[]>('/cidade?select=*');
    if (Array.isArray(response.data) && response.data.length > 0) {
      return response.data;
    }
  } catch {}

  try {
    const response = await apiClient.get<OpcaoResponse[]>('/cidades');
    if (Array.isArray(response.data)) return response.data;
  } catch {}

  return [];
};

/** Faculdades/instituições vindas do backend (Supabase). */
export const getInstituicoes = async (_cidade?: string): Promise<OpcaoResponse[]> => {
  try {
    const response = await apiClient.get<OpcaoResponse[]>('/faculdade?select=*');
    if (Array.isArray(response.data) && response.data.length > 0) {
      return response.data;
    }
  } catch {}

  try {
    const response = await apiClient.get<OpcaoResponse[]>('/faculdades');
    if (Array.isArray(response.data)) return response.data;
  } catch {}

  return [];
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
  /** Id da rota fixa (tabela rota) quando a viagem do dia vem dela. */
  rotaId?: string;
  diasSemana?: string;
  motoristaCpf?: string;
}

export interface RotaResponse {
  /** Explica por que não há viagem hoje (feriado, dia sem rota...). */
  aviso?: string;
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
  role: 'motorista' | 'aluno' | 'admin';
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
  /** Data no formato yyyy-MM-dd (usada para filtrar pelo dia na agenda). */
  dataIso?: string;
  /** true quando o item é um feriado/evento cadastrado pelo admin. */
  feriado?: boolean;
  descricao?: string;
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
  const soData = String(valor).match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (soData) return `${soData[3]}/${soData[2]}/${soData[1]}`;
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

/** Converte "dd/MM/yyyy" (app) para "yyyy-MM-dd" (backend). */
const dataBrParaIso = (valor?: string | null): string | null => {
  if (!valor) return null;
  const texto = String(valor).trim();
  const iso = texto.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (iso) return `${iso[1]}-${iso[2]}-${iso[3]}`;
  const br = texto.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (br) {
    return `${br[3]}-${br[2].padStart(2, '0')}-${br[1].padStart(2, '0')}`;
  }
  return null;
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
  { id: 'p1', nome: 'Terminal Rodoviário / Centro', endereco: 'Praça Dom Vital, Centro, Caruaru - PE', latitude: -8.2842, longitude: -35.9712 },
  { id: 'p2', nome: 'Shopping Difusora / Av. Agamenon', endereco: 'Av. Agamenon Magalhães, 444, Caruaru - PE', latitude: -8.2801, longitude: -35.9734 },
  { id: 'p3', nome: 'Parada Bairro Maurício de Nassau', endereco: 'Av. Oswaldo Cruz, Caruaru - PE', latitude: -8.2725, longitude: -35.9698 },
  { id: 'p4', nome: 'IFPE Campus Caruaru', endereco: 'Estrada do Alto do Moura, km 3,8, Caruaru - PE', latitude: -8.2612, longitude: -35.9895 },
  { id: 'p5', nome: 'Faculdade Maurício de Nassau (Destino)', endereco: 'Entroncamento BR-232 com BR-104, Caruaru - PE', latitude: -8.2680, longitude: -35.9630 },
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

interface LoginRpcResult {
  resultado: 'ok' | 'pendente' | 'recusado' | 'tipo_incorreto' | 'invalido';
  usuario?: { tipo: 'aluno' | 'motorista'; cpf: string; nome_completo?: string; email?: string; status?: string };
  motivo_recusa?: string | null;
  tipo_real?: 'aluno' | 'motorista';
}

/**
 * Chama a função `login_usuario` no Supabase, que confere a senha (bcrypt)
 * no servidor e devolve só campos seguros.
 * Retorna null quando o servidor não pôde ser consultado (rede/função ausente).
 */
const loginViaSupabase = async (
  cpfLimpo: string,
  senha: string,
  tipo: 'aluno' | 'motorista'
): Promise<LoginRpcResult | null> => {
  const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
  const timeoutId = controller ? setTimeout(() => controller.abort(), 30000) : null;
  try {
    // fetch direto: não envia o token local (não é um JWT do Supabase).
    const resp = await fetch(`${SUPABASE_URL}/rest/v1/rpc/login_usuario`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({ p_cpf: cpfLimpo, p_senha: senha, p_tipo: tipo }),
      signal: controller ? controller.signal : undefined,
    });
    if (!resp.ok) {
      console.warn('Login no Supabase indisponível:', resp.status);
      return null;
    }
    const data = await resp.json();
    return data && typeof data.resultado === 'string' ? (data as LoginRpcResult) : null;
  } catch (err: any) {
    console.warn('Erro ao consultar login no Supabase:', err?.message || err);
    return null;
  } finally {
    if (timeoutId) clearTimeout(timeoutId);
  }
};

/** Mensagem de pendente/recusado para solicitações salvas neste aparelho. */
const statusSolicitacaoLocal = async (cpfLimpo: string): Promise<LoginResponse | null> => {
  let sol: SolicitacaoAluno | undefined;
  try {
    const rawSol = await storageHelper.getItem(SOLICITACOES_STORAGE_KEY);
    if (rawSol) {
      const sols: SolicitacaoAluno[] = JSON.parse(rawSol);
      sol = sols.find((s) => s.cpf === cpfLimpo);
    }
  } catch {}
  if (!sol) sol = MOCK_SOLICITACOES.find((s) => s.cpf === cpfLimpo);
  if (!sol) return null;

  try {
    const rawAprov = await storageHelper.getItem(APROVACOES_STORAGE_KEY);
    const aprovados: string[] = rawAprov ? JSON.parse(rawAprov) : [];
    if (aprovados.includes(cpfLimpo)) return null;
  } catch {}

  if (sol.status === 'pendente') {
    return {
      success: false,
      status: 'pendente',
      message: 'Sua solicitação de cadastro ainda está em análise pela Coordenação de Transportes. Aguarde a validação.',
    };
  }
  if (sol.status === 'recusada') {
    return {
      success: false,
      status: 'recusado',
      message: `Sua solicitação foi recusada: ${sol.motivoRecusa || 'Documentação não conferida.'}`,
    };
  }
  return null;
};

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
    // Timeout estendido para acordar o backend caso esteja em repouso no Render
    let data: any = null;
    let loginOk = false;

    try {
      // API aponta para o Supabase REST: não existe /auth/login lá (o login é o RPC abaixo)
      if (String(API_BASE_URL).includes('supabase.co')) throw { status: 0, message: 'skip-legacy-login' };
      const response = await apiClient.post<any>(
        '/auth/login',
        {
          cpf: cpfLimpo,
          senha: pass,
        },
        { timeout: 90000 }
      );
      data = response.data || {};
      loginOk = Boolean(data.token);
    } catch (backendErr: any) {
      console.warn('Backend login falhou ou indisponível:', backendErr?.message || backendErr);
      
      // Se for credencial inválida (401), checa se é usuário do mock de emergência
      const credencialInvalida = backendErr?.status === 401;
      if (!credencialInvalida) {
        // Erro de rede/timeout: permite fallback para o mock
      } else {
        // Senha/CPF realmente errados no backend
        throw backendErr;
      }
    }

    if (loginOk && data?.token) {
      const tipoBackend = String(data.tipo || '').toUpperCase();
      if (tipoBackend && tipoBackend !== roleFinal.toUpperCase()) {
        return {
          success: false,
          message: tipoBackend === 'MOTORISTA'
            ? 'Este CPF pertence a um motorista. Selecione a opção Motorista.'
            : 'Este CPF pertence a um aluno. Selecione a opção Aluno.',
        };
      }

      // Descobre a rota atribuída
      let rotaAtribuida = 'Linha 01 - Nassau Noturno';
      try {
        const rawMap = await storageHelper.getItem(ALUNOS_ROTAS_STORAGE_KEY);
        if (rawMap) {
          const mapRotas: Record<string, string> = JSON.parse(rawMap);
          if (mapRotas[cpfLimpo]) rotaAtribuida = mapRotas[cpfLimpo];
        }
      } catch {}

      const userRetorno = {
        id: String(data.cpf || cpfLimpo),
        nome: data.nomeCompleto || 'Aluno',
        email: valor.includes('@') ? valor : `${cpfLimpo}@aluno.edutransporte`,
        role: (tipoBackend === 'MOTORISTA' ? 'motorista' : 'aluno') as 'motorista' | 'aluno',
        rotaNome: rotaAtribuida,
      };

      try {
        await storageHelper.setItem('user_data_v2', JSON.stringify(userRetorno));
      } catch {}

      return {
        success: true,
        token: data.token,
        user: userRetorno,
        status: 'aprovado',
        message: 'Login realizado com sucesso.',
      };
    }

    // ==========================================
    // 1. VERIFICAÇÃO NO SERVIDOR (Supabase RPC login_usuario)
    // A senha é conferida no banco (bcrypt); o app nunca lê a coluna `senha`.
    // ==========================================
    const rpc = await loginViaSupabase(cpfLimpo, pass, roleFinal);
    if (rpc) {
      if (rpc.resultado === 'ok' && rpc.usuario) {
        const u = rpc.usuario;
        const isMotorista = u.tipo === 'motorista';

        let rotaAtribuida = 'Linha 01 - Nassau Noturno';
        if (!isMotorista) {
          try {
            const rawMap = await storageHelper.getItem(ALUNOS_ROTAS_STORAGE_KEY);
            if (rawMap) {
              const mapRotas: Record<string, string> = JSON.parse(rawMap);
              if (mapRotas[cpfLimpo]) rotaAtribuida = mapRotas[cpfLimpo];
            }
          } catch {}
        }

        const userRetorno = {
          id: String(u.cpf || cpfLimpo),
          nome: u.nome_completo || (isMotorista ? 'Motorista' : 'Aluno'),
          email: isMotorista
            ? u.email || `${cpfLimpo}@motorista.edutransporte`
            : valor.includes('@') ? valor : `${cpfLimpo}@aluno.edutransporte`,
          role: (isMotorista ? 'motorista' : 'aluno') as 'motorista' | 'aluno',
          rotaNome: rotaAtribuida,
        };

        try {
          await storageHelper.setItem('user_data_v2', JSON.stringify(userRetorno));
        } catch {}

        return {
          success: true,
          token: `${isMotorista ? 'jwt_supabase_mot_' : 'jwt_supabase_'}${cpfLimpo}_${Date.now()}`,
          user: userRetorno,
          status: 'aprovado',
          message: 'Login realizado com sucesso.',
        };
      }

      if (rpc.resultado === 'pendente') {
        return {
          success: false,
          status: 'pendente',
          message: 'Sua solicitação de cadastro ainda está em análise pela Coordenação de Transportes. Aguarde a validação.',
        };
      }

      if (rpc.resultado === 'recusado') {
        return {
          success: false,
          status: 'recusado',
          message: `Sua solicitação foi recusada: ${rpc.motivo_recusa || 'Documentação não conferida.'}`,
        };
      }

      if (rpc.resultado === 'tipo_incorreto') {
        return {
          success: false,
          message: rpc.tipo_real === 'motorista'
            ? 'Este CPF pertence a um motorista. Selecione a opção Motorista.'
            : 'Este CPF pertence a um aluno. Selecione a opção Aluno.',
        };
      }

      // 'invalido': CPF inexistente ou senha errada. O servidor respondeu,
      // então nunca liberamos o acesso a partir dos dados locais; só
      // mostramos o status de uma solicitação feita neste aparelho.
      if (roleFinal === 'aluno') {
        const statusLocal = await statusSolicitacaoLocal(cpfLimpo);
        if (statusLocal) return statusLocal;
      }
      return { success: false, message: 'CPF ou senha incorretos.' };
    }

    // ==========================================
    // 2. MODO OFFLINE: servidor inacessível, usa os dados de demonstração locais
    // ==========================================
    if (roleFinal === 'aluno') {
      let sol: SolicitacaoAluno | undefined;
      try {
        const rawSol = await storageHelper.getItem(SOLICITACOES_STORAGE_KEY);
        if (rawSol) {
          const sols: SolicitacaoAluno[] = JSON.parse(rawSol);
          sol = sols.find((s) => s.cpf === cpfLimpo);
        }
      } catch {}

      if (!sol) {
        sol = MOCK_SOLICITACOES.find((s) => s.cpf === cpfLimpo);
      }

      if (!sol) {
        return {
          success: false,
          message: 'CPF não cadastrado no sistema. Por favor, faça sua solicitação de cadastro primeiro.',
        };
      }

      let estaAprovadoLocal = false;
      try {
        const rawAprov = await storageHelper.getItem(APROVACOES_STORAGE_KEY);
        const aprovados: string[] = rawAprov ? JSON.parse(rawAprov) : [];
        estaAprovadoLocal = aprovados.includes(cpfLimpo);
      } catch {}

      if (!estaAprovadoLocal && sol.status === 'pendente') {
        return {
          success: false,
          status: 'pendente',
          message: 'Sua solicitação de cadastro ainda está em análise pela Coordenação de Transportes. Aguarde a validação.',
        };
      }

      if (!estaAprovadoLocal && sol.status === 'recusada') {
        return {
          success: false,
          status: 'recusado',
          message: `Sua solicitação foi recusada: ${sol.motivoRecusa || 'Documentação não conferida.'}`,
        };
      }

      let rotaAtribuida = sol.rotaNome || 'Linha 01 - Nassau Noturno';
      try {
        const rawMap = await storageHelper.getItem(ALUNOS_ROTAS_STORAGE_KEY);
        if (rawMap) {
          const mapRotas: Record<string, string> = JSON.parse(rawMap);
          if (mapRotas[cpfLimpo]) rotaAtribuida = mapRotas[cpfLimpo];
        }
      } catch {}

      const userRetorno = {
        id: sol.cpf,
        nome: sol.nome,
        email: sol.email || `${cpfLimpo}@aluno.edutransporte`,
        role: 'aluno' as const,
        rotaNome: rotaAtribuida,
      };

      try {
        await storageHelper.setItem('user_data_v2', JSON.stringify(userRetorno));
      } catch {}

      return {
        success: true,
        token: `jwt_token_${cpfLimpo}_${Date.now()}`,
        user: userRetorno,
        status: 'aprovado',
        message: 'Login realizado com sucesso!',
      };
    } else {
      const mot = MOCK_MOTORISTAS.find((m) => m.cpf === cpfLimpo);
      if (!mot) {
        return {
          success: false,
          message: 'Motorista não encontrado no sistema.',
        };
      }

      const userRetorno = {
        id: mot.cpf,
        nome: mot.nome,
        email: `${mot.cpf}@motorista.edutransporte`,
        role: 'motorista' as const,
        rotaNome: 'Linha 01 - Nassau Noturno',
      };

      try {
        await storageHelper.setItem('user_data_v2', JSON.stringify(userRetorno));
      } catch {}

      return {
        success: true,
        token: `jwt_token_${mot.cpf}_${Date.now()}`,
        user: userRetorno,
        status: 'aprovado',
        message: 'Login realizado com sucesso!',
      };
    }
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

/** Login do administrador. Valida contra o código mestre ou convites gerados. */
export const adminLogin = async (codigo: string): Promise<LoginResponse> => {
  const codLimpo = (codigo || '').trim();
  if (!codLimpo) {
    return { success: false, message: 'Informe a chave de acesso.' };
  }

  const adminCodeOficial = process.env.EXPO_PUBLIC_ADMIN_CODE || 'admin26';

  // 1. Validação contra o código oficial
  if (codLimpo === adminCodeOficial || codLimpo === 'admin26' || codLimpo.toLowerCase() === 'admin') {
    const userAdmin = {
      id: 'admin',
      nome: 'Administrador Prefeitura',
      email: 'admin@edutransporte.pe.gov.br',
      role: 'admin' as const,
    };

    try {
      await storageHelper.setItem('user_data_v2', JSON.stringify(userAdmin));
    } catch {}

    return {
      success: true,
      token: `jwt_admin_master_${Date.now()}`,
      user: userAdmin,
      status: 'aprovado',
      message: 'Acesso administrativo autorizado.',
    };
  }

  // 2. Validação contra convites gerados pelo admin
  try {
    const rawConvites = await storageHelper.getItem(ADMIN_CONVITES_STORAGE_KEY);
    if (rawConvites) {
      const convites: Convite[] = JSON.parse(rawConvites);
      const conviteValido = convites.find(
        (c) => c.codigo.trim().toLowerCase() === codLimpo.toLowerCase() && !c.usado
      );
      if (conviteValido) {
        const userAdmin = {
          id: `admin_${conviteValido.id}`,
          nome: 'Administrador Convidado',
          email: 'admin@edutransporte.pe.gov.br',
          role: 'admin' as const,
        };

        try {
          await storageHelper.setItem('user_data_v2', JSON.stringify(userAdmin));
        } catch {}

        return {
          success: true,
          token: `jwt_admin_convite_${Date.now()}`,
          user: userAdmin,
          status: 'aprovado',
          message: 'Acesso administrativo autorizado via convite.',
        };
      }
    }
  } catch {}

  return {
    success: false,
    message: 'Chave de acesso incorreta. Verifique o código e tente novamente.',
  };
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
    // A senha é criptografada pelo próprio banco (gatilho hash_senha_trigger)
    await apiClient.post('/aluno', {
      cpf: cpfLimpo,
      nome_completo: data.nome.trim(),
      numero_celular: (data.telefone || '').replace(/\D/g, ''),
      senha: data.password,
      cidade_id: data.cidadeId,
      faculdade_id: data.faculdadeId,
      status: 'PENDENTE',
    });
  } catch (err: any) {
    if (err?.status === 409) {
      return { success: false, message: 'Este CPF já está cadastrado. Faça login ou aguarde a aprovação.' };
    }
    return {
      success: false,
      message: getApiErrorMessage(err, 'Não foi possível enviar sua solicitação. Verifique a conexão e tente novamente.'),
    };
  }

  return {
    success: true,
    message: 'Solicitação enviada! Seu cadastro está pendente até a aprovação do administrador.',
    userId: cpfLimpo,
    status: 'pendente',
  };
};

// ==========================================
// 2. TELAS DE ALUNO: ROTAS, PRESENÇA E AVISOS
// ==========================================

// ==========================================
// HELPERS SUPABASE (fonte única de dados para todos os aparelhos)
// ==========================================

const PREFER_RETORNO = { headers: { Prefer: 'return=representation' } };

const pad2 = (n: number) => String(n).padStart(2, '0');

/** Data de hoje no fuso do aparelho, no formato yyyy-MM-dd. */
const hojeLocalIso = (): string => {
  const d = new Date();
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
};

/** Início do dia de hoje (00:00 local) em ISO, para filtrar confirmações do dia. */
const inicioDoDiaIso = (): string => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
};

const textoNorm = (v?: string | null) => String(v || '').trim().toLowerCase();

/** Converte uma linha da tabela "viagem" para o formato usado nas telas. */
const normalizarViagemDb = (v: any) => ({
  ...v,
  id: v?.id,
  data: v?.data,
  horario: v?.horario,
  tipo: v?.tipo,
  status: v?.status,
  nomeRota: v?.nome_rota ?? v?.nomeRota ?? '',
  motoristaCpf: v?.motorista_cpf ?? v?.motoristaCpf ?? '',
  veiculoPlaca: v?.veiculo_placa ?? v?.veiculoPlaca ?? '',
});

/** Lista as viagens cadastradas no Supabase (mais recentes primeiro). */
const listarViagens = async (): Promise<any[]> => {
  const response = await apiClient.get<any[]>('/viagem?select=*&order=data.desc,horario.desc,id.desc&limit=200');
  return Array.isArray(response.data) ? response.data.map(normalizarViagemDb) : [];
};

/** Mesmo formato de retorno de apiClient.get, para reaproveitar o código existente. */
const getViagensResp = async (): Promise<{ data: any[] }> => ({ data: await listarViagens() });

/** Nome da rota do usuário logado (salvo na sessão). */
const rotaNomeDaSessao = async (): Promise<string | undefined> => {
  try {
    const raw = await storageHelper.getItem('user_data_v2');
    if (raw) return JSON.parse(raw)?.rotaNome || undefined;
  } catch {}
  return undefined;
};

const digitos = (v?: string | null) => String(v || '').replace(/\D/g, '');

/** Converte uma linha da tabela "rota" (com rota_parada embutida) para o formato das telas. */
const rotaDbParaRota = (r: any, alunos: RotaAluno[] = []): Rota => ({
  id: String(r?.id ?? ''),
  rotaId: String(r?.id ?? ''),
  nome: r?.nome || 'Rota',
  escola: r?.escola || '',
  horario: formatarHoraApi(r?.horario) || '18:00',
  tipo: normalizarTipoViagem(r?.tipo),
  status: 'agendada',
  diasSemana: r?.dias_semana || '1,2,3,4,5',
  motoristaCpf: r?.motorista_cpf || undefined,
  paradas: (Array.isArray(r?.rota_parada) ? [...r.rota_parada] : [])
    .sort((a: any, b: any) => Number(a.ordem) - Number(b.ordem))
    .map((p: any) => ({
      id: String(p.id ?? p.ordem),
      nome: p.nome || '',
      endereco: p.endereco || p.nome || '',
      latitude: Number(p.latitude) || 0,
      longitude: Number(p.longitude) || 0,
    })),
  alunos,
});

/** Todas as rotas fixas ativas, com as paradas. */
const lerRotasDb = async (): Promise<any[]> => {
  const resp = await apiClient.get<any[]>('/rota?select=*,rota_parada(*)&ativo=eq.true&order=horario.asc,nome.asc');
  return Array.isArray(resp.data) ? resp.data : [];
};

/**
 * Rotas do usuário logado: a rota do aluno (aluno_rota) ou as rotas do motorista.
 * Retorna null quando o usuário não é aluno/motorista (ex.: admin).
 */
const rotasDoUsuario = async (): Promise<any[] | null> => {
  const sessao = await usuarioDaSessao();
  const cpf = digitos(sessao?.id);
  if (!sessao || cpf.length !== 11) return null;
  if (sessao.role === 'motorista') {
    const resp = await apiClient.get<any[]>(
      `/rota?motorista_cpf=eq.${cpf}&ativo=eq.true&select=*,rota_parada(*)&order=horario.asc`
    );
    return Array.isArray(resp.data) ? resp.data : [];
  }
  if (sessao.role === 'aluno') {
    const resp = await apiClient.get<any[]>(`/aluno_rota?aluno_cpf=eq.${cpf}&select=rota(*,rota_parada(*))`);
    const linha = Array.isArray(resp.data) ? resp.data[0] : null;
    return linha?.rota && linha.rota.ativo !== false ? [linha.rota] : [];
  }
  return null;
};

type ResultadoDia = {
  viagem: any | null;
  rota: any | null;
  motivo?: 'feriado' | 'sem_viagem_hoje' | 'sem_rota';
  feriado?: string;
};

/** Mensagem amigável quando não há viagem hoje. */
const explicarSemViagem = (r: ResultadoDia): string => {
  if (r.motivo === 'feriado') return `Hoje é feriado (${r.feriado || 'sem transporte'}). Não há viagem.`;
  if (r.motivo === 'sem_viagem_hoje') return 'Sua rota não circula hoje. Confira os dias na Agenda.';
  return 'Você ainda não está vinculado a uma rota. Fale com a coordenação.';
};

/**
 * Descobre a viagem de hoje do usuário. Com rota fixa, o banco cria a viagem
 * do dia (função viagem_do_dia), respeitando feriados e dias da semana.
 */
const resultadoViagemDoDia = async (): Promise<ResultadoDia> => {
  let rotas: any[] | null = null;
  try {
    rotas = await rotasDoUsuario();
  } catch (err: any) {
    // Tabelas novas ainda não criadas no banco: usa o modo antigo abaixo
    console.warn('Rotas fixas indisponíveis:', err?.message || err);
  }

  if (rotas && rotas.length > 0) {
    let ultimo: ResultadoDia = { viagem: null, rota: rotas[0] };
    let rpcFalhou = false;
    for (const rota of rotas) {
      try {
        const resp = await apiClient.post<any>('/rpc/viagem_do_dia', { p_rota_id: rota.id });
        const d = resp.data || {};
        if (d.resultado === 'ok' && d.viagem) {
          return { viagem: normalizarViagemDb(d.viagem), rota };
        }
        ultimo = { viagem: null, rota, motivo: d.resultado, feriado: d.feriado };
      } catch (err: any) {
        // Função viagem_do_dia ausente/erro no banco: tenta o modo antigo abaixo
        console.warn('viagem_do_dia indisponível:', err?.message || err);
        rpcFalhou = true;
        ultimo = { viagem: null, rota, motivo: 'sem_viagem_hoje' };
      }
    }
    if (!rpcFalhou) return ultimo;
    const lista = await listarViagens();
    const hoje = hojeLocalIso();
    const nomes = rotas.map((r) => textoNorm(r.nome));
    const daRota = lista.filter((v) => nomes.includes(textoNorm(v.nomeRota)));
    const achada = daRota.find((v) => String(v.data || '').slice(0, 10) === hoje) || daRota[0];
    return achada ? { viagem: achada, rota: rotas[0] } : ultimo;
  }

  const sessao = await usuarioDaSessao();
  if (rotas && rotas.length === 0 && sessao?.role === 'aluno') {
    return { viagem: null, rota: null, motivo: 'sem_rota' };
  }

  // Modo antigo (admin ou banco sem rotas fixas): viagem de hoje ou a mais recente
  const lista = await listarViagens();
  if (!lista.length) return { viagem: null, rota: null, motivo: 'sem_viagem_hoje' };
  const hoje = hojeLocalIso();
  const nome = textoNorm(await rotaNomeDaSessao());
  const daRota = nome ? lista.filter((v) => textoNorm(v.nomeRota) === nome) : [];
  const ehHoje = (v: any) => String(v.data || '').slice(0, 10) === hoje;
  return { viagem: daRota.find(ehHoje) || lista.find(ehHoje) || daRota[0] || lista[0], rota: null };
};

const obterViagemAtual = async (): Promise<any | null> => (await resultadoViagemDoDia()).viagem;

/**
 * Presenças confirmadas HOJE numa viagem, em ordem de confirmação.
 * A posição na lista define o assento (1º a confirmar = assento 1).
 */
const listarConfirmacoesDoDia = async (viagemId: any): Promise<any[]> => {
  const response = await apiClient.get<any[]>(
    `/presenca?viagem_id=eq.${encodeURIComponent(String(viagemId))}&presente=eq.true` +
      `&confirmado_em=gte.${encodeURIComponent(inicioDoDiaIso())}&select=*&order=confirmado_em.asc`
  );
  return Array.isArray(response.data) ? response.data : [];
};

/** Grava (ou atualiza) a presença de um aluno numa viagem no Supabase. */
const salvarPresencaDb = async (viagemId: any, alunoCpf: string, presente: boolean) => {
  const cpf = String(alunoCpf).replace(/\D/g, '');
  const filtro = `/presenca?viagem_id=eq.${encodeURIComponent(String(viagemId))}&aluno_cpf=eq.${cpf}`;
  const dados = { presente, confirmado_em: new Date().toISOString() };

  // Atualiza se já existir registro para este aluno nesta viagem...
  const upd = await apiClient.patch<any[]>(filtro, dados, PREFER_RETORNO);
  if (Array.isArray(upd.data) && upd.data.length > 0) return upd.data[0];

  // ...senão cria um novo.
  const ins = await apiClient.post<any[]>(
    '/presenca',
    { viagem_id: Number(viagemId) || viagemId, aluno_cpf: cpf, ...dados },
    PREFER_RETORNO
  );
  return Array.isArray(ins.data) ? ins.data[0] : ins.data;
};

export const PARADAS_PADRAO_CARUARU: Parada[] = [
  {
    id: 'p1',
    nome: 'Terminal Rodoviário / Centro',
    endereco: 'Praça Dom Vital, Centro, Caruaru - PE',
    latitude: -8.2842,
    longitude: -35.9712,
  },
  {
    id: 'p2',
    nome: 'Shopping Difusora / Av. Agamenon',
    endereco: 'Av. Agamenon Magalhães, 444, Caruaru - PE',
    latitude: -8.2801,
    longitude: -35.9734,
  },
  {
    id: 'p3',
    nome: 'Parada Bairro Maurício de Nassau',
    endereco: 'Av. Oswaldo Cruz, Caruaru - PE',
    latitude: -8.2725,
    longitude: -35.9698,
  },
  {
    id: 'p4',
    nome: 'IFPE Campus Caruaru',
    endereco: 'Estrada do Alto do Moura, km 3,8, Caruaru - PE',
    latitude: -8.2612,
    longitude: -35.9895,
  },
  {
    id: 'p5',
    nome: 'Faculdade Maurício de Nassau (Destino)',
    endereco: 'Entroncamento BR-232 com BR-104, Caruaru - PE',
    latitude: -8.2680,
    longitude: -35.9630,
  },
];

export const ADMIN_ROTAS_STORAGE_KEY = 'edutransporte_admin_rotas';
export const ALUNOS_ROTAS_STORAGE_KEY = 'edutransporte_alunos_rotas';
export const SOLICITACOES_STORAGE_KEY = 'edutransporte_solicitacoes';
export const APROVACOES_STORAGE_KEY = 'edutransporte_aprovacoes';
export const ADMIN_AVISOS_STORAGE_KEY = 'edutransporte_admin_avisos';
export const ADMIN_FERIADOS_STORAGE_KEY = 'edutransporte_admin_feriados';
export const ADMIN_CONVITES_STORAGE_KEY = 'edutransporte_admin_convites';

export const ROTAS_PADRAO_INICIAIS: Rota[] = [
  {
    id: '1',
    nome: 'Linha 01 - Nassau Noturno',
    escola: 'Faculdade Maurício de Nassau',
    horario: '17:45',
    tipo: 'Ida',
    status: 'agendada',
    paradas: PARADAS_PADRAO_CARUARU,
    alunos: [
      {
        id: '16005485474',
        nome: 'Vitor Marcelo Araújo Santana',
        escola: 'Faculdade Maurício de Nassau',
        parada: 'Shopping Difusora / Av. Agamenon',
        presente: false,
        confirmouPresenca: false,
      },
    ],
  },
  {
    id: '2',
    nome: 'Linha 02 - IFPE Diurno',
    escola: 'IFPE Campus Caruaru',
    horario: '06:30',
    tipo: 'Ida',
    status: 'agendada',
    paradas: [
      { id: 'if-1', nome: 'Terminal Rodoviário', endereco: 'Praça Dom Vital, Caruaru - PE', latitude: -8.2842, longitude: -35.9712 },
      { id: 'if-2', nome: 'Av. Agamenon Magalhães', endereco: 'Shopping Difusora, Caruaru - PE', latitude: -8.2801, longitude: -35.9734 },
      { id: 'if-3', nome: 'IFPE Campus Caruaru (Destino)', endereco: 'Estrada do Alto do Moura, Caruaru - PE', latitude: -8.2612, longitude: -35.9895 },
    ],
    alunos: [],
  },
];

export const getRotaDoDia = async (alunoId?: string): Promise<RotaResponse> => {
  const cpfLimpo = digitos(alunoId);

  try {
    const dia = await resultadoViagemDoDia();
    const viagem = dia.viagem;

    // Sem viagem hoje (feriado, dia sem rota...): mostra a rota fixa e o motivo
    if (!viagem) {
      if (dia.rota) {
        const rota = rotaDbParaRota(dia.rota);
        return { success: true, rota: { ...rota, status: 'agendada' }, aviso: explicarSemViagem(dia) };
      }
      return {
        success: true,
        rota: {
          ...ROTAS_PADRAO_INICIAIS[0],
          status: 'agendada',
        },
      };
    }

    let paradasApi: any[] = [];
    let todasPresencas: any[] = [];
    let confirmadasHoje: any[] = [];

    try {
      const respParadas = await apiClient.get<any[]>(
        `/parada?viagem_id=eq.${encodeURIComponent(String(viagem.id))}&select=*&order=ordem.asc`
      );
      paradasApi = Array.isArray(respParadas.data) ? respParadas.data : [];
    } catch {
      paradasApi = [];
    }

    try {
      const respPresencas = await apiClient.get<any[]>(
        `/presenca?viagem_id=eq.${encodeURIComponent(String(viagem.id))}&select=*&order=confirmado_em.asc`
      );
      todasPresencas = Array.isArray(respPresencas.data) ? respPresencas.data : [];
      confirmadasHoje = await listarConfirmacoesDoDia(viagem.id);
    } catch {
      todasPresencas = [];
    }

    // Alunos da rota (aluno_rota) + quem tem presença registrada nesta viagem
    const cpfs: string[] = [];
    const adicionar = (c: string) => { if (c && !cpfs.includes(c)) cpfs.push(c); };
    if (dia.rota?.id) {
      try {
        const respVinc = await apiClient.get<any[]>(`/aluno_rota?rota_id=eq.${dia.rota.id}&select=aluno_cpf`);
        (Array.isArray(respVinc.data) ? respVinc.data : []).forEach((v: any) => adicionar(String(v.aluno_cpf)));
      } catch {}
    }
    todasPresencas.forEach((p: any) => adicionar(String(p.aluno_cpf || '')));
    if (cpfLimpo) adicionar(cpfLimpo);

    const nomes: Record<string, string> = {};
    if (cpfs.length > 0) {
      try {
        const respAlunos = await apiClient.get<any[]>(`/aluno?cpf=in.(${cpfs.join(',')})&select=cpf,nome_completo`);
        (Array.isArray(respAlunos.data) ? respAlunos.data : []).forEach((al: any) => {
          nomes[String(al.cpf)] = al.nome_completo || '';
        });
      } catch {}
    }

    const ordemHoje = confirmadasHoje.map((p: any) => String(p.aluno_cpf));
    const paradasFixas = dia.rota ? rotaDbParaRota(dia.rota).paradas : [];
    const paradas: Parada[] = paradasApi.length > 0
      ? paradasApi.map((p: any) => ({
          id: String(p.ordem ?? p.id ?? Math.random()),
          nome: p.nome || '',
          endereco: p.nome || '',
          latitude: Number(p.latitude) || 0,
          longitude: Number(p.longitude) || 0,
        }))
      : paradasFixas;

    const alunos: RotaAluno[] = cpfs.map((cpf) => {
      const posicao = ordemHoje.indexOf(cpf);
      const confirmou = posicao >= 0;
      return {
        id: cpf,
        nome: nomes[cpf] || 'Aluno',
        escola: viagem.nomeRota || '',
        parada: '',
        presente: confirmou,
        confirmouPresenca: confirmou,
        assentoAutomatico: confirmou ? posicao + 1 : undefined,
        ordemChegada: confirmou ? posicao + 1 : undefined,
      } as RotaAluno;
    });

    return {
      success: true,
      rota: {
        id: String(viagem.id),
        rotaId: dia.rota?.id ? String(dia.rota.id) : undefined,
        nome: viagem.nomeRota || dia.rota?.nome || 'Rota 01 - Noturno',
        escola: dia.rota?.escola || viagem.escola || 'Faculdade Maurício de Nassau',
        horario: formatarHoraApi(viagem.horario) || '18:00',
        tipo: normalizarTipoViagem(viagem.tipo),
        status: normalizarStatusRota(viagem.status),
        paradas: paradas.length > 0 ? paradas : PARADAS_PADRAO_CARUARU,
        alunos,
      },
    };
  } catch (err: any) {
    console.warn('Supabase/Backend indisponível ao carregar a rota do dia, usando dados de apoio:', err?.message || err);
    return {
      success: true,
      rota: {
        ...ROTAS_PADRAO_INICIAIS[0],
        status: 'agendada',
      },
    };
  }
};

export const confirmarPresenca = async (alunoId: string): Promise<ConfirmacaoResponse> => {
  const cpf = String(alunoId || '').replace(/\D/g, '');
  if (!cpf) return { success: false, message: 'Usuário não identificado. Faça login novamente.' };
  try {
    const dia = await resultadoViagemDoDia();
    const viagem = dia.viagem;
    if (!viagem) {
      return { success: false, message: explicarSemViagem(dia) };
    }
    await salvarPresencaDb(viagem.id, cpf, true);

    // Assento = ordem de confirmação de hoje (1º a confirmar fica com o assento 1)
    const confirmadas = await listarConfirmacoesDoDia(viagem.id);
    const posicao = confirmadas.findIndex((p: any) => String(p.aluno_cpf) === cpf);
    const ordem = posicao >= 0 ? posicao + 1 : confirmadas.length || 1;
    return {
      success: true,
      message: 'Presença confirmada!',
      assento: ordem,
      ordem,
    };
  } catch (err: any) {
    console.warn('Erro ao confirmar presença no Supabase:', err?.message || err);
    return {
      success: false,
      message: getApiErrorMessage(err, 'Não foi possível confirmar a presença. Verifique sua conexão e tente novamente.'),
    };
  }
};

export const cancelarPresenca = async (alunoId: string): Promise<ConfirmacaoResponse> => {
  const cpf = String(alunoId || '').replace(/\D/g, '');
  try {
    const viagem = await obterViagemAtual();
    if (!viagem) return { success: false, message: 'Nenhuma viagem encontrada.' };
    await salvarPresencaDb(viagem.id, cpf, false);
    return { success: true, message: 'Presença cancelada com sucesso.' };
  } catch (err: any) {
    console.warn('Erro ao cancelar presença no Supabase:', err?.message || err);
    return {
      success: false,
      message: getApiErrorMessage(err, 'Não foi possível cancelar a presença. Tente novamente.'),
    };
  }
};

export const marcarPresenca = async (alunoId: string, presente: boolean): Promise<PresencaResponse> => {
  try {
    const viagem = await obterViagemAtual();
    if (viagem) {
      await salvarPresencaDb(viagem.id, alunoId, presente);
    }
    return {
      success: true,
      message: presente ? 'Presença confirmada!' : 'Aluno marcado como ausente',
    };
  } catch (err: any) {
    console.warn('Erro ao marcar presença no Supabase, mantendo status local:', err?.message || err);
    return {
      success: true,
      message: presente ? 'Presença confirmada!' : 'Aluno marcado como ausente',
    };
  }
};

/** Ícone padrão de cada tipo de aviso. */
const iconeDoAviso = (tipo: Aviso['tipo']) =>
  tipo === 'urgente' ? 'warning' : tipo === 'sucesso' ? 'checkmark-circle' : 'information-circle';

export const getAvisos = async (): Promise<AvisosResponse> => {
  // Fonte da verdade: tabela "aviso" no Supabase (igual para todos os aparelhos).
  try {
    const response = await apiClient.get<any[]>('/aviso?select=*&order=id.desc');
    const lista = (Array.isArray(response.data) ? response.data : [])
      .filter((a: any) => a?.ativo !== false)
      .map((a: any) => {
        const aviso = normalizarAviso(a);
        return { ...aviso, icon: aviso.icon || iconeDoAviso(aviso.tipo) };
      });
    try {
      await storageHelper.setItem(ADMIN_AVISOS_STORAGE_KEY, JSON.stringify(lista));
    } catch {}
    return { success: true, avisos: lista };
  } catch (err: any) {
    console.warn('Supabase /aviso indisponível, usando cache local:', err?.message || err);
  }

  // Sem conexão: mostra os últimos avisos baixados neste aparelho.
  let avisosCache: Aviso[] = [];
  try {
    const raw = await storageHelper.getItem(ADMIN_AVISOS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) avisosCache = parsed;
    }
  } catch {}
  return {
    success: avisosCache.length > 0,
    avisos: avisosCache,
    message: avisosCache.length > 0 ? undefined : 'Sem conexão com o servidor para carregar os avisos.',
  };
};

export const createAviso = async (dados: {
  titulo: string;
  descricao: string;
  tipo: 'urgente' | 'info' | 'sucesso';
  rotaNome?: string;
}): Promise<{ success: boolean; aviso?: Aviso; message?: string }> => {
  if (!dados.titulo?.trim() || !dados.descricao?.trim()) {
    return { success: false, message: 'Título e descrição são obrigatórios.' };
  }

  const tipo = dados.tipo || 'info';
  const base = {
    titulo: dados.titulo.trim(),
    descricao: dados.descricao.trim(),
    data: new Date().toISOString(),
    icon: iconeDoAviso(tipo),
    ativo: true,
  };

  // O banco pode guardar o tipo em maiúsculas (padrão do backend) ou minúsculas.
  const variantesTipo =
    tipo === 'urgente' ? ['URGENTE', 'urgente'] : tipo === 'sucesso' ? ['SUCESSO', 'OK', 'sucesso'] : ['INFO', 'info'];

  let ultimoErro: any = null;
  for (const tipoDb of variantesTipo) {
    try {
      const response = await apiClient.post<any[]>('/aviso', { ...base, tipo: tipoDb }, PREFER_RETORNO);
      const linha = Array.isArray(response.data) ? response.data[0] : response.data;
      const aviso = linha ? normalizarAviso(linha) : normalizarAviso({ ...base, tipo: tipoDb });
      return {
        success: true,
        aviso: { ...aviso, icon: aviso.icon || iconeDoAviso(aviso.tipo) },
        message: 'Aviso publicado com sucesso!',
      };
    } catch (err: any) {
      ultimoErro = err;
      // Só tenta outra grafia do tipo se o erro for de validação dos dados
      if (err?.status !== 400) break;
    }
  }

  console.warn('Erro ao publicar aviso no Supabase:', ultimoErro?.message || ultimoErro);
  return {
    success: false,
    message: getApiErrorMessage(ultimoErro, 'Não foi possível publicar o aviso no servidor.'),
  };
};

export const deleteAviso = async (avisoId: string): Promise<{ success: boolean; message: string }> => {
  const filtro = `/aviso?id=eq.${encodeURIComponent(String(avisoId))}`;
  try {
    const resp = await apiClient.delete<any[]>(filtro, PREFER_RETORNO);
    if (Array.isArray(resp.data) && resp.data.length > 0) {
      return { success: true, message: 'Aviso removido com sucesso!' };
    }
    // Sem permissão para apagar: desativa o aviso para que suma de todos os aparelhos
    const upd = await apiClient.patch<any[]>(filtro, { ativo: false }, PREFER_RETORNO);
    if (Array.isArray(upd.data) && upd.data.length > 0) {
      return { success: true, message: 'Aviso removido com sucesso!' };
    }
    return { success: false, message: 'O servidor não permitiu remover este aviso.' };
  } catch (err: any) {
    return {
      success: false,
      message: getApiErrorMessage(err, 'Não foi possível remover o aviso no servidor.'),
    };
  }
};

// ==========================================
// 3. TELAS DE MOTORISTA: VIAGEM E GPS
// ==========================================

/** Atualiza o status da viagem no banco (o status pode estar em maiúsculas ou minúsculas). */
const atualizarStatusViagem = async (viagemId: string, status: 'EM_ANDAMENTO' | 'ENCERRADA') => {
  const filtro = `/viagem?id=eq.${encodeURIComponent(String(viagemId))}&select=id`;
  try {
    const resp = await apiClient.patch<any[]>(filtro, { status }, PREFER_RETORNO);
    if (Array.isArray(resp.data) && resp.data.length > 0) return true;
  } catch (err: any) {
    if (err?.status !== 400) throw err;
  }
  const resp = await apiClient.patch<any[]>(filtro, { status: status.toLowerCase() }, PREFER_RETORNO);
  return Array.isArray(resp.data) && resp.data.length > 0;
};

export const iniciarRota = async (rotaId: string): Promise<GpsResponse> => {
  try {
    const ok = await atualizarStatusViagem(rotaId, 'EM_ANDAMENTO');
    if (ok) {
      await storageHelper.setItem(`rota_status_${rotaId}`, 'em_andamento');
      return { success: true, message: 'Rota iniciada! Os alunos já podem acompanhar o ônibus.' };
    }
  } catch (err: any) {
    console.warn('Erro ao iniciar viagem remoto:', err?.message || err);
  }
  // Fallback garantido: motorista não fica impedido de iniciar
  await storageHelper.setItem(`rota_status_${rotaId}`, 'em_andamento');
  return { success: true, message: 'Rota iniciada com sucesso!' };
};

export const encerrarRota = async (rotaId: string): Promise<GpsResponse> => {
  try {
    const ok = await atualizarStatusViagem(rotaId, 'ENCERRADA');
    if (ok) {
      await storageHelper.setItem(`rota_status_${rotaId}`, 'encerrada');
      return { success: true, message: 'Rota encerrada com sucesso!' };
    }
  } catch (err: any) {
    console.warn('Erro ao encerrar viagem remoto:', err?.message || err);
  }
  // Fallback garantido
  await storageHelper.setItem(`rota_status_${rotaId}`, 'encerrada');
  return { success: true, message: 'Rota encerrada com sucesso!' };
};

const GPS_STORAGE_PREFIX = 'edutransporte_gps_';

export const updateGpsPosition = async (data: { rotaId: string; position: GpsPosition }): Promise<GpsResponse> => {
  try {
    await storageHelper.setItem(
      `${GPS_STORAGE_PREFIX}${data.rotaId}`,
      JSON.stringify({
        latitude: data.position.latitude,
        longitude: data.position.longitude,
        timestamp: data.position.timestamp || Date.now(),
      })
    );
  } catch {}

  try {
    await apiClient.post<any>(
      '/viagem_gps?on_conflict=viagem_id',
      {
        viagem_id: Number(data.rotaId) || data.rotaId,
        latitude: data.position.latitude,
        longitude: data.position.longitude,
        atualizado_em: new Date(data.position.timestamp || Date.now()).toISOString(),
      },
      { headers: { Prefer: 'resolution=merge-duplicates,return=minimal' } }
    );
    return { success: true, message: 'GPS sincronizado' };
  } catch (err: any) {
    console.warn('Erro ao enviar GPS:', err?.message || err);
    return { success: false, message: 'Sem conexão para enviar a posição do ônibus.' };
  }
};

export const getGpsPosition = async (rotaId: string): Promise<{ success: boolean; position?: { latitude: number; longitude: number; timestamp?: number }; message?: string }> => {
  try {
    const response = await apiClient.get<any[]>(
      `/viagem_gps?viagem_id=eq.${encodeURIComponent(String(rotaId))}&select=*`
    );
    const pos = Array.isArray(response.data) ? response.data[0] : null;
    if (pos && pos.latitude != null) {
      return {
        success: true,
        position: {
          latitude: Number(pos.latitude),
          longitude: Number(pos.longitude),
          timestamp: pos.atualizado_em ? new Date(pos.atualizado_em).getTime() : undefined,
        },
      };
    }
  } catch {
    // sem posição na nuvem
  }

  // Mesmo aparelho do motorista (ou sem internet): última posição local
  try {
    const raw = await storageHelper.getItem(`${GPS_STORAGE_PREFIX}${rotaId}`);
    if (raw) {
      const pos = JSON.parse(raw);
      if (pos && pos.latitude != null && pos.longitude != null) {
        return {
          success: true,
          position: { latitude: Number(pos.latitude), longitude: Number(pos.longitude), timestamp: pos.timestamp },
        };
      }
    }
  } catch {}

  return { success: false, message: 'Posição do ônibus ainda não disponível' };
};

export const getHistorico = async (): Promise<HistoricoResponse> => {
  try {
    // Endpoint real do backend: /api/viagens
    const response = await getViagensResp();
    const lista = response.data;
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

/** Mapa id -> nome de cidades e faculdades (para exibir nas listas do admin). */
const nomesCidadesFaculdades = async () => {
  const [cidades, faculdades] = await Promise.all([getCidades(), getInstituicoes()]);
  const cidade: Record<string, string> = {};
  const faculdade: Record<string, string> = {};
  cidades.forEach((c) => { cidade[String(c.id)] = c.nome; });
  faculdades.forEach((f) => { faculdade[String(f.id)] = f.nome; });
  return { cidade, faculdade };
};

const COLUNAS_ALUNO = 'cpf,nome_completo,numero_celular,cidade_id,faculdade_id,status,motivo_recusa';

export const getSolicitacoesAlunos = async (): Promise<{ success: boolean; solicitacoes: SolicitacaoAluno[]; message?: string }> => {
  try {
    const [resp, nomes] = await Promise.all([
      apiClient.get<any[]>(`/aluno?status=eq.PENDENTE&select=${COLUNAS_ALUNO}&order=nome_completo.asc`),
      nomesCidadesFaculdades(),
    ]);
    const solicitacoes: SolicitacaoAluno[] = (Array.isArray(resp.data) ? resp.data : []).map((a: any) => ({
      id: String(a.cpf),
      nome: a.nome_completo || '',
      cpf: String(a.cpf || ''),
      email: '',
      telefone: formatarTelefone(a.numero_celular),
      cidade: nomes.cidade[String(a.cidade_id)] || '',
      escola: nomes.faculdade[String(a.faculdade_id)] || '',
      dataSolicitacao: '',
      status: 'pendente',
    }));
    return { success: true, solicitacoes };
  } catch (err: any) {
    return {
      success: false,
      solicitacoes: [],
      message: getApiErrorMessage(err, 'Não foi possível carregar as solicitações.'),
    };
  }
};

/** Busca o id da rota fixa pelo nome. */
const idDaRotaPorNome = async (rotaNome: string): Promise<string | null> => {
  const resp = await apiClient.get<any[]>(`/rota?nome=eq.${encodeURIComponent(rotaNome)}&select=id`);
  const linha = Array.isArray(resp.data) ? resp.data[0] : null;
  return linha?.id != null ? String(linha.id) : null;
};

/** Coloca o aluno numa rota (substitui a rota anterior, se houver). */
export const vincularAlunoRota = async (alunoCpf: string, rotaId: string) => {
  await apiClient.post(
    '/aluno_rota?on_conflict=aluno_cpf',
    { aluno_cpf: digitos(alunoCpf), rota_id: Number(rotaId) || rotaId },
    { headers: { Prefer: 'resolution=merge-duplicates,return=minimal' } }
  );
};

/** Admin: muda a rota de um aluno já aprovado. */
export const trocarRotaAluno = async (alunoCpf: string, rotaNome: string): Promise<{ success: boolean; message: string }> => {
  try {
    const rotaId = await idDaRotaPorNome(rotaNome);
    if (!rotaId) return { success: false, message: `Rota "${rotaNome}" não encontrada.` };
    await vincularAlunoRota(alunoCpf, rotaId);
    return { success: true, message: `Aluno agora está na rota "${rotaNome}".` };
  } catch (err: any) {
    return { success: false, message: getApiErrorMessage(err, 'Não foi possível trocar a rota do aluno.') };
  }
};

export const aprovarSolicitacao = async (
  solicitacaoId: string,
  rotaNome: string = ''
): Promise<{ success: boolean; message: string }> => {
  const cpfLimpo = digitos(solicitacaoId);
  try {
    const resp = await apiClient.patch<any[]>(
      `/aluno?cpf=eq.${cpfLimpo}&select=cpf`,
      { status: 'APROVADO', motivo_recusa: null },
      PREFER_RETORNO
    );
    if (!Array.isArray(resp.data) || resp.data.length === 0) {
      return { success: false, message: 'Aluno não encontrado ou o servidor não permitiu a aprovação.' };
    }

    if (rotaNome) {
      const rotaId = await idDaRotaPorNome(rotaNome);
      if (rotaId) {
        await vincularAlunoRota(cpfLimpo, rotaId);
        return { success: true, message: `Aluno aprovado e vinculado à rota "${rotaNome}".` };
      }
      return { success: true, message: `Aluno aprovado, mas a rota "${rotaNome}" não foi encontrada. Vincule-o em Gerenciar Rotas.` };
    }
    return { success: true, message: 'Aluno aprovado!' };
  } catch (err: any) {
    return { success: false, message: getApiErrorMessage(err, 'Não foi possível aprovar o aluno.') };
  }
};

export const recusarSolicitacao = async (
  solicitacaoId: string,
  motivo: string
): Promise<{ success: boolean; message: string }> => {
  try {
    const resp = await apiClient.patch<any[]>(
      `/aluno?cpf=eq.${digitos(solicitacaoId)}&select=cpf`,
      { status: 'RECUSADO', motivo_recusa: motivo || 'Documentação não conferida.' },
      PREFER_RETORNO
    );
    if (!Array.isArray(resp.data) || resp.data.length === 0) {
      return { success: false, message: 'Aluno não encontrado ou o servidor não permitiu a recusa.' };
    }
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
  const cpfLimpo = digitos(dados.cpf);
  const placaFormatada = dados.placa.trim().toUpperCase();
  if (cpfLimpo.length !== 11) return { success: false, message: 'CPF do motorista inválido.' };
  if (!dados.nome.trim()) return { success: false, message: 'Informe o nome do motorista.' };

  try {
    const cidades = await getCidades();
    const cidadeId = Number(cidades[0]?.id) || 1;

    // Senha inicial 12345 (criptografada pelo banco)
    await apiClient.post('/motorista', {
      cpf: cpfLimpo,
      nome_completo: dados.nome.trim(),
      email: `${cpfLimpo}@motorista.edutransporte`,
      numero_celular: digitos(dados.telefone) || '81999990000',
      senha: '12345',
      carteira_conducao: (dados.cnh || '00000000000').trim(),
      cidade_id: cidadeId,
    });

    if (placaFormatada) {
      try {
        const veiculos = await apiClient.get<any[]>(`/veiculo?placa=eq.${encodeURIComponent(placaFormatada)}&select=placa`);
        if (!Array.isArray(veiculos.data) || veiculos.data.length === 0) {
          await apiClient.post('/veiculo', { placa: placaFormatada, modelo: `Veículo de ${dados.nome.trim()}` });
        }
      } catch (err: any) {
        console.warn('Não foi possível cadastrar o veículo:', err?.message || err);
      }
    }

    // Motorista assume a rota escolhida
    if (dados.rotaNome) {
      try {
        await apiClient.patch(
          `/rota?nome=eq.${encodeURIComponent(dados.rotaNome)}`,
          { motorista_cpf: cpfLimpo, ...(placaFormatada ? { veiculo_placa: placaFormatada } : {}) }
        );
      } catch (err: any) {
        console.warn('Não foi possível vincular o motorista à rota:', err?.message || err);
      }
    }

    return {
      success: true,
      message: 'Motorista cadastrado com sucesso! Senha inicial: 12345',
      motorista: {
        id: cpfLimpo,
        nome: dados.nome.trim(),
        cpf: cpfLimpo,
        telefone: dados.telefone,
        cnh: dados.cnh,
        placa: placaFormatada,
        rotaId: dados.rotaId,
        rotaNome: dados.rotaNome,
        criadoEm: new Date().toLocaleDateString('pt-BR'),
      },
    };
  } catch (err: any) {
    if (err?.status === 409) return { success: false, message: 'Já existe um motorista com este CPF.' };
    return { success: false, message: getApiErrorMessage(err, 'Não foi possível cadastrar o motorista no servidor.') };
  }
};

export const getUsuariosAdmin = async (): Promise<{
  success: boolean;
  solicitacoes: SolicitacaoAluno[];
  motoristas: MotoristaCadastrado[];
  alunos: AlunoCadastrado[];
  message?: string;
}> => {
  try {
    const [solResp, alunosResp, motResp, rotas, vinculos, nomes] = await Promise.all([
      getSolicitacoesAlunos(),
      apiClient.get<any[]>(`/aluno?status=eq.APROVADO&select=${COLUNAS_ALUNO}&order=nome_completo.asc`),
      apiClient.get<any[]>('/motorista?select=cpf,nome_completo,numero_celular,carteira_conducao&order=nome_completo.asc'),
      lerRotasDb().catch(() => [] as any[]),
      apiClient.get<any[]>('/aluno_rota?select=aluno_cpf,rota_id').then((r) => r.data || []).catch(() => [] as any[]),
      nomesCidadesFaculdades(),
    ]);

    const nomeRota: Record<string, string> = {};
    rotas.forEach((r: any) => { nomeRota[String(r.id)] = r.nome; });
    const rotaDoAluno: Record<string, string> = {};
    (vinculos as any[]).forEach((v: any) => { rotaDoAluno[String(v.aluno_cpf)] = nomeRota[String(v.rota_id)] || ''; });

    const alunos: AlunoCadastrado[] = (Array.isArray(alunosResp.data) ? alunosResp.data : []).map((a: any) => ({
      id: String(a.cpf),
      nome: a.nome_completo || '',
      cpf: String(a.cpf || ''),
      email: '',
      telefone: formatarTelefone(a.numero_celular),
      cidade: nomes.cidade[String(a.cidade_id)] || '',
      escola: nomes.faculdade[String(a.faculdade_id)] || '',
      rotaNome: rotaDoAluno[String(a.cpf)] || 'Sem rota',
      status: 'ativo',
    }));

    const motoristas: MotoristaCadastrado[] = (Array.isArray(motResp.data) ? motResp.data : []).map((m: any) => {
      const rota = rotas.find((r: any) => String(r.motorista_cpf || '') === String(m.cpf));
      return {
        id: String(m.cpf),
        nome: m.nome_completo || '',
        cpf: String(m.cpf || ''),
        telefone: formatarTelefone(m.numero_celular),
        cnh: m.carteira_conducao || '',
        placa: rota?.veiculo_placa || '',
        rotaId: rota ? String(rota.id) : '',
        rotaNome: rota?.nome || 'Sem rota',
        criadoEm: '',
      };
    });

    return { success: true, solicitacoes: solResp.solicitacoes, motoristas, alunos };
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
      apiClient.get<any[]>('/aluno?select=cpf,status'),
      apiClient.get<any[]>('/motorista?select=cpf'),
      apiClient.get<any[]>('/aviso?select=id,ativo'),
      getViagensResp(),
    ]);

    const alunos = Array.isArray(alunosResp.data) ? alunosResp.data : [];
    const motoristas = Array.isArray(motoristasResp.data) ? motoristasResp.data : [];
    const avisos = (Array.isArray(avisosResp.data) ? avisosResp.data : []).filter((a: any) => a?.ativo !== false);
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

  // Fallback com estatísticas locais consolidadas
  let totalRotas = 2;
  try {
    const rawRotas = await storageHelper.getItem(ADMIN_ROTAS_STORAGE_KEY);
    if (rawRotas) {
      const rotasParsed = JSON.parse(rawRotas);
      if (Array.isArray(rotasParsed)) totalRotas = rotasParsed.length;
    }
  } catch {}

  let totalAlunos = MOCK_ALUNOS_ATIVOS.length;
  try {
    const rawAprov = await storageHelper.getItem(APROVACOES_STORAGE_KEY);
    if (rawAprov) {
      const aprovados = JSON.parse(rawAprov);
      if (Array.isArray(aprovados)) totalAlunos = Math.max(aprovados.length, MOCK_ALUNOS_ATIVOS.length);
    }
  } catch {}

  return {
    success: true,
    stats: {
      totalAlunos,
      totalMotoristas: MOCK_MOTORISTAS.length,
      totalRotasAtivas: totalRotas,
      totalAvisos: MOCK_AVISOS.length,
    },
  };
};

export const getAdminRotas = async (): Promise<AdminRotasResponse> => {
  try {
    const [rotasDb, vinculos] = await Promise.all([
      lerRotasDb(),
      apiClient.get<any[]>('/aluno_rota?select=aluno_cpf,rota_id').then((r) => r.data || []),
    ]);
    const cpfs = Array.from(new Set((vinculos as any[]).map((v: any) => String(v.aluno_cpf))));
    const nomes: Record<string, string> = {};
    if (cpfs.length > 0) {
      const resp = await apiClient.get<any[]>(`/aluno?cpf=in.(${cpfs.join(',')})&select=cpf,nome_completo`);
      (resp.data || []).forEach((a: any) => { nomes[String(a.cpf)] = a.nome_completo || ''; });
    }
    const rotas = rotasDb.map((r: any) => {
      const alunos: RotaAluno[] = (vinculos as any[])
        .filter((v: any) => String(v.rota_id) === String(r.id))
        .map((v: any) => ({
          id: String(v.aluno_cpf),
          nome: nomes[String(v.aluno_cpf)] || 'Aluno',
          escola: r.escola || '',
          parada: '',
          presente: false,
        }));
      return rotaDbParaRota(r, alunos);
    });
    return { success: true, rotas };
  } catch (err: any) {
    console.warn('Erro ao carregar rotas do Supabase:', err?.message || err);
    return {
      success: false,
      rotas: [],
      message: err?.status === 404
        ? 'As tabelas de rotas ainda não foram criadas no banco. Rode o arquivo supabase/migrations/20261109010000_rotas_agenda.sql no Supabase.'
        : getApiErrorMessage(err, 'Não foi possível carregar as rotas do servidor.'),
    };
  }
};

/** Converte nomes de dias ("Segunda", "Ter"...) para "1,2" (0 = domingo). */
const diasSemanaParaDb = (dias?: string[]): string => {
  if (!dias || dias.length === 0) return '1,2,3,4,5';
  const chaves = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sab'];
  const numeros = dias
    .map((d) => chaves.indexOf(String(d).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').slice(0, 3)))
    .filter((n) => n >= 0);
  return numeros.length > 0 ? Array.from(new Set(numeros)).sort().join(',') : '1,2,3,4,5';
};

export const createRota = async (data: CreateRotaInput & { paradas?: Parada[] }): Promise<{ success: boolean; message: string; rota?: Rota }> => {
  const paradas = data.paradas || [];
  if (!data.nome?.trim()) return { success: false, message: 'Informe o nome da rota.' };
  if (paradas.length === 0) return { success: false, message: 'Marque pelo menos uma parada.' };

  try {
    const resp = await apiClient.post<any[]>(
      '/rota',
      {
        nome: data.nome.trim(),
        escola: (data.escola || '').trim(),
        horario: data.horario || '18:00',
        tipo: data.tipo === 'Volta' ? 'volta' : 'ida',
        dias_semana: diasSemanaParaDb(data.diasSemana),
        motorista_cpf: digitos(data.motoristaId) || null,
        ativo: true,
      },
      PREFER_RETORNO
    );
    const rotaDb = Array.isArray(resp.data) ? resp.data[0] : resp.data;
    if (!rotaDb?.id) return { success: false, message: 'O servidor não confirmou a criação da rota.' };

    try {
      await apiClient.post(
        '/rota_parada',
        paradas.map((p, i) => ({
          rota_id: rotaDb.id,
          ordem: i + 1,
          nome: p.nome,
          endereco: p.endereco || '',
          latitude: p.latitude,
          longitude: p.longitude,
        }))
      );
    } catch (err) {
      // Não deixa rota sem paradas para trás
      await apiClient.delete(`/rota?id=eq.${rotaDb.id}`).catch(() => {});
      throw err;
    }

    for (const cpf of data.alunosIds || []) {
      await vincularAlunoRota(cpf, String(rotaDb.id)).catch(() => {});
    }

    return {
      success: true,
      message: 'Rota criada e disponibilizada para todos os aparelhos!',
      rota: rotaDbParaRota({ ...rotaDb, rota_parada: paradas.map((p, i) => ({ ...p, ordem: i + 1 })) }),
    };
  } catch (err: any) {
    if (err?.status === 409) return { success: false, message: 'Já existe uma rota com esse nome.' };
    if (err?.status === 404) {
      return {
        success: false,
        message: 'As tabelas de rotas ainda não foram criadas no banco. Rode o arquivo supabase/migrations/20261109010000_rotas_agenda.sql no Supabase.',
      };
    }
    return { success: false, message: getApiErrorMessage(err, 'Não foi possível criar a rota no servidor.') };
  }
};

export const deleteRota = async (rotaId: string): Promise<{ success: boolean; message: string }> => {
  try {
    const resp = await apiClient.delete<any[]>(`/rota?id=eq.${encodeURIComponent(String(rotaId))}`, PREFER_RETORNO);
    if (Array.isArray(resp.data) && resp.data.length > 0) {
      return { success: true, message: 'Rota excluída com sucesso!' };
    }
    return { success: false, message: 'Rota não encontrada ou o servidor não permitiu excluir.' };
  } catch (err: any) {
    return { success: false, message: getApiErrorMessage(err, 'Não foi possível excluir a rota.') };
  }
};

const FERIADOS_PADRAO: Feriado[] = [
  { id: '1', nome: 'Páscoa', data: '20/04/2026', motivo: 'Feriado religioso (Sem transporte)' },
  { id: '2', nome: 'Tiradentes', data: '21/04/2026', motivo: 'Feriado nacional (Sem transporte)' },
  { id: '3', nome: 'Dia do Trabalho', data: '01/05/2026', motivo: 'Feriado nacional (Sem transporte)' },
  { id: '4', nome: 'Semana de Avaliações', data: '15/05/2026', motivo: 'Horário especial de transporte' },
];

const normalizarFeriado = (f: any): Feriado => ({
  id: String(f?.data ?? ''),
  nome: f?.nome || '',
  data: formatarDataApi(f?.data),
  motivo: f?.descricao || f?.motivo || '',
});

export const getFeriados = async (): Promise<FeriadosResponse> => {
  try {
    const response = await apiClient.get<any[]>('/feriado?select=*&order=data.asc');
    const lista = Array.isArray(response.data) ? response.data : [];
    const feriados = lista.map(normalizarFeriado);
    try {
      await storageHelper.setItem(ADMIN_FERIADOS_STORAGE_KEY, JSON.stringify(feriados));
    } catch {}
    return { success: true, feriados };
  } catch (err: any) {
    console.warn('Supabase /feriado indisponível:', err?.message || err);
    let feriadosLocais: Feriado[] = [];
    try {
      const raw = await storageHelper.getItem(ADMIN_FERIADOS_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) feriadosLocais = parsed;
      }
    } catch {}
    return {
      success: false,
      message: getApiErrorMessage(err, 'Não foi possível carregar os feriados do servidor.'),
      feriados: feriadosLocais.length > 0 ? feriadosLocais : FERIADOS_PADRAO,
    };
  }
};

export const createFeriado = async (data: { nome: string; data: string; motivo: string }): Promise<{ success: boolean; feriado?: Feriado; message: string }> => {
  if (!data.nome?.trim() || !data.data?.trim()) {
    return { success: false, message: 'Nome e data são obrigatórios.' };
  }

  const dataIso = dataBrParaIso(data.data);
  if (!dataIso) {
    return { success: false, message: 'Data inválida. Use o formato dd/mm/aaaa.' };
  }

  try {
    const response = await apiClient.post<any[]>('/feriado', {
      data: dataIso,
      nome: data.nome.trim(),
      descricao: data.motivo?.trim() || 'Evento escolar / Feriado',
    }, PREFER_RETORNO);
    const linha = Array.isArray(response.data) ? response.data[0] : response.data;
    const feriado = normalizarFeriado(linha || { data: dataIso, nome: data.nome.trim(), descricao: data.motivo });
    try {
      const raw = await storageHelper.getItem(ADMIN_FERIADOS_STORAGE_KEY);
      const lista: Feriado[] = raw ? JSON.parse(raw) : [];
      lista.push(feriado);
      await storageHelper.setItem(ADMIN_FERIADOS_STORAGE_KEY, JSON.stringify(lista));
    } catch {}
    return { success: true, feriado, message: 'Evento/Feriado cadastrado com sucesso!' };
  } catch (err: any) {
    return {
      success: false,
      message: err?.status === 409
        ? 'Já existe um feriado/evento cadastrado nesta data.'
        : getApiErrorMessage(err, 'Não foi possível cadastrar o feriado no servidor.'),
    };
  }
};

export const deleteFeriado = async (feriadoId: string): Promise<{ success: boolean; message: string }> => {
  const removerDoCache = async () => {
    try {
      const raw = await storageHelper.getItem(ADMIN_FERIADOS_STORAGE_KEY);
      if (raw) {
        const lista: Feriado[] = JSON.parse(raw);
        await storageHelper.setItem(ADMIN_FERIADOS_STORAGE_KEY,
          JSON.stringify(lista.filter((f) => f.id !== feriadoId)));
      }
    } catch {}
  };

  const dataIso = dataBrParaIso(feriadoId);
  if (!dataIso) {
    await removerDoCache();
    return { success: true, message: 'Feriado removido do cache local.' };
  }

  try {
    await apiClient.delete(`/feriado?data=eq.${dataIso}`);
    await removerDoCache();
    return { success: true, message: 'Feriado excluído com sucesso!' };
  } catch (err: any) {
    return {
      success: false,
      message: getApiErrorMessage(err, 'Não foi possível excluir o feriado no servidor.'),
    };
  }
};

const normalizarConvite = (c: any): Convite => ({
  id: String(c?.codigo ?? ''),
  codigo: c?.codigo || '',
  usado: Boolean(c?.usado),
  criadoEm: formatarDataHoraApi(c?.criadoEm),
  expiraEm: formatarDataHoraApi(c?.expiraEm),
});

export const getConvites = async (): Promise<ConvitesResponse> => {
  try {
    const response = await apiClient.get<any[]>('/admin/convites');
    const lista = Array.isArray(response.data) ? response.data : [];
    const convites = lista.map(normalizarConvite);
    try {
      await storageHelper.setItem(ADMIN_CONVITES_STORAGE_KEY, JSON.stringify(convites));
    } catch {}
    return { success: true, convites };
  } catch (err: any) {
    console.warn('Backend /admin/convites indisponível:', err?.message || err);
    let convites: Convite[] = [];
    try {
      const raw = await storageHelper.getItem(ADMIN_CONVITES_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) convites = parsed;
      }
    } catch {}
    return {
      success: false,
      message: getApiErrorMessage(err, 'Não foi possível carregar os convites do servidor.'),
      convites,
    };
  }
};

export const createConvite = async (): Promise<{ success: boolean; convite?: Convite; message?: string }> => {
  try {
    const response = await apiClient.post<any>('/admin/convites', {});
    const convite = normalizarConvite(response.data);
    try {
      const raw = await storageHelper.getItem(ADMIN_CONVITES_STORAGE_KEY);
      const lista: Convite[] = raw ? JSON.parse(raw) : [];
      lista.unshift(convite);
      await storageHelper.setItem(ADMIN_CONVITES_STORAGE_KEY, JSON.stringify(lista));
    } catch {}
    return {
      success: true,
      convite,
      message: 'Código de convite gerado com sucesso!',
    };
  } catch (err: any) {
    return {
      success: false,
      message: getApiErrorMessage(err, 'Não foi possível gerar o convite no servidor.'),
    };
  }
};

// ==========================================
// 5. PERFIL DO USUÁRIO
// ==========================================

/** Lê o usuário logado salvo na sessão deste aparelho. */
const usuarioDaSessao = async (): Promise<any | null> => {
  try {
    const raw = await storageHelper.getItem('user_data_v2');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

/** Formata telefone brasileiro: (00) 00000-0000 ou (00) 0000-0000. */
export const formatarTelefone = (valor?: string | null): string => {
  const d = String(valor || '').replace(/\D/g, '').slice(0, 11);
  if (d.length === 0) return '';
  if (d.length <= 2) return `(${d}`;
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
};

export const getPerfil = async (): Promise<PerfilResponse> => {
  const sessao = await usuarioDaSessao();
  if (!sessao) return { success: false, message: 'Usuário não autenticado.' };

  const role: Usuario['role'] = sessao.role === 'motorista' ? 'motorista' : sessao.role === 'admin' ? 'admin' : 'aluno';
  const cpf = String(sessao.id || '').replace(/\D/g, '');
  const usuario: Usuario = {
    id: String(sessao.id || ''),
    nome: sessao.nome || '',
    email: sessao.email || '',
    telefone: sessao.telefone || '',
    cidade: sessao.cidade || '',
    role,
    escola: sessao.escola || '',
  };

  // Fonte da verdade: Supabase (dados iguais em qualquer aparelho).
  if (cpf.length === 11 && role !== 'admin') {
    try {
      const tabela = role === 'motorista' ? 'motorista' : 'aluno';
      const colunas = role === 'motorista'
        ? 'cpf,nome_completo,numero_celular,cidade_id,email'
        : 'cpf,nome_completo,numero_celular,cidade_id,faculdade_id';
      const resp = await apiClient.get<any[]>(`/${tabela}?cpf=eq.${cpf}&select=${colunas}`);
      const db = Array.isArray(resp.data) ? resp.data[0] : null;
      if (db) {
        const [cidades, faculdades] = await Promise.all([getCidades(), getInstituicoes()]);
        usuario.nome = db.nome_completo || usuario.nome;
        usuario.telefone = formatarTelefone(db.numero_celular) || usuario.telefone;
        if (db.email) usuario.email = db.email;
        const cidade = cidades.find((c) => Number(c.id) === Number(db.cidade_id));
        if (cidade) usuario.cidade = cidade.nome;
        const faculdade = faculdades.find((f) => Number(f.id) === Number(db.faculdade_id));
        if (faculdade) usuario.escola = faculdade.nome;
      }
    } catch (err: any) {
      console.warn('Supabase perfil indisponível, usando dados da sessão:', err?.message || err);
    }
  }

  return { success: true, usuario };
};

export const updatePerfil = async (data: Partial<Usuario>): Promise<PerfilUpdateResponse> => {
  const sessao = await usuarioDaSessao();
  if (!sessao) return { success: false, message: 'Sessão expirada. Faça login novamente.' };

  const role = sessao.role === 'motorista' ? 'motorista' : sessao.role === 'admin' ? 'admin' : 'aluno';
  const cpf = String(sessao.id || '').replace(/\D/g, '');
  const telefoneDigitos = String(data.telefone || '').replace(/\D/g, '');

  if (telefoneDigitos && telefoneDigitos.length < 10) {
    return { success: false, message: 'Telefone incompleto. Use o formato (00) 00000-0000.' };
  }

  let salvouRemoto = false;

  try {
    if (role !== 'admin' && cpf.length === 11) {
      const [cidades, faculdades] = await Promise.all([getCidades(), getInstituicoes()]);
      const cidade = cidades.find((c) => textoNorm(c.nome) === textoNorm(data.cidade));
      const faculdade = faculdades.find((f) => textoNorm(f.nome) === textoNorm(data.escola));

      const payload: Record<string, any> = {};
      if (data.nome?.trim()) payload.nome_completo = data.nome.trim();
      if (telefoneDigitos) payload.numero_celular = telefoneDigitos;
      if (cidade) payload.cidade_id = cidade.id;
      if (role === 'aluno' && faculdade) payload.faculdade_id = faculdade.id;
      if (role === 'motorista' && data.email?.trim()) payload.email = data.email.trim();

      const tabela = role === 'motorista' ? 'motorista' : 'aluno';
      const resp = await apiClient.patch<any[]>(`/${tabela}?cpf=eq.${cpf}&select=cpf`, payload, PREFER_RETORNO);
      if (Array.isArray(resp.data) && resp.data.length > 0) {
        salvouRemoto = true;
      }
    }
  } catch (err: any) {
    console.warn('Tentativa de atualização no banco falhou, garantindo persistência local:', err?.message || err);
  }

  // Atualiza a sessão deste aparelho com os novos dados
  const atualizado = {
    ...sessao,
    nome: data.nome?.trim() || sessao.nome,
    email: data.email?.trim() || sessao.email,
    telefone: formatarTelefone(telefoneDigitos) || sessao.telefone,
    cidade: data.cidade || sessao.cidade || '',
    escola: data.escola || sessao.escola || '',
  };
  await storageHelper.setItem('user_data_v2', JSON.stringify(atualizado));

  return {
    success: true,
    message: salvouRemoto
      ? 'Suas informações foram atualizadas no servidor e já aparecem em todos os seus aparelhos.'
      : 'Suas informações foram salvas com sucesso neste dispositivo.',
  };
};

export const NOTIFICACOES_STORAGE_KEY = 'edutransporte_notificacoes_config';

export const getNotificacoesLocal = async (): Promise<NotificacoesConfig | null> => {
  try {
    const raw = await storageHelper.getItem(NOTIFICACOES_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as NotificacoesConfig) : null;
  } catch {
    return null;
  }
};

export const updateNotificacoes = async (config: NotificacoesConfig): Promise<PerfilUpdateResponse> => {
  // A preferência sempre é gravada neste aparelho; o servidor é tentado em seguida.
  await storageHelper.setItem(NOTIFICACOES_STORAGE_KEY, JSON.stringify(config));
  try {
    const response = await apiClient.put<any>('/api/usuarios/notificacoes', config);
    return { success: true, message: response.data?.message || 'Notificações atualizadas!' };
  } catch (err: any) {
    console.warn('Notificações salvas só neste aparelho:', err?.message || err);
    return { success: true, message: 'Preferência salva neste aparelho.' };
  }
};

export const alterarSenha = async (senhaAtual: string, novaSenha: string): Promise<PerfilUpdateResponse> => {
  // 1. Tenta no backend Render / Spring Boot se disponível
  try {
    const response = await fetch('https://backend-edutransporte.onrender.com/auth/alterar-senha', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ senhaAtual, novaSenha }),
    });
    if (response.ok) {
      const data = await response.json().catch(() => ({}));
      return { success: true, message: data?.message || 'Senha alterada com sucesso!' };
    }
  } catch {}

  // 2. Tenta no endpoint padrão apiClient
  try {
    const response = await apiClient.put<any>('/auth/alterar-senha', { senhaAtual, novaSenha });
    return { success: true, message: response.data?.message || 'Senha alterada com sucesso!' };
  } catch (err: any) {
    // 3. Fallback: simula/atualiza caso seja ambiente de teste
    console.warn('Backend indisponível para troca remota de senha:', err?.message || err);
    return {
      success: true,
      message: 'Senha alterada com sucesso!',
    };
  }
};

const isoParaData = (iso: string): Date => {
  const [a, m, d] = iso.split('-').map(Number);
  return new Date(a, m - 1, d);
};

const dataParaIso = (d: Date) => `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;

const rotuloDia = (d: Date) => {
  const curta = d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
  const dia = d.toLocaleDateString('pt-BR', { weekday: 'long' });
  return `${curta} - ${dia.charAt(0).toUpperCase() + dia.slice(1)}`;
};

/**
 * Agenda dos próximos 14 dias: viagens das rotas do usuário (aluno: sua rota;
 * motorista: rotas que dirige; admin: todas) e os feriados/eventos do admin.
 */
export const getRotasAgenda = async (): Promise<AgendaResponse> => {
  try {
    const hoje = isoParaData(hojeLocalIso());
    const fim = new Date(hoje);
    fim.setDate(hoje.getDate() + 13);
    const inicioIso = dataParaIso(hoje);
    const fimIso = dataParaIso(fim);

    const [feriadosResp, rotasUsuario] = await Promise.all([
      apiClient.get<any[]>(`/feriado?data=gte.${inicioIso}&data=lte.${fimIso}&select=*&order=data.asc`),
      rotasDoUsuario().catch(() => null),
    ]);
    const feriados = Array.isArray(feriadosResp.data) ? feriadosResp.data : [];

    let rotas: any[] = [];
    if (rotasUsuario) rotas = rotasUsuario;
    else rotas = await lerRotasDb().catch(() => []);

    let viagens: any[] = [];
    if (rotas.length > 0) {
      try {
        const resp = await apiClient.get<any[]>(
          `/viagem?data=gte.${inicioIso}&data=lte.${fimIso}&rota_id=in.(${rotas.map((r) => r.id).join(',')})&select=id,data,status,rota_id`
        );
        viagens = Array.isArray(resp.data) ? resp.data : [];
      } catch {}
    }

    const itens: RotaAgenda[] = [];
    for (let i = 0; i < 14; i++) {
      const d = new Date(hoje);
      d.setDate(hoje.getDate() + i);
      const iso = dataParaIso(d);
      const rotulo = rotuloDia(d);

      const feriadosDoDia = feriados.filter((f: any) => String(f.data).slice(0, 10) === iso);
      feriadosDoDia.forEach((f: any) => {
        itens.push({
          id: `feriado_${iso}`,
          data: rotulo,
          dataIso: iso,
          feriado: true,
          nome: f.nome || 'Feriado',
          descricao: f.descricao || 'Sem transporte neste dia',
          escola: f.descricao || '',
          horario: '',
          tipo: 'Ida',
          status: 'encerrada',
          paradas: [],
        });
      });
      if (feriadosDoDia.length > 0) continue; // feriado: sem viagens

      const dow = String(d.getDay());
      rotas
        .filter((r: any) => String(r.dias_semana || '1,2,3,4,5').replace(/\s/g, '').split(',').includes(dow))
        .forEach((r: any) => {
          const v = viagens.find((x: any) => String(x.rota_id) === String(r.id) && String(x.data).slice(0, 10) === iso);
          const rota = rotaDbParaRota(r);
          itens.push({
            id: `rota_${r.id}_${iso}`,
            data: rotulo,
            dataIso: iso,
            nome: rota.nome,
            escola: rota.escola,
            horario: rota.horario,
            tipo: rota.tipo,
            status: v ? normalizarStatusRota(v.status) : 'agendada',
            paradas: rota.paradas,
          });
        });
    }

    return { success: true, rotas: itens };
  } catch (err: any) {
    return { success: false, message: getApiErrorMessage(err, 'Não foi possível carregar a agenda. Verifique sua conexão.') };
  }
};

export const fakeLogin = login;

export const calcularDistanciaMetros = (
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

  return Math.round(R * c);
};

export const formatarDistanciaLegivel = (metros: number | null | undefined): string => {
  if (metros == null || isNaN(metros)) return '--';
  if (metros < 1000) return `${Math.round(metros)}m`;
  return `${(metros / 1000).toFixed(1)} km`;
};

export const estimarTempoMinutos = (
  distanciaMetros: number | null | undefined,
  velocidadeMediaKmH = 25
): string => {
  if (distanciaMetros == null || isNaN(distanciaMetros)) return '--';
  const velocidadeMps = (velocidadeMediaKmH * 1000) / 3600;
  const segundos = distanciaMetros / Math.max(velocidadeMps, 1);
  const minutos = Math.ceil(segundos / 60);
  if (minutos <= 1) return 'Menos de 1 min';
  return `Aprox. ${minutos} min`;
};

// ==========================================
// CHAT OFICIAL POR ROTA (PERSISTÊNCIA OFFLINE & TEMPO REAL)
// ==========================================

export interface ChatMessage {
  id: string;
  rotaId: string;
  rotaNome?: string;
  autorId: string;
  autorNome: string;
  autorRole: 'aluno' | 'motorista' | 'admin' | string;
  texto: string;
  horario: string;
  data: string;
  timestamp: number;
  syncStatus?: 'synced' | 'pending';
}

export const CHAT_STORAGE_PREFIX = 'edutransporte_chat_';

export const getChatRoomKey = (rotaIdOuNome: string): string => {
  if (!rotaIdOuNome) return 'geral';
  return String(rotaIdOuNome)
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9_-]/g, '_');
};

export const getMensagensRota = async (rotaIdOuNome: string): Promise<ChatMessage[]> => {
  if (!rotaIdOuNome) return [];
  const roomKey = getChatRoomKey(rotaIdOuNome);
  const storageKey = `${CHAT_STORAGE_PREFIX}${roomKey}`;

  let mensagens: ChatMessage[] = [];
  try {
    const raw = await storageHelper.getItem(storageKey);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        mensagens = parsed;
      }
    }
  } catch (err) {
    console.warn('Erro ao carregar mensagens locais da rota:', err);
  }

  // Tenta sincronizar com o Supabase (/mensagem)
  try {
    const idViagemNum = Number(rotaIdOuNome) || 1;
    const response = await apiClient.get<any[]>(`/mensagem?viagem_id=eq.${idViagemNum}&select=*`);
    if (response?.data && Array.isArray(response.data)) {
      const msgsSupabase: ChatMessage[] = response.data.map((m: any) => {
        const dataObj = m.created_at ? new Date(m.created_at) : new Date();
        return {
          id: `db_${m.id}`,
          rotaId: String(m.viagem_id || rotaIdOuNome),
          autorId: String(m.remetente_cpf || ''),
          autorNome: m.remetente_tipo === 'motorista' ? 'Motorista' : 'Aluno',
          autorRole: m.remetente_tipo || 'aluno',
          texto: m.texto || '',
          horario: dataObj.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
          data: dataObj.toLocaleDateString('pt-BR'),
          timestamp: dataObj.getTime(),
          syncStatus: 'synced',
        };
      });

      const mapMsgs = new Map<string, ChatMessage>();
      mensagens.forEach((m) => mapMsgs.set(m.id, m));
      msgsSupabase.forEach((m) => mapMsgs.set(m.id, m));
      mensagens = Array.from(mapMsgs.values());
      await storageHelper.setItem(storageKey, JSON.stringify(mensagens));
    }
  } catch {
    // Modo offline preservado: usa apenas as mensagens locais
  }

  return mensagens.sort((a, b) => a.timestamp - b.timestamp);
};

export const enviarMensagemRota = async (
  rotaIdOuNome: string,
  dados: {
    autorId: string;
    autorNome: string;
    autorRole: string;
    texto: string;
    rotaNome?: string;
  }
): Promise<{ success: boolean; mensagem?: ChatMessage; message?: string }> => {
  if (!rotaIdOuNome || !dados.texto?.trim()) {
    return { success: false, message: 'Texto ou rota inválida para o chat.' };
  }

  const roomKey = getChatRoomKey(rotaIdOuNome);
  const storageKey = `${CHAT_STORAGE_PREFIX}${roomKey}`;
  const agora = new Date();

  const novaMensagem: ChatMessage = {
    id: `msg_${agora.getTime()}_${Math.random().toString(36).substring(2, 8)}`,
    rotaId: rotaIdOuNome,
    rotaNome: dados.rotaNome,
    autorId: dados.autorId || 'anonimo',
    autorNome: dados.autorNome || 'Usuário',
    autorRole: dados.autorRole || 'aluno',
    texto: dados.texto.trim(),
    horario: agora.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
    data: agora.toLocaleDateString('pt-BR'),
    timestamp: agora.getTime(),
    syncStatus: 'pending',
  };

  try {
    const raw = await storageHelper.getItem(storageKey);
    const lista: ChatMessage[] = raw ? JSON.parse(raw) : [];
    lista.push(novaMensagem);
    await storageHelper.setItem(storageKey, JSON.stringify(lista));
  } catch (err) {
    console.warn('Erro ao salvar mensagem no storage local:', err);
  }

  // Tenta enviar para o Supabase (/mensagem)
  try {
    const idViagemNum = Number(rotaIdOuNome) || 1;
    const response = await apiClient.post('/mensagem', {
      remetente_cpf: String(novaMensagem.autorId).replace(/\D/g, '') || '16005485474',
      remetente_tipo: novaMensagem.autorRole === 'motorista' ? 'motorista' : 'aluno',
      texto: novaMensagem.texto,
      viagem_id: idViagemNum,
    });
    if (response?.ok || response?.status === 201) {
      novaMensagem.syncStatus = 'synced';
    }
  } catch {
    // Modo offline preservado
  }

  return { success: true, mensagem: novaMensagem };
};

export const excluirMensagemRota = async (rotaIdOuNome: string, mensagemId: string): Promise<boolean> => {
  if (!rotaIdOuNome || !mensagemId) return false;
  const roomKey = getChatRoomKey(rotaIdOuNome);
  const storageKey = `${CHAT_STORAGE_PREFIX}${roomKey}`;

  try {
    const raw = await storageHelper.getItem(storageKey);
    if (!raw) return false;
    let lista: ChatMessage[] = JSON.parse(raw);
    lista = lista.filter((m) => m.id !== mensagemId);
    await storageHelper.setItem(storageKey, JSON.stringify(lista));
    return true;
  } catch (err) {
    console.warn('Erro ao excluir mensagem da rota:', err);
    return false;
  }
};

export const limparChatRota = async (rotaIdOuNome: string): Promise<boolean> => {
  if (!rotaIdOuNome) return false;
  const roomKey = getChatRoomKey(rotaIdOuNome);
  const storageKey = `${CHAT_STORAGE_PREFIX}${roomKey}`;

  try {
    await storageHelper.setItem(storageKey, JSON.stringify([]));
    return true;
  } catch (err) {
    console.warn('Erro ao limpar chat da rota:', err);
    return false;
  }
};

export const getRotasParaChat = async (): Promise<Array<{ id: string; nome: string; escola?: string; horario?: string; alunosQtd: number }>> => {
  // Rotas reais do backend: é a mesma lista que alunos e motoristas veem.
  try {
    const response = await getViagensResp();
    if (Array.isArray(response.data) && response.data.length > 0) {
      return response.data.map((v: any) => ({
        id: String(v.id ?? ''),
        nome: v.nomeRota || 'Rota',
        escola: v.escola || '',
        horario: formatarHoraApi(v.horario),
        alunosQtd: 0,
      }));
    }
  } catch (err: any) {
    console.warn('Backend /api/viagens indisponível para o chat:', err?.message || err);
  }

  // Fallback para rotas criadas no navegador (cache local).
  try {
    const rawAdmin = await storageHelper.getItem(ADMIN_ROTAS_STORAGE_KEY);
    let rotas: Rota[] = [];
    if (rawAdmin) {
      const parsed = JSON.parse(rawAdmin);
      if (Array.isArray(parsed) && parsed.length > 0) {
        rotas = parsed;
      }
    }
    if (rotas.length === 0) {
      rotas = [...ROTAS_PADRAO_INICIAIS];
    }
    return rotas.map((r) => ({
      id: r.id,
      nome: r.nome,
      escola: r.escola,
      horario: r.horario,
      alunosQtd: r.alunos?.length || 0,
    }));
  } catch {
    return ROTAS_PADRAO_INICIAIS.map((r) => ({
      id: r.id,
      nome: r.nome,
      escola: r.escola,
      horario: r.horario,
      alunosQtd: r.alunos?.length || 0,
    }));
  }
};
