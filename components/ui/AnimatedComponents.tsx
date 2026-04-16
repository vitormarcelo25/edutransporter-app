import React, { useRef } from 'react';
import { TouchableOpacity, Text, StyleSheet, Animated, ViewStyle, Platform } from 'react-native';

// Botão animado com feedback visual ao pressionar
interface AnimatedButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  style?: ViewStyle;
  loading?: boolean;
}

export function AnimatedButton({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  style,
  loading = false,
}: AnimatedButtonProps) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  // Animação ao pressionar
  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 3,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

  // Estilos baseados na variante
  const getButtonStyle = () => {
    const base = [styles.button, styles[`button_${size}`]];
    
    switch (variant) {
      case 'primary':
        base.push(styles.buttonPrimary);
        break;
      case 'secondary':
        base.push(styles.buttonSecondary);
        break;
      case 'outline':
        base.push(styles.buttonOutline);
        break;
    }
    
    if (disabled) {
      base.push(styles.buttonDisabled);
    }
    
    return base;
  };

  // Estilos do texto baseado na variante
  const getTextStyle = () => {
    const base = [styles.text, styles[`text_${size}`]];
    
    switch (variant) {
      case 'primary':
        base.push(styles.textPrimary);
        break;
      case 'secondary':
        base.push(styles.textSecondary);
        break;
      case 'outline':
        base.push(styles.textOutline);
        break;
    }
    
    if (disabled) {
      base.push(styles.textDisabled);
    }
    
    return base;
  };

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity
        style={[getButtonStyle(), style]}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled || loading}
        activeOpacity={0.8}
      >
        <Text style={getTextStyle()}>
          {loading ? 'Aguarde...' : title}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

// Botão de ícone animado
interface AnimatedIconButtonProps {
  icon: React.ReactNode;
  onPress: () => void;
  size?: number;
  backgroundColor?: string;
  disabled?: boolean;
}

export function AnimatedIconButton({
  icon,
  onPress,
  size = 48,
  backgroundColor = 'rgba(255, 255, 255, 0.1)',
  disabled = false,
}: AnimatedIconButtonProps) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  const handlePress = () => {
    // Animação de scale
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.85,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 3,
        useNativeDriver: true,
      }),
    ]).start();

    // Animação de rotação sutil
    Animated.sequence([
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(rotateAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '15deg'],
  });

  return (
    <Animated.View
      style={{
        transform: [
          { scale: scaleAnim },
          { rotate },
        ],
      }}
    >
      <TouchableOpacity
        style={[
          styles.iconButton,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor,
          },
          disabled && styles.iconButtonDisabled,
        ]}
        onPress={handlePress}
        disabled={disabled}
        activeOpacity={0.7}
      >
        {icon}
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  // Estilos do botão principal
  button: {
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  button_small: {
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  button_medium: {
    paddingVertical: 14,
    paddingHorizontal: 28,
  },
  button_large: {
    paddingVertical: 18,
    paddingHorizontal: 36,
  },
  buttonPrimary: {
    backgroundColor: '#F5A623',
  },
  buttonSecondary: {
    backgroundColor: '#3182CE',
  },
  buttonOutline: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#F5A623',
  },
  buttonDisabled: {
    backgroundColor: '#37474F',
    opacity: 0.6,
  },

  // Estilos do texto
  text: {
    fontWeight: 'bold',
  },
  text_small: {
    fontSize: 14,
  },
  text_medium: {
    fontSize: 16,
  },
  text_large: {
    fontSize: 18,
  },
  textPrimary: {
    color: '#1A253A',
  },
  textSecondary: {
    color: '#FFFFFF',
  },
  textOutline: {
    color: '#F5A623',
  },
  textDisabled: {
    color: '#94A3B8',
  },

  // Estilos do botão de ícone
  iconButton: {
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  iconButtonDisabled: {
    opacity: 0.5,
  },
});
