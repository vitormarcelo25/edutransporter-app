import React from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TouchableOpacity, 
  SafeAreaView, 
  ScrollView, 
  Switch,
  Platform
} from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';
import { useRouter, Stack } from 'expo-router';

// Voltamos pra importação direta e limpa! 
// Isso resolve o erro de "useApp não é uma função" no seu VS Code.
// Se o visualizador web daqui reclamar de "Could not resolve", pode ignorar que no Expo Go vai rodar perfeito.
import { useApp } from './_layout';

export default function Perfil() {
  const router = useRouter();
  
  // Pegando tudo o que a gente precisa direto do nosso contexto
  const { isDark, toggleTheme, theme, userRole } = useApp();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]}>
      {/* Escondendo a barra nativa do Expo pra ficar um design mais limpo */}
      <Stack.Screen options={{ headerShown: false }} />
      
      {/* Cabeçalho padrão com botão de voltar */}
      <View style={[styles.header, { borderBottomColor: theme.border }]}>
        <TouchableOpacity onPress={() => router.replace('/home')} style={styles.backBtn}>
          <Feather name="arrow-left" size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.text }]}>Meu Perfil</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        
        {/* Informação do Utilizador - Agora é dinâmico, muda se for aluno ou motorista */}
        <View style={styles.profileBox}>
          <View style={[styles.avatar, { backgroundColor: theme.gold }]}>
            {/* Gambiarrazinha pra mostrar a inicial certa do nome */}
            <Text style={styles.avatarTxt}>
              {userRole === 'aluno' ? 'G' : 'C'}
            </Text>
          </View>
          <Text style={[styles.name, { color: theme.text }]}>
            {userRole === 'aluno' ? 'Gabriel Silva' : 'Carlos Mendes'}
          </Text>
          <Text style={{ color: theme.subtext, fontSize: 14 }}>
            {userRole === 'aluno' ? 'Aluno da Rota ORE 3' : 'Motorista do ORE 3'}
          </Text>
          
          <TouchableOpacity style={[styles.editBadge, { backgroundColor: isDark ? '#233248' : '#E2E8F0' }]}>
            <Text style={{ color: theme.text, fontSize: 12, fontWeight: 'bold' }}>Editar Perfil</Text>
          </TouchableOpacity>
        </View>

        {/* Secção: Configurações da Conta */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.subtext }]}>Conta & Privacidade</Text>
          <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
            
            <TouchableOpacity style={styles.item}>
              <View style={styles.itemLeft}>
                <View style={[styles.iconBox, { backgroundColor: 'rgba(49,130,206,0.1)' }]}>
                  <Feather name="user" size={18} color="#3182CE" />
                </View>
                <Text style={[styles.label, { color: theme.text }]}>Dados Pessoais</Text>
              </View>
              <Feather name="chevron-right" size={20} color={theme.subtext} />
            </TouchableOpacity>
            
            <View style={[styles.divider, { backgroundColor: theme.border }]} />

            <TouchableOpacity style={styles.item}>
              <View style={styles.itemLeft}>
                <View style={[styles.iconBox, { backgroundColor: 'rgba(72,187,120,0.1)' }]}>
                  <Feather name="bell" size={18} color="#48BB78" />
                </View>
                <Text style={[styles.label, { color: theme.text }]}>Notificações</Text>
              </View>
              <Feather name="chevron-right" size={20} color={theme.subtext} />
            </TouchableOpacity>
            
            <View style={[styles.divider, { backgroundColor: theme.border }]} />

            <TouchableOpacity style={styles.item}>
              <View style={styles.itemLeft}>
                <View style={[styles.iconBox, { backgroundColor: 'rgba(159,122,234,0.1)' }]}>
                  <Feather name="shield" size={18} color="#9F7AEA" />
                </View>
                <Text style={[styles.label, { color: theme.text }]}>Segurança e Senha</Text>
              </View>
              <Feather name="chevron-right" size={20} color={theme.subtext} />
            </TouchableOpacity>

          </View>
        </View>

        {/* Secção: Configurações Visuais (Tema Claro/Escuro) */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.subtext }]}>Aparência</Text>
          <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <View style={styles.item}>
              <View style={styles.itemLeft}>
                <View style={[styles.iconBox, { backgroundColor: isDark ? 'rgba(245,166,35,0.1)' : '#FEF3C7' }]}>
                  <Feather name={isDark ? "moon" : "sun"} size={18} color={theme.gold} />
                </View>
                <Text style={[styles.label, { color: theme.text }]}>Modo Escuro (Dark Mode)</Text>
              </View>
              {/* Switchzinho maroto pra ligar e desligar o tema na hora */}
              <Switch 
                value={isDark} 
                onValueChange={toggleTheme}
                trackColor={{ false: '#CBD5E1', true: theme.gold }}
                thumbColor={isDark ? '#FFF' : '#F4F3F4'}
              />
            </View>
          </View>
        </View>

        {/* Secção: Suporte e Ajuda */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.subtext }]}>Suporte</Text>
          <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
            
            {/* Esse botão já leva direto pra tela de ajuda que a gente fez */}
            <TouchableOpacity style={styles.item} onPress={() => router.push('/ajuda')}>
              <View style={styles.itemLeft}>
                <View style={[styles.iconBox, { backgroundColor: 'rgba(237,137,54,0.1)' }]}>
                  <Ionicons name="help-buoy-outline" size={18} color="#ED8936" />
                </View>
                <Text style={[styles.label, { color: theme.text }]}>Central de Ajuda</Text>
              </View>
              <Feather name="chevron-right" size={20} color={theme.subtext} />
            </TouchableOpacity>
            
            <View style={[styles.divider, { backgroundColor: theme.border }]} />

            <TouchableOpacity style={styles.item}>
              <View style={styles.itemLeft}>
                <View style={[styles.iconBox, { backgroundColor: 'rgba(160,174,192,0.1)' }]}>
                  <Feather name="info" size={18} color={theme.subtext} />
                </View>
                <Text style={[styles.label, { color: theme.text }]}>Termos e Privacidade</Text>
              </View>
              <Feather name="chevron-right" size={20} color={theme.subtext} />
            </TouchableOpacity>

          </View>
        </View>

        {/* Secção: Sair da Conta */}
        <View style={styles.section}>
          <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
            {/* Botão de logout voltando pra tela de login */}
            <TouchableOpacity style={styles.item} onPress={() => router.replace('/')}>
              <View style={styles.itemLeft}>
                <View style={[styles.iconBox, { backgroundColor: 'rgba(239,68,68,0.1)' }]}>
                  <Feather name="log-out" size={18} color="#EF4444" />
                </View>
                <Text style={[styles.label, { color: '#EF4444' }]}>Sair da Conta</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
        
        {/* Espaço extra no final pro scroll não ficar cortado pelo menu de baixo */}
        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Navegação Inferior (Navbar Flutuante) igual a das outras telas */}
      <View style={[styles.nav, { backgroundColor: theme.card, borderColor: theme.border }]}>
        <TouchableOpacity style={styles.navBtn} onPress={() => router.replace('/home')}>
          <Feather name="home" size={24} color={theme.subtext} />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.navBtn} onPress={() => router.replace('/mapa')}>
          <Feather name="map-pin" size={24} color={theme.subtext} />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.navBtn} onPress={() => router.replace('/chat')}>
          <Feather name="message-square" size={24} color={theme.subtext} />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.navBtn}>
          {/* Coloquei a bolinha dourada aqui pra indicar que a gente tá no Perfil */}
          <View style={[styles.activeDot, { backgroundColor: theme.gold }]} />
          <Feather name="user" size={24} color={theme.gold} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    padding: 20, 
    paddingTop: Platform.OS === 'ios' ? 10 : 25,
    alignItems: 'center',
    borderBottomWidth: 1 
  },
  backBtn: { padding: 8 },
  title: { fontSize: 19, fontWeight: 'bold' },
  
  profileBox: { alignItems: 'center', paddingVertical: 25 },
  avatar: { width: 90, height: 90, borderRadius: 45, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  avatarTxt: { fontSize: 36, fontWeight: '900', color: '#1A253A' },
  name: { fontSize: 22, fontWeight: 'bold' },
  editBadge: { marginTop: 12, paddingHorizontal: 16, paddingVertical: 6, borderRadius: 20 },
  
  section: { paddingHorizontal: 20, marginTop: 25 },
  sectionTitle: { fontSize: 12, fontWeight: 'bold', textTransform: 'uppercase', marginBottom: 10, marginLeft: 10 },
  card: { borderRadius: 20, borderWidth: 1, overflow: 'hidden' },
  item: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16 },
  itemLeft: { flexDirection: 'row', alignItems: 'center' },
  iconBox: { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  label: { fontSize: 16, fontWeight: '600' },
  divider: { height: 1, marginLeft: 65, marginRight: 15 },
  
  nav: { 
    position: 'absolute', 
    bottom: 20, 
    left: 20, 
    right: 20, 
    flexDirection: 'row', 
    justifyContent: 'space-around', 
    padding: 15, 
    borderRadius: 25, 
    borderWidth: 1, 
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5
  },
  navBtn: { padding: 5, alignItems: 'center', justifyContent: 'center' },
  activeDot: { position: 'absolute', top: -10, width: 4, height: 4, borderRadius: 2 }
});