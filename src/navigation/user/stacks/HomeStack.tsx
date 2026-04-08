import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from '../../../screens/home/HomeScreen';
import EventListScreen from '../../../screens/events/EventListScreen';
import EventDetailScreen from '../../../screens/events/EventDetailScreen';
import ParticipantsScreen from '../../../screens/events/ParticipantsScreen';
import FeedbackListScreen from '../../../screens/events/FeedbackListScreen';
import NewsScreen from '../../../screens/home/NewsScreen';

const Stack = createStackNavigator();

const HomeStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="HomeMain" component={HomeScreen} />
    <Stack.Screen name="EventList" component={EventListScreen} />
    <Stack.Screen name="EventDetail" component={EventDetailScreen} />
    <Stack.Screen name="Participants" component={ParticipantsScreen} />
    <Stack.Screen name="FeedbackList" component={FeedbackListScreen} />
    <Stack.Screen name="NewsScreen" component={NewsScreen} />
  </Stack.Navigator>
);

export default HomeStack;
