import React, { useState, useEffect } from 'react';
import { 
  View, Text, StyleSheet, Modal, TouchableOpacity, TextInput, 
  ScrollView, KeyboardAvoidingView, Platform 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../providers/ThemeProvider';

interface ProductItem {
  id: string;
  name: string;
  amount: number;
  unit: string;
  state: string;
}

interface CheckoutModalProps {
  visible: boolean;
  items: ProductItem[];
  onClose: () => void;
  onCheckout: (receiptData: any, totalSum: number) => void;
}

export default function CheckoutModal({ visible, items, onClose, onCheckout }: CheckoutModalProps) {
  const { colors } = useTheme();
  
  const [prices, setPrices] = useState<Record<string, string>>({});
  const [actualAmounts, setActualAmounts] = useState<Record<string, string>>({});

  useEffect(() => {
    if (visible) {
      setPrices({});
      
      const initialAmounts: Record<string, string> = {};
      items.forEach(item => {
        initialAmounts[item.id] = item.amount.toString();
      });
      setActualAmounts(initialAmounts);
    }
  }, [visible, items]);

  const handlePriceChange = (id: string, value: string) => {
    const formattedValue = value.replace(',', '.').replace(/[^0-9.]/g, '');
    setPrices(prev => ({ ...prev, [id]: formattedValue }));
  };

  const handleAmountChange = (id: string, value: string) => {
    const formattedValue = value.replace(',', '.').replace(/[^0-9.]/g, '');
    setActualAmounts(prev => ({ ...prev, [id]: formattedValue }));
  };

  const totalSum = items.reduce((sum, item) => {
    const itemPrice = parseFloat(prices[item.id]) || 0;
    return sum + itemPrice;
  }, 0);

  const handleComplete = () => {
    const receiptData = items.map(item => ({
      ...item,
      amount: parseFloat(actualAmounts[item.id]) || 0,
      price: parseFloat(prices[item.id]) || 0
    }));
    
    onCheckout(receiptData, totalSum);
  };

  if (!visible) return null;

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <KeyboardAvoidingView 
        style={[styles.container, { backgroundColor: colors.background }]} 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* ШАПКА */}
        <View style={[styles.header, { borderBottomColor: colors.outline }]}>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <Ionicons name="close" size={28} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.title, { color: colors.text }]}>Оформлення чека</Text>
          <View style={styles.closeBtn} /> 
        </View>

        {/* СПИСОК ТОВАРІВ (Компактний) */}
        <ScrollView 
          style={styles.scrollArea}
          contentContainerStyle={styles.scrollContent}
          keyboardDismissMode="on-drag"
        >
          {items.map((item) => (
            <View key={item.id} style={[styles.itemRow, { backgroundColor: colors.surface, borderColor: colors.outline }]}>
              
              {/* Назва та План */}
              <View style={styles.itemInfo}>
                <Text style={[styles.itemName, { color: colors.text }]} numberOfLines={2}>
                  {item.name}
                </Text>
                <Text style={[styles.itemPlannedAmount, { color: colors.textSecondary }]}>
                  План: {item.amount} {item.unit}
                </Text>
              </View>
              
              {/* Блок з двома інпутами в один рядок */}
              <View style={styles.inputsContainer}>
                
                {/* Інпут: Фактична кількість */}
                <View style={styles.inputBox}>
                  <TextInput
                    style={[
                      styles.compactInput, 
                      styles.amountInputWidth,
                      { color: colors.text, borderColor: colors.outline, backgroundColor: colors.background }
                    ]}
                    value={actualAmounts[item.id] || ''}
                    onChangeText={(val) => handleAmountChange(item.id, val)}
                    keyboardType="decimal-pad"
                    placeholder={item.amount.toString()}
                    placeholderTextColor={colors.textTertiary}
                  />
                  <Text style={[styles.inputSuffix, { color: colors.textSecondary }]}>{item.unit}</Text>
                </View>

                {/* Інпут: Ціна */}
                <View style={styles.inputBox}>
                  <TextInput
                    style={[
                      styles.compactInput, 
                      styles.priceInputWidth,
                      { color: colors.text, borderColor: colors.outline, backgroundColor: colors.background }
                    ]}
                    value={prices[item.id] || ''}
                    onChangeText={(val) => handlePriceChange(item.id, val)}
                    keyboardType="decimal-pad"
                    placeholder="0.00"
                    placeholderTextColor={colors.textTertiary}
                  />
                  <Text style={[styles.inputSuffix, { color: colors.textSecondary }]}>₴</Text>
                </View>

              </View>
            </View>
          ))}
        </ScrollView>

        {/* ЛИПКИЙ ФУТЕР ІЗ СУМОЮ */}
        <View style={[styles.footer, { backgroundColor: colors.card, borderTopColor: colors.outline }]}>
          <View style={styles.totalRow}>
            <Text style={[styles.totalLabel, { color: colors.textSecondary }]}>Загальна сума:</Text>
            <Text style={[styles.totalValue, { color: colors.text }]}>
              {totalSum.toFixed(2)} <Text style={{ fontSize: 18 }}>₴</Text>
            </Text>
          </View>

          <TouchableOpacity 
            style={[styles.checkoutBtn, { backgroundColor: colors.primary }]}
            onPress={handleComplete}
          >
            <Ionicons name="checkmark-circle" size={24} color="#FFF" />
            <Text style={styles.checkoutBtnText}>Зберегти транзакцію</Text>
          </TouchableOpacity>
        </View>

      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between',
    paddingHorizontal: 16, 
    paddingTop: Platform.OS === 'ios' ? 60 : 20, 
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  title: { fontSize: 20, fontWeight: 'bold' },
  closeBtn: { width: 40, alignItems: 'flex-start' },
  
  scrollArea: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 40 },
  
  // --- КОМПАКТНИЙ ДИЗАЙН ---
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 10,
  },
  itemInfo: { 
    flex: 1, 
    marginRight: 8 
  },
  itemName: { 
    fontSize: 15, 
    fontWeight: '600', 
    marginBottom: 4 
  },
  itemPlannedAmount: { 
    fontSize: 12,
  },
  
  inputsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12, // Відступ між блоком кількості та блоком ціни
  },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  compactInput: {
    height: 40,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 8,
    fontSize: 15,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  amountInputWidth: {
    width: 50, // Менша ширина для кількості (напр. 1.5)
  },
  priceInputWidth: {
    width: 70, // Трохи ширше для ціни (напр. 1500.50)
  },
  inputSuffix: {
    fontSize: 15,
    fontWeight: '600',
    marginLeft: 6,
    minWidth: 16, // Щоб текст "₴" або "кг" не стрибав
  },

  // -------------------------

  footer: {
    padding: 20,
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
    borderTopWidth: 1,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 20,
  },
  totalLabel: { fontSize: 16 },
  totalValue: { fontSize: 28, fontWeight: '900' },
  
  checkoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 16,
    gap: 8,
  },
  checkoutBtnText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
});