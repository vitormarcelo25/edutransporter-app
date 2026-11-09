/**
 * v10.2.0 - Beta Release
 * EduTransporter
 * 
 * Gerenciar Rotas - CRUD completo de rotas
 * Criação e edição de rotas com marcação interativa no mapa,
 * seleção de cidades de origem, destinos educacionais e geolocalização.
 */

import React, { useState, useEffect, useRef } from 'react';
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
  getAdminRotas,
  createRota,
  deleteRota,
  AdminRotasResponse,
  Rota,
  Parada,
  PARADAS_PADRAO_CARUARU,
} from '../../services/api';
import { Alert } from '@/components/Alert';
import MapViewComponent from '@/components/MapViewComponent';

interface CidadeOrigem {
  nome: string;
  latitude: number;
  longitude: number;
}

const CIDADES_ORIGEM: CidadeOrigem[] = [
  { nome: 'Caruaru', latitude: -8.2833, longitude: -35.9761 },
  { nome: 'Toritama', latitude: -8.0069, longitude: -36.0569 },
  { nome: 'Santa Cruz do Capibaribe', latitude: -7.9547, longitude: -36.2056 },
  { nome: 'Agrestina', latitude: -8.4578, longitude: -35.9458 },
  { nome: 'Bezerros', latitude: -8.2333, longitude: -35.7958 },
  { nome: 'São Caetano', latitude: -8.3375, longitude: -36.0694 },
];

interface DestinoPredefinido {
  nome: string;
  escola: string;
  endereco: string;
  latitude: number;
  longitude: number;
}

const DESTINOS_PREDEFINIDOS: DestinoPredefinido[] = [
  {
    nome: 'UNINASSAU',
    escola: 'Faculdade Maurício de Nassau',
    endereco: 'Entroncamento BR-232 com BR-104, Caruaru - PE',
    latitude: -8.2680,
    longitude: -35.9630,
  },
  {
    nome: 'UFPE - CAA',
    escola: 'UFPE Centro Acadêmico do Agreste',
    endereco: 'Rodovia BR-104, Km 59, Nova Caruaru, Caruaru - PE',
    latitude: -8.2325,
    longitude: -35.9892,
  },
  {
    nome: 'IFPE Caruaru',
    escola: 'IFPE Campus Caruaru',
    endereco: 'Estrada do Alto do Moura, km 3,8, Caruaru - PE',
    latitude: -8.2612,
    longitude: -35.9895,
  },
  {
    nome: 'ASCES-UNITA',
    escola: 'Centro Universitário Tabosa de Almeida',
    endereco: 'Av. Portugal, 584, Bairro Universitário, Caruaru - PE',
    latitude: -8.2785,
    longitude: -35.9675,
  },
  {
    nome: 'FAVIP / Wyden',
    escola: 'Faculdade DeVry FAVIP Wyden',
    endereco: 'Rua Adjar da Silva Casé, 800, Indianópolis, Caruaru - PE',
    latitude: -8.2740,
    longitude: -35.9710,
  },
  {
    nome: 'FADIRE Santa Cruz',
    escola: 'Faculdade de Desenvolvimento Regional',
    endereco: 'Av. 29 de Dezembro, Santa Cruz do Capibaribe - PE',
    latitude: -7.9520,
    longitude: -36.2010,
  },
];

const PONTOS_FREQUENTES = [
  { nome: 'Terminal Rodoviário', endereco: 'Centro, Caruaru - PE', latitude: -8.2842, longitude: -35.9712 },
  { nome: 'Shopping Difusora', endereco: 'Av. Agamenon Magalhães, Caruaru - PE', latitude: -8.2790, longitude: -35.9734 },
  { nome: 'Praça Central / Matriz', endereco: 'Centro, Caruaru - PE', latitude: -8.2830, longitude: -35.9720 },
  { nome: 'Av. Rui Barbosa', endereco: 'Bairro Maurício de Nassau, Caruaru - PE', latitude: -8.2750, longitude: -35.9680 },
  { nome: 'Av. Portugal (Universitário)', endereco: 'Bairro Universitário, Caruaru - PE', latitude: -8.2770, longitude: -35.9650 },
];

const darkMapStyle = [
  { elementType: 'geometry', stylers: [{ color: '#1A253A' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#8F9CAE' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#1A253A' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#1F2C42' }] },
  { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#F5A623' }, { lightness: -40 }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#0F172A' }] },
];

export default function GerenciarRotas() {
  const router = useRouter();
  const { theme, userRole, isDark } = useApp();
  const mapAdminRef = useRef<any>(null);
  const previewMapRef = useRef<any>(null);

  const [loading, setLoading] = useState(true);
  const [rotas, setRotas] = useState<Rota[]>([]);
  const [modalCriarVisivel, setModalCriarVisivel] = useState(false);
  const [modalPreviewRota, setModalPreviewRota] = useState<Rota | null>(null);
  const [salvando, setSalvando] = useState(false);

  // Aba ativa no modal de criação
  const [abaAtiva, setAbaAtiva] = useState<'mapa' | 'dados'>('mapa');

  // Form de criação de rota
  const [nomeRota, setNomeRota] = useState('');
  const [cidadeOrigem, setCidadeOrigem] = useState<string>('Caruaru');
  const [destinoSelecionado, setDestinoSelecionado] = useState<DestinoPredefinido>(DESTINOS_PREDEFINIDOS[0]);
  const [escolaDestino, setEscolaDestino] = useState(DESTINOS_PREDEFINIDOS[0].escola);
  const [horario, setHorario] = useState('18:00');
  const [tipo, setTipo] = useState<'Ida' | 'Volta'>('Ida');

  // Paradas georreferenciadas marcadas no mapa
  const [paradasMarcadas, setParadasMarcadas] = useState<Parada[]>([
    {
      id: 'p-1',
      nome: 'Terminal Rodoviário / Centro',
      endereco: 'Centro, Caruaru - PE',
      latitude: -8.2842,
      longitude: -35.9712,
    },
    {
      id: 'p-2',
      nome: 'Av. Agamenon Magalhães (Shopping Difusora)',
      endereco: 'Av. Agamenon Magalhães, Caruaru - PE',
      latitude: -8.2790,
      longitude: -35.9734,
    },
    {
      id: 'p-3',
      nome: 'Bairro Maurício de Nassau',
      endereco: 'Av. Rui Barbosa, Caruaru - PE',
      latitude: -8.2725,
      longitude: -35.9698,
    },
  ]);

  // Ponto temporário tocado no mapa aguardando confirmação de nome
  const [pontoTemporario, setPontoTemporario] = useState<{ latitude: number; longitude: number } | null>(null);
  const [nomePontoTemporario, setNomePontoTemporario] = useState('');
  const [novaParadaManual, setNovaParadaManual] = useState('');

  // Região atual do mapa
  const [mapRegion, setMapRegion] = useState({
    latitude: -8.2833,
    longitude: -35.9761,
    latitudeDelta: 0.04,
    longitudeDelta: 0.04,
  });

  useEffect(() => {
    loadRotas();
  }, []);

  const loadRotas = async () => {
    setLoading(true);
    const result: AdminRotasResponse = await getAdminRotas();
    setLoading(false);
    if (result.success && result.rotas) {
      setRotas(result.rotas);
    } else {
      setRotas([]);
      Alert.alert('Erro', result.message || 'Não foi possível carregar as rotas.');
    }
  };

  // Abre modal resetando estado
  const handleAbrirModalCriar = () => {
    setCidadeOrigem('Caruaru');
    setDestinoSelecionado(DESTINOS_PREDEFINIDOS[0]);
    setEscolaDestino(DESTINOS_PREDEFINIDOS[0].escola);
    setNomeRota(`Linha 0${rotas.length + 1} - Caruaru ➔ ${DESTINOS_PREDEFINIDOS[0].nome}`);
    setHorario('18:00');
    setTipo('Ida');
    setParadasMarcadas([
      {
        id: `p-${Date.now()}-1`,
        nome: 'Terminal Rodoviário / Ponto de Partida',
        endereco: 'Centro, Caruaru - PE',
        latitude: -8.2842,
        longitude: -35.9712,
      },
      {
        id: `p-${Date.now()}-2`,
        nome: 'Av. Agamenon Magalhães (Shopping Difusora)',
        endereco: 'Av. Agamenon Magalhães, Caruaru - PE',
        latitude: -8.2790,
        longitude: -35.9734,
      },
    ]);
    setPontoTemporario(null);
    setNomePontoTemporario('');
    setAbaAtiva('mapa');
    setModalCriarVisivel(true);
  };

  // Seleciona cidade de origem rápida
  const handleSelecionarCidade = (cid: CidadeOrigem) => {
    setCidadeOrigem(cid.nome);
    const novaRegiao = {
      latitude: cid.latitude,
      longitude: cid.longitude,
      latitudeDelta: 0.05,
      longitudeDelta: 0.05,
    };
    setMapRegion(novaRegiao);

    if (mapAdminRef.current?.animateToRegion) {
      mapAdminRef.current.animateToRegion(novaRegiao, 600);
    } else if (mapAdminRef.current?.panTo) {
      mapAdminRef.current.panTo(cid.latitude, cid.longitude);
    }

    if (!nomeRota || nomeRota.includes('➔')) {
      setNomeRota(`Linha ${cid.nome} ➔ ${destinoSelecionado.nome}`);
    }
  };

  // Seleciona destino educacional rápido
  const handleSelecionarDestino = (dest: DestinoPredefinido) => {
    setDestinoSelecionado(dest);
    setEscolaDestino(dest.escola);
    if (!nomeRota || nomeRota.includes('➔')) {
      setNomeRota(`Linha ${cidadeOrigem} ➔ ${dest.nome}`);
    }
  };

  // Clique no mapa: captura as coordenadas georreferenciadas
  const handleMapPress = (coord: { latitude: number; longitude: number }) => {
    setPontoTemporario(coord);
    const numero = paradasMarcadas.length + 1;
    setNomePontoTemporario(`Parada #${numero}`);
  };

  // Confirmação do ponto tocado no mapa
  const handleConfirmarPonto = () => {
    if (!pontoTemporario) return;
    const nomeFinal = nomePontoTemporario.trim() || `Parada #${paradasMarcadas.length + 1}`;
    const novaParada: Parada = {
      id: `p-${Date.now()}-${paradasMarcadas.length + 1}`,
      nome: nomeFinal,
      endereco: `${nomeFinal}, ${cidadeOrigem} - PE`,
      latitude: Number(pontoTemporario.latitude.toFixed(6)),
      longitude: Number(pontoTemporario.longitude.toFixed(6)),
    };
    setParadasMarcadas([...paradasMarcadas, novaParada]);
    setPontoTemporario(null);
    setNomePontoTemporario('');
  };

  // Adiciona parada pré-definida frequente
  const handleAdicionarPontoFrequente = (ponto: typeof PONTOS_FREQUENTES[0]) => {
    const novaParada: Parada = {
      id: `p-${Date.now()}-${paradasMarcadas.length + 1}`,
      nome: ponto.nome,
      endereco: ponto.endereco,
      latitude: ponto.latitude,
      longitude: ponto.longitude,
    };
    setParadasMarcadas([...paradasMarcadas, novaParada]);
  };

  // Adiciona parada digitada manualmente
  const handleAdicionarParadaManual = () => {
    if (!novaParadaManual.trim()) return;
    const idx = paradasMarcadas.length;
    // Offset leve a partir do centro da cidade selecionada
    const latBase = mapRegion.latitude + idx * 0.003;
    const lngBase = mapRegion.longitude + (idx % 2 === 0 ? 0.002 : -0.002);
    const novaParada: Parada = {
      id: `p-${Date.now()}-${idx + 1}`,
      nome: novaParadaManual.trim(),
      endereco: `${novaParadaManual.trim()}, ${cidadeOrigem} - PE`,
      latitude: Number(latBase.toFixed(6)),
      longitude: Number(lngBase.toFixed(6)),
    };
    setParadasMarcadas([...paradasMarcadas, novaParada]);
    setNovaParadaManual('');
  };

  const handleRemoverParada = (index: number) => {
    setParadasMarcadas(paradasMarcadas.filter((_, i) => i !== index));
  };

  // Salva a nova rota criada pelo administrador
  const handleSalvarNovaRota = async () => {
    if (!nomeRota.trim()) {
      Alert.alert('Atenção', 'Informe o nome da rota (ex: Linha Caruaru ➔ UNINASSAU)');
      return;
    }
    if (!escolaDestino.trim()) {
      Alert.alert('Atenção', 'Informe o destino escolar ou faculdade.');
      return;
    }
    if (paradasMarcadas.length === 0) {
      Alert.alert('Atenção', 'Marque pelo menos 1 ponto de parada no mapa.');
      return;
    }

    setSalvando(true);

    // Constrói a lista final com as paradas e o ponto de destino final (★)
    const paradasFinais: Parada[] = [...paradasMarcadas];
    const jaTemDestino = paradasFinais.some(
      (p) =>
        p.nome.toLowerCase().includes('destino') ||
        p.nome.toLowerCase().includes(escolaDestino.toLowerCase()) ||
        p.nome.toLowerCase().includes(destinoSelecionado.nome.toLowerCase())
    );

    if (!jaTemDestino) {
      paradasFinais.push({
        id: `dest-${Date.now()}`,
        nome: `${destinoSelecionado.nome} (Destino Final)`,
        endereco: destinoSelecionado.endereco,
        latitude: destinoSelecionado.latitude,
        longitude: destinoSelecionado.longitude,
      });
    }

    const res = await createRota({
      nome: nomeRota.trim(),
      escola: escolaDestino.trim(),
      horario: horario.trim() || '18:00',
      tipo,
      paradas: paradasFinais,
      diasSemana: ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta'],
      alunosIds: [],
      motoristaId: '',
    });

    setSalvando(false);

    if (res.success) {
      Alert.alert(
        'Rota Criada com Sucesso!',
        `A rota "${nomeRota}" com ${paradasFinais.length} paradas marcadas no mapa foi registrada. Os alunos já podem visualizar o trajeto completo no aplicativo.`
      );
      setModalCriarVisivel(false);
      loadRotas();
    } else {
      Alert.alert('Erro ao Salvar', res.message || 'Não foi possível cadastrar a rota.');
    }
  };

  const handleDelete = (rotaId: string) => {
    Alert.alert(
      'Confirmar Exclusão',
      'Deseja excluir esta rota? Ela não aparecerá mais no mapa e nos itinerários.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            const res = await deleteRota(rotaId);
            if (!res.success) Alert.alert('Erro', res.message);
            loadRotas();
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
          <Text style={[styles.title, { color: theme.text }]}>Gerenciar Rotas</Text>
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

  // Rota virtual temporária para desenhar no mapa durante a criação
  const rotaVisualizacaoCriacao: Rota = {
    id: 'preview-criacao',
    nome: nomeRota || 'Nova Rota',
    escola: escolaDestino,
    horario,
    tipo,
    status: 'agendada',
    paradas: [
      ...paradasMarcadas,
      // Se tiver destino e ainda não adicionado, desenha o destino final também
      {
        id: 'dest-preview',
        nome: `${destinoSelecionado.nome} (Destino Final)`,
        endereco: destinoSelecionado.endereco,
        latitude: destinoSelecionado.latitude,
        longitude: destinoSelecionado.longitude,
      },
    ],
    alunos: [],
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* Top Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="arrow-left" size={24} color={theme.text} />
        </TouchableOpacity>
        <View>
          <Text style={[styles.title, { color: theme.text }]}>Gerenciar Rotas</Text>
          <Text style={[styles.subtitle, { color: theme.subtext }]}>
            {rotas.length} {rotas.length === 1 ? 'linha ativa' : 'linhas ativas'} no sistema
          </Text>
        </View>
        <TouchableOpacity
          style={[styles.addBtnHeader, { backgroundColor: theme.gold }]}
          onPress={handleAbrirModalCriar}
        >
          <Feather name="plus" size={20} color="#1A253A" />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color={theme.gold} />
          <Text style={[styles.loadingText, { color: theme.subtext }]}>Carregando rotas...</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {rotas.length === 0 ? (
            <View style={styles.emptyContainer}>
              <View style={[styles.emptyIconCircle, { backgroundColor: 'rgba(245,166,35,0.12)' }]}>
                <FontAwesome5 name="route" size={42} color={theme.gold} />
              </View>
              <Text style={[styles.emptyTitle, { color: theme.text }]}>Nenhuma rota cadastrada</Text>
              <Text style={[styles.emptyText, { color: theme.subtext }]}>
                Crie sua primeira linha escolar marcando pontos de parada diretamente no mapa.
              </Text>
              <TouchableOpacity
                style={[styles.btnCriarVazio, { backgroundColor: theme.gold }]}
                onPress={handleAbrirModalCriar}
              >
                <Feather name="map-pin" size={18} color="#1A253A" style={{ marginRight: 8 }} />
                <Text style={styles.btnCriarVazioText}>Criar Rota no Mapa</Text>
              </TouchableOpacity>
            </View>
          ) : (
            rotas.map((rota) => (
              <View
                key={rota.id}
                style={[styles.rotaCard, { backgroundColor: theme.card, borderColor: theme.border }]}
              >
                <View style={styles.rotaHeader}>
                  <View style={[styles.rotaIcon, { backgroundColor: 'rgba(245,166,35,0.15)' }]}>
                    <FontAwesome5 name="bus" size={20} color={theme.gold} />
                  </View>
                  <View style={styles.rotaInfo}>
                    <Text style={[styles.rotaNome, { color: theme.text }]}>{rota.nome}</Text>
                    <Text style={[styles.rotaEscola, { color: theme.subtext }]} numberOfLines={1}>
                      {rota.escola}
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={styles.deleteBtn}
                    onPress={() => handleDelete(rota.id)}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <Feather name="trash-2" size={18} color="#EF4444" />
                  </TouchableOpacity>
                </View>

                <View style={[styles.divider, { backgroundColor: theme.border }]} />

                <View style={styles.rotaDetails}>
                  <View style={styles.detailItem}>
                    <Feather name="clock" size={14} color={theme.gold} />
                    <Text style={[styles.detailText, { color: theme.text }]}>{rota.horario}</Text>
                  </View>
                  <View style={styles.detailItem}>
                    <Feather name="navigation" size={14} color={theme.gold} />
                    <Text style={[styles.detailText, { color: theme.text }]}>{rota.tipo}</Text>
                  </View>
                  <View style={styles.detailItem}>
                    <Feather name="map-pin" size={14} color={theme.gold} />
                    <Text style={[styles.detailText, { color: theme.gold }]}>
                      {rota.paradas?.length || 0} paradas
                    </Text>
                  </View>
                </View>

                {/* Botão de Ver no Mapa */}
                <TouchableOpacity
                  style={[styles.btnVerNoMapa, { backgroundColor: 'rgba(245,166,35,0.1)', borderColor: theme.border }]}
                  onPress={() => setModalPreviewRota(rota)}
                >
                  <Feather name="map" size={15} color={theme.gold} />
                  <Text style={[styles.btnVerNoMapaText, { color: theme.gold }]}>
                    Ver Trajeto Completo no Mapa
                  </Text>
                  <Feather name="chevron-right" size={16} color={theme.gold} />
                </TouchableOpacity>
              </View>
            ))
          )}
          <View style={{ height: 40 }} />
        </ScrollView>
      )}

      {/* ========================================================= */}
      {/* MODAL: CRIAR NOVA ROTA COM SELEÇÃO NO MAPA & CIDADES */}
      {/* ========================================================= */}
      <Modal
        visible={modalCriarVisivel}
        animationType="slide"
        transparent
        onRequestClose={() => setModalCriarVisivel(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.modalOverlay}
        >
          <View style={[styles.modalBox, { backgroundColor: theme.card, borderColor: theme.border }]}>
            {/* Cabeçalho do Modal */}
            <View style={styles.modalHeader}>
              <View style={styles.modalTitleRow}>
                <View style={[styles.modalTitleIconCircle, { backgroundColor: 'rgba(245,166,35,0.15)' }]}>
                  <FontAwesome5 name="route" size={16} color={theme.gold} />
                </View>
                <View>
                  <Text style={[styles.modalTitle, { color: theme.text }]}>Nova Linha / Rota</Text>
                  <Text style={[styles.modalSubtitle, { color: theme.subtext }]}>
                    Marque paradas no mapa ou selecione ruas e cidades
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                onPress={() => setModalCriarVisivel(false)}
                style={styles.closeModalBtn}
              >
                <Feather name="x" size={22} color={theme.subtext} />
              </TouchableOpacity>
            </View>

            {/* Alternador de Abas: Mapa vs Dados */}
            <View style={[styles.tabBar, { backgroundColor: theme.inputBg, borderColor: theme.border }]}>
              <TouchableOpacity
                style={[
                  styles.tabItem,
                  abaAtiva === 'mapa' && { backgroundColor: theme.gold },
                ]}
                onPress={() => setAbaAtiva('mapa')}
              >
                <Feather
                  name="map"
                  size={15}
                  color={abaAtiva === 'mapa' ? '#1A253A' : theme.subtext}
                />
                <Text
                  style={[
                    styles.tabItemText,
                    { color: abaAtiva === 'mapa' ? '#1A253A' : theme.text },
                  ]}
                >
                  Marcar no Mapa ({paradasMarcadas.length})
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.tabItem,
                  abaAtiva === 'dados' && { backgroundColor: theme.gold },
                ]}
                onPress={() => setAbaAtiva('dados')}
              >
                <Feather
                  name="list"
                  size={15}
                  color={abaAtiva === 'dados' ? '#1A253A' : theme.subtext}
                />
                <Text
                  style={[
                    styles.tabItemText,
                    { color: abaAtiva === 'dados' ? '#1A253A' : theme.text },
                  ]}
                >
                  Dados da Linha
                </Text>
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 520 }}>
              {/* ==================================================== */}
              {/* ABA 1: MAPA INTERATIVO E MARCAÇÃO DE PARADAS */}
              {/* ==================================================== */}
              {abaAtiva === 'mapa' ? (
                <View style={styles.abaMapaContainer}>
                  {/* Seletor Rápido de Cidade de Origem */}
                  <Text style={[styles.sectionMiniTitle, { color: theme.subtext }]}>
                    1. CIDADE DE ORIGEM:
                  </Text>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.horizontalChipsScroll}
                  >
                    {CIDADES_ORIGEM.map((cid) => {
                      const ativo = cidadeOrigem === cid.nome;
                      return (
                        <TouchableOpacity
                          key={cid.nome}
                          style={[
                            styles.chipBtn,
                            {
                              backgroundColor: ativo ? theme.gold : theme.inputBg,
                              borderColor: ativo ? theme.gold : theme.border,
                            },
                          ]}
                          onPress={() => handleSelecionarCidade(cid)}
                        >
                          <Feather
                            name="map-pin"
                            size={12}
                            color={ativo ? '#1A253A' : theme.gold}
                            style={{ marginRight: 5 }}
                          />
                          <Text
                            style={[
                              styles.chipBtnText,
                              { color: ativo ? '#1A253A' : theme.text, fontWeight: ativo ? 'bold' : 'normal' },
                            ]}
                          >
                            {cid.nome}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </ScrollView>

                  {/* Seletor Rápido de Polo / Faculdade de Destino */}
                  <Text style={[styles.sectionMiniTitle, { color: theme.subtext, marginTop: 10 }]}>
                    2. DESTINO / POLO EDUCACIONAL:
                  </Text>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.horizontalChipsScroll}
                  >
                    {DESTINOS_PREDEFINIDOS.map((dest) => {
                      const ativo = destinoSelecionado.nome === dest.nome;
                      return (
                        <TouchableOpacity
                          key={dest.nome}
                          style={[
                            styles.chipBtn,
                            {
                              backgroundColor: ativo ? theme.gold : theme.inputBg,
                              borderColor: ativo ? theme.gold : theme.border,
                            },
                          ]}
                          onPress={() => handleSelecionarDestino(dest)}
                        >
                          <FontAwesome5
                            name="university"
                            size={11}
                            color={ativo ? '#1A253A' : theme.gold}
                            style={{ marginRight: 5 }}
                          />
                          <Text
                            style={[
                              styles.chipBtnText,
                              { color: ativo ? '#1A253A' : theme.text, fontWeight: ativo ? 'bold' : 'normal' },
                            ]}
                          >
                            {dest.nome}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </ScrollView>

                  {/* Instrução visual do Mapa */}
                  <View style={[styles.dicaMapaBox, { backgroundColor: 'rgba(245,166,35,0.08)', borderColor: 'rgba(245,166,35,0.25)' }]}>
                    <Feather name="info" size={14} color={theme.gold} style={{ marginRight: 6 }} />
                    <Text style={[styles.dicaMapaText, { color: theme.text }]}>
                      Toque no mapa para marcar uma parada nas coordenadas exatas.
                    </Text>
                  </View>

                  {/* MAPA INTERATIVO EMBUTIDO */}
                  <View style={[styles.mapWrapper, { borderColor: theme.border }]}>
                    <MapViewComponent
                      mapRef={mapAdminRef}
                      theme={theme}
                      isDark={isDark}
                      rota={rotaVisualizacaoCriacao}
                      INITIAL_REGION={mapRegion}
                      darkMapStyle={darkMapStyle}
                      onMapPress={handleMapPress}
                    />

                    {/* Badge flutuante sobre o mapa indicando contagem */}
                    <View style={styles.floatingMapBadge}>
                      <FontAwesome5 name="map-marked-alt" size={12} color="#1A253A" style={{ marginRight: 5 }} />
                      <Text style={styles.floatingMapBadgeText}>
                        {paradasMarcadas.length} paradas marcadas
                      </Text>
                    </View>
                  </View>

                  {/* Formulário Inline quando o Admin toca no mapa */}
                  {Boolean(pontoTemporario) && (
                    <View style={[styles.confirmarPontoBox, { backgroundColor: theme.inputBg, borderColor: theme.gold }]}>
                      <View style={styles.confirmarPontoHeader}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                          <View style={[styles.pinDot, { backgroundColor: theme.gold }]} />
                          <Text style={[styles.confirmarPontoTitulo, { color: theme.text }]}>
                            Novo Ponto no Mapa
                          </Text>
                        </View>
                        <Text style={[styles.coordMiniText, { color: theme.subtext }]}>
                          {pontoTemporario?.latitude.toFixed(4)}, {pontoTemporario?.longitude.toFixed(4)}
                        </Text>
                      </View>
                      <TextInput
                        style={[styles.inputConfirmar, { backgroundColor: theme.card, color: theme.text, borderColor: theme.border }]}
                        placeholder="Nome da parada (ex: Praça Central, Posto Shell)"
                        placeholderTextColor={theme.subtext}
                        value={nomePontoTemporario}
                        onChangeText={setNomePontoTemporario}
                        autoFocus
                      />
                      <View style={styles.confirmarPontoAcoes}>
                        <TouchableOpacity
                          style={[styles.btnCancelarPonto, { borderColor: theme.border }]}
                          onPress={() => setPontoTemporario(null)}
                        >
                          <Text style={[styles.btnCancelarPontoText, { color: theme.subtext }]}>Cancelar</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={[styles.btnAdicionarPonto, { backgroundColor: theme.gold }]}
                          onPress={handleConfirmarPonto}
                        >
                          <Feather name="check" size={14} color="#1A253A" style={{ marginRight: 4 }} />
                          <Text style={styles.btnAdicionarPontoText}>Adicionar Parada</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  )}

                  {/* Atalhos de Paradas Frequentes da Região */}
                  <Text style={[styles.sectionMiniTitle, { color: theme.subtext, marginTop: 14 }]}>
                    OU ADICIONE PARADAS FREQUENTES:
                  </Text>
                  <View style={styles.frequentesContainer}>
                    {PONTOS_FREQUENTES.map((p) => (
                      <TouchableOpacity
                        key={p.nome}
                        style={[styles.frequenteChip, { backgroundColor: theme.inputBg, borderColor: theme.border }]}
                        onPress={() => handleAdicionarPontoFrequente(p)}
                      >
                        <Feather name="plus-circle" size={13} color={theme.gold} style={{ marginRight: 5 }} />
                        <Text style={[styles.frequenteChipText, { color: theme.text }]}>{p.nome}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>

                  {/* Lista com as paradas marcadas */}
                  <Text style={[styles.sectionMiniTitle, { color: theme.subtext, marginTop: 14 }]}>
                    ORDEM DE EMBARQUE NA ROTA ({paradasMarcadas.length}):
                  </Text>
                  {paradasMarcadas.map((parada, i) => (
                    <View key={parada.id || `parada-${i}`} style={[styles.paradaItemRow, { backgroundColor: theme.inputBg }]}>
                      <View style={[styles.paradaBadgeNum, { backgroundColor: theme.gold }]}>
                        <Text style={styles.paradaBadgeNumText}>{i + 1}</Text>
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.paradaItemText, { color: theme.text }]} numberOfLines={1}>
                          {parada.nome}
                        </Text>
                        <Text style={[styles.paradaCoordText, { color: theme.subtext }]}>
                          GPS: {parada.latitude.toFixed(4)}, {parada.longitude.toFixed(4)}
                        </Text>
                      </View>
                      <TouchableOpacity
                        onPress={() => handleRemoverParada(i)}
                        style={styles.removerParadaBtn}
                      >
                        <Feather name="trash" size={16} color="#EF4444" />
                      </TouchableOpacity>
                    </View>
                  ))}

                  {/* Destino Final Estrela ★ */}
                  <View style={[styles.paradaItemRow, { backgroundColor: 'rgba(245,166,35,0.12)', borderColor: theme.gold, borderWidth: 1 }]}>
                    <View style={[styles.paradaBadgeNum, { backgroundColor: theme.gold }]}>
                      <Text style={styles.paradaBadgeNumText}>★</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.paradaItemText, { color: theme.gold, fontWeight: 'bold' }]} numberOfLines={1}>
                        {destinoSelecionado.nome} (Destino Final)
                      </Text>
                      <Text style={[styles.paradaCoordText, { color: theme.subtext }]} numberOfLines={1}>
                        {destinoSelecionado.endereco}
                      </Text>
                    </View>
                  </View>
                </View>
              ) : (
                /* ==================================================== */
                /* ABA 2: DADOS CADASTRAIS DA ROTA                      */
                /* ==================================================== */
                <View style={styles.abaDadosContainer}>
                  <Text style={[styles.inputLabel, { color: theme.subtext }]}>Nome Identificador da Rota:</Text>
                  <TextInput
                    style={[styles.input, { backgroundColor: theme.inputBg, color: theme.text, borderColor: theme.border }]}
                    placeholder="Ex: Linha Caruaru ➔ UNINASSAU Noturno"
                    placeholderTextColor={theme.subtext}
                    value={nomeRota}
                    onChangeText={setNomeRota}
                  />

                  <Text style={[styles.inputLabel, { color: theme.subtext }]}>Escola ou Faculdade de Destino:</Text>
                  <TextInput
                    style={[styles.input, { backgroundColor: theme.inputBg, color: theme.text, borderColor: theme.border }]}
                    placeholder="Ex: Faculdade Maurício de Nassau"
                    placeholderTextColor={theme.subtext}
                    value={escolaDestino}
                    onChangeText={setEscolaDestino}
                  />

                  <View style={styles.rowInputs}>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.inputLabel, { color: theme.subtext }]}>Horário de Saída:</Text>
                      <TextInput
                        style={[styles.input, { backgroundColor: theme.inputBg, color: theme.text, borderColor: theme.border }]}
                        placeholder="18:00"
                        placeholderTextColor={theme.subtext}
                        value={horario}
                        onChangeText={setHorario}
                      />
                    </View>
                    <View style={{ width: 12 }} />
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.inputLabel, { color: theme.subtext }]}>Sentido:</Text>
                      <View style={styles.tipoRow}>
                        <TouchableOpacity
                          style={[
                            styles.tipoBtn,
                            tipo === 'Ida' && { backgroundColor: theme.gold },
                          ]}
                          onPress={() => setTipo('Ida')}
                        >
                          <Text style={[styles.tipoBtnText, { color: tipo === 'Ida' ? '#1A253A' : theme.text }]}>Ida</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={[
                            styles.tipoBtn,
                            tipo === 'Volta' && { backgroundColor: theme.gold },
                          ]}
                          onPress={() => setTipo('Volta')}
                        >
                          <Text style={[styles.tipoBtnText, { color: tipo === 'Volta' ? '#1A253A' : theme.text }]}>Volta</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>

                  {/* Adicionar parada por nome de rua */}
                  <Text style={[styles.inputLabel, { color: theme.subtext, marginTop: 14 }]}>
                    Adicionar Parada pelo Nome da Rua:
                  </Text>
                  <View style={styles.addParadaRow}>
                    <TextInput
                      style={[styles.inputParada, { backgroundColor: theme.inputBg, color: theme.text, borderColor: theme.border }]}
                      placeholder="Ex: Av. Caruaru, próx. ao Posto"
                      placeholderTextColor={theme.subtext}
                      value={novaParadaManual}
                      onChangeText={setNovaParadaManual}
                    />
                    <TouchableOpacity
                      style={[styles.btnAddParada, { backgroundColor: theme.gold }]}
                      onPress={handleAdicionarParadaManual}
                    >
                      <Feather name="plus" size={18} color="#1A253A" />
                    </TouchableOpacity>
                  </View>

                  {/* Resumo da rota */}
                  <View style={[styles.resumoBox, { backgroundColor: theme.inputBg, borderColor: theme.border }]}>
                    <Text style={[styles.resumoTitle, { color: theme.gold }]}>Resumo do Itinerário</Text>
                    <Text style={[styles.resumoItem, { color: theme.text }]}>
                      • Origem: <Text style={{ fontWeight: 'bold' }}>{cidadeOrigem}</Text>
                    </Text>
                    <Text style={[styles.resumoItem, { color: theme.text }]}>
                      • Destino: <Text style={{ fontWeight: 'bold' }}>{escolaDestino}</Text>
                    </Text>
                    <Text style={[styles.resumoItem, { color: theme.text }]}>
                      • Paradas Georreferenciadas: <Text style={{ fontWeight: 'bold' }}>{paradasMarcadas.length}</Text>
                    </Text>
                    <Text style={[styles.resumoItem, { color: theme.text }]}>
                      • Horário: <Text style={{ fontWeight: 'bold' }}>{horario} ({tipo})</Text>
                    </Text>
                  </View>
                </View>
              )}
            </ScrollView>

            {/* Rodapé com botões de ação */}
            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={[styles.btnCancelar, { borderColor: theme.border }]}
                onPress={() => setModalCriarVisivel(false)}
              >
                <Text style={[styles.btnCancelarText, { color: theme.text }]}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.btnSalvar, { backgroundColor: theme.gold }]}
                onPress={handleSalvarNovaRota}
                disabled={salvando}
              >
                {salvando ? (
                  <ActivityIndicator size="small" color="#1A253A" />
                ) : (
                  <Text style={styles.btnSalvarText}>
                    Salvar Rota ({paradasMarcadas.length} paradas)
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* ========================================================= */}
      {/* MODAL: PREVIEW DE ROTA EXISTENTE NO MAPA                 */}
      {/* ========================================================= */}
      <Modal
        visible={Boolean(modalPreviewRota)}
        animationType="slide"
        transparent
        onRequestClose={() => setModalPreviewRota(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.previewModalBox, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <View style={styles.modalHeader}>
              <View style={styles.modalTitleRow}>
                <View style={[styles.modalTitleIconCircle, { backgroundColor: 'rgba(245,166,35,0.15)' }]}>
                  <FontAwesome5 name="map-marked-alt" size={16} color={theme.gold} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.modalTitle, { color: theme.text }]} numberOfLines={1}>
                    {modalPreviewRota?.nome}
                  </Text>
                  <Text style={[styles.modalSubtitle, { color: theme.subtext }]} numberOfLines={1}>
                    {modalPreviewRota?.escola} • {modalPreviewRota?.horario} ({modalPreviewRota?.tipo})
                  </Text>
                </View>
              </View>
              <TouchableOpacity onPress={() => setModalPreviewRota(null)} style={styles.closeModalBtn}>
                <Feather name="x" size={22} color={theme.subtext} />
              </TouchableOpacity>
            </View>

            {/* Mapa Preview */}
            <View style={[styles.previewMapWrapper, { borderColor: theme.border }]}>
              {modalPreviewRota && (
                <MapViewComponent
                  mapRef={previewMapRef}
                  theme={theme}
                  isDark={isDark}
                  rota={modalPreviewRota}
                  INITIAL_REGION={{
                    latitude: modalPreviewRota.paradas?.[0]?.latitude || -8.2833,
                    longitude: modalPreviewRota.paradas?.[0]?.longitude || -35.9761,
                    latitudeDelta: 0.04,
                    longitudeDelta: 0.04,
                  }}
                  darkMapStyle={darkMapStyle}
                />
              )}
            </View>

            {/* Lista de Paradas da rota */}
            <Text style={[styles.sectionMiniTitle, { color: theme.subtext, marginTop: 12, marginBottom: 8 }]}>
              PONTOS DE PARADA NO MAPA:
            </Text>
            <ScrollView style={{ maxHeight: 180 }} showsVerticalScrollIndicator={false}>
              {modalPreviewRota?.paradas?.map((parada, idx) => {
                const isDestino = idx === (modalPreviewRota.paradas?.length || 1) - 1;
                return (
                  <View
                    key={parada.id || `pv-${idx}`}
                    style={[
                      styles.paradaItemRow,
                      {
                        backgroundColor: isDestino ? 'rgba(245,166,35,0.12)' : theme.inputBg,
                        borderWidth: isDestino ? 1 : 0,
                        borderColor: theme.gold,
                      },
                    ]}
                  >
                    <View style={[styles.paradaBadgeNum, { backgroundColor: theme.gold }]}>
                      <Text style={styles.paradaBadgeNumText}>{isDestino ? '★' : idx + 1}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text
                        style={[
                          styles.paradaItemText,
                          { color: isDestino ? theme.gold : theme.text, fontWeight: isDestino ? 'bold' : 'normal' },
                        ]}
                      >
                        {parada.nome}
                      </Text>
                      <Text style={[styles.paradaCoordText, { color: theme.subtext }]}>
                        {parada.endereco || `GPS: ${parada.latitude.toFixed(4)}, ${parada.longitude.toFixed(4)}`}
                      </Text>
                    </View>
                  </View>
                );
              })}
            </ScrollView>

            <TouchableOpacity
              style={[styles.btnFecharPreview, { backgroundColor: theme.gold }]}
              onPress={() => setModalPreviewRota(null)}
            >
              <Text style={styles.btnFecharPreviewText}>Concluir Visualização</Text>
            </TouchableOpacity>
          </View>
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
  },
  backBtn: { padding: 4 },
  title: { fontSize: 18, fontWeight: 'bold' },
  subtitle: { fontSize: 12, marginTop: 2 },
  addBtnHeader: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
  },
  centerContent: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { fontSize: 15, marginTop: 12 },
  accessDeniedText: { fontSize: 16, marginTop: 10, textAlign: 'center' },
  scrollContent: { padding: 20 },
  emptyContainer: { alignItems: 'center', paddingVertical: 50 },
  emptyIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 6 },
  emptyText: { fontSize: 14, textAlign: 'center', paddingHorizontal: 30, lineHeight: 20 },
  btnCriarVazio: {
    marginTop: 22,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 22,
    paddingVertical: 12,
    borderRadius: 14,
  },
  btnCriarVazioText: {
    color: '#1A253A',
    fontWeight: 'bold',
    fontSize: 14,
  },
  rotaCard: {
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    marginBottom: 14,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
  },
  rotaHeader: { flexDirection: 'row', alignItems: 'center' },
  rotaIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rotaInfo: { flex: 1, marginLeft: 12 },
  rotaNome: { fontSize: 16, fontWeight: 'bold' },
  rotaEscola: { fontSize: 13, marginTop: 2 },
  deleteBtn: { padding: 8 },
  divider: { height: 1, marginVertical: 12 },
  rotaDetails: { flexDirection: 'row', justifyContent: 'space-between' },
  detailItem: { flexDirection: 'row', alignItems: 'center' },
  detailText: { fontSize: 12, marginLeft: 6, fontWeight: '600' },
  btnVerNoMapa: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
    paddingVertical: 9,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
  },
  btnVerNoMapaText: { fontSize: 12, fontWeight: 'bold', flex: 1, marginLeft: 8 },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    padding: 16,
  },
  modalBox: {
    borderRadius: 22,
    padding: 18,
    borderWidth: 1,
    elevation: 10,
    maxHeight: '94%',
  },
  previewModalBox: {
    borderRadius: 22,
    padding: 18,
    borderWidth: 1,
    elevation: 10,
    maxHeight: '92%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  modalTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  modalTitleIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalTitle: { fontSize: 17, fontWeight: 'bold' },
  modalSubtitle: { fontSize: 11, marginTop: 2 },
  closeModalBtn: { padding: 6 },

  // Tab bar
  tabBar: {
    flexDirection: 'row',
    borderRadius: 12,
    borderWidth: 1,
    padding: 3,
    marginBottom: 12,
  },
  tabItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 9,
    gap: 6,
  },
  tabItemText: { fontSize: 12, fontWeight: 'bold' },

  // Seções da Aba Mapa
  abaMapaContainer: { paddingTop: 4 },
  sectionMiniTitle: { fontSize: 11, fontWeight: 'bold', letterSpacing: 0.5, marginBottom: 6 },
  horizontalChipsScroll: { flexDirection: 'row', gap: 6, paddingBottom: 6 },
  chipBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
  },
  chipBtnText: { fontSize: 12 },
  dicaMapaBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: 10,
    borderWidth: 1,
    marginVertical: 8,
  },
  dicaMapaText: { fontSize: 11, flex: 1, lineHeight: 15 },
  mapWrapper: {
    height: 250,
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 1,
    position: 'relative',
    marginVertical: 4,
  },
  floatingMapBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5A623',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
  },
  floatingMapBadgeText: {
    color: '#1A253A',
    fontSize: 11,
    fontWeight: 'bold',
  },

  // Confirmar ponto tocado no mapa
  confirmarPontoBox: {
    marginTop: 10,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1.5,
  },
  confirmarPontoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  pinDot: { width: 8, height: 8, borderRadius: 4 },
  confirmarPontoTitulo: { fontSize: 13, fontWeight: 'bold' },
  coordMiniText: { fontSize: 10 },
  inputConfirmar: {
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderWidth: 1,
    fontSize: 13,
    marginBottom: 10,
  },
  confirmarPontoAcoes: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
  btnCancelarPonto: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
    borderWidth: 1,
  },
  btnCancelarPontoText: { fontSize: 12, fontWeight: '600' },
  btnAdicionarPonto: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 8,
  },
  btnAdicionarPontoText: { color: '#1A253A', fontSize: 12, fontWeight: 'bold' },

  // Atalhos frequentes
  frequentesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 8,
  },
  frequenteChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
  },
  frequenteChipText: { fontSize: 11 },

  // Aba Dados
  abaDadosContainer: { paddingTop: 4 },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 6,
    marginTop: 8,
  },
  input: {
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    fontSize: 14,
  },
  rowInputs: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tipoRow: {
    flexDirection: 'row',
    gap: 6,
  },
  tipoBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  tipoBtnText: {
    fontSize: 13,
    fontWeight: 'bold',
  },
  addParadaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  inputParada: {
    flex: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    fontSize: 13,
  },
  btnAddParada: {
    width: 38,
    height: 38,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  resumoBox: {
    marginTop: 14,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  resumoTitle: { fontSize: 13, fontWeight: 'bold', marginBottom: 6 },
  resumoItem: { fontSize: 12, marginBottom: 3 },

  // Itens de parada compartilhados
  paradaItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 10,
    marginBottom: 6,
    gap: 10,
  },
  paradaBadgeNum: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  paradaBadgeNumText: {
    color: '#1A253A',
    fontSize: 11,
    fontWeight: 'bold',
  },
  paradaItemText: {
    fontSize: 13,
  },
  paradaCoordText: {
    fontSize: 10,
    marginTop: 2,
  },
  removerParadaBtn: { padding: 4 },

  // Preview Modal
  previewMapWrapper: {
    height: 280,
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 1,
    position: 'relative',
    marginVertical: 4,
  },
  btnFecharPreview: {
    marginTop: 14,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  btnFecharPreviewText: {
    color: '#1A253A',
    fontWeight: 'bold',
    fontSize: 14,
  },

  // Modal Footer
  modalFooter: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 14,
  },
  btnCancelar: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
  },
  btnCancelarText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  btnSalvar: {
    flex: 2,
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: 'center',
  },
  btnSalvarText: {
    color: '#1A253A',
    fontSize: 14,
    fontWeight: 'bold',
  },
});
