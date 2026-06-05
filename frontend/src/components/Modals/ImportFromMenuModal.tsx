import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../providers/ThemeProvider';

interface ImportFromMenuModalProps {
  visible: boolean;
  onClose: () => void;
  onImport: (newItems: any[]) => void;
}

const mockPlannedDishes = [
  {
    id: 'd1', name: 'Борщ український', portions: 4,
    ingredients: [
      { id: 'i1', name: 'Буряк', required: 1, unit: 'кг', inStock: 0.2 },
      { id: 'i2', name: 'Картопля', required: 1.5, unit: 'кг', inStock: 2.0 }, 
    ]
  },
  {
    id: 'd2', name: 'Салат Цезар', portions: 2,
    ingredients: [
      { id: 'i3', name: 'Куряче філе', required: 0.6, unit: 'кг', inStock: 0 },
      { id: 'i4', name: 'Салат Айсберг', required: 1, unit: 'шт', inStock: 0 },
    ]
  },
];

export default function ImportFromMenuModal({ visible, onClose, onImport }: ImportFromMenuModalProps) {
  const { colors } = useTheme();
  
  const [selectedDishes, setSelectedDishes] = useState<string[]>([]);

  const toggleDish = (id: string) => {
    setSelectedDishes(prev => 
      prev.includes(id) ? prev.filter(d => d !== id) : [...prev, id]
    );
  };

  const selectAll = () => {
    if (selectedDishes.length === mockPlannedDishes.length) {
      setSelectedDishes([]);
    } else {
      setSelectedDishes(mockPlannedDishes.map(d => d.id));
    }
  };

  const handleImport = () => {
    const dishesToImport = mockPlannedDishes.filter(d => selectedDishes.includes(d.id));
    
    const itemsToAdd: any[] = [];
    
    dishesToImport.forEach(dish => {
      dish.ingredients.forEach(ing => {
        const deficit = ing.required - ing.inStock;
        
        if (deficit > 0) {
          const existingItem = itemsToAdd.find(i => i.name === ing.name);
          if (existingItem) {
            existingItem.amount += deficit;
          } else {
            itemsToAdd.push({
              id: Math.random().toString(), 
              name: ing.name,
              amount: Number(deficit.toFixed(2)),
              unit: ing.unit,
              state: 'pending'
            });
          }
        }
      });
    });

    onImport(itemsToAdd);
    setSelectedDishes([]);
    onClose();
  };

  const isAllSelected = selectedDishes.length === mockPlannedDishes.length && mockPlannedDishes.length > 0;

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
          
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.text }]}>Імпорт з меню</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={28} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.selectAllBtn} onPress={selectAll}>
            <Ionicons 
              name={isAllSelected ? "checkbox" : "square-outline"} 
              size={24} 
              color={colors.primary} 
            />
            <Text style={[styles.selectAllText, { color: colors.text }]}>Вибрати всі страви</Text>
          </TouchableOpacity>

          <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
            {mockPlannedDishes.map(dish => {
              const isSelected = selectedDishes.includes(dish.id);
              return (
                <TouchableOpacity 
                  key={dish.id} 
                  style={[styles.dishRow, { borderBottomColor: colors.outline }]}
                  onPress={() => toggleDish(dish.id)}
                >
                  <Ionicons 
                    name={isSelected ? "checkbox" : "square-outline"} 
                    size={24} 
                    color={isSelected ? colors.primary : colors.textSecondary} 
                  />
                  <View style={styles.dishInfo}>
                    <Text style={[styles.dishName, { color: colors.text }]}>{dish.name}</Text>
                    <Text style={[styles.dishPortions, { color: colors.textSecondary }]}>
                      {dish.portions} порц. • {dish.ingredients.length} інгредієнтів
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          <TouchableOpacity 
            style={[
              styles.importBtn, 
              { backgroundColor: selectedDishes.length > 0 ? colors.primary : colors.surfaceAlt }
            ]}
            disabled={selectedDishes.length === 0}
            onPress={handleImport}
          >
            <Text style={[
              styles.importBtnText, 
              { color: selectedDishes.length > 0 ? '#FFF' : colors.textSecondary }
            ]}>
              Додати до списку ({selectedDishes.length})
            </Text>
          </TouchableOpacity>

        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, maxHeight: '80%' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  title: { fontSize: 20, fontWeight: 'bold' },
  selectAllBtn: { flexDirection: 'row', alignItems: 'center', marginBottom: 16, gap: 12 },
  selectAllText: { fontSize: 16, fontWeight: '600' },
  list: { maxHeight: 300, marginBottom: 20 },
  dishRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, gap: 12 },
  dishInfo: { flex: 1 },
  dishName: { fontSize: 16, fontWeight: '500', marginBottom: 4 },
  dishPortions: { fontSize: 13 },
  importBtn: { paddingVertical: 16, borderRadius: 16, alignItems: 'center' },
  importBtnText: { fontSize: 16, fontWeight: 'bold' }
});