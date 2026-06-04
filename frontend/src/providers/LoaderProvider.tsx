import React, { createContext, useContext, useState } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';

type LoaderContextType = {
  showLoader: () => void;
  hideLoader: () => void;
};

const LoaderContext = createContext<LoaderContextType | undefined>(undefined);

export const LoaderProvider = ({ children }: { children: React.ReactNode }) => {
  const [isLoading, setIsLoading] = useState(false);

  return (
    <LoaderContext.Provider value={{ showLoader: () => setIsLoading(true), hideLoader: () => setIsLoading(false) }}>
      {children}
      {isLoading && (
        <View style={[StyleSheet.absoluteFillObject, { backgroundColor: "rgba(0,0,0,0.6)" }]}>
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <ActivityIndicator size="large" color="#1B5E20" />
          </View>
        </View>
      )}
    </LoaderContext.Provider>
  );
};