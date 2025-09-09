import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Text } from 'react-native';

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
        tabBarActiveTintColor: '#00684b',
        tabBarInactiveTintColor: '#666',
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopWidth: 1,
          borderTopColor: '#e9ecef',
          paddingBottom: 5,
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
      }}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen}
        options={{
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>🏠</Text>,
          headerShown: false,
        }}
      />
      <Tab.Screen 
        name="AI Scan" 
        component={DiagnosticScreen}
        options={{
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>🤖</Text>,
          headerTitle: 'AI Plant Diagnostics',
        }}
      />
      <Tab.Screen 
        name="Farm" 
        component={FarmScreen}
        options={{
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>🌾</Text>,
          headerTitle: 'Farm Management',
        }}
      />
      <Tab.Screen 
        name="Market" 
        component={MarketplaceScreen}
        options={{
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>🛒</Text>,
          headerTitle: 'Marketplace',
        }}
      />
      <Tab.Screen 
        name="Community" 
        component={CommunityScreen}
        options={{
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>👥</Text>,
          headerTitle: 'Community Hub',
        }}
      />
      <Tab.Screen 
        name="Chat" 
        component={ChatScreen}
        options={{
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>💬</Text>,
          headerTitle: 'AI Assistant',
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
