import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../providers/ThemeProvider';
import { Dish } from '../ActiveMenuWidget/ActiveMenuWidget';

import AnalogSelectionModal from './AnalogSelectionModal';

interface CookDishModalProps {
  visible: boolean;
  dish: Dish | null;
  inventory: any[]; 
  initialAnalogs: Record<string, string[]>; 
  onClose: () => void;
  onConfirm: (dish: Dish, portionsCooked: number, deductionLogs: string[]) => void;
  onSaveAnalogs?: (newAnalogMap: Record<string, string[]>) => void; 
}

export default function CookDishModal({ 
  visible, dish, inventory, initialAnalogs, onClose, onConfirm, onSaveAnalogs 
}: CookDishModalProps) {
  const { colors } = useTheme();
  
  const [portions, setPortions] = useState(1);
  const [analogMap, setAnalogMap] = useState<Record<string, string[]>>({});
  
  const [isPickerVisible, setIsPickerVisible] = useState(false);
  const [pickerTarget, setPickerTarget] = useState<any>(null);

  useEffect(() => {
    if (visible && dish) {
      setPortions(1);
      setAnalogMap(initialAnalogs || {});
    }
  }, [visible, dish, initialAnalogs]);

  if (!dish) return null;

  const handleDecrease = () => setPortions(p => (p > 1 ? p - 1 : 1));
  const handleIncrease = () => setPortions(p => p + 1);

  const handleOpenAnalogPicker = (ingredient: any) => {
    setPickerTarget(ingredient);
    setIsPickerVisible(true);
  };

  const handleCookConfirm = () => {
    let simulationInventory = JSON.parse(JSON.stringify(inventory));
    let logs: string[] = [];
    let isSuccess = true;

    for (const ing of dish.ingredients) {
      let needed = ing.amountPerPortion * portions;
      const boundAnalogIds = analogMap[ing.id] || [];

      if (boundAnalogIds.length === 0) {
        if (ing.inStock >= needed) {
          logs.push(`• ${ing.name}: списано ${needed} ${ing.unit}`);
          continue;
        } else {
          isSuccess = false;
          Alert.alert('Не вистачає продуктів', `Для "${ing.name}" немає ні аналогів, ні достатньої кількості.`);
          break;
        }
      }

      for (const analogId of boundAnalogIds) {
        if (needed <= 0) break;

        const stockItem = simulationInventory.find((w: any) => w.id === analogId);
        if (stockItem && stockItem.amount > 0) {
          const taken = Math.min(stockItem.amount, needed);
          stockItem.amount = parseFloat((stockItem.amount - taken).toFixed(2));
          needed = parseFloat((needed - taken).toFixed(2));
          logs.push(`• Списано ${taken} ${ing.unit} з "${stockItem.name}"`);
        }
      }

      if (needed > 0) {
        isSuccess = false;
        Alert.alert('Дефіцит!', `Не вистачає ${needed} ${ing.unit} для "${ing.name}".`);
        break;
      }
    }

    if (isSuccess) {
      onConfirm(dish, portions, logs);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={[styles.modalContent, { backgroundColor: colors.card, borderColor: colors.outline }]}>
          
          <Text style={[styles.title, { color: colors.text }]}>Приготування</Text>
          <Text style={[styles.dishName, { color: colors.primary }]} numberOfLines={1}>{dish.name}</Text>
          
          <View style={styles.portionsRow}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>Кількість порцій:</Text>
            <View style={styles.counter}>
              <TouchableOpacity onPress={handleDecrease} style={[styles.roundButton, { backgroundColor: colors.surfaceAlt }]}>
                <Ionicons name="remove" size={18} color={colors.text} />
              </TouchableOpacity>
              <Text style={[styles.portionsValue, { color: colors.text }]}>{portions}</Text>
              <TouchableOpacity onPress={handleIncrease} style={[styles.roundButton, { backgroundColor: colors.surfaceAlt }]}>
                <Ionicons name="add" size={18} color={colors.text} />
              </TouchableOpacity>
            </View>
          </View>

          <View style={[styles.divider, { backgroundColor: colors.outline }]} />
          
          <ScrollView style={styles.ingredientsList} showsVerticalScrollIndicator={false}>
            {dish.ingredients.map(ing => {
              const required = ing.amountPerPortion * portions;
              const boundIds = analogMap[ing.id] || [];

              let totalAvailable = 0;
              let analogsTextElements: string[] = [];

              if (boundIds.length === 0) {
                totalAvailable = ing.inStock;
              } else {
                boundIds.forEach((id, index) => {
                  const stockItem = inventory.find(i => i.id === id);
                  if (stockItem) {
                    totalAvailable += stockItem.amount;
                    analogsTextElements.push(`${index + 1}. ${stockItem.name} (${stockItem.amount})`);
                  }
                });
              }

              const hasEnough = required <= totalAvailable;

              return (
                <View key={ing.id} style={[styles.ingRow, { borderBottomColor: colors.outline }]}>
                  
                  <View style={styles.ingTopMain}>
                    <Text style={[styles.ingName, { color: hasEnough ? colors.text : colors.error }]} numberOfLines={1}>
                      {ing.name}
                    </Text>
                    
                    <View style={styles.ingRight}>
                      <Text style={[styles.ingRequired, { color: hasEnough ? colors.text : colors.error }]}>
                        {required} <Text style={{fontSize: 12, fontWeight: 'normal'}}>{ing.unit}</Text>
                      </Text>
                      <TouchableOpacity style={styles.analogIconBtn} onPress={() => handleOpenAnalogPicker(ing)}>
                        <Ionicons name="git-branch" size={18} color={colors.primary} />
                      </TouchableOpacity>
                    </View>
                  </View>

                  {/* ВІДОБРАЖЕННЯ АНАЛОГІВ БЕЗ ОБМЕЖЕНЬ РЯДКІВ ТА ЗАЙВИХ НАПИСІВ */}
                  {boundIds.length > 0 ? (
                    <Text style={[styles.ingSubText, { color: colors.textSecondary }]}>
                      {analogsTextElements.join('  •  ')}
                    </Text>
                  ) : (
                    <Text style={[styles.ingSubText, { color: colors.textTertiary }]}>
                      В наявності: {totalAvailable} {ing.unit}
                    </Text>
                  )}

                </View>
              );
            })}
          </ScrollView>

          <View style={styles.buttonsRow}>
            <TouchableOpacity style={[styles.button, styles.cancelBtn, { borderColor: colors.outline }]} onPress={onClose}>
              <Text style={[styles.buttonText, { color: colors.text }]}>Скасувати</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.button, { backgroundColor: colors.primary }]} onPress={handleCookConfirm}>
              <Text style={[styles.buttonText, { color: '#FFF' }]}>Приготувати</Text>
            </TouchableOpacity>
          </View>

        </View>
      </View>

      <AnalogSelectionModal 
        visible={isPickerVisible}
        targetItem={pickerTarget}
        currentAnalogs={pickerTarget ? (analogMap[pickerTarget.id] || []) : []}
        onClose={() => setIsPickerVisible(false)}
        onSave={(id, selectedIds) => {
          const newMap = { ...analogMap, [id]: selectedIds };
          setAnalogMap(newMap);
          if (onSaveAnalogs) onSaveAnalogs(newMap);
          setIsPickerVisible(false);
        }}
      />
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center', padding: 16 },
  modalContent: { width: '100%', borderRadius: 16, padding: 20, borderWidth: 1, maxHeight: '85%' },
  
  title: { fontSize: 14, fontWeight: 'bold', textAlign: 'center', marginBottom: 2, textTransform: 'uppercase', letterSpacing: 1 },
  dishName: { fontSize: 22, fontWeight: '900', textAlign: 'center', marginBottom: 16 },
  
  portionsRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  label: { fontSize: 15, fontWeight: '500' },
  counter: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  roundButton: { width: 30, height: 30, borderRadius: 15, justifyContent: 'center', alignItems: 'center' },
  portionsValue: { fontSize: 18, fontWeight: 'bold', width: 24, textAlign: 'center' },

  divider: { height: StyleSheet.hairlineWidth, width: '100%', marginBottom: 8 },

  ingredientsList: { flexShrink: 1, marginBottom: 16 },
  
  ingRow: {
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth, 
  },
  ingTopMain: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  ingName: {
    fontSize: 15,
    fontWeight: '600',
    flex: 1,
    paddingRight: 8,
  },
  ingRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ingRequired: {
    fontSize: 15,
    fontWeight: 'bold',
  },
  analogIconBtn: {
    padding: 4,
    marginLeft: 8,
    backgroundColor: 'rgba(0,0,0,0.03)', 
    borderRadius: 6,
  },
  ingSubText: {
    fontSize: 12,
    lineHeight: 18, // Трохи збільшено для комфортного читання кількох рядків
  },

  buttonsRow: { flexDirection: 'row', gap: 10, marginTop: 4 },
  button: { flex: 1, paddingVertical: 12, borderRadius: 10, alignItems: 'center' },
  cancelBtn: { backgroundColor: 'transparent', borderWidth: 1 },
  buttonText: { fontSize: 15, fontWeight: 'bold' },
});