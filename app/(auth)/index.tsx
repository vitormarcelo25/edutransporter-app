/* ============================================================
   EduTransporter - Tela de Login
   Desenvolvido por: Vitor Santana (ADS Uninassau Caruaru)
   
   Nota da equipe: Este codigo foi revisado e aprovada pelo grupo.
   Qualquer duvida, chamar no grupo!
============================================================ */

import { useState, useEffect, useRef, useMemo } from 'react';

/* Componentes nativos do React Native */
import { 
  StyleSheet, Text, View, TextInput, TouchableOpacity, 
  ScrollView, StatusBar, SafeAreaView, Dimensions, Animated, Easing 
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

/* Utilitários de CPF */
import { formatarCPF, limparCPF, validarCPF } from '../../services/cpf';

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
  const [cpfError, setCpfError] = useState('');

/* ==========================================================
     ANIMACOES - Feito pelo Vitor
     Equipe: Onibus correndo!
     Upgrade: Animações profissionais com easing e efeitos
  ========================================================== */
  const busAnim = useRef(new Animated.Value(-50)).current;
  const busOpacity = useRef(new Animated.Value(0)).current;
  const cardAnim = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const cloudAnim1 = useRef(new Animated.Value(0)).current;
  const cloudAnim2 = useRef(new Animated.Value(0)).current;
  const roadDashAnim = useRef(new Animated.Value(0)).current;
  const exhaustAnim = useRef(new Animated.Value(0)).current;
  const busBounce = useRef(new Animated.Value(0)).current;
  const glowPulse = useRef(new Animated.Value(0)).current;

/* Inicializando as animacoes */
  useEffect(() => {
    /* Onibus correndo - loop com fade in/out */
    const startBusAnimation = () => {
      // Reset
      busAnim.setValue(-50);
      busOpacity.setValue(0);
      
      // Fade in suave
      Animated.timing(busOpacity, {
        toValue: 1,
        duration: 600,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }).start();
      
      // Move pela estrada inteira (usa a largura da tela)
      Animated.timing(busAnim, {
        toValue: width + 50,
        duration: 6000,
        easing: Easing.bezier(0.25, 0.1, 0.25, 1),
        useNativeDriver: true,
      }).start(({ finished }) => {
        if (finished) {
          // Fade out correto (opacity → 0)
          Animated.timing(busOpacity, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }).start(() => {
            startBusAnimation(); // Reinicia o ciclo
          });
        }
      });
    };
    
    startBusAnimation();

    /* Bounce do ônibus (simulando estrada irregular) */
    Animated.loop(
      Animated.sequence([
        Animated.timing(busBounce, {
          toValue: -2,
          duration: 200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(busBounce, {
          toValue: 1,
          duration: 200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(busBounce, {
          toValue: 0,
          duration: 150,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();

    /* Nuvens drifting */
    Animated.loop(
      Animated.timing(cloudAnim1, {
        toValue: 1,
        duration: 15000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();

    Animated.loop(
      Animated.timing(cloudAnim2, {
        toValue: 1,
        duration: 20000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();

    /* Linhas tracejadas da estrada */
    Animated.loop(
      Animated.timing(roadDashAnim, {
        toValue: 1,
        duration: 800,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();

    /* Fumaça/exhaust do ônibus */
    Animated.loop(
      Animated.sequence([
        Animated.timing(exhaustAnim, {
          toValue: 1,
          duration: 600,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(exhaustAnim, {
          toValue: 0,
          duration: 600,
          easing: Easing.in(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();

    /* Glow pulse (estrelas + lua + faróis) */
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowPulse, {
          toValue: 1,
          duration: 1500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(glowPulse, {
          toValue: 0,
          duration: 1500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();

    /* Card entrada com mola (spring) */
    Animated.spring(cardAnim, { toValue: 1, tension: 50, friction: 8, useNativeDriver: true }).start();

    /* Loading spinner */
    Animated.loop(
      Animated.timing(rotateAnim, { toValue: 1, duration: 1000, easing: Easing.linear, useNativeDriver: true })
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
    setCpfError('');

    // Validacao para Aluno (CPF ou email)
    if (loginType === 'aluno') {
      const valor = email.trim();
      if (!valor) {
        setCpfError('CPF ou e-mail é obrigatório');
        return;
      }
      const cpfLimpo = limparCPF(valor);
      if (cpfLimpo.length === 11) {
        if (!validarCPF(cpfLimpo)) {
          setCpfError('CPF inválido');
          return;
        }
      } else if (!valor.includes('@')) {
        setCpfError('Informe um CPF válido ou e-mail');
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
      const valor = email.trim();
      const cpfLimpo = loginType === 'aluno' && limparCPF(valor).length === 11 ? limparCPF(valor) : undefined;
      const emailLogin = loginType === 'aluno' && valor.includes('@') ? valor : undefined;
      const result: LoginResponse = await login(emailLogin || valor, password, loginType, cpfLimpo);
      
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
            
            {/* ========== CENA DO ÔNIBUS - Cenário Noturno Premium ========== */}
            <View style={styles.sceneContainer}>
              {/* Moldura com borda dourada sutil */}
              <View style={styles.sceneFrame}>

                {/* ---- CÉU NOTURNO ---- */}
                <View style={styles.skyArea}>
                  {/* Estrelas */}
                  {[
                    { top: 8, left: '12%', size: 2, opacity: 0.8 },
                    { top: 15, left: '28%', size: 1.5, opacity: 0.5 },
                    { top: 6, left: '45%', size: 2.5, opacity: 0.9 },
                    { top: 20, left: '55%', size: 1.5, opacity: 0.4 },
                    { top: 10, left: '68%', size: 2, opacity: 0.7 },
                    { top: 18, left: '78%', size: 1, opacity: 0.6 },
                    { top: 5, left: '85%', size: 2, opacity: 0.5 },
                    { top: 22, left: '35%', size: 1, opacity: 0.3 },
                    { top: 12, left: '92%', size: 1.5, opacity: 0.6 },
                    { top: 25, left: '8%', size: 1, opacity: 0.4 },
                  ].map((star, i) => (
                    <Animated.View
                      key={`star-${i}`}
                      style={{
                        position: 'absolute',
                        top: star.top,
                        left: star.left as any,
                        width: star.size,
                        height: star.size,
                        borderRadius: star.size,
                        backgroundColor: '#FFF',
                        opacity: glowPulse.interpolate({
                          inputRange: [0, 1],
                          outputRange: [star.opacity * 0.4, star.opacity],
                        }),
                      }}
                    />
                  ))}

                  {/* Lua com glow */}
                  <View style={styles.moonContainer}>
                    <Animated.View style={[styles.moonGlow, {
                      opacity: glowPulse.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0.15, 0.35],
                      }),
                      transform: [{
                        scale: glowPulse.interpolate({
                          inputRange: [0, 1],
                          outputRange: [1, 1.3],
                        }),
                      }],
                    }]} />
                    <View style={styles.moon}>
                      <Feather name="moon" size={16} color="#FFE4A0" />
                    </View>
                  </View>

                  {/* Nuvens animadas */}
                  <Animated.View style={[styles.cloud, {
                    transform: [{ translateX: cloudAnim1.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, 70],
                    }) }]
                  }]}>
                    <Feather name="cloud" size={18} color="rgba(255,255,255,0.12)" />
                  </Animated.View>
                  <Animated.View style={[styles.cloud, styles.cloud2, {
                    transform: [{ translateX: cloudAnim2.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, -50],
                    }) }]
                  }]}>
                    <Feather name="cloud" size={14} color="rgba(255,255,255,0.08)" />
                  </Animated.View>
                  <Animated.View style={[styles.cloud3, {
                    transform: [{ translateX: cloudAnim1.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, 40],
                    }) }]
                  }]}>
                    <Feather name="cloud" size={12} color="rgba(255,255,255,0.06)" />
                  </Animated.View>
                </View>

                {/* ---- CITYSCAPE SILHOUETTE ---- */}
                <View style={styles.cityscape}>
                  {/* Prédios da cidade (silhuetas) */}
                  <View style={[styles.building, { left: '3%', width: 16, height: 36 }]}>
                    <View style={[styles.buildingWindow, { top: 4, left: 3 }]} />
                    <View style={[styles.buildingWindow, { top: 4, left: 9 }]} />
                    <View style={[styles.buildingWindow, { top: 12, left: 3 }]} />
                    <View style={[styles.buildingWindow, { top: 12, left: 9 }]} />
                    <View style={[styles.buildingWindow, { top: 20, left: 3 }]} />
                    <View style={[styles.buildingWindow, { top: 20, left: 9 }]} />
                  </View>
                  <View style={[styles.building, { left: '10%', width: 12, height: 24 }]}>
                    <View style={[styles.buildingWindow, { top: 4, left: 3 }]} />
                    <View style={[styles.buildingWindow, { top: 12, left: 3 }]} />
                  </View>
                  <View style={[styles.building, { left: '16%', width: 20, height: 44 }]}>
                    <View style={[styles.buildingAntenna]} />
                    <View style={[styles.buildingWindow, { top: 6, left: 4 }]} />
                    <View style={[styles.buildingWindow, { top: 6, left: 12 }]} />
                    <View style={[styles.buildingWindow, { top: 14, left: 4 }]} />
                    <View style={[styles.buildingWindow, { top: 14, left: 12 }]} />
                    <View style={[styles.buildingWindow, { top: 22, left: 4 }]} />
                    <View style={[styles.buildingWindow, { top: 22, left: 12 }]} />
                    <View style={[styles.buildingWindow, { top: 30, left: 4 }]} />
                    <View style={[styles.buildingWindow, { top: 30, left: 12 }]} />
                  </View>
                  <View style={[styles.building, { left: '28%', width: 14, height: 30 }]}>
                    <View style={[styles.buildingWindow, { top: 5, left: 4 }]} />
                    <View style={[styles.buildingWindow, { top: 13, left: 4 }]} />
                    <View style={[styles.buildingWindow, { top: 21, left: 4 }]} />
                  </View>
                  {/* Árvore */}
                  <View style={[styles.tree, { left: '38%' }]}>
                    <View style={styles.treeCanopy} />
                    <View style={styles.treeTrunk} />
                  </View>
                  {/* Escola (maior) */}
                  <View style={[styles.building, styles.schoolBuilding, { left: '44%', width: 30, height: 28 }]}>
                    <View style={styles.schoolRoof} />
                    <View style={[styles.buildingWindowLit, { top: 8, left: 5 }]} />
                    <View style={[styles.buildingWindowLit, { top: 8, left: 13 }]} />
                    <View style={[styles.buildingWindowLit, { top: 8, left: 21 }]} />
                    <View style={[styles.buildingWindowLit, { top: 16, left: 5 }]} />
                    <View style={[styles.buildingWindowLit, { top: 16, left: 13 }]} />
                    <View style={[styles.buildingWindowLit, { top: 16, left: 21 }]} />
                  </View>
                  {/* Árvore */}
                  <View style={[styles.tree, { left: '62%' }]}>
                    <View style={styles.treeCanopy} />
                    <View style={styles.treeTrunk} />
                  </View>
                  <View style={[styles.building, { left: '68%', width: 18, height: 38 }]}>
                    <View style={[styles.buildingWindow, { top: 4, left: 4 }]} />
                    <View style={[styles.buildingWindow, { top: 4, left: 11 }]} />
                    <View style={[styles.buildingWindow, { top: 12, left: 4 }]} />
                    <View style={[styles.buildingWindow, { top: 12, left: 11 }]} />
                    <View style={[styles.buildingWindow, { top: 20, left: 4 }]} />
                    <View style={[styles.buildingWindow, { top: 20, left: 11 }]} />
                    <View style={[styles.buildingWindow, { top: 28, left: 4 }]} />
                  </View>
                  <View style={[styles.building, { left: '80%', width: 14, height: 22 }]}>
                    <View style={[styles.buildingWindow, { top: 4, left: 4 }]} />
                    <View style={[styles.buildingWindow, { top: 12, left: 4 }]} />
                  </View>
                  <View style={[styles.building, { left: '88%', width: 16, height: 32 }]}>
                    <View style={[styles.buildingAntenna]} />
                    <View style={[styles.buildingWindow, { top: 5, left: 3 }]} />
                    <View style={[styles.buildingWindow, { top: 5, left: 9 }]} />
                    <View style={[styles.buildingWindow, { top: 13, left: 3 }]} />
                    <View style={[styles.buildingWindow, { top: 13, left: 9 }]} />
                    <View style={[styles.buildingWindow, { top: 21, left: 3 }]} />
                  </View>
                </View>

                {/* ---- CALÇADA SUPERIOR ---- */}
                <View style={styles.sidewalk} />

                {/* ---- ESTRADA PRINCIPAL ---- */}
                <View style={styles.roadContainer}>
                  {/* Borda lateral superior da estrada */}
                  <View style={styles.roadEdgeStripe} />

                  {/* Pista superior (vazia - sentido contrário) */}
                  <View style={styles.roadLaneTop} />

                  {/* Linha central tracejada animada */}
                  <View style={styles.roadCenterLine}>
                    <Animated.View style={[styles.dashedLine, {
                      transform: [{ translateX: roadDashAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, -44],
                      }) }]
                    }]}>
                      {[...Array(20)].map((_, i) => (
                        <View key={i} style={styles.dashSegment} />
                      ))}
                    </Animated.View>
                  </View>

                  {/* Pista inferior (ônibus anda aqui) */}
                  <View style={styles.roadLaneBottom}>
                    {/* Linhas de velocidade/vento atrás do ônibus */}
                    <Animated.View style={[styles.speedLinesContainer, {
                      transform: [{ translateX: Animated.add(busAnim, new Animated.Value(-45)) }],
                      opacity: busOpacity,
                    }]}>
                      <Animated.View style={[styles.speedLine, styles.speedLine1, {
                        opacity: exhaustAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [0.15, 0.35],
                        }),
                      }]} />
                      <Animated.View style={[styles.speedLine, styles.speedLine2, {
                        opacity: exhaustAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [0.1, 0.25],
                        }),
                      }]} />
                      <Animated.View style={[styles.speedLine, styles.speedLine3, {
                        opacity: exhaustAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [0.08, 0.2],
                        }),
                      }]} />
                    </Animated.View>

                    {/* Ônibus com fumaça e bounce */}
                    <Animated.View style={{
                      position: 'absolute',
                      top: 0,
                      bottom: 0,
                      justifyContent: 'center',
                      transform: [
                        { translateX: busAnim },
                        { translateY: busBounce },
                      ],
                      opacity: busOpacity,
                    }}>
                      <View style={styles.busBody}>
                        {/* Fumaça do escapamento */}
                        <Animated.View style={[styles.exhaustSmoke, {
                          opacity: exhaustAnim.interpolate({
                            inputRange: [0, 1],
                            outputRange: [0.1, 0.35],
                          }),
                          transform: [{
                            scale: exhaustAnim.interpolate({
                              inputRange: [0, 1],
                              outputRange: [0.5, 1.3],
                            }),
                          }, {
                            translateX: exhaustAnim.interpolate({
                              inputRange: [0, 1],
                              outputRange: [0, -10],
                            }),
                          }],
                        }]} />
                        <Animated.View style={[styles.exhaustSmoke2, {
                          opacity: exhaustAnim.interpolate({
                            inputRange: [0, 1],
                            outputRange: [0.15, 0.08],
                          }),
                          transform: [{
                            scale: exhaustAnim.interpolate({
                              inputRange: [0, 1],
                              outputRange: [0.8, 1.6],
                            }),
                          }, {
                            translateX: exhaustAnim.interpolate({
                              inputRange: [0, 1],
                              outputRange: [-6, -20],
                            }),
                          }],
                        }]} />

                        {/* Faróis (glow frontal) */}
                        <Animated.View style={[styles.headlightGlow, {
                          opacity: glowPulse.interpolate({
                            inputRange: [0, 1],
                            outputRange: [0.3, 0.6],
                          }),
                        }]} />

                        {/* Ícone do ônibus */}
                        <FontAwesome5 name="bus-alt" size={28} color={theme.gold} />

                        {/* Sombra embaixo */}
                        <View style={styles.busShadow} />
                      </View>
                    </Animated.View>
                  </View>

                  {/* Borda lateral inferior da estrada */}
                  <View style={[styles.roadEdgeStripe, styles.roadEdgeStripeBottom]} />
                </View>

                {/* ---- CALÇADA INFERIOR ---- */}
                <View style={[styles.sidewalk, styles.sidewalkBottom]} />

              </View>

              {/* ---- BADGES INFORMATIVOS ---- */}
              <View style={styles.badgeRow}>
                <View style={styles.badgeItem}>
                  <View style={styles.badgeIcon}>
                    <Feather name="shield" size={11} color={theme.gold} />
                  </View>
                  <Text style={styles.badgeText}>SEGURO</Text>
                </View>
                <View style={styles.badgeSeparator} />
                <View style={styles.badgeItem}>
                  <View style={styles.badgeIcon}>
                    <Feather name="map-pin" size={11} color={theme.gold} />
                  </View>
                  <Text style={styles.badgeText}>RASTREÁVEL</Text>
                </View>
                <View style={styles.badgeSeparator} />
                <View style={styles.badgeItem}>
                  <View style={styles.badgeIcon}>
                    <FontAwesome5 name="school" size={10} color={theme.gold} />
                  </View>
                  <Text style={styles.badgeText}>ROTA ESCOLAR</Text>
                </View>
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

              {/* Input email / CPF */}
              <View style={[styles.inputGroup, cpfError ? { borderColor: '#EF4444' } : {}]}>
                <Feather name={loginType === 'aluno' ? 'user' : 'mail'} size={18} color={theme.textLight} style={styles.inputIcon} />
                <TextInput 
                  placeholder={loginType === 'aluno' ? 'CPF ou E-mail' : 'E-mail'} 
                  placeholderTextColor={theme.textLight} 
                  style={styles.input}
                  value={loginType === 'aluno' ? formatarCPF(email) : email}
                  onChangeText={(v) => {
                    setEmail(loginType === 'aluno' ? limparCPF(v) : v);
                    setCpfError('');
                  }}
                  keyboardType={loginType === 'aluno' ? 'default' : 'email-address'}
                  maxLength={loginType === 'aluno' ? 14 : undefined}
                />
              </View>
              {cpfError ? <Text style={{ color: '#EF4444', fontSize: 13, marginTop: -10, marginBottom: 10, marginLeft: 5 }}>{cpfError}</Text> : null}

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
  
  /* ====== CENA DO ÔNIBUS - Cenário Noturno Premium ====== */
  sceneContainer: { marginBottom: 20, width: '100%' },
  sceneFrame: {
    width: '100%',
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(245, 166, 35, 0.15)',
    elevation: 8,
    shadowColor: '#F5A623',
    shadowOpacity: 0.1,
    shadowRadius: 12,
  },

  /* Céu noturno */
  skyArea: {
    height: 35,
    backgroundColor: '#0B1120',
    position: 'relative',
  },
  moonContainer: { position: 'absolute', top: 4, right: 18, alignItems: 'center', justifyContent: 'center' },
  moonGlow: { position: 'absolute', width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255, 228, 160, 0.15)' },
  moon: { zIndex: 1 },
  cloud: { position: 'absolute', top: 15, left: 20 },
  cloud2: { position: 'absolute', top: 8, left: 80 },
  cloud3: { position: 'absolute', top: 18, left: '55%' },

  /* Cityscape */
  cityscape: {
    height: 46,
    backgroundColor: '#0D1525',
    position: 'relative',
    overflow: 'hidden',
  },
  building: {
    position: 'absolute',
    bottom: 0,
    backgroundColor: '#141E30',
    borderTopLeftRadius: 2,
    borderTopRightRadius: 2,
  },
  buildingWindow: {
    position: 'absolute',
    width: 3,
    height: 3,
    backgroundColor: 'rgba(255, 228, 160, 0.25)',
    borderRadius: 0.5,
  },
  buildingWindowLit: {
    position: 'absolute',
    width: 4,
    height: 3,
    backgroundColor: 'rgba(245, 166, 35, 0.5)',
    borderRadius: 0.5,
  },
  buildingAntenna: {
    position: 'absolute',
    top: -8,
    left: '50%',
    width: 1,
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  schoolBuilding: {
    backgroundColor: '#1A253A',
    borderTopLeftRadius: 1,
    borderTopRightRadius: 1,
  },
  schoolRoof: {
    position: 'absolute',
    top: -5,
    left: '20%',
    width: '60%',
    height: 6,
    backgroundColor: '#1A253A',
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
  },
  tree: {
    position: 'absolute',
    bottom: 0,
    alignItems: 'center',
  },
  treeCanopy: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#142210',
  },
  treeTrunk: {
    width: 3,
    height: 8,
    backgroundColor: '#2A1A0A',
  },

  /* Calçadas */
  sidewalk: {
    height: 4,
    backgroundColor: '#2A3345',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.06)',
  },
  sidewalkBottom: {
    borderTopWidth: 0,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.04)',
  },

  /* Estrada */
  roadContainer: {
    width: '100%',
    backgroundColor: '#1A253A',
  },
  roadEdgeStripe: {
    height: 2,
    backgroundColor: '#F5A623',
  },
  roadEdgeStripeBottom: {
    backgroundColor: '#D4920A',
  },
  roadLaneTop: {
    height: 22,
    backgroundColor: '#151E30',
  },
  roadCenterLine: {
    height: 3,
    overflow: 'hidden',
    justifyContent: 'center',
  },
  roadLaneBottom: {
    height: 34,
    backgroundColor: '#1A253A',
    overflow: 'hidden',
    position: 'relative',
  },
  dashedLine: {
    flexDirection: 'row',
    position: 'absolute',
    left: -44,
    right: 0,
    justifyContent: 'space-evenly',
    alignItems: 'center',
    height: '100%',
  },
  dashSegment: {
    width: 22,
    height: 2,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 1,
  },

  /* Linhas de velocidade */
  speedLinesContainer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 40,
    justifyContent: 'center',
  },
  speedLine: {
    height: 1.5,
    backgroundColor: 'rgba(245, 166, 35, 0.3)',
    borderRadius: 1,
    marginVertical: 3,
  },
  speedLine1: { width: 24, marginLeft: 0 },
  speedLine2: { width: 16, marginLeft: 6 },
  speedLine3: { width: 20, marginLeft: 2 },

  /* Ônibus */
  busBody: {
    alignItems: 'center',
    position: 'relative',
  },
  busShadow: {
    width: 32,
    height: 5,
    backgroundColor: 'rgba(0,0,0,0.35)',
    borderRadius: 10,
    marginTop: -1,
  },
  exhaustSmoke: {
    position: 'absolute',
    left: -12,
    top: 4,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: 'rgba(180,180,180,0.25)',
  },
  exhaustSmoke2: {
    position: 'absolute',
    left: -20,
    top: 0,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(180,180,180,0.15)',
  },
  headlightGlow: {
    position: 'absolute',
    right: -14,
    top: 2,
    width: 20,
    height: 14,
    borderRadius: 10,
    backgroundColor: 'rgba(245, 220, 130, 0.25)',
  },

  /* Badges */
  badgeRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
    gap: 10,
  },
  badgeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingVertical: 5,
    paddingHorizontal: 10,
    backgroundColor: 'rgba(245, 166, 35, 0.06)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(245, 166, 35, 0.1)',
  },
  badgeIcon: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: 'rgba(245, 166, 35, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: '#94A3B8',
    fontSize: 8,
    fontWeight: 'bold',
    letterSpacing: 1.2,
  },
  badgeSeparator: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: '#334155',
  },

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