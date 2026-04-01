import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppNavigator from './src/navigation/AppNavigator';
import AppToast from './src/components/AppToast';
import { AuthProvider } from './src/contexts/AuthContext';
import { useNetwork } from './src/hooks/useNetwork';
import NoInternetScreen from './src/components/NoInternetScreen';

const App = () => {
  const { isOnline } = useNetwork();

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
