import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../providers/ThemeProvider';
import { getStyles } from './styles';

import EditItemModal from '../../components/Modals/EditItemModal';
import { useProductStore } from '../../store/useProductStore'; 

type StockState = 'all' | 'ok' | 'low' | 'empty' | 'unplanned';

const FILTER_TABS: { id: StockState; label: string }[] = [
  { id: 'all', label: 'Всі' },
  { id: 'ok', label: 'В нормі' },
  { id: 'low', label: 'Закінчується' }, 
  { id: 'empty', label: 'Немає' },
  { id: 'unplanned', label: 'Поза планом' },
];

export default function InventoryScreen() {
  const { colors } = useTheme();
  const styles = getStyles(colors);

  const { products, isLoading, fetchProducts, addProduct, deleteProduct } = useProductStore();

  const [activeFilterId, setActiveFilterId] = useState<StockState>('all');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const getStockStatus = (amount: number, optimal?: number | null) => {
    if (!optimal) {
      if (amount <= 0) {
        return { state: 'empty' as StockState, isTracked: false, percentage: 0, color: colors.error, label: 'Немає' };
      }
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

  const filteredItems = products.filter(item => {
    if (activeFilterId === 'all') return true;
    
    const { state } = getStockStatus(item.inStockAmount, (item as any).optimalAmount);
    return state === activeFilterId;
  });

  const openAddModal = () => {
    setEditingItem(null);
    setIsModalVisible(true);
  };

  const openEditModal = (item: any) => {
    setEditingItem({
      id: item._id,
      name: item.name,
      amount: item.inStockAmount,
      unit: item.defaultUnit
    });
    setIsModalVisible(true);
  };

  const handleSaveItem = async (id: string | null, name: string, amount: number, unit: string) => {
    if (id) {
      console.warn("Ендпоінт для редагування продукту (PATCH) ще не створено на бекенді!");
    } else {
      await addProduct({
        name,
        defaultUnit: unit,
        isDivisible: unit !== 'шт' && unit !== 'pcs',
        inStockAmount: amount
      });
    }
  };

  const handleDeleteItem = async (id: string) => {
    await deleteProduct(id);
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.title}>Мій Склад</Text>
          <Text style={styles.subtitle}>{products.length} позицій у вас вдома</Text>
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
                onPress={() => setActiveFilterId(tab.id)}
              >
                <Text style={[styles.filterChipText, isActive && styles.filterChipTextActive]}>
                  {tab.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Показуємо крутилку під час завантаження */}
      {isLoading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.listContent} showsVerticalScrollIndicator={false}>
          {filteredItems.map((item) => {
            const { isTracked, percentage, color, label } = getStockStatus(item.inStockAmount, (item as any).optimalAmount);

            return (
              <TouchableOpacity 
                key={item._id} 
                style={styles.card}
                activeOpacity={0.7}
                onPress={() => openEditModal(item)}
              >
                <View style={styles.iconContainer}>
                  {/* Оскільки в БД немає іконок, ставимо універсальну */}
                  <Ionicons name="cube-outline" size={24} color={colors.textSecondary} />
                </View>

                <View style={styles.infoContainer}>
                  <View style={styles.nameRow}>
                    <Text style={styles.itemName} numberOfLines={1}>{item.name}</Text>
                    <Text style={styles.amountText}>
                      {item.inStockAmount} <Text style={{ fontSize: 13, fontWeight: 'normal', color: colors.textSecondary }}>
                        {isTracked ? `з ${(item as any).optimalAmount} ${item.defaultUnit}` : item.defaultUnit}
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
                    <View style={[styles.unplannedBadge, item.inStockAmount <= 0 && { backgroundColor: 'rgba(229, 115, 115, 0.1)' }]}>
                      <Text style={[styles.unplannedText, item.inStockAmount <= 0 && { color: colors.error }]}>
                        {item.inStockAmount <= 0 ? 'Немає' : 'В наявності (Поза планом)'}
                      </Text>
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      )}

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