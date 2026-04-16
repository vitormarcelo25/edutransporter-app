/**
 * v1.0 - O Retorno
 * Vitor Santana no código
 * 
 * Chat - Mensagens em grupo da rota
 * Lista de mensagens com bubbles (enviado/recebido)
 * Input com botão de enviar
 */

import React, { useState, useRef, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TouchableOpacity, 
  FlatList, 
  TextInput, 
  Platform,
  StatusBar,
  KeyboardAvoidingView
} from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

interface Message {
  id: string;
  text: string;
  sender: string;
  isMe: boolean;
  time: string;
}

export default function Chat() {
  const router = useRouter();
  
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', text: 'Bom dia! O autocarro já saiu da garagem.', sender: 'Carlos (Motorista)', isMe: false, time: '07:00' },
    { id: '2', text: 'Ótimo, obrigado pelo aviso!', sender: 'Eu', isMe: true, time: '07:05' },
    { id: '3', text: 'Vou estar na paragem em 5 minutos.', sender: 'Eu', isMe: true, time: '07:06' },
  ]);
  
  const [inputMessage, setInputMessage] = useState('');
  const flatListRef = useRef<FlatList>(null);

  const sendMessage = () => {
    if (inputMessage.trim() === '') return;

    const newMessage: Message = {
      id: Date.now().toString(),
      text: inputMessage,
      sender: 'Eu',
      isMe: true,
      time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    };

    setMessages([...messages, newMessage]);
    setInputMessage('');
  };

  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  const renderMessage = ({ item }: { item: Message }) => (
    <View style={[styles.messageWrapper, item.isMe ? styles.wrapperMe : styles.wrapperOther]}>
      {!item.isMe && (
        <Text style={styles.senderName}>{item.sender}</Text>
      )}
      <View style={[styles.bubble, item.isMe ? styles.bubbleMe : styles.bubbleOther]}>
        <Text style={[styles.messageText, item.isMe ? styles.textMe : styles.textOther]}>
          {item.text}
        </Text>
        <Text style={[styles.time, item.isMe ? styles.timeMe : styles.timeOther]}>
          {item.time}
        </Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1A253A" />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.replace('/home')} style={styles.backBtn}>
          <Feather name="arrow-left" size={24} color="#FFF" />
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle}>Grupo ORE 3</Text>
          <Text style={styles.headerSubtitle}>Ativo agora</Text>
        </View>
        <TouchableOpacity style={styles.infoBtn}>
          <Ionicons name="information-circle-outline" size={24} color="#FFF" />
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
        style={styles.keyboardView}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderMessage}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        />

        <View style={styles.inputWrapper}>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Escreve uma mensagem..."
              placeholderTextColor="#94A3B8"
              value={inputMessage}
              onChangeText={setInputMessage}
            />
            <TouchableOpacity 
              style={[styles.sendBtn, inputMessage.trim() ? styles.sendBtnActive : styles.sendBtnDisabled]} 
              onPress={sendMessage}
              disabled={!inputMessage.trim()}
            >
              <Ionicons name="send" size={18} color={inputMessage.trim() ? '#1A253A' : '#94A3B8'} />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1A253A',
  },
  keyboardView: {
    flex: 1,
  },
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    padding: 16, 
    borderBottomWidth: 1,
    borderBottomColor: '#37474F',
    backgroundColor: '#1A253A',
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
  },
  backBtn: { padding: 4 },
  headerInfo: { flex: 1, marginLeft: 12 },
  headerTitle: { fontSize: 16, fontWeight: 'bold', color: '#FFF' },
  headerSubtitle: { fontSize: 12, marginTop: 2, color: '#94A3B8' },
  infoBtn: { padding: 4 },
  
  listContent: { 
    padding: 16,
    paddingBottom: 100,
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
    marginLeft: 4,
    color: '#F5A623'
  },
  bubble: { 
    padding: 12, 
    borderRadius: 16 
  },
  bubbleMe: { backgroundColor: '#F5A623', borderBottomRightRadius: 4 },
  bubbleOther: { backgroundColor: '#233248', borderWidth: 1, borderColor: '#37474F', borderBottomLeftRadius: 4 },
  
  messageText: { fontSize: 14, lineHeight: 20 },
  textMe: { color: '#1A253A' },
  textOther: { color: '#FFF' },
  
  time: { fontSize: 10, alignSelf: 'flex-end', marginTop: 4 },
  timeMe: { color: 'rgba(26, 37, 58, 0.6)' },
  timeOther: { color: '#94A3B8' },
  
  inputWrapper: {
    backgroundColor: '#233248',
    borderTopWidth: 1,
    borderTopColor: '#37474F',
  },
  inputContainer: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingHorizontal: 16, 
    paddingVertical: 12,
    paddingBottom: Platform.OS === 'ios' ? 35 : 20,
  },
  input: { 
    flex: 1, 
    height: 48,
    borderRadius: 24,
    paddingHorizontal: 20,
    fontSize: 14,
    backgroundColor: '#1A253A',
    color: '#FFF',
    borderWidth: 1,
    borderColor: '#37474F',
  },
  sendBtn: { 
    width: 48, 
    height: 48, 
    borderRadius: 24, 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginLeft: 12
  },
  sendBtnActive: { backgroundColor: '#F5A623' },
  sendBtnDisabled: { backgroundColor: '#37474F' }
});
