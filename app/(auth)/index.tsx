/* ============================================================
   EduTransporter - Tela de Login
   Desenvolvido por: Vitor Santana (ADS Uninassau Caruaru)
   
   Nota da equipe: Este codigo foi revisado e aprovada pelo grupo.
   Qualquer duvida, chamar no grupo!
============================================================ */

import { useState, useEffect, useRef } from 'react';

/* Componentes nativos do React Native */
import { 
  StyleSheet, Text, View, TextInput, TouchableOpacity, 
  ScrollView, StatusBar, SafeAreaView, Dimensions, Animated 
} from 'react-native';

/* Icones do projeto */
import { Feather, FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';

/* Gradiente para o fundo */
import { Image } from 'react-native';

/* Navigacao do app */
import { Stack, useRouter } from 'expo-router';

/* Contextos */
import { useApp } from '../../contexts/AppContext';

/* API de login */
import { login, LoginResponse } from '../../services/api';

/* Pegando a largura da tela para animacoes */
const { width } = Dimensions.get('window');

/* ============================================================
   COMPONENTE PRINCIPAL - Login Screen
   Equipe: Aqui e onde comeca o frontend visualmente
   TODO: Conectar com API depois que o backend estiver pronto
============================================================ */
export default function Index() {
  const router = useRouter();
  const { setAuth } = useApp();
   
  /* Estados do formulario */
  const [loginType, setLoginType] = useState<'aluno' | 'motorista'>('aluno');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [lembrar, setLembrar] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

/* ==========================================================
     ANIMACOES - Feito pelo Vitor
     Equipe: Onibus correndo!
     Dica: Nao mexer senao quebra a animacao
  ========================================================== */
  const busAnim = useRef(new Animated.Value(-50)).current;
  const cardAnim = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  /* Inicializando as animacoes */
  useEffect(() => {
    /* Onibus correndo na estrada */
    Animated.loop(
      Animated.timing(busAnim, { toValue: width - 80, duration: 6000, useNativeDriver: true })
    ).start();

    /* Card entrada com mola (spring) */
    Animated.spring(cardAnim, { toValue: 1, useNativeDriver: true }).start();

    /* Loading spinner */
    Animated.loop(
      Animated.timing(rotateAnim, { toValue: 1, duration: 1000, useNativeDriver: true })
    ).start();
  }, []);

  /* ==========================================================
     PALETA DE CORES - Identidade Visual EduTransporter
     Equipe: Cores aprovadas pelo designer
  ========================================================== */
  const theme = {
    gold: '#F5A623',        /* Dourado principal */
    darkBlue: '#1A253A',    /* Azul escuro noite */
    textLight: '#94A3B8',   /* Cinza claro texto */
  };

/* ==========================================================
     FUNCAO DE LOGIN
     Grupo: Validacao diferente para Aluno e Motorista
   ========================================================== */
  const handleLogin = async () => {
    // Validacao para Aluno (aceita CPF ou email)
    if (loginType === 'aluno') {
      if (!email.trim()) {
        // Toast de erro seria aqui - por agora so retorna
        return;
      }
    }
    
    // Validacao para Motorista (só email)
    if (loginType === 'motorista') {
      if (!email.trim() || !email.includes('@')) {
        return;
      }
    }
    
    // Validar senha
    if (!password.trim()) {
      return;
    }
    
    setLoading(true);
    
    // Login real (usando a API)
    try {
      const result: LoginResponse = await login(email.trim(), password);
      
      if (result.success && result.token && result.user) {
        // Guardar token e user e navegar para home
        setAuth(result.token, { 
          id: result.user.id, 
          nome: result.user.nome, 
          email: result.user.email, 
          role: result.user.role 
        }, result.user.role);
        
        router.replace('/(tabs)/home');
      } else {
        // Se API retornar erro, mostra mensagem
        alert(result.message || 'Erro ao fazer login');
      }
    } catch (error) {
      console.log('Login error:', error);
      alert('Erro de conexão');
    }
    
    setLoading(false);
  };

  /* ==========================================================
     RENDERIZACAO PRINCIPAL
     TIME: Bora renderizar tudo
  ========================================================== */
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar barStyle="light-content" />

      {/* Fundo com imagem */}
      <View style={styles.container}>
        <Image 
          source={require('../../assets/foto-fundo.png')} 
          style={styles.backgroundImage}
          pointerEvents="none"
        />
        <View style={styles.gridMesh} pointerEvents="none">
          {[...Array(20)].map((_, i) => (
            <View key={i} style={[styles.gridLine, { top: i * 40, opacity: 0.03 }]} />
          ))}
          {[...Array(15)].map((_, i) => (
            <View key={`h-${i}`} style={[styles.gridLineH, { left: i * 50, opacity: 0.03 }]} />
          ))}
        </View>

        {/* Scroll principal */}
        <SafeAreaView style={{ flex: 1 }}>
          <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            
            {/* Area do onibus correndo */}
            <View style={styles.busAnimationArea}>
              <View style={styles.roadLabels}>
                <View style={styles.labelItem}>
                  <Feather name="shield" size={12} color={theme.gold} />
                  <Text style={styles.labelText}>SEGURO</Text>
                </View>
                <View style={styles.labelItem}>
                  <FontAwesome5 name="school" size={12} color={theme.gold} />
                  <Text style={styles.labelText}>ROTA ESCOLAR</Text>
                </View>
              </View>

              <View style={styles.roadTrack}>
                <Animated.View style={{ transform: [{ translateX: busAnim }] }}>
                  <FontAwesome5 name="bus-alt" size={24} color={theme.gold} />
                </Animated.View>
              </View>
            </View>

            {/* Titulo do app */}
            <View style={styles.headerTitle}>
              <View style={styles.iconBox}>
                <FontAwesome5 name="bus" size={28} color={theme.gold} />
              </View>
              <Text style={styles.appName}>EduTransporter</Text>
            </View>
            <Text style={styles.appSub}>A sua jornada escolar segura</Text>

            {/* Card de login (maxWidth 400px para nao esticar) */}
            <Animated.View 
              style={[
                styles.glassCard,
                { opacity: cardAnim, transform: [{ scale: cardAnim.interpolate({ inputRange: [0, 1], outputRange: [0.9, 1] }) }] }
              ]}
            >
              {/* Toggle Aluno / Motorista - limpar dados ao mudar */}
              <View style={styles.toggleTrack}>
                <TouchableOpacity 
                  style={[styles.toggleBtn, loginType === 'aluno' && { backgroundColor: theme.gold }]}
                  onPress={() => {
                    setLoginType('aluno');
                    setEmail('');
                    setPassword('');
                  }}
                >
                  <Text style={[styles.toggleText, { color: loginType === 'aluno' ? theme.darkBlue : '#FFF' }]}>Aluno</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={[styles.toggleBtn, loginType === 'motorista' && { backgroundColor: theme.gold }]}
                  onPress={() => {
                    setLoginType('motorista');
                    setEmail('');
                    setPassword('');
                  }}
                >
                  <Text style={[styles.toggleText, { color: loginType === 'motorista' ? theme.darkBlue : '#FFF' }]}>Motorista</Text>
                </TouchableOpacity>
              </View>

              {/* Input email */}
              <View style={styles.inputGroup}>
                <Feather name="mail" size={18} color={theme.textLight} style={styles.inputIcon} />
                <TextInput 
                  placeholder={loginType === 'aluno' ? 'E-mail ou CPF' : 'E-mail'} 
                  placeholderTextColor={theme.textLight} 
                  style={styles.input}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType={loginType === 'aluno' ? 'default' : 'email-address'}
                />
              </View>

              {/* Input senha com olho show/hide */}
              <View style={styles.inputGroup}>
                <Feather name="lock" size={18} color={theme.textLight} style={styles.inputIcon} />
                <TextInput 
                  placeholder="Senha" 
                  placeholderTextColor={theme.textLight} 
                  secureTextEntry={!showPassword} 
                  style={styles.input}
                  value={password}
                  onChangeText={setPassword}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeBtn}>
                  <Feather name={showPassword ? "eye" : "eye-off"} size={18} color={theme.textLight} />
                </TouchableOpacity>
              </View>

              {/* Linha: Lembrar + Esqueceu senha */}
              <View style={styles.rowSupport}>
                <TouchableOpacity style={styles.checkArea} onPress={() => setLembrar(!lembrar)}>
                  <View style={[styles.checkbox, lembrar && styles.checkboxChecked]}>
                    {lembrar && <Feather name="check" size={12} color="#1A253A" />}
                  </View>
                  <Text style={styles.checkText}>Lembrar</Text>
                </TouchableOpacity>
                <TouchableOpacity><Text style={styles.forgotText}>Esqueceu a senha</Text></TouchableOpacity>
              </View>

              {/* Botao ENTRAR dourado com borda luminosa 3D */}
              <View style={styles.mainBtnWrapper}>
                <View style={styles.mainBtnGlow} />
                <View style={styles.mainBtnBorder} />
                <TouchableOpacity style={styles.mainBtn} onPress={handleLogin} disabled={loading}>
                  {loading ? (
                    <Animated.View style={{ transform: [{ rotate: rotateAnim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] }) }] }}>
                      <Feather name="loader" size={24} color={theme.darkBlue} />
                    </Animated.View>
                  ) : (
                    <Text style={styles.mainBtnText}>Entrar</Text>
                  )}
                </TouchableOpacity>
              </View>
            </Animated.View>

            {/* Rodape com links */}
            <View style={styles.footer}>
              <TouchableOpacity style={styles.registerBtn} onPress={() => router.push('/registo')}>
                <Text style={styles.registerText}>Nao tem conta - Registe-se aqui</Text>
              </TouchableOpacity>
              
              <View style={styles.divider} />
              
              <View style={styles.footerLinks}>
                <TouchableOpacity onPress={() => router.push('/termos')}>
                  <Text style={styles.smallLink}>Termos de Privacidade</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => router.push('/admin-login')}>
                  <Text style={styles.smallLink}>Acesso Administrativo</Text>
                </TouchableOpacity>
                <Text style={styles.smallLink}>v 10.1.0</Text>
              </View>
            </View>

          </ScrollView>
        </SafeAreaView>
      </View>
    </>
  );
}

/* ==========================================================
   ESTILOS - CSS-in-JS do EduTransporter
   Equipe: Styles organizados por secao
============================================================ */
const styles = StyleSheet.create({
/* Container principal */
  container: { flex: 1 },
  
  /* Camada de fundo (tudo here) */
  backgroundLayer: { ...StyleSheet.absoluteFillObject, zIndex: 0 },
  
  /* Imagem de fundo */
  backgroundImage: { ...StyleSheet.absoluteFillObject, width: '100%', height: '100%', resizeMode: 'cover' },
  
  /* Overlay leve */
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(18, 26, 47, 0.1)', zIndex: 1 },
  
  
  /* Mesh de linhas GPS */
  gridMesh: { ...StyleSheet.absoluteFillObject, zIndex: 2 },
  gridLine: { position: 'absolute', left: 0, right: 0, height: 1, backgroundColor: '#F5A623' },
  gridLineH: { position: 'absolute', top: 0, bottom: 0, width: 1, backgroundColor: '#F5A623' },
  
  /* Circulos flutuantes */
  floatingCircle: { position: 'absolute', borderRadius: 150, zIndex: 0 },
  floatingCircle1: { position: 'absolute', top: -50, left: -50, width: 200, height: 200, borderRadius: 100, backgroundColor: 'rgba(245, 166, 35, 0.05)', zIndex: 0 },
  floatingCircle2: { position: 'absolute', bottom: -80, right: -70, width: 300, height: 300, borderRadius: 150, backgroundColor: 'rgba(43, 85, 128, 0.08)', zIndex: 0 },
  
  /* Scroll content centralizado */
  scrollContent: { flexGrow: 1, padding: 24, justifyContent: 'center', alignItems: 'center' },
  
  /* Area do onibus */
  busAnimationArea: { marginBottom: 20, width: '100%' },
  roadLabels: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  labelItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  labelText: { color: '#94A3B8', fontSize: 10, fontWeight: 'bold', letterSpacing: 1 },
  roadTrack: { height: 40, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', justifyContent: 'center' },

  /* Titulo */
  headerTitle: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 5 },
  iconBox: { backgroundColor: 'rgba(245, 166, 35, 0.1)', padding: 10, borderRadius: 15 },
  appName: { fontSize: 32, fontWeight: '900', color: '#FFF' },
  appSub: { fontSize: 15, color: '#94A3B8', marginBottom: 30, borderLeftWidth: 4, borderLeftColor: '#F5A623', paddingLeft: 12 },

  /* Card glassmorphism */
  glassCard: { 
    backgroundColor: 'rgba(30, 41, 59, 0.7)', 
    borderRadius: 32, 
    padding: 24, 
    borderWidth: 1, 
    borderColor: 'rgba(255,255,255,0.1)', 
    elevation: 10,
    width: '100%',
    maxWidth: 400,
  },
  
  /* Toggle Aluno/Motorista */
  toggleTrack: { flexDirection: 'row', backgroundColor: '#0F172A', borderRadius: 50, padding: 4, marginBottom: 25 },
  toggleBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 12, borderRadius: 50 },
  toggleText: { fontWeight: 'bold', marginLeft: 8, fontSize: 14 },

  /* Inputs */
  inputGroup: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#0F172A', borderRadius: 18, marginBottom: 15, height: 58, borderWidth: 1, borderColor: '#334155' },
  inputIcon: { marginLeft: 18 },
  input: { flex: 1, color: '#FFF', paddingHorizontal: 12, fontSize: 16 },
  eyeBtn: { paddingRight: 18 },

  /* Linha suporte */
  rowSupport: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 25 },
  checkArea: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  checkbox: { width: 20, height: 20, borderRadius: 4, borderWidth: 2, borderColor: '#94A3B8', justifyContent: 'center', alignItems: 'center' },
  checkboxChecked: { backgroundColor: '#F5A623', borderColor: '#F5A623' },
  checkText: { color: '#94A3B8', fontSize: 14 },
  forgotText: { color: '#F5A623', fontWeight: 'bold', fontSize: 14 },

/* Botao entrar */
  mainBtn: { 
    height: 58, 
    backgroundColor: '#F5A623', 
    borderRadius: 18, 
    flexDirection: 'row', 
    justifyContent: 'center', 
    alignItems: 'center', 
    elevation: 8, 
    shadowColor: '#F5A623', 
    shadowOpacity: 0.3, 
    shadowRadius: 10,
    width: '100%',
    position: 'relative',
    overflow: 'visible',
  },
  mainBtnText: { color: '#1A253A', fontSize: 18, fontWeight: 'bold' },
  mainBtnWrapper: {
    position: 'relative',
    overflow: 'visible',
  },
  mainBtnBorder: {
    position: 'absolute',
    top: -3,
    left: -3,
    right: -3,
    bottom: -3,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: '#C9A227',
  },
  mainBtnGlow: {
    position: 'absolute',
    top: -6,
    left: -6,
    right: -6,
    bottom: -6,
    borderRadius: 26,
    borderWidth: 2,
    borderColor: 'rgba(201, 162, 39, 0.2)',
  },

  /* Footer */
  footer: { alignItems: 'center', marginTop: 30, width: '100%', maxWidth: 400 },
  registerBtn: { 
    paddingVertical: 12, 
    paddingHorizontal: 20, 
    borderWidth: 1, 
    borderColor: 'rgba(255,255,255,0.15)', 
    borderRadius: 25,
  },
  registerText: { color: '#FFFFFF', fontSize: 14, fontWeight: '600' },
  divider: { width: '100%', height: 1, backgroundColor: 'rgba(255,255,255,0.08)', marginVertical: 20 },
  footerLinks: { flexDirection: 'row', gap: 15, flexWrap: 'wrap', justifyContent: 'center' },
  smallLink: { color: '#B8C5D6', fontSize: 12 },
});

/* ==========================================================
   FIM DO ARQUIVO - Equipe EduTransporter
   Feito com cafe por Vitor Santana
============================================================ */