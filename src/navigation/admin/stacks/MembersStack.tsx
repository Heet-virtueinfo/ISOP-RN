import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import MembersScreen from '../../../screens/admin/MembersScreen';
import AdminHeader from '../../../components/AdminHeader';

const Stack = createStackNavigator();

const MembersStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: true,
        header: () => <AdminHeader title="Global Directory" />,
      }}
    >
      <Stack.Screen 
        name="MembersScreen" 
        component={MembersScreen} 
      />
    </Stack.Navigator>
  );
};

export default MembersStack;
