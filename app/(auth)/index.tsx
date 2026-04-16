
/**
 * v10.1.0 - Beta Release
 * EduTransporter
 * 
 * Tela de Login - Ponto de entrada do app
 * Toggle para escolher entre Aluno ou Motorista
 * Campos de email/senha com checkbox "Lembrar dados"
 * Botão com ícone de biometria
 */

import React, { useState } from 'react';
import {
  StyleSheet, Text, View, TouchableOpacity,
  ScrollView, StatusBar, SafeAreaView, Platform,
  KeyboardAvoidingView
} from 'react-native';
import { FontAwesome5, Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack, useRouter } from 'expo-router';
import { useApp } from '../../contexts/AppContext';
import { useToast } from '../../contexts/ToastContext';
import { login, LoginResponse } from '../../services/api';
import { CustomInput } from '../../components/ui/CustomInput';

type LoginType = 'motorista' | 'aluno';

export default function Login() {
  const router = useRouter();
  const { theme, setUserRole, setAuth, isLoadingAuth } = useApp();
  const { addToast } = useToast();
   
  const [loginType, setLoginType] = useState<LoginType>('aluno');
  const [loading, setLoading] = useState(false);
  const [lembrarDados, setLembrarDados] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      addToast('error', 'Preencha todos os campos');
      return;
    }
    setLoading(true);
    const result: LoginResponse = await login(email.trim(), password);
    setLoading(false);
    
    if (result.success && result.token && result.user) {
      setAuth(result.token, { id: result.user.id, nome: result.user.nome, email: result.user.email, role: result.user.role }, result.user.role);
      router.replace('/(tabs)/home');
    } else {
      addToast('error', result.message || 'Erro ao fazer login');
    }
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      
      <LinearGradient colors={['#2B3A55', '#1A2436']} style={styles.container}>
        <StatusBar barStyle="light-content" />
        
        <SafeAreaView style={{ flex: 1 }}>
          <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={{ flex: 1 }}
          >
            <TouchableOpacity
              onPress={() => router.push('/ajuda')}
              style={styles.helpBtnAbsolute}
            >
              <Feather name="help-circle" size={24} color={theme.gold} />
            </TouchableOpacity>

            <ScrollView
              contentContainerStyle={styles.scrollContent} 
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              <View style={styles.logoContainer}>
                <View style={styles.logoIconWrapper}>
                  <View style={styles.logoIconBg}>
                    <MaterialCommunityIcons name="bus-side" size={52} color="#F5A623" />
                  </View>
                </View>
                <Text style={styles.appName}>EduTransporter</Text>
                <Text style={styles.appSub}>A sua jornada escolar segura</Text>
              </View>

              <View style={[styles.formContainer, { backgroundColor: theme.card, borderColor: theme.border }]}>
                
                <View style={[styles.roleToggleContainer, { backgroundColor: theme.inputBg, borderColor: theme.border }]}>
                  <TouchableOpacity
                    style={[styles.roleBtn, loginType === 'aluno' && styles.roleBtnActive]}
                    onPress={() => setLoginType('aluno')}
                    activeOpacity={0.8}
                  >
                    <FontAwesome5 name="user-graduate" size={14} color={loginType === 'aluno' ? theme.darkBlue : theme.textMain} style={{marginRight: 6}} />
                    <Text style={[styles.roleText, loginType === 'aluno' && { color: theme.darkBlue }]}>
                      Aluno
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.roleBtn, loginType === 'motorista' && styles.roleBtnActive]}
                    onPress={() => setLoginType('motorista')}
                    activeOpacity={0.8}
                  >
                    <FontAwesome5 name="user-tie" size={14} color={loginType === 'motorista' ? theme.darkBlue : theme.textMain} style={{marginRight: 6}} />
                    <Text style={[styles.roleText, loginType === 'motorista' && { color: theme.darkBlue }]}>
                      Motorista
                    </Text>
                  </TouchableOpacity>
                </View>

                <CustomInput
                  iconName="mail"
                  placeholder="E-mail ou CPF"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={email}
                  onChangeText={setEmail}
                />

                <CustomInput
                  iconName="lock"
                  placeholder="Senha"
                  isPassword={true}
                  value={password}
                  onChangeText={setPassword}
                />

                {/* Checkbox + Esqueceu senha na mesma linha */}
                <View style={styles.lembrarRow}>
                  <TouchableOpacity 
                    style={styles.lembrarContainer}
                    onPress={() => setLembrarDados(!lembrarDados)}
                  >
                    <View style={[styles.checkbox, lembrarDados && styles.checkboxChecked]}>
                      {lembrarDados && <Feather name="check" size={12} color="#FFF" />}
                    </View>
                    <Text style={[styles.lembrarText, { color: theme.subtext }]}>
                      Lembrar
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity>
                    <Text style={styles.esqueceuText}>Esqueceu a senha?</Text>
                  </TouchableOpacity>
                </View>

                {/* Botão Entrar com Biometria */}
                <TouchableOpacity 
                  style={[styles.btnProsseguir, loading && styles.btnDisabled]} 
                  onPress={handleLogin}
                  disabled={loading}
                >
                  <Text style={styles.btnProsseguirText}>
                    {loading ? 'A entrar...' : 'Entrar'}
                  </Text>
                  <MaterialCommunityIcons name="fingerprint" size={24} color="#1A253A" style={{marginLeft: 8}} />
                </TouchableOpacity>
              </View>

              {/* Linha divisória */}
              <View style={[styles.divider, { backgroundColor: theme.border }]} />

              {/* Registro - menos chamativo */}
              <TouchableOpacity style={styles.registerBtn} onPress={() => router.push('/registo')}>
                <Text style={styles.registerText}>
                  Não tem conta? <Text style={{fontWeight: 'bold', color: '#B8C5D6'}}>Registe-se aqui</Text>
                </Text>
              </TouchableOpacity>

              {/* Termos - centralizado e sublinhado */}
              <TouchableOpacity style={styles.termosBtn} onPress={() => router.push('/termos')}>
                <Text style={styles.termosText}>
                  Termos de Privacidade
                </Text>
              </TouchableOpacity>

              {/* Rodapé */}
              <TouchableOpacity style={styles.adminLink} onPress={() => router.push('/admin-login')}>
                <Text style={styles.adminLinkText}>
                  Acesso Administrativo
                </Text>
              </TouchableOpacity>

              <View style={{ height: 20 }} />
              <Text style={styles.versionText}>v 10.1.0</Text>
              <View style={{ height: 20 }} />
               
            </ScrollView>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </LinearGradient>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  helpBtnAbsolute: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 30,
    right: 20,
    zIndex: 10,
    padding: 5,
  },
  scrollContent: { flexGrow: 1, alignItems: 'center', paddingHorizontal: 20, paddingTop: 40 },
  
  logoContainer: { alignItems: 'center', marginTop: 10, marginBottom: 30 },
  logoIconWrapper: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  logoIconBg: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(245,166,35,0.12)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(245,166,35,0.25)',
  },
  appName: { fontSize: 28, fontWeight: '800', color: '#FFFFFF', letterSpacing: 0.5 },
  appSub: { fontSize: 14, color: '#94A3B8', marginTop: 6, fontWeight: '500' },

  formContainer: { 
    width: '100%', maxWidth: 400, padding: 24, 
    borderRadius: 30, shadowColor: '#000', shadowOffset: { width: 0, height: 5 }, 
    shadowOpacity: 0.3, shadowRadius: 10, elevation: 8, marginBottom: 30, 
    borderWidth: 1,
  },
  
  roleToggleContainer: { 
    flexDirection: 'row', borderRadius: 24, 
    padding: 4, marginBottom: 20, borderWidth: 1,
  },
  roleBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 12, borderRadius: 20 },
  roleBtnActive: { backgroundColor: '#F5A623', shadowColor: '#F5A623', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.4, shadowRadius: 4, elevation: 4 },
  roleText: { color: '#FFF', fontWeight: 'bold', fontSize: 14 },

  /* Linha horizontal: checkbox + esqueceu senha */
  lembrarRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingHorizontal: 4,
  },
  lembrarContainer: { flexDirection: 'row', alignItems: 'center' },
  checkbox: { width: 20, height: 20, borderRadius: 4, borderWidth: 2, borderColor: '#94A3B8', marginRight: 8, justifyContent: 'center', alignItems: 'center' },
  checkboxChecked: { backgroundColor: '#F5A623', borderColor: '#F5A623' },
  lembrarText: { fontSize: 13, color: '#94A3B8' },
  esqueceuText: { fontSize: 13, color: '#F5A623', fontWeight: '500' },

  /* Botão Entrar com biometria */
  btnProsseguir: { 
    height: 54, backgroundColor: '#F5A623', borderRadius: 27, 
    justifyContent: 'center', alignItems: 'center', 
    width: '100%', flexDirection: 'row',
    shadowColor: '#F5A623', shadowOffset: { width: 0, height: 4 }, 
    shadowOpacity: 0.3, shadowRadius: 8, elevation: 5 
  },
  btnProsseguirText: { color: '#1A253A', fontSize: 18, fontWeight: 'bold' },
  btnDisabled: { opacity: 0.6 },
  errorText: { color: '#FF6B6B', fontSize: 14, textAlign: 'center', marginTop: 10 },
  
  /* Divisória */
  divider: { height: 1, width: '80%', marginVertical: 20 },
  
  /* Registro - menos chamativo */
  registerBtn: { 
    paddingVertical: 12,
    width: '100%',
    alignItems: 'center',
  },
  registerText: { color: '#B8C5D6', fontSize: 14 },
  
  /* Termos */
  termosBtn: { marginTop: 15 },
  termosText: { 
    fontSize: 12, 
    color: '#B8C5D6', 
    textDecorationLine: 'underline',
    textAlign: 'center',
  },
  
  /* Admin link */
  adminLink: { marginTop: 20 },
  adminLinkText: { 
    fontSize: 11, 
    color: '#6B7A8F', 
    textAlign: 'center',
    fontWeight: '500',
  },
  
  /* Versão */
  versionText: { 
    color: '#5A6A7F', 
    fontSize: 11, 
    textAlign: 'center',
  }
});