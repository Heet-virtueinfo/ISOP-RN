import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import FeedsScreen from '../../../screens/feeds/FeedsScreen';
import CreatePostScreen from '../../../screens/feeds/CreatePostScreen';
import SharePostScreen from '../../../screens/feeds/SharePostScreen';
import CommentsScreen from '../../../screens/feeds/CommentsScreen';
import EventDetailScreen from '../../../screens/events/EventDetailScreen';
import ParticipantsScreen from '../../../screens/events/ParticipantsScreen';
import FeedbackListScreen from '../../../screens/events/FeedbackListScreen';

const Stack = createStackNavigator();

const FeedsStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="FeedsMain" component={FeedsScreen} />
    <Stack.Screen
      name="CreatePost"
      component={CreatePostScreen}
      options={{ presentation: 'modal' }}
    />
    <Stack.Screen
      name="SharePost"
      component={SharePostScreen}
      options={{ presentation: 'modal' }}
    />
    <Stack.Screen name="Comments" component={CommentsScreen} />
    <Stack.Screen name="EventDetail" component={EventDetailScreen} />
    <Stack.Screen name="Participants" component={ParticipantsScreen} />
    <Stack.Screen name="FeedbackList" component={FeedbackListScreen} />
  </Stack.Navigator>
);

export default FeedsStack;
