/**
 * EduTransporter - Assistente IA (Central de Ajuda Inteligente)
 *
 * Substitui o antigo FAQ estático por um chat integrado à API de IA (ia/app.py),
 * com fallback automático na base oficial de conhecimento quando o servidor
 * da IA estiver offline.
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  FlatList,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Feather, Ionicons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import { Alert } from '@/components/Alert';
import { useApp } from './_layout';
import { useToast } from '../contexts/ToastContext';
import {
  checkIaStatus,
  perguntarIa,
  SUGESTOES_PERGUNTAS_IA,
} from '../services/ia';

interface MensagemIa {
  id: string;
  autor: 'usuario' | 'ia';
  texto: string;
  horario: string;
  origem?: 'ia' | 'base-local';
}

type StatusIa = 'verificando' | 'online' | 'offline';

let mensagemSeq = 0;
function proximoIdMensagem(prefixo: string): string {
  mensagemSeq += 1;
  return `${prefixo}-${mensagemSeq}`;
}

function formatarHorarioAtual(): string {
  const agora = new Date();
  const h = String(agora.getHours()).padStart(2, '0');
  const m = String(agora.getMinutes()).padStart(2, '0');
  return `${h}:${m}`;
}

function criarMensagemBoasVindas(nomeUsuario?: string): MensagemIa {
  const primeiroNome = nomeUsuario?.trim().split(/\s+/)[0];
  return {
    id: 'boas-vindas',
    autor: 'ia',
    texto: `Olá${primeiroNome ? `, ${primeiroNome}` : ''}! Sou o Assistente IA do EduTransporter. Tire suas dúvidas sobre rotas, horários, mapa do ônibus, presença, chat ou sua conta.`,
    horario: formatarHorarioAtual(),
  };
}

export default function AjudaAssistenteIa() {
  const router = useRouter();
  const { theme, isDark, userData } = useApp();
  const { addToast } = useToast();

  const [messages, setMessages] = useState<MensagemIa[]>(() => [
    criarMensagemBoasVindas(userData?.nome),
  ]);
  const [inputText, setInputText] = useState('');
  const [sending, setSending] = useState(false);
  const [statusIa, setStatusIa] = useState<StatusIa>('verificando');
  const [modeloIa, setModeloIa] = useState<string | undefined>(undefined);

  const flatListRef = useRef<FlatList<MensagemIa>>(null);

  const verificarConexaoIa = useCallback(
    async (mostrarFeedback = false) => {
      setStatusIa('verificando');
      const status = await checkIaStatus();
      if (status.online) {
        setStatusIa('online');
        setModeloIa(status.modelo);
        if (mostrarFeedback) {
          addToast(
            'success',
            `IA conectada${status.modelo ? ` (${status.modelo})` : ''}.`
          );
        }
      } else {
        setStatusIa('offline');
        setModeloIa(undefined);
        if (mostrarFeedback) {
          addToast(
            'info',
            'Servidor da IA offline. Respostas usando a base oficial do app.'
          );
        }
      }
    },
    [addToast]
  );

  useEffect(() => {
    let ativo = true;
    checkIaStatus().then((status) => {
      if (!ativo) return;
      if (status.online) {
        setStatusIa('online');
        setModeloIa(status.modelo);
      } else {
        setStatusIa('offline');
        setModeloIa(undefined);
      }
    });
    return () => {
      ativo = false;
    };
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 80);
    return () => clearTimeout(timer);
  }, [messages.length, sending]);

  const enviarPergunta = async (textoCustom?: string) => {
    const pergunta = (textoCustom ?? inputText).trim();
    if (!pergunta || sending) return;

    if (!textoCustom) {
      setInputText('');
    }

    const msgUsuario: MensagemIa = {
      id: proximoIdMensagem('user'),
      autor: 'usuario',
      texto: pergunta,
      horario: formatarHorarioAtual(),
    };

    setMessages((prev) => [...prev, msgUsuario]);
    setSending(true);

    try {
      const resposta = await perguntarIa(pergunta);
      setStatusIa(resposta.origem === 'ia' ? 'online' : 'offline');

      const msgIa: MensagemIa = {
        id: proximoIdMensagem('ia'),
        autor: 'ia',
        texto: resposta.resposta,
        horario: formatarHorarioAtual(),
        origem: resposta.origem,
      };
      setMessages((prev) => [...prev, msgIa]);
    } catch {
      const msgErro: MensagemIa = {
        id: proximoIdMensagem('ia-err'),
        autor: 'ia',
        texto:
          'Não foi possível processar sua pergunta agora. Tente novamente ou fale com o suporte em suporte@edutransporter.com.',
        horario: formatarHorarioAtual(),
        origem: 'base-local',
      };
      setMessages((prev) => [...prev, msgErro]);
    } finally {
      setSending(false);
    }
  };

  const limparConversa = () => {
    setMessages([criarMensagemBoasVindas(userData?.nome)]);
  };

  const abrirSuporteEmail = async () => {
    const url = 'mailto:suporte@edutransporter.com?subject=Suporte%20EduTransporter';
    try {
      const canOpen = await Linking.canOpenURL(url);
      if (canOpen) {
        await Linking.openURL(url);
      } else {
        Alert.alert(
          'Suporte EduTransporter',
          'Envie um e-mail para: suporte@edutransporter.com ou procure a coordenação de transportes.',
          [{ text: 'OK' }]
        );
      }
    } catch {
      Alert.alert(
        'Suporte EduTransporter',
        'E-mail da central de suporte: suporte@edutransporter.com',
        [{ text: 'OK' }]
      );
    }
  };

  const statusConfig = {
    online: {
      dot: '#48BB78',
      label: modeloIa ? `IA Online • ${modeloIa}` : 'IA Online',
    },
    offline: {
      dot: '#F59E0B',
      label: 'Modo Offline • Base Oficial do App',
    },
    verificando: {
      dot: theme.subtext,
      label: 'Conectando ao Assistente IA...',
    },
  }[statusIa];

  const renderMensagem = ({ item }: { item: MensagemIa }) => {
    const isUsuario = item.autor === 'usuario';

    return (
      <View
        style={[
          styles.messageWrapper,
          isUsuario ? styles.wrapperUser : styles.wrapperIa,
        ]}
      >
        {!isUsuario && (
          <View style={styles.senderHeader}>
            <View
              style={[
                styles.iaMiniBadge,
                { backgroundColor: `${theme.gold}22` },
              ]}
            >
              <Ionicons name="sparkles" size={11} color={theme.gold} />
              <Text style={[styles.iaMiniBadgeText, { color: theme.gold }]}>
                Assistente IA
              </Text>
            </View>
            {item.origem === 'base-local' && (
              <Text style={[styles.origemTag, { color: theme.subtext }]}>
                Base oficial
              </Text>
            )}
          </View>
        )}

        <View
          style={[
            styles.bubble,
            isUsuario
              ? [styles.bubbleUser, { backgroundColor: theme.gold }]
              : [
                  styles.bubbleIa,
                  {
                    backgroundColor: theme.card,
                    borderColor: theme.border,
                  },
                ],
          ]}
        >
          <Text
            style={[
              styles.messageText,
              {
                color: isUsuario
                  ? theme.onAccent || '#1A253A'
                  : theme.text,
                fontWeight: isUsuario ? '500' : '400',
              },
            ]}
          >
            {item.texto}
          </Text>

          <Text
            style={[
              styles.timeText,
              {
                color: isUsuario
                  ? isDark
                    ? 'rgba(26, 37, 58, 0.72)'
                    : 'rgba(255, 255, 255, 0.85)'
                  : theme.subtext,
              },
            ]}
          >
            {item.horario}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView
        style={[styles.safeArea, { backgroundColor: theme.bg }]}
        edges={['top', 'bottom']}
      >
        <StatusBar style={isDark ? 'light' : 'dark'} />

        {/* Cabeçalho */}
        <View
          style={[
            styles.header,
            {
              backgroundColor: theme.header || theme.card,
              borderBottomColor: theme.border,
            },
          ]}
        >
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backBtn}
            accessibilityLabel="Voltar"
          >
            <Feather name="arrow-left" size={22} color={theme.textMain} />
          </TouchableOpacity>

          <View style={styles.headerCenter}>
            <View style={styles.headerTitleRow}>
              <Ionicons
                name="sparkles"
                size={18}
                color={theme.gold}
                style={{ marginRight: 6 }}
              />
              <Text style={[styles.headerTitle, { color: theme.textMain }]}>
                Assistente IA
              </Text>
            </View>
            <Text style={[styles.headerSubtitle, { color: theme.subtext }]}>
              Dúvidas sobre o EduTransporter
            </Text>
          </View>

          <View style={styles.headerActions}>
            {messages.length > 1 && (
              <TouchableOpacity
                onPress={limparConversa}
                style={[
                  styles.headerIconBtn,
                  { backgroundColor: theme.inset, borderColor: theme.border },
                ]}
                accessibilityLabel="Reiniciar conversa"
              >
                <Feather name="refresh-cw" size={16} color={theme.textMain} />
              </TouchableOpacity>
            )}
            <TouchableOpacity
              onPress={abrirSuporteEmail}
              style={[
                styles.headerIconBtn,
                {
                  backgroundColor: `${theme.gold}18`,
                  borderColor: `${theme.gold}44`,
                },
              ]}
              accessibilityLabel="Falar com o suporte por e-mail"
            >
              <Feather name="mail" size={16} color={theme.gold} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Barra de status da IA */}
        <TouchableOpacity
          activeOpacity={0.75}
          onPress={() => verificarConexaoIa(true)}
          style={[
            styles.statusBar,
            {
              backgroundColor: theme.inset,
              borderBottomColor: theme.border,
            },
          ]}
        >
          <View
            style={[styles.statusDot, { backgroundColor: statusConfig.dot }]}
          />
          <Text style={[styles.statusText, { color: theme.subtext }]}>
            {statusConfig.label}
          </Text>
          <Feather name="refresh-cw" size={12} color={theme.subtext} />
        </TouchableOpacity>

        {/* Área do chat + barra de envio */}
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.keyboardView}
        >
          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={(item) => item.id}
            renderItem={renderMensagem}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            ListFooterComponent={
              sending ? (
                <View style={[styles.messageWrapper, styles.wrapperIa]}>
                  <View
                    style={[
                      styles.typingBubble,
                      {
                        backgroundColor: theme.card,
                        borderColor: theme.border,
                      },
                    ]}
                  >
                    <ActivityIndicator size="small" color={theme.gold} />
                    <Text
                      style={[styles.typingText, { color: theme.subtext }]}
                    >
                      Pensando na resposta...
                    </Text>
                  </View>
                </View>
              ) : undefined
            }
          />

          {/* Sugestões rápidas */}
          <View
            style={[
              styles.chipsContainer,
              {
                backgroundColor: theme.inset,
                borderTopColor: theme.border,
              },
            ]}
          >
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.chipsScroll}
            >
              {SUGESTOES_PERGUNTAS_IA.map((sugestao) => (
                <TouchableOpacity
                  key={sugestao}
                  style={[
                    styles.chipBtn,
                    {
                      backgroundColor: theme.card,
                      borderColor: theme.border,
                    },
                  ]}
                  onPress={() => enviarPergunta(sugestao)}
                  disabled={sending}
                  activeOpacity={0.75}
                >
                  <Text style={[styles.chipText, { color: theme.text }]}>
                    {sugestao}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Barra de entrada de texto */}
          <View
            style={[
              styles.inputWrapper,
              {
                backgroundColor: theme.header || theme.card,
                borderTopColor: theme.border,
              },
            ]}
          >
            <View style={styles.inputRow}>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: theme.inputBg,
                    color: theme.text,
                    borderColor: theme.border,
                  },
                ]}
                placeholder="Pergunte algo sobre o app..."
                placeholderTextColor={theme.subtext}
                value={inputText}
                onChangeText={setInputText}
                returnKeyType="send"
                onSubmitEditing={() => enviarPergunta()}
                editable={!sending}
              />
              <TouchableOpacity
                style={[
                  styles.sendBtn,
                  {
                    backgroundColor:
                      inputText.trim() && !sending
                        ? theme.gold
                        : theme.border,
                  },
                ]}
                onPress={() => enviarPergunta()}
                disabled={!inputText.trim() || sending}
                accessibilityLabel="Enviar pergunta"
              >
                {sending ? (
                  <ActivityIndicator
                    size="small"
                    color={theme.onAccent || '#1A253A'}
                  />
                ) : (
                  <Ionicons
                    name="send"
                    size={18}
                    color={
                      inputText.trim()
                        ? theme.onAccent || '#1A253A'
                        : theme.subtext
                    }
                  />
                )}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  keyboardView: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    elevation: 2,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerCenter: {
    flex: 1,
    marginLeft: 8,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    fontSize: 12,
    marginTop: 1,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerIconBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  statusBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderBottomWidth: 1,
    gap: 8,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
    flex: 1,
  },

  listContent: {
    padding: 16,
    paddingBottom: 20,
  },
  messageWrapper: {
    marginBottom: 14,
    maxWidth: '85%',
  },
  wrapperUser: {
    alignSelf: 'flex-end',
  },
  wrapperIa: {
    alignSelf: 'flex-start',
  },

  senderHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    gap: 8,
  },
  iaMiniBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    gap: 4,
  },
  iaMiniBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  origemTag: {
    fontSize: 10,
    fontWeight: '500',
  },

  bubble: {
    paddingHorizontal: 14,
    paddingVertical: 11,
    borderRadius: 18,
  },
  bubbleUser: {
    borderBottomRightRadius: 4,
  },
  bubbleIa: {
    borderWidth: 1,
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 14,
    lineHeight: 20,
  },
  timeText: {
    fontSize: 10,
    marginTop: 5,
    alignSelf: 'flex-end',
  },

  typingBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 18,
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    gap: 10,
  },
  typingText: {
    fontSize: 13,
  },

  chipsContainer: {
    borderTopWidth: 1,
    paddingVertical: 8,
  },
  chipsScroll: {
    paddingHorizontal: 14,
    gap: 8,
  },
  chipBtn: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 16,
    borderWidth: 1,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '500',
  },

  inputWrapper: {
    borderTopWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    height: 44,
    borderRadius: 22,
    paddingHorizontal: 16,
    fontSize: 14,
    borderWidth: 1,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
});
