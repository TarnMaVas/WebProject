import { useToast } from '../components/ToastProvider';
import { createEnhancedServices } from '../firebase/notificationServices';
import { createEnhancedAuthServices } from '../firebase/notificationAuth';
import { useMemo } from 'react';

export const useFirebaseWithNotifications = () => {
  const toast = useToast();

  const enhancedServices = useMemo(() => {
    return createEnhancedServices(toast)
  }, [toast]);

  const enhancedAuthServices = useMemo(() => {
    return createEnhancedAuthServices(toast);
  }, [toast]);

  return {
    ...enhancedServices,
    ...enhancedAuthServices
  };
};
