import React, { useState } from 'react';
import { 
  StyleSheet, Text, View, TextInput, TouchableOpacity, 
  ScrollView, StatusBar, SafeAreaView, Image, Platform 
} from 'react-native';
import { FontAwesome5, Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack, useRouter } from 'expo-router';
//Front end vitorsantana choro foi grande mas tá aí, o login tá pronto e estiloso!KSKSKS
// Tipo pra gente saber se é aluno ou motorista logando
type LoginType = 'motorista' | 'aluno';

export default function Index() {
  const router = useRouter();
  const [loginType, setLoginType] = useState<LoginType>('aluno');

  // Cores do projeto (Noite & Ouro) que a gente combinou
  const theme = {
    gold: '#F5A623',       
    darkBlue: '#1A253A',   
    bg: '#121A2F',         
    cardBg: '#233248',     
    border: '#37474F',     
    textMain: '#FFFFFF',   
    textLight: '#94A3B8',  
  };

  const handleLogin = () => {
    // TODO: Validar os campos antes de entrar
    // Por enquanto só pula pra home direto
    router.replace('/home'); 
  };

  return (
    <>
      {/* Tirei o header padrão pq a gente vai fazer o nosso personalizado */}
      <Stack.Screen options={{ headerShown: false }} />
      
      <LinearGradient 
        colors={['#2B3A55', '#1A2436']} 
        style={styles.container}
      >
        <StatusBar barStyle="light-content" />
        
        <SafeAreaView style={{ flex: 1 }}>
          <View style={styles.header}>
            <View style={{ width: 28 }} />
            <Text style={styles.headerTitle}>Entrar</Text>
            {/* Botão de interrogação pra página de ajuda */}
            <TouchableOpacity onPress={() => router.push('/ajuda')} style={styles.helpBtnHeader}>
              <Feather name="help-circle" size={24} color={theme.gold} />
            </TouchableOpacity>
          </View>

          <ScrollView 
            contentContainerStyle={styles.scrollContent} 
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            
            <View style={styles.logoContainer}>
              <View style={styles.illustrationPlaceholder}>
                
                {/* O GIF do ônibus. 
                  Nota: Se der erro de caminho no seu PC, verifica se o gif tá na pasta assets
                */}
                <Image 
                  source={require('../assets/onibus.gif')}
                  style={styles.gifImage}
                  resizeMode="contain"
                />
                
              </View>
              <Text style={styles.appName}>EduTransporter</Text>
              <Text style={styles.appSub}>A sua jornada escolar segura</Text>
            </View>

            <View style={styles.formContainer}>
              
              {/* Switchzinho pra escolher o tipo de usuário */}
              <View style={styles.roleToggleContainer}>
                <TouchableOpacity
                  style={[styles.roleBtn, loginType === 'aluno' && styles.roleBtnActive]}
                  onPress={() => setLoginType('aluno')}
                  activeOpacity={0.8}
                >
                  <FontAwesome5 
                    name="user-graduate" 
                    size={14} 
                    color={loginType === 'aluno' ? theme.darkBlue : theme.textMain} 
                    style={{marginRight: 6}} 
                  />
                  <Text style={[styles.roleText, loginType === 'aluno' && styles.roleTextActive]}>
                    Aluno
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.roleBtn, loginType === 'motorista' && styles.roleBtnActive]}
                  onPress={() => setLoginType('motorista')}
                  activeOpacity={0.8}
                >
                  <FontAwesome5 
                    name="user-tie" 
                    size={14} 
                    color={loginType === 'motorista' ? theme.darkBlue : theme.textMain} 
                    style={{marginRight: 6}} 
                  />
                  <Text style={[styles.roleText, loginType === 'motorista' && styles.roleTextActive]}>
                    Motorista
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Campos de texto pro login */}
              <TextInput 
                style={styles.inputSimple} 
                placeholder="E-mail ou CPF" 
                keyboardType="email-address"
                autoCapitalize="none"
                placeholderTextColor={theme.textLight} 
              />
              
              <TextInput 
                style={styles.inputSimple} 
                placeholder="Senha" 
                secureTextEntry 
                placeholderTextColor={theme.textLight} 
              />

              <TouchableOpacity style={styles.btnProsseguir} onPress={handleLogin}>
                <Text style={styles.btnProsseguirText}>Entrar</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.footerLinks}>
              <TouchableOpacity>
                <Text style={styles.footerText}>Esqueceu a senha?</Text>
              </TouchableOpacity>
            </View>

            {/* Um espacinho pra empurrar o link de registro pra baixo */}
            <View style={{flex: 1, minHeight: 40}} />

            <TouchableOpacity style={styles.loginLinkBtn} onPress={() => router.push('/registo')}>
              <Text style={styles.loginLinkText}>
                Não tem conta? <Text style={{fontWeight: 'bold', color: theme.gold}}>Registe-se aqui</Text>
              </Text>
            </TouchableOpacity>

            <View style={{ height: 30 }} />
          </ScrollView>
        </SafeAreaView>
      </LinearGradient>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    paddingHorizontal: 20, 
    paddingTop: Platform.OS === 'ios' ? 0 : 10, 
    paddingBottom: 10 
  },
  headerTitle: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },
  helpBtnHeader: { padding: 5 },
  scrollContent: { flexGrow: 1, alignItems: 'center', paddingHorizontal: 20 },
  
  logoContainer: { alignItems: 'center', marginTop: 10, marginBottom: 30 },
  illustrationPlaceholder: { 
    width: 140, 
    height: 140, 
    backgroundColor: 'rgba(255,255,255,0.05)', 
    borderRadius: 70, 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginBottom: 15, 
    borderWidth: 1, 
    borderColor: 'rgba(255,255,255,0.1)',
    overflow: 'hidden' 
  },
  gifImage: {
    width: 120, 
    height: 120,
  },
  appName: { fontSize: 32, fontWeight: '900', color: '#FFFFFF', letterSpacing: 1 }, 
  appSub: { fontSize: 16, color: '#94A3B8', marginTop: 5 },

  formContainer: { 
    width: '100%', 
    maxWidth: 400, 
    backgroundColor: '#233248', 
    padding: 24, 
    borderRadius: 30, 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 5 }, 
    shadowOpacity: 0.3, 
    shadowRadius: 10, 
    elevation: 8, 
    marginBottom: 30, 
    borderWidth: 1, 
    borderColor: '#37474F' 
  },
  
  roleToggleContainer: { 
    flexDirection: 'row', 
    backgroundColor: '#121A2F', 
    borderRadius: 24, 
    padding: 4, 
    marginBottom: 20, 
    borderWidth: 1, 
    borderColor: '#37474F' 
  },
  roleBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 12, borderRadius: 20 },
  roleBtnActive: { 
    backgroundColor: '#F5A623', 
    shadowColor: '#F5A623', 
    shadowOffset: { width: 0, height: 2 }, 
    shadowOpacity: 0.4, 
    shadowRadius: 4, 
    elevation: 4 
  },
  roleText: { color: '#FFF', fontWeight: 'bold', fontSize: 14 },
  roleTextActive: { color: '#1A253A' },

  inputSimple: { 
    height: 50, 
    backgroundColor: '#121A2F', 
    borderRadius: 25, 
    marginBottom: 16, 
    paddingHorizontal: 20, 
    color: '#FFF', 
    fontSize: 15, 
    borderWidth: 1, 
    borderColor: '#37474F' 
  },
  
  btnProsseguir: { 
    height: 54, 
    backgroundColor: '#F5A623', 
    borderRadius: 27, 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginTop: 10, 
    width: '100%', 
    shadowColor: '#F5A623', 
    shadowOffset: { width: 0, height: 4 }, 
    shadowOpacity: 0.3, 
    shadowRadius: 8, 
    elevation: 5 
  },
  btnProsseguirText: { color: '#1A253A', fontSize: 18, fontWeight: 'bold' },
  
  footerLinks: { alignItems: 'center', marginBottom: 20 },
  footerText: { color: '#F5A623', fontSize: 15, fontWeight: '600' },
  
  loginLinkBtn: { 
    padding: 15, 
    backgroundColor: 'rgba(255,255,255,0.05)', 
    borderRadius: 25, 
    width: '100%', 
    maxWidth: 400, 
    alignItems: 'center', 
    borderWidth: 1, 
    borderColor: 'rgba(255,255,255,0.1)', 
    marginTop: 20 
  },
  loginLinkText: { color: '#94A3B8', fontSize: 15 },
});