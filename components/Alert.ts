/**
 * Alert do EduTransporte
 *
 * Mesma assinatura do Alert.alert do React Native, mas exibe a janela com o
 * visual do próprio aplicativo (componente AppAlertHost), em vez do pop-up
 * padrão do navegador/sistema.
 */
import { Alert as RNAlert } from 'react-native';

export type AlertButton = {
  text?: string;
  onPress?: () => void;
  style?: 'default' | 'cancel' | 'destructive';
};

export type AlertRequest = {
  id: number;
  title: string;
  message?: string;
  buttons: AlertButton[];
};

type Listener = (req: AlertRequest) => void;

let listener: Listener | null = null;
let nextId = 1;

/** Usado pelo AppAlertHost para receber os pedidos de alerta. */
export const registerAlertHost = (fn: Listener | null) => {
  listener = fn;
};

export const Alert = {
  alert: (
    title: string,
    message?: string,
    buttons?: AlertButton[],
    _options?: any
  ) => {
    const lista = buttons && buttons.length > 0 ? buttons : [{ text: 'OK' }];
    if (listener) {
      listener({ id: nextId++, title, message, buttons: lista });
      return;
    }
    // Host ainda não montado: usa o alerta nativo como reserva
    RNAlert.alert(title, message, lista);
  },
};

export default Alert;
