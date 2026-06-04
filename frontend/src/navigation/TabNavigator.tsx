import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context'; 

import { useTheme } from '../providers/ThemeProvider';

import DashboardScreen from '../screens/Dashboard/DashboardScreen';
import RecipesScreen from '../screens/RecipesScreen/RecipesScreen'; 
import ShoppingListsScreen from '../screens/ShoppingListsScreen/ShoppingListsScreen';
import ProfileScreen from '../screens/ProfileScreen/ProfileScreen';

const Tab = createBottomTabNavigator();

export default function TabNavigator() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap = 'help-outline';

          if (route.name === 'Головна') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Рецепти') {
            iconName = focused ? 'restaurant' : 'restaurant-outline';
          } else if (route.name === 'Покупки') {
            iconName = focused ? 'cart' : 'cart-outline';
          } else if (route.name === 'Профіль') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return <Ionicons name={iconName} size={28} color={color} />;
        },
        
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary, 
        
        tabBarStyle: {
          backgroundColor: colors.card,
          borderTopColor: colors.outline,
          height: 75 + insets.bottom,
          paddingBottom: insets.bottom > 0 ? insets.bottom : 10,
          paddingTop: 10, 
        },

        tabBarLabelStyle: {
          fontSize: 10, 
            marginTop: 4,
        },

        headerStyle: {
          backgroundColor: colors.card,
          shadowColor: 'transparent',
          elevation: 0,
        },
        headerTintColor: colors.text,
        headerShown: route.name !== 'Головна', 
      })}
    >
      <Tab.Screen name="Головна" component={DashboardScreen} />
      <Tab.Screen name="Рецепти" component={RecipesScreen} />
      <Tab.Screen name="Покупки" component={ShoppingListsScreen} />
      <Tab.Screen name="Профіль" component={ProfileScreen} />
    </Tab.Navigator>
  );
}