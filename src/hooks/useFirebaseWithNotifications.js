// Custom hook for using Firebase services with toast notifications
import { useToast } from '../components/ToastProvider';
import { useDialog } from '../components/DialogProvider';
import { createEnhancedServices } from '../firebase/notificationServices';
import { createEnhancedAuthServices } from '../firebase/notificationAuth';

export const useFirebaseWithNotifications = () => {
  const toast = useToast();
  const dialog = useDialog();

  const enhancedServices = createEnhancedServices(toast, dialog);

  const enhancedAuthServices = createEnhancedAuthServices(toast);

  return {
    ...enhancedServices,
    ...enhancedAuthServices
  };
};
