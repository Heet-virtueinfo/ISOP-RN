import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import ChatInboxScreen from '../../../screens/chat/ChatInboxScreen';
import ChatRequestsScreen from '../../../screens/chat/ChatRequestsScreen';
import ChatScreen from '../../../screens/chat/ChatScreen';

const Stack = createStackNavigator();

const ChatsStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="ChatInbox" component={ChatInboxScreen} />
    <Stack.Screen name="ChatRequests" component={ChatRequestsScreen} />
    <Stack.Screen name="Chat" component={ChatScreen} />
  </Stack.Navigator>
);

export default ChatsStack;
