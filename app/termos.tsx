// Tela de Termos e Privacidade
import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, SafeAreaView, ScrollView, Platform } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter, Stack } from 'expo-router';
import { useApp } from './_layout';

const TERMOS = `
TERMOS DE USO - EDUTRANS PORTE

Última atualização: 12 de Abril de 2026

1. ACEPTACIÓN DE TÉRMINOS
Ao acessar e usar o aplicativo EduTransporte, você aceita e concorda em cumprir estes Termos de Uso. Se você não concordar com qualquer parte destes termos, não deverá usar nosso aplicativo.

2. DESCRIÇÃO DO SERVIÇO
O EduTransporte é um aplicativo de transporte escolar que conecta alunos e motoristas de transporte escolar, permitindo o rastreamento de rotas, gerenciamento de presenças e comunicação.

3. CADASTRO E CONTA
Para usar o aplicativo, você deve criar uma conta com informações verdadeiras e atualizadas. Você é responsável por manter a confidencialidade de sua conta e senha.

4. USO DO APLICATIVO
Você concorda em:
- Não usar o aplicativo para fins ilegais
- Não intentar acessar sem autorização
- Não compartilhar conteúdo impróprio
- Não assediar ou intimidar outros usuários
- Não collects informações de outros usuários

5. PRIVACIDADE
Sua privacidade é importante para nós. Our политика de privacidade explica como coletamos, usamos e protegemos suas informações pessoais.

6. PROPRIEDADE INTELECTUAL
O conteúdo do aplicativo é propriedade do EduTransporte e protegido por direitos autorais. Você não pode copiar, modificar ou distribuir nosso conteúdo sem autorização.

7. LIMITAÇÃO DE RESPONSABILIDADE
O EduTransporte não será responsável por quaisquer danos diretos, indiretos, incidentais ou consequenciais decorrentes do uso do aplicativo.

8. RESCISÃO
Podemos rescindir sua conta a qualquer tempo por violação destes termos.
`;

const PRIVACIDADE = `
POLÍTICA DE PRIVACIDADE - EDUTRANS PORTE

Última atualização: 12 de Abril de 2026

1. INFORMAÇÕES QUE COLETAMOS

Informações que você fornece:
- Nome, e-mail e telefone
- Dados da escola (para alunos)
- Dados do veículo (para motoristas)
- Localização (quando em viagem)

Informações coletadas automaticamente:
- Dados de uso do aplicativo
- Localização do dispositivo
- Informações do dispositivo

2. COMO USAMOS

Usamos suas informações para:
- Fornecer nossos serviços de transporte
- komunikasinya com você
- Melhorar nosso aplicativo
- Cumprir obrigações legais

3. COMPARTILHAMENTO

Podemos compartilhar informações com:
- Outros usuários (necessário para o serviço)
- Provedores de serviços (para operação)
- Autoridades legais (quando necessário)

Não vendemos suas informações pessoais.

4. SEGURANÇA

Implementamos medidas de segurança para proteger suas informações:
- Criptografia de dados
- Autenticação segura
- Monitoramento regular

5. SEUS DIREITOS

Você tem direito de:
- Acessar seus dados
- Corrigir seus dados
- Excluir sua conta
- Revogar consentimento

6. CONTATO

Para questões sobre privacidade, entre em contato:
contato@edutransporte.com
`;

export default function Termos() {
  const router = useRouter();
  const { theme } = useApp();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]}>
      <Stack.Screen options={{ headerShown: false }} />
      
      <View style={[styles.header, { borderBottomColor: theme.border }]}>
        <TouchableOpacity onPress={() => router.back()}>
          <Feather name="arrow-left" size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.text }]}>Termos e Privacidade</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Termos de Uso */}
        <TouchableOpacity 
          style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}
          onPress={() => router.push({
            pathname: '/termos-detalhes',
            params: { tipo: 'termos', titulo: 'Termos de Uso', conteudo: TERMOS }
          })}
        >
          <View style={styles.cardContent}>
            <View style={[styles.iconBox, { backgroundColor: 'rgba(49,130,206,0.1)' }]}>
              <Feather name="file-text" size={22} color="#3182CE" />
            </View>
            <View style={styles.cardText}>
              <Text style={[styles.cardTitle, { color: theme.text }]}>Termos de Uso</Text>
              <Text style={[styles.cardSubtitle, { color: theme.subtext }]}>
                Regras e condições de uso do app
              </Text>
            </View>
            <Feather name="chevron-right" size={20} color={theme.subtext} />
          </View>
        </TouchableOpacity>

        {/* Política de Privacidade */}
        <TouchableOpacity 
          style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}
          onPress={() => router.push({
            pathname: '/termos-detalhes',
            params: { tipo: 'privacidade', titulo: 'Política de Privacidade', conteudo: PRIVACIDADE }
          })}
        >
          <View style={styles.cardContent}>
            <View style={[styles.iconBox, { backgroundColor: 'rgba(72,187,120,0.1)' }]}>
              <Feather name="shield" size={22} color="#48BB78" />
            </View>
            <View style={styles.cardText}>
              <Text style={[styles.cardTitle, { color: theme.text }]}>Política de Privacidade</Text>
              <Text style={[styles.cardSubtitle, { color: theme.subtext }]}>
                Como coletamos e protegemos seus dados
              </Text>
            </View>
            <Feather name="chevron-right" size={20} color={theme.subtext} />
          </View>
        </TouchableOpacity>

        {/* Dados do App */}
        <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border, marginTop: 20 }]}>
          <Text style={[styles.cardTitle, { color: theme.text }]}>Dados do Aplicativo</Text>
          
          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: theme.subtext }]}>Versão</Text>
            <Text style={[styles.infoValue, { color: theme.text }]}>1.0.0</Text>
          </View>
          <View style={[styles.divider, { backgroundColor: theme.border }]} />
          
          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: theme.subtext }]}>Desenvolvedor</Text>
            <Text style={[styles.infoValue, { color: theme.text }]}>EduTransporte</Text>
          </View>
          <View style={[styles.divider, { backgroundColor: theme.border }]} />
          
          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: theme.subtext }]}>Contato</Text>
            <Text style={[styles.infoValue, { color: theme.text }]}>contato@edutransporte.com</Text>
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: theme.subtext }]}>
            Ao usar o aplicativo, você concorda com nossos Termos de Uso e Política de Privacidade.
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
    padding: 18,
    borderWidth: 1,
    marginBottom: 15,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardText: { flex: 1, marginLeft: 15 },
  cardTitle: { fontSize: 16, fontWeight: 'bold' },
  cardSubtitle: { fontSize: 13, marginTop: 2 },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  infoLabel: { fontSize: 14 },
  infoValue: { fontSize: 14, fontWeight: '600' },
  divider: { height: 1 },
  footer: {
    marginTop: 20,
    paddingHorizontal: 10,
  },
  footerText: { fontSize: 12, textAlign: 'center', lineHeight: 18 },
});