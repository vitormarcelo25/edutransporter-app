/**
 * v10.1.0 - Beta Release
 * EduTransporter
 * 
 * Tela de Registo - Criação de conta
 * Toggle para Aluno ou Motorista
 * Campos mudam dinamicamente conforme o role escolhido
 */

import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, Text, View, TextInput, TouchableOpacity, 
  ScrollView, StatusBar, KeyboardAvoidingView, Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
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
   
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [solicitacaoEnviada, setSolicitacaoEnviada] = useState(false);
  const [cpfError, setCpfError] = useState('');
  const [turno, setTurno] = useState<'Matutino' | 'Vespertino' | 'Noturno'>('Noturno');
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    cpf: '',
    telefone: '',
    cidade: '',
    cidadeId: 0,
    escola: '',
    faculdadeId: 0,
    matriculaEscolar: '',
    pontoEmbarque: '',
    password: '',
    confirmPassword: '',
  });

  const [cidadeSuggestions, setCidadeSuggestions] = useState<string[]>([]);
  const [cidades, setCidades] = useState<{ id: number; nome: string }[]>([]);
  const [instituicoesFiltradas, setInstituicoesFiltradas] = useState<string[]>([]);
  const [faculdades, setFaculdades] = useState<{ id: number; nome: string }[]>([]);

  useEffect(() => {
    let ativo = true;
    (async () => {
      try {
        const [cidadesResp, instituicoes] = await Promise.all([getCidades(), getInstituicoes()]);
        if (!ativo) return;
        setCidades(cidadesResp);
        setCidadeSuggestions(cidadesResp.map((c) => c.nome));
        setFaculdades(instituicoes);
        if (cidadesResp.length === 0) {
          addToast('error', 'Nenhuma cidade cadastrada no servidor. Contate a administração.');
        }
      } catch (err: any) {
        if (ativo) {
          addToast('error', 'Não foi possível carregar cidades e instituições do servidor.');
        }
      }
    })();
    return () => {
      ativo = false;
    };
  }, []);

  const handleCidadeSelect = (cidade: string) => {
    const item = cidades.find((c) => c.nome === cidade);
    setFormData((prev) => ({
      ...prev,
      cidade,
      cidadeId: item?.id || 0,
      escola: '',
      faculdadeId: 0,
    }));
    setInstituicoesFiltradas(faculdades.map((f) => f.nome));
  };

  const handleInstituicaoSelect = (instituicao: string) => {
    const item = faculdades.find((f) => f.nome === instituicao);
    setFormData((prev) => ({
      ...prev,
      escola: instituicao,
      faculdadeId: item?.id || 0,
    }));
  };

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

  const handleRegisto = async () => {
    if (!formData.nome.trim()) {
      addToast('error', 'Nome completo é obrigatório');
      return;
    }

    if (formData.password && formData.password !== formData.confirmPassword) {
      addToast('error', 'As senhas não coincidem');
      return;
    }

    if (formData.cpf && !validarCPF(formData.cpf)) {
      setCpfError('CPF deve ter 11 dígitos válidos');
      return;
    }

    if (!formData.cidadeId) {
      addToast('error', 'Selecione sua cidade de origem');
      return;
    }
    if (!formData.faculdadeId) {
      addToast('error', 'Selecione a instituição / faculdade');
      return;
    }
    if (!formData.password || formData.password.length < 4) {
      addToast('error', 'Crie uma senha com pelo menos 4 caracteres');
      return;
    }

    setLoading(true);

    const data = {
      nome: formData.nome,
      email: formData.email || `${limparCPF(formData.cpf) || 'aluno'}@estudante.com`,
      cpf: limparCPF(formData.cpf),
      telefone: formData.telefone,
      cidade: formData.cidade,
      cidadeId: formData.cidadeId,
      role: 'aluno' as const,
      escola: formData.escola,
      faculdadeId: formData.faculdadeId,
      matriculaEscolar: formData.matriculaEscolar || 'Pendente',
      pontoEmbarque: formData.pontoEmbarque || 'Ponto Central',
      turno: turno,
      password: formData.password,
    };

    const result: RegisterResponse = await register(data);

    setLoading(false);

    if (result.success) {
      setSolicitacaoEnviada(true);
      addToast('success', 'Solicitação enviada com sucesso!');
    } else {
      addToast('error', result.message || 'Erro ao enviar solicitação');
    }
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      
      <View style={styles.container}>
        <Image 
          source={require('../../assets/foto-fundo.png')} 
          style={styles.backgroundImage}
        />
        <StatusBar barStyle="light-content" />
        
        <SafeAreaView style={{ flex: 1 }}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.replace('/')} style={styles.backBtn}>
              <Feather name="arrow-left" size={28} color={theme.textMain} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Solicitação de Acesso</Text>
            <View style={{ width: 28 }} /> 
          </View>

          <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={{ flex: 1 }}
          >
          <ScrollView 
            contentContainerStyle={styles.scrollContent} 
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {solicitacaoEnviada ? (
              /* CARD DE SUCESSO - SOLICITACAO ENVIADA */
              <View style={[styles.formContainer, { alignItems: 'center', paddingVertical: 32 }]}>
                <View style={[styles.successIconCircle, { backgroundColor: 'rgba(72,187,120,0.15)' }]}>
                  <Feather name="check-circle" size={48} color="#48BB78" />
                </View>

                <Text style={[styles.formTitle, { fontSize: 22, marginTop: 16, color: '#48BB78' }]}>
                  Solicitação Enviada!
                </Text>

                <Text style={styles.successDescription}>
                  Seus dados escolares foram encaminhados com sucesso para a <Text style={{fontWeight: 'bold', color: '#FFF'}}>Coordenação de Transportes da Prefeitura</Text>.
                </Text>

                <View style={styles.protocolBox}>
                  <View style={styles.protocolRow}>
                    <Text style={styles.protocolLabel}>Aluno:</Text>
                    <Text style={styles.protocolValue}>{formData.nome}</Text>
                  </View>
                  <View style={styles.protocolRow}>
                    <Text style={styles.protocolLabel}>Instituição:</Text>
                    <Text style={styles.protocolValue}>{formData.escola || 'Instituição Informada'}</Text>
                  </View>
                  <View style={styles.protocolRow}>
                    <Text style={styles.protocolLabel}>Status:</Text>
                    <Text style={[styles.protocolValue, { color: '#F5A623', fontWeight: 'bold' }]}>
                      ⏳ Em Análise Presencial
                    </Text>
                  </View>
                </View>

                <Text style={styles.successHint}>
                  Assim que a documentação for conferida com a secretaria de educação, seu assento e linha serão vinculados automaticamente.
                </Text>

                <TouchableOpacity 
                  style={[styles.btnRegistar, { marginTop: 20 }]} 
                  onPress={() => router.replace('/')}
                >
                  <Text style={styles.btnRegistarText}>Voltar ao Início</Text>
                </TouchableOpacity>
              </View>
            ) : (
              /* FORMULARIO DE SOLICITACAO ESTUDANTIL */
              <View style={styles.formContainer}>
                
                <Text style={styles.formTitle}>Cadastro de Estudante</Text>
                <Text style={styles.formSubtitle}>
                  Envie seus dados para a validação da sua vaga no transporte universitário municipal
                </Text>

                {/* Aviso para Motoristas */}
                <View style={styles.driverCallout}>
                  <FontAwesome5 name="info-circle" size={14} color="#94A3B8" />
                  <Text style={styles.driverCalloutText}>
                    Motoristas devem solicitar credenciamento diretamente na Secretaria de Transportes.
                  </Text>
                </View>

                <View style={styles.divider} />

                <TextInput 
                  style={styles.inputSimple} 
                  placeholder="Nome Completo *" 
                  placeholderTextColor={theme.textLight}
                  value={formData.nome}
                  onChangeText={(v) => handleInputChange('nome', v)}
                />
                
                <TextInput 
                  style={[styles.inputSimple, cpfError ? { borderColor: '#EF4444' } : {}]} 
                  placeholder="CPF do Estudante *" 
                  keyboardType="number-pad" 
                  autoCapitalize="none" 
                  placeholderTextColor={theme.textLight}
                  value={formatarCPF(formData.cpf)}
                  onChangeText={(v) => {
                    setCpfError('');
                    handleInputChange('cpf', limparCPF(v));
                  }}
                  maxLength={14}
                />
                {cpfError ? <Text style={{ color: '#EF4444', fontSize: 13, marginTop: -5, marginBottom: 10 }}>{cpfError}</Text> : null}

                <TextInput 
                  style={styles.inputSimple} 
                  placeholder="WhatsApp / Telefone *" 
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
                  placeholder="Cidade de Origem"
                />

                <TextInput 
                  style={styles.inputSimple} 
                  placeholder="E-mail (opcional)" 
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
                    placeholder="Selecione a Instituição / Faculdade"
                  />
                ) : (
                  <View style={[styles.inputSimple, styles.disabledInput, { backgroundColor: theme.cardBg, borderColor: theme.border }]}>
                    <Text style={{ color: theme.textLight, fontSize: 15 }}>Selecione sua cidade primeiro</Text>
                  </View>
                )}

                <TextInput 
                  style={styles.inputSimple} 
                  placeholder="Nº da Matrícula Escolar (opcional)" 
                  placeholderTextColor={theme.textLight}
                  value={formData.matriculaEscolar}
                  onChangeText={(v) => handleInputChange('matriculaEscolar', v)}
                />

                <TextInput 
                  style={styles.inputSimple} 
                  placeholder="Ponto de Embarque pretendido" 
                  placeholderTextColor={theme.textLight}
                  value={formData.pontoEmbarque}
                  onChangeText={(v) => handleInputChange('pontoEmbarque', v)}
                />

                {/* Seletor de Turno */}
                <Text style={styles.inputLabel}>Turno das Aulas:</Text>
                <View style={styles.turnoRow}>
                  {(['Matutino', 'Vespertino', 'Noturno'] as const).map((t) => (
                    <TouchableOpacity
                      key={t}
                      style={[styles.turnoBtn, turno === t && styles.turnoBtnActive]}
                      onPress={() => setTurno(t)}
                    >
                      <Text style={[styles.turnoText, turno === t && styles.turnoTextActive]}>{t}</Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <TextInput 
                  style={styles.inputSimple} 
                  placeholder="Criar uma Senha (padrão: 123456)" 
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
                  Ao solicitar o acesso, você autoriza a conferência dos seus dados escolares pela administração pública responsável pelo transporte.
                </Text>

                <TouchableOpacity 
                  style={[styles.btnRegistar, loading && styles.btnDisabled]} 
                  onPress={handleRegisto}
                  disabled={loading}
                >
                  <Text style={styles.btnRegistarText}>
                    {loading ? 'Enviando...' : 'Enviar Solicitação de Acesso'}
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            <View style={styles.footerLinks}>
              <TouchableOpacity style={styles.loginLinkBtn} onPress={() => router.replace('/')}>
                <Text style={styles.loginLinkText}>Já tem cadastro liberado? <Text style={{fontWeight: 'bold', color: theme.gold}}>Inicie sessão</Text></Text>
              </TouchableOpacity>
            </View>
            
            <View style={{ height: 30 }} />
          </ScrollView>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0B1120' },
  backgroundImage: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, width: '100%', height: '100%', resizeMode: 'cover', zIndex: -1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 10, paddingBottom: 20 },
  backBtn: { padding: 5 },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#FFFFFF' },
  scrollContent: { flexGrow: 1, alignItems: 'center', paddingHorizontal: 20, paddingBottom: 100 },
  
  formContainer: { width: '100%', maxWidth: 450, backgroundColor: '#233248', padding: 24, borderRadius: 30, shadowColor: '#000', shadowOffset: { width: 0, height: 5 }, shadowOpacity: 0.3, shadowRadius: 10, elevation: 8, marginBottom: 20, borderWidth: 1, borderColor: '#37474F' },
  formTitle: { fontSize: 20, fontWeight: 'bold', color: '#FFFFFF', marginBottom: 6, textAlign: 'center' },
  formSubtitle: { fontSize: 13, color: '#94A3B8', textAlign: 'center', marginBottom: 16, lineHeight: 18 },

  driverCallout: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#121A2F',
    borderWidth: 1,
    borderColor: '#37474F',
    borderRadius: 14,
    padding: 12,
    marginBottom: 16,
  },
  driverCalloutText: {
    flex: 1,
    color: '#94A3B8',
    fontSize: 12,
    lineHeight: 16,
  },

  divider: { height: 1, backgroundColor: '#37474F', marginBottom: 20 },

  inputLabel: { color: '#FFF', fontSize: 13, fontWeight: '600', marginBottom: 8, marginTop: 4 },
  turnoRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  turnoBtn: { flex: 1, paddingVertical: 10, borderRadius: 12, backgroundColor: '#121A2F', borderWidth: 1, borderColor: '#37474F', alignItems: 'center' },
  turnoBtnActive: { backgroundColor: '#F5A623', borderColor: '#F5A623' },
  turnoText: { color: '#94A3B8', fontSize: 12, fontWeight: '600' },
  turnoTextActive: { color: '#1A253A', fontWeight: 'bold' },

  inputSimple: { height: 50, backgroundColor: '#121A2F', borderRadius: 25, marginBottom: 16, paddingHorizontal: 20, color: '#FFF', fontSize: 15, borderWidth: 1, borderColor: '#37474F' },
  disabledInput: { justifyContent: 'center' },
  
  termsText: { fontSize: 12, color: '#94A3B8', textAlign: 'center', marginBottom: 20, marginTop: 5, lineHeight: 18 },

  btnRegistar: { height: 54, backgroundColor: '#F5A623', borderRadius: 27, justifyContent: 'center', alignItems: 'center', width: '100%', shadowColor: '#F5A623', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 5 },
  btnRegistarText: { color: '#1A253A', fontSize: 16, fontWeight: 'bold' },
  btnDisabled: { opacity: 0.6 },
  
  /* Estilos do Card de Sucesso */
  successIconCircle: { width: 80, height: 80, borderRadius: 40, justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  successDescription: { color: '#CBD5E1', fontSize: 14, textAlign: 'center', lineHeight: 22, marginTop: 8, paddingHorizontal: 10 },
  protocolBox: { width: '100%', backgroundColor: '#121A2F', borderRadius: 16, padding: 16, marginTop: 20, borderWidth: 1, borderColor: '#37474F' },
  protocolRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 },
  protocolLabel: { color: '#94A3B8', fontSize: 13 },
  protocolValue: { color: '#FFF', fontSize: 13, fontWeight: '600', maxWidth: '65%', textAlign: 'right' },
  successHint: { color: '#94A3B8', fontSize: 12, textAlign: 'center', lineHeight: 18, marginTop: 16, paddingHorizontal: 12 },

  footerLinks: { alignItems: 'center', width: '100%', marginTop: 10 },
  loginLinkBtn: { padding: 15, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 25, width: '100%', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  loginLinkText: { color: '#94A3B8', fontSize: 14 },
});