import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import AdminSettingsScreen from '../../../screens/admin/AdminSettingsScreen';
import AdminHeader from '../../../components/AdminHeader';

const Stack = createStackNavigator();

const SettingsStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: true,
        header: () => <AdminHeader title="Settings" />,
      }}
    >
      <Stack.Screen 
        name="AdminSettingsScreen" 
        component={AdminSettingsScreen} 
      />
    </Stack.Navigator>
  );
};

export default SettingsStack;
