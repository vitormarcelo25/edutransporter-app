import React, { useState } from 'react';
import { 
  StyleSheet, Text, View, TouchableOpacity, 
  ScrollView, SafeAreaView, StatusBar, LayoutAnimation, Platform, UIManager
} from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';

// Permite animações de layout no Android (Para o efeito suave de abrir/fechar as perguntas)
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// --- DADOS FALSOS (FAQ MOCKS) ---
const FAQS = [
  { id: 1, pergunta: "Como faço para alterar a minha rota?", resposta: "Para solicitar a alteração da sua rota padrão, vá ao seu Perfil e selecione a opção 'Solicitar Nova Rota'. O pedido será analisado pela central de transporte num prazo de 24 horas." },
  { id: 2, pergunta: "O que faço se o motorista se atrasar?", resposta: "Acompanhe a localização do autocarro em tempo real no separador 'Mapa'. Se o atraso for superior a 15 minutos, a nossa central enviará um aviso automático para a sua aplicação." },
  { id: 3, pergunta: "Como posso atualizar os meus dados?", resposta: "Aceda a 'Perfil' > 'Configurações da Conta' para alterar o seu número de telemóvel, e-mail ou morada. Algumas alterações podem necessitar de validação da secretaria." },
  { id: 4, pergunta: "Como justificar a ausência do aluno?", resposta: "Na aba 'Listas', o motorista pode marcar o aluno como ausente. Se for o responsável, use o chat direto com a central para enviar uma justificação médica ou familiar." },
  { id: 5, pergunta: "Como reportar um problema no autocarro?", resposta: "Utilize a aba 'Chat' para falar diretamente com o suporte técnico ou envie um e-mail para suporte@edutransporter.com com os detalhes da ocorrência." }
];

export default function Ajuda() {
  const router = useRouter(); 
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  
  // Cores base extraídas do Figma
  const theme = {
    background: '#F4F7F6',
    white: '#FFFFFF',
    textDark: '#333333',
    textLight: '#888888',
    tealCard: '#38b29c', 
  };

  // Função para animar a abertura/fecho das respostas
  const toggleFaq = (id: number) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedFaq(expandedFaq === id ? null : id);
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar barStyle="dark-content" />
      
      {/* Cabeçalho */}
      <View style={styles.headerSimples}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtnWrapper}>
          <Feather name="arrow-left" size={24} color={theme.textDark} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Central de Ajuda</Text>
        <View style={{width: 40}} /> 
      </View>

      {/* Corpo da Página */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        
        {/* Cartão de Boas-Vindas */}
        <View style={styles.helpHeaderCard}>
          <Ionicons name="help-buoy" size={40} color={theme.tealCard} />
          <Text style={styles.helpHeaderTitle}>Como podemos ajudar?</Text>
          <Text style={styles.helpHeaderSub}>Encontre as respostas para as dúvidas mais frequentes abaixo.</Text>
        </View>

        <Text style={styles.sectionTitle}>Perguntas Frequentes (FAQ)</Text>

        {/* Lista de Perguntas (Acordeão) */}
        {FAQS.map((faq) => {
          const isExpanded = expandedFaq === faq.id;
          return (
            <View key={faq.id} style={styles.faqCard}>
              <TouchableOpacity 
                style={styles.faqQuestionContainer} 
                activeOpacity={0.7}
                onPress={() => toggleFaq(faq.id)}
              >
                <Text style={[styles.faqQuestion, isExpanded && { color: theme.tealCard }]}>
                  {faq.pergunta}
                </Text>
                <Feather 
                  name={isExpanded ? "chevron-up" : "chevron-down"} 
                  size={20} 
                  color={isExpanded ? theme.tealCard : theme.textLight} 
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

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// -----------------------------------------
// ESTILOS LOCAIS
// -----------------------------------------
const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  content: { padding: 20 },
  
  headerSimples: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    padding: 20, 
    backgroundColor: '#FFF', 
    borderBottomWidth: 1, 
    borderBottomColor: '#EEE' 
  },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  backBtnWrapper: { width: 40, height: 40, justifyContent: 'center', alignItems: 'flex-start' },

  helpHeaderCard: { 
    alignItems: 'center', 
    backgroundColor: '#FFF', 
    padding: 30, 
    borderRadius: 20, 
    marginBottom: 24, 
    shadowColor: '#000', 
    shadowOffset: {width: 0, height: 4}, 
    shadowOpacity: 0.05, 
    shadowRadius: 8, 
    elevation: 3 
  },
  helpHeaderTitle: { fontSize: 20, fontWeight: 'bold', color: '#333', marginTop: 12, textAlign: 'center' },
  helpHeaderSub: { fontSize: 14, color: '#888', textAlign: 'center', marginTop: 8, lineHeight: 20 },
  
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#333', marginBottom: 15 },

  faqCard: { 
    backgroundColor: '#FFF', 
    borderRadius: 16, 
    marginBottom: 12, 
    overflow: 'hidden', 
    shadowColor: '#000', 
    shadowOffset: {width: 0, height: 2}, 
    shadowOpacity: 0.03, 
    shadowRadius: 5, 
    elevation: 2 
  },
  faqQuestionContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 18 },
  faqQuestion: { flex: 1, fontSize: 15, fontWeight: '600', color: '#444', paddingRight: 10 },
  faqAnswerContainer: { padding: 18, paddingTop: 0, backgroundColor: '#FFF' },
  faqAnswer: { fontSize: 14, color: '#666', lineHeight: 22 },
});