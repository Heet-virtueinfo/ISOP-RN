import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppNavigator from './src/navigation/AppNavigator';
import AppToast from './src/components/AppToast';
import { AuthProvider } from './src/contexts/AuthContext';

const App = () => {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <AppNavigator />
      </AuthProvider>
      <AppToast />
    </SafeAreaProvider>
  );
};

export default App;
