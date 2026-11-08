/**
 * EduTransporter - Painel do Administrador
 * Gerenciar Avisos Oficiais da Frota
 * Suporte a criação de novos avisos, categorização e exclusão
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
import { Alert } from '@/components/Alert';
import { useApp } from '../_layout';
import { getAvisos, createAviso, deleteAviso, AvisosResponse, Aviso } from '../../services/api';

export default function GerenciarAvisos() {
  const router = useRouter();
  const { theme, userRole } = useApp();
  const [loading, setLoading] = useState(true);
  const [avisos, setAvisos] = useState<Aviso[]>([]);
  
  // Modal de Criação
  const [modalVisible, setModalVisible] = useState(false);
  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [tipo, setTipo] = useState<'urgente' | 'info' | 'sucesso'>('info');
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    loadAvisos();
  }, []);

  const loadAvisos = async () => {
    setLoading(true);
    const result: AvisosResponse = await getAvisos();
    setLoading(false);
    if (result.success && result.avisos) {
      setAvisos(result.avisos);
    }
  };

  const handleSalvarAviso = async () => {
    if (!titulo.trim()) {
      Alert.alert('Campo Obrigatório', 'Informe o título do aviso.');
      return;
    }
    if (!descricao.trim()) {
      Alert.alert('Campo Obrigatório', 'Informe a mensagem do aviso.');
      return;
    }

    setSalvando(true);
    const res = await createAviso({
      titulo: titulo.trim(),
      descricao: descricao.trim(),
      tipo,
    });
    setSalvando(false);

    if (res.success && res.aviso) {
      setAvisos([res.aviso, ...avisos]);
      setModalVisible(false);
      setTitulo('');
      setDescricao('');
      setTipo('info');
      Alert.alert('Sucesso', 'Aviso oficial publicado com sucesso!');
    } else {
      Alert.alert('Erro', res.message || 'Não foi possível salvar o aviso.');
    }
  };

  const handleExcluirAviso = (avisoId: string, tituloAviso: string) => {
    Alert.alert(
      'Excluir Aviso',
      `Deseja realmente apagar o aviso "${tituloAviso}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            const res = await deleteAviso(avisoId);
            if (res.success) {
              setAvisos(avisos.filter((a) => a.id !== avisoId));
            } else {
              Alert.alert('Erro', res.message);
            }
          },
        },
      ]
    );
  };

  const getTipoColor = (t: string) => {
    switch (t) {
      case 'urgente': return '#EF4444';
      case 'sucesso': return '#10B981';
      default: return '#F5A623';
    }
  };

  const getTipoLabel = (t: string) => {
    switch (t) {
      case 'urgente': return 'URGENTE';
      case 'sucesso': return 'INFORMATIVO';
      default: return 'IMPORTANTE';
    }
  };

  if (userRole !== 'admin') {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Feather name="arrow-left" size={24} color={theme.text} />
          </TouchableOpacity>
          <Text style={[styles.title, { color: theme.text }]}>Gerenciar Avisos</Text>
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
          <Text style={[styles.title, { color: '#FFF' }]}>Avisos da Prefeitura</Text>
          <Text style={styles.subtitle}>Comunique imprevistos, alterações e notícias</Text>
        </View>
        <TouchableOpacity 
          style={styles.addBtn}
          onPress={() => setModalVisible(true)}
        >
          <Feather name="plus" size={20} color="#1A253A" />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color="#F5A623" />
          <Text style={[styles.loadingText, { color: theme.subtext }]}>Carregando avisos...</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {avisos.length === 0 ? (
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIconBg}>
                <Feather name="bell" size={40} color="#F5A623" />
              </View>
              <Text style={[styles.emptyText, { color: '#FFF' }]}>Nenhum aviso ativo</Text>
              <Text style={styles.emptySubtext}>
                Clique no botão "+" acima para publicar um comunicado para os passageiros.
              </Text>
            </View>
          ) : (
            avisos.map((aviso) => {
              const cor = getTipoColor(aviso.tipo);
              return (
                <View 
                  key={aviso.id} 
                  style={[styles.avisoCard, { backgroundColor: theme.card, borderColor: theme.border }]}
                >
                  <View style={styles.avisoHeader}>
                    <View style={[styles.tipoBadge, { backgroundColor: `${cor}25`, borderColor: cor }]}>
                      <Text style={[styles.tipoBadgeText, { color: cor }]}>{getTipoLabel(aviso.tipo)}</Text>
                    </View>
                    <Text style={[styles.avisoData, { color: theme.subtext }]}>{aviso.data}</Text>
                    <TouchableOpacity 
                      onPress={() => handleExcluirAviso(aviso.id, aviso.titulo)}
                      style={styles.deleteBtn}
                    >
                      <Feather name="trash-2" size={18} color="#EF4444" />
                    </TouchableOpacity>
                  </View>

                  <Text style={[styles.avisoTitulo, { color: theme.text }]}>{aviso.titulo}</Text>
                  <Text style={[styles.avisoDesc, { color: theme.subtext }]}>{aviso.descricao}</Text>
                </View>
              );
            })
          )}
          <View style={{ height: 40 }} />
        </ScrollView>
      )}

      {/* MODAL CRIAR AVISO */}
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
                <MaterialCommunityIcons name="bullhorn" size={24} color="#F5A623" style={{ marginRight: 8 }} />
                <Text style={styles.modalTitle}>Novo Comunicado Oficial</Text>
              </View>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Feather name="x" size={22} color="#FFF" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.inputLabel}>Nível de Importância:</Text>
              <View style={styles.tipoSelector}>
                <TouchableOpacity 
                  style={[styles.tipoOption, tipo === 'info' && styles.tipoOptionActiveInfo]}
                  onPress={() => setTipo('info')}
                >
                  <Text style={[styles.tipoOptionText, tipo === 'info' && { color: '#F5A623', fontWeight: '700' }]}>
                    Informativo
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={[styles.tipoOption, tipo === 'urgente' && styles.tipoOptionActiveUrgente]}
                  onPress={() => setTipo('urgente')}
                >
                  <Text style={[styles.tipoOptionText, tipo === 'urgente' && { color: '#EF4444', fontWeight: '700' }]}>
                    🚨 Urgente
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={[styles.tipoOption, tipo === 'sucesso' && styles.tipoOptionActiveSucesso]}
                  onPress={() => setTipo('sucesso')}
                >
                  <Text style={[styles.tipoOptionText, tipo === 'sucesso' && { color: '#10B981', fontWeight: '700' }]}>
                    ✅ Positivo
                  </Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.inputLabel}>Título do Comunicado:</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Ex: Mudança de horário ou recapeamento de rua"
                placeholderTextColor="#64748B"
                value={titulo}
                onChangeText={setTitulo}
              />

              <Text style={styles.inputLabel}>Mensagem Completa:</Text>
              <TextInput
                style={[styles.textInput, { height: 100, textAlignVertical: 'top', paddingTop: 12 }]}
                placeholder="Escreva os detalhes que os alunos e motoristas precisam saber..."
                placeholderTextColor="#64748B"
                value={descricao}
                onChangeText={setDescricao}
                multiline
              />

              <TouchableOpacity 
                style={[styles.salvarBtn, salvando && { opacity: 0.6 }]}
                onPress={handleSalvarAviso}
                disabled={salvando}
              >
                {salvando ? (
                  <ActivityIndicator size="small" color="#1A253A" />
                ) : (
                  <>
                    <Feather name="send" size={18} color="#1A253A" style={{ marginRight: 8 }} />
                    <Text style={styles.salvarBtnText}>Publicar Comunicado Agora</Text>
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

  avisoCard: {
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    marginBottom: 14,
  },
  avisoHeader: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  tipoBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
  },
  tipoBadgeText: { fontSize: 10, fontWeight: '800' },
  avisoData: { fontSize: 12, flex: 1, marginLeft: 10 },
  deleteBtn: { padding: 4 },
  avisoTitulo: { fontSize: 15, fontWeight: '700', marginBottom: 6 },
  avisoDesc: { fontSize: 13, lineHeight: 20 },

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
  tipoSelector: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 6,
  },
  tipoOption: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#0F172A',
    borderWidth: 1,
    borderColor: '#334155',
    alignItems: 'center',
  },
  tipoOptionActiveInfo: {
    borderColor: '#F5A623',
    backgroundColor: 'rgba(245, 166, 35, 0.1)',
  },
  tipoOptionActiveUrgente: {
    borderColor: '#EF4444',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
  },
  tipoOptionActiveSucesso: {
    borderColor: '#10B981',
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
  },
  tipoOptionText: {
    fontSize: 12,
    color: '#94A3B8',
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
