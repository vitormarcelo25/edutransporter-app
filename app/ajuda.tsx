import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, SafeAreaView, ScrollView, LayoutAnimation, Platform, UIManager, StatusBar } from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const FAQS = [
  { id: 1, pergunta: "Como faço para alterar a minha rota?", resposta: "Para solicitar a alteração da sua rota padrão, vá ao seu Perfil e selecione a opção 'Solicitar Nova Rota'. O pedido será analisado pela central de transporte num prazo de 24 horas." },
  { id: 2, pergunta: "O que faço se o motorista se atrasar?", resposta: "Acompanhe a localização do autocarro em tempo real no separador 'Mapa'. Se o atraso for superior a 15 minutos, a nossa central enviará um aviso automático para a sua aplicação." },
  { id: 3, pergunta: "Como posso atualizar os meus dados?", resposta: "Aceda a 'Perfil' > 'Configurações da Conta' para alterar o seu número de telemóvel, e-mail ou morada. Algumas alterações podem necessitar de validação da secretaria." },
  { id: 4, pergunta: "Como justificar a ausência do aluno?", resposta: "Na aba 'Home', clique em 'Confirmar Presença' para gerir o seu lugar. Use o chat direto com a central para enviar uma justificação médica ou familiar se necessário." },
  { id: 5, pergunta: "Como reportar um problema no autocarro?", resposta: "Utilize a aba 'Chat' para falar diretamente com o suporte técnico ou envie um e-mail para suporte@edutransporter.com com os detalhes da ocorrência." }
];

export default function Ajuda() {
  const router = useRouter();
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  const theme = {
    gold: '#F5A623',       
    bg: '#121A2F',         
    cardBg: '#233248',     
    border: '#37474F',     
    textMain: '#FFFFFF',   
    textLight: '#94A3B8',  
  };

  const toggleFaq = (id: number) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedFaq(expandedFaq === id ? null : id);
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.bg }]}>
        <StatusBar barStyle="light-content" backgroundColor="#233248" />
        
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtnWrapper}>
            <Feather name="arrow-left" size={24} color={theme.textMain} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Central de Ajuda</Text>
          <View style={{width: 40}} /> 
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          
          <View style={styles.helpHeaderCard}>
            <Ionicons name="help-buoy" size={48} color={theme.gold} />
            <Text style={styles.helpHeaderTitle}>Como podemos ajudar?</Text>
            <Text style={styles.helpHeaderSub}>Encontre as respostas para as dúvidas mais frequentes abaixo.</Text>
          </View>

          <Text style={styles.sectionTitle}>Perguntas Frequentes (FAQ)</Text>

          {FAQS.map((faq) => {
            const isExpanded = expandedFaq === faq.id;
            return (
              <View key={faq.id} style={styles.faqCard}>
                <TouchableOpacity 
                  style={styles.faqQuestionContainer} 
                  activeOpacity={0.7}
                  onPress={() => toggleFaq(faq.id)}
                >
                  <Text style={[styles.faqQuestion, isExpanded && { color: theme.gold }]}>
                    {faq.pergunta}
                  </Text>
                  <Feather 
                    name={isExpanded ? "chevron-up" : "chevron-down"} 
                    size={20} 
                    color={isExpanded ? theme.gold : theme.textLight} 
                  />
                </TouchableOpacity>
                
                {isExpanded && (
                  <View style={styles.faqAnswerContainer}>
                    <Text style={styles.faqAnswer}>{faq.resposta}</Text>
                  </View>
                )}
              </View>
            );
          })}

          <TouchableOpacity style={styles.contactBtn}>
            <Feather name="mail" size={20} color="#1A253A" style={{marginRight: 8}} />
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
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, backgroundColor: '#233248', borderBottomWidth: 1, borderBottomColor: '#37474F', elevation: 2 },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#FFFFFF' },
  backBtnWrapper: { width: 40, height: 40, justifyContent: 'center', alignItems: 'flex-start' },

  content: { padding: 20 },
  
  helpHeaderCard: { alignItems: 'center', backgroundColor: '#233248', padding: 30, borderRadius: 20, marginBottom: 24, borderWidth: 1, borderColor: '#37474F', shadowColor: '#000', shadowOffset: {width: 0, height: 4}, shadowOpacity: 0.2, shadowRadius: 8, elevation: 3 },
  helpHeaderTitle: { fontSize: 20, fontWeight: 'bold', color: '#FFFFFF', marginTop: 12, textAlign: 'center' },
  helpHeaderSub: { fontSize: 14, color: '#94A3B8', textAlign: 'center', marginTop: 8, lineHeight: 20 },
  
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#FFFFFF', marginBottom: 15, marginLeft: 4 },

  faqCard: { backgroundColor: '#233248', borderRadius: 16, marginBottom: 12, overflow: 'hidden', borderWidth: 1, borderColor: '#37474F' },
  faqQuestionContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 18 },
  faqQuestion: { flex: 1, fontSize: 15, fontWeight: '600', color: '#FFFFFF', paddingRight: 10 },
  faqAnswerContainer: { padding: 18, paddingTop: 0, backgroundColor: '#233248' },
  faqAnswer: { fontSize: 14, color: '#94A3B8', lineHeight: 22 },

  contactBtn: { flexDirection: 'row', marginTop: 20, backgroundColor: '#F5A623', padding: 16, borderRadius: 25, alignItems: 'center', justifyContent: 'center', shadowColor: '#F5A623', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 5 },
  contactBtnText: { color: '#1A253A', fontSize: 16, fontWeight: 'bold' }
});