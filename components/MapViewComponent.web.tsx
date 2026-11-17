import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { GOOGLE_MAPS_API_KEY } from '@/constants/maps';
import {
  Coord,
  calcularBearing,
  calcularDistanciasAcumuladas,
  dividirRotaNaDistancia,
  lerpAngle,
  lerpCoord,
  projetarPosicaoNaRota,
} from '@/services/routeGeometry';

interface MapProps {
  mapRef?: React.RefObject<any>;
  theme?: any;
  isDark: boolean;
  hasPermission?: boolean;
  rota?: any;
  roadPath?: Coord[];
  busLocation?: any;
  INITIAL_REGION?: any;
  darkMapStyle?: any;
  selectedParada?: any;
  onSelectParada?: (parada: any) => void;
  onSelectBus?: () => void;
  onMapPress?: (coord: { latitude: number; longitude: number }) => void;
}

const GOLD = '#F5A623';
const NAVY = '#1A253A';
const DEFAULT_CENTER = { lat: -8.2833, lng: -35.9761 };

const LIGHT_STYLE = [
  { elementType: 'geometry', stylers: [{ color: '#F8FAFC' }] },
  { elementType: 'labels.icon', stylers: [{ visibility: 'off' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#475569' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#FFFFFF' }] },
  { featureType: 'administrative', elementType: 'geometry', stylers: [{ visibility: 'off' }] },
  { featureType: 'poi', stylers: [{ visibility: 'off' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#FFFFFF' }] },
  { featureType: 'road', elementType: 'labels.text.fill', stylers: [{ color: '#64748B' }] },
  { featureType: 'road.arterial', elementType: 'geometry', stylers: [{ color: '#FFFFFF' }] },
  { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#F1F5F9' }] },
  { featureType: 'transit', stylers: [{ visibility: 'off' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#CBD5E1' }] },
  { featureType: 'water', elementType: 'labels.text.fill', stylers: [{ color: '#64748B' }] },
];

let scriptPromise: Promise<void> | null = null;

function loadGoogleMaps(): Promise<void> {
  const w = window as any;
  if (w.google?.maps) return Promise.resolve();
  if (!scriptPromise) {
    scriptPromise = new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&language=pt-BR`;
      s.async = true;
      s.onload = () => resolve();
      s.onerror = () => {
        scriptPromise = null;
        reject(new Error('Falha ao carregar Google Maps'));
      };
      document.head.appendChild(s);
    });
  }
  return scriptPromise;
}

// Cria ícone SVG customizado para paradas numeradas
function createStopIcon(index: number, isEscola: boolean, isSelected: boolean) {
  const bgColor = isSelected ? '#3B82F6' : isEscola ? GOLD : NAVY;
  const strokeColor = isSelected ? '#FFFFFF' : GOLD;
  const labelText = isEscola ? '★' : `${index + 1}`;
  const textColor = isEscola && !isSelected ? '#1A253A' : '#FFFFFF';

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 36 36">
      <defs>
        <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="2" stdDeviation="2" flood-color="#000000" flood-opacity="0.35"/>
        </filter>
      </defs>
      <circle cx="18" cy="18" r="${isSelected ? 16 : 14}" fill="${bgColor}" stroke="${strokeColor}" stroke-width="${isSelected ? 3 : 2}" filter="url(#shadow)"/>
      <text x="18" y="22" font-size="${isEscola ? 16 : 12}" font-family="system-ui, -apple-system, sans-serif" font-weight="bold" fill="${textColor}" text-anchor="middle">${labelText}</text>
    </svg>
  `;

  return {
    url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(svg),
    scaledSize: new (window as any).google.maps.Size(36, 36),
    anchor: new (window as any).google.maps.Point(18, 18),
  };
}

const busIconUrlCache = new Map<number, string>();

// Cria ícone SVG top-down (vista de cima estilo Uber) rotacionado na direção da via
function createBusIcon(headingDeg = 0) {
  const bucket = (((Math.round(headingDeg / 4) * 4) % 360) + 360) % 360;
  let dataUrl = busIconUrlCache.get(bucket);

  if (!dataUrl) {
    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48">
        <defs>
          <filter id="busShadow" x="-30%" y="-30%" width="160%" height="160%">
            <feDropShadow dx="0" dy="2" stdDeviation="2.5" flood-color="#000000" flood-opacity="0.45"/>
          </filter>
        </defs>
        <circle cx="24" cy="24" r="21" fill="rgba(245, 166, 35, 0.20)" />
        <g transform="rotate(${bucket} 24 24)" filter="url(#busShadow)">
          <rect x="15.5" y="9" width="17" height="30" rx="5.5" fill="${NAVY}" stroke="${GOLD}" stroke-width="2" />
          <circle cx="19" cy="11.5" r="1.4" fill="#FEF08A" />
          <circle cx="29" cy="11.5" r="1.4" fill="#FEF08A" />
          <rect x="18" y="13.5" width="12" height="5" rx="1.8" fill="#38BDF8" />
          <rect x="19.5" y="20.5" width="9" height="12" rx="2" fill="${GOLD}" />
          <circle cx="19" cy="36.5" r="1.3" fill="#EF4444" />
          <circle cx="29" cy="36.5" r="1.3" fill="#EF4444" />
        </g>
      </svg>
    `;
    dataUrl = 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(svg);
    busIconUrlCache.set(bucket, dataUrl);
  }

  return {
    url: dataUrl,
    scaledSize: new (window as any).google.maps.Size(48, 48),
    anchor: new (window as any).google.maps.Point(24, 24),
  };
}

function makeInfo(title: string, sub: string, indexStr?: string) {
  const div = document.createElement('div');
  div.style.padding = '4px 6px';
  div.style.fontFamily = 'system-ui, -apple-system, sans-serif';
  div.style.maxWidth = '220px';

  if (indexStr) {
    const badge = document.createElement('span');
    badge.textContent = indexStr;
    badge.style.display = 'inline-block';
    badge.style.fontSize = '10px';
    badge.style.fontWeight = 'bold';
    badge.style.padding = '2px 6px';
    badge.style.borderRadius = '10px';
    badge.style.backgroundColor = 'rgba(245, 166, 35, 0.2)';
    badge.style.color = GOLD;
    badge.style.marginBottom = '4px';
    div.appendChild(badge);
    div.appendChild(document.createElement('br'));
  }

  const b = document.createElement('b');
  b.style.color = '#0F172A';
  b.style.fontSize = '13px';
  b.textContent = title;
  div.appendChild(b);

  if (sub) {
    const p = document.createElement('div');
    p.style.color = '#64748B';
    p.style.fontSize = '11px';
    p.style.marginTop = '2px';
    p.textContent = sub;
    div.appendChild(p);
  }

  return div;
}

export default function MapViewComponent({
  mapRef: externalMapRef,
  isDark,
  rota,
  roadPath,
  busLocation,
  INITIAL_REGION,
  darkMapStyle,
  selectedParada,
  onSelectParada,
  onSelectBus,
  onMapPress,
}: MapProps) {
  const divRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const infoRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const traversedLineRef = useRef<any>(null);
  const lineHaloRef = useRef<any>(null);
  const lineRef = useRef<any>(null);
  const busRef = useRef<any>(null);
  const onMapPressRef = useRef(onMapPress);
  const onSelectBusRef = useRef(onSelectBus);
  const lastFittedKeyRef = useRef<string>('');
  const animFrameRef = useRef<number | null>(null);
  const animStateRef = useRef<{
    routeSig: string;
    distMeters: number;
    bearing: number;
    rawCoord: Coord;
    lastTimestamp: number;
    iconBucket: number;
  } | null>(null);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    onMapPressRef.current = onMapPress;
  }, [onMapPress]);

  useEffect(() => {
    onSelectBusRef.current = onSelectBus;
  }, [onSelectBus]);

  // Inicializa o mapa do Google Maps uma vez
  useEffect(() => {
    let cancelled = false;
    loadGoogleMaps()
      .then(() => {
        const g = (window as any).google;
        if (cancelled || !divRef.current || mapRef.current) return;

        const center = INITIAL_REGION?.latitude && INITIAL_REGION?.longitude
          ? { lat: Number(INITIAL_REGION.latitude), lng: Number(INITIAL_REGION.longitude) }
          : DEFAULT_CENTER;

        mapRef.current = new g.maps.Map(divRef.current, {
          center,
          zoom: 14,
          disableDefaultUI: true,
          zoomControl: true,
          zoomControlOptions: { position: g.maps.ControlPosition.RIGHT_BOTTOM },
          styles: isDark ? darkMapStyle : LIGHT_STYLE,
          backgroundColor: isDark ? NAVY : '#F8FAFC',
        });

        infoRef.current = new g.maps.InfoWindow();

        mapRef.current.addListener('click', (e: any) => {
          if (infoRef.current) {
            infoRef.current.close();
          }
          if (onMapPressRef.current && e?.latLng) {
            onMapPressRef.current({
              latitude: Number(e.latLng.lat().toFixed(6)),
              longitude: Number(e.latLng.lng().toFixed(6)),
            });
          }
        });

        setReady(true);
      })
      .catch((e) => setError(e.message));

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Expõe métodos utilitários para o mapRef do componente pai
  useEffect(() => {
    if (externalMapRef) {
      externalMapRef.current = {
        animateToRegion: (region: any) => {
          if (mapRef.current && region) {
            const pos = { lat: Number(region.latitude), lng: Number(region.longitude) };
            mapRef.current.panTo(pos);
            if (region.latitudeDelta) {
              const zoom = region.latitudeDelta < 0.015 ? 16 : 14;
              mapRef.current.setZoom(zoom);
            }
          }
        },
        fitToCoordinates: (coords: any[]) => {
          const g = (window as any).google;
          if (mapRef.current && g?.maps && coords && coords.length > 0) {
            const bounds = new g.maps.LatLngBounds();
            coords.forEach((c) => bounds.extend({ lat: Number(c.latitude), lng: Number(c.longitude) }));
            mapRef.current.fitBounds(bounds, { top: 60, bottom: 180, left: 40, right: 40 });
          }
        },
        panTo: (lat: number, lng: number) => {
          if (mapRef.current) {
            mapRef.current.panTo({ lat, lng });
          }
        },
        setZoom: (zoom: number) => {
          if (mapRef.current) {
            mapRef.current.setZoom(zoom);
          }
        },
        getMapInstance: () => mapRef.current,
      };
    }
  }, [externalMapRef, ready]);

  // Tema claro/escuro
  useEffect(() => {
    if (!ready || !mapRef.current) return;
    mapRef.current.setOptions({
      styles: isDark ? darkMapStyle : LIGHT_STYLE,
      backgroundColor: isDark ? NAVY : '#F8FAFC',
    });
  }, [ready, isDark, darkMapStyle]);

  // Marcadores das paradas e enquadramento inicial da rota
  useEffect(() => {
    if (!ready || !mapRef.current) return;
    const g = (window as any).google;
    const map = mapRef.current;

    markersRef.current.forEach((m) => m.setMap(null));
    markersRef.current = [];

    const paradas: any[] = rota?.paradas || [];
    if (!paradas.length) {
      return;
    }

    const pathStops = paradas.map((p) => ({ lat: Number(p.latitude), lng: Number(p.longitude) }));

    paradas.forEach((p, idx) => {
      const isEscola = idx === paradas.length - 1 || String(p.nome).toLowerCase().includes('escola');
      const isSelected = selectedParada?.id === p.id;

      const marker = new g.maps.Marker({
        position: { lat: Number(p.latitude), lng: Number(p.longitude) },
        map,
        title: p.nome,
        icon: createStopIcon(idx, isEscola, isSelected),
        zIndex: isSelected ? 50 : 10 + idx,
      });

      marker.addListener('click', () => {
        infoRef.current.setContent(
          makeInfo(
            p.nome,
            p.endereco || 'Ponto de embarque',
            isEscola ? 'DESTINO FINAL' : `PARADA #${idx + 1}`
          )
        );
        infoRef.current.open({ anchor: marker, map });
        if (onSelectParada) {
          onSelectParada(p);
        }
      });

      markersRef.current.push(marker);
    });

    const fitKey = `${rota?.id || ''}_${paradas.length}_${roadPath?.length || 0}`;
    if (lastFittedKeyRef.current !== fitKey) {
      lastFittedKeyRef.current = fitKey;
      const ptsToFit =
        roadPath && roadPath.length >= 2
          ? roadPath.map((p) => ({ lat: p.latitude, lng: p.longitude }))
          : pathStops;

      if (ptsToFit.length > 1) {
        const bounds = new g.maps.LatLngBounds();
        ptsToFit.forEach((pt) => bounds.extend(pt));
        if (busLocation && busLocation.latitude != null) {
          bounds.extend({ lat: Number(busLocation.latitude), lng: Number(busLocation.longitude) });
        }
        map.fitBounds(bounds, { top: 70, bottom: 180, left: 40, right: 40 });
      } else if (ptsToFit.length === 1) {
        map.panTo(ptsToFit[0]);
      }
    }
  }, [ready, rota, roadPath, selectedParada, isDark]);

  // Polilinha dividida (trecho percorrido cinza apagado + restante destacado) e ônibus animado
  useEffect(() => {
    if (!ready || !mapRef.current) return;
    const g = (window as any).google;
    const map = mapRef.current;

    const paradas: any[] = rota?.paradas || [];
    const fullPath: Coord[] =
      roadPath && roadPath.length >= 2
        ? roadPath
        : paradas
            .map((p) => ({ latitude: Number(p.latitude), longitude: Number(p.longitude) }))
            .filter((p) => Number.isFinite(p.latitude) && Number.isFinite(p.longitude));

    const toGooglePath = (pts: Coord[]) => pts.map((p) => ({ lat: p.latitude, lng: p.longitude }));

    if (!traversedLineRef.current) {
      traversedLineRef.current = new g.maps.Polyline({
        path: [],
        strokeColor: isDark ? '#64748B' : '#94A3B8',
        strokeWeight: 4,
        strokeOpacity: 0.45,
        map,
        zIndex: 1,
      });
    } else {
      traversedLineRef.current.setOptions({ strokeColor: isDark ? '#64748B' : '#94A3B8' });
    }

    if (!lineHaloRef.current) {
      lineHaloRef.current = new g.maps.Polyline({
        path: [],
        strokeColor: isDark ? '#0F172A' : '#CBD5E1',
        strokeWeight: 7,
        strokeOpacity: 0.65,
        map,
        zIndex: 2,
      });
    } else {
      lineHaloRef.current.setOptions({ strokeColor: isDark ? '#0F172A' : '#CBD5E1' });
    }

    if (!lineRef.current) {
      lineRef.current = new g.maps.Polyline({
        path: [],
        strokeColor: GOLD,
        strokeWeight: 4.5,
        strokeOpacity: 0.96,
        map,
        zIndex: 3,
      });
    }

    if (animFrameRef.current != null) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }

    const temPosicao = busLocation && busLocation.latitude != null && busLocation.longitude != null;

    if (!temPosicao) {
      busRef.current?.setMap(null);
      busRef.current = null;
      animStateRef.current = null;
      traversedLineRef.current.setPath([]);
      const gPath = toGooglePath(fullPath);
      lineHaloRef.current.setPath(gPath);
      lineRef.current.setPath(gPath);
      return;
    }

    const rawTarget: Coord = {
      latitude: Number(busLocation.latitude),
      longitude: Number(busLocation.longitude),
    };
    const cumDist = calcularDistanciasAcumuladas(fullPath);
    const routeSig = `${rota?.id || ''}_${fullPath.length}`;
    const targetProj = projetarPosicaoNaRota(rawTarget, fullPath, cumDist);
    const offRoute = fullPath.length < 2 || targetProj.distToRoadMeters > 150;

    const aplicarFrame = (
      coord: Coord,
      heading: number,
      traversed: Coord[],
      remaining: Coord[],
      distMeters: number,
      rawCoord: Coord,
      nowMs: number
    ) => {
      const gPos = { lat: coord.latitude, lng: coord.longitude };
      const bucket = (((Math.round(heading / 4) * 4) % 360) + 360) % 360;

      if (!busRef.current) {
        busRef.current = new g.maps.Marker({
          position: gPos,
          map,
          title: 'Ônibus Escolar em Trânsito',
          zIndex: 999,
          icon: createBusIcon(bucket),
        });
        busRef.current.addListener('click', () => {
          infoRef.current.setContent(makeInfo('Ônibus Escolar', 'Em rota ativa'));
          infoRef.current.open({ anchor: busRef.current, map });
          if (onSelectBusRef.current) {
            onSelectBusRef.current();
          }
        });
      } else {
        busRef.current.setPosition(gPos);
        if (animStateRef.current?.iconBucket !== bucket) {
          busRef.current.setIcon(createBusIcon(bucket));
        }
      }

      traversedLineRef.current.setPath(toGooglePath(traversed));
      const gRem = toGooglePath(remaining);
      lineHaloRef.current.setPath(gRem);
      lineRef.current.setPath(gRem);

      animStateRef.current = {
        routeSig,
        distMeters,
        bearing: heading,
        rawCoord,
        lastTimestamp: nowMs,
        iconBucket: bucket,
      };
    };

    const prev = animStateRef.current;
    const now = typeof performance !== 'undefined' ? performance.now() : Date.now();
    const reiniciouLoop = prev && targetProj.distAlongMeters < prev.distMeters - 300;

    if (!prev || prev.routeSig !== routeSig || reiniciouLoop || fullPath.length < 2) {
      const split = dividirRotaNaDistancia(fullPath, cumDist, targetProj.distAlongMeters);
      const coordInicial = offRoute ? rawTarget : split.coord;
      const headingInicial = offRoute
        ? prev
          ? calcularBearing(prev.rawCoord, rawTarget)
          : 0
        : split.bearing;
      aplicarFrame(
        coordInicial,
        headingInicial,
        fullPath.length >= 2 ? split.traversed : [],
        fullPath.length >= 2 ? split.remaining : [],
        targetProj.distAlongMeters,
        rawTarget,
        now
      );
      return;
    }

    const startDist = prev.distMeters;
    const endDist = targetProj.distAlongMeters;
    const startRaw = prev.rawCoord;
    const startBearing = prev.bearing;
    const endBearing = offRoute ? calcularBearing(startRaw, rawTarget) || startBearing : targetProj.bearing;
    const deltaTempo = now - prev.lastTimestamp;
    const duracao = Math.min(Math.max(deltaTempo > 50 ? deltaTempo * 0.9 : 340, 280), 1200);
    const startTime = now;

    const animar = (frameTime: number) => {
      const elapsed = frameTime - startTime;
      const t = Math.min(1, elapsed / duracao);
      const curDist = startDist + (endDist - startDist) * t;
      const split = dividirRotaNaDistancia(fullPath, cumDist, curDist);
      const coordFrame = offRoute ? lerpCoord(startRaw, rawTarget, t) : split.coord;
      const headingFrame = offRoute
        ? lerpAngle(startBearing, endBearing, t)
        : split.bearing;

      aplicarFrame(
        coordFrame,
        headingFrame,
        split.traversed,
        split.remaining,
        curDist,
        lerpCoord(startRaw, rawTarget, t),
        frameTime
      );

      if (t < 1) {
        animFrameRef.current = requestAnimationFrame(animar);
      } else {
        animFrameRef.current = null;
      }
    };

    animFrameRef.current = requestAnimationFrame(animar);

    return () => {
      if (animFrameRef.current != null) {
        cancelAnimationFrame(animFrameRef.current);
        animFrameRef.current = null;
      }
    };
  }, [ready, rota?.id, rota?.paradas, roadPath, busLocation, isDark]);

  return (
    <View style={styles.mapContainer}>
      <div ref={divRef} style={{ width: '100%', height: '100%' }} />
      {Boolean(error) && (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>Não foi possível carregar o mapa.</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  mapContainer: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  errorBox: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: { color: '#94A3B8', fontSize: 14 },
});