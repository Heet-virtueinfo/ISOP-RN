import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import ProfileScreen from '../../../screens/profile/ProfileScreen';
import EditProfileScreen from '../../../screens/profile/EditProfileScreen';
import MyEventsScreen from '../../../screens/events/MyEventsScreen';
import EventDetailScreen from '../../../screens/events/EventDetailScreen';
import ParticipantsScreen from '../../../screens/events/ParticipantsScreen';
import FeedbackListScreen from '../../../screens/events/FeedbackListScreen';

const Stack = createStackNavigator();

const ProfileStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="ProfileMain" component={ProfileScreen} />
    <Stack.Screen name="EditProfile" component={EditProfileScreen} />
    <Stack.Screen name="MyEventsList" component={MyEventsScreen} />
    <Stack.Screen name="EventDetail" component={EventDetailScreen} />
    <Stack.Screen name="Participants" component={ParticipantsScreen} />
    <Stack.Screen name="FeedbackList" component={FeedbackListScreen} />
  </Stack.Navigator>
);

export default ProfileStack;
