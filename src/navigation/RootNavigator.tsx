import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SwipeScreen from '../screens/SwipeScreen';
import RecommendationsScreen from '../screens/RecommendationsScreen';
import ProductDetailScreen from '../screens/ProductDetailScreen';
import FilterBar from '../components/FilterBar';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function Tabs() {
  return (
    <Tab.Navigator screenOptions={{ header: () => <FilterBar /> }}>
      <Tab.Screen name="Swipe" component={SwipeScreen} />
      <Tab.Screen name="Recommendations" component={RecommendationsScreen} />
    </Tab.Navigator>
  );
}

export default function RootNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Home" component={Tabs} options={{ headerShown: false }} />
      <Stack.Screen name="ProductDetail" component={ProductDetailScreen} options={{ title: 'Details' }} />
    </Stack.Navigator>
  );
}
