import React from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context'; 
import { ThemeProvider } from './src/providers/ThemeProvider';
import { LoaderProvider } from './src/providers/LoaderProvider';
import { CustomAlertProvider } from './src/providers/CustomAlertProvider';
import { SyncQueueProvider } from './src/providers/SyncQueueProvider';
import { DataProvider } from './src/providers/DataProvider';

import TabNavigator from './src/navigation/TabNavigator';

export default function App() {
  return (
<GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ThemeProvider>
          <LoaderProvider>
            <CustomAlertProvider>
              <SyncQueueProvider>
                <DataProvider>
                  
                  <NavigationContainer>
                    <TabNavigator />
                  </NavigationContainer>

                </DataProvider>
              </SyncQueueProvider>
            </CustomAlertProvider>
          </LoaderProvider>
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}