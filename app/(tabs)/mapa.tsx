/**
 * v10.1.0 - Beta Release
 * EduTransporter
 * 
 * Mapa - Visualização e rastreamento de rota em tempo real
 * Suporte a GPS em tempo real, paradas interativas, timeline,
 * simulação de demonstração e geofencing de proximidade.
 */

import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Platform,
  ActivityIndicator,
  ScrollView,
  Linking,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather, FontAwesome5 } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import * as Location from 'expo-location';
import { useApp } from '../_layout';
import {
  getRotaDoDia,
  getGpsPosition,
  getFrotaMonitoramentoAdmin,
  FrotaMonitoramentoItem,
  Rota,
  Parada,
  calcularDistanciaMetros,
  formatarDistanciaLegivel,
  estimarTempoMinutos,
} from '@/services/api';
import { useGeofencing } from '@/hooks/useGeofencing';
import { Alert } from '@/components/Alert';
import MapViewComponent from '../../components/MapViewComponent';

// Centro padrão: Região de Caruaru / Polo Educacional - PE
const INITIAL_REGION = {
  latitude: -8.2833,
  longitude: -35.9761,
  latitudeDelta: 0.05,
  longitudeDelta: 0.05,
};

const darkMapStyle = [
  { elementType: 'geometry', stylers: [{ color: '#1A253A' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#8F9CAE' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#1A253A' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#1F2C42' }] },
  { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#F5A623' }, { lightness: -40 }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#0F172A' }] },
];

export default function Mapa() {
  const router = useRouter();
  const { theme, userRole, userData, isDark } = useApp();
  const isAdmin = userRole === 'admin';
  const mapRef = useRef<any>(null);
  const [loading, setLoading] = useState(true);
  const [rota, setRota] = useState<Rota | null>(null);
  const [hasCentered, setHasCentered] = useState(false);
  const [busLocation, setBusLocation] = useState<any>(null);
  const [selectedParada, setSelectedParada] = useState<Parada | null>(null);
  const [isTimelineOpen, setIsTimelineOpen] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);
  const [simStep, setSimStep] = useState(0);

  // Estado específico de Monitoramento de Frota (Admin)
  const [frotaAdmin, setFrotaAdmin] = useState<FrotaMonitoramentoItem[]>([]);
  const [selectedRotaFixaId, setSelectedRotaFixaId] = useState<string>('');
  const selectedRotaFixaIdRef = useRef<string>('');
  const [fleetModalVisible, setFleetModalVisible] = useState(false);

  const activeFleetItem = useMemo(() => {
    if (!isAdmin || frotaAdmin.length === 0) return null;
    return frotaAdmin.find((f) => f.rotaFixaId === selectedRotaFixaId) || frotaAdmin[0];
  }, [isAdmin, frotaAdmin, selectedRotaFixaId]);

  // Hook de Geofencing para detecção do aluno
  const {
    currentLocation,
    nearestParada,
    distanceToParada,
    isWithinGeofence,
    hasPermission,
    refresh: refreshGeo,
  } = useGeofencing(rota?.paradas || [], userRole === 'aluno');

  // Inicializa mapa e rota
  useEffect(() => {
    initMaps();
  }, [isAdmin]);

  // Recarrega a rota ao receber foco na tela do Mapa
  useFocusEffect(
    React.useCallback(() => {
      initMaps(true);
    }, [userData?.id, isAdmin])
  );

  // Seleciona a primeira parada por padrão quando a rota carrega
  useEffect(() => {
    if (rota?.paradas && rota.paradas.length > 0 && !selectedParada) {
      setSelectedParada(rota.paradas[0]);
    }
  }, [rota, selectedParada]);

  // Polling regular da posição do ônibus (Admin monitora frota; Aluno/Motorista monitora rota do dia)
  useEffect(() => {
    if (isSimulating) return;
    if (!isAdmin && !rota) return;
    let ativo = true;

    const buscarOnibus = async () => {
      try {
        if (isAdmin) {
          const frotaRes = await getFrotaMonitoramentoAdmin();
          if (!ativo || !frotaRes.success) return;
          setFrotaAdmin(frotaRes.itens);
          const alvo =
            frotaRes.itens.find((f) => f.rotaFixaId === selectedRotaFixaIdRef.current) ||
            frotaRes.itens[0];
          if (alvo) {
            selectedRotaFixaIdRef.current = alvo.rotaFixaId;
            setSelectedRotaFixaId(alvo.rotaFixaId);
            setRota(alvo.rota);
            setBusLocation(alvo.gpsPosicao || null);
          }
          return;
        }

        if (!rota) return;
        const res = await getGpsPosition(rota.id);
        if (ativo && res.success && res.position) {
          setBusLocation(res.position);
        }
      } catch (err) {
        console.log('Erro ao buscar GPS do ônibus:', err);
      }
    };

    buscarOnibus();
    const interval = setInterval(buscarOnibus, isAdmin ? 5000 : 4000);
    return () => {
      ativo = false;
      clearInterval(interval);
    };
  }, [isAdmin, rota?.id, isSimulating]);

  // Modo de simulação: anima o ônibus percorrendo as paradas sequencialmente
  useEffect(() => {
    if (!isSimulating || !rota?.paradas || rota.paradas.length < 2) return;

    // Gera pontos intermediários entre as paradas para movimento suave
    const points: { latitude: number; longitude: number }[] = [];
    const paradas = rota.paradas;

    for (let i = 0; i < paradas.length - 1; i++) {
      const p1 = paradas[i];
      const p2 = paradas[i + 1];
      const stepsBetween = 4;
      for (let s = 0; s < stepsBetween; s++) {
        const t = s / stepsBetween;
        points.push({
          latitude: p1.latitude + (p2.latitude - p1.latitude) * t,
          longitude: p1.longitude + (p2.longitude - p1.longitude) * t,
        });
      }
    }
    // Adiciona o destino final
    const last = paradas[paradas.length - 1];
    points.push({ latitude: last.latitude, longitude: last.longitude });

    const simTimer = setInterval(() => {
      setSimStep((prev) => {
        const next = (prev + 1) % points.length;
        const currentCoord = points[next];
        setBusLocation(currentCoord);
        return next;
      });
    }, 2500);

    return () => clearInterval(simTimer);
  }, [isSimulating, rota]);

  const centralizarMapaNaRota = (
    rotaAlvo: Rota,
    gpsAlvo?: { latitude: number; longitude: number } | null
  ) => {
    const primeira = rotaAlvo.paradas?.[0];
    const pontoFoco = gpsAlvo?.latitude != null ? gpsAlvo : primeira;
    if (!pontoFoco) return;

    if (mapRef.current?.fitToCoordinates && rotaAlvo.paradas && rotaAlvo.paradas.length > 1) {
      const coords = rotaAlvo.paradas.map((p) => ({
        latitude: Number(p.latitude),
        longitude: Number(p.longitude),
      }));
      if (gpsAlvo?.latitude != null) {
        coords.push({ latitude: Number(gpsAlvo.latitude), longitude: Number(gpsAlvo.longitude) });
      }
      mapRef.current.fitToCoordinates(coords);
    } else if (mapRef.current?.animateToRegion) {
      mapRef.current.animateToRegion(
        {
          latitude: Number(pontoFoco.latitude),
          longitude: Number(pontoFoco.longitude),
          latitudeDelta: 0.04,
          longitudeDelta: 0.04,
        },
        600
      );
    } else if (mapRef.current?.panTo) {
      mapRef.current.panTo(Number(pontoFoco.latitude), Number(pontoFoco.longitude));
    }
  };

  const initMaps = async (silencioso = false) => {
    if (!silencioso) setLoading(true);
    try {
      if (isAdmin) {
        const frotaRes = await getFrotaMonitoramentoAdmin();
        if (frotaRes.success) {
          setFrotaAdmin(frotaRes.itens);
          const alvo =
            frotaRes.itens.find((f) => f.rotaFixaId === selectedRotaFixaIdRef.current) ||
            frotaRes.itens[0];
          if (alvo) {
            selectedRotaFixaIdRef.current = alvo.rotaFixaId;
            setSelectedRotaFixaId(alvo.rotaFixaId);
            setRota(alvo.rota);
            setBusLocation(alvo.gpsPosicao || null);
            setSelectedParada(alvo.rota.paradas?.[0] || null);
            if (!silencioso) {
              centralizarMapaNaRota(alvo.rota, alvo.gpsPosicao);
            }
          } else {
            setRota(null);
            setBusLocation(null);
          }
        }
        if (!silencioso) setLoading(false);
        return;
      }

      const result = await getRotaDoDia(userRole === 'aluno' ? userData?.id : undefined);
      if (result.success && result.rota) {
        setRota(result.rota);
        if (result.rota.paradas && result.rota.paradas.length > 0) {
          setSelectedParada(result.rota.paradas[0]);
          centralizarMapaNaRota(result.rota);
        }
      }
    } catch (error) {
      console.log('Erro ao carregar rota');
    }
    if (!silencioso) setLoading(false);
  };

  const handleSelecionarLinhaFrota = (item: FrotaMonitoramentoItem) => {
    setFleetModalVisible(false);
    selectedRotaFixaIdRef.current = item.rotaFixaId;
    setSelectedRotaFixaId(item.rotaFixaId);
    setRota(item.rota);
    setBusLocation(item.gpsPosicao || null);
    setSelectedParada(item.rota.paradas?.[0] || null);
    centralizarMapaNaRota(item.rota, item.gpsPosicao);
  };

  // Cálculo da distância e tempo estimado do ônibus até a parada selecionada
  const busMetrics = useMemo(() => {
    if (!busLocation || !selectedParada) {
      return { distanciaMetros: null, tempoTexto: '--', distanciaTexto: '--' };
    }
    const distancia = calcularDistanciaMetros(
      busLocation.latitude,
      busLocation.longitude,
      selectedParada.latitude,
      selectedParada.longitude
    );
    return {
      distanciaMetros: distancia,
      distanciaTexto: formatarDistanciaLegivel(distancia),
      tempoTexto: estimarTempoMinutos(distancia),
    };
  }, [busLocation, selectedParada]);

  // Alerta de proximidade do ônibus (menos de 500m)
  const isBusApproachingSelected = useMemo(() => {
    return busMetrics.distanciaMetros !== null && busMetrics.distanciaMetros <= 500;
  }, [busMetrics.distanciaMetros]);

  // Ações nos botões do mapa
  const focusBus = () => {
    if (busLocation && mapRef.current) {
      mapRef.current.animateToRegion?.(
        {
          latitude: Number(busLocation.latitude),
          longitude: Number(busLocation.longitude),
          latitudeDelta: 0.008,
          longitudeDelta: 0.008,
        },
        800
      );
    } else if (isAdmin) {
      Alert.alert(
        'GPS Offline',
        'O motorista desta linha ainda não iniciou a viagem ou não transmitiu coordenadas hoje.'
      );
    } else {
      Alert.alert(
        'Ônibus Não Localizado',
        'O motorista ainda não iniciou a transmissão de GPS hoje. Gostaria de ativar o "Modo Simulação" para testar a rota?',
        [
          { text: 'Agora não', style: 'cancel' },
          { text: 'Sim, Simular', onPress: () => toggleSimulacao() },
        ]
      );
    }
  };

  const focusUser = async () => {
    if (currentLocation && mapRef.current) {
      mapRef.current.animateToRegion?.(
        {
          latitude: currentLocation.coords.latitude,
          longitude: currentLocation.coords.longitude,
          latitudeDelta: 0.008,
          longitudeDelta: 0.008,
        },
        800
      );
      return;
    }

    // Solicita permissão se ainda não tiver
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
        if (mapRef.current) {
          mapRef.current.animateToRegion?.(
            {
              latitude: loc.coords.latitude,
              longitude: loc.coords.longitude,
              latitudeDelta: 0.008,
              longitudeDelta: 0.008,
            },
            800
          );
        }
      } else {
        Alert.alert('Permissão de Localização', 'Ative o GPS nas configurações do seu aparelho para ver sua posição no mapa.');
      }
    } catch (e) {
      Alert.alert('GPS Indisponível', 'Não foi possível obter sua localização atual.');
    }
  };

  const fitFullRoute = () => {
    if (!rota?.paradas || !mapRef.current) return;
    const coords = rota.paradas.map((p) => ({ latitude: Number(p.latitude), longitude: Number(p.longitude) }));
    if (busLocation) {
      coords.push({ latitude: Number(busLocation.latitude), longitude: Number(busLocation.longitude) });
    }
    if (typeof mapRef.current.fitToCoordinates === 'function') {
      mapRef.current.fitToCoordinates(coords);
    } else if (typeof mapRef.current.animateToRegion === 'function') {
      mapRef.current.animateToRegion(INITIAL_REGION, 800);
    }
  };

  const handleSelectParada = (parada: Parada) => {
    setSelectedParada(parada);
    if (mapRef.current) {
      mapRef.current.animateToRegion?.(
        {
          latitude: Number(parada.latitude),
          longitude: Number(parada.longitude),
          latitudeDelta: 0.009,
          longitudeDelta: 0.009,
        },
        600
      );
    }
  };

  const toggleSimulacao = () => {
    if (!isSimulating) {
      setIsSimulating(true);
      if (rota?.paradas && rota.paradas.length > 0) {
        setBusLocation({
          latitude: rota.paradas[0].latitude,
          longitude: rota.paradas[0].longitude,
        });
      }
    } else {
      setIsSimulating(false);
    }
  };

  const handleOpenExternalGps = (parada: Parada) => {
    const lat = parada.latitude;
    const lng = parada.longitude;
    const label = encodeURIComponent(parada.nome);
    const url = Platform.select({
      ios: `maps:0,0?q=${label}@${lat},${lng}`,
      android: `geo:0,0?q=${lat},${lng}(${label})`,
      default: `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`,
    });
    Linking.openURL(url as string).catch(() => {
      Linking.openURL(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`);
    });
  };

  const handleRefresh = async () => {
    await initMaps(true);
    if (!isAdmin) {
      await refreshGeo();
    }
    fitFullRoute();
  };

  const formatarHoraGps = (timestamp?: number) => {
    if (!timestamp) return null;
    return new Date(timestamp).toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const corStatusRota = (status?: Rota['status']) => {
    if (status === 'em_andamento') return '#10B981';
    if (status === 'encerrada') return '#64748B';
    return '#F59E0B';
  };

  const labelStatusRota = (status?: Rota['status']) => {
    if (status === 'em_andamento') return 'Em andamento';
    if (status === 'encerrada') return 'Encerrada';
    return 'Agendada';
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.bg }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.gold} />
          <Text style={[styles.loadingText, { color: theme.subtext }]}>Carregando mapa da rota...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.bg }]}>

      {/* Componente de Mapa Nativo / Web */}
      <MapViewComponent
        mapRef={mapRef}
        theme={theme}
        isDark={isDark}
        hasPermission={hasPermission}
        rota={rota}
        busLocation={busLocation}
        INITIAL_REGION={INITIAL_REGION}
        darkMapStyle={darkMapStyle}
        selectedParada={selectedParada}
        onSelectParada={handleSelectParada}
        onSelectBus={focusBus}
      />

      {/* Top Header Flutuante: Monitoramento de Frota (Admin) ou Status + Simulação (Aluno/Motorista) */}
      <View style={styles.topHeader}>
        {isAdmin ? (
          <>
            <TouchableOpacity
              style={[styles.statusCard, { backgroundColor: theme.card, borderColor: theme.border }]}
              onPress={() => setFleetModalVisible(true)}
              activeOpacity={0.85}
            >
              <View style={styles.statusRow}>
                <View
                  style={[
                    styles.statusIndicator,
                    { backgroundColor: busLocation ? '#10B981' : corStatusRota(activeFleetItem?.rota.status) },
                  ]}
                />
                <View style={{ flex: 1, marginLeft: 8 }}>
                  <Text style={[styles.statusTitle, { color: theme.text }]} numberOfLines={1}>
                    {activeFleetItem?.rota.nome || 'Monitoramento da Frota'}
                  </Text>
                  <Text style={[styles.statusSubtitle, { color: theme.subtext }]} numberOfLines={1}>
                    {activeFleetItem
                      ? `Mot: ${activeFleetItem.motoristaNome}${activeFleetItem.veiculoPlaca ? ` • ${activeFleetItem.veiculoPlaca}` : ''}`
                      : 'Nenhuma linha ativa cadastrada'}
                  </Text>
                </View>
                <Feather name="chevron-down" size={16} color={theme.gold} style={{ marginLeft: 6 }} />
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.simToggleBtn,
                { backgroundColor: theme.card, borderColor: theme.border },
              ]}
              onPress={() => setFleetModalVisible(true)}
            >
              <Feather name="layers" size={15} color={theme.gold} />
              <Text style={[styles.simToggleText, { color: theme.text }]}>
                Frota ({frotaAdmin.length})
              </Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <View style={[styles.statusCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
              <View style={styles.statusRow}>
                <View
                  style={[
                    styles.statusIndicator,
                    { backgroundColor: busLocation || isSimulating ? '#10B981' : '#F59E0B' },
                  ]}
                />
                <View style={{ flex: 1, marginLeft: 8 }}>
                  <Text style={[styles.statusTitle, { color: theme.text }]} numberOfLines={1}>
                    {rota?.nome || 'Linha Escolar'}
                  </Text>
                  <Text style={[styles.statusSubtitle, { color: theme.subtext }]} numberOfLines={1}>
                    {isSimulating
                      ? 'Simulação ao vivo ativa'
                      : busLocation
                      ? 'Ônibus em trânsito'
                      : 'Aguardando início do trajeto'}
                  </Text>
                </View>
              </View>
            </View>

            {/* Botão de Toggle de Simulação (Ideal para testes e apresentações) */}
            <TouchableOpacity
              style={[
                styles.simToggleBtn,
                {
                  backgroundColor: isSimulating ? theme.gold : theme.card,
                  borderColor: isSimulating ? theme.gold : theme.border,
                },
              ]}
              onPress={toggleSimulacao}
            >
              <Feather
                name={isSimulating ? 'pause' : 'play'}
                size={16}
                color={isSimulating ? '#1A253A' : theme.gold}
              />
              <Text
                style={[
                  styles.simToggleText,
                  { color: isSimulating ? '#1A253A' : theme.text },
                ]}
              >
                {isSimulating ? 'Pausar Teste' : 'Simular'}
              </Text>
            </TouchableOpacity>
          </>
        )}
      </View>

      {/* Banner de Geofencing / Alerta de Proximidade (apenas Aluno) */}
      {userRole === 'aluno' && (isBusApproachingSelected || isWithinGeofence) && (
        <View style={[styles.geofenceAlert, { backgroundColor: '#10B981' }]}>
          <Feather name="bell" size={18} color="#FFFFFF" />
          <Text style={styles.geofenceAlertText}>
            Ônibus a {busMetrics.distanciaTexto} de {selectedParada?.nome || 'sua parada'}!
          </Text>
        </View>
      )}

      {/* Botões Flutuantes de Ações Rápidas no Mapa */}
      <View style={styles.floatingControls}>
        <TouchableOpacity
          style={[styles.floatingBtn, { backgroundColor: theme.card, borderColor: theme.border }]}
          onPress={focusBus}
          accessibilityLabel="Centralizar no Ônibus"
        >
          <FontAwesome5 name="bus" size={16} color={busLocation ? theme.gold : theme.subtext} />
        </TouchableOpacity>

        {!isAdmin && (
          <TouchableOpacity
            style={[styles.floatingBtn, { backgroundColor: theme.card, borderColor: theme.border }]}
            onPress={focusUser}
            accessibilityLabel="Minha Localização"
          >
            <Feather name="crosshair" size={18} color={theme.gold} />
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={[styles.floatingBtn, { backgroundColor: theme.card, borderColor: theme.border }]}
          onPress={fitFullRoute}
          accessibilityLabel="Ver Rota Completa"
        >
          <Feather name="maximize-2" size={18} color={theme.text} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.floatingBtn, { backgroundColor: theme.card, borderColor: theme.border }]}
          onPress={handleRefresh}
          accessibilityLabel="Atualizar Dados"
        >
          <Feather name="refresh-cw" size={16} color={theme.gold} />
        </TouchableOpacity>
      </View>

      {/* Card Inferior Inteligente e Deslizável */}
      <View
        style={[
          styles.bottomSheet,
          {
            backgroundColor: theme.card,
            borderColor: theme.border,
            maxHeight: isTimelineOpen ? 420 : 210,
          },
        ]}
      >
        {/* Puxador da Gaveta */}
        <TouchableOpacity
          style={styles.sheetHandleArea}
          onPress={() => setIsTimelineOpen(!isTimelineOpen)}
        >
          <View style={[styles.sheetHandleBar, { backgroundColor: theme.border }]} />
        </TouchableOpacity>

        {/* Resumo Operacional (Admin) ou Parada Selecionada (Aluno/Motorista) */}
        <View style={styles.sheetHeader}>
          {isAdmin ? (
            <>
              <View style={{ flex: 1 }}>
                <View style={styles.badgeRow}>
                  <View
                    style={[
                      styles.pillBadge,
                      { backgroundColor: `${corStatusRota(activeFleetItem?.rota.status)}22` },
                    ]}
                  >
                    <Feather
                      name="radio"
                      size={12}
                      color={corStatusRota(activeFleetItem?.rota.status)}
                    />
                    <Text
                      style={[
                        styles.pillBadgeText,
                        { color: corStatusRota(activeFleetItem?.rota.status) },
                      ]}
                    >
                      {labelStatusRota(activeFleetItem?.rota.status)}
                    </Text>
                  </View>
                  <Text style={[styles.etaBadgeText, { color: theme.subtext }]}>
                    {busLocation?.timestamp
                      ? `GPS: ${formatarHoraGps(busLocation.timestamp)}`
                      : busLocation
                      ? 'GPS conectado'
                      : 'Sem sinal GPS hoje'}
                  </Text>
                </View>

                <Text style={[styles.paradaNome, { color: theme.text }]} numberOfLines={1}>
                  {activeFleetItem?.rota.nome || 'Nenhuma linha ativa'}
                </Text>
                <Text style={[styles.paradaEndereco, { color: theme.subtext }]} numberOfLines={1}>
                  {activeFleetItem
                    ? `${activeFleetItem.rota.escola || 'Sem destino'} • Mot: ${activeFleetItem.motoristaNome}`
                    : 'Cadastre uma rota em Gerenciar Rotas'}
                </Text>
              </View>

              <TouchableOpacity
                style={[styles.navBtn, { backgroundColor: theme.gold }]}
                onPress={() => router.push('/admin/gerenciar-rotas')}
              >
                <Feather name="sliders" size={16} color="#1A253A" />
                <Text style={styles.navBtnText}>Gerenciar</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <View style={{ flex: 1 }}>
                <View style={styles.badgeRow}>
                  <View style={[styles.pillBadge, { backgroundColor: 'rgba(245, 166, 35, 0.15)' }]}>
                    <Feather name="map-pin" size={12} color={theme.gold} />
                    <Text style={[styles.pillBadgeText, { color: theme.gold }]}>
                      {selectedParada?.nome.toLowerCase().includes('escola') ||
                      selectedParada?.nome.toLowerCase().includes('nassau')
                        ? 'Destino Final'
                        : 'Ponto de Parada'}
                    </Text>
                  </View>
                  {busLocation && (
                    <Text style={[styles.etaBadgeText, { color: theme.subtext }]}>
                      Chegada em {busMetrics.tempoTexto}
                    </Text>
                  )}
                </View>

                <Text style={[styles.paradaNome, { color: theme.text }]} numberOfLines={1}>
                  {selectedParada?.nome || 'Selecione uma parada no mapa'}
                </Text>
                <Text style={[styles.paradaEndereco, { color: theme.subtext }]} numberOfLines={1}>
                  {selectedParada?.endereco || 'Toque em qualquer marcador para ver os detalhes'}
                </Text>
              </View>

              {/* Botão de Navegar no Google Maps Externo */}
              {selectedParada && (
                <TouchableOpacity
                  style={[styles.navBtn, { backgroundColor: theme.gold }]}
                  onPress={() => handleOpenExternalGps(selectedParada)}
                >
                  <Feather name="navigation" size={18} color="#1A253A" />
                  <Text style={styles.navBtnText}>Como Chegar</Text>
                </TouchableOpacity>
              )}
            </>
          )}
        </View>

        {/* Estatísticas Rápidas */}
        <View style={[styles.statsRow, { borderTopColor: theme.border }]}>
          <View style={styles.statItem}>
            <Text style={[styles.statLabel, { color: theme.subtext }]}>
              {isAdmin ? 'Sinal GPS' : 'Distância do Ônibus'}
            </Text>
            <Text
              style={[
                styles.statValue,
                { color: isAdmin ? (busLocation ? '#10B981' : theme.subtext) : theme.gold },
              ]}
            >
              {isAdmin
                ? busLocation
                  ? formatarHoraGps(busLocation.timestamp) || 'Ao vivo'
                  : 'Offline'
                : busMetrics.distanciaTexto}
            </Text>
          </View>
          <View style={[styles.statDivider, { backgroundColor: theme.border }]} />
          <View style={styles.statItem}>
            <Text style={[styles.statLabel, { color: theme.subtext }]}>
              {isAdmin ? 'Saída / Veículo' : 'Horário Previsto'}
            </Text>
            <Text style={[styles.statValue, { color: theme.text }]}>
              {isAdmin
                ? `${rota?.horario || '--:--'}${activeFleetItem?.veiculoPlaca ? ` • ${activeFleetItem.veiculoPlaca}` : ''}`
                : rota?.horario || '17:45'}
            </Text>
          </View>
          <View style={[styles.statDivider, { backgroundColor: theme.border }]} />
          <TouchableOpacity
            style={styles.statItem}
            onPress={() => setIsTimelineOpen(!isTimelineOpen)}
          >
            <Text style={[styles.statLabel, { color: theme.subtext }]}>
              {isAdmin ? 'Paradas / Alunos' : 'Paradas da Linha'}
            </Text>
            <View style={styles.toggleRow}>
              <Text style={[styles.statValue, { color: theme.gold }]}>
                {isAdmin
                  ? `${rota?.paradas.length || 0} pts • ${activeFleetItem?.alunosQtd ?? 0} al.`
                  : `${rota?.paradas.length || 0} pontos`}
              </Text>
              <Feather
                name={isTimelineOpen ? 'chevron-down' : 'chevron-up'}
                size={16}
                color={theme.gold}
              />
            </View>
          </TouchableOpacity>
        </View>

        {/* Timeline Expansível com Todas as Paradas em Sequência */}
        {isTimelineOpen && (
          <ScrollView style={styles.timelineScroll} showsVerticalScrollIndicator={false}>
            <Text style={[styles.timelineTitle, { color: theme.text }]}>
              Itinerário Completo da Rota
            </Text>
            {rota?.paradas.map((item, index) => {
              const isSelected = selectedParada?.id === item.id;
              const isEscola =
                index === (rota.paradas.length - 1) ||
                item.nome.toLowerCase().includes('escola') ||
                item.nome.toLowerCase().includes('nassau');

              return (
                <TouchableOpacity
                  key={item.id || `stop-${index}`}
                  style={[
                    styles.timelineItem,
                    isSelected && { backgroundColor: 'rgba(245, 166, 35, 0.08)', borderRadius: 12 },
                  ]}
                  onPress={() => handleSelectParada(item)}
                >
                  <View style={styles.timelineLeft}>
                    <View
                      style={[
                        styles.timelineDot,
                        {
                          backgroundColor: isSelected
                            ? theme.gold
                            : isEscola
                            ? '#10B981'
                            : theme.subtext,
                        },
                      ]}
                    >
                      <Text style={styles.timelineDotText}>
                        {isEscola ? '★' : `${index + 1}`}
                      </Text>
                    </View>
                    {index < rota.paradas.length - 1 && (
                      <View style={[styles.timelineLine, { backgroundColor: theme.border }]} />
                    )}
                  </View>

                  <View style={styles.timelineInfo}>
                    <Text
                      style={[
                        styles.timelineItemName,
                        { color: isSelected ? theme.gold : theme.text, fontWeight: isSelected ? '700' : '500' },
                      ]}
                    >
                      {item.nome}
                    </Text>
                    <Text style={[styles.timelineItemEndereco, { color: theme.subtext }]} numberOfLines={1}>
                      {item.endereco}
                    </Text>
                  </View>

                  {!isAdmin && (
                    <TouchableOpacity
                      style={styles.timelineActionBtn}
                      onPress={() => handleOpenExternalGps(item)}
                    >
                      <Feather name="external-link" size={16} color={theme.gold} />
                    </TouchableOpacity>
                  )}
                </TouchableOpacity>
              );
            })}
            <View style={{ height: 20 }} />
          </ScrollView>
        )}
      </View>

      {/* Modal Seletor de Frota (Exclusivo Admin) */}
      <Modal
        visible={fleetModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setFleetModalVisible(false)}
      >
        <View style={styles.fleetModalOverlay}>
          <View style={[styles.fleetModalCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <View style={styles.fleetModalHeader}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.fleetModalTitle, { color: theme.text }]}>
                  Monitoramento da Frota
                </Text>
                <Text style={[styles.fleetModalSub, { color: theme.subtext }]}>
                  {frotaAdmin.filter((f) => f.rota.status === 'em_andamento').length} em andamento • {frotaAdmin.length} linha(s) ativa(s)
                </Text>
              </View>
              <TouchableOpacity onPress={() => setFleetModalVisible(false)} style={{ padding: 6 }}>
                <Feather name="x" size={22} color={theme.subtext} />
              </TouchableOpacity>
            </View>

            <ScrollView style={{ maxHeight: 380, marginTop: 10 }}>
              {frotaAdmin.length === 0 ? (
                <Text style={[styles.fleetEmptyText, { color: theme.subtext }]}>
                  Nenhuma linha ativa encontrada no sistema.
                </Text>
              ) : (
                frotaAdmin.map((item) => {
                  const selecionada = item.rotaFixaId === activeFleetItem?.rotaFixaId;
                  const corStatus = corStatusRota(item.rota.status);
                  return (
                    <TouchableOpacity
                      key={item.rotaFixaId}
                      style={[
                        styles.fleetItemCard,
                        {
                          backgroundColor: theme.inputBg,
                          borderColor: selecionada ? theme.gold : theme.border,
                        },
                        selecionada && { borderWidth: 2 },
                      ]}
                      onPress={() => handleSelecionarLinhaFrota(item)}
                    >
                      <View style={styles.fleetItemTop}>
                        <Text style={[styles.fleetItemName, { color: selecionada ? theme.gold : theme.text }]} numberOfLines={1}>
                          {item.rota.nome}
                        </Text>
                        <View style={[styles.fleetStatusBadge, { backgroundColor: `${corStatus}22` }]}>
                          <Text style={[styles.fleetStatusText, { color: corStatus }]}>
                            {labelStatusRota(item.rota.status)}
                          </Text>
                        </View>
                      </View>

                      <Text style={[styles.fleetItemMeta, { color: theme.subtext }]} numberOfLines={1}>
                        {item.rota.escola || 'Sem destino'} • Saída {item.rota.horario} • {item.alunosQtd} aluno(s)
                      </Text>

                      <View style={styles.fleetItemFooter}>
                        <Text style={[styles.fleetItemDriver, { color: theme.text }]} numberOfLines={1}>
                          Mot: {item.motoristaNome}{item.veiculoPlaca ? ` • ${item.veiculoPlaca}` : ''}
                        </Text>
                        <Text
                          style={[
                            styles.fleetItemGps,
                            { color: item.gpsPosicao ? '#10B981' : theme.subtext },
                          ]}
                        >
                          {item.gpsPosicao
                            ? `GPS ${formatarHoraGps(item.gpsPosicao.timestamp) || 'ao vivo'}`
                            : 'Sem GPS'}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  );
                })
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { fontSize: 16, marginTop: 12 },

  // Top Header Flutuante
  topHeader: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 20,
    left: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    zIndex: 20,
  },
  statusCard: {
    flex: 1,
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  statusTitle: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  statusSubtitle: {
    fontSize: 11,
    marginTop: 1,
  },
  simToggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 18,
    borderWidth: 1,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    gap: 6,
  },
  simToggleText: {
    fontSize: 12,
    fontWeight: 'bold',
  },

  // Alerta de Proximidade Geofencing
  geofenceAlert: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 115 : 85,
    left: 20,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 14,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    zIndex: 25,
    gap: 8,
  },
  geofenceAlertText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: 'bold',
  },

  // Botões Flutuantes na lateral direita
  floatingControls: {
    position: 'absolute',
    right: 16,
    top: Platform.OS === 'ios' ? 140 : 100,
    gap: 10,
    zIndex: 15,
  },
  floatingBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
  },

  // Card Inferior / Bottom Sheet
  bottomSheet: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 90 : 85,
    left: 14,
    right: 14,
    borderRadius: 24,
    paddingHorizontal: 18,
    paddingBottom: 12,
    borderWidth: 1,
    elevation: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    zIndex: 20,
  },
  sheetHandleArea: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  sheetHandleBar: {
    width: 38,
    height: 4,
    borderRadius: 2,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 10,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  pillBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    gap: 4,
  },
  pillBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  etaBadgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  paradaNome: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  paradaEndereco: {
    fontSize: 12,
    marginTop: 2,
  },
  navBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 14,
    marginLeft: 10,
    gap: 6,
  },
  navBtnText: {
    color: '#1A253A',
    fontSize: 12,
    fontWeight: 'bold',
  },

  // Estatísticas Rápidas
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingTop: 10,
    borderTopWidth: 1,
  },
  statItem: {
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    height: 24,
  },
  statLabel: {
    fontSize: 10,
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  statValue: {
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 2,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },

  // Itinerário Timeline
  timelineScroll: {
    marginTop: 12,
    maxHeight: 210,
  },
  timelineTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  timelineItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 6,
  },
  timelineLeft: {
    alignItems: 'center',
    width: 28,
  },
  timelineDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  timelineDotText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  timelineLine: {
    width: 2,
    height: 20,
    marginTop: 2,
  },
  timelineInfo: {
    flex: 1,
    marginLeft: 10,
  },
  timelineItemName: {
    fontSize: 13,
  },
  timelineItemEndereco: {
    fontSize: 11,
    marginTop: 1,
  },
  timelineActionBtn: {
    padding: 6,
  },
  fleetModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
    padding: 16,
  },
  fleetModalCard: {
    borderRadius: 22,
    padding: 18,
    borderWidth: 1,
  },
  fleetModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  fleetModalTitle: {
    fontSize: 17,
    fontWeight: 'bold',
  },
  fleetModalSub: {
    fontSize: 12,
    marginTop: 2,
  },
  fleetEmptyText: {
    fontSize: 13,
    textAlign: 'center',
    paddingVertical: 24,
  },
  fleetItemCard: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 12,
    marginBottom: 10,
  },
  fleetItemTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  fleetItemName: {
    fontSize: 14,
    fontWeight: 'bold',
    flex: 1,
  },
  fleetStatusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  fleetStatusText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  fleetItemMeta: {
    fontSize: 12,
    marginTop: 4,
  },
  fleetItemFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 6,
    gap: 8,
  },
  fleetItemDriver: {
    fontSize: 11,
    fontWeight: '600',
    flex: 1,
  },
  fleetItemGps: {
    fontSize: 11,
    fontWeight: 'bold',
  },
});