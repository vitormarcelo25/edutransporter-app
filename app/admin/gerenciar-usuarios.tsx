/**
 * EduTransporter - Gerenciamento de Usuários e Solicitações
 * Painel Administrativo da Prefeitura / Coordenação de Transportes
 */

import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, Text, View, TouchableOpacity, SafeAreaView, 
  ScrollView, Platform, ActivityIndicator, TextInput, Modal 
} from 'react-native';
import { Alert } from '@/components/Alert';
import { Feather, FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter, Stack } from 'expo-router';
import { useApp } from '../_layout';
import { 
  getUsuariosAdmin, aprovarSolicitacao, recusarSolicitacao, cadastrarMotoristaAdmin,
  getAdminRotas, SolicitacaoAluno, MotoristaCadastrado, AlunoCadastrado 
} from '../../services/api';

const ROTAS_DISPONIVEIS = [
  'Linha 01 - Nassau Noturno',
  'Linha 02 - IFPE Diurno',
  'Linha 03 - Dom Bosco / Manhã',
  'Linha 04 - Caruaru / Escolas Técnicas',
];

export default function GerenciarUsuarios() {
  const router = useRouter();
  const { theme, userRole } = useApp();
  
  const [activeTab, setActiveTab] = useState<'solicitacoes' | 'motoristas' | 'alunos'>('solicitacoes');
  const [loading, setLoading] = useState(true);
  const [solicitacoes, setSolicitacoes] = useState<SolicitacaoAluno[]>([]);
  const [motoristas, setMotoristas] = useState<MotoristaCadastrado[]>([]);
  const [alunos, setAlunos] = useState<AlunoCadastrado[]>([]);
  const [buscaAluno, setBuscaAluno] = useState('');
  const [rotasDisponiveis, setRotasDisponiveis] = useState<string[]>(ROTAS_DISPONIVEIS);

  // Modal de Aprovação de Solicitação
  const [modalAprovarVisivel, setModalAprovarVisivel] = useState(false);
  const [solicitacaoSelecionada, setSolicitacaoSelecionada] = useState<SolicitacaoAluno | null>(null);
  const [rotaSelecionada, setRotaSelecionada] = useState(ROTAS_DISPONIVEIS[0]);
  const [processandoAprovacao, setProcessandoAprovacao] = useState(false);

  // Modal de Cadastro de Motorista
  const [modalMotoristaVisivel, setModalMotoristaVisivel] = useState(false);
  const [novoMotorista, setNovoMotorista] = useState({
    nome: '',
    cpf: '',
    telefone: '',
    cnh: '',
    placa: '',
    rotaNome: ROTAS_DISPONIVEIS[0],
  });
  const [salvandoMotorista, setSalvandoMotorista] = useState(false);

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    setLoading(true);
    const res = await getUsuariosAdmin();
    setLoading(false);
    if (res.success) {
      setSolicitacoes(res.solicitacoes);
      setMotoristas(res.motoristas);
      setAlunos(res.alunos);
    } else {
      Alert.alert('Erro', res.message || 'Não foi possível carregar os usuários. Faça login novamente.');
    }

    try {
      const rotasRes = await getAdminRotas();
      if (rotasRes.success && rotasRes.rotas.length > 0) {
        const nomes = rotasRes.rotas.map((r) => r.nome);
        setRotasDisponiveis(nomes);
      }
    } catch {}
  };

  const abrirModalAprovar = (sol: SolicitacaoAluno) => {
    setSolicitacaoSelecionada(sol);
    setRotaSelecionada(rotasDisponiveis[0] || 'Linha 01 - Nassau Noturno');
    setModalAprovarVisivel(true);
  };

  const confirmarAprovacao = async () => {
    if (!solicitacaoSelecionada) return;
    setProcessandoAprovacao(true);
    const res = await aprovarSolicitacao(solicitacaoSelecionada.id, rotaSelecionada);
    setProcessandoAprovacao(false);
    setModalAprovarVisivel(false);

    if (res.success) {
      Alert.alert('Sucesso!', res.message);
      carregarDados();
    } else {
      Alert.alert('Erro', res.message);
    }
  };

  const handleRecusar = (sol: SolicitacaoAluno) => {
    Alert.alert(
      'Recusar Solicitação',
      `Deseja recusar o cadastro de ${sol.nome}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Confirmar Recusa', 
          style: 'destructive',
          onPress: async () => {
            const res = await recusarSolicitacao(sol.id, 'Documentação não conferida com a secretaria.');
            if (res.success) {
              Alert.alert('Atualizado', 'Solicitação foi recusada.');
              carregarDados();
            } else {
              Alert.alert('Erro', res.message);
            }
          }
        }
      ]
    );
  };

  const handleCadastrarMotorista = async () => {
    if (!novoMotorista.nome.trim() || !novoMotorista.cpf.trim() || !novoMotorista.placa.trim()) {
      Alert.alert('Campos obrigatórios', 'Preencha Nome, CPF e Placa do veículo.');
      return;
    }

    setSalvandoMotorista(true);
    const res = await cadastrarMotoristaAdmin({
      nome: novoMotorista.nome,
      cpf: novoMotorista.cpf,
      telefone: novoMotorista.telefone || '(81) 99999-0000',
      cnh: novoMotorista.cnh || '00000000000',
      placa: novoMotorista.placa,
      rotaId: '1',
      rotaNome: novoMotorista.rotaNome,
    });
    setSalvandoMotorista(false);

    if (res.success) {
      setModalMotoristaVisivel(false);
      setNovoMotorista({
        nome: '',
        cpf: '',
        telefone: '',
        cnh: '',
        placa: '',
        rotaNome: ROTAS_DISPONIVEIS[0],
      });
      Alert.alert('Sucesso', 'Motorista credenciado com sucesso!');
      carregarDados();
    } else {
      Alert.alert('Erro', res.message);
    }
  };

  const solicitacoesPendentes = solicitacoes.filter(s => s.status === 'pendente');

  const alunosFiltrados = alunos.filter(a => 
    a.nome.toLowerCase().includes(buscaAluno.toLowerCase()) || 
    a.cpf.includes(buscaAluno) ||
    a.escola.toLowerCase().includes(buscaAluno.toLowerCase())
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]}>
      <Stack.Screen options={{ headerShown: false }} />
      
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.card, borderBottomColor: theme.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="arrow-left" size={22} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.text }]}>Gestão de Usuários</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Tabs de Navegação */}
      <View style={[styles.tabsContainer, { backgroundColor: theme.card, borderBottomColor: theme.border }]}>
        <TouchableOpacity 
          style={[styles.tabBtn, activeTab === 'solicitacoes' && { borderBottomColor: theme.gold, borderBottomWidth: 3 }]}
          onPress={() => setActiveTab('solicitacoes')}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Text style={[styles.tabText, { color: activeTab === 'solicitacoes' ? theme.gold : theme.subtext }]}>
              Solicitações
            </Text>
            {solicitacoesPendentes.length > 0 && (
              <View style={styles.badgeCount}>
                <Text style={styles.badgeCountText}>{solicitacoesPendentes.length}</Text>
              </View>
            )}
          </View>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.tabBtn, activeTab === 'motoristas' && { borderBottomColor: theme.gold, borderBottomWidth: 3 }]}
          onPress={() => setActiveTab('motoristas')}
        >
          <Text style={[styles.tabText, { color: activeTab === 'motoristas' ? theme.gold : theme.subtext }]}>
            Motoristas ({motoristas.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.tabBtn, activeTab === 'alunos' && { borderBottomColor: theme.gold, borderBottomWidth: 3 }]}
          onPress={() => setActiveTab('alunos')}
        >
          <Text style={[styles.tabText, { color: activeTab === 'alunos' ? theme.gold : theme.subtext }]}>
            Alunos Ativos ({alunos.length})
          </Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color={theme.gold} />
          <Text style={[styles.loadingText, { color: theme.subtext }]}>Carregando usuários...</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          
          {/* ====================================================
              ABA 1: SOLICITAÇÕES PENDENTES DE ALUNOS
             ==================================================== */}
          {activeTab === 'solicitacoes' && (
            <>
              <View style={[styles.infoBanner, { backgroundColor: 'rgba(245,166,35,0.1)', borderColor: 'rgba(245,166,35,0.3)' }]}>
                <Feather name="clock" size={18} color={theme.gold} />
                <Text style={[styles.infoBannerText, { color: theme.text }]}>
                  Alunos que enviaram cadastro pelo aplicativo. Valide com a documentação escolar presencial antes de aprovar.
                </Text>
              </View>

              {solicitacoesPendentes.length === 0 ? (
                <View style={styles.emptyState}>
                  <Feather name="check-circle" size={48} color="#48BB78" />
                  <Text style={[styles.emptyStateTitle, { color: theme.text }]}>Nenhuma solicitação pendente!</Text>
                  <Text style={[styles.emptyStateSub, { color: theme.subtext }]}>
                    Todas as solicitações de alunos foram analisadas.
                  </Text>
                </View>
              ) : (
                solicitacoesPendentes.map((sol) => (
                  <View key={sol.id} style={[styles.cardItem, { backgroundColor: theme.card, borderColor: theme.border }]}>
                    <View style={styles.cardHeader}>
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.cardTitle, { color: theme.text }]}>{sol.nome}</Text>
                        <Text style={[styles.cardSub, { color: theme.subtext }]}>
                          CPF: {sol.cpf} • {sol.telefone}
                        </Text>
                      </View>
                      <View style={styles.statusBadgePendente}>
                        <Text style={styles.statusBadgeTextPendente}>Pendente</Text>
                      </View>
                    </View>

                    <View style={[styles.cardDetailsGrid, { backgroundColor: theme.inputBg }]}>
                      <View style={styles.detailRow}>
                        <Feather name="book-open" size={13} color={theme.gold} />
                        <Text style={[styles.detailText, { color: theme.text }]}>{sol.escola}</Text>
                      </View>
                      <View style={styles.detailRow}>
                        <Feather name="map-pin" size={13} color="#4299E1" />
                        <Text style={[styles.detailText, { color: theme.subtext }]}>Ponto: {sol.pontoEmbarque || 'Ponto Central'}</Text>
                      </View>
                      <View style={styles.detailRow}>
                        <Feather name="sun" size={13} color="#ED8936" />
                        <Text style={[styles.detailText, { color: theme.subtext }]}>Turno: {sol.turno || 'Noturno'} • Matrícula: {sol.matriculaEscolar || 'Não informada'}</Text>
                      </View>
                    </View>

                    {/* Ações de Aprovação / Recusa */}
                    <View style={styles.actionsRow}>
                      <TouchableOpacity 
                        style={[styles.btnAction, styles.btnRecusar]}
                        onPress={() => handleRecusar(sol)}
                      >
                        <Feather name="x" size={16} color="#EF4444" />
                        <Text style={styles.btnRecusarText}>Recusar</Text>
                      </TouchableOpacity>

                      <TouchableOpacity 
                        style={[styles.btnAction, styles.btnAprovar, { backgroundColor: theme.gold }]}
                        onPress={() => abrirModalAprovar(sol)}
                      >
                        <Feather name="check" size={16} color="#1A253A" />
                        <Text style={styles.btnAprovarText}>Aprovar e Vincular Linha</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))
              )}
            </>
          )}

          {/* ====================================================
              ABA 2: MOTORISTAS CREDENCIADOS
             ==================================================== */}
          {activeTab === 'motoristas' && (
            <>
              <View style={styles.headerActionRow}>
                <Text style={[styles.sectionHeading, { color: theme.text }]}>Motoristas da Frota</Text>
                <TouchableOpacity 
                  style={[styles.btnAdd, { backgroundColor: theme.gold }]}
                  onPress={() => setModalMotoristaVisivel(true)}
                >
                  <Feather name="plus" size={16} color="#1A253A" />
                  <Text style={styles.btnAddText}>Novo Motorista</Text>
                </TouchableOpacity>
              </View>

              {motoristas.map((mot) => (
                <View key={mot.id} style={[styles.cardItem, { backgroundColor: theme.card, borderColor: theme.border }]}>
                  <View style={styles.cardHeader}>
                    <View style={[styles.avatarIcon, { backgroundColor: 'rgba(72,187,120,0.15)' }]}>
                      <FontAwesome5 name="bus" size={18} color="#48BB78" />
                    </View>
                    <View style={{ flex: 1, marginLeft: 12 }}>
                      <Text style={[styles.cardTitle, { color: theme.text }]}>{mot.nome}</Text>
                      <Text style={[styles.cardSub, { color: theme.subtext }]}>
                        CNH: {mot.cnh} • Tel: {mot.telefone}
                      </Text>
                    </View>
                    <View style={[styles.placaBadge, { backgroundColor: theme.inputBg }]}>
                      <Text style={[styles.placaText, { color: theme.text }]}>{mot.placa}</Text>
                    </View>
                  </View>

                  <View style={[styles.cardDetailsGrid, { backgroundColor: theme.inputBg, marginTop: 12 }]}>
                    <View style={styles.detailRow}>
                      <MaterialCommunityIcons name="bus-marker" size={15} color={theme.gold} />
                      <Text style={[styles.detailText, { color: theme.text, fontWeight: '600' }]}>
                        {mot.rotaNome}
                      </Text>
                    </View>
                  </View>
                </View>
              ))}
            </>
          )}

          {/* ====================================================
              ABA 3: ALUNOS ATIVOS (COM VAGA)
             ==================================================== */}
          {activeTab === 'alunos' && (
            <>
              {/* Barra de Busca */}
              <View style={[styles.searchContainer, { backgroundColor: theme.card, borderColor: theme.border }]}>
                <Feather name="search" size={18} color={theme.subtext} />
                <TextInput 
                  style={[styles.searchInput, { color: theme.text }]}
                  placeholder="Buscar por nome, CPF ou faculdade..."
                  placeholderTextColor={theme.subtext}
                  value={buscaAluno}
                  onChangeText={setBuscaAluno}
                />
                {buscaAluno ? (
                  <TouchableOpacity onPress={() => setBuscaAluno('')}>
                    <Feather name="x" size={16} color={theme.subtext} />
                  </TouchableOpacity>
                ) : null}
              </View>

              {alunosFiltrados.map((alu) => (
                <View key={alu.id} style={[styles.cardItem, { backgroundColor: theme.card, borderColor: theme.border }]}>
                  <View style={styles.cardHeader}>
                    <View style={[styles.avatarIcon, { backgroundColor: 'rgba(66,153,225,0.15)' }]}>
                      <FontAwesome5 name="user-graduate" size={16} color="#4299E1" />
                    </View>
                    <View style={{ flex: 1, marginLeft: 12 }}>
                      <Text style={[styles.cardTitle, { color: theme.text }]}>{alu.nome}</Text>
                      <Text style={[styles.cardSub, { color: theme.subtext }]}>
                        {alu.escola} • {alu.telefone}
                      </Text>
                    </View>
                    <View style={styles.statusBadgeAtivo}>
                      <Text style={styles.statusBadgeTextAtivo}>Ativo</Text>
                    </View>
                  </View>

                  <View style={[styles.cardDetailsGrid, { backgroundColor: theme.inputBg, marginTop: 12 }]}>
                    <View style={styles.detailRow}>
                      <FontAwesome5 name="route" size={12} color={theme.gold} />
                      <Text style={[styles.detailText, { color: theme.text }]}>{alu.rotaNome}</Text>
                    </View>
                  </View>
                </View>
              ))}
            </>
          )}

          <View style={{ height: 60 }} />
        </ScrollView>
      )}

      {/* ====================================================
          MODAL: APROVAR E VINCULAR LINHA AO ALUNO
         ==================================================== */}
      <Modal
        visible={modalAprovarVisivel}
        transparent
        animationType="slide"
        onRequestClose={() => setModalAprovarVisivel(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: theme.card }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.text }]}>Aprovar Solicitação</Text>
              <TouchableOpacity onPress={() => setModalAprovarVisivel(false)}>
                <Feather name="x" size={22} color={theme.subtext} />
              </TouchableOpacity>
            </View>

            <Text style={[styles.modalSub, { color: theme.subtext }]}>
              Aluno: <Text style={{ color: theme.text, fontWeight: 'bold' }}>{solicitacaoSelecionada?.nome}</Text>
            </Text>
            <Text style={[styles.modalSub, { color: theme.subtext, marginBottom: 16 }]}>
              Instituição: {solicitacaoSelecionada?.escola}
            </Text>

            <Text style={[styles.modalLabel, { color: theme.text }]}>Selecione a Linha de Ônibus:</Text>
            {rotasDisponiveis.map((r) => (
              <TouchableOpacity
                key={r}
                style={[
                  styles.rotaOption, 
                  { backgroundColor: theme.inputBg, borderColor: rotaSelecionada === r ? theme.gold : theme.border },
                  rotaSelecionada === r && { borderWidth: 2 }
                ]}
                onPress={() => setRotaSelecionada(r)}
              >
                <FontAwesome5 name="bus" size={14} color={rotaSelecionada === r ? theme.gold : theme.subtext} />
                <Text style={[styles.rotaOptionText, { color: rotaSelecionada === r ? theme.gold : theme.text }]}>
                  {r}
                </Text>
              </TouchableOpacity>
            ))}

            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={[styles.modalBtnCancel, { borderColor: theme.border }]} 
                onPress={() => setModalAprovarVisivel(false)}
              >
                <Text style={{ color: theme.subtext, fontWeight: 'bold' }}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.modalBtnConfirm, { backgroundColor: theme.gold }]}
                onPress={confirmarAprovacao}
                disabled={processandoAprovacao}
              >
                <Text style={styles.modalBtnConfirmText}>
                  {processandoAprovacao ? 'Salvando...' : 'Confirmar e Liberar Acesso'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ====================================================
          MODAL: CADASTRAR NOVO MOTORISTA (EXCLUSIVO ADMIN)
         ==================================================== */}
      <Modal
        visible={modalMotoristaVisivel}
        transparent
        animationType="slide"
        onRequestClose={() => setModalMotoristaVisivel(false)}
      >
        <View style={styles.modalOverlay}>
          <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}>
            <View style={[styles.modalCard, { backgroundColor: theme.card }]}>
              <View style={styles.modalHeader}>
                <Text style={[styles.modalTitle, { color: theme.text }]}>Cadastrar Novo Motorista</Text>
                <TouchableOpacity onPress={() => setModalMotoristaVisivel(false)}>
                  <Feather name="x" size={22} color={theme.subtext} />
                </TouchableOpacity>
              </View>

              <Text style={[styles.modalSub, { color: theme.subtext, marginBottom: 16 }]}>
                Apenas condutores autorizados pela prefeitura com CNH compatível.
              </Text>

              <TextInput 
                style={[styles.modalInput, { backgroundColor: theme.inputBg, borderColor: theme.border, color: theme.text }]}
                placeholder="Nome Completo do Motorista *"
                placeholderTextColor={theme.subtext}
                value={novoMotorista.nome}
                onChangeText={(v) => setNovoMotorista(prev => ({ ...prev, nome: v }))}
              />

              <TextInput 
                style={[styles.modalInput, { backgroundColor: theme.inputBg, borderColor: theme.border, color: theme.text }]}
                placeholder="CPF *"
                keyboardType="number-pad"
                placeholderTextColor={theme.subtext}
                value={novoMotorista.cpf}
                onChangeText={(v) => setNovoMotorista(prev => ({ ...prev, cpf: v }))}
              />

              <TextInput 
                style={[styles.modalInput, { backgroundColor: theme.inputBg, borderColor: theme.border, color: theme.text }]}
                placeholder="Telefone / WhatsApp"
                keyboardType="phone-pad"
                placeholderTextColor={theme.subtext}
                value={novoMotorista.telefone}
                onChangeText={(v) => setNovoMotorista(prev => ({ ...prev, telefone: v }))}
              />

              <TextInput 
                style={[styles.modalInput, { backgroundColor: theme.inputBg, borderColor: theme.border, color: theme.text }]}
                placeholder="Número da CNH (Cat. D ou E)"
                placeholderTextColor={theme.subtext}
                value={novoMotorista.cnh}
                onChangeText={(v) => setNovoMotorista(prev => ({ ...prev, cnh: v }))}
              />

              <TextInput 
                style={[styles.modalInput, { backgroundColor: theme.inputBg, borderColor: theme.border, color: theme.text }]}
                placeholder="Placa do Veículo (ex: KJH-4020) *"
                autoCapitalize="characters"
                placeholderTextColor={theme.subtext}
                value={novoMotorista.placa}
                onChangeText={(v) => setNovoMotorista(prev => ({ ...prev, placa: v }))}
              />

              <Text style={[styles.modalLabel, { color: theme.text, marginTop: 8 }]}>Linha Designada:</Text>
              {rotasDisponiveis.map((r) => (
                <TouchableOpacity
                  key={r}
                  style={[
                    styles.rotaOption, 
                    { backgroundColor: theme.inputBg, borderColor: novoMotorista.rotaNome === r ? theme.gold : theme.border },
                    novoMotorista.rotaNome === r && { borderWidth: 2 }
                  ]}
                  onPress={() => setNovoMotorista(prev => ({ ...prev, rotaNome: r }))}
                >
                  <FontAwesome5 name="route" size={13} color={novoMotorista.rotaNome === r ? theme.gold : theme.subtext} />
                  <Text style={[styles.rotaOptionText, { color: novoMotorista.rotaNome === r ? theme.gold : theme.text }]}>
                    {r}
                  </Text>
                </TouchableOpacity>
              ))}

              <View style={styles.modalActions}>
                <TouchableOpacity 
                  style={[styles.modalBtnCancel, { borderColor: theme.border }]} 
                  onPress={() => setModalMotoristaVisivel(false)}
                >
                  <Text style={{ color: theme.subtext, fontWeight: 'bold' }}>Cancelar</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={[styles.modalBtnConfirm, { backgroundColor: theme.gold }]}
                  onPress={handleCadastrarMotorista}
                  disabled={salvandoMotorista}
                >
                  <Text style={styles.modalBtnConfirmText}>
                    {salvandoMotorista ? 'Cadastrando...' : 'Salvar Motorista'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </View>
      </Modal>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 10 : 25,
    paddingBottom: 15,
    borderBottomWidth: 1,
  },
  backBtn: { padding: 4 },
  title: { fontSize: 18, fontWeight: 'bold' },
  centerContent: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { fontSize: 15, marginTop: 10 },

  tabsContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    paddingHorizontal: 16,
  },
  tabBtn: {
    paddingVertical: 14,
    marginRight: 20,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '700',
  },
  badgeCount: {
    backgroundColor: '#EF4444',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 1,
  },
  badgeCountText: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: 'bold',
  },

  scrollContent: { padding: 16 },

  infoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 16,
    gap: 10,
  },
  infoBannerText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 18,
  },

  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  emptyStateTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    marginTop: 12,
  },
  emptyStateSub: {
    fontSize: 13,
    textAlign: 'center',
    marginTop: 6,
  },

  cardItem: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginBottom: 14,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  cardSub: {
    fontSize: 12,
    marginTop: 2,
  },
  statusBadgePendente: {
    backgroundColor: 'rgba(245,166,35,0.15)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusBadgeTextPendente: {
    color: '#F5A623',
    fontSize: 11,
    fontWeight: '700',
  },
  statusBadgeAtivo: {
    backgroundColor: 'rgba(72,187,120,0.15)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusBadgeTextAtivo: {
    color: '#48BB78',
    fontSize: 11,
    fontWeight: '700',
  },

  cardDetailsGrid: {
    borderRadius: 10,
    padding: 10,
    marginTop: 10,
    gap: 6,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailText: {
    fontSize: 12,
  },

  actionsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 14,
  },
  btnAction: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    gap: 6,
  },
  btnRecusar: {
    backgroundColor: 'rgba(239,68,68,0.1)',
    borderWidth: 1,
    borderColor: '#EF4444',
  },
  btnRecusarText: {
    color: '#EF4444',
    fontSize: 12,
    fontWeight: 'bold',
  },
  btnAprovar: {
    flex: 1,
  },
  btnAprovarText: {
    color: '#1A253A',
    fontSize: 12,
    fontWeight: 'bold',
  },

  headerActionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  sectionHeading: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  btnAdd: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    gap: 6,
  },
  btnAddText: {
    color: '#1A253A',
    fontSize: 13,
    fontWeight: 'bold',
  },

  avatarIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placaBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  placaText: {
    fontSize: 11,
    fontWeight: 'bold',
    letterSpacing: 1,
  },

  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 14,
    height: 46,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
  },

  /* Modais */
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    padding: 20,
  },
  modalCard: {
    borderRadius: 20,
    padding: 22,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalSub: {
    fontSize: 13,
  },
  modalLabel: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 8,
  },
  rotaOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 8,
  },
  rotaOptionText: {
    fontSize: 13,
    fontWeight: '600',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 18,
  },
  modalBtnCancel: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  modalBtnConfirm: {
    flex: 2,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
  },
  modalBtnConfirmText: {
    color: '#1A253A',
    fontWeight: 'bold',
    fontSize: 13,
  },
  modalInput: {
    height: 46,
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 12,
    fontSize: 13,
    marginBottom: 10,
  },
});