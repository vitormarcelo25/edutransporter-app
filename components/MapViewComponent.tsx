import React from 'react';
import MapView, { Marker, Polyline } from 'react-native-maps';
import { View, Text, StyleSheet } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { GOOGLE_MAPS_API_KEY } from '@/constants/maps';

interface MapProps {
  mapRef?: React.RefObject<any>;
  theme: any;
  isDark: boolean;
  hasPermission?: boolean;
  rota?: any;
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
  busLocation,
  INITIAL_REGION,
  darkMapStyle,
  selectedParada,
  onSelectParada,
  onSelectBus,
  onMapPress,
}: MapProps) {
  const paradas: any[] = rota?.paradas || [];

  const handleMapReady = () => {
    if (mapRef.current && paradas.length > 1) {
      const coords = paradas.map((p) => ({ latitude: Number(p.latitude), longitude: Number(p.longitude) }));
      if (busLocation && busLocation.latitude != null) {
        coords.push({ latitude: Number(busLocation.latitude), longitude: Number(busLocation.longitude) });
      }
      mapRef.current.fitToCoordinates(coords, {
        edgePadding: { top: 80, right: 50, bottom: 200, left: 50 },
        animated: true,
      });
    } else if (mapRef.current && paradas.length === 1) {
      mapRef.current.animateToRegion({
        latitude: Number(paradas[0].latitude),
        longitude: Number(paradas[0].longitude),
        latitudeDelta: 0.02,
        longitudeDelta: 0.02,
      }, 500);
    }
  };

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
      {/* Linha de contorno (efeito halo) */}
      {paradas.length > 0 && (
        <Polyline
          coordinates={paradas.map((p: any) => ({
            latitude: Number(p.latitude),
            longitude: Number(p.longitude),
          }))}
          strokeColor={isDark ? '#0F172A' : '#CBD5E1'}
          strokeWidth={6}
          zIndex={1}
        />
      )}

      {/* Linha principal da Rota conectando paradas */}
      {paradas.length > 0 && (
        <Polyline
          coordinates={paradas.map((p: any) => ({
            latitude: Number(p.latitude),
            longitude: Number(p.longitude),
          }))}
          strokeColor={theme.gold}
          strokeWidth={4}
          zIndex={2}
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

      {/* Marcador do Ônibus em Tempo Real */}
      {busLocation && busLocation.latitude != null && (
        <Marker
          coordinate={{
            latitude: Number(busLocation.latitude),
            longitude: Number(busLocation.longitude),
          }}
          title="Ônibus Escolar"
          description="Em rota ativa"
          onPress={() => onSelectBus && onSelectBus()}
          zIndex={999}
        >
          <View style={styles.busHalo}>
            <View style={[styles.busMarkerReal, { backgroundColor: theme.gold, borderColor: '#1A253A' }]}>
              <FontAwesome5 name="bus" size={13} color="#1A253A" />
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
    backgroundColor: 'rgba(245, 166, 35, 0.25)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  busMarkerReal: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
  },
});