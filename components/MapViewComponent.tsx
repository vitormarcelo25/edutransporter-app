import React from 'react';
import MapView, { Marker, Polyline } from 'react-native-maps';
import { View, StyleSheet } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';

interface MapProps {
  mapRef: React.RefObject<MapView | null>;
  theme: any;
  isDark: boolean;
  hasPermission: boolean;
  rota: any;
  busLocation: any;
  INITIAL_REGION: any;
  darkMapStyle: any;
}

export default function MapViewComponent({
  mapRef,
  theme,
  isDark,
  hasPermission,
  rota,
  busLocation,
  INITIAL_REGION,
  darkMapStyle,
}: MapProps) {
  return (
    <MapView
      ref={mapRef}
      style={styles.mapContainer}
      initialRegion={INITIAL_REGION}
      customMapStyle={isDark ? darkMapStyle : []}
      showsUserLocation={hasPermission}
      showsMyLocationButton={false}
      googleMapsApiKey="AIzaSyBjFJaMoyrj6Yjnw8xMLwoAp8wyD6imjp4"
    >
      {/* Linha da Rota conectando paradas */}
      {rota && rota.paradas.length > 0 && (
        <Polyline
          coordinates={rota.paradas.map((p: any) => ({ latitude: p.latitude, longitude: p.longitude }))}
          strokeColor={theme.gold}
          strokeWidth={4}
        />
      )}

      {/* Marcadores das Paradas e Escola */}
      {rota?.paradas.map((parada: any) => {
        const isEscola = parada.nome.toLowerCase().includes('escola');
        return (
          <Marker
            key={parada.id}
            coordinate={{ latitude: parada.latitude, longitude: parada.longitude }}
            title={parada.nome}
            description={parada.endereco}
          >
            <View style={[
              styles.markerContainer, 
              { 
                backgroundColor: isEscola ? theme.gold : theme.card,
                borderColor: theme.gold,
              }
            ]}>
              <FontAwesome5 
                name={isEscola ? "school" : "map-marker-alt"} 
                size={14} 
                color={isEscola ? "#1A253A" : theme.gold} 
              />
            </View>
          </Marker>
        );
      })}

      {/* Ônibus Simulado em Movimento */}
      {busLocation && (
        <Marker
          coordinate={busLocation}
          title="Ônibus Escolar"
          description="Em trânsito..."
        >
          <View style={[styles.busMarkerReal, { backgroundColor: theme.gold, borderColor: '#1A253A' }]}>
            <FontAwesome5 name="bus" size={12} color="#1A253A" />
          </View>
        </Marker>
      )}
    </MapView>
  );
}

const styles = StyleSheet.create({
  mapContainer: { ...StyleSheet.absoluteFillObject },
  markerContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  busMarkerReal: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
  },
});
