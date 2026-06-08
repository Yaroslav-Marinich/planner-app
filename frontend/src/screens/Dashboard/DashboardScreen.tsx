import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getStyles } from './styles';

import { useTheme } from '../../providers/ThemeProvider';
import { useAppData } from '../../providers/DataProvider';
import { useAppAlert } from '../../providers/CustomAlertProvider';
import ActiveMenuWidget, { Dish } from '../../components/ActiveMenuWidget/ActiveMenuWidget';
import CookDishModal from '../../components/Modals/CookDishModal';
import ShoppingWidget from '../../components/ShoppingWidget/ShoppingWidget';

// Тимчасовий фейковий склад для Dashboard
const MOCK_DASHBOARD_INVENTORY = [
  { id: 'w_syr1', name: 'Сир кисломолочний 5%', amount: 150, unit: 'г' },
  { id: 'w_syr2', name: 'Сир домашній нежирний', amount: 100, unit: 'г' },
  { id: 'w_syr3', name: 'Сир "Слов\'яночка" 9%', amount: 200, unit: 'г' },
  { id: 'w_syr4', name: 'Сиркова маса з родзинками', amount: 150, unit: 'г' },
  { id: 'w_syr5', name: 'Рікотта італійська', amount: 250, unit: 'г' },
  { id: 'w_meat', name: 'Свинина (лопатка)', amount: 800, unit: 'г' },
  { id: 'w_carrot', name: 'Морква мита', amount: 1000, unit: 'г' },
];

export default function DashboardScreen() {
  const { colors } = useTheme();
  const styles = getStyles(colors);
  
  const { user, currentFamily } = useAppData();
  const { showAlert } = useAppAlert(); 

  const [selectedDish, setSelectedDish] = useState<Dish | null>(null);

  // Стейт для аналогів на головному екрані
const [analogMap, setAnalogMap] = useState<Record<string, string[]>>({
    'i1': ['w_syr1', 'w_syr2', 'w_syr3', 'w_syr4', 'w_syr5'], // 5 аналогів для Сиру
    'i_meat': ['w_meat'],       
    'i_carrot': ['w_carrot'],   
  });

  const handleOpenCookModal = (dish: Dish) => {
    setSelectedDish(dish);
  };

  // Оновлена функція, яка приймає logs
  const handleConfirmCook = (dish: Dish, portionsCooked: number, logs: string[]) => {
    console.log(`Готуємо ${dish.name}, порцій: ${portionsCooked}`);
    
    setSelectedDish(null); 
    // Виводимо лог списання в алерті
    showAlert('Смачного! 🍳', `Страва приготована.\n${logs.join('\n')}`, 'success');
  };

  return (
    <>
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
        <ActiveMenuWidget onCookPress={handleOpenCookModal} />

        {/* --- 4. БЛОК: АКТУАЛЬНІ ЗАКУПІВЛІ --- */}
        <ShoppingWidget />

        {/* --- 5. ШВИДКІ ДІЇ (QUICK ACTIONS) --- */}
        {/* Кнопки "Спланувати меню" або "Створити список" */}

      </ScrollView>

      {/* Оновлена модалка з новими обов'язковими пропсами */}
      <CookDishModal 
        visible={!!selectedDish} 
        dish={selectedDish} 
        inventory={MOCK_DASHBOARD_INVENTORY} // Передаємо склад
        initialAnalogs={analogMap}           // Передаємо збережені аналоги
        onClose={() => setSelectedDish(null)} 
        onConfirm={handleConfirmCook} 
        onSaveAnalogs={(newMap) => setAnalogMap(newMap)} // Зберігаємо нові прив'язки
      />
    </>
  );
}