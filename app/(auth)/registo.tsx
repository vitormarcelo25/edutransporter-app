/**
 * v10.1.0 - Beta Release
 * EduTransporter
 * 
 * Tela de Registo - Criação de conta
 * Toggle para Aluno ou Motorista
 * Campos mudam dinamicamente conforme o role escolhido
 */

import React, { useState } from 'react';
import { 
  StyleSheet, Text, View, TextInput, TouchableOpacity, 
  ScrollView, StatusBar, SafeAreaView, KeyboardAvoidingView, Platform
} from 'react-native';
import { FontAwesome5, Feather } from '@expo/vector-icons';
import { Image } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { register, RegisterResponse, getCidades, getInstituicoes } from '../../services/api';
import { useToast } from '../../contexts/ToastContext';
import { useApp } from '../../contexts/AppContext';
import { formatarCPF, limparCPF, validarCPF, formatarTelefone, limparTelefone } from '../../services/cpf';
import { ExpandableSelect } from '../../components/ui/ExpandableSelect';

// Criando esse tipo aqui pra garantir que a gente não escreva errado depois
type Role = 'motorista' | 'aluno';

export default function Registo() {
  const router = useRouter();
  const { addToast } = useToast();
  const { setAuth } = useApp();
   
  const [role, setRole] = useState<Role>('aluno');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [cpfError, setCpfError] = useState('');
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    cpf: '',
    telefone: '',
    cidade: '',
    escola: '',
    matriculaEscolar: '',
    matriculaVeiculo: '',
    cartaConducao: '',
    password: '',
    confirmPassword: '',
  });

  const [cidadeSuggestions] = useState<string[]>(getCidades());
  const [instituicoesFiltradas, setInstituicoesFiltradas] = useState<string[]>([]);

  const handleCidadeSelect = (cidade: string) => {
    handleInputChange('cidade', cidade);
    const instituicoes = getInstituicoes(cidade);
    setInstituicoesFiltradas(instituicoes);
    if (instituicoes.length > 0) {
      handleInputChange('escola', '');
    }
  };

  const handleInstituicaoSelect = (instituicao: string) => {
    handleInputChange('escola', instituicao);
  };

  // Cores da nossa identidade visual. Deixei "chumbado" aqui por enquanto
  // pra facilitar na hora de montar a tela, depois a gente passa pro global se precisar
  const theme = {
    gold: '#F5A623',       
    darkBlue: '#1A253A',   
    bg: '#121A2F',         
    cardBg: '#233248',     
    border: '#37474F',     
    textMain: '#FFFFFF',   
    textLight: '#94A3B8',  
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

   // Função fake por enquanto. Quando tiver backend a gente faz a validação certa
   // Por hora só pula pra home pra gente testar o fluxo das telas
   const handleRegisto = async () => {
      if (formData.password !== formData.confirmPassword) {
        addToast('error', 'As senhas não coincidem');
        return;
      }

       if (role === 'aluno' && !validarCPF(formData.cpf)) {
         setCpfError('CPF deve ter 11 dígitos');
         return;
       }

       if (role === 'aluno' && (!formData.email || !formData.email.includes('@'))) {
         addToast('error', 'E-mail é obrigatório');
         return;
       }

       setLoading(true);

       const data = {
         nome: formData.nome,
         email: formData.email,
         cpf: role === 'aluno' ? limparCPF(formData.cpf) : '',
        telefone: formData.telefone,
        cidade: formData.cidade,
        role: role,
        escola: formData.escola,
        matriculaEscolar: formData.matriculaEscolar,
        matriculaVeiculo: formData.matriculaVeiculo,
        cartaConducao: formData.cartaConducao,
        password: formData.password,
      };

const result: RegisterResponse = await register(data);

      setLoading(false);

      if (result.success && result.token && result.user) {
        await setAuth(result.token, { 
          id: result.user.id, 
          nome: result.user.nome, 
          email: result.user.email, 
          role: result.user.role 
        }, result.user.role);
        
        addToast('success', 'Conta criada com sucesso!');
        router.replace('/(tabs)/home');
      } else {
        addToast('error', result.message || 'Erro ao criar conta');
      }
   };

  return (
    <>
      {/* Arrancando o cabeçalho feio do Expo */}
      <Stack.Screen options={{ headerShown: false }} />
      
      {/* Fundo com imagem */}
      <View style={styles.container}>
        <Image 
          source={require('../../assets/foto-fundo.png')} 
          style={styles.backgroundImage}
          pointerEvents="none"
        />
        <StatusBar barStyle="light-content" />
        
        <SafeAreaView style={{ flex: 1 }}>
          <View style={styles.header}>
            {/* Se o cara desistir de criar conta, esse botão joga ele de volta pro login */}
            <TouchableOpacity onPress={() => router.replace('/')} style={styles.backBtn}>
              <Feather name="arrow-left" size={28} color={theme.textMain} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Criar Conta</Text>
            {/* Esse View vazio aqui é só uma gambiarra pra centralizar o título direito */}
            <View style={{ width: 28 }} /> 
          </View>

          {/* O keyboardShouldPersistTaps="handled" salvou a vida aqui. 
              Antes a gente clicava pra registrar e o clique falhava por causa do teclado aberto */}
          <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
            style={{ flex: 1 }}
          >
          <ScrollView 
            contentContainerStyle={styles.scrollContent} 
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.formContainer}>
              
              <Text style={styles.formTitle}>Quem é você?</Text>

              {/* Botõezinhos estilo switch - limpar dados ao mudar Role */}
              <View style={styles.roleToggleContainer}>
                <TouchableOpacity
                  style={[styles.roleBtn, role === 'aluno' && styles.roleBtnActive]}
                  onPress={() => {
                    setRole('aluno');
                    setFormData(prev => ({ ...prev, matriculaVeiculo: '', cartaConducao: '' }));
                  }}
                  activeOpacity={0.8}
                >
                  <FontAwesome5 name="user-graduate" size={14} color={role === 'aluno' ? theme.darkBlue : theme.textMain} style={{marginRight: 6}} />
                  <Text style={[styles.roleText, role === 'aluno' && styles.roleTextActive]}>
                    Aluno
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.roleBtn, role === 'motorista' && styles.roleBtnActive]}
                  onPress={() => {
                    setRole('motorista');
                    setFormData(prev => ({ ...prev, escola: '', matriculaEscolar: '' }));
                  }}
                  activeOpacity={0.8}
                >
                  <FontAwesome5 name="user-tie" size={14} color={role === 'motorista' ? theme.darkBlue : theme.textMain} style={{marginRight: 6}} />
                  <Text style={[styles.roleText, role === 'motorista' && styles.roleTextActive]}>
                    Motorista
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Linha separadora pra dar um respiro no visual */}
              <View style={styles.divider} />

              <TextInput 
                style={styles.inputSimple} 
                placeholder="Nome Completo" 
                placeholderTextColor={theme.textLight}
                value={formData.nome}
                onChangeText={(v) => handleInputChange('nome', v)}
              />
              <TextInput 
                style={[styles.inputSimple, cpfError && role === 'aluno' ? { borderColor: '#EF4444' } : {}]} 
                placeholder={role === 'aluno' ? 'CPF' : 'E-mail'} 
                keyboardType={role === 'aluno' ? 'number-pad' : 'email-address'} 
                autoCapitalize="none" 
                placeholderTextColor={theme.textLight}
                value={role === 'aluno' ? formatarCPF(formData.cpf) : formData.email}
                onChangeText={(v) => {
                  setCpfError('');
                  handleInputChange(role === 'aluno' ? 'cpf' : 'email', role === 'aluno' ? limparCPF(v) : v);
                }}
                maxLength={role === 'aluno' ? 14 : undefined}
              />
              {cpfError && role === 'aluno' ? <Text style={{ color: '#EF4444', fontSize: 13, marginTop: -5, marginBottom: 10 }}>{cpfError}</Text> : null}
              <TextInput 
                style={styles.inputSimple} 
                placeholder="(XX) XXXXX-XXXX" 
                keyboardType="phone-pad" 
                placeholderTextColor={theme.textLight}
                value={formatarTelefone(formData.telefone)}
                onChangeText={(v) => handleInputChange('telefone', limparTelefone(v))}
                maxLength={15}
              />
              <ExpandableSelect
                value={formData.cidade}
                onSelect={handleCidadeSelect}
                options={cidadeSuggestions}
                placeholder="Selecione a Cidade"
              />

              {/* Aqui é a mágica: muda os campos de acordo com a aba que a pessoa escolheu lá em cima */}
              {role === 'aluno' ? (
                <>
                  <TextInput 
                    style={styles.inputSimple} 
                    placeholder="E-mail" 
                    keyboardType="email-address" 
                    autoCapitalize="none" 
                    placeholderTextColor={theme.textLight}
                    value={formData.email}
                    onChangeText={(v) => handleInputChange('email', v)}
                  />
                  {formData.cidade ? (
                    <ExpandableSelect
                      value={formData.escola}
                      onSelect={handleInstituicaoSelect}
                      options={instituicoesFiltradas}
                      placeholder="Selecione a Instituição"
                    />
                  ) : (
                    <View style={[styles.inputSimple, styles.disabledInput, { backgroundColor: theme.cardBg, borderColor: theme.border }]}>
                      <Text style={{ color: theme.textLight, fontSize: 15 }}>Selecione uma cidade primeiro</Text>
                    </View>
                  )}
                  
                </>
              ) : (
                <>
                  <TextInput 
                    style={styles.inputSimple} 
                    placeholder="Matrícula do Veículo (Placa)" 
                    placeholderTextColor={theme.textLight}
                    value={formData.matriculaVeiculo}
                    onChangeText={(v) => handleInputChange('matriculaVeiculo', v)}
                    maxLength={7}
                    autoCapitalize="characters"
                  />
                  <TextInput 
                    style={styles.inputSimple} 
                    placeholder="Número da Carta de Condução" 
                    placeholderTextColor={theme.textLight}
                    value={formData.cartaConducao}
                    onChangeText={(v) => handleInputChange('cartaConducao', v)}
                    keyboardType="numeric"
                    maxLength={11}
                  />
                </>
              )}

              <TextInput 
                style={styles.inputSimple} 
                placeholder="Criar uma Senha" 
                secureTextEntry 
                placeholderTextColor={theme.textLight}
                value={formData.password}
                onChangeText={(v) => handleInputChange('password', v)}
              />
              <TextInput 
                style={styles.inputSimple} 
                placeholder="Confirmar Senha" 
                secureTextEntry 
                placeholderTextColor={theme.textLight}
                value={formData.confirmPassword}
                onChangeText={(v) => handleInputChange('confirmPassword', v)}
              />

              <Text style={styles.termsText}>
                Ao clicar em "Registar", você concorda com os nossos <Text style={{fontWeight: 'bold', color: theme.gold}}>Termos de Uso</Text> e <Text style={{fontWeight: 'bold', color: theme.gold}}>Política de Privacidade</Text>.
              </Text>

              <TouchableOpacity 
                style={[styles.btnRegistar, loading && styles.btnDisabled]} 
                onPress={handleRegisto}
                disabled={loading}
              >
                <Text style={styles.btnRegistarText}>
                  {loading ? 'A criar conta...' : 'Concluir Registo'}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.footerLinks}>
              {/* Link extra caso a pessoa já tenha conta e tenha entrado aqui sem querer */}
              <TouchableOpacity style={styles.loginLinkBtn} onPress={() => router.replace('/')}>
                <Text style={styles.loginLinkText}>Já tem uma conta? <Text style={{fontWeight: 'bold', color: theme.gold}}>Inicie sessão</Text></Text>
              </TouchableOpacity>
            </View>
            
            {/* Só um espacinho no final pro scroll não ficar colado na borda */}
            <View style={{ height: 30 }} />
          </ScrollView>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </View>
    </>
  );
}

// Os estilos tão todos aqui embaixo pra não poluir o código lá em cima
const styles = StyleSheet.create({
  container: { flex: 1 },
  backgroundImage: { ...StyleSheet.absoluteFillObject, width: '100%', height: '100%', resizeMode: 'cover' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 10, paddingBottom: 20 },
  backBtn: { padding: 5 },
  headerTitle: { fontSize: 22, fontWeight: 'bold', color: '#FFFFFF' },
  scrollContent: { flexGrow: 1, alignItems: 'center', paddingHorizontal: 20, paddingBottom: 100 },
  
  formContainer: { width: '100%', maxWidth: 450, backgroundColor: '#233248', padding: 24, borderRadius: 30, shadowColor: '#000', shadowOffset: { width: 0, height: 5 }, shadowOpacity: 0.3, shadowRadius: 10, elevation: 8, marginBottom: 20, borderWidth: 1, borderColor: '#37474F' },
  formTitle: { fontSize: 18, fontWeight: 'bold', color: '#FFFFFF', marginBottom: 15, textAlign: 'center' },

  roleToggleContainer: { flexDirection: 'row', backgroundColor: '#121A2F', borderRadius: 24, padding: 4, marginBottom: 15, borderWidth: 1, borderColor: '#37474F' },
  roleBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 12, borderRadius: 20 },
  roleBtnActive: { backgroundColor: '#F5A623', shadowColor: '#F5A623', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.4, shadowRadius: 4, elevation: 4 },
  roleText: { color: '#FFF', fontWeight: 'bold', fontSize: 14 },
  roleTextActive: { color: '#1A253A' },

  divider: { height: 1, backgroundColor: '#37474F', marginBottom: 20 },

  inputSimple: { height: 50, backgroundColor: '#121A2F', borderRadius: 25, marginBottom: 16, paddingHorizontal: 20, color: '#FFF', fontSize: 15, borderWidth: 1, borderColor: '#37474F' },
  disabledInput: { justifyContent: 'center' },
  
  termsText: { fontSize: 12, color: '#94A3B8', textAlign: 'center', marginBottom: 20, marginTop: 5, lineHeight: 18 },

  btnRegistar: { height: 54, backgroundColor: '#F5A623', borderRadius: 27, justifyContent: 'center', alignItems: 'center', width: '100%', shadowColor: '#F5A623', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 5 },
  btnRegistarText: { color: '#1A253A', fontSize: 18, fontWeight: 'bold' },
  btnDisabled: { opacity: 0.6 },
  
  footerLinks: { alignItems: 'center', width: '100%', marginTop: 10 },
  loginLinkBtn: { padding: 15, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 25, width: '100%', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  loginLinkText: { color: '#94A3B8', fontSize: 15 },
});