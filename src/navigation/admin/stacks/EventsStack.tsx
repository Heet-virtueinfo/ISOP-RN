import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import AdminDashboard from '../../../screens/admin/AdminDashboard';
import EditEventScreen from '../../../screens/admin/EditEventScreen';
import FeedbackListScreen from '../../../screens/events/FeedbackListScreen';
import AdminHeader from '../../../components/AdminHeader';
import AdminEventDetailScreen from '../../../screens/admin/AdminEventDetailScreen';
import AdminLibraryScreen from '../../../screens/admin/AdminLibraryScreen';

import AdminEventListScreen from '../../../screens/admin/AdminEventListScreen';

const Stack = createStackNavigator();

const EventsStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: true,
        header: ({ route, navigation }) => {
          let title = 'ISoP Admin';
          let showBack = false;

          if (route.name === 'AdminDashboard') {
            title = 'Manage Events';
          } else if (route.name === 'AdminEventList') {
            title = 'Event Inventory';
            showBack = true;
          } else if (route.name === 'AdminEventDetail') {
            title = (route.params as any)?.eventTitle || 'Event Details';
            showBack = true;
          } else if (route.name === 'EditEvent') {
            title = 'Edit Event';
            showBack = true;
          }

          return (
            <AdminHeader
              title={title}
              showBack={showBack}
              onBackPress={() => navigation.goBack()}
            />
          );
        },
      }}
    >
      <Stack.Screen name="AdminDashboard" component={AdminDashboard} />
      <Stack.Screen name="AdminEventList" component={AdminEventListScreen} />
      <Stack.Screen
        name="AdminEventDetail"
        component={AdminEventDetailScreen}
      />
      <Stack.Screen name="EditEvent" component={EditEventScreen} />
      <Stack.Screen
        name="FeedbackList"
        component={FeedbackListScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="AdminLibrary"
        component={AdminLibraryScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
};

export default EventsStack;
