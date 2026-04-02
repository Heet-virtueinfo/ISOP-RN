import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MessageCircle, Home, BookMarked, User, UserPlus } from 'lucide-react-native';
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
             <MessageCircle color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="RequestsTab"
        component={ChatsStack} // This is the stack that contains ChatRequests
        options={{
          tabBarLabel: 'Requests',
          tabBarIcon: ({ color, size }) => (
            <View>
              <UserPlus color={color} size={size} />
              <ChatRequestBadge />
            </View>
          ),
        }}
        listeners={({ navigation }) => ({
          tabPress: (e) => {
            e.preventDefault();
            navigation.navigate('RequestsTab', { screen: 'ChatRequests' });
          },
        })}
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
