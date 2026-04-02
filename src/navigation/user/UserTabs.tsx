import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MessageCircle, Home, BookMarked, User } from 'lucide-react-native';
import { View } from 'react-native';
import { colors, typography } from '../../theme';
import HomeStack from './stacks/HomeStack';
import MyEventsStack from './stacks/MyEventsStack';
import ChatsStack from './stacks/ChatsStack';
import ProfileStack from './stacks/ProfileStack';
import ChatRequestBadge from '../../components/ChatRequestBadge';

const Tab = createBottomTabNavigator();

const UserTabs = () => {
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
          paddingTop: 2,
        },
        tabBarLabelStyle: {
          fontFamily: typography.fontFamily,
          fontSize: 10,
          fontWeight: '700',
        },
      }}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeStack}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ color, size }) => <Home color={color} size={size} />,
        }}
      />
      <Tab.Screen
        name="MyEventsTab"
        component={MyEventsStack}
        options={{
          tabBarLabel: 'My Events',
          tabBarIcon: ({ color, size }) => (
            <BookMarked color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="ChatsTab"
        component={ChatsStack}
        options={{
          tabBarLabel: 'Chats',
          tabBarIcon: ({ color, size }) => (
            <View>
              <MessageCircle color={color} size={size} />
              <ChatRequestBadge />
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={ProfileStack}
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: ({ color, size }) => <User color={color} size={size} />,
        }}
      />
    </Tab.Navigator>
  );
};

export default UserTabs;
