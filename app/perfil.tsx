import React, { useState } from 'react';
import { 
  StyleSheet, Text, View, TouchableOpacity, 
  ScrollView, SafeAreaView, StatusBar, Image, Switch
} from 'react-native';
import { Feather, FontAwesome5 } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';

// Tipagem para simular os perfis
type UserRole = 'motorista' | 'aluno';

export default function Perfil() {
  const router = useRouter();
  
  // Para efeitos de demonstração, podes alternar isto para ver como fica cada perfil
  const [userRole, setUserRole] = useState<UserRole>('motorista');
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  // Cores base do projeto
  const theme = {
    primary: '#00C6FF', 
    background: '#F4F7F6',
    white: '#FFFFFF',
    textDark: '#333333',
    textLight: '#888888',
    red: '#DC3545',   
    tealCard: '#38b29c', 
    darkGreen: '#005b44', 
  };

  // Dados falsos (Mocks) baseados no papel (role)
  const userData = {
    motorista: {
      nome: 'João Silva',
      email: 'joao.motorista@edutransporter.com',
      telefone: '+55 11 99999-0000',
      veiculo: 'Autocarro Escolar - Placa ABC-1234',
      cidade: 'São Paulo, SP'
    },
    aluno: {
      nome: 'Ana Costa',
      email: 'ana.costa@escola.com',
      telefone: '+55 11 98888-1111',
      escola: 'Escola Central de São Paulo',
      cidade: 'São Paulo, SP'
    }
  };

  const currentUser = userData[userRole];

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
        <StatusBar barStyle="dark-content" />
        
        {/* Cabeçalho */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Feather name="arrow-left" size={24} color={theme.textDark} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Meu Perfil</Text>
          
          {/* Botão temporário para testar a mudança de perfil */}
          <TouchableOpacity onPress={() => setUserRole(userRole === 'motorista' ? 'aluno' : 'motorista')}>
            <Feather name="refresh-cw" size={20} color={theme.tealCard} />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          
          {/* Secção de Foto e Nome */}
          <View style={styles.profileHeader}>
            <View style={styles.avatarContainer}>
              <View style={[styles.avatarPlaceholder, { backgroundColor: theme.tealCard }]}>
                <Text style={styles.avatarText}>{currentUser.nome.charAt(0)}</Text>
              </View>
              <TouchableOpacity style={styles.editAvatarBtn} activeOpacity={0.8}>
                <Feather name="camera" size={14} color={theme.white} />
              </TouchableOpacity>
            </View>
            <Text style={styles.userName}>{currentUser.nome}</Text>
            <Text style={styles.userRoleBadge}>
              {userRole === 'motorista' ? 'Motorista Responsável' : 'Aluno / Responsável'}
            </Text>
          </View>

          {/* Secção: Informações da Conta */}
          <Text style={styles.sectionTitle}>Informações da Conta</Text>
          <View style={styles.card}>
            <View style={styles.infoRow}>
              <View style={styles.infoIconBox}>
                <Feather name="mail" size={18} color={theme.tealCard} />
              </View>
              <View style={styles.infoTextContainer}>
                <Text style={styles.infoLabel}>E-mail</Text>
                <Text style={styles.infoValue}>{currentUser.email}</Text>
              </View>
            </View>
            <View style={styles.divider} />

            <View style={styles.infoRow}>
              <View style={styles.infoIconBox}>
                <Feather name="phone" size={18} color={theme.tealCard} />
              </View>
              <View style={styles.infoTextContainer}>
                <Text style={styles.infoLabel}>Telemóvel</Text>
                <Text style={styles.infoValue}>{currentUser.telefone}</Text>
              </View>
            </View>
            <View style={styles.divider} />

            <View style={styles.infoRow}>
              <View style={styles.infoIconBox}>
                <Feather name="map-pin" size={18} color={theme.tealCard} />
              </View>
              <View style={styles.infoTextContainer}>
                <Text style={styles.infoLabel}>Cidade</Text>
                <Text style={styles.infoValue}>{currentUser.cidade}</Text>
              </View>
            </View>
            <View style={styles.divider} />

            <View style={styles.infoRow}>
              <View style={styles.infoIconBox}>
                <FontAwesome5 name={userRole === 'motorista' ? 'bus' : 'school'} size={16} color={theme.tealCard} />
              </View>
              <View style={styles.infoTextContainer}>
                <Text style={styles.infoLabel}>{userRole === 'motorista' ? 'Veículo' : 'Escola'}</Text>
                <Text style={styles.infoValue}>
                  {userRole === 'motorista' ? userData.motorista.veiculo : userData.aluno.escola}
                </Text>
              </View>
            </View>
          </View>

          {/* Secção: Configurações */}
          <Text style={styles.sectionTitle}>Configurações</Text>
          <View style={styles.card}>
            <TouchableOpacity style={styles.settingRow}>
              <View style={styles.settingLeft}>
                <Feather name="lock" size={20} color={theme.textDark} />
                <Text style={styles.settingText}>Alterar Senha</Text>
              </View>
              <Feather name="chevron-right" size={20} color={theme.textLight} />
            </TouchableOpacity>
            <View style={styles.divider} />

            <View style={styles.settingRow}>
              <View style={styles.settingLeft}>
                <Feather name="bell" size={20} color={theme.textDark} />
                <Text style={styles.settingText}>Notificações</Text>
              </View>
              <Switch 
                value={notificationsEnabled} 
                onValueChange={setNotificationsEnabled}
                trackColor={{ false: '#ddd', true: theme.tealCard }}
                thumbColor={'#FFF'}
              />
            </View>
            <View style={styles.divider} />

            <TouchableOpacity style={styles.settingRow} onPress={() => router.push('/telas/ajuda')}>
              <View style={styles.settingLeft}>
                <Feather name="help-circle" size={20} color={theme.textDark} />
                <Text style={styles.settingText}>Central de Ajuda</Text>
              </View>
              <Feather name="chevron-right" size={20} color={theme.textLight} />
            </TouchableOpacity>
          </View>

          {/* Botão de Sair */}
          <TouchableOpacity 
            style={styles.logoutBtn}
            onPress={() => router.replace('/login')}
          >
            <Feather name="log-out" size={20} color={theme.red} />
            <Text style={[styles.logoutText, { color: theme.red }]}>Terminar Sessão</Text>
          </TouchableOpacity>

          <View style={{ height: 40 }} />
        </ScrollView>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    padding: 20, 
    backgroundColor: '#FFF', 
    borderBottomWidth: 1, 
    borderBottomColor: '#EEE' 
  },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  backBtn: { width: 40, height: 40, justifyContent: 'center' },
  
  content: { padding: 20 },
  
  profileHeader: { alignItems: 'center', marginBottom: 30, marginTop: 10 },
  avatarContainer: { position: 'relative', marginBottom: 15 },
  avatarPlaceholder: { 
    width: 100, 
    height: 100, 
    borderRadius: 50, 
    justifyContent: 'center', 
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4
  },
  avatarText: { fontSize: 36, fontWeight: 'bold', color: '#FFF' },
  editAvatarBtn: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#005b44',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#F4F7F6'
  },
  userName: { fontSize: 24, fontWeight: 'bold', color: '#333', marginBottom: 4 },
  userRoleBadge: { 
    fontSize: 12, 
    fontWeight: '600', 
    color: '#38b29c', 
    backgroundColor: 'rgba(56, 178, 156, 0.1)', 
    paddingHorizontal: 12, 
    paddingVertical: 4, 
    borderRadius: 12 
  },

  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 10, marginLeft: 4 },
  card: { 
    backgroundColor: '#FFF', 
    borderRadius: 16, 
    padding: 16, 
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 5,
    elevation: 2
  },
  
  infoRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8 },
  infoIconBox: { 
    width: 40, 
    height: 40, 
    borderRadius: 20, 
    backgroundColor: 'rgba(56, 178, 156, 0.1)', 
    justifyContent: 'center', 
    alignItems: 'center',
    marginRight: 15
  },
  infoTextContainer: { flex: 1 },
  infoLabel: { fontSize: 12, color: '#888', marginBottom: 2 },
  infoValue: { fontSize: 15, fontWeight: '500', color: '#333' },
  
  divider: { height: 1, backgroundColor: '#F0F0F0', marginVertical: 8 },
  
  settingRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12 },
  settingLeft: { flexDirection: 'row', alignItems: 'center' },
  settingText: { fontSize: 16, fontWeight: '500', color: '#333', marginLeft: 15 },
  
  logoutBtn: { 
    flexDirection: 'row', 
    justifyContent: 'center', 
    alignItems: 'center', 
    backgroundColor: '#FFF', 
    padding: 16, 
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#DC3545',
    marginBottom: 20
  },
  logoutText: { fontSize: 16, fontWeight: 'bold', marginLeft: 10 }
});