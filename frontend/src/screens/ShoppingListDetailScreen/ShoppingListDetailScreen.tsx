import React, { useState, useRef } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Animated, TouchableWithoutFeedback } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Swipeable from 'react-native-gesture-handler/Swipeable';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getStyles } from './styles';
import { useTheme } from '../../providers/ThemeProvider';
import { useAppAlert } from '../../providers/CustomAlertProvider';
import ImportFromMenuModal from '../../components/Modals/ImportFromMenuModal';
import EditItemModal from '../../components/Modals/EditItemModal';
import CheckoutModal from '../../components/Modals/CheckoutModal';

type ItemState = 'pending' | 'in_cart' | 'unavailable';

interface ProductItem {
  id: string;
  name: string;
  amount: number;
  unit: string;
  state: ItemState;
  pickedBy?: string; 
}

// Фейкові дані списку
const initialItems: ProductItem[] = [
  { id: 'p1', name: 'Молоко 2.5%', amount: 2, unit: 'шт', state: 'pending' },
  { id: 'p2', name: 'Хліб білий', amount: 1, unit: 'шт', state: 'pending' },
  { id: 'p3', name: 'Помідори чері', amount: 0.5, unit: 'кг', state: 'pending' },
  { id: 'p4', name: 'Куряче філе', amount: 1.2, unit: 'кг', state: 'in_cart', pickedBy: 'Ярослав' }, // Хтось вже взяв
];

export default function ShoppingListDetailScreen() {
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const insets = useSafeAreaInsets();
  const { showAlert } = useAppAlert();

    const [isMenuModalVisible, setIsMenuModalVisible] = useState(false);
    const [isEditModalVisible, setIsEditModalVisible] = useState(false);
    const [editingItem, setEditingItem] = useState<ProductItem | null>(null);
    const [isCheckoutModalVisible, setIsCheckoutModalVisible] = useState(false);
  const [items, setItems] = useState<ProductItem[]>(initialItems);
  const [openedRowId, setOpenedRowId] = useState<string | null>(null);
  const swipeableRefs = useRef<Map<string, Swipeable>>(new Map());

  const toggleCartState = (item: ProductItem) => {
    if (item.state === 'unavailable') return;

    const newState = item.state === 'in_cart' ? 'pending' : 'in_cart';
    
    setItems(prev => prev.map(i => 
      i.id === item.id 
        ? { ...i, state: newState, pickedBy: newState === 'in_cart' ? 'Я' : undefined } 
        : i
    ));
    };
    
    const handleImportItems = (newItems: ProductItem[]) => {
    setItems(prev => [...newItems, ...prev]);
    showAlert('Успіх!', `Додано ${newItems.length} позицій з меню`, 'success');
    };
    
const handleSaveItem = (id: string | null, newName: string, newAmount: number, newUnit: string) => {
    if (id) {
      setItems(prev => prev.map(item => 
        item.id === id ? { ...item, name: newName, amount: newAmount, unit: newUnit } : item
      ));
      showAlert('Збережено', 'Товар успішно оновлено', 'success');
    } else {
      const newItem: ProductItem = {
        id: Math.random().toString(), 
        name: newName,
        amount: newAmount,
        unit: newUnit,
        state: 'pending'
      };
      setItems(prev => [newItem, ...prev]);
      showAlert('Додано', 'Новий товар додано до списку', 'success');
    }
  };
    
    const handleDeleteItem = (id: string) => {
    setItems(prev => prev.filter(item => item.id !== id));
    showAlert('Видалено', 'Товар вилучено зі списку', 'success');
  };

  const markUnavailable = (itemId: string) => {
    swipeableRefs.current.get(itemId)?.close();
    setOpenedRowId(null);
    setItems(prev => prev.map(i => i.id === itemId ? { ...i, state: 'unavailable', pickedBy: undefined } : i));
    showAlert('Увага', 'Товар відмічено як відсутній', 'warning');
  };

  const onSwipeableWillOpen = (id: string) => {
    if (openedRowId && openedRowId !== id) {
      swipeableRefs.current.get(openedRowId)?.close();
    }
    setOpenedRowId(id);
    };
    
    const handleFinalizeCheckout = (receiptData: any[], totalSum: number) => {
    console.log('Чек збережено на суму:', totalSum, receiptData);

    const cartIds = cartItems.map(item => item.id);
    setItems(prev => prev.filter(item => !cartIds.includes(item.id)));

    setIsCheckoutModalVisible(false);
    showAlert('Транзакція успішна', `Чек на суму ${totalSum.toFixed(2)} ₴ збережено!`, 'success');
  };

const renderRightActions = (item: ProductItem) => (
    <View style={styles.swipeActionsContainer}>
      {/* Кнопка Редагувати */}
      <TouchableOpacity 
        style={[styles.swipeActionBtn, styles.editAction]} 
        onPress={() => {
          swipeableRefs.current.get(item.id)?.close();
          setOpenedRowId(null);
            setEditingItem(item);
            setIsEditModalVisible(true);
        }}
        activeOpacity={0.8}
      >
        <Ionicons name="pencil" size={24} color="#FFF" />
        <Text style={styles.swipeActionText}>Змінити</Text>
      </TouchableOpacity>

      {/* Кнопка Відсутній */}
      <TouchableOpacity 
        style={[styles.swipeActionBtn, styles.unavailableAction]} 
        onPress={() => markUnavailable(item.id)}
        activeOpacity={0.8}
      >
        <Ionicons name="close-circle-outline" size={24} color="#FFF" />
        <Text style={styles.swipeActionText}>Немає</Text>
      </TouchableOpacity>
    </View>
  );

    const cartItems = items.filter(i => i.state === 'in_cart'); 
  const itemsInCartCount = cartItems.length;

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Шапка */}
        <View style={styles.headerRow}>
          <TouchableOpacity>
            <Ionicons name="arrow-back" size={28} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.title} numberOfLines={1}>Сільпо на вихідні</Text>
          <TouchableOpacity>
            <Ionicons name="ellipsis-vertical" size={24} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Кнопки Додавання */}
        <View style={styles.actionsRow}>
                  <TouchableOpacity style={[styles.actionBtn, styles.actionBtnManual]}
                      onPress={() => {
              setEditingItem(null); 
              setIsEditModalVisible(true); 
            }}>
            <Ionicons name="add" size={20} color={colors.text} />
            <Text style={[styles.actionBtnText, { color: colors.text }]}>Додати товар</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={[styles.actionBtn, styles.actionBtnMenu]} onPress={() => setIsMenuModalVisible(true)}>
            <Ionicons name="flash" size={18} color="#FFF" />
            <Text style={[styles.actionBtnText, { color: '#FFF' }]}>З меню</Text>
          </TouchableOpacity>
        </View>

        {/* Список продуктів */}
        {items.map((item) => (
          <Swipeable
            key={item.id}
            ref={(ref) => {
              if (ref) swipeableRefs.current.set(item.id, ref);
              else swipeableRefs.current.delete(item.id);
            }}
            renderRightActions={() => item.state !== 'unavailable' ? renderRightActions(item) : null}
            onSwipeableWillOpen={() => onSwipeableWillOpen(item.id)}
            overshootRight={false}
            friction={1.5}
            rightThreshold={40}
          >
            <TouchableWithoutFeedback onPress={() => toggleCartState(item)}>
              <View 
                style={[
                  styles.itemRow,
                  item.state === 'in_cart' && styles.itemRowInCart,
                  item.state === 'unavailable' && styles.itemRowUnavailable
                ]}
                    >
                        {item.state === 'in_cart' && <View style={styles.inCartOverlay} />}
              <View style={styles.itemInfo}>
                <Text style={[
                  styles.itemName, 
                  item.state === 'unavailable' && styles.itemNameCrossed
                ]}>
                  {item.name}
                </Text>
                <Text style={styles.itemAmount}>{item.amount} {item.unit}</Text>
              </View>

              <View style={styles.itemRightAction}>
                {item.state === 'in_cart' ? (
                  <>
                    <View style={styles.pickerAvatar}>
                      <Text style={styles.pickerAvatarText}>{item.pickedBy?.charAt(0)}</Text>
                    </View>
                    <View style={styles.cartIconContainer}>
                      <Ionicons name="cart" size={18} color="#FFF" />
                    </View>
                  </>
                ) : item.state === 'unavailable' ? (
                  <Ionicons name="close-circle" size={28} color={colors.error} />
                ) : (
                  <View style={styles.emptyCircle} />
                )}
                        </View>
                        </View>
            </TouchableWithoutFeedback>
          </Swipeable>
        ))}

      </ScrollView>

      {/* Розумна нижня панель (з'являється тільки якщо є товари в кошику) */}
      {itemsInCartCount > 0 && (
        <View style={[styles.checkoutPanel, { paddingBottom: insets.bottom > 0 ? insets.bottom + 10 : 20 }]}>
          <View style={styles.checkoutPanelHeader}>
            <Text style={styles.checkoutText}>У кошику:</Text>
            <Text style={[styles.checkoutText, { color: colors.warningAccent, fontWeight: 'bold' }]}>
              {itemsInCartCount} товарів
            </Text>
          </View>

          <TouchableOpacity 
            style={styles.checkoutBtn} 
            onPress={() => setIsCheckoutModalVisible(true)}
          >
            <Text style={styles.checkoutBtnText}>ОФОРМИТИ ЧЕК</Text>
          </TouchableOpacity>
        </View>
          )}
          <ImportFromMenuModal
        visible={isMenuModalVisible}
        onClose={() => setIsMenuModalVisible(false)}
        onImport={handleImportItems}
          />
          
         <EditItemModal 
        visible={isEditModalVisible}
        item={editingItem}
        onClose={() => setIsEditModalVisible(false)}
        onSave={handleSaveItem}
        onDelete={handleDeleteItem}
          />
          
          <CheckoutModal
        visible={isCheckoutModalVisible}
        items={cartItems}
        onClose={() => setIsCheckoutModalVisible(false)}
        onCheckout={handleFinalizeCheckout}
      />
    </View>
  );
}