import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import ProfileScreen from '../../../screens/profile/ProfileScreen';

const Stack = createStackNavigator();

const ProfileStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="ProfileMain" component={ProfileScreen} />
  </Stack.Navigator>
);

export default ProfileStack;
