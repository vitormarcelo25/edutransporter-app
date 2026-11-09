/**
 * EduTransporter - Painel do Administrador
 * Gerenciar Feriados e Eventos Sem Transporte
 * Suporte a criação de novos feriados, eventos especiais e exclusão
 */

import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TouchableOpacity, 
  ScrollView, 
  Platform, 
  ActivityIndicator, 
  Modal,
  TextInput,
  KeyboardAvoidingView
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useApp } from '../_layout';
import { getFeriados, createFeriado, deleteFeriado, FeriadosResponse, Feriado } from '../../services/api';
import { Alert } from '@/components/Alert';

/** Máscara de data enquanto digita: DD/MM/AAAA (8 dígitos). */
const formatarDataDigitada = (valor: string): string => {
  const d = valor.replace(/\D/g, '').slice(0, 8);
  if (d.length <= 2) return d;
  if (d.length <= 4) return `${d.slice(0, 2)}/${d.slice(2)}`;
  return `${d.slice(0, 2)}/${d.slice(2, 4)}/${d.slice(4)}`;
};

/** Confere se DD/MM/AAAA é uma data que existe no calendário. */
const dataValida = (valor: string): boolean => {
  const m = valor.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!m) return false;
  const dia = Number(m[1]);
  const mes = Number(m[2]);
  const ano = Number(m[3]);
  const dt = new Date(ano, mes - 1, dia);
  return ano >= 2000 && dt.getFullYear() === ano && dt.getMonth() === mes - 1 && dt.getDate() === dia;
};

export default function GerenciarFeriados() {
  const router = useRouter();
  const { theme, userRole } = useApp();
  const [loading, setLoading] = useState(true);
  const [feriados, setFeriados] = useState<Feriado[]>([]);

  // Modal Novo Feriado / Evento
  const [modalVisible, setModalVisible] = useState(false);
  const [nome, setNome] = useState('');
  const [dataFeriado, setDataFeriado] = useState('');
  const [motivo, setMotivo] = useState('');
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    loadFeriados();
  }, []);

  const loadFeriados = async () => {
    setLoading(true);
    const result: FeriadosResponse = await getFeriados();
    setLoading(false);
    if (result.success && result.feriados) {
      setFeriados(result.feriados);
    }
  };

  const handleSalvarFeriado = async () => {
    if (!nome.trim()) {
      Alert.alert('Campo Obrigatório', 'Informe o nome do evento ou feriado.');
      return;
    }
    if (!dataFeriado.trim()) {
      Alert.alert('Campo Obrigatório', 'Informe a data (ex: 21/04/2026).');
      return;
    }
    if (!dataValida(dataFeriado.trim())) {
      Alert.alert('Data inválida', 'Digite a data completa no formato DD/MM/AAAA (ex: 21/04/2026).');
      return;
    }

    setSalvando(true);
    const res = await createFeriado({
      nome: nome.trim(),
      data: dataFeriado.trim(),
      motivo: motivo.trim() || 'Feriado / Suspensão de transporte',
    });
    setSalvando(false);

    if (res.success && res.feriado) {
      await loadFeriados();
      setModalVisible(false);
      setNome('');
      setDataFeriado('');
      setMotivo('');
      Alert.alert('Sucesso', 'Feriado/Evento cadastrado na agenda oficial!');
    } else {
      Alert.alert('Erro', res.message || 'Não foi possível cadastrar o feriado.');
    }
  };

  const handleDelete = (feriadoId: string, nomeFeriado: string) => {
    Alert.alert(
      'Confirmar Exclusão',
      `Deseja remover "${nomeFeriado}" do calendário de transporte?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Excluir', 
          style: 'destructive',
          onPress: async () => {
            const res = await deleteFeriado(feriadoId);
            if (res.success) {
              setFeriados((atual) => atual.filter((f) => f.id !== feriadoId));
            } else {
              Alert.alert('Erro', res.message || 'Não foi possível excluir o feriado.');
            }
          }
        },
      ]
    );
  };

  if (userRole !== 'admin') {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Feather name="arrow-left" size={24} color={theme.text} />
          </TouchableOpacity>
          <Text style={[styles.title, { color: theme.text }]}>Feriados e Eventos</Text>
          <View style={{ width: 36 }} />
        </View>
        <View style={styles.centerContent}>
          <Feather name="lock" size={64} color="#F5A623" />
          <Text style={[styles.accessDeniedText, { color: theme.text }]}>
            Acesso restrito a administradores
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="arrow-left" size={24} color="#FFF" />
        </TouchableOpacity>
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={[styles.title, { color: '#FFF' }]}>Feriados e Eventos</Text>
          <Text style={styles.subtitle}>Datas com suspensão ou horário especial</Text>
        </View>
        <TouchableOpacity 
          style={styles.addBtn}
          onPress={() => setModalVisible(true)}
        >
          <Feather name="plus" size={20} color="#1A253A" />
        </TouchableOpacity>
      </View>

      <View style={[styles.infoBox, { backgroundColor: '#1E293B', borderColor: '#334155' }]}>
        <Feather name="info" size={18} color="#F5A623" style={{ marginRight: 10 }} />
        <Text style={styles.infoText}>
          Os dias cadastrados aqui alertam automaticamente os alunos e motoristas na Agenda.
        </Text>
      </View>

      {loading ? (
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color="#F5A623" />
          <Text style={[styles.loadingText, { color: theme.subtext }]}>Carregando datas...</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {feriados.length === 0 ? (
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIconBg}>
                <Feather name="calendar" size={40} color="#F5A623" />
              </View>
              <Text style={[styles.emptyText, { color: '#FFF' }]}>Nenhum feriado cadastrado</Text>
              <Text style={styles.emptySubtext}>
                Clique no botão "+" acima para cadastrar dias em que não haverá transporte.
              </Text>
            </View>
          ) : (
            feriados.map((feriado) => (
              <View 
                key={feriado.id} 
                style={[styles.feriadoCard, { backgroundColor: theme.card, borderColor: theme.border }]}
              >
                <View style={styles.feriadoIcon}>
                  <MaterialCommunityIcons name="calendar-remove" size={24} color="#F5A623" />
                </View>
                <View style={styles.feriadoDetails}>
                  <Text style={[styles.feriadoNome, { color: theme.text }]}>{feriado.nome}</Text>
                  <Text style={[styles.feriadoData, { color: '#F5A623' }]}>📅 {feriado.data}</Text>
                  <Text style={[styles.feriadoMotivo, { color: theme.subtext }]}>{feriado.motivo}</Text>
                </View>
                <TouchableOpacity 
                  onPress={() => handleDelete(feriado.id, feriado.nome)}
                  style={styles.deleteBtn}
                >
                  <Feather name="trash-2" size={18} color="#EF4444" />
                </TouchableOpacity>
              </View>
            ))
          )}
          <View style={{ height: 40 }} />
        </ScrollView>
      )}

      {/* MODAL NOVO FERIADO / EVENTO */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.modalOverlay}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <MaterialCommunityIcons name="calendar-plus" size={24} color="#F5A623" style={{ marginRight: 8 }} />
                <Text style={styles.modalTitle}>Cadastrar Feriado / Evento</Text>
              </View>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Feather name="x" size={22} color="#FFF" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.inputLabel}>Nome do Feriado / Evento:</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Ex: Feriado Municipal de São João"
                placeholderTextColor="#64748B"
                value={nome}
                onChangeText={setNome}
              />

              <Text style={styles.inputLabel}>Data do Evento (DD/MM/AAAA):</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Ex: 24/06/2026"
                placeholderTextColor="#64748B"
                value={dataFeriado}
                onChangeText={(v) => setDataFeriado(formatarDataDigitada(v))}
                keyboardType="number-pad"
                maxLength={10}
              />

              <Text style={styles.inputLabel}>Impacto no Transporte:</Text>
              <TextInput
                style={[styles.textInput, { height: 80, textAlignVertical: 'top', paddingTop: 10 }]}
                placeholder="Ex: Não haverá transporte universitário neste dia."
                placeholderTextColor="#64748B"
                value={motivo}
                onChangeText={setMotivo}
                multiline
              />

              <TouchableOpacity 
                style={[styles.salvarBtn, salvando && { opacity: 0.6 }]}
                onPress={handleSalvarFeriado}
                disabled={salvando}
              >
                {salvando ? (
                  <ActivityIndicator size="small" color="#1A253A" />
                ) : (
                  <>
                    <Feather name="check" size={18} color="#1A253A" style={{ marginRight: 8 }} />
                    <Text style={styles.salvarBtnText}>Confirmar e Salvar no Calendário</Text>
                  </>
                )}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F172A' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 10 : 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
    backgroundColor: '#1E293B',
  },
  backBtn: { 
    padding: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  addBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F5A623',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: { fontSize: 17, fontWeight: '700' },
  subtitle: { fontSize: 12, color: '#94A3B8', marginTop: 2 },
  centerContent: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  loadingText: { fontSize: 14, marginTop: 10 },
  accessDeniedText: { fontSize: 16, marginTop: 10, textAlign: 'center' },
  scrollContent: { padding: 16 },

  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginTop: 14,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
  },
  infoText: { fontSize: 12, color: '#94A3B8', flex: 1, lineHeight: 18 },

  emptyContainer: { alignItems: 'center', paddingVertical: 60, paddingHorizontal: 30 },
  emptyIconBg: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(245, 166, 35, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyText: { fontSize: 16, fontWeight: '700' },
  emptySubtext: { fontSize: 13, color: '#94A3B8', textAlign: 'center', marginTop: 6, lineHeight: 18 },

  feriadoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    marginBottom: 12,
  },
  feriadoIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(245, 166, 35, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  feriadoDetails: { flex: 1 },
  feriadoNome: { fontSize: 15, fontWeight: '700', marginBottom: 2 },
  feriadoData: { fontSize: 12, fontWeight: '600', marginBottom: 4 },
  feriadoMotivo: { fontSize: 12, lineHeight: 16 },
  deleteBtn: { padding: 8 },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    maxWidth: 440,
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
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
    paddingBottom: 14,
    marginBottom: 16,
  },
  modalTitle: { fontSize: 16, fontWeight: '700', color: '#FFF' },
  inputLabel: { fontSize: 13, fontWeight: '600', color: '#E2E8F0', marginTop: 12, marginBottom: 6 },
  textInput: {
    backgroundColor: '#0F172A',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    color: '#FFF',
  },
  salvarBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F5A623',
    paddingVertical: 14,
    borderRadius: 10,
    marginTop: 20,
    marginBottom: 6,
  },
  salvarBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1A253A',
  },
});
