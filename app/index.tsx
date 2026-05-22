import { useState, useEffect, useRef, useMemo } from 'react';
import { View, StyleSheet, Text, Animated, Easing, Dimensions, StatusBar } from 'react-native';
import { Redirect } from 'expo-router';
import { FontAwesome5, Feather, MaterialCommunityIcons } from '@expo/vector-icons';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const SPLASH_DURATION = 3800;

/* ============================================================
   Partículas douradas flutuantes
============================================================ */
function FloatingParticle({ delay, startX, startY, size, anim }: {
  delay: number; startX: number; startY: number; size: number; anim: Animated.Value;
}) {
  const opacity = anim.interpolate({
    inputRange: [0, 0.2, 0.8, 1],
    outputRange: [0, 0.7, 0.5, 0],
  });
  const translateY = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [startY, startY - 120 - Math.random() * 80],
  });
  const translateX = anim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [startX, startX + (Math.random() - 0.5) * 60, startX + (Math.random() - 0.5) * 100],
  });

  return (
    <Animated.View
      style={[
        styles.particle,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          opacity,
          transform: [{ translateX }, { translateY }],
        },
      ]}
    />
  );
}

/* ============================================================
   Componente principal - Splash Screen Profissional
============================================================ */
export default function Index() {
  const [showSplash, setShowSplash] = useState(true);
  const [displayedText, setDisplayedText] = useState('');
  const fullText = 'EduTransporter';

  // Animações principais
  const fadeIn = useRef(new Animated.Value(0)).current;
  const iconScale = useRef(new Animated.Value(0)).current;
  const iconRotate = useRef(new Animated.Value(0)).current;
  const glowPulse = useRef(new Animated.Value(0)).current;
  const progressWidth = useRef(new Animated.Value(0)).current;
  const subtitleOpacity = useRef(new Animated.Value(0)).current;
  const fadeOut = useRef(new Animated.Value(1)).current;
  const roadAnim = useRef(new Animated.Value(0)).current;

  // Partículas
  const particleAnims = useRef(
    Array.from({ length: 8 }, () => new Animated.Value(0))
  ).current;

  // Dados aleatórios das partículas (gerados uma vez)
  const particleData = useMemo(() =>
    Array.from({ length: 8 }, () => ({
      x: Math.random() * SCREEN_WIDTH,
      y: SCREEN_HEIGHT * 0.4 + Math.random() * SCREEN_HEIGHT * 0.4,
      size: 3 + Math.random() * 5,
      delay: Math.random() * 1500,
    })), []
  );

  useEffect(() => {
    // 1. Fade in geral
    Animated.timing(fadeIn, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();

    // 2. Ícone do ônibus - bounce in
    Animated.sequence([
      Animated.delay(200),
      Animated.spring(iconScale, {
        toValue: 1,
        friction: 4,
        tension: 60,
        useNativeDriver: true,
      }),
    ]).start();

    // 3. Leve rotação do ícone (chegando)
    Animated.sequence([
      Animated.delay(200),
      Animated.timing(iconRotate, {
        toValue: 1,
        duration: 800,
        easing: Easing.out(Easing.back(1.5)),
        useNativeDriver: true,
      }),
    ]).start();

    // 4. Glow pulse contínuo
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowPulse, {
          toValue: 1,
          duration: 1200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(glowPulse, {
          toValue: 0,
          duration: 1200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();

    // 5. Barra de progresso
    Animated.timing(progressWidth, {
      toValue: 1,
      duration: SPLASH_DURATION - 500,
      easing: Easing.bezier(0.25, 0.1, 0.25, 1),
      useNativeDriver: false, // width não suporta native driver
    }).start();

    // 6. Subtítulo aparece
    Animated.sequence([
      Animated.delay(1800),
      Animated.timing(subtitleOpacity, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();

    // 7. Animação da estrada (linhas tracejadas)
    Animated.loop(
      Animated.timing(roadAnim, {
        toValue: 1,
        duration: 1000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();

    // 8. Partículas flutuantes
    particleAnims.forEach((anim, i) => {
      const startParticle = () => {
        anim.setValue(0);
        Animated.sequence([
          Animated.delay(particleData[i].delay),
          Animated.timing(anim, {
            toValue: 1,
            duration: 2000 + Math.random() * 1000,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
          }),
        ]).start(({ finished }) => {
          if (finished) startParticle();
        });
      };
      startParticle();
    });

    // 9. Typing effect
    let i = 0;
    const typingInterval = setInterval(() => {
      if (i < fullText.length) {
        setDisplayedText(fullText.slice(0, i + 1));
        i++;
      } else {
        clearInterval(typingInterval);
      }
    }, 80);

    // 10. Fade out + redirect
    const timer = setTimeout(() => {
      Animated.timing(fadeOut, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }).start(() => {
        setShowSplash(false);
      });
    }, SPLASH_DURATION);

    return () => {
      clearTimeout(timer);
      clearInterval(typingInterval);
    };
  }, []);

  if (!showSplash) {
    return <Redirect href="/(auth)" />;
  }

  const iconRotation = iconRotate.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: ['-10deg', '5deg', '0deg'],
  });

  const glowScale = glowPulse.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.15],
  });

  const glowOpacity = glowPulse.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  const roadTranslate = roadAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -40],
  });

  const progressBarWidth = progressWidth.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <Animated.View style={[styles.container, { opacity: fadeOut }]}>
      <StatusBar barStyle="light-content" backgroundColor="#0D1520" />

      {/* Background gradient layers */}
      <View style={styles.bgGradient1} />
      <View style={styles.bgGradient2} />
      <View style={styles.bgGradient3} />

      {/* Partículas flutuantes */}
      {particleAnims.map((anim, i) => (
        <FloatingParticle
          key={i}
          anim={anim}
          delay={particleData[i].delay}
          startX={particleData[i].x}
          startY={particleData[i].y}
          size={particleData[i].size}
        />
      ))}

      <Animated.View style={[styles.content, { opacity: fadeIn }]}>

        {/* Glow atrás do ícone */}
        <Animated.View
          style={[
            styles.iconGlow,
            { opacity: glowOpacity, transform: [{ scale: glowScale }] },
          ]}
        />

        {/* Ícone do ônibus animado */}
        <Animated.View
          style={[
            styles.iconContainer,
            {
              transform: [
                { scale: iconScale },
                { rotate: iconRotation },
              ],
            },
          ]}
        >
          <View style={styles.iconInner}>
            <FontAwesome5 name="bus-alt" size={48} color="#F5A623" />
          </View>
        </Animated.View>

        {/* Nome do app com typing effect */}
        <View style={styles.titleContainer}>
          <Text style={styles.appName}>{displayedText}</Text>
          <Animated.View
            style={[
              styles.cursor,
              {
                opacity: glowPulse.interpolate({
                  inputRange: [0, 0.5, 1],
                  outputRange: [1, 0, 1],
                }),
              },
            ]}
          />
        </View>

        {/* Subtítulo */}
        <Animated.Text style={[styles.subtitle, { opacity: subtitleOpacity }]}>
          A sua jornada escolar segura
        </Animated.Text>

        {/* Mini estrada animada */}
        <View style={styles.miniRoad}>
          <View style={styles.miniRoadEdge} />
          <View style={styles.miniRoadTrack}>
            <Animated.View
              style={[
                styles.dashedContainer,
                { transform: [{ translateX: roadTranslate }] },
              ]}
            >
              {Array.from({ length: 20 }).map((_, i) => (
                <View key={i} style={styles.dashMark} />
              ))}
            </Animated.View>
            {/* Mini ônibus na estrada */}
            <View style={styles.miniRoadBus}>
              <FontAwesome5 name="bus-alt" size={14} color="#F5A623" />
            </View>
          </View>
          <View style={[styles.miniRoadEdge, styles.miniRoadEdgeBottom]} />
        </View>

        {/* Barra de progresso */}
        <View style={styles.progressContainer}>
          <View style={styles.progressTrack}>
            <Animated.View
              style={[styles.progressBar, { width: progressBarWidth }]}
            >
              <View style={styles.progressGlow} />
            </Animated.View>
          </View>
          <Animated.Text style={[styles.progressLabel, { opacity: subtitleOpacity }]}>
            Preparando tudo para você...
          </Animated.Text>
        </View>

        {/* Badges informativos */}
        <Animated.View style={[styles.badges, { opacity: subtitleOpacity }]}>
          <View style={styles.badge}>
            <Feather name="shield" size={12} color="#F5A623" />
            <Text style={styles.badgeText}>Seguro</Text>
          </View>
          <View style={styles.badgeDot} />
          <View style={styles.badge}>
            <Feather name="map-pin" size={12} color="#F5A623" />
            <Text style={styles.badgeText}>Rastreável</Text>
          </View>
          <View style={styles.badgeDot} />
          <View style={styles.badge}>
            <Feather name="clock" size={12} color="#F5A623" />
            <Text style={styles.badgeText}>Pontual</Text>
          </View>
        </Animated.View>
      </Animated.View>

      {/* Versão */}
      <Animated.Text style={[styles.version, { opacity: subtitleOpacity }]}>
        v10.2.0
      </Animated.Text>
    </Animated.View>
  );
}

/* ============================================================
   Estilos
============================================================ */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0D1520',
  },
  bgGradient1: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#0D1520',
  },
  bgGradient2: {
    position: 'absolute',
    top: -SCREEN_HEIGHT * 0.2,
    left: -SCREEN_WIDTH * 0.3,
    width: SCREEN_WIDTH * 1.6,
    height: SCREEN_HEIGHT * 0.7,
    borderRadius: SCREEN_WIDTH,
    backgroundColor: 'rgba(26, 37, 58, 0.6)',
  },
  bgGradient3: {
    position: 'absolute',
    bottom: -SCREEN_HEIGHT * 0.15,
    right: -SCREEN_WIDTH * 0.2,
    width: SCREEN_WIDTH * 0.8,
    height: SCREEN_HEIGHT * 0.4,
    borderRadius: SCREEN_WIDTH,
    backgroundColor: 'rgba(245, 166, 35, 0.04)',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  // Glow
  iconGlow: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: 'rgba(245, 166, 35, 0.12)',
    top: SCREEN_HEIGHT * 0.5 - 160,
  },
  // Ícone
  iconContainer: {
    marginBottom: 28,
  },
  iconInner: {
    width: 100,
    height: 100,
    borderRadius: 30,
    backgroundColor: 'rgba(245, 166, 35, 0.1)',
    borderWidth: 2,
    borderColor: 'rgba(245, 166, 35, 0.25)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Título
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    minHeight: 42,
  },
  appName: {
    fontSize: 34,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  cursor: {
    width: 3,
    height: 32,
    backgroundColor: '#F5A623',
    marginLeft: 2,
    borderRadius: 2,
  },
  subtitle: {
    fontSize: 15,
    color: '#94A3B8',
    marginBottom: 40,
    letterSpacing: 0.3,
  },
  // Mini estrada
  miniRoad: {
    width: '100%',
    maxWidth: 280,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 40,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  miniRoadEdge: {
    height: 2,
    backgroundColor: '#F5A623',
  },
  miniRoadEdgeBottom: {
    backgroundColor: '#D4920A',
  },
  miniRoadTrack: {
    height: 30,
    backgroundColor: '#1A253A',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  dashedContainer: {
    flexDirection: 'row',
    position: 'absolute',
    left: 0,
    right: -40,
    justifyContent: 'space-evenly',
    alignItems: 'center',
    height: '100%',
  },
  dashMark: {
    width: 16,
    height: 2,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 1,
    marginHorizontal: 6,
  },
  miniRoadBus: {
    position: 'absolute',
    left: '48%',
    top: 4,
  },
  // Progresso
  progressContainer: {
    width: '100%',
    maxWidth: 260,
    alignItems: 'center',
    marginBottom: 30,
  },
  progressTrack: {
    width: '100%',
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 12,
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#F5A623',
    borderRadius: 2,
    position: 'relative',
  },
  progressGlow: {
    position: 'absolute',
    right: 0,
    top: -2,
    width: 16,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(245, 166, 35, 0.5)',
  },
  progressLabel: {
    fontSize: 12,
    color: '#64748B',
    letterSpacing: 0.2,
  },
  // Badges
  badges: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  badgeText: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '600',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  badgeDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: '#334155',
  },
  // Partículas
  particle: {
    position: 'absolute',
    backgroundColor: 'rgba(245, 166, 35, 0.5)',
  },
  // Versão
  version: {
    position: 'absolute',
    bottom: 30,
    alignSelf: 'center',
    fontSize: 11,
    color: '#334155',
    letterSpacing: 1,
  },
});