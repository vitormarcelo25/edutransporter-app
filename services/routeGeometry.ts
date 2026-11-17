/**
 * EduTransporter - Roteamento viário (ruas reais) e geometria para rastreamento fluido.
 */

export interface Coord {
  latitude: number;
  longitude: number;
}

const routeCache = new Map<string, Coord[]>();

const chaveRota = (paradas: Coord[]): string =>
  paradas
    .map((p) => `${Number(p.latitude).toFixed(5)},${Number(p.longitude).toFixed(5)}`)
    .join('|');

const coordsValidas = (paradas: Coord[]): Coord[] =>
  (paradas || [])
    .map((p) => ({ latitude: Number(p.latitude), longitude: Number(p.longitude) }))
    .filter((p) => Number.isFinite(p.latitude) && Number.isFinite(p.longitude) && (p.latitude !== 0 || p.longitude !== 0));

/** Distância aproximada em metros entre duas coordenadas (Haversine). */
export const distanciaMetros = (a: Coord, b: Coord): number => {
  const R = 6371000;
  const dLat = ((b.latitude - a.latitude) * Math.PI) / 180;
  const dLng = ((b.longitude - a.longitude) * Math.PI) / 180;
  const lat1 = (a.latitude * Math.PI) / 180;
  const lat2 = (b.latitude * Math.PI) / 180;
  const sinLat = Math.sin(dLat / 2);
  const sinLng = Math.sin(dLng / 2);
  const h = sinLat * sinLat + Math.cos(lat1) * Math.cos(lat2) * sinLng * sinLng;
  return 2 * R * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
};

/** Ângulo em graus (0° = Norte, 90° = Leste) entre dois pontos. */
export const calcularBearing = (from: Coord, to: Coord): number => {
  const dLat = to.latitude - from.latitude;
  const dLng = to.longitude - from.longitude;
  if (Math.abs(dLat) < 1e-8 && Math.abs(dLng) < 1e-8) return 0;

  const lat1 = (from.latitude * Math.PI) / 180;
  const lat2 = (to.latitude * Math.PI) / 180;
  const dLon = ((to.longitude - from.longitude) * Math.PI) / 180;
  const y = Math.sin(dLon) * Math.cos(lat2);
  const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon);
  const brng = (Math.atan2(y, x) * 180) / Math.PI;
  return (brng + 360) % 360;
};

export const lerpCoord = (a: Coord, b: Coord, t: number): Coord => ({
  latitude: a.latitude + (b.latitude - a.latitude) * t,
  longitude: a.longitude + (b.longitude - a.longitude) * t,
});

export const lerpAngle = (a: number, b: number, t: number): number => {
  let diff = ((b - a + 540) % 360) - 180;
  return (a + diff * t + 360) % 360;
};

/** Calcula distâncias acumuladas (em metros) para cada vértice da polilinha. */
export const calcularDistanciasAcumuladas = (path: Coord[]): number[] => {
  if (path.length === 0) return [];
  const cum = [0];
  for (let i = 1; i < path.length; i++) {
    cum.push(cum[i - 1] + distanciaMetros(path[i - 1], path[i]));
  }
  return cum;
};

/** Preenche segmentos retos longos com pontos intermediários para animação contínua. */
export const densificarPolilinha = (path: Coord[], maxPassoMetros = 25): Coord[] => {
  if (path.length < 2) return path;
  const resultado: Coord[] = [path[0]];
  for (let i = 0; i < path.length - 1; i++) {
    const a = path[i];
    const b = path[i + 1];
    const dist = distanciaMetros(a, b);
    if (dist > maxPassoMetros) {
      const steps = Math.min(Math.ceil(dist / maxPassoMetros), 80);
      for (let s = 1; s < steps; s++) {
        resultado.push(lerpCoord(a, b, s / steps));
      }
    }
    resultado.push(b);
  }
  return resultado;
};

/**
 * Projeta uma coordenada sobre o segmento mais próximo da polilinha da estrada
 * e retorna a distância acumulada ao longo da rota (em metros) + distância lateral até a via.
 */
export const projetarPosicaoNaRota = (
  pos: Coord,
  path: Coord[],
  cumDist: number[]
): { distAlongMeters: number; distToRoadMeters: number; snapped: Coord; bearing: number } => {
  if (path.length === 0) {
    return { distAlongMeters: 0, distToRoadMeters: 0, snapped: pos, bearing: 0 };
  }
  if (path.length === 1) {
    return {
      distAlongMeters: 0,
      distToRoadMeters: distanciaMetros(pos, path[0]),
      snapped: path[0],
      bearing: 0,
    };
  }

  const refLatRad = (pos.latitude * Math.PI) / 180;
  const cosLat = Math.cos(refLatRad);
  const metersPerDegLat = 111320;
  const metersPerDegLng = 111320 * Math.max(cosLat, 0.1);

  let bestDistSq = Infinity;
  let bestDistAlong = 0;
  let bestSnapped = path[0];
  let bestBearing = 0;

  for (let i = 0; i < path.length - 1; i++) {
    const a = path[i];
    const b = path[i + 1];
    const ax = (a.longitude - pos.longitude) * metersPerDegLng;
    const ay = (a.latitude - pos.latitude) * metersPerDegLat;
    const bx = (b.longitude - pos.longitude) * metersPerDegLng;
    const by = (b.latitude - pos.latitude) * metersPerDegLat;

    const dx = bx - ax;
    const dy = by - ay;
    const lenSq = dx * dx + dy * dy;
    let t = 0;
    if (lenSq > 1e-6) {
      t = Math.max(0, Math.min(1, -(ax * dx + ay * dy) / lenSq));
    }

    const px = ax + dx * t;
    const py = ay + dy * t;
    const distSq = px * px + py * py;

    if (distSq < bestDistSq) {
      bestDistSq = distSq;
      bestSnapped = lerpCoord(a, b, t);
      const segLen = (cumDist[i + 1] ?? cumDist[i]) - cumDist[i];
      bestDistAlong = cumDist[i] + segLen * t;
      bestBearing = calcularBearing(a, b);
    }
  }

  return {
    distAlongMeters: bestDistAlong,
    distToRoadMeters: Math.sqrt(bestDistSq),
    snapped: bestSnapped,
    bearing: bestBearing,
  };
};

/**
 * Amostra a polilinha em uma distância exata `targetDistMeters`, retornando:
 * - `coord`: ponto sobre a rua
 * - `bearing`: direção da via nesse ponto
 * - `traversed`: trecho percorrido (do início até `coord`)
 * - `remaining`: trecho restante (de `coord` até o final)
 */
export const dividirRotaNaDistancia = (
  path: Coord[],
  cumDist: number[],
  targetDistMeters: number
): { coord: Coord; bearing: number; traversed: Coord[]; remaining: Coord[] } => {
  if (path.length === 0) {
    return { coord: { latitude: 0, longitude: 0 }, bearing: 0, traversed: [], remaining: [] };
  }
  if (path.length === 1) {
    return { coord: path[0], bearing: 0, traversed: [path[0]], remaining: [path[0]] };
  }

  const totalDist = cumDist[cumDist.length - 1] || 0;
  const dist = Math.max(0, Math.min(totalDist, targetDistMeters));

  let segIdx = 0;
  while (segIdx < path.length - 2 && cumDist[segIdx + 1] < dist) {
    segIdx++;
  }

  const segStart = cumDist[segIdx] || 0;
  const segEnd = cumDist[segIdx + 1] || segStart;
  const segLen = segEnd - segStart;
  const t = segLen > 1e-3 ? Math.max(0, Math.min(1, (dist - segStart) / segLen)) : 0;

  const coord = lerpCoord(path[segIdx], path[segIdx + 1], t);
  const bearing = calcularBearing(path[segIdx], path[segIdx + 1]);

  const traversed = [...path.slice(0, segIdx + 1), coord];
  const remaining = [coord, ...path.slice(segIdx + 1)];

  return { coord, bearing, traversed, remaining };
};

const buscarViaDirectionsWeb = (paradas: Coord[]): Promise<Coord[] | null> => {
  if (typeof window === 'undefined') return Promise.resolve(null);
  const g = (window as any).google;
  if (!g?.maps?.DirectionsService || paradas.length < 2) return Promise.resolve(null);

  return new Promise((resolve) => {
    try {
      const service = new g.maps.DirectionsService();
      const origin = { lat: paradas[0].latitude, lng: paradas[0].longitude };
      const destination = {
        lat: paradas[paradas.length - 1].latitude,
        lng: paradas[paradas.length - 1].longitude,
      };
      const waypoints = paradas.slice(1, -1).slice(0, 23).map((p) => ({
        location: { lat: p.latitude, lng: p.longitude },
        stopover: true,
      }));

      service.route(
        {
          origin,
          destination,
          waypoints,
          travelMode: g.maps.TravelMode.DRIVING,
        },
        (result: any, status: string) => {
          if (status === 'OK' && result?.routes?.[0]?.overview_path?.length > 1) {
            const pts: Coord[] = result.routes[0].overview_path.map((pt: any) => ({
              latitude: typeof pt.lat === 'function' ? pt.lat() : Number(pt.lat),
              longitude: typeof pt.lng === 'function' ? pt.lng() : Number(pt.lng),
            }));
            resolve(pts);
          } else {
            resolve(null);
          }
        }
      );
    } catch {
      resolve(null);
    }
  });
};

const buscarViaOsrm = async (paradas: Coord[]): Promise<Coord[] | null> => {
  if (paradas.length < 2) return null;
  const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
  const timer = controller ? setTimeout(() => controller.abort(), 5500) : null;

  try {
    const coordsQuery = paradas.map((p) => `${p.longitude},${p.latitude}`).join(';');
    const url = `https://router.project-osrm.org/route/v1/driving/${coordsQuery}?overview=full&geometries=geojson&steps=false`;
    const resp = await fetch(url, controller ? { signal: controller.signal } : undefined);
    if (!resp.ok) return null;
    const json = await resp.json();
    const rawCoords: any[] = json?.routes?.[0]?.geometry?.coordinates;
    if (json?.code === 'Ok' && Array.isArray(rawCoords) && rawCoords.length > 1) {
      return rawCoords.map((pair) => ({
        latitude: Number(pair[1]),
        longitude: Number(pair[0]),
      }));
    }
    return null;
  } catch {
    return null;
  } finally {
    if (timer) clearTimeout(timer);
  }
};

/**
 * Obtém o traçado real pelas ruas passando por todas as paradas em sequência.
 * Usa cache local em memória, tenta OSRM (gratuito e sem limite de API) e
 * fallback para Google Maps Directions JS na Web, ou linha entre paradas offline.
 */
export const fetchRoadRoute = async (paradasBrutas: Coord[]): Promise<Coord[]> => {
  const paradas = coordsValidas(paradasBrutas);
  if (paradas.length < 2) return paradas;

  const key = chaveRota(paradas);
  const cached = routeCache.get(key);
  if (cached && cached.length >= 2) return cached;

  const viaOsrm = await buscarViaOsrm(paradas);
  if (viaOsrm && viaOsrm.length >= 2) {
    routeCache.set(key, viaOsrm);
    return viaOsrm;
  }

  const viaGoogleWeb = await buscarViaDirectionsWeb(paradas);
  if (viaGoogleWeb && viaGoogleWeb.length >= 2) {
    routeCache.set(key, viaGoogleWeb);
    return viaGoogleWeb;
  }

  return paradas;
};
