/**
 * v10.1.0 - Beta Release
 * EduTransporter
 *
 * Dashboard Admin - Visão geral do sistema
 * Stats, menu de gerenciamento, logout
 */

import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Platform, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather, FontAwesome5 } from '@expo/vector-icons';
import { useRouter, Stack } from 'expo-router';
import { useApp } from '../_layout';
import { getAdminDashboard, AdminDashboardResponse, AdminStats } from '@/services/api';
import { Alert } from '@/components/Alert';

const MENU_ITEMS = [
  { id: 'usuarios', title: 'Usuários & Solicitações', subtitle: 'Aprovar alunos e cadastrar motoristas', icon: 'users', color: '#7DD3FC', route: '/admin/gerenciar-usuarios', badge: 'Novas' },
  { id: 'rotas', title: 'Gerenciar Rotas', subtitle: 'Criar, editar e excluir rotas', icon: 'route', color: '#4ADE80', route: '/admin/gerenciar-rotas' },
  { id: 'avisos', title: 'Gerenciar Avisos', subtitle: 'Enviar avisos aos usuários', icon: 'bell', color: '#FBBF24', route: '/admin/gerenciar-avisos' },
  { id: 'feriados', title: 'Feriados', subtitle: 'Dias sem transporte', icon: 'calendar', color: '#8B7CFF', route: '/admin/gerenciar-feriados' },
  { id: 'convites', title: 'Gerar Convites', subtitle: 'Códigos para novos admins', icon: 'key', color: '#F87171', route: '/admin/gerar-convites' },
];

export default function AdminDashboard() {
  const router = useRouter();
  const { theme, isDark, clearAuth } = useApp();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<AdminStats | null>(null);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    setLoading(true);
    const result: AdminDashboardResponse = await getAdminDashboard();
    setLoading(false);
    if (result.success && result.stats) {
      setStats(result.stats);
    }
  };

  const handleVoltar = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)/home');
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Sair',
      'Deseja realmente sair do painel admin?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Sair',
          style: 'destructive',
          onPress: () => {
            clearAuth();
            router.replace('/');
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.header || theme.card, borderBottomColor: theme.border }]}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <TouchableOpacity onPress={handleVoltar} style={styles.backBtn} accessibilityLabel="Voltar">
            <Feather name="arrow-left" size={24} color={theme.text} />
          </TouchableOpacity>
          <View style={[styles.headerIcon, { backgroundColor: isDark ? 'rgba(139,124,255,0.22)' : '#5B3FE0' }]}>
            <FontAwesome5 name="shield-alt" size={18} color={isDark ? '#8B7CFF' : '#FFFFFF'} />
          </View>
          <Text style={[styles.headerTitle, { color: theme.text }]}>Painel Admin</Text>
        </View>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn} accessibilityLabel="Sair">
          <Feather name="log-out" size={22} color={isDark ? '#F87171' : '#B91C1C'} />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color={theme.gold} />
          <Text style={[styles.loadingText, { color: theme.subtext }]}>Carregando painel...</Text>
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 30 }}>
          {/* Stats Grid */}
          <View style={styles.statsSection}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Visão Geral</Text>
            <View style={styles.statsGrid}>
              <View style={[styles.statCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
                <View style={[styles.statIcon, { backgroundColor: isDark ? 'rgba(125,211,252,0.18)' : 'rgba(3,105,161,0.12)' }]}>
                  <FontAwesome5 name="user-graduate" size={20} color={isDark ? '#7DD3FC' : '#0369A1'} />
                </View>
                <Text style={[styles.statNumber, { color: theme.text }]}>{stats?.totalAlunos ?? 3}</Text>
                <Text style={[styles.statLabel, { color: theme.subtext }]}>Alunos</Text>
              </View>

              <View style={[styles.statCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
                <View style={[styles.statIcon, { backgroundColor: isDark ? 'rgba(74,222,128,0.18)' : 'rgba(21,128,61,0.12)' }]}>
                  <FontAwesome5 name="bus" size={20} color={isDark ? '#4ADE80' : '#15803D'} />
                </View>
                <Text style={[styles.statNumber, { color: theme.text }]}>{stats?.totalMotoristas ?? 1}</Text>
                <Text style={[styles.statLabel, { color: theme.subtext }]}>Motoristas</Text>
              </View>

              <View style={[styles.statCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
                <View style={[styles.statIcon, { backgroundColor: isDark ? 'rgba(251,191,36,0.18)' : 'rgba(180,83,9,0.12)' }]}>
                  <FontAwesome5 name="route" size={20} color={isDark ? '#FBBF24' : '#B45309'} />
                </View>
                <Text style={[styles.statNumber, { color: theme.text }]}>{stats?.totalRotasAtivas ?? 2}</Text>
                <Text style={[styles.statLabel, { color: theme.subtext }]}>Rotas Ativas</Text>
              </View>

              <View style={[styles.statCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
                <View style={[styles.statIcon, { backgroundColor: isDark ? 'rgba(139,124,255,0.18)' : 'rgba(91,63,224,0.12)' }]}>
                  <Feather name="bell" size={20} color={isDark ? '#8B7CFF' : '#5B3FE0'} />
                </View>
                <Text style={[styles.statNumber, { color: theme.text }]}>{stats?.totalAvisos ?? 0}</Text>
                <Text style={[styles.statLabel, { color: theme.subtext }]}>Avisos</Text>
              </View>
            </View>
          </View>

          {/* Management Menu */}
          <View style={styles.menuSection}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Gerenciamento</Text>
            {MENU_ITEMS.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={[styles.menuItem, { backgroundColor: theme.card, borderColor: theme.border }]}
                onPress={() => router.push(item.route as any)}
                activeOpacity={0.8}
              >
                <View style={[styles.menuIcon, { backgroundColor: item.color + '22' }]}>
                  {item.icon === 'route' ? (
                    <FontAwesome5 name="route" size={20} color={item.color} />
                  ) : item.icon === 'users' ? (
                    <FontAwesome5 name="users" size={18} color={item.color} />
                  ) : (
                    <Feather name={item.icon as any} size={20} color={item.color} />
                  )}
                </View>
                <View style={styles.menuInfo}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <Text style={[styles.menuTitle, { color: theme.text }]}>{item.title}</Text>
                    {item.badge && (
                      <View style={styles.badge}>
                        <Text style={styles.badgeText}>{item.badge}</Text>
                      </View>
                    )}
                  </View>
                  <Text style={[styles.menuSubtitle, { color: theme.subtext }]}>{item.subtitle}</Text>
                </View>
                <Feather name="chevron-right" size={20} color={theme.subtext} />
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  backBtn: { width: 44, height: 44, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 20, fontWeight: '700' },
  headerIcon: {
    width: 44, height: 44, borderRadius: 14,
    justifyContent: 'center', alignItems: 'center',
  },
  logoutBtn: { width: 44, height: 44, justifyContent: 'center', alignItems: 'center' },
  centerContent: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { fontSize: 14, marginTop: 10 },

  statsSection: { paddingHorizontal: 16, marginTop: 16 },
  sectionTitle: { fontSize: 20, fontWeight: '700', marginBottom: 14 },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    width: '48%',
    borderRadius: 22,
    paddingVertical: 18,
    paddingHorizontal: 12,
    borderWidth: 1,
    marginBottom: 14,
    alignItems: 'center',
  },
  statIcon: {
    width: 48, height: 48, borderRadius: 24,
    justifyContent: 'center', alignItems: 'center',
  },
  statNumber: { fontSize: 34, fontWeight: '800', lineHeight: 38, marginTop: 8 },
  statLabel: { fontSize: 15, fontWeight: '500', marginTop: 4 },

  menuSection: { paddingHorizontal: 16, marginTop: 14 },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    padding: 14,
    borderWidth: 1,
    marginBottom: 14,
  },
  menuIcon: {
    width: 52, height: 52, borderRadius: 14,
    justifyContent: 'center', alignItems: 'center',
  },
  menuInfo: { flex: 1, marginLeft: 14 },
  menuTitle: { fontSize: 17, fontWeight: '700' },
  menuSubtitle: { fontSize: 13, marginTop: 3 },
  badge: {
    backgroundColor: '#DC2626',
    borderRadius: 999,
    paddingHorizontal: 9,
    paddingVertical: 3,
  },
  badgeText: { color: '#FFF', fontSize: 11, fontWeight: '700' },
});
