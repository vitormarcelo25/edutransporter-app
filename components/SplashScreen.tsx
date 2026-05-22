import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, StatusBar, Text, Animated, Easing } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';

export default function SplashScreen() {
  const iconScale = useRef(new Animated.Value(0)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;
  const pulse = useRef(new Animated.Value(0)).current;
  const dot1 = useRef(new Animated.Value(0)).current;
  const dot2 = useRef(new Animated.Value(0)).current;
  const dot3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Ícone com bounce
    Animated.spring(iconScale, {
      toValue: 1,
      friction: 4,
      tension: 50,
      useNativeDriver: true,
    }).start();

    // Texto fade in
    Animated.sequence([
      Animated.delay(400),
      Animated.timing(textOpacity, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();

    // Pulse contínuo no glow
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Dots animados (um após o outro em loop)
    const animateDot = (dot: Animated.Value, delay: number) => {
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(dot, {
            toValue: 1,
            duration: 400,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(dot, {
            toValue: 0,
            duration: 400,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.delay(800 - delay),
        ])
      ).start();
    };

    animateDot(dot1, 0);
    animateDot(dot2, 200);
    animateDot(dot3, 400);
  }, []);

  const glowScale = pulse.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.2],
  });

  const glowOpacity = pulse.interpolate({
    inputRange: [0, 1],
    outputRange: [0.2, 0.5],
  });

  const dotTranslate = (dot: Animated.Value) =>
    dot.interpolate({
      inputRange: [0, 1],
      outputRange: [0, -6],
    });

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0D1520" />

      {/* Background decorativo */}
      <View style={styles.bgCircle1} />
      <View style={styles.bgCircle2} />

      {/* Glow */}
      <Animated.View
        style={[
          styles.glow,
          { opacity: glowOpacity, transform: [{ scale: glowScale }] },
        ]}
      />

      {/* Ícone */}
      <Animated.View style={[styles.iconBox, { transform: [{ scale: iconScale }] }]}>
        <FontAwesome5 name="bus-alt" size={40} color="#F5A623" />
      </Animated.View>

      {/* Texto */}
      <Animated.Text style={[styles.text, { opacity: textOpacity }]}>
        EduTransporter
      </Animated.Text>

      {/* Loading dots */}
      <Animated.View style={[styles.dotsRow, { opacity: textOpacity }]}>
        <Animated.View style={[styles.dot, { transform: [{ translateY: dotTranslate(dot1) }] }]} />
        <Animated.View style={[styles.dot, { transform: [{ translateY: dotTranslate(dot2) }] }]} />
        <Animated.View style={[styles.dot, { transform: [{ translateY: dotTranslate(dot3) }] }]} />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0D1520',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bgCircle1: {
    position: 'absolute',
    top: -100,
    left: -80,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: 'rgba(26, 37, 58, 0.5)',
  },
  bgCircle2: {
    position: 'absolute',
    bottom: -60,
    right: -60,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(245, 166, 35, 0.04)',
  },
  glow: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(245, 166, 35, 0.1)',
  },
  iconBox: {
    width: 88,
    height: 88,
    borderRadius: 26,
    backgroundColor: 'rgba(245, 166, 35, 0.1)',
    borderWidth: 2,
    borderColor: 'rgba(245, 166, 35, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  text: {
    color: '#FFFFFF',
    fontSize: 30,
    fontWeight: '900',
    letterSpacing: 0.5,
    marginBottom: 24,
  },
  dotsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#F5A623',
  },
});