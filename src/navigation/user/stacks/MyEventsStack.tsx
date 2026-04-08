import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import MyEventsScreen from '../../../screens/events/MyEventsScreen';
import EventDetailScreen from '../../../screens/events/EventDetailScreen';
import ParticipantsScreen from '../../../screens/events/ParticipantsScreen';
import FeedbackListScreen from '../../../screens/events/FeedbackListScreen';

const Stack = createStackNavigator();

const MyEventsStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="MyEventsList" component={MyEventsScreen} />
    <Stack.Screen name="EventDetail" component={EventDetailScreen} />
    <Stack.Screen name="Participants" component={ParticipantsScreen} />
    <Stack.Screen name="FeedbackList" component={FeedbackListScreen} />
  </Stack.Navigator>
);

export default MyEventsStack;
