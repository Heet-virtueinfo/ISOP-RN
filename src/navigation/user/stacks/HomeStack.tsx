import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from '../../../screens/home/HomeScreen';
import EventListScreen from '../../../screens/events/EventListScreen';
import EventDetailScreen from '../../../screens/events/EventDetailScreen';
import ParticipantsScreen from '../../../screens/events/ParticipantsScreen';

const Stack = createStackNavigator();

const HomeStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="HomeMain" component={HomeScreen} />
    <Stack.Screen name="EventList" component={EventListScreen} />
    <Stack.Screen name="EventDetail" component={EventDetailScreen} />
    <Stack.Screen name="Participants" component={ParticipantsScreen} />
  </Stack.Navigator>
);

export default HomeStack;
