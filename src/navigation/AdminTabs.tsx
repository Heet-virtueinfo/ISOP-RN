import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { TouchableOpacity, Platform } from 'react-native';
import { Calendar, Users, Settings, PlusCircle } from 'lucide-react-native';
import AdminDashboard from '../screens/admin/AdminDashboard';
import EditEventScreen from '../screens/admin/EditEventScreen';
import MembersScreen from '../screens/admin/MembersScreen';
import AdminSettingsScreen from '../screens/admin/AdminSettingsScreen';
import CreateEventScreen from '../screens/admin/CreateEventScreen';
import { colors, typography, spacing } from '../theme';
import AdminHeader from '../components/AdminHeader';

export type AdminTabsParamList = {
  EventsStack: undefined;
  AddEvent: undefined;
  Members: undefined;
  Settings: undefined;
};

const Tab = createBottomTabNavigator<AdminTabsParamList>();
const Stack = createStackNavigator();

const EventsStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: true,
        header: ({ route }) => (
          <AdminHeader title={route.name === 'AdminDashboard' ? 'Manage Events' : 'Edit Event'} />
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

const AdminTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: true,
        header: () => {
          let title: string = route.name;
          if (route.name === 'AddEvent') title = 'Create Event';
          return <AdminHeader title={title} />;
        },
        tabBarActiveTintColor: colors.brand.primary,
        tabBarInactiveTintColor: colors.text.tertiary,
        tabBarStyle: {
          backgroundColor: colors.layout.surface,
          borderTopWidth: 1,
          borderTopColor: colors.layout.divider,
          elevation: 8,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
        },
        tabBarLabelStyle: {
          fontFamily: typography.fontFamily,
          fontSize: 11,
          fontWeight: typography.weights.semiBold,
        },
        tabBarButton: (props: any) => (
          <TouchableOpacity {...props} activeOpacity={0.7} />
        ),
      })}
    >
      <Tab.Screen
        name="EventsStack"
        component={EventsStack}
        options={{
          headerShown: false, // The stack within this tab handles its own header
          tabBarLabel: 'Events',
          tabBarIcon: ({ color, size }) => (
            <Calendar color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="AddEvent"
        component={CreateEventScreen}
        options={{
          tabBarLabel: 'Add',
          tabBarIcon: ({ color, size }) => (
            <PlusCircle color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Members"
        component={MembersScreen}
        options={{
          tabBarIcon: ({ color, size }) => <Users color={color} size={size} />,
        }}
      />
      <Tab.Screen
        name="Settings"
        component={AdminSettingsScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Settings color={color} size={size} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

export default AdminTabs;
