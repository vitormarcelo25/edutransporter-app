/**
 * v10.1.0 - Beta Release
 * EduTransporter
 * 
 * Perfil - Configurações do usuário
 * Dados pessoais, notificações, segurança
 * Toggle para Dark Mode
 * Botão de logout
 */

import React from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TouchableOpacity, 
  SafeAreaView, 
  ScrollView, 
  Switch,
  Platform,
  Image
} from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';
import { useRouter, Stack } from 'expo-router';
import { useApp } from '../_layout';

export default function Perfil() {
  const router = useRouter();
  
  // Pegando tudo o que a gente precisa direto do nosso contexto
  const { isDark, toggleTheme, theme, userRole, userData, clearAuth } = useApp();

  return (
    <SafeAreaView style={styles.container}>
      {/* Escondendo a barra nativa do Expo pra ficar um design mais limpo */}
      <Stack.Screen options={{ headerShown: false }} />
      
      {/* Imagem de fundo */}
      <Image 
        source={require('../../assets/plano-de-fundo-perfil.png')} 
        style={styles.backgroundImage}
        resizeMode="cover"
      />
      
      {/* Overlay para legibilidade do texto */}
      <View style={[styles.overlay, isDark ? styles.overlayDark : styles.overlayLight]} />
      
      {/* Cabeçalho padrão */}
      <View style={[styles.header, { borderBottomColor: theme.border }]}>
        <Text style={[styles.title, { color: theme.text }]}>Meu Perfil</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={styles.content}>
        
        {/* Informação do Utilizador - Agora é dinâmico, muda se for aluno ou motorista */}
        <View style={styles.profileBox}>
          <Text style={[styles.name, { color: theme.text }]}>
            {userData?.nome || (userRole === 'aluno' ? 'Aluno' : 'Motorista')}
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
            
            <TouchableOpacity style={styles.item} onPress={() => router.push('/dados-pessoais')}>
              <View style={styles.itemLeft}>
                <View style={[styles.iconBox, { backgroundColor: 'rgba(49,130,206,0.1)' }]}>
                  <Feather name="user" size={18} color="#3182CE" />
                </View>
                <Text style={[styles.label, { color: theme.text }]}>Dados Pessoais</Text>
              </View>
              <Feather name="chevron-right" size={20} color={theme.subtext} />
            </TouchableOpacity>
            
            <View style={[styles.divider, { backgroundColor: theme.border }]} />

            <TouchableOpacity style={styles.item} onPress={() => router.push('/notificacoes')}>
              <View style={styles.itemLeft}>
                <View style={[styles.iconBox, { backgroundColor: 'rgba(72,187,120,0.1)' }]}>
                  <Feather name="bell" size={18} color="#48BB78" />
                </View>
                <Text style={[styles.label, { color: theme.text }]}>Notificações</Text>
              </View>
              <Feather name="chevron-right" size={20} color={theme.subtext} />
            </TouchableOpacity>
            
            <View style={[styles.divider, { backgroundColor: theme.border }]} />

            <TouchableOpacity style={styles.item} onPress={() => router.push('/seguranca')}>
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

            <TouchableOpacity style={styles.item} onPress={() => router.push('/termos')}>
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
            <TouchableOpacity style={styles.item} onPress={() => { clearAuth(); router.replace('/'); }}>
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { zIndex: 1 },
  backgroundImage: { 
    ...StyleSheet.absoluteFillObject, 
    width: '100%', 
    height: '100%',
    zIndex: -1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 0,
  },
  overlayDark: {
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  overlayLight: {
    backgroundColor: 'rgba(255,255,255,0.9)',
  },
  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    padding: 20, 
    paddingTop: Platform.OS === 'ios' ? 10 : 25,
    alignItems: 'center',
    borderBottomWidth: 1 
  },
  title: { fontSize: 19, fontWeight: 'bold' },
  
  profileBox: { alignItems: 'center', paddingVertical: 25 },
  name: { fontSize: 22, fontWeight: 'bold', marginBottom: 4 },
  editBadge: { marginTop: 8, paddingHorizontal: 16, paddingVertical: 6, borderRadius: 20 },
  
  section: { paddingHorizontal: 20, marginTop: 25 },
  sectionTitle: { fontSize: 12, fontWeight: 'bold', textTransform: 'uppercase', marginBottom: 10, marginLeft: 10 },
  card: { borderRadius: 20, borderWidth: 1, overflow: 'hidden' },
  item: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16 },
  itemLeft: { flexDirection: 'row', alignItems: 'center' },
  iconBox: { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  label: { fontSize: 16, fontWeight: '600' },
  divider: { height: 1, marginLeft: 65, marginRight: 15 }
});