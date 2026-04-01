import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { TouchableOpacity } from 'react-native';
import { Calendar, Users, Settings, PlusCircle } from 'lucide-react-native';
import { colors, typography } from '../../theme';
import EventsStack from './stacks/EventsStack';
import AddEventStack from './stacks/AddEventStack';
import MembersStack from './stacks/MembersStack';
import SettingsStack from './stacks/SettingsStack';

export type AdminTabsParamList = {
  EventsTab: undefined;
  AddEventTab: undefined;
  MembersTab: undefined;
  SettingsTab: undefined;
};

const Tab = createBottomTabNavigator<AdminTabsParamList>();

const AdminTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
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
      }}
    >
      <Tab.Screen
        name="EventsTab"
        component={EventsStack}
        options={{
          tabBarLabel: 'Events',
          tabBarIcon: ({ color, size }) => (
            <Calendar color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="AddEventTab"
        component={AddEventStack}
        options={{
          tabBarLabel: 'Add',
          tabBarIcon: ({ color, size }) => (
            <PlusCircle color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="MembersTab"
        component={MembersStack}
        options={{
          tabBarLabel: 'Members',
          tabBarIcon: ({ color, size }) => <Users color={color} size={size} />,
        }}
      />
      <Tab.Screen
        name="SettingsTab"
        component={SettingsStack}
        options={{
          tabBarLabel: 'Settings',
          tabBarIcon: ({ color, size }) => (
            <Settings color={color} size={size} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

export default AdminTabs;
