/**
 * EduTransporter - Gerenciar Veículos da Frota
 * Cadastro, edição, capacidade de passageiros e remoção de ônibus/vans (Admin)
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
  KeyboardAvoidingView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather, FontAwesome5 } from '@expo/vector-icons';
import { useRouter, Stack } from 'expo-router';
import { useApp } from '../_layout';
import {
  getVeiculos,
  createVeiculo,
  updateVeiculo,
  deleteVeiculo,
  Veiculo,
} from '../../services/api';
import { formatarPlaca, validarPlaca } from '../../services/cpf';
import { Alert } from '@/components/Alert';

const TIPOS_VEICULO = [
  { key: 'Ônibus', label: 'Ônibus', capacidadeSugerida: '40' },
  { key: 'Micro-ônibus', label: 'Micro-ônibus', capacidadeSugerida: '28' },
  { key: 'Van', label: 'Van', capacidadeSugerida: '15' },
];

export default function GerenciarVeiculos() {
  const router = useRouter();
  const { theme, userRole } = useApp();

  const [loading, setLoading] = useState(true);
  const [veiculos, setVeiculos] = useState<Veiculo[]>([]);
  const [modalVisivel, setModalVisivel] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [placaEditando, setPlacaEditando] = useState<string | null>(null);

  const [placa, setPlaca] = useState('');
  const [modelo, setModelo] = useState('');
  const [capacidade, setCapacidade] = useState('40');
  const [tipo, setTipo] = useState<string>('Ônibus');
  const [capacidadeEditadaManual, setCapacidadeEditadaManual] = useState(false);
  const [erros, setErros] = useState<Record<string, string>>({});

  useEffect(() => {
    carregarVeiculos();
  }, []);

  const carregarVeiculos = async () => {
    setLoading(true);
    const res = await getVeiculos();
    setLoading(false);
    if (res.success) {
      setVeiculos(res.veiculos);
    } else {
      Alert.alert('Erro', res.message || 'Não foi possível carregar os veículos.');
    }
  };

  const limparErro = (campo: string) => {
    if (erros[campo]) {
      setErros((prev) => {
        const next = { ...prev };
        delete next[campo];
        return next;
      });
    }
  };

  const abrirModalCriar = () => {
    setPlacaEditando(null);
    setPlaca('');
    setModelo('');
    setTipo('Ônibus');
    setCapacidade('40');
    setCapacidadeEditadaManual(false);
    setErros({});
    setModalVisivel(true);
  };

  const abrirModalEditar = (veiculo: Veiculo) => {
    setPlacaEditando(veiculo.placa);
    setPlaca(veiculo.placa);
    setModelo(veiculo.modelo.replace(/\s*-\s*\d+\s*lugares?/i, '').trim() || veiculo.modelo);
    setTipo(veiculo.tipo || 'Ônibus');
    setCapacidade(String(veiculo.capacidade || 40));
    setCapacidadeEditadaManual(true);
    setErros({});
    setModalVisivel(true);
  };

  const selecionarTipo = (opt: (typeof TIPOS_VEICULO)[number]) => {
    setTipo(opt.key);
    if (!placaEditando && !capacidadeEditadaManual) {
      setCapacidade(opt.capacidadeSugerida);
    }
  };

  const handleSalvar = async () => {
    const novosErros: Record<string, string> = {};
    const placaAlvo = placaEditando || placa;

    if (!placaEditando && !validarPlaca(placaAlvo)) {
      novosErros.placa = 'Placa inválida. Use ABC-1234 ou Mercosul ABC1D23.';
    }
    if (modelo.trim().length < 2) {
      novosErros.modelo = 'Informe o modelo ou identificação do veículo.';
    }
    const capNum = Number(capacidade);
    if (!Number.isFinite(capNum) || capNum < 1 || capNum > 120) {
      novosErros.capacidade = 'Capacidade deve ser entre 1 e 120 lugares.';
    }

    setErros(novosErros);
    const primeiroErro = Object.values(novosErros)[0];
    if (primeiroErro) {
      Alert.alert('Verifique os dados', primeiroErro);
      return;
    }

    setSalvando(true);
    const res = placaEditando
      ? await updateVeiculo(placaEditando, {
          modelo: modelo.trim(),
          capacidade: capNum,
          tipo,
        })
      : await createVeiculo({
          placa: formatarPlaca(placa),
          modelo: modelo.trim(),
          capacidade: capNum,
          tipo,
        });
    setSalvando(false);

    if (res.success) {
      setModalVisivel(false);
      Alert.alert('Sucesso!', res.message);
      carregarVeiculos();
    } else {
      Alert.alert('Erro ao salvar', res.message);
    }
  };

  const handleExcluir = (veiculo: Veiculo) => {
    const avisoVinculo = veiculo.rotaNome
      ? `\n\nEste veículo está vinculado à rota "${veiculo.rotaNome}" e será desvinculado.`
      : '';
    Alert.alert(
      'Remover Veículo',
      `Deseja remover o veículo ${veiculo.placa} (${veiculo.modelo}) da frota?${avisoVinculo}`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Remover',
          style: 'destructive',
          onPress: async () => {
            const res = await deleteVeiculo(veiculo.placa);
            if (res.success) {
              Alert.alert('Atualizado', res.message);
              carregarVeiculos();
            } else {
              Alert.alert('Erro', res.message);
            }
          },
        },
      ]
    );
  };

  if (userRole !== 'admin') {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]}>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Feather name="arrow-left" size={24} color={theme.text} />
          </TouchableOpacity>
          <Text style={[styles.title, { color: theme.text }]}>Gerenciar Veículos</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.centerContent}>
          <Feather name="lock" size={64} color={theme.gold} />
          <Text style={[styles.accessDeniedText, { color: theme.text }]}>
            Acesso restrito a administradores
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={{ padding: 6 }}>
          <Feather name="arrow-left" size={24} color={theme.text} />
        </TouchableOpacity>
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={[styles.title, { color: theme.text }]}>Gerenciar Veículos</Text>
          <Text style={[styles.subtitle, { color: theme.subtext }]}>
            Frota escolar, capacidade de lugares e placas
          </Text>
        </View>
        <TouchableOpacity
          style={[styles.addBtn, { backgroundColor: theme.gold }]}
          onPress={abrirModalCriar}
        >
          <Feather name="plus" size={18} color="#1A253A" />
          <Text style={styles.addBtnText}>Novo</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color={theme.gold} />
          <Text style={[styles.loadingText, { color: theme.subtext }]}>Carregando frota...</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {veiculos.length === 0 ? (
            <View style={[styles.emptyCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
              <FontAwesome5 name="bus-alt" size={46} color={theme.gold} />
              <Text style={[styles.emptyTitle, { color: theme.text }]}>Nenhum veículo cadastrado</Text>
              <Text style={[styles.emptySub, { color: theme.subtext }]}>
                Toque em "+ Novo" para adicionar ônibus, micro-ônibus ou vans com placa e capacidade.
              </Text>
            </View>
          ) : (
            veiculos.map((veic) => (
              <View
                key={veic.placa}
                style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}
              >
                <View style={styles.cardHeader}>
                  <View style={[styles.iconCircle, { backgroundColor: 'rgba(245,166,35,0.14)' }]}>
                    <FontAwesome5
                      name={veic.tipo === 'Van' ? 'shuttle-van' : 'bus'}
                      size={20}
                      color={theme.gold}
                    />
                  </View>
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <View style={styles.placaRow}>
                      <View style={[styles.placaBadge, { backgroundColor: theme.inputBg, borderColor: theme.border }]}>
                        <Text style={[styles.placaText, { color: theme.gold }]}>{veic.placa}</Text>
                      </View>
                      <Text style={[styles.tipoText, { color: theme.subtext }]}>{veic.tipo}</Text>
                    </View>
                    <Text style={[styles.modeloText, { color: theme.text }]} numberOfLines={2}>
                      {veic.modelo}
                    </Text>
                  </View>

                  <TouchableOpacity
                    style={styles.iconActionBtn}
                    onPress={() => abrirModalEditar(veic)}
                    accessibilityLabel="Editar veículo"
                  >
                    <Feather name="edit-2" size={18} color={theme.gold} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.iconActionBtn}
                    onPress={() => handleExcluir(veic)}
                    accessibilityLabel="Excluir veículo"
                  >
                    <Feather name="trash-2" size={18} color="#EF4444" />
                  </TouchableOpacity>
                </View>

                <View style={[styles.divider, { backgroundColor: theme.border }]} />

                <View style={styles.footerRow}>
                  <View style={styles.metaItem}>
                    <Feather name="users" size={14} color={theme.gold} />
                    <Text style={[styles.metaText, { color: theme.text }]}>
                      {veic.capacidade} lugares
                    </Text>
                  </View>
                  <View style={styles.metaItem}>
                    <Feather
                      name={veic.rotaNome ? 'map-pin' : 'check-circle'}
                      size={14}
                      color={veic.rotaNome ? '#48BB78' : theme.subtext}
                    />
                    <Text
                      style={[
                        styles.metaText,
                        { color: veic.rotaNome ? '#48BB78' : theme.subtext },
                      ]}
                      numberOfLines={1}
                    >
                      {veic.rotaNome
                        ? `${veic.rotaNome}${veic.motoristaNome ? ` (${veic.motoristaNome})` : ''}`
                        : 'Disponível para rotas'}
                    </Text>
                  </View>
                </View>
              </View>
            ))
          )}
          <View style={{ height: 40 }} />
        </ScrollView>
      )}

      {/* Modal Criar / Editar Veículo */}
      <Modal
        visible={modalVisivel}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisivel(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.modalOverlay}
        >
          <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}>
            <View style={[styles.modalCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
              <View style={styles.modalHeader}>
                <Text style={[styles.modalTitle, { color: theme.text }]}>
                  {placaEditando ? `Editar Veículo (${placaEditando})` : 'Novo Veículo na Frota'}
                </Text>
                <TouchableOpacity onPress={() => setModalVisivel(false)}>
                  <Feather name="x" size={22} color={theme.subtext} />
                </TouchableOpacity>
              </View>

              <Text style={[styles.inputLabel, { color: theme.subtext }]}>Tipo de Veículo:</Text>
              <View style={styles.tipoRow}>
                {TIPOS_VEICULO.map((opt) => {
                  const ativo = tipo === opt.key;
                  return (
                    <TouchableOpacity
                      key={opt.key}
                      style={[
                        styles.tipoChip,
                        {
                          backgroundColor: ativo ? theme.gold : theme.inputBg,
                          borderColor: ativo ? theme.gold : theme.border,
                        },
                      ]}
                      onPress={() => selecionarTipo(opt)}
                    >
                      <Text
                        style={[
                          styles.tipoChipText,
                          { color: ativo ? '#1A253A' : theme.text },
                        ]}
                      >
                        {opt.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <Text style={[styles.inputLabel, { color: theme.subtext }]}>Placa do Veículo *</Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: theme.inputBg,
                    borderColor: erros.placa ? '#EF4444' : theme.border,
                    color: placaEditando ? theme.subtext : theme.text,
                  },
                ]}
                placeholder="Ex: KJH-4020 ou ABC1D23"
                placeholderTextColor={theme.subtext}
                autoCapitalize="characters"
                maxLength={8}
                editable={!placaEditando}
                value={placa}
                onChangeText={(v) => {
                  setPlaca(formatarPlaca(v));
                  limparErro('placa');
                }}
              />
              {erros.placa ? <Text style={styles.errorText}>{erros.placa}</Text> : null}

              <Text style={[styles.inputLabel, { color: theme.subtext }]}>Modelo / Identificação *</Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: theme.inputBg,
                    borderColor: erros.modelo ? '#EF4444' : theme.border,
                    color: theme.text,
                  },
                ]}
                placeholder="Ex: Marcopolo Senior - Ônibus 01"
                placeholderTextColor={theme.subtext}
                value={modelo}
                onChangeText={(v) => {
                  setModelo(v);
                  limparErro('modelo');
                }}
              />
              {erros.modelo ? <Text style={styles.errorText}>{erros.modelo}</Text> : null}

              <Text style={[styles.inputLabel, { color: theme.subtext }]}>Capacidade de Lugares *</Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: theme.inputBg,
                    borderColor: erros.capacidade ? '#EF4444' : theme.border,
                    color: theme.text,
                  },
                ]}
                placeholder="Ex: 40"
                placeholderTextColor={theme.subtext}
                keyboardType="number-pad"
                maxLength={3}
                value={capacidade}
                onChangeText={(v) => {
                  setCapacidadeEditadaManual(true);
                  setCapacidade(v.replace(/\D/g, ''));
                  limparErro('capacidade');
                }}
              />
              {erros.capacidade ? <Text style={styles.errorText}>{erros.capacidade}</Text> : null}

              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={[styles.btnCancelar, { borderColor: theme.border }]}
                  onPress={() => setModalVisivel(false)}
                >
                  <Text style={{ color: theme.subtext, fontWeight: 'bold' }}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.btnSalvar, { backgroundColor: theme.gold }]}
                  onPress={handleSalvar}
                  disabled={salvando}
                >
                  {salvando ? (
                    <ActivityIndicator size="small" color="#1A253A" />
                  ) : (
                    <Text style={styles.btnSalvarText}>
                      {placaEditando ? 'Salvar Alterações' : 'Cadastrar Veículo'}
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingTop: Platform.OS === 'ios' ? 10 : 22,
    paddingBottom: 14,
  },
  title: { fontSize: 18, fontWeight: 'bold' },
  subtitle: { fontSize: 12, marginTop: 2 },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 5,
  },
  addBtnText: { color: '#1A253A', fontSize: 13, fontWeight: 'bold' },
  centerContent: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  loadingText: { fontSize: 14, marginTop: 10 },
  accessDeniedText: { fontSize: 16, marginTop: 12, textAlign: 'center' },
  scrollContent: { padding: 18 },
  emptyCard: {
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    borderWidth: 1,
    marginTop: 20,
  },
  emptyTitle: { fontSize: 17, fontWeight: 'bold', marginTop: 14 },
  emptySub: { fontSize: 13, textAlign: 'center', marginTop: 6, lineHeight: 19 },
  card: {
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    marginBottom: 12,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center' },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placaRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  placaBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
  },
  placaText: { fontSize: 12, fontWeight: 'bold', letterSpacing: 1 },
  tipoText: { fontSize: 11, fontWeight: '600' },
  modeloText: { fontSize: 14, fontWeight: 'bold' },
  iconActionBtn: { padding: 8 },
  divider: { height: 1, marginVertical: 12 },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 6, flexShrink: 1 },
  metaText: { fontSize: 12, fontWeight: '600' },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    padding: 18,
  },
  modalCard: {
    borderRadius: 22,
    padding: 20,
    borderWidth: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  modalTitle: { fontSize: 17, fontWeight: 'bold' },
  inputLabel: { fontSize: 12, fontWeight: '600', marginBottom: 6, marginTop: 8 },
  tipoRow: { flexDirection: 'row', gap: 8, marginBottom: 4 },
  tipoChip: {
    flex: 1,
    paddingVertical: 9,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
  },
  tipoChipText: { fontSize: 12, fontWeight: 'bold' },
  input: {
    height: 46,
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 12,
    fontSize: 14,
  },
  errorText: {
    color: '#EF4444',
    fontSize: 11,
    fontWeight: '600',
    marginTop: 4,
  },
  modalActions: { flexDirection: 'row', gap: 10, marginTop: 20 },
  btnCancelar: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 13,
    borderRadius: 12,
    borderWidth: 1,
  },
  btnSalvar: {
    flex: 2,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 13,
    borderRadius: 12,
  },
  btnSalvarText: { color: '#1A253A', fontSize: 13, fontWeight: 'bold' },
});
