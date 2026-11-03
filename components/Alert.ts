import { Alert as RNAlert, Platform } from 'react-native';

export const Alert = {
  alert: (
    title: string,
    message?: string,
    buttons?: Array<{
      text?: string;
      onPress?: () => void;
      style?: 'default' | 'cancel' | 'destructive';
    }>,
    options?: any
  ) => {
    if (Platform.OS === 'web') {
      const fullMessage = message ? `${title}\n\n${message}` : title;
      
      if (buttons && buttons.length > 0) {
        // Check if there is a cancel style or text that implies cancel
        const hasCancel = buttons.some(
          (b) => b.style === 'cancel' || (b.text && b.text.toLowerCase() === 'cancelar')
        );
        
        if (hasCancel) {
          const confirmed = window.confirm(fullMessage);
          if (confirmed) {
            // Find first button that is not cancel
            const okButton = buttons.find(
              (b) => b.style !== 'cancel' && b.text && b.text.toLowerCase() !== 'cancelar'
            ) || buttons[0];
            
            if (okButton && okButton.onPress) {
              okButton.onPress();
            }
          } else {
            // Find cancel button
            const cancelButton = buttons.find(
              (b) => b.style === 'cancel' || (b.text && b.text.toLowerCase() === 'cancelar')
            );
            if (cancelButton && cancelButton.onPress) {
              cancelButton.onPress();
            }
          }
        } else {
          // No cancel option, show alert and execute first button's callback
          window.alert(fullMessage);
          if (buttons[0] && buttons[0].onPress) {
            buttons[0].onPress();
          }
        }
      } else {
        window.alert(fullMessage);
      }
    } else {
      RNAlert.alert(title, message, buttons, options);
    }
  },
};
