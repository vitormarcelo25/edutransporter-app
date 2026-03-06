import React, { useState } from 'react';
import { 
  StyleSheet, Text, View, TextInput, TouchableOpacity, 
  ScrollView, StatusBar 
} from 'react-native';
import { FontAwesome5, Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack, useRouter } from 'expo-router';

type LoginRole = 'motorista' | 'aluno';

export default function Login() {
  const router = useRouter();
  
  // Estado para controlar que tipo de login está selecionado
  const [loginType, setLoginType] = useState<LoginRole>('motorista');

  // Cores necessárias apenas para o Login
  const theme = {
    textLight: '#888888',
    darkGreen: '#005b44', 
    tealCard: '#38b29c',
  };

  const handleLogin = () => {
    // Redireciona para o index.tsx (Home) 
    // Futuramente podes passar o "loginType" como parâmetro para a Home saber quem fez login
    router.replace('/'); 
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <LinearGradient 
        colors={['#00C6FF', '#4ade80']} 
        style={styles.loginContainer}
      >
        <StatusBar barStyle="light-content" />
        
        <ScrollView 
          contentContainerStyle={styles.scrollContent} 
          showsVerticalScrollIndicator={false}
          style={{ width: '100%' }}
        >
          <View style={styles.loginHeader}>
            <View style={styles.logoPlaceholder}>
              <FontAwesome5 name="shield-alt" size={24} color="#005b44" />
            </View>
            <Feather name="chevron-right" size={28} color="#005b44" />
          </View>
          
          <View style={styles.logoContainer}>
            <View style={styles.illustrationPlaceholder}>
              <FontAwesome5 name="bus" size={60} color={theme.darkGreen} />
              <FontAwesome5 name="graduation-cap" size={40} color={theme.darkGreen} style={{ position: 'absolute', top: -15 }} />
            </View>
            <Text style={styles.appName}>EduTransporter</Text>
          </View>

          <View style={styles.formContainer}>
            
            {/* NOVO: Alternador de Perfil (Motorista vs Aluno) */}
            <View style={styles.roleToggleContainer}>
              <TouchableOpacity
                style={[styles.roleBtn, loginType === 'motorista' && styles.roleBtnActive]}
                onPress={() => setLoginType('motorista')}
                activeOpacity={0.8}
              >
                <FontAwesome5 
                  name="user-tie" 
                  size={14} 
                  color={loginType === 'motorista' ? theme.tealCard : '#FFF'} 
                  style={{marginRight: 6}} 
                />
                <Text style={[styles.roleText, loginType === 'motorista' && styles.roleTextActive]}>
                  Motorista
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.roleBtn, loginType === 'aluno' && styles.roleBtnActive]}
                onPress={() => setLoginType('aluno')}
                activeOpacity={0.8}
              >
                <FontAwesome5 
                  name="user-graduate" 
                  size={14} 
                  color={loginType === 'aluno' ? theme.tealCard : '#FFF'} 
                  style={{marginRight: 6}} 
                />
                <Text style={[styles.roleText, loginType === 'aluno' && styles.roleTextActive]}>
                  Aluno / Pai
                </Text>
              </TouchableOpacity>
            </View>

            {/* Inputs que mudam dinamicamente baseados na escolha */}
            <TextInput 
              style={styles.inputSimple} 
              placeholder={loginType === 'motorista' ? "E-mail do Motorista" : "E-mail do Responsável/Aluno"} 
              placeholderTextColor={theme.textLight} 
            />
            <TextInput 
              style={styles.inputSimple} 
              placeholder="Senha" 
              secureTextEntry 
              placeholderTextColor={theme.textLight} 
            />
            
            {/* Opcional: Esconder Cidade e Escola se não forem precisos para o motorista, 
                ou manter igual. Aqui mantive para ficar fiel ao teu Figma. */}
            <TextInput style={styles.inputSimple} placeholder="Cidade" placeholderTextColor={theme.textLight} />
            <TextInput style={styles.inputSimple} placeholder="Escola" placeholderTextColor={theme.textLight} />

            <TouchableOpacity 
              style={styles.btnProsseguir}
              onPress={handleLogin}
            >
              <Text style={styles.btnProsseguirText}>Prosseguir</Text>
            </TouchableOpacity>
          </View>

          <View style={{ flexGrow: 1, minHeight: 40 }} />

          <View style={styles.footerLinks}>
            <TouchableOpacity>
              <Text style={styles.footerText}>Esqueceu a senha?</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => router.push('/telas/ajuda')}>
              <Text style={styles.footerText}>Central de ajuda</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.copyrightContainer}>
            <Text style={styles.copyrightText}>Todos os Direitos reservados a EduTransporte</Text>
          </View>
        </ScrollView>
      </LinearGradient>
    </>
  );
}

const styles = StyleSheet.create({
  loginContainer: { flex: 1 },
  scrollContent: { flexGrow: 1, alignItems: 'center', padding: 20 },
  loginHeader: { width: '100%', flexDirection: 'row', justifyContent: 'space-between', marginTop: 20, paddingHorizontal: 10 },
  logoPlaceholder: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.3)', justifyContent: 'center', alignItems: 'center' },
  logoContainer: { alignItems: 'center', marginTop: 10, marginBottom: 30 },
  illustrationPlaceholder: { width: 150, height: 150, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 75, justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  appName: { fontSize: 28, fontWeight: 'bold', color: '#005b44' }, 
  
  formContainer: { width: '100%', maxWidth: 400, backgroundColor: '#38b29c', padding: 24, borderRadius: 30, shadowColor: '#000', shadowOffset: { width: 0, height: 5 }, shadowOpacity: 0.2, shadowRadius: 10, elevation: 8 },
  
  // Estilos do Novo Alternador
  roleToggleContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    borderRadius: 24,
    padding: 4,
    marginBottom: 20,
  },
  roleBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 20,
  },
  roleBtnActive: {
    backgroundColor: '#FFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  roleText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
  roleTextActive: {
    color: '#38b29c',
  },

  inputSimple: { height: 48, backgroundColor: '#FFF', borderRadius: 24, marginBottom: 16, paddingHorizontal: 20, color: '#333' },
  btnProsseguir: { height: 48, backgroundColor: '#FFF', borderRadius: 24, justifyContent: 'center', alignItems: 'center', marginTop: 10, alignSelf: 'center', width: 150 },
  btnProsseguirText: { color: '#38b29c', fontSize: 16, fontWeight: 'bold' },
  footerLinks: { alignItems: 'center', gap: 8, marginBottom: 20 },
  footerText: { color: '#005b44', fontSize: 14, fontWeight: '600' },
  copyrightContainer: { alignItems: 'center', marginBottom: 10 },
  copyrightText: { color: '#005b44', fontSize: 11, fontWeight: '500' },
});