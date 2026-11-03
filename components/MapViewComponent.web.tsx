import React, { useEffect, useRef } from 'react';
import { View, StyleSheet } from 'react-native';

interface MapProps {
  mapRef: React.RefObject<any>;
  theme: any;
  isDark: boolean;
  hasPermission: boolean;
  rota: any;
  busLocation: any;
  INITIAL_REGION: any;
  darkMapStyle: any;
}

export default function MapViewComponent({
  isDark,
  rota,
  busLocation,
}: MapProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const defaultLat = rota?.paradas && rota.paradas.length > 0 ? rota.paradas[0].latitude : -23.5505;
  const defaultLng = rota?.paradas && rota.paradas.length > 0 ? rota.paradas[0].longitude : -46.6333;

  useEffect(() => {
    if (iframeRef.current && iframeRef.current.contentWindow && busLocation) {
      iframeRef.current.contentWindow.postMessage(
        { type: 'updateBus', location: busLocation },
        '*'
      );
    }
  }, [busLocation]);

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
      <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
      <style>
        html, body, #map { width: 100%; height: 100%; margin: 0; padding: 0; background: ${isDark ? '#1A253A' : '#F8FAFC'}; }
        .leaflet-container { background: ${isDark ? '#1A253A' : '#F8FAFC'}; }
        .custom-popup .leaflet-popup-content-wrapper {
          background: ${isDark ? '#233248' : '#FFFFFF'};
          color: ${isDark ? '#FFFFFF' : '#1A253A'};
          border: 1px solid rgba(245, 166, 35, 0.3);
          border-radius: 12px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
          font-weight: 500;
        }
        .custom-popup .leaflet-popup-tip { background: ${isDark ? '#233248' : '#FFFFFF'}; }
        .leaflet-control-attribution {
          background: ${isDark ? 'rgba(26,37,58,0.8)' : 'rgba(255,255,255,0.8)'} !important;
          color: ${isDark ? '#94A3B8' : '#64748B'} !important;
        }
      </style>
    </head>
    <body>
      <div id="map"></div>
      <script>
        const map = L.map('map', { zoomControl: false }).setView([${defaultLat}, ${defaultLng}], 15);
        L.control.zoom({ position: 'bottomright' }).addTo(map);

        const tileUrl = ${isDark}
          ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
          : 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';

        L.tileLayer(tileUrl, {
          attribution: '&copy; OpenStreetMap &copy; CARTO',
          maxZoom: 20
        }).addTo(map);

        const schoolIcon = L.divIcon({
          html: '<div style="background:#4299E1;border:3px solid ${isDark ? '#1A253A' : '#FFF'};width:34px;height:34px;border-radius:50%;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 10px rgba(66,153,225,0.4)"><span style="font-size:16px">\u{1F3EB}</span></div>',
          iconSize: [34, 34], iconAnchor: [17, 17]
        });

        const paradaIcon = L.divIcon({
          html: '<div style="background:#233248;border:2.5px solid #F5A623;width:22px;height:22px;border-radius:50%;display:flex;align-items:center;justify-content:center;box-shadow:0 3px 6px rgba(0,0,0,0.3)"><div style="background:#F5A623;width:8px;height:8px;border-radius:50%"></div></div>',
          iconSize: [22, 22], iconAnchor: [11, 11]
        });

        const busIcon = L.divIcon({
          html: '<div style="background:#F5A623;border:3.5px solid ${isDark ? '#1A253A' : '#FFF'};width:40px;height:40px;border-radius:50%;display:flex;align-items:center;justify-content:center;box-shadow:0 6px 14px rgba(245,166,35,0.5)"><span style="font-size:20px">\u{1F68C}</span></div>',
          iconSize: [40, 40], iconAnchor: [20, 20]
        });

        const paradasData = ${JSON.stringify(rota?.paradas || [])};
        const polylineCoords = [];

        paradasData.forEach((p, idx) => {
          const isLast = idx === paradasData.length - 1;
          const marker = L.marker([p.latitude, p.longitude], { icon: isLast ? schoolIcon : paradaIcon }).addTo(map);
          marker.bindPopup('<div style="font-size:13px"><b style="color:#F5A623">' + p.nome + '</b><br/>' + (p.endereco || 'Ponto de parada') + '</div>', { className: 'custom-popup' });
          polylineCoords.push([p.latitude, p.longitude]);
        });

        if (polylineCoords.length > 1) {
          const routeLine = L.polyline(polylineCoords, { color: '#F5A623', weight: 5, opacity: 0.85, lineJoin: 'round' }).addTo(map);
          map.fitBounds(routeLine.getBounds(), { padding: [50, 50] });
        }

        const initialBusLoc = ${JSON.stringify(busLocation)};
        let busMarker;
        if (initialBusLoc && initialBusLoc.latitude) {
          busMarker = L.marker([initialBusLoc.latitude, initialBusLoc.longitude], { icon: busIcon }).addTo(map);
          busMarker.bindPopup('<div style="font-size:13px"><b style="color:#F5A623">Onibus em Movimento</b><br/>Acompanhamento ao vivo</div>', { className: 'custom-popup' }).openPopup();
        }

        window.addEventListener('message', (event) => {
          if (event.data && event.data.type === 'updateBus') {
            const loc = event.data.location;
            if (loc && loc.latitude && loc.longitude) {
              const newLatLng = [loc.latitude, loc.longitude];
              if (!busMarker) {
                busMarker = L.marker(newLatLng, { icon: busIcon }).addTo(map);
                busMarker.bindPopup('<div style="font-size:13px"><b style="color:#F5A623">Onibus em Movimento</b><br/>Acompanhamento ao vivo</div>', { className: 'custom-popup' });
              } else {
                busMarker.setLatLng(newLatLng);
              }
              map.panTo(newLatLng);
            }
          }
        });
      </script>
    </body>
    </html>
  `;

  return (
    <View style={styles.mapContainer}>
      <iframe
        ref={iframeRef}
        srcDoc={htmlContent}
        style={{ width: '100%', height: '100%', border: 0 }}
        title="EduTransporter Map"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  mapContainer: { ...StyleSheet.absoluteFillObject },
});
