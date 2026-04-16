// Tela de Segurança - alterar senha e configurações de segurança
import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, SafeAreaView, ScrollView, Platform, TextInput, Alert } from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';
import { useRouter, Stack } from 'expo-router';
import { useApp } from './_layout';
import { alterarSenha, PerfilUpdateResponse } from '@/services/api';

export default function Segurança() {
  const router = useRouter();
  const { theme } = useApp();
  const [salvando, setSalvando] = useState(false);
  const [senhas, setSenhas] = useState({
    atual: '',
    nova: '',
    confirmacao: '',
  });
  const [mostrarSenhas, setMostrarSenhas] = useState({
    atual: false,
    nova: false,
    confirmacao: false,
  });

  const handleChange = (field: string, value: string) => {
    setSenhas(prev => ({ ...prev, [field]: value }));
  };

  const toggleMostrar = (field: keyof typeof mostrarSenhas) => {
    setMostrarSenhas(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const handleSalvar = async () => {
    if (!senhas.atual || !senhas.nova || !senhas.confirmacao) {
      Alert.alert('Erro', 'Preencha todos os campos');
      return;
    }

    if (senhas.nova !== senhas.confirmacao) {
      Alert.alert('Erro', 'As senhas não coincidem');
      return;
    }

    if (senhas.nova.length < 6) {
      Alert.alert('Erro', 'A senha deve ter pelo menos 6 caracteres');
      return;
    }

    setSalvando(true);
    const result: PerfilUpdateResponse = await alterarSenha(senhas.atual, senhas.nova);
    setSalvando(false);

    if (result.success) {
      Alert.alert('Sucesso', 'Senha alterada com sucesso!');
      setSenhas({ atual: '', nova: '', confirmacao: '' });
    } else {
      Alert.alert('Erro', result.message || 'Erro ao alterar senha');
    }
  };

  const InputSenha = ({ label, field }: { label: string; field: 'atual' | 'nova' | 'confirmacao' }) => (
    <View style={styles.inputGroup}>
      <Text style={[styles.label, { color: theme.subtext }]}>{label}</Text>
      <View style={[styles.inputContainer, { backgroundColor: theme.inputBg, borderColor: theme.border }]}>
        <TextInput
          style={[styles.input, { color: theme.text }]}
          value={senhas[field]}
          onChangeText={(v) => handleChange(field, v)}
          secureTextEntry={!mostrarSenhas[field]}
          placeholder={`Digite a ${label.toLowerCase()}`}
          placeholderTextColor={theme.subtext}
        />
        <TouchableOpacity onPress={() => toggleMostrar(field)}>
          <Feather 
            name={mostrarSenhas[field] ? 'eye-off' : 'eye'} 
            size={20} 
            color={theme.subtext} 
          />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]}>
      <Stack.Screen options={{ headerShown: false }} />
      
      <View style={[styles.header, { borderBottomColor: theme.border }]}>
        <TouchableOpacity onPress={() => router.back()}>
          <Feather name="arrow-left" size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.text }]}>Segurança</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Alterar Senha */}
        <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Text style={[styles.cardTitle, { color: theme.text }]}>Alterar Senha</Text>
          <Text style={[styles.cardSubtitle, { color: theme.subtext }]}>
            Sua senha deve ter pelo menos 6 caracteres
          </Text>
          
          <InputSenha label="Senha Atual" field="atual" />
          <InputSenha label="Nova Senha" field="nova" />
          <InputSenha label="Confirmar Nova Senha" field="confirmacao" />

          <TouchableOpacity 
            style={[styles.saveBtn, { backgroundColor: theme.gold }]} 
            onPress={handleSalvar}
            disabled={salvando}
          >
            <Text style={[styles.saveBtnText, { color: theme.darkBlue }]}>
              {salvando ? 'Salvando...' : 'Alterar Senha'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Outras Opções */}
        <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border, marginTop: 20 }]}>
          <Text style={[styles.cardTitle, { color: theme.text }]}>Outras Opções</Text>
          
          <TouchableOpacity style={[styles.optionItem, { borderBottomColor: theme.border }]}>
            <View style={styles.optionLeft}>
              <View style={[styles.iconBox, { backgroundColor: 'rgba(239,68,68,0.1)' }]}>
                <Feather name="log-out" size={18} color="#EF4444" />
              </View>
              <Text style={[styles.optionText, { color: '#EF4444' }]}>Sair de Todos os Dispositivos</Text>
            </View>
            <Feather name="chevron-right" size={20} color={theme.subtext} />
          </TouchableOpacity>
        </View>

        <View style={styles.infoBox}>
          <Ionicons name="shield-checkmark" size={18} color={theme.subtext} />
          <Text style={[styles.infoText, { color: theme.subtext }]}>
            Sua senha é criptografada e armazenada de forma segura. Nunca compartilhamos seus dados.
          </Text>
        </View>

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
  card: {
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
  },
  cardTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 5 },
  cardSubtitle: { fontSize: 13, marginBottom: 20 },
  inputGroup: { marginBottom: 15 },
  label: { fontSize: 12, marginBottom: 6, fontWeight: '600' },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 50,
    borderRadius: 12,
    paddingHorizontal: 15,
    borderWidth: 1,
  },
  input: { flex: 1, fontSize: 15 },
  saveBtn: {
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  saveBtnText: { fontSize: 16, fontWeight: 'bold' },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 15,
    borderBottomWidth: 1,
  },
  optionLeft: { flexDirection: 'row', alignItems: 'center' },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionText: { fontSize: 15, fontWeight: '600', marginLeft: 12 },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 20,
    padding: 15,
  },
  infoText: { flex: 1, marginLeft: 10, fontSize: 13, lineHeight: 20 },
});