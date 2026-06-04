import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getStyles } from './styles';

import { useTheme } from '../../providers/ThemeProvider';
import { useAppData } from '../../providers/DataProvider';

export default function DashboardScreen() {
  const { colors } = useTheme();
  const styles = getStyles(colors);
  
  const { user, currentFamily } = useAppData();

  return (
    <ScrollView 
      style={styles.container} 
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      {/* --- 1. ШАПКА (HEADER) --- */}
      <View style={styles.headerContainer}>
        <View>
          <Text style={styles.greetingText}>Привіт, {user?.name || 'Гостю'}! 👋</Text>
          
          <TouchableOpacity style={styles.familySelector}>
            <Text style={styles.familyName}>{currentFamily?.name || 'Немає сім\'ї'}</Text>
            <Ionicons name="chevron-down" size={20} color={colors.text} />
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.profileAvatar}>
          <Text style={styles.avatarText}>{user?.name?.charAt(0) || '?'}</Text>
        </TouchableOpacity>
      </View>

      {/* --- 2. ВАЖЛИВІ СПОВІЩЕННЯ (ALERTS) --- */}
      {/* Тут будуть плашки типу "Меню закінчується завтра" */}

      {/* --- 3. БЛОК: ЩО СЬОГОДНІ НА ВЕЧЕРЮ --- */}
      {/* Тут будуть картки страв на сьогодні з кнопкою "Приготовано" */}

      {/* --- 4. БЛОК: АКТУАЛЬНІ ЗАКУПІВЛІ --- */}
      {/* Тут буде прогрес-бар поточного списку покупок */}

      {/* --- 5. ШВИДКІ ДІЇ (QUICK ACTIONS) --- */}
      {/* Кнопки "Спланувати меню" або "Створити список" */}

    </ScrollView>
  );
}