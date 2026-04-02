import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import ProfileScreen from '../../../screens/profile/ProfileScreen';
import EditProfileScreen from '../../../screens/profile/EditProfileScreen';

const Stack = createStackNavigator();

const ProfileStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="ProfileMain" component={ProfileScreen} />
    <Stack.Screen name="EditProfile" component={EditProfileScreen} />
  </Stack.Navigator>
);

export default ProfileStack;
