import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TouchableOpacity, 
  SafeAreaView, 
  ScrollView, 
  StatusBar,
  Platform,
  RefreshControl
} from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';

import { useApp } from './_layout';
import { useToast } from '../contexts/ToastContext';
import { useNotify } from '../hooks/useNotifications';
import { getAvisos, AvisosResponse, Aviso } from '@/services/api';
import { LoadingSpinner, LoadingDots } from '../components/ui/LoadingSpinner';
import { EmptyState } from '../components/ui/EmptyState';

export default function Avisos() {
  const router = useRouter();
  const { theme } = useApp();
  const { addToast } = useToast();
  const { aviso: sendAvisoNotification } = useNotify();
  
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [avisos, setAvisos] = useState<Aviso[]>([]);

  // Função que carrega os avisos da API
  const loadAvisos = async () => {
    try {
      setLoading(true);
      const result: AvisosResponse = await getAvisos();
      
      if (result.success && result.avisos) {
        setAvisos(result.avisos);
        addToast('success', 'Avisos carregados!');
        
        // Envia notificação para cada aviso urgente
        result.avisos.forEach((aviso) => {
          if (aviso.tipo === 'urgente') {
            sendAvisoNotification(aviso.titulo, aviso.descricao);
          }
        });
      } else {
        setAvisos([]);
        addToast('error', result.message || 'Erro ao carregar avisos');
      }
    } catch (err) {
      setAvisos([]);
      addToast('error', 'Erro de conexão');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };
  
  // Função de pull-to-refresh (puxar para atualizar)
  const onRefresh = () => {
    setRefreshing(true);
    loadAvisos();
  };
  
  // Função que testa o envio de notificação
  const handleTestNotification = () => {
    sendAvisoNotification('Teste de Notificação', 'Esta é uma notificação de teste do EduTransporte!');
    addToast('success', 'Notificação de teste enviada!');
  };

  useEffect(() => {
    loadAvisos();
  }, []);

  // Estado de carregamento
  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]}>
        <Stack.Screen options={{ headerShown: false }} />
        <StatusBar barStyle={theme.status as any} />
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Feather name="arrow-left" size={24} color={theme.text} />
          </TouchableOpacity>
          <Text style={[styles.title, { color: theme.text }]}>Centro de Avisos</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.loadingContainer}>
          <LoadingSpinner size={60} />
          <Text style={[styles.loadingText, { color: theme.subtext }]}>Carregando avisos...</Text>
          <LoadingDots />
        </View>
      </SafeAreaView>
    );
  }

  // Estado de lista vazia
  const renderContent = () => {
    if (avisos.length === 0) {
      return (
        <EmptyState
          icon="bell-off"
          iconColor="#94A3B8"
          title="Nenhum aviso"
          message="Quando houver novos avisos, você verá aqui."
          actionLabel="Atualizar"
          onAction={loadAvisos}
        />
      );
    }

    return avisos.map((aviso) => {
      const isUrgente = aviso.tipo === 'urgente';
      const isInfo = aviso.tipo === 'info';
      
      const iconColor = isUrgente ? '#EF4444' : isInfo ? '#3182CE' : '#48BB78';
      const iconBg = isUrgente ? 'rgba(239, 68, 68, 0.1)' : isInfo ? 'rgba(49, 130, 206, 0.1)' : 'rgba(72, 187, 120, 0.1)';

      return (
        <View 
          key={aviso.id} 
          style={[
            styles.card, 
            { 
              backgroundColor: theme.card, 
              borderColor: theme.border,
              borderLeftColor: iconColor
            }
          ]}
        >
          <View style={styles.cardHeader}>
            <View style={[styles.iconBox, { backgroundColor: iconBg }]}>
              <Ionicons name={aviso.icon as any} size={20} color={iconColor} />
            </View>
            <View style={styles.textContainer}>
              <Text style={[styles.cardTitle, { color: theme.text }]}>{aviso.titulo}</Text>
              <Text style={[styles.cardDate, { color: theme.subtext }]}>{aviso.data}</Text>
            </View>
          </View>
          <Text style={[styles.cardDesc, { color: theme.subtext }]}>
            {aviso.descricao}
          </Text>
        </View>
      );
    });
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]}>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar barStyle={theme.status as any} />

      {/* Cabeçalho */}
      <View style={[styles.header, { borderBottomColor: theme.border, backgroundColor: theme.card }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="arrow-left" size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.text }]}>Centro de Avisos</Text>
        <TouchableOpacity onPress={handleTestNotification} style={styles.backBtn}>
          <Ionicons name="notifications-outline" size={24} color={theme.gold} />
        </TouchableOpacity>
      </View>

      <ScrollView 
        contentContainerStyle={styles.scrollContent} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.gold}
            colors={[theme.gold]}
          />
        }
      >
        {renderContent()}
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    paddingHorizontal: 20, 
    paddingTop: Platform.OS === 'ios' ? 10 : 20, 
    paddingBottom: 15, 
    borderBottomWidth: 1,
    elevation: 4
  },
  backBtn: { padding: 8 },
  title: { fontSize: 18, fontWeight: 'bold' },
  scrollContent: { padding: 20 },
  card: { 
    borderRadius: 20, 
    padding: 18, 
    marginBottom: 15, 
    borderWidth: 1, 
    borderLeftWidth: 6,
    elevation: 3, 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  iconBox: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  textContainer: { flex: 1 },
  cardTitle: { fontSize: 16, fontWeight: 'bold' },
  cardDate: { fontSize: 12, marginTop: 2, fontWeight: '500' },
  cardDesc: { fontSize: 14, lineHeight: 22 },
  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  loadingText: { fontSize: 16, marginTop: 20 },
});
