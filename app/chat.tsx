import React, { useState, useRef, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TouchableOpacity, 
  SafeAreaView, 
  FlatList, 
  TextInput, 
  KeyboardAvoidingView, 
  Platform,
  StatusBar
} from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';

// Voltamos pra importação direta e limpa igual a gente fez nas outras telas!
// O preview da web pode reclamar, mas no teu VS Code e no celular vai rodar liso.
import { useApp } from './_layout';

// Molde de como cada mensagem tem de ser guardada
interface Message {
  id: string;
  text: string;
  sender: string;
  isMe: boolean;
  time: string;
}

export default function Chat() {
  const router = useRouter();
  
  // Pegando o tema direto do nosso contexto, sem gambiarras de fallback
  const { theme, isDark } = useApp();
  
  // Mensagens falsas só pra tela não ficar vazia quando a gente for apresentar pro prof
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', text: 'Bom dia! O autocarro já saiu da garagem.', sender: 'Carlos (Motorista)', isMe: false, time: '07:00' },
    { id: '2', text: 'Ótimo, obrigado pelo aviso!', sender: 'Eu', isMe: true, time: '07:05' },
    { id: '3', text: 'Vou estar na paragem em 5 minutos.', sender: 'Eu', isMe: true, time: '07:06' },
  ]);
  
  const [inputMessage, setInputMessage] = useState('');
  const flatListRef = useRef<FlatList>(null);

  // Função simples pra jogar a mensagem na tela
  const sendMessage = () => {
    // Se a pessoa só mandou espaço em branco, a gente ignora
    if (inputMessage.trim() === '') return;

    const newMessage: Message = {
      id: Date.now().toString(),
      text: inputMessage,
      sender: 'Eu',
      isMe: true,
      time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    };

    setMessages([...messages, newMessage]);
    setInputMessage(''); // Limpa a caixa de texto depois de enviar
  };

  // Esse negocinho aqui garante que o chat rola pra última mensagem automaticamente
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100); // 100ms de delay pro React ter tempo de renderizar a lista
    }
  }, [messages]);

  // Função que desenha o balãozinho de cada mensagem
  const renderMessage = ({ item }: { item: Message }) => (
    <View style={[styles.messageWrapper, item.isMe ? styles.wrapperMe : styles.wrapperOther]}>
      {/* Só mostra o nome se não for eu a mandar */}
      {!item.isMe && (
        <Text style={[styles.senderName, { color: theme.gold }]}>{item.sender}</Text>
      )}
      <View 
        style={[
          styles.bubble, 
          item.isMe 
            ? { backgroundColor: theme.gold, borderBottomRightRadius: 4 } 
            : { backgroundColor: theme.card, borderColor: theme.border, borderWidth: 1, borderBottomLeftRadius: 4 }
        ]}
      >
        <Text style={[styles.messageText, { color: item.isMe ? '#1A253A' : theme.text }]}>
          {item.text}
        </Text>
        <Text style={[styles.time, { color: item.isMe ? 'rgba(26, 37, 58, 0.6)' : theme.subtext }]}>
          {item.time}
        </Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.bg }]}>
      {/* Escondendo o header nativo do Expo */}
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar barStyle={theme.status as any} />

      {/* Cabeçalho do Chat com botão de voltar */}
      <View style={[styles.header, { backgroundColor: theme.card, borderBottomColor: theme.border }]}>
        <TouchableOpacity onPress={() => router.replace('/home')} style={styles.backBtn}>
          <Feather name="arrow-left" size={24} color={theme.text} />
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={[styles.headerTitle, { color: theme.text }]}>Grupo ORE 3</Text>
          <Text style={[styles.headerSubtitle, { color: theme.subtext }]}>Ativo agora</Text>
        </View>
        <TouchableOpacity style={styles.infoBtn}>
          <Ionicons name="information-circle-outline" size={24} color={theme.text} />
        </TouchableOpacity>
      </View>

      {/* O KeyboardAvoidingView tava bugando, então coloquei um offset no teclado.
          Basicamente isso calcula a altura do header + barra de status pra empurrar o input do jeito certo */}
      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 70}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderMessage}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled" /* Deixa clicar na tela pra fechar o teclado se precisar */
        />

        {/* Campo de digitar a mensagem */}
        <View style={[styles.inputContainer, { backgroundColor: theme.card, borderTopColor: theme.border }]}>
          <TextInput
            style={[styles.input, { backgroundColor: theme.inputBg || '#121A2F', color: theme.text, borderColor: theme.border }]}
            placeholder="Escreve uma mensagem..."
            placeholderTextColor={theme.subtext}
            value={inputMessage}
            onChangeText={setInputMessage}
            multiline
          />
          <TouchableOpacity 
            style={[styles.sendBtn, { backgroundColor: inputMessage.trim() ? theme.gold : theme.border }]} 
            onPress={sendMessage}
            disabled={!inputMessage.trim()} // Desativa o botão se não tiver texto
          >
            <Ionicons name="send" size={18} color={inputMessage.trim() ? '#1A253A' : theme.subtext} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    padding: 16, 
    borderBottomWidth: 1,
    // Ajustezinho de padding pro header ficar bom no iOS também
    paddingTop: Platform.OS === 'ios' ? 10 : 16,
  },
  backBtn: { padding: 4 },
  headerInfo: { flex: 1, marginLeft: 12 },
  headerTitle: { fontSize: 16, fontWeight: 'bold' },
  headerSubtitle: { fontSize: 12, marginTop: 2 },
  infoBtn: { padding: 4 },
  
  listContent: { 
    padding: 16, 
    paddingBottom: 24 
  },
  messageWrapper: { 
    marginBottom: 16, 
    maxWidth: '80%' 
  },
  wrapperMe: { alignSelf: 'flex-end' },
  wrapperOther: { alignSelf: 'flex-start' },
  
  senderName: { 
    fontSize: 11, 
    fontWeight: 'bold', 
    marginBottom: 4, 
    marginLeft: 4 
  },
  bubble: { 
    padding: 12, 
    borderRadius: 16 
  },
  messageText: { 
    fontSize: 14, 
    lineHeight: 20 
  },
  time: { 
    fontSize: 10, 
    alignSelf: 'flex-end', 
    marginTop: 4 
  },
  
  inputContainer: { 
    flexDirection: 'row', 
    alignItems: 'flex-end', 
    padding: 12, 
    borderTopWidth: 1 
  },
  input: { 
    flex: 1, 
    minHeight: 40, 
    maxHeight: 100, 
    borderRadius: 20, 
    paddingHorizontal: 16, 
    paddingVertical: 8, 
    fontSize: 14, 
    borderWidth: 1 
  },
  sendBtn: { 
    width: 44, 
    height: 44, 
    borderRadius: 22, 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginLeft: 12 
  }
});