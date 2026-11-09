// Tela de Dados Pessoais - editar perfil do usuário
import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Platform, TextInput, ActivityIndicator } from 'react-native';
import { Alert } from '@/components/Alert';
import { ExpandableSelect } from '@/components/ui/ExpandableSelect';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useRouter, Stack } from 'expo-router';
import { useApp } from './_layout';
import { updatePerfil, getPerfil, getCidades, getInstituicoes, formatarTelefone, PerfilUpdateResponse } from '@/services/api';

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

  const [carregando, setCarregando] = useState(true);
  const [cidades, setCidades] = useState<string[]>([]);
  const [escolas, setEscolas] = useState<string[]>([]);

  // Carrega os dados atuais do servidor (iguais em todos os aparelhos)
  useEffect(() => {
    let ativo = true;
    (async () => {
      setCarregando(true);
      const [perfil, listaCidades, listaEscolas] = await Promise.all([
        getPerfil(),
        getCidades(),
        getInstituicoes(),
      ]);
      if (!ativo) return;
      setCidades(listaCidades.map((c) => c.nome));
      setEscolas(listaEscolas.map((e) => e.nome));
      const u = perfil.usuario;
      setFormData({
        nome: u?.nome || userData?.nome || '',
        email: u?.email || userData?.email || '',
        telefone: formatarTelefone(u?.telefone),
        cidade: u?.cidade || '',
        escola: u?.escola || '',
      });
      setCarregando(false);
    })();
    return () => {
      ativo = false;
    };
  }, [userData?.id]);

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSalvar = async () => {
    if (!formData.nome.trim() || !formData.email.trim()) {
      Alert.alert('Campos obrigatórios', 'Preencha o nome completo e o e-mail.');
      return;
    }
    const digitos = formData.telefone.replace(/\D/g, '');
    if (digitos && digitos.length < 10) {
      Alert.alert('Telefone incompleto', 'Digite o telefone com DDD no formato (00) 00000-0000.');
      return;
    }

    setSalvando(true);
    const result: PerfilUpdateResponse = await updatePerfil(formData);
    setSalvando(false);

    if (result.success) {
      if (authToken && userData) {
        await setAuth(authToken, {
          ...userData,
          nome: formData.nome.trim(),
          email: formData.email.trim(),
          cidade: formData.cidade,
          escola: formData.escola,
          telefone: formData.telefone,
        }, userRole);
      }
      Alert.alert('Dados salvos com sucesso!', result.message || 'Suas informações foram atualizadas.', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } else {
      Alert.alert('Erro ao salvar', result.message || 'Não foi possível salvar suas alterações.');
    }
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

      {carregando ? (
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color={theme.gold} />
          <Text style={[styles.loadingText, { color: theme.subtext }]}>Carregando seus dados...</Text>
        </View>
      ) : (
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
                onChangeText={(v) => handleChange('telefone', formatarTelefone(v))}
                placeholder="(00) 00000-0000"
                placeholderTextColor={theme.subtext}
                keyboardType="phone-pad"
                maxLength={15}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: theme.subtext }]}>Cidade</Text>
              <ExpandableSelect
                value={formData.cidade}
                onSelect={(v) => handleChange('cidade', v)}
                options={cidades}
                placeholder="Selecione sua cidade"
              />
            </View>

            {userRole === 'aluno' && (
              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: theme.subtext }]}>Escola</Text>
                <ExpandableSelect
                  value={formData.escola}
                  onSelect={(v) => handleChange('escola', v)}
                  options={escolas}
                  placeholder="Selecione sua instituição"
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