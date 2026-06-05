import React, { useState, useRef } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Swipeable from 'react-native-gesture-handler/Swipeable';
import { getStyles } from './styles';
import { useTheme } from '../../providers/ThemeProvider';
import { useAppAlert } from '../../providers/CustomAlertProvider';

interface Shopper {
  id: string;
  name: string;
  color: string;
}

interface ShoppingList {
  id: string;
  name: string;
  totalItems: number;
  boughtItems: number;
  activeShoppers: Shopper[];
  isArchived?: boolean;
}

const initialMockLists: ShoppingList[] = [
  { id: '1', name: 'Сільпо на вихідні', totalItems: 24, boughtItems: 5, activeShoppers: [{ id: 'u1', name: 'Ярослав', color: '#1B5E20' }, { id: 'u2', name: 'Дружина', color: '#E57373' }] },
  { id: '2', name: 'Ринок (овочі та м\'ясо)', totalItems: 12, boughtItems: 12, activeShoppers: [] },
  { id: '3', name: 'Загальний (Щоденний)', totalItems: 8, boughtItems: 0, activeShoppers: [{ id: 'u1', name: 'Ярослав', color: '#1B5E20' }] },
];

export default function ShoppingListsScreen({ navigation }: any) {
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const { showModal, showAlert } = useAppAlert();

  const [lists, setLists] = useState<ShoppingList[]>(initialMockLists);
  const [showArchived, setShowArchived] = useState(false);
  
  const [openedRowId, setOpenedRowId] = useState<string | null>(null);
  const swipeableRefs = useRef<Map<string, Swipeable>>(new Map());

  const handleOpenList = (list: ShoppingList) => {
    console.log('Відкриваємо список:', list.name);
  };

  const handleArchive = (listId: string) => {
    swipeableRefs.current.get(listId)?.close();
    setOpenedRowId(null);

    showModal({
      title: 'Перемістити в архів?',
      message: 'Список буде приховано з головного екрана. Ви зможете знайти його в архіві.',
      confirmText: 'В архів',
      cancelText: 'Скасувати',
      isDanger: true,
      onConfirm: () => {
        setLists(prev => prev.map(list => list.id === listId ? { ...list, isArchived: true } : list));
        showAlert('Готово', 'Список переміщено в архів', 'success');
      }
    });
  };

  const handleRestore = (listId: string) => {
    setLists(prev => prev.map(list => list.id === listId ? { ...list, isArchived: false } : list));
    showAlert('Готово', 'Список повернуто до активних', 'success');
  };

  const onSwipeableWillOpen = (id: string) => {
    if (openedRowId && openedRowId !== id) {
      swipeableRefs.current.get(openedRowId)?.close();
    }
    setOpenedRowId(id);
  };

  const renderRightActions = (listId: string) => {
    return (
      <TouchableOpacity 
        style={styles.archiveActionContainer} 
        onPress={() => handleArchive(listId)}
        activeOpacity={0.8}
      >
        <Ionicons name="archive-outline" size={24} color="#FFF" />
        <Text style={styles.archiveActionText}>В архів</Text>
      </TouchableOpacity>
    );
  };

  const displayedLists = lists.filter(list => showArchived ? list.isArchived : !list.isArchived);

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        <View style={styles.headerRow}>
          {showArchived ? (
            <View style={styles.archiveHeader}>
              <TouchableOpacity onPress={() => setShowArchived(false)}>
                <Ionicons name="arrow-back" size={28} color={colors.text} />
              </TouchableOpacity>
              <Text style={styles.title}>Архів</Text>
            </View>
          ) : (
            <Text style={styles.title}>Мої списки</Text>
          )}

          {!showArchived && (
            <TouchableOpacity onPress={() => setShowArchived(true)}>
              <Ionicons name="archive-outline" size={24} color={colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>

        {displayedLists.length === 0 && (
          <Text style={{ color: colors.textSecondary, textAlign: 'center', marginTop: 40 }}>
            {showArchived ? 'Архів порожній' : 'У вас немає активних списків'}
          </Text>
        )}

        {displayedLists.map((list) => {
          const isCompleted = list.totalItems > 0 && list.boughtItems === list.totalItems;
          const progressPercentage = list.totalItems > 0 ? (list.boughtItems / list.totalItems) * 100 : 0;
          
          return (
            <Swipeable
              key={list.id}
              ref={(ref) => {
                if (ref) swipeableRefs.current.set(list.id, ref);
                else swipeableRefs.current.delete(list.id);
              }}
              renderRightActions={showArchived ? undefined : () => renderRightActions(list.id)}
              onSwipeableWillOpen={() => onSwipeableWillOpen(list.id)}
              overshootRight={false}
              friction={1.5}
              rightThreshold={40}
            >
              <TouchableOpacity 
                style={styles.listCard}
                onPress={() => showArchived ? handleRestore(list.id) : handleOpenList(list)}
                activeOpacity={1}
              >
                <View style={styles.cardHeader}>
                  <Text style={[styles.listName, isCompleted && { color: colors.textSecondary, textDecorationLine: 'line-through' }]}>
                    {list.name}
                  </Text>
                  <View style={[styles.statusBadge, { backgroundColor: isCompleted ? colors.surfaceSoft : colors.accentSoft }]}>
                    <Text style={[styles.statusText, { color: isCompleted ? colors.textTertiary : colors.warningAccent }]}>
                      {isCompleted ? 'Виконано' : 'Активний'}
                    </Text>
                  </View>
                </View>

                {list.activeShoppers.length > 0 && (
                  <View style={styles.activeShoppersContainer}>
                    <Text style={styles.activeText}>Зараз у магазині:</Text>
                    <View style={styles.avatarGroup}>
                      {list.activeShoppers.map((shopper, index) => (
                        <View key={shopper.id} style={[styles.avatar, { backgroundColor: shopper.color, zIndex: list.activeShoppers.length - index }, index === 0 && { marginLeft: 0 }]}>
                          <Text style={styles.avatarText}>{shopper.name.charAt(0)}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                )}

                <View style={styles.progressRow}>
                  <Text style={styles.progressText}>Прогрес покупок</Text>
                  <Text style={[styles.progressText, { color: colors.text, fontWeight: 'bold' }]}>
                    {list.boughtItems} з {list.totalItems}
                  </Text>
                </View>
                <View style={styles.progressBarContainer}>
                  <View style={[styles.progressBarFill, { width: `${progressPercentage}%`, backgroundColor: isCompleted ? colors.success : colors.primary }]} />
                </View>
              </TouchableOpacity>
            </Swipeable>
          );
        })}

      </ScrollView>

      {!showArchived && (
        <TouchableOpacity style={styles.fab} activeOpacity={0.8}>
          <Ionicons name="add" size={30} color="#FFF" />
        </TouchableOpacity>
      )}
    </View>
  );
}