import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import AuthStack from './AuthStack';
import AdminStack from './AdminStack';
import UserStack from './UserStack';
import { ADMIN_UID } from '../config/firebase';
import { useAuth } from '../contexts/AuthContext';
import CustomLoader from '../components/CustomLoader';

const Stack = createStackNavigator();

const AppNavigator = () => {
  const { user, userProfile, loading } = useAuth();

  if (loading) {
    return (
      <CustomLoader
        message="Checking Session..."
        overlay={false}
        style={{ flex: 1 }}
      />
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!user ? (
          <Stack.Screen name="Auth" component={AuthStack} />
        ) : userProfile?.role === 'admin' || user?.uid === ADMIN_UID ? (
          <Stack.Screen name="Admin" component={AdminStack} />
        ) : (
          <Stack.Screen name="User" component={UserStack} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
