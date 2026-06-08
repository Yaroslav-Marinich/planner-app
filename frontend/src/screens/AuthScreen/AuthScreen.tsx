import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useTheme } from "../../providers/ThemeProvider"; 
import { useAppAlert } from "../../providers/CustomAlertProvider"; 
import { loginWithGoogle } from "../../services/auth";
import { getStyles } from "./styles"; 

export default function AuthScreen() {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const { showAlert } = useAppAlert();
  
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    const result = await loginWithGoogle();
    setIsLoading(false);

    if (!result.success) {
      showAlert("Помилка", "Не вдалося увійти через Google. Спробуйте ще раз.", "error");
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      
      <View style={styles.logoContainer}>
        <Ionicons name="restaurant" size={100} color={colors.primary} style={styles.logo} />
        
        <Text style={styles.title}>SimFamily</Text>
        <Text style={styles.subtitle}>
          Плануйте сімейне меню, керуйте спільним складом та робіть розумні покупки разом
        </Text>
      </View>

      <View style={styles.buttonsContainer}>
        {isLoading ? (
          <ActivityIndicator size="large" color={colors.primary} style={{ marginVertical: 20 }} />
        ) : (
          <TouchableOpacity 
            style={styles.googleBtn} 
            onPress={handleGoogleLogin}
            activeOpacity={0.8}
          >
            <Ionicons name="logo-google" size={24} color="#DB4437" />
            <Text style={styles.googleBtnText}>Увійти через Google</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}