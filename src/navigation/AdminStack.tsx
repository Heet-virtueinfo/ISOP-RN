import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { getFocusedRouteNameFromRoute } from '@react-navigation/native';
import AdminTabs from './AdminTabs';
import EditEventScreen from '../screens/admin/EditEventScreen';
import AdminHeader from '../components/AdminHeader';

const Stack = createStackNavigator();

export type AdminStackParamList = {
  AdminTabs: undefined;
};

const getHeaderTitle = (route: any) => {
  const routeName = getFocusedRouteNameFromRoute(route) ?? 'Events';
  switch (routeName) {
    case 'Events':
      return 'Manage Events';
    case 'AddEvent':
      return 'Create Event';
    case 'Members':
      return 'Members';
    case 'Settings':
      return 'Settings';
    default:
      return 'ISoP Admin';
  }
};

const AdminStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: 'white' },
      }}
    >
      <Stack.Screen name="AdminTabs" component={AdminTabs} />
    </Stack.Navigator>
  );
};

export default AdminStack;
