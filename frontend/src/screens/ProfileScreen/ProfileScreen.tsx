import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image, Alert, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../providers/ThemeProvider';
import { getStyles } from './styles';

export default function ProfileScreen() {
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const navigation = useNavigation<any>();

  // Стейт для збереження фото (поки що локально)
  const [avatarUri, setAvatarUri] = useState<string | null>(null);

  // Функція для фотографування або вибору з галереї
  const handleUpdateAvatar = async () => {
    Alert.alert(
      "Оновити фото",
      "Звідки хочете взяти зображення?",
      [
        {
          text: "Камера",
          onPress: async () => {
            const { status } = await ImagePicker.requestCameraPermissionsAsync();
            if (status !== 'granted') {
              Alert.alert("Помилка", "Потрібен доступ до камери");
              return;
            }
            const result = await ImagePicker.launchCameraAsync({
              allowsEditing: true,
              aspect: [1, 1],
              quality: 0.5,
            });
            if (!result.canceled) setAvatarUri(result.assets[0].uri);
          }
        },
        {
          text: "Галерея",
          onPress: async () => {
            const result = await ImagePicker.launchImageLibraryAsync({
              allowsEditing: true,
              aspect: [1, 1],
              quality: 0.5,
            });
            if (!result.canceled) setAvatarUri(result.assets[0].uri);
          }
        },
        { text: "Скасувати", style: "cancel" }
      ]
    );
  };

  const handleLogout = () => {
    Alert.alert("Вихід", "Ви впевнені, що хочете вийти з акаунту?", [
      { text: "Скасувати", style: "cancel" },
      { text: "Вийти", style: "destructive", onPress: () => console.log('Логаут...') }
    ]);
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      
      {/* --- ШАПКА З АВАТАРКОЮ --- */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.avatarWrapper} onPress={handleUpdateAvatar} activeOpacity={0.8}>
          {avatarUri ? (
            <Image source={{ uri: avatarUri }} style={styles.avatar} />
          ) : (
            <View style={styles.avatar}>
              <Ionicons name="person" size={50} color={colors.textTertiary} />
            </View>
          )}
          <View style={styles.editBadge}>
            <Ionicons name="camera" size={18} color="#FFF" />
          </View>
        </TouchableOpacity>

        <Text style={styles.userName}>Ярослав</Text>
        <Text style={styles.userRole}>Власник сім'ї</Text>
      </View>

      {/* --- МЕНЮ НАВІГАЦІЇ --- */}
      <View style={styles.menuContainer}>
        
        <TouchableOpacity 
          style={styles.menuItem}
          onPress={() => navigation.navigate('ThemeSettings')} // Майбутній екран налаштувань теми
        >
          <View style={styles.menuItemLeft}>
            <View style={styles.iconWrapper}>
              <Ionicons name="color-palette-outline" size={20} color={colors.primary} />
            </View>
            <Text style={styles.menuItemText}>Вигляд та Тема</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.menuItem}
          onPress={() => navigation.navigate('ProductsDatabase')} // Майбутній екран БД продуктів
        >
          <View style={styles.menuItemLeft}>
            <View style={styles.iconWrapper}>
              <Ionicons name="server-outline" size={20} color={colors.primary} />
            </View>
            <Text style={styles.menuItemText}>База продуктів</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.menuItem}
          onPress={() => navigation.navigate('FamilySettings')} // Майбутній екран Сім'ї
        >
          <View style={styles.menuItemLeft}>
            <View style={styles.iconWrapper}>
              <Ionicons name="people-outline" size={20} color={colors.primary} />
            </View>
            <Text style={styles.menuItemText}>Моя сім'я</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
        </TouchableOpacity>

        {/* --- КНОПКА ВИХОДУ --- */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={20} color="#E57373" />
          <Text style={styles.logoutText}>Вийти з акаунту</Text>
        </TouchableOpacity>

      </View>
    </ScrollView>
  );
}