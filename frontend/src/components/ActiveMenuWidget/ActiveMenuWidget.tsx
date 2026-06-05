import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getStyles } from './styles';
import { useTheme } from '../../providers/ThemeProvider';

export interface Ingredient {
  id: string;
  name: string;
  amountPerPortion: number;
  unit: string;
  inStock: number;
}

export interface Dish {
  id: string;
  name: string;
  portionsPlanned: number;
  hasIngredients: boolean;
  mealType?: string; 
  ingredients: Ingredient[];
}

interface ActiveMenuWidgetProps {
  onCookPress: (dish: Dish) => void;
}

// Фейкові дані для "Розділеного меню"
const mockDishes: Dish[] = [
  { 
    id: 'd1', name: 'Сирники зі сметаною', portionsPlanned: 2, hasIngredients: true, mealType: 'Сніданок',
    ingredients: [{ id: 'i1', name: 'Сир', amountPerPortion: 150, unit: 'г', inStock: 500 }]
  },
  { 
    id: 'd2', name: 'Борщ український', portionsPlanned: 4, hasIngredients: true, mealType: 'Обід',
    ingredients: [{ id: 'i2', name: 'Буряк', amountPerPortion: 80, unit: 'г', inStock: 500 }]
  },
  { 
    id: 'd3', name: 'Салат Цезар', portionsPlanned: 2, hasIngredients: false, mealType: 'Обід',
    ingredients: [{ id: 'i4', name: 'Куряче філе', amountPerPortion: 150, unit: 'г', inStock: 100 }] // Брак
  },
  { 
    id: 'd4', name: 'Кефір та печиво', portionsPlanned: 1, hasIngredients: true, mealType: 'Нічний перекус',
    ingredients: [{ id: 'i5', name: 'Кефір', amountPerPortion: 200, unit: 'мл', inStock: 1000 }]
  },
];

export default function ActiveMenuWidget({ onCookPress }: ActiveMenuWidgetProps) {
  const { colors } = useTheme();
  const styles = getStyles(colors);

  const groupedDishes = mockDishes.reduce((acc, dish) => {
    const category = dish.mealType || 'Спільний список';
    if (!acc[category]) acc[category] = [];
    acc[category].push(dish);
    return acc;
  }, {} as Record<string, Dish[]>);

  const isCategorized = mockDishes.some(d => d.mealType);

  return (
    <View style={styles.container}>
      
      {/* Заголовок віджета */}
      <View style={styles.headerRow}>
        <Text style={styles.title}>Меню на сьогодні</Text>
        <View style={styles.menuTypeBadge}>
          <Text style={styles.menuTypeText}>
            {isCategorized ? 'По прийомах їжі' : 'Спільний список'}
          </Text>
        </View>
      </View>

      {/* Рендеримо групи страв */}
      {Object.entries(groupedDishes).map(([category, dishes]) => (
        <View key={category}>
          {/* Заголовок категорії (Сніданок, Обід...) */}
          <Text style={styles.categoryTitle}>{category}</Text>

          {/* Компактні картки страв у цій категорії */}
          {dishes.map((dish) => (
            <View 
              key={dish.id} 
              style={[styles.compactCard, !dish.hasIngredients && styles.warningBorder]}
            >
              <View style={styles.dishInfoBox}>
                <Text style={styles.dishName} numberOfLines={1}>{dish.name}</Text>
                
                <View style={styles.dishMetaRow}>
                  <Text style={styles.portionsText}>{dish.portionsPlanned} порц.</Text>
                  
                  {!dish.hasIngredients && (
                    <>
                      <Ionicons name="warning" size={14} color={colors.warning} />
                      <Text style={styles.warningText}>Бракує продуктів</Text>
                    </>
                  )}
                </View>
              </View>

              {/* Компактна кнопка "Приготувати" */}
              <TouchableOpacity 
                style={styles.cookButtonSm}
                onPress={() => onCookPress(dish)}
              >
                <Ionicons name="restaurant" size={20} color={colors.white} />
              </TouchableOpacity>
            </View>
          ))}
        </View>
      ))}

    </View>
  );
}