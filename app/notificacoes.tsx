// Tela de Notificações - configurar quais notificações receber
import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, SafeAreaView, ScrollView, Platform, Switch, Alert } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter, Stack } from 'expo-router';
import { useApp } from './_layout';
import { updateNotificacoes, NotificacoesConfig, PerfilUpdateResponse } from '@/services/api';

export default function Notificacoes() {
  const router = useRouter();
  const { theme } = useApp();
  const [salvando, setSalvando] = useState(false);
  const [config, setConfig] = useState<NotificacoesConfig>({
    avisos: true,
    presenca: true,
    mensagens: true,
    rotas: true,
  });

  const toggleConfig = async (key: keyof NotificacoesConfig) => {
    const novoValor = !config[key];
    
    // Atualiza local primeiro
    setConfig((prev: NotificacoesConfig) => ({ ...prev, [key]: novoValor }));
    
    setSalvando(true);
    const novoConfig = { ...config, [key]: novoValor };
    const result: PerfilUpdateResponse = await updateNotificacoes(novoConfig);
    setSalvando(false);
    
    if (!result.success) {
      // Reverte se falhar
      setConfig(prev => ({ ...prev, [key]: !novoValor }));
      Alert.alert('Erro', result.message || 'Erro ao salvar');
    }
  };

  const ItemSwitch = ({ title, subtitle, keyName, icon, iconColor }: {
    title: string;
    subtitle: string;
    keyName: keyof NotificacoesConfig;
    icon: string;
    iconColor: string;
  }) => (
    <View style={[styles.item, { borderBottomColor: theme.border }]}>
      <View style={styles.itemLeft}>
        <View style={[styles.iconBox, { backgroundColor: `${iconColor}20` }]}>
          <Feather name={icon as any} size={18} color={iconColor} />
        </View>
        <View style={styles.itemText}>
          <Text style={[styles.itemTitle, { color: theme.text }]}>{title}</Text>
          <Text style={[styles.itemSubtitle, { color: theme.subtext }]}>{subtitle}</Text>
        </View>
      </View>
      <Switch
        value={config[keyName]}
        onValueChange={() => toggleConfig(keyName)}
        trackColor={{ false: '#CBD5E1', true: theme.gold }}
        thumbColor={config[keyName] ? '#FFF' : '#F4F3F4'}
        disabled={salvando}
      />
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]}>
      <Stack.Screen options={{ headerShown: false }} />
      
      <View style={[styles.header, { borderBottomColor: theme.border }]}>
        <TouchableOpacity onPress={() => router.back()}>
          <Feather name="arrow-left" size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.text }]}>Notificações</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={[styles.sectionTitle, { color: theme.subtext }]}>TIPOS DE NOTIFICAÇÃO</Text>
        
        <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <ItemSwitch 
            title="Avisos Importantes" 
            subtitle="Alertas de alterações de rota, manutenção, etc."
            keyName="avisos"
            icon="bell"
            iconColor="#EF4444"
          />
          <ItemSwitch 
            title="Presença" 
            subtitle="Confirmação de presença na viagem"
            keyName="presenca"
            icon="check-circle"
            iconColor="#48BB78"
          />
          <ItemSwitch 
            title="Mensagens" 
            subtitle="Novas mensagens no chat da rota"
            keyName="mensagens"
            icon="message-circle"
            iconColor="#3182CE"
          />
          <ItemSwitch 
            title="Rotas" 
            subtitle="Lembrees de viagens agendadas"
            keyName="rotas"
            icon="map-pin"
            iconColor="#9F7AEA"
          />
        </View>

        <View style={styles.infoBox}>
          <Feather name="info" size={18} color={theme.subtext} />
          <Text style={[styles.infoText, { color: theme.subtext }]}>
            As notificações push dependem das permissões do dispositivo. Para修改ar, vá em Configurações do App.
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
  sectionTitle: { fontSize: 12, fontWeight: 'bold', marginBottom: 10, marginLeft: 5 },
  card: {
    borderRadius: 20,
    borderWidth: 1,
    overflow: 'hidden',
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
  },
  itemLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemText: { flex: 1, marginLeft: 12 },
  itemTitle: { fontSize: 15, fontWeight: 'bold' },
  itemSubtitle: { fontSize: 12, marginTop: 2 },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 15,
    padding: 15,
  },
  infoText: { flex: 1, marginLeft: 10, fontSize: 13, lineHeight: 20 },
});