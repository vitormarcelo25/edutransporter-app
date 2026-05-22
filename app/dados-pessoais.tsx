// Tela de Dados Pessoais - editar perfil do usuário
import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, SafeAreaView, ScrollView, Platform, TextInput, ActivityIndicator, Alert } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter, Stack } from 'expo-router';
import { useApp } from './_layout';
import { updatePerfil, PerfilUpdateResponse } from '@/services/api';

export default function DadosPessoais() {
  const router = useRouter();
  const { theme, userRole, userData, authToken, setAuth } = useApp();
  const [salvando, setSalvando] = useState(false);
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    telefone: '',
    cidade: '',
    escola: '',
  });

  useEffect(() => {
    setFormData({
      nome: userData?.nome || '',
      email: userData?.email || '',
      telefone: '',
      cidade: '',
      escola: '',
    });
  }, [userData]);

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSalvar = async () => {
    if (!formData.nome || !formData.email) {
      Alert.alert('Erro', 'Preencha os campos obrigatórios');
      return;
    }

    setSalvando(true);
    const result: PerfilUpdateResponse = await updatePerfil(formData);

    if (result.success) {
      if (authToken && userData) {
        await setAuth(authToken, {
          ...userData,
          nome: formData.nome,
          email: formData.email,
        }, userRole);
      }
      Alert.alert('Sucesso', 'Dados atualizados com sucesso!');
      router.back();
    } else {
      Alert.alert('Erro', result.message || 'Erro ao salvar');
    }

    setSalvando(false);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]}>
      <Stack.Screen options={{ headerShown: false }} />
      
      <View style={[styles.header, { borderBottomColor: theme.border }]}>
        <TouchableOpacity onPress={() => router.back()}>
          <Feather name="arrow-left" size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.text }]}>Dados Pessoais</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Campos do formulário */}
          <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <Text style={[styles.cardTitle, { color: theme.text }]}>Informações Pessoais</Text>
            
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: theme.subtext }]}>Nome Completo *</Text>
              <TextInput
                style={[styles.input, { backgroundColor: theme.inputBg, color: theme.text, borderColor: theme.border }]}
                value={formData.nome}
                onChangeText={(v) => handleChange('nome', v)}
                placeholder="Seu nome completo"
                placeholderTextColor={theme.subtext}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: theme.subtext }]}>E-mail *</Text>
              <TextInput
                style={[styles.input, { backgroundColor: theme.inputBg, color: theme.text, borderColor: theme.border }]}
                value={formData.email}
                onChangeText={(v) => handleChange('email', v)}
                placeholder="seu@email.com"
                placeholderTextColor={theme.subtext}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: theme.subtext }]}>Telefone</Text>
              <TextInput
                style={[styles.input, { backgroundColor: theme.inputBg, color: theme.text, borderColor: theme.border }]}
                value={formData.telefone}
                onChangeText={(v) => handleChange('telefone', v)}
                placeholder="(00) 00000-0000"
                placeholderTextColor={theme.subtext}
                keyboardType="phone-pad"
                maxLength={11}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: theme.subtext }]}>Cidade</Text>
              <TextInput
                style={[styles.input, { backgroundColor: theme.inputBg, color: theme.text, borderColor: theme.border }]}
                value={formData.cidade}
                onChangeText={(v) => handleChange('cidade', v)}
                placeholder="Sua cidade"
                placeholderTextColor={theme.subtext}
              />
            </View>

            {userRole === 'aluno' && (
              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: theme.subtext }]}>Escola</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: theme.inputBg, color: theme.text, borderColor: theme.border }]}
                  value={formData.escola}
                  onChangeText={(v) => handleChange('escola', v)}
                  placeholder="Nome da escola"
                  placeholderTextColor={theme.subtext}
                />
              </View>
            )}
          </View>

          {/* Botão Salvar */}
          <TouchableOpacity 
            style={[styles.saveBtn, { backgroundColor: theme.gold }]} 
            onPress={handleSalvar}
            disabled={salvando}
          >
            {salvando ? (
              <ActivityIndicator size="small" color={theme.darkBlue} />
            ) : (
              <Text style={[styles.saveBtnText, { color: theme.darkBlue }]}>Salvar Alterações</Text>
            )}
          </TouchableOpacity>

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
    padding: 20,
    paddingTop: Platform.OS === 'ios' ? 10 : 25,
    borderBottomWidth: 1,
  },
  title: { fontSize: 18, fontWeight: 'bold' },
  scrollContent: { padding: 20 },
  centerContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: { fontSize: 16, marginTop: 10 },
  errorText: { fontSize: 16, marginTop: 10 },
  retryBtn: {
    marginTop: 20,
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: '#F5A623',
    borderRadius: 24,
  },
  retryBtnText: { color: '#1A253A', fontSize: 14, fontWeight: 'bold' },
  card: {
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    marginBottom: 20,
  },
  cardTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 20 },
  inputGroup: { marginBottom: 15 },
  label: { fontSize: 12, marginBottom: 6, fontWeight: '600' },
  input: {
    height: 50,
    borderRadius: 12,
    paddingHorizontal: 15,
    fontSize: 15,
    borderWidth: 1,
  },
  saveBtn: {
    height: 54,
    borderRadius: 27,
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveBtnText: { fontSize: 16, fontWeight: 'bold' },
});