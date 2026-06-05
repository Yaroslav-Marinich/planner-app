import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getStyles } from './styles';
import { useTheme } from '../../providers/ThemeProvider';

// Фейкові дані для списків
const mockLists = [
  { id: 'l1', name: 'Сільпо на вихідні', totalItems: 12, boughtItems: 5 },
  { id: 'l2', name: 'Ринок (овочі)', totalItems: 6, boughtItems: 0 },
  { id: 'l3', name: 'День народження', totalItems: 15, boughtItems: 14 },
];

export default function ShoppingWidget() {
  const { colors } = useTheme();
  const styles = getStyles(colors);

  return (
    <View style={styles.container}>
      
      {/* Заголовок і кнопка швидкого створення списку */}
      <View style={styles.headerRow}>
        <Text style={styles.title}>Списки покупок</Text>
        <TouchableOpacity style={styles.addButton}>
          <Ionicons name="add" size={16} color={colors.primary} />
          <Text style={styles.addButtonText}>Створити</Text>
        </TouchableOpacity>
      </View>

      {/* Картки списків */}
      {mockLists.map((list) => {
        const progressPercentage = list.totalItems > 0 
          ? (list.boughtItems / list.totalItems) * 100 
          : 0;

        const isCompleted = list.boughtItems === list.totalItems;
        const progressColor = isCompleted ? colors.success : colors.warningAccent;

        return (
          <TouchableOpacity key={list.id} style={styles.listCard}>
            <View style={styles.cardHeader}>
              <Text style={[styles.listName, isCompleted && { color: colors.textSecondary, textDecorationLine: 'line-through' }]}>
                {list.name}
              </Text>
              <Text style={styles.countText}>
                {list.boughtItems} / {list.totalItems} шт.
              </Text>
            </View>

            {/* Прогрес-бар */}
            <View style={styles.progressBarContainer}>
              <View 
                style={[
                  styles.progressBarFill, 
                  { width: `${progressPercentage}%`, backgroundColor: progressColor }
                ]} 
              />
            </View>
          </TouchableOpacity>
        );
      })}

    </View>
  );
}