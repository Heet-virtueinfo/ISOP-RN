import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import AdminDashboard from '../../../screens/admin/AdminDashboard';
import EditEventScreen from '../../../screens/admin/EditEventScreen';
import AdminHeader from '../../../components/AdminHeader';

const Stack = createStackNavigator();

const EventsStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: true,
        header: ({ route, navigation }) => (
          <AdminHeader
            title={route.name === 'AdminDashboard' ? 'Manage Events' : 'Edit Event'}
            showBack={route.name === 'EditEvent'}
            onBackPress={() => navigation.goBack()}
          />
        ),
      }}
    >
      <Stack.Screen
        name="AdminDashboard"
        component={AdminDashboard}
      />
      <Stack.Screen
        name="EditEvent"
        component={EditEventScreen}
      />
    </Stack.Navigator>
  );
};

export default EventsStack;
