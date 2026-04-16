/**
 * v1.0 - O Retorno
 * Vitor Santana no código
 *
 * Dashboard Admin - Visão geral do sistema
 * Stats, menu de gerenciamento, logout
 */

import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, SafeAreaView, ScrollView, Platform, ActivityIndicator, Alert } from 'react-native';
import { Feather, FontAwesome5 } from '@expo/vector-icons';
import { useRouter, Stack } from 'expo-router';
import { useApp } from '../_layout';
import { getAdminDashboard, AdminDashboardResponse, AdminStats } from '@/services/api';

const MENU_ITEMS = [
  { id: 'rotas', title: 'Gerenciar Rotas', subtitle: 'Criar, editar e excluir rotas', icon: 'route', color: '#48BB78', route: '/admin/gerenciar-rotas' },
  { id: 'avisos', title: 'Gerenciar Avisos', subtitle: 'Enviar avisos aos usuários', icon: 'bell', color: '#F5A623', route: '/admin/gerenciar-avisos' },
  { id: 'feriados', title: 'Feriados', subtitle: 'Dias sem transporte', icon: 'calendar', color: '#9F7AEA', route: '/admin/gerenciar-feriados' },
  { id: 'usuarios', title: 'Usuários', subtitle: 'Alunos, motoristas e admins', icon: 'users', color: '#4299E1', route: '/admin/gerenciar-usuarios' },
  { id: 'convites', title: 'Gerar Convites', subtitle: 'Códigos para novos admins', icon: 'key', color: '#EF4444', route: '/admin/gerar-convites' },
];

export default function AdminDashboard() {
  const router = useRouter();
  const { theme, clearAuth } = useApp();
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
      <View style={[styles.header, { backgroundColor: theme.card, borderBottomColor: theme.border }]}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <TouchableOpacity onPress={() => router.back()}>
            <Feather name="arrow-left" size={22} color={theme.textMain} />
          </TouchableOpacity>
          <View style={[styles.headerIcon, { backgroundColor: 'rgba(159,122,234,0.15)' }]}>
            <FontAwesome5 name="shield-alt" size={16} color="#9F7AEA" />
          </View>
          <Text style={[styles.headerTitle, { color: theme.textMain }]}>Painel Admin</Text>
        </View>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
          <Feather name="log-out" size={20} color="#EF4444" />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color={theme.gold} />
          <Text style={[styles.loadingText, { color: theme.subtext }]}>Carregando painel...</Text>
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Stats Grid */}
          <View style={styles.statsSection}>
            <Text style={[styles.sectionTitle, { color: theme.textMain }]}>Visão Geral</Text>
            <View style={styles.statsGrid}>
              <View style={[styles.statCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
                <View style={[styles.statIcon, { backgroundColor: 'rgba(66,153,225,0.12)' }]}>
                  <FontAwesome5 name="user-graduate" size={20} color="#4299E1" />
                </View>
                <Text style={[styles.statNumber, { color: theme.textMain }]}>{stats?.totalAlunos || 0}</Text>
                <Text style={[styles.statLabel, { color: theme.subtext }]}>Alunos</Text>
              </View>
              <View style={[styles.statCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
                <View style={[styles.statIcon, { backgroundColor: 'rgba(72,187,120,0.12)' }]}>
                  <FontAwesome5 name="bus" size={20} color="#48BB78" />
                </View>
                <Text style={[styles.statNumber, { color: theme.textMain }]}>{stats?.totalMotoristas || 0}</Text>
                <Text style={[styles.statLabel, { color: theme.subtext }]}>Motoristas</Text>
              </View>
              <View style={[styles.statCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
                <View style={[styles.statIcon, { backgroundColor: 'rgba(245,166,35,0.12)' }]}>
                  <FontAwesome5 name="route" size={20} color={theme.gold} />
                </View>
                <Text style={[styles.statNumber, { color: theme.textMain }]}>{stats?.totalRotasAtivas || 0}</Text>
                <Text style={[styles.statLabel, { color: theme.subtext }]}>Rotas Ativas</Text>
              </View>
              <View style={[styles.statCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
                <View style={[styles.statIcon, { backgroundColor: 'rgba(159,122,234,0.12)' }]}>
                  <Feather name="bell" size={20} color="#9F7AEA" />
                </View>
                <Text style={[styles.statNumber, { color: theme.textMain }]}>{stats?.totalAvisos || 0}</Text>
                <Text style={[styles.statLabel, { color: theme.subtext }]}>Avisos</Text>
              </View>
            </View>
          </View>

          {/* Management Menu */}
          <View style={styles.menuSection}>
            <Text style={[styles.sectionTitle, { color: theme.textMain }]}>Gerenciamento</Text>
            {MENU_ITEMS.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={[styles.menuItem, { backgroundColor: theme.card, borderColor: theme.border }]}
                onPress={() => router.push(item.route as any)}
              >
                <View style={[styles.menuIcon, { backgroundColor: item.color + '18' }]}>
                  <Feather name={item.icon as any} size={18} color={item.color} />
                </View>
                <View style={styles.menuInfo}>
                  <Text style={[styles.menuTitle, { color: theme.textMain }]}>{item.title}</Text>
                  <Text style={[styles.menuSubtitle, { color: theme.subtext }]}>{item.subtitle}</Text>
                </View>
                <Feather name="chevron-right" size={18} color={theme.subtext} />
              </TouchableOpacity>
            ))}
          </View>

          <View style={{ height: 40 }} />
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
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 10 : 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  headerTitle: { fontSize: 17, fontWeight: '700' },
  headerIcon: {
    width: 32, height: 32, borderRadius: 10,
    justifyContent: 'center', alignItems: 'center',
  },
  logoutBtn: { padding: 8 },
  centerContent: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { fontSize: 14, marginTop: 10 },

  statsSection: { paddingHorizontal: 20, marginTop: 20 },
  sectionTitle: { fontSize: 16, fontWeight: '700', marginBottom: 14 },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    width: '48%',
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    marginBottom: 12,
    alignItems: 'center',
  },
  statIcon: {
    width: 44, height: 44, borderRadius: 22,
    justifyContent: 'center', alignItems: 'center',
    marginBottom: 10,
  },
  statNumber: { fontSize: 26, fontWeight: '800' },
  statLabel: { fontSize: 12, marginTop: 4 },

  menuSection: { paddingHorizontal: 20, marginTop: 10 },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    marginBottom: 10,
  },
  menuIcon: {
    width: 42, height: 42, borderRadius: 12,
    justifyContent: 'center', alignItems: 'center',
  },
  menuInfo: { flex: 1, marginLeft: 14 },
  menuTitle: { fontSize: 15, fontWeight: '600' },
  menuSubtitle: { fontSize: 12, marginTop: 2 },
});
