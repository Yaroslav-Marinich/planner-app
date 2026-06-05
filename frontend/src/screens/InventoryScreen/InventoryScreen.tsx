import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../providers/ThemeProvider';
import { getStyles } from './styles';

import EditItemModal from '../../components/Modals/EditItemModal';

type StockState = 'all' | 'ok' | 'low' | 'empty' | 'unplanned';

const FILTER_TABS: { id: StockState; label: string }[] = [
  { id: 'all', label: 'Всі' },
  { id: 'ok', label: 'В нормі' },
  { id: 'low', label: 'Закінчується' }, 
  { id: 'empty', label: 'Немає' },
  { id: 'unplanned', label: 'Поза планом' },
];

const INITIAL_INVENTORY = [
  { id: '1', name: 'Молоко 2.5%', amount: 0.2, optimal: 2, unit: 'л', icon: 'water-outline' },
  { id: '2', name: 'Яйця', amount: 15, optimal: 20, unit: 'шт', icon: 'egg-outline' },
  { id: '3', name: 'Куряче філе', amount: 1.5, optimal: 1.5, unit: 'кг', icon: 'restaurant-outline' },
  { id: '4', name: 'Хліб білий', amount: 0, optimal: 1, unit: 'шт', icon: 'fast-food-outline' },
  { id: '5', name: 'Печиво "Орео"', amount: 2, optimal: null, unit: 'упак', icon: 'pizza-outline' },
  { id: '6', name: 'Соєвий соус', amount: 1, optimal: null, unit: 'пляшка', icon: 'flask-outline' },
];

export default function InventoryScreen() {
  const { colors } = useTheme();
  const styles = getStyles(colors);

  const [items, setItems] = useState(INITIAL_INVENTORY);
  const [activeFilterId, setActiveFilterId] = useState<StockState>('all');
  
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);

  const getStockStatus = (amount: number, optimal: number | null) => {
    if (optimal === null) {
      return { state: 'unplanned' as StockState, isTracked: false, percentage: 100, color: colors.info, label: 'Поза планом' };
    }

    const percentage = optimal > 0 ? (amount / optimal) * 100 : 0;

    if (percentage === 0) {
      return { state: 'empty' as StockState, isTracked: true, percentage, color: colors.error, label: 'Немає' };
    } else if (percentage <= 30) {
      return { state: 'low' as StockState, isTracked: true, percentage, color: colors.warningAccent || '#F7931A', label: 'Закінчується' };
    }
    
    return { state: 'ok' as StockState, isTracked: true, percentage, color: colors.success, label: 'В нормі' };
  };

  const filteredItems = items.filter(item => {
    if (activeFilterId === 'all') return true;
    
    const { state } = getStockStatus(item.amount, item.optimal);
    return state === activeFilterId;
  });

  const openAddModal = () => {
    setEditingItem(null);
    setIsModalVisible(true);
  };

  const openEditModal = (item: any) => {
    setEditingItem(item);
    setIsModalVisible(true);
  };

  const handleSaveItem = (id: string | null, name: string, amount: number, unit: string) => {
    if (id) {
      setItems(prev => prev.map(item => 
        item.id === id ? { ...item, name, amount, unit } : item
      ));
    } else {
      const newItem = {
        id: Math.random().toString(),
        name,
        amount,
        unit,
        optimal: null,
        icon: 'cube-outline'
      };
      setItems(prev => [newItem, ...prev]);
    }
  };

  const handleDeleteItem = (id: string) => {
    setItems(prev => prev.filter(item => item.id !== id));
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.title}>Мій Склад</Text>
          <Text style={styles.subtitle}>{items.length} позицій у вас вдома</Text>
        </View>
        <TouchableOpacity style={styles.addBtn} onPress={openAddModal}>
          <Ionicons name="add" size={28} color="#FFF" />
        </TouchableOpacity>
      </View>

      <View>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtersContainer}
        >
          {FILTER_TABS.map(tab => {
            const isActive = activeFilterId === tab.id;
            return (
              <TouchableOpacity 
                key={tab.id}
                style={[styles.filterChip, isActive && styles.filterChipActive]}
                onPress={() => setActiveFilterId(tab.id)} // Встановлюємо ID
              >
                <Text style={[styles.filterChipText, isActive && styles.filterChipTextActive]}>
                  {tab.label} {/* Відображаємо гарний український текст */}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      <ScrollView contentContainerStyle={styles.listContent} showsVerticalScrollIndicator={false}>
        {filteredItems.map((item) => {
          const { isTracked, percentage, color, label } = getStockStatus(item.amount, item.optimal);

          return (
            <TouchableOpacity 
              key={item.id} 
              style={styles.card}
              activeOpacity={0.7}
              onPress={() => openEditModal(item)}
            >
              <View style={styles.iconContainer}>
                <Ionicons name={item.icon as any} size={24} color={colors.textSecondary} />
              </View>

              <View style={styles.infoContainer}>
                <View style={styles.nameRow}>
                  <Text style={styles.itemName} numberOfLines={1}>{item.name}</Text>
                  <Text style={styles.amountText}>
                    {item.amount} <Text style={{ fontSize: 13, fontWeight: 'normal', color: colors.textSecondary }}>
                      {isTracked ? `з ${item.optimal} ${item.unit}` : item.unit}
                    </Text>
                  </Text>
                </View>

                {isTracked ? (
                  <>
                    <View style={styles.progressBg}>
                      <View style={[styles.progressFill, { width: `${Math.min(percentage, 100)}%`, backgroundColor: color }]} />
                    </View>
                    <Text style={[styles.statusText, { color }]}>{label}</Text>
                  </>
                ) : (
                  <View style={styles.unplannedBadge}>
                    <Text style={styles.unplannedText}>В наявності (Поза планом)</Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <EditItemModal 
        visible={isModalVisible}
        item={editingItem}
        onClose={() => setIsModalVisible(false)}
        onSave={handleSaveItem}
        onDelete={handleDeleteItem}
      />
    </View>
  );
}