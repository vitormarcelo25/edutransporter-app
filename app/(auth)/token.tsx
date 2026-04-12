import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, SafeAreaView, SafeAreaViewBase, Platform } from 'react-native';
import { Feather } from '@expo/vector-icons'; 
import { useRouter } from 'expo-router';
import { useApp } from './_layout';
import { Background, HeaderBackButton } from '@react-navigation/elements';

export default function TokenSegurança() {

  const router = useRouter();

  const { theme } = useApp();

  const [token, setToken] = useState('----');

  const gerarToken = () => {

    const numeroAleatorio = Math.floor(1000 + Math.random() * 9000);

    setToken(numeroAleatorio.toString());
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]}>
      <View style={styles.header}>
 
        <TouchableOpacity onPress={() => router.replace('/(tabs)/home')} style={styles.backBtn}>
          <Feather name="arrow-left" size={28} color={theme.text} />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>

        <Feather name="shield" size={60} color={theme.gold} style={{ marginBottom: 20 }} />
        <Text style={[styles.title, { color: theme.text }]}>Token de Segurança</Text>
        <Text style={[styles.subtitle, { color: theme.text }]}>Gere um token de segurança para proteger suas transações.</Text>

        <View style={[styles.tokenbox, { backgroundColor: theme.card, borderColor: theme.border }]}>

          <Text style={[styles.tokentxt, { color: theme.gold }]}>{token}</Text>
          </View>

          <TouchableOpacity
          style={[styles.btn, { backgroundColor: theme.gold }]}
          onPress={gerarToken}
          >

            <Text style={styles.btntext}>Gerar Token</Text>
          </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex   : 1 },
  header: {
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? 40 : 20,

    zIndex: 10,
    elevation: 10,
  },
  backBtn: {
    padding: 10,
    marginLeft: -10,
    width: 50,

  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  

  title: { fontSize: 24, fontWeight : 'bold', marginBottom: 10 },
  subtitle: { fontSize: 14 , textAlign: 'center', marginBottom: 30 },

  tokenbox: {
    width: '80%',
    paddingVertical: 30,
    borderRadius: 20,
    borderWidth: 2,
    alignItems: 'center',
    marginBottom: 40,
    borderStyle: 'dashed',
  },

  tokentxt: { fontSize: 48, fontWeight: '900' , letterSpacing: 8 },

  btn: {
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 30,
    elevation: 5,
  },
  btntext: { color: '#fff', fontSize: 16, fontWeight: 'bold' },

});
