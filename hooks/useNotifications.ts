import { useEffect, useRef } from 'react';
import { useRouter } from 'expo-router';
import * as Notifications from 'expo-notifications';
import { useApp } from '../contexts/AppContext';
import { registrarPushToken } from '../services/api';
import { 
  requestNotificationPermissions,
  getPushToken,
  setupNotificationListeners,
  notifyNewAviso,
  notifyNewMessage,
  notifyTravelReminder,
  notifyPresenceConfirmed,
  notifyRouteChange,
} from '../services/notifications';

// Hook principal para configurar notificações
export function useNotifications() {
  const router = useRouter();
  const { authToken } = useApp();
  const pushTokenRef = useRef<string | null>(null);

  useEffect(() => {
    // Solicita permissões ao inicializar
    requestNotificationPermissions();

    // Obtém push token e registra caso já esteja autenticado
    getPushToken().then((token) => {
      if (token) {
        pushTokenRef.current = token;
        registrarPushToken(token).catch(() => {});
      }
    });

    // Configura listeners
    const cleanup = setupNotificationListeners(
      (response) => {
        const data = response.notification.request.content.data;
        
        // Navega para a tela correta baseada no tipo de notificação
        switch (data?.type) {
          case 'aviso':
            router.push('/avisos');
            break;
          case 'chat':
            router.push('/chat');
            break;
          case 'viagem':
            router.push('/calendario');
            break;
          case 'presenca':
            router.push('/presenca');
            break;
          case 'rota':
            router.push('/mapa');
            break;
          default:
            router.push('/home');
        }
      },
      (notification) => {
        // Callback quando notificação é recebida
        console.log('Notificação recebida:', notification);
      }
    );

    return cleanup;
  }, [router]);

  useEffect(() => {
    if (authToken && pushTokenRef.current) {
      registrarPushToken(pushTokenRef.current).catch(() => {});
    }
  }, [authToken]);

  return {
    notifyNewAviso,
    notifyNewMessage,
    notifyTravelReminder,
    notifyPresenceConfirmed,
    notifyRouteChange,
  };
}

// Hook simplificado para apenas enviar notificações
export function useNotify() {
  return {
    aviso: notifyNewAviso,
    message: notifyNewMessage,
    travel: notifyTravelReminder,
    presence: notifyPresenceConfirmed,
    routeChange: notifyRouteChange,
  };
}
