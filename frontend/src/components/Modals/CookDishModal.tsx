import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../providers/ThemeProvider';
import { Dish } from '../ActiveMenuWidget/ActiveMenuWidget';

interface CookDishModalProps {
  visible: boolean;
  dish: Dish | null;
  onClose: () => void;
  onConfirm: (dish: Dish, portionsCooked: number) => void;
}

export default function CookDishModal({ visible, dish, onClose, onConfirm }: CookDishModalProps) {
  const { colors } = useTheme();
  const [portions, setPortions] = useState(1);

  useEffect(() => {
    if (visible && dish) {
      setPortions(1);
    }
  }, [visible, dish]);

  if (!dish) return null;

  const handleDecrease = () => setPortions(p => (p > 1 ? p - 1 : 1));
  const handleIncrease = () => setPortions(p => p + 1);

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={[styles.modalContent, { backgroundColor: colors.card, borderColor: colors.outline }]}>
          
          <Text style={[styles.title, { color: colors.text }]}>Приготувати страву</Text>
                  <Text style={[styles.dishName, { color: colors.primary }]}>{dish.name}</Text>
                  
                            {/* Динамічний список інгредієнтів */}
          <Text style={[styles.label, { color: colors.textSecondary, marginBottom: 8 }]}>Витрати продуктів:</Text>
          <ScrollView style={styles.ingredientsList} showsVerticalScrollIndicator={true}>
            {dish.ingredients.map(ing => {
              const required = ing.amountPerPortion * portions;
              const hasEnough = required <= ing.inStock;

              return (
                <View key={ing.id} style={[styles.ingredientRow, { borderBottomColor: colors.outline }]}>
                  <Text style={[styles.ingredientName, { color: hasEnough ? colors.text : colors.warning }]}>
                    {ing.name}
                  </Text>
                  <View style={styles.amounts}>
                    <Text style={[styles.requiredAmount, { color: hasEnough ? colors.text : colors.warning }]}>
                      {required} {ing.unit}
                    </Text>
                    <Text style={[styles.stockAmount, { color: colors.textTertiary }]}>
                      (В наявності: {ing.inStock} {ing.unit})
                    </Text>
                  </View>
                </View>
              );
            })}
          </ScrollView>

          {/* Блок вибору порцій */}
          <View style={styles.portionsContainer}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>Кількість порцій:</Text>
            <View style={styles.counter}>
              <TouchableOpacity onPress={handleDecrease} style={[styles.roundButton, { backgroundColor: colors.surfaceAlt }]}>
                <Ionicons name="remove" size={24} color={colors.text} />
              </TouchableOpacity>
              
              <Text style={[styles.portionsValue, { color: colors.text }]}>{portions}</Text>
              
              <TouchableOpacity onPress={handleIncrease} style={[styles.roundButton, { backgroundColor: colors.surfaceAlt }]}>
                <Ionicons name="add" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>
          </View>



          {/* Кнопки дій */}
          <View style={styles.buttonsRow}>
            <TouchableOpacity style={[styles.button, styles.cancelBtn, { borderColor: colors.outline }]} onPress={onClose}>
              <Text style={[styles.buttonText, { color: colors.text }]}>Скасувати</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.button, { backgroundColor: colors.primary }]} onPress={() => onConfirm(dish, portions)}>
              <Text style={[styles.buttonText, { color: '#FFF' }]}>Підтвердити</Text>
            </TouchableOpacity>
          </View>

        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalContent: { width: '100%', borderRadius: 16, padding: 24, borderWidth: 1, maxHeight: '80%' },
  title: { fontSize: 18, fontWeight: 'bold', textAlign: 'center', marginBottom: 4 },
  dishName: { fontSize: 22, fontWeight: '900', textAlign: 'center', marginBottom: 24 },
  
  portionsContainer: { flexDirection: 'column', gap: 12, alignItems: 'center', marginBottom: 24 },
  label: { fontSize: 16 },
  counter: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  roundButton: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  portionsValue: { fontSize: 24, fontWeight: 'bold', width: 30, textAlign: 'center' },

  ingredientsList: { maxHeight: 200, marginBottom: 24 },
  ingredientRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 1,minHeight: 48,alignItems: 'center' },
  ingredientName: { fontSize: 16, fontWeight: '500', flex: 1 },
  amounts: { alignItems: 'flex-end' },
  requiredAmount: { fontSize: 16, fontWeight: 'bold' },
  stockAmount: { fontSize: 12, marginTop: 2 },

  buttonsRow: { flexDirection: 'row', gap: 12 },
  button: { flex: 1, paddingVertical: 14, borderRadius: 10, alignItems: 'center' },
  cancelBtn: { backgroundColor: 'transparent', borderWidth: 1 },
  buttonText: { fontSize: 16, fontWeight: 'bold' },
});