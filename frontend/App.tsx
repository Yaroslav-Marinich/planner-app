import React, { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context'; 
import { onAuthStateChanged } from 'firebase/auth';

// Ваші провайдери
import { ThemeProvider, useTheme } from './src/providers/ThemeProvider';
import { LoaderProvider } from './src/providers/LoaderProvider';
import { CustomAlertProvider } from './src/providers/CustomAlertProvider';
import { SyncQueueProvider } from './src/providers/SyncQueueProvider';
import { DataProvider } from './src/providers/DataProvider';

// Firebase та Стор
import { auth } from './src/config/firebase';
import { useAuthStore } from './src/store/useAuthStore';

// Екрани та Навігація
import TabNavigator from './src/navigation/TabNavigator';
import AuthScreen from './src/screens/AuthScreen/AuthScreen'; 

const Stack = createNativeStackNavigator();

function RootNavigator() {
  const { user, isAuthLoading, setUser, setAuthLoading } = useAuthStore();
  const { colors } = useTheme();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setAuthLoading(false); 
    });

    return unsubscribe;
  }, []);

  if (isAuthLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!user ? (
          <Stack.Screen name="Auth" component={AuthScreen} />
        ) : (
          <Stack.Screen name="Main" component={TabNavigator} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ThemeProvider>
          <LoaderProvider>
            <CustomAlertProvider>
              <SyncQueueProvider>
                <DataProvider>
                  
                  <RootNavigator />

                </DataProvider>
              </SyncQueueProvider>
            </CustomAlertProvider>
          </LoaderProvider>
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}