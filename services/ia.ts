/**
 * Serviço de integração com a IA do EduTransporter (FastAPI + Ollama em ia/)
 *
 * Envia perguntas para POST /perguntar na URL configurada em EXPO_PUBLIC_IA_URL.
 * Caso o servidor da IA esteja offline ou inacessível, responde usando a base
 * oficial de conhecimento (ia/dados/base.txt / DOCUMENTACAO_CENTRAL_AJUDA_IA.txt).
 */

export const IA_API_URL = (
  process.env.EXPO_PUBLIC_IA_URL || 'http://127.0.0.1:8000'
).replace(/\/+$/, '');

export interface IaStatusResponse {
  online: boolean;
  modelo?: string;
  trechosCarregados?: number;
}

export interface IaPerguntaResponse {
  resposta: string;
  origem: 'ia' | 'base-local';
  modelo?: string;
}

export const SUGESTOES_PERGUNTAS_IA: string[] = [
  'Esqueci minha senha, como redefino?',
  'O ônibus não aparece no mapa, o que fazer?',
  'Como confirmar minha presença no ônibus?',
  'Posso solicitar mudança de rota ou parada?',
  'Não recebo notificações push',
  'Como enviar uma mensagem pelo chat?',
];

interface ConhecimentoItem {
  id: string;
  titulo: string;
  palavrasChave: string[];
  resposta: string;
}

const BASE_CONHECIMENTO_OFICIAL: ConhecimentoItem[] = [
  {
    id: 'visao-geral',
    titulo: 'Como funciona o aplicativo e quais são as abas principais?',
    palavrasChave: ['abas', 'funciona', 'aplicativo', 'app', 'perfis', 'inicio', 'mapa', 'agenda', 'chat', 'perfil', 'navegacao', 'menu'],
    resposta:
      'O EduTransporter possui três perfis (Aluno, Motorista e Administrador) e cinco abas na barra inferior: Início (rota do dia, presença e avisos), Mapa (trajeto e ônibus em tempo real), Agenda (rotas programadas), Chat (mensagens de texto no grupo da rota) e Perfil (Dados Pessoais, Notificações, Segurança e Senha, Modo Escuro, Assistente IA, Termos e Sair).',
  },
  {
    id: 'faq-01',
    titulo: 'Esqueci minha senha, como redefino ou altero?',
    palavrasChave: ['senha', 'esqueci', 'redefinir', 'trocar', 'alterar', 'recuperar', 'login', 'entrar'],
    resposta:
      "Na tela de login, toque em 'Esqueceu a senha?' abaixo do campo de senha para receber instruções por e-mail (verifique também a caixa de spam). Se a recuperação automática não estiver disponível ou você não conseguir entrar, envie um e-mail para suporte@edutransporter.com ou procure a coordenação. Se já estiver logado, altere sua senha em Perfil > Segurança e Senha (mínimo de 6 caracteres, informando a senha atual).",
  },
  {
    id: 'faq-02',
    titulo: 'Como alternar entre perfil de Aluno e Motorista?',
    palavrasChave: ['alternar', 'perfil', 'aluno', 'motorista', 'seletor', 'login', 'cpf', 'entrar'],
    resposta:
      'Na tela de login, antes de entrar, use o seletor de perfil ("Aluno" / "Motorista") no topo do cartão do formulário. O login utiliza CPF e senha, e cada perfil libera funcionalidades diferentes no app.',
  },
  {
    id: 'faq-03',
    titulo: 'Como atualizar meus dados pessoais?',
    palavrasChave: ['dados', 'pessoais', 'atualizar', 'editar', 'nome', 'cpf', 'email', 'telefone', 'endereco', 'cidade', 'escola', 'faculdade'],
    resposta:
      'Vá em Perfil > Dados Pessoais. Nessa tela você pode editar Nome, E-mail, Telefone (com DDD), Cidade e Escola/Instituição. O CPF não é editável diretamente pelo app — alterações de CPF ou validações cadastrais precisam ser feitas com a secretaria ou coordenação.',
  },
  {
    id: 'faq-04',
    titulo: 'Posso ter mais de uma conta no app?',
    palavrasChave: ['duas', 'contas', 'mais de uma', 'outra conta', 'matricula', 'cpf', 'sair'],
    resposta:
      "Não. Cada usuário deve ter apenas uma conta vinculada ao seu CPF ou matrícula. Se precisar entrar com outro perfil, toque em Perfil > Sair da Conta e faça login com os dados corretos.",
  },
  {
    id: 'faq-05',
    titulo: 'O ônibus não aparece no mapa, o que fazer?',
    palavrasChave: ['onibus', 'mapa', 'nao aparece', 'sumiu', 'gps', 'rota ativa', 'onde esta', 'tempo real'],
    resposta:
      'Verifique se você está conectado à internet. O ônibus só aparece no Mapa quando está em rota ativa (após o motorista iniciar a rota). Se o motorista já iniciou e mesmo assim o veículo não aparecer, feche o aplicativo completamente e abra novamente.',
  },
  {
    id: 'faq-06',
    titulo: 'Como sei qual é minha rota e horário?',
    palavrasChave: ['minha rota', 'horario', 'linha', 'agenda', 'que horas', 'itinerario', 'saida'],
    resposta:
      "Na aba 'Início', sua rota do dia aparece automaticamente com horário, escola e status. Na aba 'Agenda', você também pode consultar as rotas programadas dos próximos 7 dias.",
  },
  {
    id: 'faq-07',
    titulo: 'A rota foi alterada sem aviso. Como reclamar?',
    palavrasChave: ['alterada', 'mudou', 'sem aviso', 'reclamar', 'desvio', 'rota'],
    resposta:
      'Todas as alterações de rota são comunicadas por avisos na aba Início e por notificação push. Se alguma mudança ocorreu sem comunicado, use a aba Chat para falar diretamente com a central.',
  },
  {
    id: 'faq-08',
    titulo: 'Posso solicitar mudança de rota ou parada?',
    palavrasChave: ['mudanca', 'mudar', 'trocar', 'rota', 'parada', 'ponto', 'embarque', 'solicitar'],
    resposta:
      'Você pode ajustar Cidade e Escola/Instituição em Perfil > Dados Pessoais. Mudanças de linha/rota ou ponto de embarque dependem de análise da central e podem levar até 48 horas para serem processadas — avise também a central pelo Chat ou pelo e-mail suporte@edutransporter.com.',
  },
  {
    id: 'faq-09',
    titulo: 'O horário do ônibus mudou, como fico sabendo?',
    palavrasChave: ['horario mudou', 'atraso', 'aviso urgente', 'comunicado', 'mural'],
    resposta:
      "Alterações de horário são enviadas como avisos urgentes no aplicativo e por notificação push. Você pode conferir os comunicados recentes na seção 'Avisos' na tela Início.",
  },
  {
    id: 'faq-10',
    titulo: 'Como confirmar minha presença no ônibus?',
    palavrasChave: ['presenca', 'confirmar', 'embarque', 'embarcar', 'assento', 'vaga', 'vou hoje'],
    resposta:
      "Você pode confirmar sua presença diretamente na aba 'Início' (quando a opção estiver disponível), e o motorista também pode registrar sua presença ao embarcar. O status da sua presença aparece na aba 'Início'.",
  },
  {
    id: 'faq-11',
    titulo: 'O app marca que estou presente mas não embarquei. Como corrigir?',
    palavrasChave: ['marcou presente', 'nao embarquei', 'errado', 'corrigir presenca', 'engano'],
    resposta:
      "Use a aba 'Chat' para informar a central sobre o erro. O motorista consegue ajustar a lista de presença diretamente no aplicativo.",
  },
  {
    id: 'faq-12',
    titulo: 'Meu filho faltou hoje. Preciso justificar?',
    palavrasChave: ['falta', 'faltou', 'faltar', 'justificar', 'ausencia', 'nao vai', 'filho'],
    resposta:
      'Faltas pontuais não precisam de justificativa imediata. Porém, se houver 3 faltas consecutivas, a central pode entrar em contato para verificar a situação.',
  },
  {
    id: 'faq-13',
    titulo: 'Como enviar uma mensagem pelo chat?',
    palavrasChave: ['chat', 'mensagem', 'enviar', 'conversar', 'falar', 'grupo'],
    resposta:
      "Acesse a aba 'Chat' na barra inferior para conversar em tempo real no grupo da sua rota (alunos, motorista e administrador), inclusive usando os atalhos de mensagens rápidas. Motoristas e administradores podem alternar entre rotas pelo seletor no topo do Chat.",
  },
  {
    id: 'faq-14',
    titulo: 'Posso enviar fotos ou arquivos pelo chat?',
    palavrasChave: ['foto', 'imagem', 'arquivo', 'documento', 'anexo', 'pdf', 'video'],
    resposta:
      'Atualmente o chat suporta apenas mensagens de texto. Fotos e documentos podem ser enviados por e-mail para suporte@edutransporter.com.',
  },
  {
    id: 'faq-15',
    titulo: 'Como silenciar notificações do chat?',
    palavrasChave: ['silenciar', 'desativar', 'mutar', 'notificacoes chat', 'barulho'],
    resposta:
      'Vá em Perfil > Notificações e desative a opção "Mensagens" (novas mensagens no chat da rota). Você continuará recebendo notificações de Avisos Importantes, Presença e Rotas, a menos que use o botão "Desativar todas".',
  },
  {
    id: 'faq-16',
    titulo: 'Recebi um aviso urgente, preciso fazer algo?',
    palavrasChave: ['aviso urgente', 'vermelho', 'alerta', 'urgente'],
    resposta:
      'Avisos urgentes (em vermelho) costumam indicar alterações importantes na sua rota, como mudança de horário, desvio ou cancelamento. Leia o comunicado completo e siga as instruções informadas.',
  },
  {
    id: 'faq-17',
    titulo: 'O app está travando ou fechando sozinho',
    palavrasChave: ['travando', 'trava', 'fechando', 'lento', 'crash', 'reiniciar', 'cache'],
    resposta:
      'Tente: 1) Fechar o app e abrir novamente; 2) Limpar o cache do aplicativo nas configurações do celular; 3) Verificar se há atualização disponível na loja de aplicativos. Se o problema continuar, desinstale e reinstale o app.',
  },
  {
    id: 'faq-18',
    titulo: 'Não recebo notificações push',
    palavrasChave: ['nao recebo', 'notificacao', 'push', 'alerta', 'permissao'],
    resposta:
      'Verifique se as notificações do aplicativo estão permitidas nas configurações do seu celular. Dentro do app, acesse Perfil > Notificações e confira se os alertas desejados estão ativados.',
  },
  {
    id: 'faq-19',
    titulo: 'O mapa não carrega a localização',
    palavrasChave: ['localizacao', 'gps', 'permissao', 'mapa nao carrega', 'carregar mapa'],
    resposta:
      'Verifique se o GPS do celular está ligado e se o EduTransporter tem permissão de localização (Configurações > Apps > EduTransporter > Permissões). Depois de ativar, reinicie o aplicativo.',
  },
  {
    id: 'faq-20',
    titulo: 'Como reportar um bug ou falar com o suporte?',
    palavrasChave: ['bug', 'erro', 'problema', 'sugestao', 'suporte', 'contato', 'email', 'coordenacao', 'atendimento'],
    resposta:
      'Use a aba Chat no aplicativo para falar com a central ou envie um e-mail para suporte@edutransporter.com informando o modelo do celular, a versão do app (exibida na tela de login) e a descrição do problema. Para assuntos presenciais ou administrativos, procure a Coordenação de Transportes / Secretaria.',
  },
  {
    id: 'faq-21',
    titulo: 'O app pede para atualizar, sou obrigado?',
    palavrasChave: ['atualizar', 'atualizacao', 'versao', 'obrigado', 'antiga'],
    resposta:
      'Recomendamos sempre manter o aplicativo atualizado para ter acesso a correções e novas funcionalidades. Versões muito antigas podem parar de funcionar após algum tempo.',
  },
];

const STOPWORDS = new Set([
  'a', 'ao', 'aos', 'as', 'com', 'como', 'da', 'das', 'de', 'do', 'dos', 'e', 'em',
  'essa', 'esse', 'esta', 'este', 'eu', 'foi', 'me', 'meu', 'minha', 'na', 'nas', 'no',
  'nos', 'o', 'os', 'ou', 'para', 'pelo', 'pela', 'por', 'posso', 'qual', 'que', 'quem',
  'se', 'sem', 'ser', 'seu', 'sua', 'tem', 'ter', 'um', 'uma', 'voce', 'app', 'aplicativo',
]);

function normalizarTexto(texto: string): string {
  return texto
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function extrairTokens(texto: string): string[] {
  return normalizarTexto(texto)
    .split(' ')
    .filter((t) => t.length > 1 && !STOPWORDS.has(t));
}

function tokensCoincidem(a: string, b: string): boolean {
  if (a === b) return true;
  if (a.length >= 4 && b.length >= 4) {
    return a.startsWith(b.slice(0, 4)) || b.startsWith(a.slice(0, 4));
  }
  return false;
}

export function responderComBaseLocal(pergunta: string): string {
  const norm = normalizarTexto(pergunta);

  if (/^(oi|ola|bom dia|boa tarde|boa noite|e ai|hey|ola tudo bem|tudo bem)\b/.test(norm) && norm.split(' ').length <= 5) {
    return 'Olá! Sou o Assistente IA do EduTransporter. Você pode me perguntar sobre rotas, horários, mapa do ônibus, confirmação de presença, chat, notificações ou dados da sua conta.';
  }

  if (/^(obrigad[oa]|valeu|brigado|vlw|show|perfeito)\b/.test(norm) && norm.split(' ').length <= 5) {
    return 'De nada! Se precisar de mais alguma ajuda com o EduTransporter, é só perguntar por aqui.';
  }

  const tokensPergunta = extrairTokens(pergunta);
  if (tokensPergunta.length === 0) {
    return 'Pode detalhar um pouco mais sua dúvida? Por exemplo, pergunte sobre senha, rota, horário, mapa, presença, chat ou notificações.';
  }

  let melhorItem: ConhecimentoItem | null = null;
  let melhorPontuacao = 0;

  for (const item of BASE_CONHECIMENTO_OFICIAL) {
    const tokensTitulo = extrairTokens(item.titulo);
    const frasesChave = item.palavrasChave.filter((k) => k.includes(' '));
    const palavrasSimples = item.palavrasChave
      .filter((k) => !k.includes(' '))
      .flatMap((k) => extrairTokens(k));
    const tokensResposta = extrairTokens(item.resposta);
    const fraseChaveMatch = frasesChave.some((k) => norm.includes(normalizarTexto(k)));

    let pontuacao = fraseChaveMatch ? 4.5 : 0;

    for (const tp of tokensPergunta) {
      if (palavrasSimples.some((tc) => tokensCoincidem(tp, tc))) {
        pontuacao += 3;
      } else if (tokensTitulo.some((tt) => tokensCoincidem(tp, tt))) {
        pontuacao += 2.5;
      } else if (tokensResposta.some((tr) => tokensCoincidem(tp, tr))) {
        pontuacao += 1;
      }
    }

    if (pontuacao > melhorPontuacao) {
      melhorPontuacao = pontuacao;
      melhorItem = item;
    }
  }

  if (melhorItem && melhorPontuacao >= 3) {
    return melhorItem.resposta;
  }

  return 'Não encontrei essa resposta exata na documentação oficial do EduTransporter. Para casos específicos ou administrativos, use a aba Chat no aplicativo, envie um e-mail para suporte@edutransporter.com ou procure a coordenação de transportes.';
}

async function fetchComTimeout(url: string, options: RequestInit, timeoutMs: number): Promise<Response> {
  const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
  const timer = controller ? setTimeout(() => controller.abort(), timeoutMs) : null;
  try {
    return await fetch(url, {
      ...options,
      signal: controller ? controller.signal : undefined,
    });
  } finally {
    if (timer) clearTimeout(timer);
  }
}

export async function checkIaStatus(): Promise<IaStatusResponse> {
  try {
    const res = await fetchComTimeout(`${IA_API_URL}/`, { method: 'GET' }, 4000);
    if (!res.ok) return { online: false };
    const data = await res.json().catch(() => null);
    if (data && data.status === 'ok') {
      return {
        online: true,
        modelo: typeof data.modelo === 'string' ? data.modelo : undefined,
        trechosCarregados: typeof data.trechos_carregados === 'number' ? data.trechos_carregados : undefined,
      };
    }
    return { online: false };
  } catch {
    return { online: false };
  }
}

export async function perguntarIa(pergunta: string): Promise<IaPerguntaResponse> {
  const limpa = pergunta.trim();
  if (!limpa) {
    return {
      resposta: 'Digite uma pergunta para que eu possa ajudar.',
      origem: 'base-local',
    };
  }

  try {
    const res = await fetchComTimeout(
      `${IA_API_URL}/perguntar`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({ pergunta: limpa }),
      },
      45000
    );

    if (res.ok) {
      const data = await res.json().catch(() => null);
      if (data && typeof data.resposta === 'string' && data.resposta.trim()) {
        return {
          resposta: data.resposta.trim(),
          origem: 'ia',
        };
      }
    }
  } catch {
    // Falha de rede, CORS ou timeout: usa fallback na base oficial
  }

  return {
    resposta: responderComBaseLocal(limpa),
    origem: 'base-local',
  };
}
