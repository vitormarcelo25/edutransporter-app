import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';

// Configuração do notificador
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

// Solicita permissões de notificação
export async function requestNotificationPermissions(): Promise<boolean> {
  if (!Device.isDevice) {
    console.log('Notificações só funcionam em dispositivos reais');
    return false;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    console.log('Permissão de notificação negada');
    return false;
  }

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'EduTransporte',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#F5A623',
      sound: 'default',
    });

    // Canal para avisos importantes
    await Notifications.setNotificationChannelAsync('avisos', {
      name: 'Avisos Importantes',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 500, 250, 500],
      lightColor: '#EF4444',
      sound: 'default',
    });

    // Canal para mensagens do chat
    await Notifications.setNotificationChannelAsync('mensagens', {
      name: 'Mensagens do Chat',
      importance: Notifications.AndroidImportance.DEFAULT,
      sound: 'default',
    });

    // Canal para lembretes de viagem
    await Notifications.setNotificationChannelAsync('viagens', {
      name: 'Lembretes de Viagem',
      importance: Notifications.AndroidImportance.HIGH,
      sound: 'default',
    });
  }

  return true;
}

// Obtém o token de push para envio remoto
export async function getPushToken(): Promise<string | null> {
  try {
    if (!Device.isDevice) {
      return null;
    }

    const hasPermission = await requestNotificationPermissions();
    if (!hasPermission) {
      return null;
    }

    const { data: pushToken } = await Notifications.getExpoPushTokenAsync();
    console.log('Push Token:', pushToken);
    return pushToken;
  } catch (error) {
    console.error('Erro ao obter push token:', error);
    return null;
  }
}

// Agenda uma notificação local
export async function scheduleLocalNotification(
  title: string,
  body: string,
  data?: Record<string, unknown>,
  channelId: string = 'default'
): Promise<string | null> {
  try {
    const hasPermission = await requestNotificationPermissions();
    if (!hasPermission) {
      return null;
    }

    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data: data || {},
        sound: 'default',
      },
      trigger: null, // Envia imediatamente
    });

    return id;
  } catch (error) {
    console.error('Erro ao agendar notificação:', error);
    return null;
  }
}

// Notificação de novo aviso
export async function notifyNewAviso(titulo: string, descricao: string): Promise<void> {
  await scheduleLocalNotification(
    `📢 ${titulo}`,
    descricao,
    { type: 'aviso' },
    'avisos'
  );
}

// Notificação de nova mensagem no chat
export async function notifyNewMessage(senderName: string, message: string): Promise<void> {
  await scheduleLocalNotification(
    `💬 ${senderName}`,
    message,
    { type: 'chat' },
    'mensagens'
  );
}

// Notificação de lembrete de viagem
export async function notifyTravelReminder(
  tipo: 'Ida' | 'Volta',
  horario: string,
  escola: string
): Promise<void> {
  await scheduleLocalNotification(
    `🚌 Lembrete de Viagem - ${tipo}`,
    `Sua viagem para ${escola} começa às ${horario}`,
    { type: 'viagem' },
    'viagens'
  );
}

// Notificação de presença confirmada
export async function notifyPresenceConfirmed(): Promise<void> {
  await scheduleLocalNotification(
    '✅ Presença Confirmada!',
    'Sua presença foi registrada com sucesso.',
    { type: 'presenca' }
  );
}

// Notificação de mudança de rota
export async function notifyRouteChange(newRoute: string): Promise<void> {
  await scheduleLocalNotification(
    '🗺️ Rota Alterada',
    `Atenção: A rota foi alterada para ${newRoute}`,
    { type: 'rota' },
    'avisos'
  );
}

// Cancela todas as notificações agendadas
export async function cancelAllScheduledNotifications(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
}

// Adiciona listener para quando uma notificação é clicada
export function addNotificationResponseListener(
  callback: (response: Notifications.NotificationResponse) => void
): Notifications.EventSubscription {
  return Notifications.addNotificationResponseReceivedListener(callback);
}

// Adiciona listener para quando uma notificação é recebida
export function addNotificationReceivedListener(
  callback: (notification: Notifications.Notification) => void
): Notifications.EventSubscription {
  return Notifications.addNotificationReceivedListener(callback);
}

// Configura listeners globais de notificação
export function setupNotificationListeners(
  onResponse: (response: Notifications.NotificationResponse) => void,
  onReceived?: (notification: Notifications.Notification) => void
): () => void {
  const subscriptionResponse = addNotificationResponseListener(onResponse);
  
  let subscriptionReceived: Notifications.EventSubscription | undefined;
  if (onReceived) {
    subscriptionReceived = addNotificationReceivedListener(onReceived);
  }

  // Retorna função de cleanup
  return () => {
    subscriptionResponse.remove();
    if (subscriptionReceived) {
      subscriptionReceived.remove();
    }
  };
}
