/**
 * v10.1.0 - Beta Release
 * EduTransporter
 * 
 * Tela de Login Admin - Acesso restrito
 * Chave de acesso: admin26 (hardcoded por enquanto)
 */

import React, { useState } from 'react';
import { 
  StyleSheet, Text, View, TouchableOpacity, 
  SafeAreaView, KeyboardAvoidingView, Platform,
  TextInput
} from 'react-native';
import { Feather, FontAwesome5 } from '@expo/vector-icons';
import { Image } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { useApp } from '../contexts/AppContext';
import { useToast } from '../contexts/ToastContext';

const ADMIN_CODE = process.env.EXPO_PUBLIC_ADMIN_CODE || '';

export default function AdminLogin() {
  const router = useRouter();
  const { theme, setUserRole } = useApp();
  const { addToast } = useToast();
  
  const [adminKey, setAdminKey] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAdminLogin = () => {
    if (!adminKey.trim()) {
      addToast('error', 'Digite a chave de acesso');
      return;
    }

    if (adminKey.trim() !== ADMIN_CODE) {
      addToast('error', 'Chave de acesso incorreta');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setUserRole('admin');
      router.replace('/(tabs)/home');
    }, 1000);
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      
      <View style={styles.container}>
        <Image 
          source={require('../assets/foto-fundo.png')} 
          style={styles.backgroundImage}
          pointerEvents="none"
        />
        <SafeAreaView style={{ flex: 1 }}>
          <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={{ flex: 1 }}
          >
            <View style={styles.header}>
              <TouchableOpacity onPress={() => router.back()}>
                <Feather name="arrow-left" size={24} color="#FFF" />
              </TouchableOpacity>
              <Text style={styles.headerTitle}>Acesso Administrativo</Text>
              <View style={{ width: 24 }} />
            </View>

            <View style={styles.content}>
              <View style={[styles.card, { backgroundColor: theme.card }]}>
                <View style={[styles.iconContainer, { backgroundColor: 'rgba(159,122,234,0.1)' }]}>
                  <FontAwesome5 name="shield-alt" size={40} color="#9F7AEA" />
                </View>
                
                <Text style={[styles.title, { color: theme.text }]}>
                  Área Administrativa
                </Text>
                
                <Text style={[styles.subtitle, { color: theme.subtext }]}>
                  Digite a chave de acesso para continuar
                </Text>

                <View style={[styles.inputContainer, { backgroundColor: theme.inputBg, borderColor: theme.border }]}>
                  <Feather name="key" size={20} color={theme.textLight} style={styles.inputIcon} />
                  <TextInput 
                    style={[styles.input, { color: theme.textMain }]}
                    placeholder="Chave de acesso"
                    placeholderTextColor={theme.textLight}
                    value={adminKey}
                    onChangeText={setAdminKey}
                    secureTextEntry
                    autoCapitalize="none"
                  />
                </View>

                <TouchableOpacity 
                  style={[styles.btnEntrar, { backgroundColor: loading ? theme.subtext : '#9F7AEA' }]}
                  onPress={handleAdminLogin}
                  disabled={loading}
                >
                  <Text style={styles.btnText}>
                    {loading ? 'Verificando...' : 'Entrar'}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.btnVoltar}
                  onPress={() => router.back()}
                >
                  <Text style={[styles.btnVoltarText, { color: theme.subtext }]}>
                    ← Voltar para Login
                  </Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.seguranca}>
                🔒 Acesso restrito a administradores autorizados
              </Text>
            </View>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  backgroundImage: { ...StyleSheet.absoluteFillObject, width: '100%', height: '100%', resizeMode: 'cover' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 10 : 30,
    paddingBottom: 15,
  },
  headerTitle: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },
  
  content: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  
  card: {
    width: '100%',
    maxWidth: 350,
    padding: 30,
    borderRadius: 24,
    alignItems: 'center',
  },
  
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 8 },
  subtitle: { fontSize: 14, textAlign: 'center', marginBottom: 25 },
  
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 15,
    marginBottom: 20,
  },
  inputIcon: { marginRight: 10 },
  input: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 14,
  },
  
  btnEntrar: {
    width: '100%',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 15,
  },
  btnText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
  
  btnVoltar: { paddingVertical: 10 },
  btnVoltarText: { fontSize: 14 },
  
  seguranca: { color: '#94A3B8', fontSize: 12, marginTop: 30, textAlign: 'center' },
});