/**
 * Janela de alerta/confirmação com o visual do EduTransporte.
 * Recebe os pedidos feitos via Alert.alert (components/Alert.ts).
 */
import React, { useEffect, useState } from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, Pressable } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useApp } from '../../contexts/AppContext';
import { registerAlertHost, AlertRequest, AlertButton } from '../Alert';

type Variante = 'sucesso' | 'erro' | 'aviso' | 'info';

const descobrirVariante = (req: AlertRequest): Variante => {
  const t = `${req.title} ${req.message || ''}`.toLowerCase();
  if (req.buttons.some((b) => b.style === 'destructive')) return 'aviso';
  if (/erro|falh|inválid|invalid|não foi possível|negad|recusad/.test(t)) return 'erro';
  if (/sucesso|confirmad|salv|publicad|cadastrad|enviad|aprovad|conclu|pronto/.test(t)) return 'sucesso';
  if (/atenção|aviso|confirmar|tem certeza|deseja|excluir|remover|sair/.test(t)) return 'aviso';
  return 'info';
};

const ESTILO_VARIANTE: Record<Variante, { cor: string; icone: keyof typeof Feather.glyphMap }> = {
  sucesso: { cor: '#48BB78', icone: 'check-circle' },
  erro: { cor: '#EF4444', icone: 'x-circle' },
  aviso: { cor: '#F5A623', icone: 'alert-triangle' },
  info: { cor: '#3182CE', icone: 'info' },
};

export function AppAlertHost() {
  const { theme } = useApp();
  const [fila, setFila] = useState<AlertRequest[]>([]);

  useEffect(() => {
    registerAlertHost((req) => setFila((prev) => [...prev, req]));
    return () => registerAlertHost(null);
  }, []);

  const atual = fila[0];

  const fechar = (botao?: AlertButton) => {
    setFila((prev) => prev.slice(1));
    // Executa a ação depois de fechar, para permitir abrir outro alerta em seguida
    if (botao?.onPress) setTimeout(() => botao.onPress && botao.onPress(), 0);
  };

  if (!atual) return null;

  const variante = descobrirVariante(atual);
  const { cor, icone } = ESTILO_VARIANTE[variante];
  const botaoCancelar = atual.buttons.find((b) => b.style === 'cancel');
  // Botões de ação ficam à direita / embaixo; cancelar primeiro
  const botoes = [...atual.buttons].sort((a, b) => (a.style === 'cancel' ? -1 : b.style === 'cancel' ? 1 : 0));

  return (
    <Modal transparent visible animationType="fade" onRequestClose={() => fechar(botaoCancelar)}>
      <Pressable style={styles.overlay} onPress={() => botaoCancelar && fechar(botaoCancelar)}>
        <Pressable style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <View style={[styles.iconCircle, { backgroundColor: cor + '22' }]}>
            <Feather name={icone} size={30} color={cor} />
          </View>

          <Text style={[styles.title, { color: theme.text }]}>{atual.title}</Text>
          {!!atual.message && (
            <Text style={[styles.message, { color: theme.subtext }]}>{atual.message}</Text>
          )}

          <View style={[styles.actions, botoes.length > 2 && styles.actionsColumn]}>
            {botoes.map((b, i) => {
              const isCancel = b.style === 'cancel';
              const isDestructive = b.style === 'destructive';
              const bg = isCancel ? 'transparent' : isDestructive ? '#EF4444' : variante === 'erro' ? cor : theme.gold;
              const fg = isCancel ? theme.text : isDestructive ? '#FFFFFF' : '#1A253A';
              return (
                <TouchableOpacity
                  key={`${b.text}-${i}`}
                  activeOpacity={0.85}
                  onPress={() => fechar(b)}
                  style={[
                    styles.button,
                    botoes.length > 2 ? styles.buttonFull : styles.buttonFlex,
                    { backgroundColor: bg, borderColor: isCancel ? theme.border : bg },
                  ]}
                >
                  <Text style={[styles.buttonText, { color: variante === 'erro' && !isCancel ? '#FFFFFF' : fg }]}>
                    {b.text || 'OK'}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(8, 12, 24, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  card: {
    width: '100%',
    maxWidth: 380,
    borderRadius: 24,
    borderWidth: 1,
    paddingHorizontal: 22,
    paddingTop: 26,
    paddingBottom: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 12,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  title: { fontSize: 18, fontWeight: 'bold', textAlign: 'center' },
  message: { fontSize: 14, lineHeight: 21, textAlign: 'center', marginTop: 8 },
  actions: { flexDirection: 'row', gap: 10, marginTop: 22, width: '100%' },
  actionsColumn: { flexDirection: 'column' },
  button: {
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  buttonFlex: { flex: 1 },
  buttonFull: { width: '100%' },
  buttonText: { fontSize: 15, fontWeight: 'bold' },
});
