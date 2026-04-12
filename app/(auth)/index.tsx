
import React, { useState } from 'react';
import { 
  StyleSheet, Text, View, TouchableOpacity, 
  ScrollView, StatusBar, SafeAreaView, Image, Platform,
  KeyboardAvoidingView 
} from 'react-native';
// Trazendo os ícones pra dar aquela cara de app profissional
import { FontAwesome5, Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack, useRouter } from 'expo-router';
// Importando contexto global e a api fake que criamos
import { useApp } from '../../contexts/AppContext';
import { fakeLogin } from '../../services/api';
// Nossos componentes chiques extraídos
import { CustomInput } from '../../components/ui/CustomInput';

// Front end vitorsantana! O choro foi grande mas o login tá aí, chique demais KSKSKS

// Tipo pra gente saber se é o aluno ou motorista que tá logando, pro TypeScript não chorar
type LoginType = 'motorista' | 'aluno';

export default function Login() {
  const router = useRouter();
  const { theme } = useApp();
  
  // App começa assumindo que é aluno
  const [loginType, setLoginType] = useState<LoginType>('aluno');

  // Função fake de login por enquanto. Depois a gente liga na API de verdade!
  const handleLogin = async () => {
    // Usando nossa função separada pra não poluir a interface
    await fakeLogin('teste@teste.com', '1234');
    router.replace('/(tabs)/home'); 
  };

  return (
    <>
      {/* Tirando o header feio que o Expo bota por padrão */}
      <Stack.Screen options={{ headerShown: false }} />
      
      {/* Fundo degradê pra dar aquele charme */}
      <LinearGradient colors={['#2B3A55', '#1A2436']} style={styles.container}>
        <StatusBar barStyle="light-content" />
        
        <SafeAreaView style={{ flex: 1 }}>
          
          {/* A MÁGICA AQUI: O KeyboardAvoidingView salva a vida e impede o teclado de engolir a tela */}
          <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={{ flex: 1 }}
          >
            <View style={styles.header}>
              <View style={{ width: 28 }} />
              <Text style={styles.headerTitle}>Entrar</Text>
              
              {/* Botãozinho de interrogação pra página de ajuda, caso o usuário seja meio perdido */}
              <TouchableOpacity onPress={() => router.push('/ajuda')} style={styles.helpBtnHeader}>
                <Feather name="help-circle" size={24} color={theme.gold} />
              </TouchableOpacity>
            </View>

            {/* O keyboardShouldPersistTaps="handled" arrumou o bug de ter que clicar duas vezes pra fechar o teclado */}
            <ScrollView 
              contentContainerStyle={styles.scrollContent} 
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              
              {/* Nossa logo com o gif do ônibus */}
              <View style={styles.logoContainer}>
                <View style={[styles.illustrationPlaceholder, { borderColor: theme.border }]}>
                  {/* Se o caminho da imagem quebrar no PC, confere a pasta assets! */}
                  <Image 
                    source={require('../../assets/onibus.gif')}
                    style={styles.gifImage}
                    resizeMode="contain"
                  />
                </View>
                <Text style={styles.appName}>EduTransporter</Text>
                <Text style={styles.appSub}>A sua jornada escolar segura</Text>
              </View>

              <View style={[styles.formContainer, { backgroundColor: theme.card, borderColor: theme.border }]}>
                
                {/* Botõezinhos estilo switch pra escolher aluno ou motorista */}
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

                {/* Campo de e-mail agora com ícone dentro pra ficar nível app gringo */}
                <CustomInput 
                  iconName="mail"
                  placeholder="E-mail ou CPF"
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
                
                {/* Campo de Senha com o esquema do olhinho */}
                <CustomInput 
                  iconName="lock"
                  placeholder="Senha"
                  isPassword={true}
                />

                {/* Botão de Entrar */}
                <TouchableOpacity style={styles.btnProsseguir} onPress={handleLogin}>
                  <Text style={styles.btnProsseguirText}>Entrar</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.footerLinks}>
                <TouchableOpacity>
                  <Text style={styles.footerText}>Esqueceu a senha?</Text>
                </TouchableOpacity>
              </View>

              {/* Empurrando o botão de registro lá pro final da tela */}
              <View style={{flex: 1, minHeight: 40}} />

              <TouchableOpacity style={styles.loginLinkBtn} onPress={() => router.push('/registo')}>
                <Text style={styles.loginLinkText}>
                  Não tem conta? <Text style={{fontWeight: 'bold', color: theme.gold}}>Registe-se aqui</Text>
                </Text>
              </TouchableOpacity>

              {/* Nossa versão do app pra dar um ar de projeto sério */}
              <View style={{ height: 30 }} />
              <Text style={styles.versionText}>v 1.0.0</Text>
              <View style={{ height: 20 }} />
              
            </ScrollView>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </LinearGradient>
    </>
  );
}

// Estilos separados pra não virar bagunça
const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { 
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', 
    paddingHorizontal: 20, paddingTop: Platform.OS === 'ios' ? 0 : 10, paddingBottom: 10 
  },
  headerTitle: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },
  helpBtnHeader: { padding: 5 },
  scrollContent: { flexGrow: 1, alignItems: 'center', paddingHorizontal: 20 },
  
  logoContainer: { alignItems: 'center', marginTop: 10, marginBottom: 30 },
  illustrationPlaceholder: { 
    width: 140, height: 140, backgroundColor: 'rgba(255,255,255,0.05)', 
    borderRadius: 70, justifyContent: 'center', alignItems: 'center', 
    marginBottom: 15, borderWidth: 1, overflow: 'hidden' 
  },
  gifImage: { width: 120, height: 120 },
  appName: { fontSize: 32, fontWeight: '900', color: '#FFFFFF', letterSpacing: 1 }, 
  appSub: { fontSize: 16, color: '#94A3B8', marginTop: 5 },

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

  btnProsseguir: { 
    height: 54, backgroundColor: '#F5A623', borderRadius: 27, 
    justifyContent: 'center', alignItems: 'center', marginTop: 10, 
    width: '100%', shadowColor: '#F5A623', shadowOffset: { width: 0, height: 4 }, 
    shadowOpacity: 0.3, shadowRadius: 8, elevation: 5 
  },
  btnProsseguirText: { color: '#1A253A', fontSize: 18, fontWeight: 'bold' },
  
  footerLinks: { alignItems: 'center', marginBottom: 20 },
  footerText: { color: '#F5A623', fontSize: 15, fontWeight: '600' },
  
  loginLinkBtn: { 
    padding: 15, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 25, 
    width: '100%', maxWidth: 400, alignItems: 'center', borderWidth: 1, 
    borderColor: 'rgba(255,255,255,0.1)', marginTop: 20 
  },
  loginLinkText: { color: '#94A3B8', fontSize: 15 },
  
  versionText: { color: '#94A3B8', fontSize: 12, textAlign: 'center', opacity: 0.6 }
});
