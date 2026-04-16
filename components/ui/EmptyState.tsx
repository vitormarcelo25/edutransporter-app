import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Easing } from 'react-native';
import { Feather } from '@expo/vector-icons';

// Ícones disponíveis para estados vazios
type EmptyIconName = 'inbox' | 'bell-off' | 'calendar' | 'users' | 'message-circle' | 'map' | 'alert-circle' | 'search';

interface EmptyStateProps {
  icon: EmptyIconName;
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
  iconColor?: string;
}

// Componente de estado vazio com ícone animado
export function EmptyState({
  icon,
  title,
  message,
  actionLabel,
  onAction,
  iconColor = '#F5A623'
}: EmptyStateProps) {
  const bounceAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Animação de bounce no ícone
    Animated.loop(
      Animated.sequence([
        Animated.timing(bounceAnim, {
          toValue: -10,
          duration: 500,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(bounceAnim, {
          toValue: 0,
          duration: 500,
          easing: Easing.in(Easing.quad),
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Animação de fade in no texto
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      delay: 200,
      useNativeDriver: true,
    }).start();
  }, [bounceAnim, fadeAnim]);

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.iconContainer,
          { transform: [{ translateY: bounceAnim }] }
        ]}
      >
        <Feather name={icon} size={64} color={iconColor} />
      </Animated.View>

      <Animated.View style={[styles.textContainer, { opacity: fadeAnim }]}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.message}>{message}</Text>
      </Animated.View>

      {actionLabel && onAction && (
        <TouchableOpacity style={styles.button} onPress={onAction}>
          <Text style={styles.buttonText}>{actionLabel}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

// Presets prontos para diferentes situações
export const EmptyStates = {
  // Estado vazio para lista de avisos
  avisos: (onRefresh?: () => void) => (
    <EmptyState
      icon="bell-off"
      iconColor="#94A3B8"
      title="Nenhum aviso"
      message="Quando houver novos avisos, você verá aqui."
      actionLabel={onRefresh ? "Recarregar" : undefined}
      onAction={onRefresh}
    />
  ),

  // Estado vazio para histórico de viagens
  historico: (onRefresh?: () => void) => (
    <EmptyState
      icon="calendar"
      iconColor="#48BB78"
      title="Nenhuma viagem ainda"
      message="Suas viagens aparecerão aqui quando você começar a usar o transporte escolar."
      actionLabel={onRefresh ? "Verificar novamente" : undefined}
      onAction={onRefresh}
    />
  ),

  // Estado vazio para lista de alunos (motorista)
  alunos: (onRefresh?: () => void) => (
    <EmptyState
      icon="users"
      iconColor="#3182CE"
      title="Nenhum aluno na rota"
      message="Adicione alunos à sua rota para começar."
      actionLabel={onRefresh ? "Atualizar lista" : undefined}
      onAction={onRefresh}
    />
  ),

  // Estado vazio para mensagens do chat
  mensagens: () => (
    <EmptyState
      icon="message-circle"
      iconColor="#9F7AEA"
      title="Comece a conversa"
      message="Envie uma mensagem para o grupo da sua rota."
    />
  ),

  // Estado vazio para mapa
  mapa: () => (
    <EmptyState
      icon="map"
      iconColor="#ED8936"
      title="Mapa indisponível"
      message="Não foi possível carregar o mapa. Verifique sua conexão."
    />
  ),

  // Estado vazio para busca sem resultados
  busca: () => (
    <EmptyState
      icon="search"
      iconColor="#94A3B8"
      title="Nenhum resultado"
      message="Tente buscar com outros termos."
    />
  ),

  // Estado de erro genérico
  erro: (onRetry?: () => void) => (
    <EmptyState
      icon="alert-circle"
      iconColor="#EF4444"
      title="Ops! Algo deu errado"
      message="Não foi possível carregar os dados. Tente novamente."
      actionLabel={onRetry ? "Tentar novamente" : undefined}
      onAction={onRetry}
    />
  ),
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  iconContainer: {
    marginBottom: 24,
    padding: 20,
    borderRadius: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  textContainer: {
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
    textAlign: 'center',
  },
  message: {
    fontSize: 14,
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  button: {
    backgroundColor: '#F5A623',
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 25,
  },
  buttonText: {
    color: '#1A253A',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
