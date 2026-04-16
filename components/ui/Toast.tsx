import React, { useState, useEffect } from 'react';
import { 
  View, Text, StyleSheet, Animated, Easing, 
  Platform, Pressable, 
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useApp } from '../../contexts/AppContext';

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastProps {
  visible: boolean;
  type: ToastType;
  message: string;
  onClose: () => void;
  duration?: number;
}

export const Toast = ({ 
  visible, 
  type, 
  message, 
  onClose,
  duration = 3000 
}: ToastProps) => {
  const { theme } = useApp();
  const [animateValue] = useState(new Animated.Value(0));
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (visible) {
      // Anima entrada
      Animated.timing(animateValue, {
        toValue: 1,
        duration: 300,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false,
      }).start();

      // Define timeout para fechar
      const id = setTimeout(() => {
        Animated.timing(animateValue, {
          toValue: 0,
          duration: 300,
          easing: Easing.in(Easing.cubic),
          useNativeDriver: false,
        }).start(() => {
          onClose();
        });
      }, duration);
      setTimeoutId(id);
    } else if (!visible && animateValue._value === 1) {
      // Anima saída se for fechado manualmente
      Animated.timing(animateValue, {
        toValue: 0,
        duration: 300,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: false,
      }).start(() => {
        onClose();
      });
    }

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [visible, animateValue, duration, onClose]);

  if (!visible && animateValue._value === 0) {
    return null;
  }

  const bgColor = {
    success: '#48BB78',
    error: '#EF4444',
    info: '#3182CE',
    warning: '#F5A623',
  }[type];

  const iconName = {
    success: 'check-circle',
    error: 'x-circle',
    info: 'info',
    warning: 'alert-triangle',
  }[type];

  const interpolatedValue = animateValue.interpolate({
    inputRange: [0, 1],
    outputRange: [Platform.OS === 'ios' ? -80 : -100, 20],
  });

  return (
    <Animated.View style={[
      styles.container,
      { transform: [{ translateY: interpolatedValue }] },
      { backgroundColor: bgColor },
    ]}>
      <View style={styles.content}>
        <Feather name={iconName} size={20} color="#FFF" />
        <Text style={styles.message}>{message}</Text>
      </View>
      <Pressable onPress={onClose} style={styles.closeButton}>
        <Feather name="x" size={16} color="rgba(255,255,255,0.8)" />
      </Pressable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 20,
    left: 20,
    right: 20,
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    zIndex: 1000,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  message: {
    color: '#FFF',
    fontSize: 15,
    marginLeft: 12,
    flex: 1,
  },
  closeButton: {
    padding: 8,
  },
});