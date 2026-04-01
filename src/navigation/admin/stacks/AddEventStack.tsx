import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import CreateEventScreen from '../../../screens/admin/CreateEventScreen';
import AdminHeader from '../../../components/AdminHeader';

const Stack = createStackNavigator();

const AddEventStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: true,
        header: () => <AdminHeader title="Create Event" />,
      }}
    >
      <Stack.Screen 
        name="CreateEventScreen" 
        component={CreateEventScreen} 
      />
    </Stack.Navigator>
  );
};

export default AddEventStack;
