import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';

import HomeScreen from '../screens/HomeScreen';
import DiagnosticScreen from '../screens/DiagnosticScreen';
import ChatScreen from '../screens/ChatScreen';
import FarmScreen from '../screens/FarmScreen';
import MarketplaceScreen from '../screens/MarketplaceScreen';
import CommunityScreen from '../screens/CommunityScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#10B981',
        tabBarInactiveTintColor: '#666',
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopWidth: 1,
          borderTopColor: '#e9ecef',
        },
      }}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen}
        options={{
          tabBarIcon: () => <span>🏠</span>,
          headerShown: false,
        }}
      />
      <Tab.Screen 
        name="AI Scan" 
        component={DiagnosticScreen}
        options={{
          tabBarIcon: () => <span>🤖</span>,
        }}
      />
      <Tab.Screen 
        name="Farm" 
        component={FarmScreen}
        options={{
          tabBarIcon: () => <span>🌾</span>,
        }}
      />
      <Tab.Screen 
        name="Market" 
        component={MarketplaceScreen}
        options={{
          tabBarIcon: () => <span>🛒</span>,
        }}
      />
      <Tab.Screen 
        name="Community" 
        component={CommunityScreen}
        options={{
          tabBarIcon: () => <span>👥</span>,
        }}
      />
      <Tab.Screen 
        name="Chat" 
        component={ChatScreen}
        options={{
          tabBarIcon: () => <span>💬</span>,
        }}
      />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen 
          name="Main" 
          component={TabNavigator}
          options={{ headerShown: false }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
