import React, { createContext, useContext, useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useNetInfo } from '@react-native-community/netinfo';
import { useTheme } from './ThemeProvider';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type SyncQueueContextType = {
  queueCount: number;
  addToQueue: (task: any) => void;
  clearQueue: () => void;
};

const SyncQueueContext = createContext<SyncQueueContextType | undefined>(undefined);

export const SyncQueueProvider = ({ children }: { children: React.ReactNode }) => {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const netInfo = useNetInfo(); 
  
  const [queue, setQueue] = useState<any[]>([]);

  useEffect(() => {
    if (netInfo.isConnected && queue.length > 0) {
      console.log(`Інтернет з'явився! Відправляємо ${queue.length} запитів...`);
      setQueue([]); 
    }
  }, [netInfo.isConnected, queue.length]);

  const addToQueue = (task: any) => {
    setQueue((prev) => [...prev, task]);
  };

  const clearQueue = () => setQueue([]);

  const isOffline = netInfo.isConnected === false;

  return (
    <SyncQueueContext.Provider value={{ queueCount: queue.length, addToQueue, clearQueue }}>
      {children}
      
      {isOffline && (
        <View style={[styles.offlineBanner, { backgroundColor: colors.danger, paddingBottom: insets.bottom > 0 ? 80 : 70 }]}>
          <Text style={styles.offlineText}>
            Немає зв'язку. {queue.length > 0 ? `Очікують синхронізації: ${queue.length}` : 'Працюємо в офлайн-режимі'}
          </Text>
        </View>
      )}
    </SyncQueueContext.Provider>
  );
};

export const useSyncQueue = () => {
  const context = useContext(SyncQueueContext);
  if (!context) throw new Error('useSyncQueue must be used within SyncQueueProvider');
  return context;
};

const styles = StyleSheet.create({
  offlineBanner: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingTop: 8,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 999,
  },
  offlineText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
});