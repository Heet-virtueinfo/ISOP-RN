import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import AdminNewsScreen from '../../../screens/admin/AdminNewsScreen';

const Stack = createStackNavigator();

const NewsStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="AdminNews" component={AdminNewsScreen} />
  </Stack.Navigator>
);

export default NewsStack;
