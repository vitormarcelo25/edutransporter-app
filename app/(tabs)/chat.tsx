/**
 * EduTransporter - Chat Oficial da Rota
 * Sistema de Mensagens Geral em Tempo Real por Rota
 * 100% Funcional, Persistente e Pronto para Operação Offline
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TouchableOpacity, 
  FlatList, 
  TextInput, 
  Platform,
  KeyboardAvoidingView,
  ActivityIndicator,
  Modal,
  ScrollView
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';
import { Alert } from '@/components/Alert';
import { useApp } from '../_layout';
import { 
  getRotaDoDia, 
  getMensagensRota, 
  enviarMensagemRota, 
  excluirMensagemRota, 
  limparChatRota, 
  getRotasParaChat,
  ChatMessage, 
  Rota 
} from '../../services/api';

export default function ChatScreen() {
  const router = useRouter();
  const { userData, userRole } = useApp();

  const [rota, setRota] = useState<Rota | null>(null);
  const [rotaIdAtiva, setRotaIdAtiva] = useState<string>('');
  const [rotasDisponiveis, setRotasDisponiveis] = useState<Array<{ id: string; nome: string; escola?: string; alunosQtd: number }>>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const [sending, setSending] = useState(false);
  
  // Modais
  const [infoModalVisible, setInfoModalVisible] = useState(false);
  const [selectorModalVisible, setSelectorModalVisible] = useState(false);

  const flatListRef = useRef<FlatList>(null);
  const isFirstLoadRef = useRef(true);

  // Carrega a rota inicial vinculada ao usuário
  const carregarRotaInicial = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getRotaDoDia(userRole === 'aluno' ? userData?.id : undefined);
      if (res.success && res.rota) {
        setRota(res.rota);
        const idAtivo = res.rota.id || res.rota.nome;
        setRotaIdAtiva(idAtivo);
        await carregarMensagens(idAtivo);
      }

      // Se for admin ou motorista, busca lista de todas as rotas para permitir alternar
      if (userRole === 'admin' || userRole === 'motorista') {
        const todas = await getRotasParaChat();
        setRotasDisponiveis(todas);
      }
    } catch (err) {
      console.warn('Erro ao carregar rota do chat:', err);
    } finally {
      setLoading(false);
    }
  }, [userRole, userData?.id]);

  // Carrega mensagens da rota ativa
  const carregarMensagens = async (idDaRota: string, silencioso = false) => {
    if (!idDaRota) return;
    if (!silencioso) setLoadingMessages(true);
    try {
      const msgs = await getMensagensRota(idDaRota);
      setMessages(msgs);
    } catch (err) {
      console.warn('Erro ao buscar mensagens:', err);
    } finally {
      if (!silencioso) setLoadingMessages(false);
    }
  };

  // Recarrega sempre que o usuário entra na aba
  useFocusEffect(
    useCallback(() => {
      carregarRotaInicial();
    }, [carregarRotaInicial])
  );

  // Polling resiliente de atualização de mensagens (para sincronização offline / local)
  useEffect(() => {
    if (!rotaIdAtiva) return;

    const interval = setInterval(() => {
      carregarMensagens(rotaIdAtiva, true);
    }, 3500);

    return () => clearInterval(interval);
  }, [rotaIdAtiva]);

  // Rola até o final ao receber novas mensagens
  useEffect(() => {
    if (messages.length > 0) {
      const timer = setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: !isFirstLoadRef.current });
        isFirstLoadRef.current = false;
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [messages.length]);

  // Enviar mensagem
  const handleEnviarMensagem = async (textoPersonalizado?: string) => {
    const texto = (textoPersonalizado || inputMessage).trim();
    if (!texto || !rotaIdAtiva || sending) return;

    setSending(true);
    setInputMessage('');

    try {
      const meuNome = userData?.nome || (userRole === 'motorista' ? 'Motorista' : userRole === 'admin' ? 'Administrador' : 'Aluno');
      const meuId = userData?.id || 'local-user';

      const res = await enviarMensagemRota(rotaIdAtiva, {
        autorId: meuId,
        autorNome: meuNome,
        autorRole: userRole || 'aluno',
        texto: texto,
        rotaNome: rota?.nome,
      });

      if (res.success && res.mensagem) {
        setMessages((prev) => [...prev, res.mensagem!]);
      } else {
        Alert.alert('Aviso', res.message || 'Não foi possível enviar a mensagem.');
      }
    } catch (err) {
      console.warn('Erro ao enviar mensagem:', err);
      Alert.alert('Erro', 'Ocorreu um erro ao registrar sua mensagem.');
    } finally {
      setSending(false);
    }
  };

  // Excluir mensagem (somente o autor ou admin)
  const handleExcluirMensagem = (mensagem: ChatMessage) => {
    const souAutor = mensagem.autorId === userData?.id || mensagem.autorNome === userData?.nome;
    const souAdmin = userRole === 'admin';

    if (!souAutor && !souAdmin) return;

    Alert.alert(
      'Excluir Mensagem',
      'Deseja remover esta mensagem do grupo da rota?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Excluir', 
          style: 'destructive', 
          onPress: async () => {
            await excluirMensagemRota(rotaIdAtiva, mensagem.id);
            setMessages((prev) => prev.filter((m) => m.id !== mensagem.id));
          }
        }
      ]
    );
  };

  // Alternar rota (para Motorista ou Admin)
  const handleSelecionarRota = async (r: { id: string; nome: string; escola?: string }) => {
    setSelectorModalVisible(false);
    setLoading(true);
    const novoId = r.id || r.nome;
    setRotaIdAtiva(novoId);
    setRota((prev) => prev ? { ...prev, id: r.id, nome: r.nome, escola: r.escola || prev.escola } : null);
    await carregarMensagens(novoId);
    setLoading(false);
  };

  // Limpar todo o chat da rota (somente Admin)
  const handleLimparChat = () => {
    Alert.alert(
      'Limpar Histórico',
      `Tem certeza que deseja apagar todas as mensagens da rota "${rota?.nome}"? Essa ação não pode ser desfeita.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Limpar Tudo',
          style: 'destructive',
          onPress: async () => {
            await limparChatRota(rotaIdAtiva);
            setMessages([]);
            setInfoModalVisible(false);
          }
        }
      ]
    );
  };

  // Chips de atalhos rápidos contextuais
  const chipsRapidos = userRole === 'motorista'
    ? [
        '🚌 Saindo da garagem agora',
        '⏱️ Previsão de 5 min na próxima parada',
        '🚦 Trânsito lento no trajeto',
        '✅ Rota finalizada com sucesso!',
      ]
    : [
        '👋 Já cheguei no ponto',
        '⏱️ Chego em 5 minutos',
        '🚌 O ônibus já passou por aí?',
        '✅ Já embarquei, obrigado!',
        '⚠️ Não vou hoje',
      ];

  // Renderização individual de cada mensagem
  const renderMessageItem = ({ item }: { item: ChatMessage }) => {
    const isMe = item.autorId === userData?.id || item.autorNome === userData?.nome;
    const isMotorista = item.autorRole === 'motorista';
    const isAdmin = item.autorRole === 'admin';

    return (
      <View style={[styles.messageWrapper, isMe ? styles.wrapperMe : styles.wrapperOther]}>
        {!isMe && (
          <View style={styles.senderHeader}>
            <Text style={styles.senderName}>{item.autorNome}</Text>
            {isMotorista && (
              <View style={styles.badgeMotorista}>
                <Feather name="navigation" size={10} color="#38BDF8" />
                <Text style={styles.badgeMotoristaText}>Motorista</Text>
              </View>
            )}
            {isAdmin && (
              <View style={styles.badgeAdmin}>
                <Feather name="shield" size={10} color="#F59E0B" />
                <Text style={styles.badgeAdminText}>Admin</Text>
              </View>
            )}
            {!isMotorista && !isAdmin && (
              <View style={styles.badgeAluno}>
                <Text style={styles.badgeAlunoText}>Passageiro</Text>
              </View>
            )}
          </View>
        )}

        <TouchableOpacity 
          onLongPress={() => handleExcluirMensagem(item)}
          delayLongPress={400}
          activeOpacity={0.85}
        >
          <View style={[styles.bubble, isMe ? styles.bubbleMe : styles.bubbleOther]}>
            <Text style={[styles.messageText, isMe ? styles.textMe : styles.textOther]}>
              {item.texto}
            </Text>
            <View style={styles.metaRow}>
              <Text style={[styles.timeText, isMe ? styles.timeMe : styles.timeOther]}>
                {item.horario}
              </Text>
              {isMe && (
                <Ionicons 
                  name="checkmark-done" 
                  size={13} 
                  color="rgba(26, 37, 58, 0.7)" 
                  style={{ marginLeft: 3 }} 
                />
              )}
            </View>
          </View>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* HEADER DA ROTA */}
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => router.replace('/(tabs)/home')} 
          style={styles.backBtn}
          accessibilityLabel="Voltar para tela inicial"
        >
          <Feather name="arrow-left" size={24} color="#FFF" />
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.headerInfo} 
          onPress={() => {
            if ((userRole === 'admin' || userRole === 'motorista') && rotasDisponiveis.length > 1) {
              setSelectorModalVisible(true);
            } else {
              setInfoModalVisible(true);
            }
          }}
          activeOpacity={0.7}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={styles.headerTitle} numberOfLines={1}>
              {rota?.nome ? `Rota: ${rota.nome}` : 'Chat da Rota'}
            </Text>
            {(userRole === 'admin' || userRole === 'motorista') && rotasDisponiveis.length > 1 && (
              <Feather name="chevron-down" size={16} color="#F5A623" style={{ marginLeft: 4 }} />
            )}
          </View>
          <Text style={styles.headerSubtitle} numberOfLines={1}>
            {rota?.escola ? `${rota.escola} • ` : ''}
            {rota?.alunos?.length ? `${rota.alunos.length} passageiros` : 'Grupo geral da linha'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.infoBtn} 
          onPress={() => setInfoModalVisible(true)}
          accessibilityLabel="Informações da rota"
        >
          <Ionicons name="information-circle-outline" size={24} color="#F5A623" />
        </TouchableOpacity>
      </View>

      {/* SUB-BARRA OFFLINE E STATUS */}
      <View style={styles.statusBarIndicator}>
        <View style={styles.statusDot} />
        <Text style={styles.statusText}>
          Canal exclusivo para passageiros e motorista desta rota • Mensagens salvas offline
        </Text>
      </View>

      {/* CONTEÚDO PRINCIPAL */}
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
        style={styles.keyboardView}
      >
        {loading ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color="#F5A623" />
            <Text style={styles.loadingText}>Conectando ao chat da rota...</Text>
          </View>
        ) : messages.length === 0 ? (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconBg}>
              <MaterialCommunityIcons name="bus-clock" size={48} color="#F5A623" />
            </View>
            <Text style={styles.emptyTitle}>
              {rota?.nome ? `Canal da Rota ${rota.nome}` : 'Canal da Rota'}
            </Text>
            <Text style={styles.emptySubtitle}>
              Nenhuma mensagem enviada ainda. As mensagens trocadas aqui são vistas por todos os alunos e motorista desta linha.
            </Text>
            <TouchableOpacity 
              style={styles.emptyActionBtn}
              onPress={() => handleEnviarMensagem('👋 Olá pessoal! Bom dia a todos da rota!')}
            >
              <Feather name="send" size={16} color="#1A253A" style={{ marginRight: 8 }} />
              <Text style={styles.emptyActionText}>Dar um "Olá" para o grupo</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={(item) => item.id}
            renderItem={renderMessageItem}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          />
        )}

        {/* CHIPS DE MENSAGENS RÁPIDAS */}
        <View style={styles.chipsContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsScroll}>
            {chipsRapidos.map((chip, idx) => (
              <TouchableOpacity
                key={idx}
                style={styles.chipBtn}
                onPress={() => handleEnviarMensagem(chip)}
                activeOpacity={0.7}
              >
                <Text style={styles.chipText}>{chip}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* BARRA DE INPUT E ENVIO */}
        <View style={styles.inputWrapper}>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Mensagem para o grupo da rota..."
              placeholderTextColor="#94A3B8"
              value={inputMessage}
              onChangeText={setInputMessage}
              multiline={false}
              returnKeyType="send"
              onSubmitEditing={() => handleEnviarMensagem()}
            />
            <TouchableOpacity 
              style={[
                styles.sendBtn, 
                inputMessage.trim() ? styles.sendBtnActive : styles.sendBtnDisabled
              ]} 
              onPress={() => handleEnviarMensagem()}
              disabled={!inputMessage.trim() || sending}
              accessibilityLabel="Enviar mensagem"
            >
              {sending ? (
                <ActivityIndicator size="small" color="#1A253A" />
              ) : (
                <Ionicons 
                  name="send" 
                  size={18} 
                  color={inputMessage.trim() ? '#1A253A' : '#64748B'} 
                />
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>

      {/* MODAL DE INFORMAÇÕES DA ROTA */}
      <Modal
        visible={infoModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setInfoModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <MaterialCommunityIcons name="bus" size={24} color="#F5A623" style={{ marginRight: 8 }} />
                <Text style={styles.modalTitle}>Detalhes do Chat da Rota</Text>
              </View>
              <TouchableOpacity onPress={() => setInfoModalVisible(false)}>
                <Feather name="x" size={22} color="#FFF" />
              </TouchableOpacity>
            </View>

            <ScrollView style={{ maxHeight: 380 }}>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Linha / Rota:</Text>
                <Text style={styles.infoValue}>{rota?.nome || 'Padrão'}</Text>
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Destino / Polo:</Text>
                <Text style={styles.infoValue}>{rota?.escola || 'Não especificado'}</Text>
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Horário de Saída:</Text>
                <Text style={styles.infoValue}>{rota?.horario || '18:00'}</Text>
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Total de Paradas:</Text>
                <Text style={styles.infoValue}>{rota?.paradas?.length || 0} cadastradas</Text>
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Passageiros Registrados:</Text>
                <Text style={styles.infoValue}>{rota?.alunos?.length || 0} alunos vinculados</Text>
              </View>

              {rota?.paradas && rota.paradas.length > 0 && (
                <View style={{ marginTop: 14 }}>
                  <Text style={styles.paradasTitle}>Itinerário das Paradas:</Text>
                  {rota.paradas.map((p, idx) => (
                    <View key={idx} style={styles.paradaItem}>
                      <View style={styles.paradaBullet}>
                        <Text style={styles.paradaIndex}>{idx + 1}</Text>
                      </View>
                      <Text style={styles.paradaNome}>{p.nome}</Text>
                    </View>
                  ))}
                </View>
              )}

              {userRole === 'admin' && (
                <TouchableOpacity 
                  style={styles.clearChatBtn}
                  onPress={handleLimparChat}
                >
                  <Feather name="trash-2" size={16} color="#EF4444" style={{ marginRight: 8 }} />
                  <Text style={styles.clearChatText}>Limpar Mensagens deste Chat</Text>
                </TouchableOpacity>
              )}
            </ScrollView>

            <TouchableOpacity 
              style={styles.modalCloseBtn}
              onPress={() => setInfoModalVisible(false)}
            >
              <Text style={styles.modalCloseText}>Fechar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* MODAL SELETOR DE ROTA (PARA ADMIN OU MOTORISTA) */}
      <Modal
        visible={selectorModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setSelectorModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Feather name="repeat" size={20} color="#F5A623" style={{ marginRight: 8 }} />
                <Text style={styles.modalTitle}>Selecionar Rota do Chat</Text>
              </View>
              <TouchableOpacity onPress={() => setSelectorModalVisible(false)}>
                <Feather name="x" size={22} color="#FFF" />
              </TouchableOpacity>
            </View>

            <Text style={styles.selectorSubtitle}>
              Como você tem permissão de {userRole === 'admin' ? 'Administrador' : 'Motorista'}, pode alternar e conversar no canal de qualquer rota:
            </Text>

            <ScrollView style={{ maxHeight: 320, marginTop: 10 }}>
              {rotasDisponiveis.map((r) => {
                const isAtiva = (r.id === rotaIdAtiva) || (r.nome === rotaIdAtiva);
                return (
                  <TouchableOpacity
                    key={r.id}
                    style={[styles.rotaSelectItem, isAtiva && styles.rotaSelectItemActive]}
                    onPress={() => handleSelecionarRota(r)}
                  >
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.rotaSelectNome, isAtiva && { color: '#F5A623' }]}>
                        {r.nome}
                      </Text>
                      <Text style={styles.rotaSelectSub}>
                        {r.escola ? `${r.escola} • ` : ''}{r.alunosQtd} passageiros
                      </Text>
                    </View>
                    {isAtiva && <Feather name="check" size={20} color="#F5A623" />}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  keyboardView: {
    flex: 1,
  },
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingHorizontal: 16, 
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
    backgroundColor: '#1E293B',
    paddingTop: Platform.OS === 'ios' ? 52 : 24,
  },
  backBtn: { 
    padding: 6,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  headerInfo: { 
    flex: 1, 
    marginLeft: 12,
  },
  headerTitle: { 
    fontSize: 16, 
    fontWeight: '700', 
    color: '#FFF',
  },
  headerSubtitle: { 
    fontSize: 12, 
    marginTop: 2, 
    color: '#94A3B8',
  },
  infoBtn: { 
    padding: 6,
    borderRadius: 8,
    backgroundColor: 'rgba(245, 166, 35, 0.1)',
  },

  statusBarIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#162032',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#10B981',
    marginRight: 8,
  },
  statusText: {
    fontSize: 11,
    color: '#94A3B8',
    flex: 1,
  },

  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#94A3B8',
  },

  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyIconBg: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: 'rgba(245, 166, 35, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(245, 166, 35, 0.3)',
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFF',
    textAlign: 'center',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 13,
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  emptyActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5A623',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 24,
  },
  emptyActionText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1A253A',
  },

  listContent: { 
    padding: 16,
    paddingBottom: 20,
  },
  messageWrapper: { 
    marginBottom: 14, 
    maxWidth: '82%',
  },
  wrapperMe: { 
    alignSelf: 'flex-end',
  },
  wrapperOther: { 
    alignSelf: 'flex-start',
  },

  senderHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    marginLeft: 4,
  },
  senderName: { 
    fontSize: 12, 
    fontWeight: '700', 
    color: '#E2E8F0',
    marginRight: 6,
  },
  badgeMotorista: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(56, 189, 248, 0.15)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  badgeMotoristaText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#38BDF8',
    marginLeft: 3,
  },
  badgeAdmin: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  badgeAdminText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#F59E0B',
    marginLeft: 3,
  },
  badgeAluno: {
    backgroundColor: 'rgba(148, 163, 184, 0.15)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  badgeAlunoText: {
    fontSize: 9,
    color: '#94A3B8',
  },

  bubble: { 
    paddingHorizontal: 14, 
    paddingVertical: 10, 
    borderRadius: 18,
  },
  bubbleMe: { 
    backgroundColor: '#F5A623', 
    borderBottomRightRadius: 4,
  },
  bubbleOther: { 
    backgroundColor: '#1E293B', 
    borderWidth: 1, 
    borderColor: '#334155', 
    borderBottomLeftRadius: 4,
  },

  messageText: { 
    fontSize: 14, 
    lineHeight: 20,
  },
  textMe: { 
    color: '#1A253A',
    fontWeight: '500',
  },
  textOther: { 
    color: '#F8FAFC',
  },

  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 4,
  },
  timeText: { 
    fontSize: 10, 
  },
  timeMe: { 
    color: 'rgba(26, 37, 58, 0.75)',
    fontWeight: '500',
  },
  timeOther: { 
    color: '#94A3B8',
  },

  chipsContainer: {
    backgroundColor: '#162032',
    borderTopWidth: 1,
    borderTopColor: '#1E293B',
    paddingVertical: 8,
  },
  chipsScroll: {
    paddingHorizontal: 12,
    gap: 8,
  },
  chipBtn: {
    backgroundColor: '#1E293B',
    borderWidth: 1,
    borderColor: '#334155',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
  },
  chipText: {
    fontSize: 12,
    color: '#E2E8F0',
  },

  inputWrapper: {
    backgroundColor: '#1E293B',
    borderTopWidth: 1,
    borderTopColor: '#334155',
  },
  inputContainer: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingHorizontal: 12, 
    paddingVertical: 10,
    paddingBottom: Platform.OS === 'ios' ? 28 : 12,
  },
  input: { 
    flex: 1, 
    height: 44,
    borderRadius: 22,
    paddingHorizontal: 16,
    fontSize: 14,
    backgroundColor: '#0F172A',
    color: '#FFF',
    borderWidth: 1,
    borderColor: '#334155',
  },
  sendBtn: { 
    width: 44, 
    height: 44, 
    borderRadius: 22, 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginLeft: 8,
  },
  sendBtnActive: { 
    backgroundColor: '#F5A623',
  },
  sendBtnDisabled: { 
    backgroundColor: '#334155',
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#334155',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
    paddingBottom: 12,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFF',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  infoLabel: {
    fontSize: 13,
    color: '#94A3B8',
  },
  infoValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFF',
  },
  paradasTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#F5A623',
    marginBottom: 8,
  },
  paradaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 5,
  },
  paradaBullet: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#F5A623',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  paradaIndex: {
    fontSize: 11,
    fontWeight: '700',
    color: '#1A253A',
  },
  paradaNome: {
    fontSize: 13,
    color: '#E2E8F0',
    flex: 1,
  },
  clearChatBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
    borderRadius: 8,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
  },
  clearChatText: {
    fontSize: 13,
    color: '#EF4444',
    fontWeight: '600',
  },
  modalCloseBtn: {
    marginTop: 16,
    backgroundColor: '#334155',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalCloseText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFF',
  },

  // Selector Modal
  selectorSubtitle: {
    fontSize: 13,
    color: '#94A3B8',
    lineHeight: 18,
    marginBottom: 8,
  },
  rotaSelectItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0F172A',
    padding: 14,
    borderRadius: 10,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#334155',
  },
  rotaSelectItemActive: {
    borderColor: '#F5A623',
    backgroundColor: 'rgba(245, 166, 35, 0.08)',
  },
  rotaSelectNome: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFF',
  },
  rotaSelectSub: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 2,
  },
});
