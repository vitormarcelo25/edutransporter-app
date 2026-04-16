/**
 * v1.0 - O Retorno
 * Vitor Santana no código
 *
 * Central de Ajuda - FAQ por categorias
 * Perguntas baseadas nas dúvidas reais dos usuários do app
 */

import React, { useState } from 'react';
import {
  StyleSheet, Text, View, TouchableOpacity, SafeAreaView,
  ScrollView, LayoutAnimation, Platform, UIManager, StatusBar
} from 'react-native';
import { Feather, Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import { useApp } from './_layout';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// Categorias de ajuda com ícones
const CATEGORIES = [
  { id: 'conta', label: 'Conta & Login', icon: 'user' as const, color: '#3182CE' },
  { id: 'rotas', label: 'Rotas & Horários', icon: 'bus' as const, color: '#F5A623' },
  { id: 'presenca', label: 'Presença', icon: 'check-circle' as const, color: '#48BB78' },
  { id: 'chat', label: 'Chat & Avisos', icon: 'message-circle' as const, color: '#9F7AEA' },
  { id: 'problemas', label: 'Problemas Técnicos', icon: 'alert-triangle' as const, color: '#EF4444' },
];

// FAQ por categoria
const FAQ_DATA: Record<string, { id: number; pergunta: string; resposta: string }[]> = {
  conta: [
    { id: 1, pergunta: "Esqueci minha senha, como redefino?", resposta: "Na tela de login, toque em 'Esqueceu a senha?'. Você receberá um e-mail com as instruções para criar uma nova senha. Se não receber o e-mail, verifique a caixa de spam ou entre em contato com o suporte." },
    { id: 2, pergunta: "Como alternar entre perfil de Aluno e Motorista?", resposta: "Na tela de login, antes de entrar, use o seletor de perfil (Aluno/Motorista) no topo do formulário. Cada perfil tem acesso a funcionalidades diferentes no app." },
    { id: 3, pergunta: "Como atualizar meus dados pessoais?", resposta: "Vá em Perfil > Dados Pessoais. Lá você pode alterar seu e-mail, telefone e endereço. Alterações no nome ou CPF precisam ser validadas pela secretaria." },
    { id: 4, pergunta: "Posso ter mais de uma conta no app?", resposta: "Não. Cada usuário deve ter apenas uma conta vinculada ao seu CPF ou matrícula. Se precisar de acesso com outro perfil, use a opção 'Sair' e entre com os dados corretos." },
  ],
  rotas: [
    { id: 5, pergunta: "O ônibus não aparece no mapa, o que fazer?", resposta: "Verifique se você tem conexão com internet. O ônibus só aparece quando está em rota ativa (motorista iniciou a rota). Se o motorista já iniciou e mesmo assim não aparece, force o fechamento do app e abra novamente." },
    { id: 6, pergunta: "Como sei qual é minha rota e horário?", resposta: "Na aba 'Início' (home), sua rota do dia aparece automaticamente com horário, escola e status. Na aba 'Agenda', você pode consultar as rotas dos próximos 7 dias." },
    { id: 7, pergunta: "A rota foi alterada sem aviso. Como reclamar?", resposta: "Todas as alterações de rota são comunicadas via avisos no app (aba Início) e por notificação push. Se uma alteração não foi comunicada, use o Chat para falar com a central." },
    { id: 8, pergunta: "Posso solicitar mudança de rota ou parada?", resposta: "Vá em Perfil > Dados Pessoais e envie uma solicitação. Mudanças de rota dependem de análise da central e podem levar até 48 horas para serem processadas." },
    { id: 9, pergunta: "O horário do ônibus mudou, como fico sabendo?", resposta: "Alterações de horário são enviadas como avisos urgentes no app e como notificação push. Verifique a aba 'Avisos' na home para ver comunicados recentes." },
  ],
  presenca: [
    { id: 10, pergunta: "Como confirmar minha presença no ônibus?", resposta: "Quando embarcar, o motorista pode marcar sua presença automaticamente, ou você pode confirmar no app se a opção estiver disponível. Sua presença aparece na aba 'Início'." },
    { id: 11, pergunta: "O app marca que estou presente mas não embarquei. Como corrigir?", resposta: "Use a aba 'Chat' para informar à central sobre o erro. O motorista pode ajustar a lista de presença no próprio app." },
    { id: 12, pergunta: "Meu filho faltou hoje. Preciso justificar?", resposta: "Faltas não precisam de justificativa imediata. Porém, se houver 3 faltas consecutivas, a central pode entrar em contato para verificar a situação." },
  ],
  chat: [
    { id: 13, pergunta: "Como enviar uma mensagem pelo chat?", resposta: "Acesse a aba 'Chat' na barra inferior. Selecione o contato (motorista, central ou outro pai/aluno), digite sua mensagem e envie. Mensagens são enviadas em tempo real." },
    { id: 14, pergunta: "Posso enviar fotos ou arquivos pelo chat?", resposta: "Atualmente o chat suporta apenas mensagens de texto. Fotos e documentos podem ser enviados por e-mail para suporte@edutransporter.com." },
    { id: 15, pergunta: "Como silenciar notificações do chat?", resposta: "Vá em Perfil > Notificações e desative a opção 'Mensagens do Chat'. Você ainda receberá notificações de avisos e alterações de rota." },
    { id: 16, pergunta: "Recebi um aviso urgente, preciso fazer algo?", resposta: "Avisos urgentes (vermelhos) geralmente indicam alterações que afetam sua rota — como mudança de horário, desvio ou cancelamento. Leia a mensagem completa e siga as instruções." },
  ],
  problemas: [
    { id: 17, pergunta: "O app está travando ou fechando sozinho", resposta: "Tente: 1) Fechar o app e abrir novamente, 2) Limpar o cache do app nas configurações do celular, 3) Verificar se há atualização na loja de aplicativos. Se o problema persistir, desinstale e reinstale o app." },
    { id: 18, pergunta: "Não recebo notificações push", resposta: "Verifique se as notificações estão ativadas nas configurações do celular. No app, vá em Perfil > Notificações e certifique-se de que as opções estão habilitadas." },
    { id: 19, pergunta: "O mapa não carrega a localização", resposta: "Verifique se o GPS do celular está ativado e se o app tem permissão de localização (Configurações > Apps > EduTransporter > Permissões). Reinicie o app após ativar." },
    { id: 20, pergunta: "Como reportar um bug ou dar sugestão?", resposta: "Use o Chat para falar com o suporte ou envie um e-mail detalhado para suporte@edutransporter.com com: modelo do celular, versão do app (encontrada na tela de login) e descrição do problema." },
    { id: 21, pergunta: "O app pede atualizar, sou obrigado?", resposta: "Recomendamos sempre manter o app atualizado para ter acesso a correções e novas funcionalidades. Versões muito antigas podem parar de funcionar após um período." },
  ],
};

function AccordionItem({
  faq,
  isExpanded,
  onToggle,
  theme,
}: {
  faq: { pergunta: string; resposta: string };
  isExpanded: boolean;
  onToggle: () => void;
  theme: any;
}) {
  return (
    <View style={[styles.faqCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
      <TouchableOpacity
        style={styles.faqQuestionContainer}
        activeOpacity={0.7}
        onPress={onToggle}
      >
        <Text style={[styles.faqQuestion, isExpanded && { color: theme.gold }]}>
          {faq.pergunta}
        </Text>
        <Feather
          name={isExpanded ? 'chevron-up' : 'chevron-down'}
          size={20}
          color={isExpanded ? theme.gold : theme.subtext}
        />
      </TouchableOpacity>
      {isExpanded && (
        <View style={styles.faqAnswerContainer}>
          <Text style={[styles.faqAnswer, { color: theme.subtext }]}>{faq.resposta}</Text>
        </View>
      )}
    </View>
  );
}

export default function Ajuda() {
  const router = useRouter();
  const { theme } = useApp();
  const [activeCategory, setActiveCategory] = useState('conta');
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  const toggleFaq = (id: number) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedFaq(expandedFaq === id ? null : id);
  };

  const currentFaqs = FAQ_DATA[activeCategory] || [];

  const getIconComponent = (iconName: string) => {
    switch (iconName) {
      case 'bus': return MaterialCommunityIcons;
      case 'check-circle': return Feather;
      case 'message-circle': return Feather;
      case 'alert-triangle': return Feather;
      default: return Feather;
    }
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.bg }]}>
        <StatusBar barStyle="light-content" />

        {/* Header */}
        <View style={[styles.header, { borderBottomColor: theme.border }]}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtnWrapper}>
            <Feather name="arrow-left" size={24} color={theme.textMain} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.textMain }]}>Central de Ajuda</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Header Card */}
          <View style={[styles.helpHeaderCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <Ionicons name="help-buoy" size={40} color={theme.gold} />
            <Text style={[styles.helpHeaderTitle, { color: theme.textMain }]}>
              Como podemos ajudar?
            </Text>
            <Text style={[styles.helpHeaderSub, { color: theme.subtext }]}>
              Selecione uma categoria abaixo ou busque sua dúvida
            </Text>
          </View>

          {/* Category Tabs */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesRow}
          >
            {CATEGORIES.map((cat) => {
              const isActive = activeCategory === cat.id;
              const IconComp = getIconComponent(cat.icon);
              return (
                <TouchableOpacity
                  key={cat.id}
                  style={[
                    styles.categoryChip,
                    isActive
                      ? { backgroundColor: cat.color + '22', borderColor: cat.color }
                      : { backgroundColor: theme.card, borderColor: theme.border },
                  ]}
                  onPress={() => {
                    setExpandedFaq(null);
                    setActiveCategory(cat.id);
                  }}
                >
                  <IconComp name={cat.icon} size={16} color={isActive ? cat.color : theme.subtext} />
                  <Text
                    style={[
                      styles.categoryChipText,
                      isActive
                        ? { color: cat.color }
                        : { color: theme.subtext },
                    ]}
                  >
                    {cat.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* FAQ List */}
          <Text style={[styles.sectionTitle, { color: theme.textMain }]}>
            {CATEGORIES.find((c) => c.id === activeCategory)?.label}
          </Text>

          {currentFaqs.map((faq) => (
            <AccordionItem
              key={faq.id}
              faq={faq}
              isExpanded={expandedFaq === faq.id}
              onToggle={() => toggleFaq(faq.id)}
              theme={theme}
            />
          ))}

          {/* Contact Support */}
          <TouchableOpacity
            style={[styles.contactBtn, { backgroundColor: theme.gold }]}
            onPress={() => {}}
          >
            <Feather name="mail" size={20} color="#1A253A" style={{ marginRight: 8 }} />
            <Text style={styles.contactBtnText}>Falar com o Suporte</Text>
          </TouchableOpacity>

          <View style={{ height: 40 }} />
        </ScrollView>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    padding: 20, borderBottomWidth: 1, elevation: 2,
  },
  headerTitle: { fontSize: 18, fontWeight: 'bold' },
  backBtnWrapper: { width: 40, height: 40, justifyContent: 'center', alignItems: 'flex-start' },

  content: { padding: 20 },

  helpHeaderCard: {
    alignItems: 'center', padding: 24, borderRadius: 20,
    marginBottom: 20, borderWidth: 1,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2, shadowRadius: 8, elevation: 3,
  },
  helpHeaderTitle: { fontSize: 18, fontWeight: 'bold', marginTop: 10, textAlign: 'center' },
  helpHeaderSub: { fontSize: 13, textAlign: 'center', marginTop: 6, lineHeight: 18 },

  categoriesRow: { paddingBottom: 16, gap: 8 },
  categoryChip: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 14, paddingVertical: 8,
    borderRadius: 20, borderWidth: 1, marginRight: 4,
    gap: 6,
  },
  categoryChipText: { fontSize: 12, fontWeight: '600' },

  sectionTitle: { fontSize: 15, fontWeight: '700', marginBottom: 12, marginTop: 4 },

  faqCard: { borderRadius: 14, marginBottom: 10, overflow: 'hidden', borderWidth: 1 },
  faqQuestionContainer: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', padding: 16,
  },
  faqQuestion: { flex: 1, fontSize: 14, fontWeight: '600', paddingRight: 10 },
  faqAnswerContainer: { padding: 16, paddingTop: 0 },
  faqAnswer: { fontSize: 13, lineHeight: 21 },

  contactBtn: {
    flexDirection: 'row', marginTop: 24, padding: 16,
    borderRadius: 25, alignItems: 'center', justifyContent: 'center',
    shadowColor: '#F5A623', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 8, elevation: 5,
  },
  contactBtnText: { color: '#1A253A', fontSize: 15, fontWeight: 'bold' },
});
