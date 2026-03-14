import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TouchableOpacity, 
  SafeAreaView, 
  ScrollView, 
  StatusBar,
  Dimensions,
  Platform
} from 'react-native';
// Ícones que a gente escolheu pra ficar com cara de app profissional
import { Feather, FontAwesome5, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';

// Usando a importação normal do contexto, igual fizemos antes
import { useApp } from './_layout';

const { width } = Dimensions.get('window');

export default function App() {
  const router = useRouter();
  
  // Puxando o contexto pra saber quem tá logado (Aluno/Motorista), o tema 
  // e AGORA o assento que a pessoa escolheu lá na outra tela!
  const { theme, userRole, setUserRole, selectedSeat } = useApp();
  
  const [currentDate, setCurrentDate] = useState('');
  const [currentTime, setCurrentTime] = useState('');
  
  // Apaguei o "const selectedSeat = 12" que estava fixo aqui. 
  // Agora ele vem do useApp() de forma automática.

  useEffect(() => {
    // Função pra atualizar o relógio e a data no topo
    const updateDateTime = () => {
      const now = new Date();
      const options: Intl.DateTimeFormatOptions = { weekday: 'long', day: 'numeric', month: 'long' };
      setCurrentDate(now.toLocaleDateString('pt-BR', options));
      setCurrentTime(now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }));
    };

    updateDateTime();
    // Atualiza a cada 10 segundos pra não drenar a bateria do telemóvel
    const timer = setInterval(updateDateTime, 10000); 
    return () => clearInterval(timer);
  }, []);

  // Atalho pra pular de ecrã sem dar erro de rota
  const navigateTo = (path: string) => {
    try {
      router.push(path as any);
    } catch (e) {
      console.warn("Deu erro ao tentar ir pra: ", path);
    }
  };

  // Botãozinho escondido/prático pra testar a troca de perfil na hora de apresentar
  const toggleRole = () => {
    if (setUserRole) {
      setUserRole(userRole === 'aluno' ? 'motorista' : 'aluno');
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]}>
      {/* Tirando o header que o Expo coloca sozinho pra usar o nosso customizado */}
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar barStyle={theme.status as any} />
      
      {/* CABEÇALHO: Com o "Bem-vindo!", Data, Hora e os botões */}
      <View style={[styles.header, { backgroundColor: theme.card, borderBottomColor: theme.border }]}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.welcomeText, { color: theme.text }]}>Bem-vindo!</Text>
          <Text style={[styles.statusSub, { color: theme.subtext }]}>
            {currentDate} • {currentTime}
          </Text>
        </View>

        <View style={styles.headerRight}>
          {/* Botão prático pra tu e o professor testarem a mudança de layout na hora */}
          <TouchableOpacity 
            style={[styles.roleBtn, { borderColor: theme.gold, backgroundColor: theme.bg }]}
            onPress={toggleRole}
          >
            <FontAwesome5 
              name={userRole === 'aluno' ? 'user-graduate' : 'bus-alt'} 
              size={12} 
              color={theme.gold} 
            />
            <Text style={[styles.roleText, { color: theme.text }]}>
              {userRole === 'aluno' ? 'Aluno' : 'Motorista'}
            </Text>
          </TouchableOpacity>

          {/* Botão redondo do perfil lá no canto direito */}
          <TouchableOpacity 
            style={[styles.profileBtn, { backgroundColor: theme.gold }]}
            onPress={() => navigateTo('/perfil')}
          >
            <FontAwesome5 name="user-alt" size={16} color="#1A253A" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        
        {/* CARD PRINCIPAL: O autocarro ORE 3 que leva pro mapa de assentos ou painel de presença */}
        <TouchableOpacity 
          style={[styles.busCard, { backgroundColor: theme.card, borderColor: theme.border }]}
          onPress={() => navigateTo(userRole === 'aluno' ? '/listas' : '/home')}
          activeOpacity={0.9}
        >
          <View style={[styles.busIcon, { backgroundColor: theme.gold }]}>
            <FontAwesome5 name="bus" size={30} color="#1A253A" />
          </View>
          
          <View style={styles.busInfo}>
            <Text style={[styles.busTitle, { color: theme.text }]}>
              {userRole === 'aluno' ? 'Ônibus ORE 3' : 'Painel de Gestão'}
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4, gap: 5 }}>
              {userRole === 'aluno' ? (
                <>
                  {/* Aqui é a mágica: Muda a cor e o ícone se o assento estiver vazio ou reservado */}
                  <Ionicons name={selectedSeat ? "checkmark-circle" : "alert-circle"} size={14} color={selectedSeat ? "#48BB78" : theme.gold} />
                  <Text style={{ fontSize: 12, fontWeight: 'bold', color: selectedSeat ? '#48BB78' : theme.gold }}>
                    {selectedSeat ? `Assento reservado: Nº ${selectedSeat}` : 'Escolha o seu lugar'}
                  </Text>
                </>
              ) : (
                <>
                  <MaterialCommunityIcons name="account-group" size={14} color={theme.gold} />
                  <Text style={{ fontSize: 12, fontWeight: 'bold', color: theme.gold }}>
                    Lista de alunos atualizada
                  </Text>
                </>
              )}
            </View>
          </View>
          
          <Feather name="chevron-right" size={20} color={theme.subtext} />
        </TouchableOpacity>

        <Text style={[styles.sectionTitle, { color: theme.text }]}>Ações Rápidas</Text>

        {/* GRID DE BOTÕES: Muda de acordo com quem tá logado */}
        <View style={styles.grid}>
          {userRole === 'aluno' && (
            <>
              <TouchableOpacity style={[styles.gridItem, { backgroundColor: theme.card, borderColor: theme.border }]} onPress={() => navigateTo('/mapa')}>
                <View style={[styles.iconCircle, { backgroundColor: 'rgba(72,187,120,0.1)' }]}>
                  <Feather name="map-pin" size={22} color="#48BB78" />
                </View>
                <Text style={[styles.gridLabel, { color: theme.text }]}>Ver Mapa</Text>
              </TouchableOpacity>

              <TouchableOpacity style={[styles.gridItem, { backgroundColor: theme.card, borderColor: theme.border }]} onPress={() => navigateTo('/listas')}>
                <View style={[styles.iconCircle, { backgroundColor: 'rgba(49,130,206,0.1)' }]}>
                  <Feather name="grid" size={22} color="#3182CE" />
                </View>
                <Text style={[styles.gridLabel, { color: theme.text }]}>Meu Assento</Text>
              </TouchableOpacity>
            </>
          )}

          {userRole === 'motorista' && (
            <>
              <TouchableOpacity style={[styles.gridItem, { backgroundColor: theme.card, borderColor: theme.border }]}>
                <View style={[styles.iconCircle, { backgroundColor: 'rgba(245,166,35,0.1)' }]}>
                  <Feather name="play-circle" size={22} color={theme.gold} />
                </View>
                <Text style={[styles.gridLabel, { color: theme.text }]}>Iniciar Rota</Text>
              </TouchableOpacity>

              <TouchableOpacity style={[styles.gridItem, { backgroundColor: theme.card, borderColor: theme.border }]}>
                <View style={[styles.iconCircle, { backgroundColor: 'rgba(72,187,120,0.1)' }]}>
                  <MaterialCommunityIcons name="clipboard-text" size={22} color="#48BB78" />
                </View>
                <Text style={[styles.gridLabel, { color: theme.text }]}>Presença</Text>
              </TouchableOpacity>
            </>
          )}

          {/* Botões que a gente deixou liberado pros dois tipos de conta */}
          <TouchableOpacity style={[styles.gridItem, { backgroundColor: theme.card, borderColor: theme.border }]} onPress={() => navigateTo('/chat')}>
            <View style={[styles.iconCircle, { backgroundColor: 'rgba(245,166,35,0.1)' }]}>
              <Feather name="message-circle" size={22} color={theme.gold} />
            </View>
            <Text style={[styles.gridLabel, { color: theme.text }]}>Chat da Rota</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.gridItem, { backgroundColor: theme.card, borderColor: theme.border }]} onPress={() => navigateTo('/avisos')}>
            <View style={[styles.iconCircle, { backgroundColor: 'rgba(239,68,68,0.1)' }]}>
              <Feather name="bell" size={22} color="#EF4444" />
            </View>
            <Text style={[styles.gridLabel, { color: theme.text }]}>Avisos</Text>
          </TouchableOpacity>
        </View>

        {/* Gambiarra básica pra dar um espaço no fim da tela pro menu não tampar os últimos botões */}
        <View style={{ height: 140 }} />
      </ScrollView>

      {/* BARRA DE NAVEGAÇÃO */}
      <View style={[styles.nav, { backgroundColor: theme.card, borderTopColor: theme.border }]}>
        <TouchableOpacity style={styles.navItem}>
          <View style={[styles.activeDot, { backgroundColor: theme.gold }]} />
          <Feather name="home" size={24} color={theme.gold} />
          <Text style={[styles.navText, { color: theme.gold, fontWeight: 'bold' }]}>Início</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.navItem} onPress={() => navigateTo('/mapa')}>
          <Feather name="map" size={24} color={theme.subtext} />
          <Text style={[styles.navText, { color: theme.subtext }]}>Mapa</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.navItem} onPress={() => navigateTo('/chat')}>
          <Feather name="message-square" size={24} color={theme.subtext} />
          <Text style={[styles.navText, { color: theme.subtext }]}>Chat</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.navItem} onPress={() => navigateTo('/perfil')}>
          <Feather name="user" size={24} color={theme.subtext} />
          <Text style={[styles.navText, { color: theme.subtext }]}>Perfil</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    paddingHorizontal: 20, 
    paddingTop: Platform.OS === 'ios' ? 10 : 25, 
    paddingBottom: 20, 
    borderBottomWidth: 1,
    elevation: 4
  },
  welcomeText: { fontSize: 24, fontWeight: 'bold' },
  statusSub: { fontSize: 13, marginTop: 4, fontWeight: '500' },
  
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  roleBtn: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 15, borderWidth: 1 },
  roleText: { fontSize: 10, fontWeight: 'bold', marginLeft: 6 },
  profileBtn: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },

  scroll: { padding: 20 },

  busCard: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    padding: 18, 
    borderRadius: 20, 
    borderWidth: 1, 
    marginBottom: 35, 
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8
  },
  busIcon: { width: 54, height: 54, borderRadius: 15, justifyContent: 'center', alignItems: 'center' },
  busInfo: { flex: 1, marginLeft: 15 },
  busTitle: { fontSize: 18, fontWeight: 'bold' },

  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 20, marginLeft: 5 },
  
  grid: { 
    flexDirection: 'row', 
    flexWrap: 'wrap', 
    justifyContent: 'space-between' 
  },
  gridItem: { 
    width: '48%', 
    paddingVertical: 25, 
    borderRadius: 20, 
    borderWidth: 1, 
    marginBottom: 15,
    alignItems: 'center',
    elevation: 3
  },
  iconCircle: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  gridLabel: { fontSize: 13, fontWeight: 'bold' },

  nav: { 
    position: 'absolute', 
    bottom: 0, 
    left: 0, 
    right: 0, 
    flexDirection: 'row', 
    justifyContent: 'space-around', 
    paddingVertical: 12, 
    paddingBottom: Platform.OS === 'ios' ? 35 : 25,
    borderTopWidth: 1,
    elevation: 20
  },
  navItem: { alignItems: 'center', justifyContent: 'center' },
  activeDot: { position: 'absolute', top: -12, width: 20, height: 3, borderBottomLeftRadius: 5, borderBottomRightRadius: 5 },
  navText: { fontSize: 10, marginTop: 4 }
});