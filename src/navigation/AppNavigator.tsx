import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import AuthStack from './auth/AuthStack';
import AdminTabs from './admin/AdminTabs';
import UserTabs from './user/UserTabs';
import { ADMIN_UID } from '../config/firebase';
import { useAuth } from '../contexts/AuthContext';
import CustomLoader from '../components/CustomLoader';

const Stack = createStackNavigator();

const AppNavigator = () => {
  const { user, userProfile, loading } = useAuth();

  if (loading) {
    return <CustomLoader overlay={true} style={{ flex: 1 }} />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!user ? (
          <Stack.Screen name="Auth" component={AuthStack} />
        ) : user?.uid === ADMIN_UID ? (
          <Stack.Screen name="Admin" component={AdminTabs} />
        ) : (
          <Stack.Screen name="User" component={UserTabs} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
