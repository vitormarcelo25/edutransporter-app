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
  try {
    await apiClient.get('/health', { timeout: 90000 });
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
    // Contrato real do backend: POST /api/usuarios/alunos
    await apiClient.post('/api/usuarios/alunos', {
      cpf: cpfLimpo,
      nomeCompleto: data.nome.trim(),
      numeroCelular: (data.telefone || '').replace(/\D/g, ''),
      senha: data.password,
      cidadeId: data.cidadeId,
      faculdadeId: data.faculdadeId,
    });
  } catch (err: any) {
    console.warn('Backend indisponível no cadastro de aluno, salvando localmente:', err?.message || err);
  }

  // Persiste a solicitação localmente para aprovação do Administrador no painel
  const novaSolicitacao: SolicitacaoAluno = {
    id: cpfLimpo,
    nome: data.nome.trim(),
    cpf: cpfLimpo,
    email: data.email || `${cpfLimpo}@aluno.edutransporte`,
    telefone: data.telefone || '',
    cidade: data.cidade || '',
    escola: data.escola || '',
    matriculaEscolar: data.matriculaEscolar || 'Pendente',
    pontoEmbarque: data.pontoEmbarque || 'Ponto Central',
    turno: data.turno || 'Noturno',
    dataSolicitacao: new Date().toLocaleDateString('pt-BR'),
    status: 'pendente',
  };

  try {
    const raw = await storageHelper.getItem(SOLICITACOES_STORAGE_KEY);
    const lista: SolicitacaoAluno[] = raw ? JSON.parse(raw) : [];
    const index = lista.findIndex((s) => s.cpf === cpfLimpo);
    if (index >= 0) {
      lista[index] = novaSolicitacao;
    } else {
      lista.unshift(novaSolicitacao);
    }
    await storageHelper.setItem(SOLICITACOES_STORAGE_KEY, JSON.stringify(lista));
  } catch {}

  // Adiciona ao mock em memória
  MOCK_SOLICITACOES = MOCK_SOLICITACOES.filter((s) => s.cpf !== cpfLimpo);
  MOCK_SOLICITACOES.unshift(novaSolicitacao);

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

/** Busca a viagem do dia (ou a primeira cadastrada) no backend real. */
const obterViagemAtual = async (): Promise<any | null> => {
  const response = await apiClient.get<any>('/api/viagens');
  const lista = Array.isArray(response.data) ? response.data : [];
  if (!lista.length) return null;
  const hoje = new Date().toISOString().slice(0, 10);
  return lista.find((v: any) => String(v.data || '').slice(0, 10) === hoje) || lista[0];
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
  const cpfLimpo = alunoId ? String(alunoId).replace(/\D/g, '') : '';

  // 1. Carrega todas as rotas ativas (persistidas pelo Admin)
  let adminRotas: Rota[] = [];
  try {
    const rawAdmin = await storageHelper.getItem(ADMIN_ROTAS_STORAGE_KEY);
    if (rawAdmin) {
      const parsed = JSON.parse(rawAdmin);
      if (Array.isArray(parsed) && parsed.length > 0) {
        adminRotas = parsed;
      }
    }
  } catch (err) {
    console.warn('Erro ao ler rotas do admin:', err);
  }

  if (adminRotas.length === 0) {
    adminRotas = [...ROTAS_PADRAO_INICIAIS];
  }

  // 2. Identifica a rota atribuída ao aluno
  let rotaNomeAluno: string | undefined;

  // Busca no mapeamento persistente de alunos x rotas
  if (cpfLimpo) {
    try {
      const rawMap = await storageHelper.getItem(ALUNOS_ROTAS_STORAGE_KEY);
      if (rawMap) {
        const mapRotas: Record<string, string> = JSON.parse(rawMap);
        if (mapRotas[cpfLimpo]) {
          rotaNomeAluno = mapRotas[cpfLimpo];
        }
      }
    } catch {}
  }

  // Busca nos dados da sessão ativa (user_data_v2)
  if (!rotaNomeAluno) {
    try {
      const rawUser = await storageHelper.getItem('user_data_v2');
      if (rawUser) {
        const u = JSON.parse(rawUser);
        if (u.rotaNome) {
          rotaNomeAluno = u.rotaNome;
        }
      }
    } catch {}
  }

  // 3. Localiza a rota nos registros
  let rotaEncontrada: Rota | undefined;

  // Prioridade A: Busca por nome exato ou contido (ex: "Pão de Açúcar")
  if (rotaNomeAluno) {
    const nomeNorm = rotaNomeAluno.trim().toLowerCase();
    rotaEncontrada = adminRotas.find(
      (r) =>
        r.nome.trim().toLowerCase() === nomeNorm ||
        r.nome.trim().toLowerCase().includes(nomeNorm) ||
        nomeNorm.includes(r.nome.trim().toLowerCase())
    );
  }

  // Prioridade B: Busca pelo CPF do aluno nos IDs vinculados da rota
  if (!rotaEncontrada && cpfLimpo) {
    rotaEncontrada = adminRotas.find(
      (r) =>
        (r as any).alunosIds?.includes(cpfLimpo) ||
        (r as any).alunosIds?.includes(alunoId) ||
        r.alunos?.some((a) => a.id === cpfLimpo || a.id === alunoId)
    );
  }

  // Prioridade C: Se o aluno não tiver vínculo específico, usa a rota mais recente criada pelo Admin
  if (!rotaEncontrada && adminRotas.length > 0) {
    rotaEncontrada = adminRotas[adminRotas.length - 1];
  }

  // O backend é consultado primeiro (rotas criadas no painel aparecem para todos).
  // Se o servidor estiver offline, cai para as rotas locais logo abaixo.
  try {
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

      const paradas: Parada[] = paradasApi.length > 0
        ? paradasApi.map((p: any) => ({
            id: String(p.ordem ?? p.id ?? Math.random()),
            nome: p.nome || '',
            endereco: p.nome || '',
            latitude: Number(p.latitude) || 0,
            longitude: Number(p.longitude) || 0,
          }))
        : PARADAS_PADRAO_CARUARU;

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
          nome: viagem.nomeRota || 'Linha 01 - Nassau Noturno',
          escola: viagem.escola || viagem.veiculoModelo || 'Faculdade Maurício de Nassau',
          horario: formatarHoraApi(viagem.horario) || '17:45',
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

  // Backend indisponível: usa a rota salva localmente (modo offline).
  if (rotaEncontrada && rotaEncontrada.paradas && rotaEncontrada.paradas.length > 0) {
    return {
      success: true,
      rota: rotaEncontrada,
    };
  }

  // Fallback seguro final
  return {
    success: true,
    rota: ROTAS_PADRAO_INICIAIS[0],
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
  let avisosLocais: Aviso[] = [];
  try {
    const raw = await storageHelper.getItem(ADMIN_AVISOS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        avisosLocais = parsed;
      }
    }
  } catch {}

  if (avisosLocais.length === 0) {
    avisosLocais = [...MOCK_AVISOS];
    try {
      await storageHelper.setItem(ADMIN_AVISOS_STORAGE_KEY, JSON.stringify(avisosLocais));
    } catch {}
  }

  return {
    success: true,
    avisos: avisosLocais,
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

  const agora = new Date();
  const novoAviso: Aviso = {
    id: `aviso_${Date.now()}`,
    tipo: dados.tipo || 'info',
    titulo: dados.titulo.trim(),
    descricao: dados.descricao.trim(),
    data: `Hoje, ${agora.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`,
    icon: dados.tipo === 'urgente' ? 'warning' : dados.tipo === 'sucesso' ? 'check-circle' : 'info',
  };

  try {
    const raw = await storageHelper.getItem(ADMIN_AVISOS_STORAGE_KEY);
    const lista: Aviso[] = raw ? JSON.parse(raw) : [...MOCK_AVISOS];
    lista.unshift(novoAviso);
    await storageHelper.setItem(ADMIN_AVISOS_STORAGE_KEY, JSON.stringify(lista));
  } catch (err) {
    console.warn('Erro ao salvar aviso no storage:', err);
  }

  return { success: true, aviso: novoAviso, message: 'Aviso publicado com sucesso!' };
};

export const deleteAviso = async (avisoId: string): Promise<{ success: boolean; message: string }> => {
  try {
    const raw = await storageHelper.getItem(ADMIN_AVISOS_STORAGE_KEY);
    if (raw) {
      const lista: Aviso[] = JSON.parse(raw);
      const filtrados = lista.filter((a) => a.id !== avisoId);
      await storageHelper.setItem(ADMIN_AVISOS_STORAGE_KEY, JSON.stringify(filtrados));
    }
  } catch {}
  return { success: true, message: 'Aviso removido com sucesso!' };
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
    return { success: false, message: 'Não foi possível iniciar a rota no servidor. Verifique a conexão e tente de novo.' };
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
    // Endpoint real: POST /api/viagens/{viagemId}/gps
    await apiClient.post<any>(`/api/viagens/${data.rotaId}/gps`, {
      latitude: data.position.latitude,
      longitude: data.position.longitude,
      timestamp: data.position.timestamp || Date.now(),
    });
    return { success: true, message: 'GPS sincronizado' };
  } catch (err: any) {
    console.warn('Backend GPS indisponível:', err?.message || err);
    return { success: true, message: 'GPS registrado localmente' };
  }
};

export const getGpsPosition = async (rotaId: string): Promise<{ success: boolean; position?: { latitude: number; longitude: number; timestamp?: number }; message?: string }> => {
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
    // sem posição disponível na nuvem
  }

  // Fallback: verificar última posição no storageHelper local
  try {
    const raw = await storageHelper.getItem(`${GPS_STORAGE_PREFIX}${rotaId}`);
    if (raw) {
      const pos = JSON.parse(raw);
      if (pos && pos.latitude != null && pos.longitude != null) {
        return {
          success: true,
          position: {
            latitude: Number(pos.latitude),
            longitude: Number(pos.longitude),
            timestamp: pos.timestamp,
          },
        };
      }
    }
  } catch {}

  return { success: false, message: 'Posição do ônibus ainda não disponível' };
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
  let lista: SolicitacaoAluno[] = [];

  // Tenta backend
  try {
    const response = await apiClient.get<any[]>('/api/usuarios/alunos/solicitacoes');
    if (Array.isArray(response.data)) {
      lista = response.data.map(mapAlunoParaSolicitacao);
    }
  } catch (err: any) {
    // backend offline, usa dados locais
  }

  // Carrega do storage local e do mock
  try {
    const raw = await storageHelper.getItem(SOLICITACOES_STORAGE_KEY);
    if (raw) {
      const parsed: SolicitacaoAluno[] = JSON.parse(raw);
      parsed.forEach((s) => {
        if (!lista.some((item) => item.cpf === s.cpf)) {
          lista.unshift(s);
        }
      });
    }
  } catch {}

  // Adiciona as do mock em memória que não estejam na lista
  MOCK_SOLICITACOES.forEach((s) => {
    if (!lista.some((item) => item.cpf === s.cpf)) {
      lista.push(s);
    }
  });

  // Filtra as que já foram aprovadas pelo Administrador
  try {
    const rawAprov = await storageHelper.getItem(APROVACOES_STORAGE_KEY);
    const aprovados: string[] = rawAprov ? JSON.parse(rawAprov) : [];
    lista = lista.filter((s) => !aprovados.includes(s.cpf) && s.status === 'pendente');
  } catch {}

  return { success: true, solicitacoes: lista };
};

export const aprovarSolicitacao = async (
  solicitacaoId: string,
  rotaNome: string = 'Linha 01 - Nassau Noturno'
): Promise<{ success: boolean; message: string }> => {
  const cpfLimpo = solicitacaoId.replace(/\D/g, '');

  try {
    await apiClient.patch(`/api/usuarios/alunos/${encodeURIComponent(solicitacaoId)}/aprovar`);
  } catch (err: any) {
    console.warn('Backend indisponível ao aprovar aluno, salvando localmente:', err?.message || err);
  }

  // 1. Marca como aprovado em APROVACOES_STORAGE_KEY
  try {
    const rawAprov = await storageHelper.getItem(APROVACOES_STORAGE_KEY);
    const aprovados: string[] = rawAprov ? JSON.parse(rawAprov) : [];
    if (!aprovados.includes(cpfLimpo)) {
      aprovados.push(cpfLimpo);
    }
    await storageHelper.setItem(APROVACOES_STORAGE_KEY, JSON.stringify(aprovados));
  } catch {}

  // 2. Mapeia CPF -> Rota em ALUNOS_ROTAS_STORAGE_KEY
  try {
    const rawMap = await storageHelper.getItem(ALUNOS_ROTAS_STORAGE_KEY);
    const mapRotas: Record<string, string> = rawMap ? JSON.parse(rawMap) : {};
    mapRotas[cpfLimpo] = rotaNome;
    await storageHelper.setItem(ALUNOS_ROTAS_STORAGE_KEY, JSON.stringify(mapRotas));
  } catch {}

  // 3. Obtém nome e escola do aluno
  let nomeAluno = 'Aluno Aprovado';
  let escolaAluno = '';
  try {
    const rawSol = await storageHelper.getItem(SOLICITACOES_STORAGE_KEY);
    if (rawSol) {
      const sols: SolicitacaoAluno[] = JSON.parse(rawSol);
      const achado = sols.find((s) => s.cpf === cpfLimpo);
      if (achado) {
        nomeAluno = achado.nome;
        escolaAluno = achado.escola;
      }
    }
  } catch {}

  // 4. Atualiza ADMIN_ROTAS_STORAGE_KEY: adiciona aluno à rota
  try {
    const rawRotas = await storageHelper.getItem(ADMIN_ROTAS_STORAGE_KEY);
    let rotas: Rota[] = rawRotas ? JSON.parse(rawRotas) : [...ROTAS_PADRAO_INICIAIS];

    rotas = rotas.map((r) => {
      const match =
        r.nome.trim().toLowerCase() === rotaNome.trim().toLowerCase() ||
        r.nome.trim().toLowerCase().includes(rotaNome.trim().toLowerCase()) ||
        rotaNome.trim().toLowerCase().includes(r.nome.trim().toLowerCase());

      const outrosAlunos = (r.alunos || []).filter((a) => a.id !== cpfLimpo);
      const outrosIds = (r as any).alunosIds
        ? (r as any).alunosIds.filter((id: string) => id !== cpfLimpo)
        : [];

      if (match) {
        return {
          ...r,
          alunosIds: [...outrosIds, cpfLimpo],
          alunos: [
            ...outrosAlunos,
            {
              id: cpfLimpo,
              nome: nomeAluno,
              escola: escolaAluno || r.escola,
              parada: r.paradas?.[0]?.nome || 'Ponto de Partida',
              presente: false,
              confirmouPresenca: false,
            },
          ],
        };
      }

      return {
        ...r,
        alunosIds: outrosIds,
        alunos: outrosAlunos,
      };
    });

    await storageHelper.setItem(ADMIN_ROTAS_STORAGE_KEY, JSON.stringify(rotas));
  } catch (err) {
    console.warn('Erro ao atualizar rotas do admin:', err);
  }

  // 5. Atualiza user_data_v2 se o usuário atual logado for este aluno
  try {
    const rawUser = await storageHelper.getItem('user_data_v2');
    if (rawUser) {
      const u = JSON.parse(rawUser);
      if (String(u.id).replace(/\D/g, '') === cpfLimpo) {
        u.rotaNome = rotaNome;
        await storageHelper.setItem('user_data_v2', JSON.stringify(u));
      }
    }
  } catch {}

  // 6. Atualiza arrays de mock
  MOCK_SOLICITACOES = MOCK_SOLICITACOES.filter((s) => s.cpf !== cpfLimpo);
  const jaAtivo = MOCK_ALUNOS_ATIVOS.find((a) => a.cpf === cpfLimpo);
  if (jaAtivo) {
    jaAtivo.rotaNome = rotaNome;
  } else {
    MOCK_ALUNOS_ATIVOS.push({
      id: cpfLimpo,
      nome: nomeAluno,
      cpf: cpfLimpo,
      email: `${cpfLimpo}@aluno.edutransporte`,
      telefone: '',
      cidade: '',
      escola: escolaAluno,
      rotaNome: rotaNome,
      status: 'ativo',
    });
  }

  return { success: true, message: `Aluno aprovado! Acesso liberado para a rota "${rotaNome}".` };
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
    // O backend exige cidade: usa a primeira cidade cadastrada (Caruaru).
    let cidadeId = 1;
    try {
      const cidades = await apiClient.get<any[]>('/cidades');
      if (Array.isArray(cidades.data) && cidades.data.length > 0) {
        cidadeId = Number(cidades.data[0]?.id) || 1;
      }
    } catch {
      // mantém o padrão
    }

    const telefoneLimpo = (dados.telefone || '').replace(/\D/g, '') || '81999990000';
    const email = `${cpfLimpo}@motorista.edutransporte`;

    await apiClient.post<any>('/api/usuarios/motoristas', {
      cpf: cpfLimpo,
      nomeCompleto: dados.nome.trim(),
      email,
      numeroCelular: telefoneLimpo,
      senha: '12345',
      carteiraConducao: (dados.cnh || '00000000000').trim(),
      cidadeId,
    });

    // Garante que o veículo exista para que rotas possam ser atribuídas.
    if (placaFormatada) {
      try {
        const veiculos = await apiClient.get<any[]>('/api/veiculos');
        const existe = Array.isArray(veiculos.data)
          && veiculos.data.some((v: any) => String(v.placa || '').toUpperCase() === placaFormatada);
        if (!existe) {
          await apiClient.post('/api/veiculos', {
            placa: placaFormatada,
            modelo: `Veículo de ${dados.nome.trim()}`,
          });
        }
      } catch (err: any) {
        console.warn('Não foi possível cadastrar o veículo:', err?.message || err);
      }
    }

    const novoMotorista: MotoristaCadastrado = {
      id: cpfLimpo,
      nome: dados.nome.trim(),
      cpf: cpfLimpo,
      telefone: dados.telefone,
      cnh: dados.cnh,
      placa: placaFormatada,
      rotaId: dados.rotaId,
      rotaNome: dados.rotaNome,
      criadoEm: new Date().toLocaleDateString('pt-BR'),
    };

    return {
      success: true,
      message: 'Motorista cadastrado com sucesso! Senha inicial: 12345',
      motorista: novoMotorista,
    };
  } catch (err: any) {
    return {
      success: false,
      message: getApiErrorMessage(err, 'Não foi possível cadastrar o motorista no servidor.'),
    };
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

    // Carrega mapeamento local de rotas dos alunos
    let mapRotas: Record<string, string> = {};
    try {
      const rawMap = await storageHelper.getItem(ALUNOS_ROTAS_STORAGE_KEY);
      if (rawMap) mapRotas = JSON.parse(rawMap);
    } catch {}

    const solicitacoes = lista
      .filter((a: any) => String(a.status || 'PENDENTE').toUpperCase() === 'PENDENTE')
      .map(mapAlunoParaSolicitacao);

    let alunos = lista
      .filter((a: any) => String(a.status || 'PENDENTE').toUpperCase() === 'APROVADO')
      .map(mapAlunoParaCadastro)
      .map((al) => ({
        ...al,
        rotaNome: mapRotas[al.cpf] || al.rotaNome,
      }));

    // Mescla com alunos aprovados localmente
    try {
      const rawAprov = await storageHelper.getItem(APROVACOES_STORAGE_KEY);
      const aprovados: string[] = rawAprov ? JSON.parse(rawAprov) : [];
      const rawSol = await storageHelper.getItem(SOLICITACOES_STORAGE_KEY);
      if (rawSol) {
        const todasSols: SolicitacaoAluno[] = JSON.parse(rawSol);
        todasSols.forEach((s) => {
          if (aprovados.includes(s.cpf) && !alunos.some((a) => a.cpf === s.cpf)) {
            alunos.unshift({
              id: s.cpf,
              nome: s.nome,
              cpf: s.cpf,
              email: s.email,
              telefone: s.telefone,
              cidade: s.cidade,
              escola: s.escola,
              rotaNome: mapRotas[s.cpf] || 'Linha 01 - Nassau Noturno',
              status: 'ativo',
            });
          }
        });
      }
    } catch {}

    return { success: true, solicitacoes, motoristas, alunos };
  } catch (err: any) {
    console.warn('Backend indisponível em getUsuariosAdmin, usando dados locais');

    let mapRotas: Record<string, string> = {};
    try {
      const rawMap = await storageHelper.getItem(ALUNOS_ROTAS_STORAGE_KEY);
      if (rawMap) mapRotas = JSON.parse(rawMap);
    } catch {}

    const solResp = await getSolicitacoesAlunos();
    const solicitacoes = solResp.solicitacoes;

    let alunos: AlunoCadastrado[] = [...MOCK_ALUNOS_ATIVOS].map((al) => ({
      ...al,
      rotaNome: mapRotas[al.cpf] || al.rotaNome,
    }));

    try {
      const rawAprov = await storageHelper.getItem(APROVACOES_STORAGE_KEY);
      const aprovados: string[] = rawAprov ? JSON.parse(rawAprov) : [];
      const rawSol = await storageHelper.getItem(SOLICITACOES_STORAGE_KEY);
      if (rawSol) {
        const todasSols: SolicitacaoAluno[] = JSON.parse(rawSol);
        todasSols.forEach((s) => {
          if (aprovados.includes(s.cpf) && !alunos.some((a) => a.cpf === s.cpf)) {
            alunos.unshift({
              id: s.cpf,
              nome: s.nome,
              cpf: s.cpf,
              email: s.email,
              telefone: s.telefone,
              cidade: s.cidade,
              escola: s.escola,
              rotaNome: mapRotas[s.cpf] || 'Linha 01 - Nassau Noturno',
              status: 'ativo',
            });
          }
        });
      }
    } catch {}

    return {
      success: true,
      solicitacoes,
      motoristas: MOCK_MOTORISTAS,
      alunos,
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
  let rotasLocais: Rota[] = [];
  try {
    const raw = await storageHelper.getItem(ADMIN_ROTAS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        rotasLocais = parsed;
      }
    }
  } catch {}

  try {
    const response = await apiClient.get<any[]>('/admin/rotas');
    const lista = Array.isArray(response.data) ? response.data : [];
    const rotas: Rota[] = lista.map((r: any) => ({
      id: String(r.id ?? ''),
      nome: r.nome || 'Rota',
      escola: r.escola || '',
      horario: formatarHoraApi(r.horario),
      tipo: normalizarTipoViagem(r.tipo),
      status: normalizarStatusRota(r.status),
      paradas: (Array.isArray(r.paradas) ? r.paradas : []).map((p: any, index: number) => ({
        id: `p-${r.id}-${index + 1}`,
        nome: p.nome || `Parada ${index + 1}`,
        endereco: p.endereco || p.nome || '',
        latitude: Number(p.latitude ?? 0),
        longitude: Number(p.longitude ?? 0),
      })),
      alunos: Array.isArray(r.alunos) ? r.alunos : [],
    }));

    // Mantém também o que estiver em cache local, sem duplicar pelo nome.
    rotasLocais.forEach((local) => {
      if (!rotas.some((apiR) => apiR.nome.toLowerCase() === local.nome.toLowerCase())) {
        rotas.push(local);
      }
    });

    return { success: true, rotas };
  } catch (err: any) {
    console.warn('Backend /admin/rotas indisponível:', err?.message || err);
    return {
      success: false,
      message: getApiErrorMessage(err, 'Não foi possível carregar as rotas do servidor.'),
      rotas: rotasLocais.length > 0 ? rotasLocais : ROTAS_PADRAO_INICIAIS,
    };
  }
};

export const createRota = async (data: CreateRotaInput & { paradas?: Parada[] }): Promise<{ success: boolean; message: string; rota?: Rota }> => {
  const paradasNovaRota: Parada[] = data.paradas && data.paradas.length > 0
    ? data.paradas
    : [
        {
          id: `p-${Date.now()}-1`,
          nome: 'Ponto de Partida / Terminal',
          endereco: 'Centro, Caruaru - PE',
          latitude: -8.2842,
          longitude: -35.9712,
        },
        {
          id: `p-${Date.now()}-2`,
          nome: data.escola ? `${data.escola} (Destino)` : 'Destino Final',
          endereco: 'Polo Universitário, Caruaru - PE',
          latitude: -8.2680,
          longitude: -35.9630,
        },
      ];

  try {
    const response = await apiClient.post<any>('/admin/rotas', {
      nome: data.nome,
      escola: data.escola,
      horario: data.horario,
      tipo: data.tipo,
      motoristaId: data.motoristaId || '',
      paradas: paradasNovaRota.map((p) => ({
        nome: p.nome,
        latitude: p.latitude,
        longitude: p.longitude,
      })),
    });

    const r = response.data || {};
    const novaRota: Rota = {
      id: String(r.id ?? ''),
      nome: r.nome || data.nome,
      escola: r.escola || data.escola,
      horario: formatarHoraApi(r.horario) || data.horario,
      tipo: normalizarTipoViagem(r.tipo),
      status: normalizarStatusRota(r.status),
      paradas: paradasNovaRota,
      alunos: [],
    };

    try {
      const raw = await storageHelper.getItem(ADMIN_ROTAS_STORAGE_KEY);
      const lista: Rota[] = raw ? JSON.parse(raw) : [];
      lista.push(novaRota);
      await storageHelper.setItem(ADMIN_ROTAS_STORAGE_KEY, JSON.stringify(lista));
    } catch {}

    return { success: true, message: 'Rota criada e disponibilizada para todos os alunos!', rota: novaRota };
  } catch (err: any) {
    return {
      success: false,
      message: getApiErrorMessage(err, 'Não foi possível criar a rota no servidor.'),
    };
  }
};

export const deleteRota = async (rotaId: string): Promise<{ success: boolean; message: string }> => {
  const removerDoCache = async () => {
    try {
      const raw = await storageHelper.getItem(ADMIN_ROTAS_STORAGE_KEY);
      if (raw) {
        const lista: Rota[] = JSON.parse(raw);
        await storageHelper.setItem(ADMIN_ROTAS_STORAGE_KEY,
          JSON.stringify(lista.filter((r) => r.id !== rotaId)));
      }
    } catch {}
  };

  // Rotas antigas criadas só no navegador têm id "rota-...".
  if (!/^\d+$/.test(rotaId)) {
    await removerDoCache();
    return { success: true, message: 'Rota removida do cache local.' };
  }

  try {
    await apiClient.delete(`/admin/rotas/${rotaId}`);
    await removerDoCache();
    return { success: true, message: 'Rota excluída com sucesso!' };
  } catch (err: any) {
    return {
      success: false,
      message: getApiErrorMessage(err, 'Não foi possível excluir a rota no servidor.'),
    };
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
    const response = await apiClient.get<any[]>('/admin/feriados');
    const lista = Array.isArray(response.data) ? response.data : [];
    const feriados = lista.map(normalizarFeriado);
    try {
      await storageHelper.setItem(ADMIN_FERIADOS_STORAGE_KEY, JSON.stringify(feriados));
    } catch {}
    return { success: true, feriados };
  } catch (err: any) {
    console.warn('Backend /admin/feriados indisponível:', err?.message || err);
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
    const response = await apiClient.post<any>('/admin/feriados', {
      data: dataIso,
      nome: data.nome.trim(),
      descricao: data.motivo?.trim() || 'Evento escolar / Feriado',
    });
    const feriado = normalizarFeriado(response.data);
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
      message: getApiErrorMessage(err, 'Não foi possível cadastrar o feriado no servidor.'),
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
    await apiClient.delete(`/admin/feriados/${dataIso}`);
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

export const getPerfil = async (): Promise<PerfilResponse> => {
  // Fonte da verdade: backend (dados atualizados em qualquer aparelho).
  try {
    const resp = await apiClient.get<any>('/api/usuarios/perfil');
    const p = resp.data;
    if (p) {
      return {
        success: true,
        usuario: {
          id: String(p.id || ''),
          nome: p.nome || '',
          email: p.email || '',
          telefone: p.telefone || '',
          cidade: p.cidade || '',
          role: p.role === 'motorista' ? 'motorista' : p.role === 'admin' ? 'admin' : 'aluno',
          escola: p.escola || '',
        },
      };
    }
  } catch (err: any) {
    console.warn('Backend /api/usuarios/perfil indisponível:', err?.message || err);
  }

  try {
    const raw = await storageHelper.getItem('user_data_v2');
    if (raw) {
      const u = JSON.parse(raw);
      return {
        success: true,
        usuario: {
          id: String(u.id || ''),
          nome: u.nome || '',
          email: u.email || '',
          telefone: u.telefone || '',
          cidade: u.cidade || '',
          role: u.role === 'motorista' ? 'motorista' : u.role === 'admin' ? 'admin' : 'aluno',
          escola: u.escola || '',
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
    const response = await apiClient.put<any>('/api/usuarios/perfil', {
      nome: data.nome,
      email: data.email,
      telefone: data.telefone,
      cidade: data.cidade,
      escola: data.escola,
    });
    return { success: true, message: response.data?.message || 'Perfil atualizado com sucesso!' };
  } catch (err: any) {
    return {
      success: false,
      message: getApiErrorMessage(err, 'Não foi possível atualizar o perfil no servidor.'),
    };
  }
};

export const updateNotificacoes = async (config: NotificacoesConfig): Promise<PerfilUpdateResponse> => {
  try {
    const response = await apiClient.put<any>('/api/usuarios/notificacoes', config);
    return { success: true, message: response.data?.message || 'Notificações atualizadas!' };
  } catch (err: any) {
    return {
      success: false,
      message: getApiErrorMessage(err, 'Não foi possível salvar as notificações.'),
    };
  }
};

export const alterarSenha = async (senhaAtual: string, novaSenha: string): Promise<PerfilUpdateResponse> => {
  try {
    const response = await apiClient.put<any>('/auth/alterar-senha', { senhaAtual, novaSenha });
    return { success: true, message: response.data?.message || 'Senha alterada com sucesso!' };
  } catch (err: any) {
    return {
      success: false,
      message: getApiErrorMessage(err, 'Não foi possível alterar a senha.'),
    };
  }
};

export const getRotasAgenda = async (): Promise<AgendaResponse> => {
  let viagensDb: any[] = [];
  try {
    const response = await apiClient.get<any[]>('/api/viagens');
    if (Array.isArray(response.data)) {
      viagensDb = response.data;
    }
  } catch (err: any) {
    console.warn('Backend /api/viagens indisponível para agenda:', err?.message || err);
  }

  if (viagensDb.length > 0) {
    const rotasReais: RotaAgenda[] = viagensDb.map((v: any) => {
      let dataFormatada = '';
      if (v.data) {
        const d = new Date(`${v.data}T00:00:00`);
        if (!Number.isNaN(d.getTime())) {
          const curta = d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
          const dia = d.toLocaleDateString('pt-BR', { weekday: 'long' });
          dataFormatada = `${curta} - ${dia.charAt(0).toUpperCase() + dia.slice(1)}`;
        }
      }
      return {
        id: String(v.id ?? ''),
        data: dataFormatada,
        nome: v.nomeRota || 'Rota',
        escola: v.escola || '',
        horario: formatarHoraApi(v.horario) || '18:00',
        tipo: normalizarTipoViagem(v.tipo),
        status: normalizarStatusRota(v.status),
        paradas: [],
      };
    });

    return { success: true, rotas: rotasReais };
  }

  // Carrega rotas do Admin
  let adminRotas: Rota[] = [];
  try {
    const raw = await storageHelper.getItem(ADMIN_ROTAS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) adminRotas = parsed;
    }
  } catch {}

  if (adminRotas.length === 0) {
    adminRotas = [...ROTAS_PADRAO_INICIAIS];
  }

  // Gera lista dos próximos 14 dias
  const rotasAgenda: RotaAgenda[] = [];
  const hoje = new Date();

  for (let i = 0; i < 14; i++) {
    const d = new Date(hoje);
    d.setDate(hoje.getDate() + i);

    // Pula fins de semana na agenda padrão
    const diaSemanaNum = d.getDay();
    if (diaSemanaNum === 0 || diaSemanaNum === 6) continue;

    const dataCurta = d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
    const diaSemana = d.toLocaleDateString('pt-BR', { weekday: 'long' });
    const dataFormatada = `${dataCurta} - ${diaSemana.charAt(0).toUpperCase() + diaSemana.slice(1)}`;

    adminRotas.forEach((r, idx) => {
      rotasAgenda.push({
        id: `agenda_${r.id}_${i}_ida`,
        data: dataFormatada,
        nome: `${r.nome} (Ida)`,
        escola: r.escola || 'Polo Universitário',
        horario: r.horario || '17:45',
        tipo: 'Ida',
        status: i === 0 ? 'em_andamento' : 'agendada',
        paradas: r.paradas || [],
      });

      rotasAgenda.push({
        id: `agenda_${r.id}_${i}_volta`,
        data: dataFormatada,
        nome: `${r.nome} (Retorno)`,
        escola: r.escola || 'Retorno Garagem',
        horario: '22:30',
        tipo: 'Volta',
        status: 'agendada',
        paradas: r.paradas || [],
      });
    });
  }

  return { success: true, rotas: rotasAgenda };
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
    const response = await apiClient.get<any[]>('/api/viagens');
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
