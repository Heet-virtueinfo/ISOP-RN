import React, { useState } from 'react';
import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppNavigator from './src/navigation/AppNavigator';
import AppToast from './src/components/AppToast';
import { AuthProvider } from './src/contexts/AuthContext';
import { useNetwork } from './src/hooks/useNetwork';
import NoInternetScreen from './src/components/NoInternetScreen';
import { notificationService } from './src/services/notificationService';
import BootSplash from 'react-native-bootsplash';
import { colors } from './src/theme/colors';

notificationService.setBackgroundMessageHandler();

const App = () => {
  const { isOnline } = useNetwork();
  const [isSplashHidden, setIsSplashHidden] = useState(false);

  React.useEffect(() => {
    // Setup foreground and initial notification handlers
    const unsubForeground = notificationService.setupForegroundHandler();
    notificationService.handleInitialNotification((screen, data) => {
      console.log('Navigate to:', screen, data);
      // navigationRef.navigate(screen, data);
    });

    // Hide splash screen with a smooth fade once the app is ready
    BootSplash.hide({ fade: true }).then(() => {
      setIsSplashHidden(true);
    });

    return () => {
      unsubForeground();
    };
  }, []);

  return (
    <SafeAreaProvider>
      <StatusBar 
        barStyle={isSplashHidden ? 'dark-content' : 'light-content'} 
        backgroundColor={isSplashHidden ? colors.layout.background : colors.brand.primaryDark} 
      />
      <AuthProvider>
        {!isOnline ? <NoInternetScreen /> : <AppNavigator />}
      </AuthProvider>
      <AppToast />
    </SafeAreaProvider>
  );
};

export default App;
