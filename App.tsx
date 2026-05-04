import React, { useState } from 'react';
import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppNavigator from './src/navigation/AppNavigator';
import AppToast from './src/components/AppToast';
import { AuthProvider } from './src/contexts/AuthContext';
import { useNetwork } from './src/hooks/useNetwork';
import NoInternetScreen from './src/components/NoInternetScreen';
import { notificationService } from './src/services/notificationService';
import { colors } from './src/theme/colors';
import RNBootSplash from 'react-native-bootsplash';

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

    const init = async () => {
      // …do some stuff (e.g. subscribe to network state, fetch data…)
    };

    init().finally(async () => {
      await RNBootSplash.hide({ fade: true });
      console.log('BootSplash hidden');
    });

    return () => {
      unsubForeground();
    };
  }, []);

  return (
    <SafeAreaProvider>
      <StatusBar 
        barStyle="dark-content" 
        backgroundColor={colors.layout.background} 
      />
      <AuthProvider>
        {!isOnline ? <NoInternetScreen /> : <AppNavigator />}
      </AuthProvider>
      <AppToast />
    </SafeAreaProvider>
  );
};

export default App;
