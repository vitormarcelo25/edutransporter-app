/**
 * v10.1.0 - Beta Release
 * EduTransporter
 * 
 * Gerar Convites - Cria códigos para novos admins
 * Cada convite expira em 24h
 * Apenas admin acessa
 */

import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, SafeAreaView, ScrollView, Platform, ActivityIndicator, Alert } from 'react-native';
import { Feather, FontAwesome5 } from '@expo/vector-icons';
import { useRouter, Stack } from 'expo-router';
import { useApp } from '../_layout';
import { getConvites, createConvite, ConvitesResponse, Convite } from '../../services/api';

export default function GerarConvites() {
  const router = useRouter();
  const { theme, userRole } = useApp();
  const [loading, setLoading] = useState(true);
  const [convites, setConvites] = useState<Convite[]>([]);
  const [gerando, setGerando] = useState(false);

  useEffect(() => {
    loadConvites();
  }, []);

  const loadConvites = async () => {
    setLoading(true);
    const result: ConvitesResponse = await getConvites();
    setLoading(false);
    if (result.success && result.convites) {
      setConvites(result.convites);
    }
  };

  const handleGerarConvite = async () => {
    setGerando(true);
    const result = await createConvite();
    setGerando(false);
    if (result.success && result.convite) {
      setConvites([result.convite, ...convites]);
      Alert.alert('Sucesso', `Código gerado: ${result.convite.codigo}`);
    }
  };

  if (userRole !== 'admin') {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]}>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Feather name="arrow-left" size={24} color={theme.text} />
          </TouchableOpacity>
          <Text style={[styles.title, { color: theme.text }]}>Gerar Convites</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.centerContent}>
          <Feather name="lock" size={64} color={theme.gold} />
          <Text style={[styles.accessDeniedText, { color: theme.text }]}>
            Acesso restrito a administradores
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]}>
      <Stack.Screen options={{ headerShown: false }} />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Feather name="arrow-left" size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.text }]}>Gerar Convites</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={[styles.infoBox, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Feather name="info" size={20} color={theme.gold} />
          <Text style={[styles.infoText, { color: theme.subtext }]}>
            Gere códigos para novos administradores. Cada código expira em 24h.
          </Text>
        </View>

        <TouchableOpacity 
          style={[styles.gerarBtn, { backgroundColor: gerando ? theme.subtext : '#48BB78' }]}
          onPress={handleGerarConvite}
          disabled={gerando}
        >
          {gerando ? (
            <ActivityIndicator size="small" color="#FFF" />
          ) : (
            <>
              <Feather name="key" size={20} color="#FFF" />
              <Text style={styles.gerarBtnText}>Gerar Novo Convite</Text>
            </>
          )}
        </TouchableOpacity>

        <Text style={[styles.sectionTitle, { color: theme.text }]}>Convites Gerados</Text>

        {convites.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Feather name="key" size={48} color={theme.subtext} />
            <Text style={[styles.emptyText, { color: theme.subtext }]}>Nenhum convite gerado</Text>
          </View>
        ) : (
          convites.map((convite) => (
            <View key={convite.id} style={[styles.conviteCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
              <View style={styles.conviteHeader}>
                <View style={[styles.conviteIcon, { backgroundColor: 'rgba(239,68,68,0.1)' }]}>
                  <Feather name="key" size={20} color="#EF4444" />
                </View>
                <View style={styles.conviteInfo}>
                  <Text style={[styles.conviteCodigo, { color: theme.text }]}>{convite.codigo}</Text>
                  <Text style={[styles.conviteExpira, { color: theme.subtext }]}>
                    Expira em: {convite.expiraEm}
                  </Text>
                </View>
                <View style={[
                  styles.statusBadge, 
                  { backgroundColor: convite.usado ? '#718096' : '#48BB78' }
                ]}>
                  <Text style={styles.statusText}>
                    {convite.usado ? 'Usado' : 'Ativo'}
                  </Text>
                </View>
              </View>
            </View>
          ))
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
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
    paddingTop: Platform.OS === 'ios' ? 10 : 25,
    paddingBottom: 15,
  },
  title: { fontSize: 18, fontWeight: 'bold' },
  centerContent: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { fontSize: 16, marginTop: 10 },
  accessDeniedText: { fontSize: 16, marginTop: 10, textAlign: 'center' },
  scrollContent: { padding: 20 },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 20,
  },
  infoText: { flex: 1, marginLeft: 8, fontSize: 13 },
  gerarBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 30,
    marginBottom: 25,
  },
  gerarBtnText: { color: '#FFF', fontSize: 16, fontWeight: 'bold', marginLeft: 8 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 15 },
  emptyContainer: { alignItems: 'center', paddingVertical: 40 },
  emptyText: { fontSize: 16, marginTop: 10 },
  conviteCard: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    marginBottom: 12,
  },
  conviteHeader: { flexDirection: 'row', alignItems: 'center' },
  conviteIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  conviteInfo: { flex: 1, marginLeft: 12 },
  conviteCodigo: { fontSize: 16, fontWeight: 'bold', fontFamily: 'monospace' },
  conviteExpira: { fontSize: 12, marginTop: 2 },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: { color: '#FFF', fontSize: 11, fontWeight: 'bold' },
});