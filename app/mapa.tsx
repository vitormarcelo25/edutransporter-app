import React from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TouchableOpacity, 
  SafeAreaView, 
  StatusBar 
} from 'react-native';
import { Feather, FontAwesome5 } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';

// Puxando o nosso contexto certinho pra pegar as cores e saber quem tá logado
// Isso resolve aquele erro chato que dava quando o arquivo chamava useTheme
import { useApp } from './_layout';

export default function Mapa() {
  const router = useRouter();
  
  // Pegando o tema e o cargo direto do nosso layout pra não bugar nada
  const { isDark, theme, userRole } = useApp();

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.bg }]}>
      {/* Escondendo a barra feia do Expo pra usar o nosso design */}
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar barStyle={theme.status as any} backgroundColor={theme.bg} />

      {/* O container do mapa que preenche a tela toda */}
      <View style={[styles.mapContainer, { backgroundColor: theme.bg }]}>
        
        {/* Gambiarra visual: Ruas falsas feitas com Views que mudam de cor se tá no dark mode ou não */}
        <View style={[styles.roadHorizontal, { backgroundColor: isDark ? '#1E2A3E' : '#E2E8F0' }]} />
        <View style={[styles.roadVertical, { backgroundColor: isDark ? '#1E2A3E' : '#E2E8F0' }]} />
        <View style={[styles.roadDiagonal, { backgroundColor: isDark ? '#1E2A3E' : '#E2E8F0' }]} />
        
        {/* Linha que simula a rota GPS do autocarro */}
        <View style={[styles.routeLine, { borderColor: theme.gold }]} />

        {/* Marcador da escola no mapa */}
        <View style={styles.schoolMarker}>
          <FontAwesome5 name="map-marker-alt" size={16} color={theme.gold} />
        </View>
        <Text style={[styles.schoolLabel, { backgroundColor: theme.gold, color: '#1A253A' }]}>Escola Central</Text>

        {/* Marcador do autocarro rodando */}
        <View style={[styles.busMarker, { backgroundColor: theme.gold, borderColor: theme.bg, shadowColor: theme.gold }]}>
          <FontAwesome5 name="bus" size={14} color="#1A253A" />
        </View>
      </View>

      {/* Botão de voltar lá no topo do mapa */}
      <TouchableOpacity style={[styles.backButton, { backgroundColor: theme.card, borderColor: theme.border }]} onPress={() => router.replace('/home')}>
        <Feather name="arrow-left" size={24} color={theme.text} />
      </TouchableOpacity>

      {/* Cartão flutuante de Informação ali embaixo do mapa */}
      <View style={[styles.bottomCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
        <View style={[styles.dragHandle, { backgroundColor: theme.border }]} />
        <View style={styles.cardHeader}>
          {/* Se for motorista a ver o mapa, o texto muda pra fazer sentido */}
          <Text style={[styles.statusTitle, { color: theme.gold }]}>
            {userRole === 'aluno' ? 'A caminho do destino' : 'Rota em andamento'}
          </Text>
          <Text style={[styles.etaText, { color: theme.gold }]}>12 min</Text>
        </View>
        <Text style={[styles.destinationText, { color: theme.text }]}>Escola Central</Text>
        <Text style={[styles.distanceText, { color: theme.subtext }]}>2.4 km • Chegada prevista às 07:45</Text>
      </View>

      {/* Menu de navegação inferior (Navbar) igualzinho ao da Home */}
      <View style={styles.bottomNavContainer}>
        <View style={[styles.bottomNav, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <TouchableOpacity style={styles.navItem} onPress={() => router.replace('/home')}>
            <Feather name="home" size={24} color={theme.subtext} />
            <Text style={[styles.navText, { color: theme.subtext }]}>Início</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.navItem}>
            {/* A bolinha dourada fica aqui agora porque estamos na aba Mapa */}
            <View style={[styles.activeDot, { backgroundColor: theme.gold }]} />
            <Feather name="map-pin" size={24} color={theme.gold} />
            <Text style={[styles.navText, { color: theme.gold, fontWeight: 'bold' }]}>Mapa</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.navItem} onPress={() => router.replace('/chat')}>
            <Feather name="message-square" size={24} color={theme.subtext} />
            <Text style={[styles.navText, { color: theme.subtext }]}>Chat</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.navItem} onPress={() => router.replace('/perfil')}>
            <Feather name="user" size={24} color={theme.subtext} />
            <Text style={[styles.navText, { color: theme.subtext }]}>Perfil</Text>
          </TouchableOpacity>
        </View>
      </View>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  
  // Isso aqui faz o mapa ocupar a tela toda por trás das coisas
  mapContainer: { ...StyleSheet.absoluteFillObject, overflow: 'hidden' },
  
  // Nossas "ruas" falsas
  roadHorizontal: { position: 'absolute', top: '40%', width: '100%', height: 18 },
  roadVertical: { position: 'absolute', left: '30%', width: 18, height: '100%' },
  roadDiagonal: { position: 'absolute', top: '40%', left: '30%', width: '100%', height: 18, transform: [{ rotate: '-25deg' }], transformOrigin: 'top left' },
  routeLine: { position: 'absolute', top: '25%', left: '30%', width: 150, height: '15%', borderLeftWidth: 6, borderBottomWidth: 6, borderBottomLeftRadius: 16 },
  
  busMarker: { position: 'absolute', top: '22%', left: '27%', width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center', borderWidth: 3, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.5, shadowRadius: 6, elevation: 5 },
  schoolMarker: { position: 'absolute', top: '36%', left: '60%', alignItems: 'center' },
  schoolLabel: { position: 'absolute', top: '41%', left: '55%', fontSize: 12, fontWeight: 'bold', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, overflow: 'hidden' },

  backButton: { position: 'absolute', top: 50, left: 20, width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 5, elevation: 4, borderWidth: 1 },
  
  bottomCard: { position: 'absolute', bottom: 100, left: 20, right: 20, borderRadius: 24, padding: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 10, elevation: 10, borderWidth: 1 },
  dragHandle: { width: 40, height: 4, borderRadius: 2, alignSelf: 'center', marginBottom: 15 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 8 },
  statusTitle: { fontSize: 14, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 },
  etaText: { fontSize: 24, fontWeight: '900' },
  destinationText: { fontSize: 20, fontWeight: 'bold', marginBottom: 4 },
  distanceText: { fontSize: 14 },

  // A Navbar copiada certinha lá do home.tsx pra manter o padrão
  bottomNavContainer: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: 'transparent', paddingHorizontal: 20, paddingBottom: 25 },
  bottomNav: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', paddingVertical: 12, borderRadius: 25, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 5, elevation: 8, borderWidth: 1 },
  navItem: { alignItems: 'center', justifyContent: 'center', flex: 1 },
  activeDot: { position: 'absolute', top: -12, width: 20, height: 3, borderBottomLeftRadius: 5, borderBottomRightRadius: 5 },
  navText: { fontSize: 10, marginTop: 4 }
});