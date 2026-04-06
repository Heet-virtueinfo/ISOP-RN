import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppNavigator from './src/navigation/AppNavigator';
import AppToast from './src/components/AppToast';
import { AuthProvider } from './src/contexts/AuthContext';
import { useNetwork } from './src/hooks/useNetwork';
import NoInternetScreen from './src/components/NoInternetScreen';
import { notificationService } from './src/services/notificationService';

notificationService.setBackgroundMessageHandler();

const App = () => {
  const { isOnline } = useNetwork();

  React.useEffect(() => {
    // Setup foreground and initial notification handlers
    const unsubForeground = notificationService.setupForegroundHandler();
    notificationService.handleInitialNotification((screen, data) => {
      console.log('Navigate to:', screen, data);
      // navigationRef.navigate(screen, data);
    });

    return () => {
      unsubForeground();
    };
  }, []);

  return (
    <SafeAreaProvider>
      <AuthProvider>
        {!isOnline ? <NoInternetScreen /> : <AppNavigator />}
      </AuthProvider>
      <AppToast />
    </SafeAreaProvider>
  );
};

export default App;
