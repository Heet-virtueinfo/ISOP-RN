import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import AdminLibraryScreen from '../../../screens/admin/AdminLibraryScreen';

const Stack = createStackNavigator();

const LibraryStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="AdminLibraryScreen" component={AdminLibraryScreen} />
  </Stack.Navigator>
);

export default LibraryStack;
