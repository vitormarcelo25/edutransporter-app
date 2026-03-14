import React from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TouchableOpacity, 
  SafeAreaView, 
  ScrollView, 
  StatusBar,
  Platform
} from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';

// Voltando para a importação direta e normal, assim como fizemos no perfil e no chat!
// Isso resolve qualquer erro de importação no teu VS Code. O preview daqui pode reclamar, mas no Expo Go funciona a 100%.
import { useApp } from './_layout';

// Avisos falsos só pra ter o que mostrar na apresentação pro professor
const AVISOS = [
  {
    id: '1',
    tipo: 'urgente',
    titulo: 'Alteração de Rota',
    descricao: 'Devido a obras na Rua Principal, o autocarro fará um desvio pela Avenida das Flores hoje à tarde.',
    data: 'Hoje, 08:30',
    icon: 'warning'
  },
  {
    id: '2',
    tipo: 'info',
    titulo: 'Manutenção Preventiva',
    descricao: 'O veículo ORE 3 passará por manutenção na próxima sexta-feira. Um veículo reserva será utilizado.',
    data: '24 Fev, 15:00',
    icon: 'settings'
  },
  {
    id: '3',
    tipo: 'sucesso',
    titulo: 'Nova Funcionalidade',
    descricao: 'Agora já pode consultar o histórico de presenças diretamente no seu perfil.',
    data: '22 Fev, 10:20',
    icon: 'notifications'
  }
];

export default function Avisos() {
  const router = useRouter();
  
  // Pegando as cores do tema que a gente configurou lá no _layout.tsx
  const { theme } = useApp();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]}>
      {/* Tirando o header nativo do Expo pra usar o nosso mais bonito */}
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar barStyle={theme.status as any} />

      {/* Cabeçalho */}
      <View style={[styles.header, { borderBottomColor: theme.border, backgroundColor: theme.card }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="arrow-left" size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.text }]}>Centro de Avisos</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {AVISOS.map((aviso) => {
          // Deixando a lógica de cores dos ícones mais limpa com base no tipo do aviso
          const isUrgente = aviso.tipo === 'urgente';
          const isInfo = aviso.tipo === 'info';
          
          const iconColor = isUrgente ? '#EF4444' : isInfo ? '#3182CE' : '#48BB78';
          const iconBg = isUrgente ? 'rgba(239, 68, 68, 0.1)' : isInfo ? 'rgba(49, 130, 206, 0.1)' : 'rgba(72, 187, 120, 0.1)';

          return (
            <View 
              key={aviso.id} 
              style={[
                styles.card, 
                { 
                  backgroundColor: theme.card, 
                  borderColor: theme.border,
                  borderLeftColor: iconColor
                }
              ]}
            >
              <View style={styles.cardHeader}>
                <View style={[styles.iconBox, { backgroundColor: iconBg }]}>
                  <Ionicons name={aviso.icon as any} size={20} color={iconColor} />
                </View>
                <View style={styles.textContainer}>
                  <Text style={[styles.cardTitle, { color: theme.text }]}>{aviso.titulo}</Text>
                  <Text style={[styles.cardDate, { color: theme.subtext }]}>{aviso.data}</Text>
                </View>
              </View>
              <Text style={[styles.cardDesc, { color: theme.subtext }]}>
                {aviso.descricao}
              </Text>
            </View>
          );
        })}
        {/* Espacinho extra no final pro scroll não colar no fundo da tela */}
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    paddingHorizontal: 20, 
    // Ajuste fino: no iPhone precisa de menos padding no topo por causa do SafeArea
    paddingTop: Platform.OS === 'ios' ? 10 : 20, 
    paddingBottom: 15, 
    borderBottomWidth: 1,
    elevation: 4
  },
  backBtn: { padding: 8 },
  title: { fontSize: 18, fontWeight: 'bold' },
  scrollContent: { padding: 20 },
  card: { 
    borderRadius: 20, 
    padding: 18, 
    marginBottom: 15, 
    borderWidth: 1, 
    borderLeftWidth: 6,
    // Dando uma sombrinha massa nos cards pra parecer um app de verdade
    elevation: 3, 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  iconBox: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  textContainer: { flex: 1 },
  cardTitle: { fontSize: 16, fontWeight: 'bold' },
  cardDate: { fontSize: 12, marginTop: 2, fontWeight: '500' },
  cardDesc: { fontSize: 14, lineHeight: 22 } // Lineheight maior pra ficar melhor de ler
});