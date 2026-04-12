import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, Text, View, TouchableOpacity, SafeAreaView, ScrollView, Platform
} from 'react-native';
import { Feather, FontAwesome5, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

// Puxando o contexto global certinho
import { useApp } from '../_layout';

export default function HomeScreen() {
  const router = useRouter();
  
  // Puxamos também o setUserRole para podermos trocar de conta na hora da apresentação
  const { theme, userRole, setUserRole, selectedSeat } = useApp();
  
  const [currentDate, setCurrentDate] = useState('');
  const [currentTime, setCurrentTime] = useState('');

  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date();
      const options: Intl.DateTimeFormatOptions = { weekday: 'long', day: 'numeric', month: 'long' };
      setCurrentDate(now.toLocaleDateString('pt-BR', options));
      setCurrentTime(now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }));
    };

    updateDateTime();
    const timer = setInterval(updateDateTime, 10000); 
    return () => clearInterval(timer);
  }, []);

  // O botãozinho mágico para testares a mudança de layout na hora
  const toggleRole = () => {
    if (setUserRole) {
      setUserRole(userRole === 'aluno' ? 'motorista' : 'aluno');
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]}>
      
      {/* CABEÇALHO */}
      <View style={[styles.header, { backgroundColor: theme.card, borderBottomColor: theme.border }]}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.welcomeText, { color: theme.text }]}>Olá!</Text>
          <Text style={[styles.statusSub, { color: theme.subtext }]}>
            {currentDate} • {currentTime}
          </Text>
        </View>

        <View style={styles.headerRight}>
          {/* Botão de trocar perfil */}
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

          <TouchableOpacity style={[styles.profileBtn, { backgroundColor: theme.gold }]} onPress={() => router.push('/(tabs)/perfil')}>
            <FontAwesome5 name="user-alt" size={16} color="#1A253A" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        
        {/* CARD PRINCIPAL (Leva para o mapa de assentos) */}
        <TouchableOpacity 
          style={[styles.busCard, { backgroundColor: theme.card, borderColor: theme.border }]}
          onPress={() => router.push(userRole === 'aluno' ? '/listas' : '/(tabs)/home')}
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
                  <Ionicons name={selectedSeat ? "checkmark-circle" : "alert-circle"} size={14} color={selectedSeat ? "#48BB78" : theme.gold} />
                  <Text style={{ fontSize: 12, fontWeight: 'bold', color: selectedSeat ? '#48BB78' : theme.gold }}>
                    {selectedSeat ? `Assento reservado: Nº ${selectedSeat}` : 'Escolha seu lugar'}
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

        {/* GRID DE BOTÕES */}
        <View style={styles.grid}>
          {userRole === 'aluno' && (
            <>
              <TouchableOpacity style={[styles.gridItem, { backgroundColor: theme.card, borderColor: theme.border }]} onPress={() => router.push('/(tabs)/mapa')}>
                <View style={[styles.iconCircle, { backgroundColor: 'rgba(72,187,120,0.1)' }]}>
                  <Feather name="map-pin" size={22} color="#48BB78" />
                </View>
                <Text style={[styles.gridLabel, { color: theme.text }]}>Ver Mapa</Text>
              </TouchableOpacity>

              {/* AQUI ESTÁ A MÁGICA: O novo botão para a funcionalidade do vídeo! */}
              <TouchableOpacity style={[styles.gridItem, { backgroundColor: theme.card, borderColor: theme.border }]} onPress={() => router.push('/token')}>
                <View style={[styles.iconCircle, { backgroundColor: 'rgba(245,166,35,0.1)' }]}>
                  <Feather name="shield" size={22} color={theme.gold} />
                </View>
                <Text style={[styles.gridLabel, { color: theme.text }]}>Passe / Token</Text>
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

          {/* Botões comuns aos dois */}
          <TouchableOpacity style={[styles.gridItem, { backgroundColor: theme.card, borderColor: theme.border }]} onPress={() => router.push('/(tabs)/chat')}>
            <View style={[styles.iconCircle, { backgroundColor: 'rgba(49,130,206,0.1)' }]}>
              <Feather name="message-circle" size={22} color="#3182CE" />
            </View>
            <Text style={[styles.gridLabel, { color: theme.text }]}>Chat da Rota</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.gridItem, { backgroundColor: theme.card, borderColor: theme.border }]} onPress={() => router.push('/avisos')}>
            <View style={[styles.iconCircle, { backgroundColor: 'rgba(239,68,68,0.1)' }]}>
              <Feather name="bell" size={22} color="#EF4444" />
            </View>
            <Text style={[styles.gridLabel, { color: theme.text }]}>Avisos</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

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
});