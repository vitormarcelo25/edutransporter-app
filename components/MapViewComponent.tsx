import React, { useEffect, useMemo, useRef, useState } from 'react';
import MapView, { Marker, Polyline } from 'react-native-maps';
import { View, Text, StyleSheet } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import {
  Coord,
  calcularBearing,
  calcularDistanciasAcumuladas,
  dividirRotaNaDistancia,
  lerpAngle,
  lerpCoord,
  projetarPosicaoNaRota,
  useRoadRoute,
} from '@/services/routeGeometry';

interface MapProps {
  mapRef?: React.RefObject<any>;
  theme: any;
  isDark: boolean;
  hasPermission?: boolean;
  rota?: any;
  roadPath?: Coord[];
  autoFit?: boolean;
  busLocation?: any;
  INITIAL_REGION: any;
  darkMapStyle: any;
  selectedParada?: any;
  onSelectParada?: (parada: any) => void;
  onSelectBus?: () => void;
  onMapPress?: (coord: { latitude: number; longitude: number }) => void;
}

export default function MapViewComponent({
  mapRef,
  theme,
  isDark,
  hasPermission = false,
  rota,
  roadPath,
  autoFit = true,
  busLocation,
  INITIAL_REGION,
  darkMapStyle,
  selectedParada,
  onSelectParada,
  onSelectBus,
  onMapPress,
}: MapProps) {
  const paradas: any[] = rota?.paradas || [];
  const { roadPath: effectiveRoadPath } = useRoadRoute(rota?.paradas, roadPath, 150);

  const fullPath: Coord[] = useMemo(() => {
    if (effectiveRoadPath && effectiveRoadPath.length >= 2) return effectiveRoadPath;
    return paradas
      .map((p: any) => ({ latitude: Number(p.latitude), longitude: Number(p.longitude) }))
      .filter((p) => Number.isFinite(p.latitude) && Number.isFinite(p.longitude));
  }, [effectiveRoadPath, paradas]);

  const cumDist = useMemo(() => calcularDistanciasAcumuladas(fullPath), [fullPath]);

  const [animState, setAnimState] = useState<{
    coord: Coord;
    heading: number;
    traversed: Coord[];
    remaining: Coord[];
  } | null>(null);

  const animFrameRef = useRef<number | null>(null);
  const progressRef = useRef<{
    routeSig: string;
    distMeters: number;
    bearing: number;
    rawCoord: Coord;
    lastTimestamp: number;
  } | null>(null);

  useEffect(() => {
    if (animFrameRef.current != null) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }

    const temPosicao = busLocation && busLocation.latitude != null && busLocation.longitude != null;
    if (!temPosicao) {
      progressRef.current = null;
      setAnimState(null);
      return;
    }

    const rawTarget: Coord = {
      latitude: Number(busLocation.latitude),
      longitude: Number(busLocation.longitude),
    };
    const routeSig = `${rota?.id || ''}_${fullPath.length}`;
    const targetProj = projetarPosicaoNaRota(rawTarget, fullPath, cumDist);
    const offRoute = fullPath.length < 2 || targetProj.distToRoadMeters > 150;

    const prev = progressRef.current;
    const now = Date.now();
    const reiniciouLoop = prev && targetProj.distAlongMeters < prev.distMeters - 300;

    if (!prev || prev.routeSig !== routeSig || reiniciouLoop || fullPath.length < 2) {
      const split = dividirRotaNaDistancia(fullPath, cumDist, targetProj.distAlongMeters);
      const coordIni = offRoute ? rawTarget : split.coord;
      const headingIni = offRoute
        ? prev
          ? calcularBearing(prev.rawCoord, rawTarget)
          : 0
        : split.bearing;

      progressRef.current = {
        routeSig,
        distMeters: targetProj.distAlongMeters,
        bearing: headingIni,
        rawCoord: rawTarget,
        lastTimestamp: now,
      };
      setAnimState({
        coord: coordIni,
        heading: headingIni,
        traversed: fullPath.length >= 2 ? split.traversed : [],
        remaining: fullPath.length >= 2 ? split.remaining : [],
      });
      return;
    }

    const startDist = prev.distMeters;
    const endDist = targetProj.distAlongMeters;
    const startRaw = prev.rawCoord;
    const startBearing = prev.bearing;
    const endBearing = offRoute
      ? calcularBearing(startRaw, rawTarget) || startBearing
      : targetProj.bearing;
    const deltaTempo = now - prev.lastTimestamp;
    const duracao = Math.min(Math.max(deltaTempo > 50 ? deltaTempo * 0.9 : 340, 280), 1200);
    const startTime = now;
    let lastRender = 0;

    const tick = () => {
      const tNow = Date.now();
      const elapsed = tNow - startTime;
      const t = Math.min(1, elapsed / duracao);

      if (t === 1 || tNow - lastRender >= 45) {
        lastRender = tNow;
        const curDist = startDist + (endDist - startDist) * t;
        const split = dividirRotaNaDistancia(fullPath, cumDist, curDist);
        const coordFrame = offRoute ? lerpCoord(startRaw, rawTarget, t) : split.coord;
        const headingFrame = offRoute ? lerpAngle(startBearing, endBearing, t) : split.bearing;

        progressRef.current = {
          routeSig,
          distMeters: curDist,
          bearing: headingFrame,
          rawCoord: lerpCoord(startRaw, rawTarget, t),
          lastTimestamp: tNow,
        };
        setAnimState({
          coord: coordFrame,
          heading: headingFrame,
          traversed: split.traversed,
          remaining: split.remaining,
        });
      }

      if (t < 1) {
        animFrameRef.current = requestAnimationFrame(tick);
      } else {
        animFrameRef.current = null;
      }
    };

    animFrameRef.current = requestAnimationFrame(tick);
    return () => {
      if (animFrameRef.current != null) {
        cancelAnimationFrame(animFrameRef.current);
        animFrameRef.current = null;
      }
    };
  }, [busLocation, fullPath, cumDist, rota?.id]);

  const handleMapReady = () => {
    if (!autoFit) return;
    const ptsFit = fullPath.length > 0 ? fullPath : paradas;
    if (mapRef?.current && ptsFit.length > 1) {
      const coords = ptsFit.map((p: any) => ({
        latitude: Number(p.latitude),
        longitude: Number(p.longitude),
      }));
      if (busLocation && busLocation.latitude != null) {
        coords.push({ latitude: Number(busLocation.latitude), longitude: Number(busLocation.longitude) });
      }
      mapRef.current.fitToCoordinates(coords, {
        edgePadding: { top: 80, right: 50, bottom: 200, left: 50 },
        animated: true,
      });
    } else if (mapRef?.current && ptsFit.length === 1) {
      mapRef.current.animateToRegion(
        {
          latitude: Number(ptsFit[0].latitude),
          longitude: Number(ptsFit[0].longitude),
          latitudeDelta: 0.02,
          longitudeDelta: 0.02,
        },
        500
      );
    }
  };

  const remainingLine = animState ? animState.remaining : fullPath;
  const traversedLine = animState ? animState.traversed : [];

  return (
    <MapView
      ref={mapRef}
      style={styles.mapContainer}
      initialRegion={INITIAL_REGION}
      customMapStyle={isDark ? darkMapStyle : []}
      showsUserLocation={hasPermission}
      showsMyLocationButton={false}
      onMapReady={handleMapReady}
      onPress={(e) => {
        if (onMapPress && e.nativeEvent?.coordinate) {
          onMapPress(e.nativeEvent.coordinate);
        }
      }}
    >
      {/* Trecho já percorrido em cinza apagado */}
      {traversedLine.length > 1 && (
        <Polyline
          coordinates={traversedLine}
          strokeColor={isDark ? 'rgba(100, 116, 139, 0.55)' : 'rgba(148, 163, 184, 0.7)'}
          strokeWidth={4}
          zIndex={1}
        />
      )}

      {/* Halo da estrada restante */}
      {remainingLine.length > 1 && (
        <Polyline
          coordinates={remainingLine}
          strokeColor={isDark ? '#0F172A' : '#CBD5E1'}
          strokeWidth={7}
          zIndex={2}
        />
      )}

      {/* Estrada restante destacada que diminui conforme o ônibus avança */}
      {remainingLine.length > 1 && (
        <Polyline
          coordinates={remainingLine}
          strokeColor={theme.gold}
          strokeWidth={4.5}
          zIndex={3}
        />
      )}

      {/* Marcadores das Paradas e Escola */}
      {paradas.map((parada: any, idx: number) => {
        const isEscola = idx === paradas.length - 1 || parada.nome.toLowerCase().includes('escola') || parada.nome.toLowerCase().includes('nassau');
        const isSelected = selectedParada?.id === parada.id;

        return (
          <Marker
            key={parada.id || `parada-${idx}`}
            coordinate={{ latitude: Number(parada.latitude), longitude: Number(parada.longitude) }}
            title={parada.nome}
            description={parada.endereco}
            onPress={() => onSelectParada && onSelectParada(parada)}
            zIndex={isSelected ? 50 : 10 + idx}
          >
            <View
              style={[
                styles.markerContainer,
                {
                  backgroundColor: isSelected ? '#3B82F6' : isEscola ? theme.gold : theme.card,
                  borderColor: isSelected ? '#FFFFFF' : theme.gold,
                  transform: [{ scale: isSelected ? 1.2 : 1 }],
                },
              ]}
            >
              {isEscola ? (
                <FontAwesome5
                  name="school"
                  size={13}
                  color={isSelected ? '#FFFFFF' : '#1A253A'}
                />
              ) : (
                <Text
                  style={[
                    styles.markerIndexText,
                    { color: isSelected ? '#FFFFFF' : theme.gold },
                  ]}
                >
                  {idx + 1}
                </Text>
              )}
            </View>
          </Marker>
        );
      })}

      {/* Marcador do Ônibus em Tempo Real (direcional estilo Uber) */}
      {animState && (
        <Marker
          coordinate={animState.coord}
          title="Ônibus Escolar"
          description="Em rota ativa"
          flat
          rotation={animState.heading}
          anchor={{ x: 0.5, y: 0.5 }}
          onPress={() => onSelectBus && onSelectBus()}
          zIndex={999}
        >
          <View style={styles.busHalo}>
            <View style={[styles.busBodyTopDown, { borderColor: theme.gold }]}>
              <View style={styles.busHeadlights}>
                <View style={styles.busHeadlightDot} />
                <View style={styles.busHeadlightDot} />
              </View>
              <View style={styles.busWindshield} />
              <View style={[styles.busRoof, { backgroundColor: theme.gold }]} />
            </View>
          </View>
        </Marker>
      )}
    </MapView>
  );
}

const styles = StyleSheet.create({
  mapContainer: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  markerContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  markerIndexText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  busHalo: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(245, 166, 35, 0.22)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  busBodyTopDown: {
    width: 20,
    height: 34,
    borderRadius: 6,
    backgroundColor: '#1A253A',
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 3,
    paddingHorizontal: 2,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.45,
    shadowRadius: 4,
  },
  busHeadlights: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
    paddingHorizontal: 1,
  },
  busHeadlightDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: '#FEF08A',
  },
  busWindshield: {
    width: 12,
    height: 5,
    borderRadius: 2,
    backgroundColor: '#38BDF8',
  },
  busRoof: {
    width: 10,
    height: 13,
    borderRadius: 2,
  },
});