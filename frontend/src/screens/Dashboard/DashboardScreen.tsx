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

export default function DashboardScreen() {
  const { colors } = useTheme();
  const styles = getStyles(colors);
  
  const { user, currentFamily } = useAppData();
  const { showAlert } = useAppAlert(); 

  const [selectedDish, setSelectedDish] = useState<Dish | null>(null);

const handleOpenCookModal = (dish: Dish) => {
    setSelectedDish(dish);
  };

  const handleConfirmCook = (dish: Dish, portionsCooked: number) => {
    console.log(`Готуємо ${dish.name}, порцій: ${portionsCooked}`);
    
    setSelectedDish(null); 
    showAlert('Смачного! 🍳', `Списано продукти на ${portionsCooked} порц. "${dish.name}"`, 'success');
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
      <CookDishModal 
        visible={!!selectedDish} 
        dish={selectedDish} 
        onClose={() => setSelectedDish(null)} 
        onConfirm={handleConfirmCook} 
      />
      </>
  );
}