import React, { useState, useEffect } from 'react';
import { 
  View, Text, StyleSheet, Modal, TouchableOpacity, TextInput, 
  ScrollView, KeyboardAvoidingView, Platform 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../providers/ThemeProvider';

const MOCK_WAREHOUSE = [
  { id: 'w1', name: 'Молоко Яготинське 2.5%', amount: 0.4, unit: 'л' },
  { id: 'w2', name: 'Молоко Простоквашино 3.2%', amount: 1.5, unit: 'л' },
  { id: 'w3', name: 'Молоко кокосове Alpro', amount: 0.9, unit: 'л' },
  { id: 'w4', name: 'Вершки 10%', amount: 0.5, unit: 'л' },
  { id: 'w5', name: 'Кефір 1%', amount: 1.0, unit: 'л' },
];

interface AnalogSelectionModalProps {
  visible: boolean;
  targetItem: { id: string; name: string; amount: number; unit: string } | null;
  currentAnalogs: string[]; 
  onClose: () => void;
  onSave: (targetId: string, analogIds: string[]) => void;
}

export default function AnalogSelectionModal({ 
  visible, targetItem, currentAnalogs, onClose, onSave 
}: AnalogSelectionModalProps) {
  const { colors } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  useEffect(() => {
    if (visible) {
      setSearchQuery('');
      setSelectedIds(currentAnalogs || []);
    }
  }, [visible, currentAnalogs]);

  if (!visible || !targetItem) return null;

  const filteredWarehouse = MOCK_WAREHOUSE.filter(item => 
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleToggleSelect = (id: string) => {
    setSelectedIds(prev => {
      if (prev.includes(id)) {
        return prev.filter(item => item !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <KeyboardAvoidingView 
        style={styles.overlay} 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={[styles.modalContent, { backgroundColor: colors.background, borderColor: colors.outline }]}>
          
          {/* ШАПКА */}
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose} style={styles.iconBtn}>
              <Ionicons name="close" size={28} color={colors.text} />
            </TouchableOpacity>
            <Text style={[styles.title, { color: colors.text }]}>Налаштування аналогів</Text>
            <View style={styles.iconBtn} />
          </View>

          {/* ІНФО ПАНЕЛЬ */}
          <View style={styles.infoBanner}>
            <Text style={styles.infoText}>
              Шукаємо заміну для: <Text style={{ fontWeight: 'bold' }}>{targetItem.name}</Text>
            </Text>
            <Text style={styles.subInfoText}>
              Порядок кліків визначає пріоритет каскадного списання при готуванні.
            </Text>
          </View>

          {/* ПОШУК */}
          <View style={[styles.searchContainer, { backgroundColor: colors.surface, borderColor: colors.outline }]}>
            <Ionicons name="search" size={20} color={colors.textSecondary} style={{ marginRight: 8 }} />
            <TextInput
              style={[styles.searchInput, { color: colors.text }]}
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Пошук продукту на складі..."
              placeholderTextColor={colors.textTertiary}
            />
          </View>

          {/* СПИСОК СКЛАДУ */}
          <ScrollView style={styles.listArea} showsVerticalScrollIndicator={false}>
            {filteredWarehouse.map((item) => {
              const priorityIndex = selectedIds.indexOf(item.id);
              const isSelected = priorityIndex !== -1;

              return (
                <TouchableOpacity 
                  key={item.id} 
                  style={[
                    styles.itemRow, 
                    { backgroundColor: colors.surface, borderColor: colors.outline },
                    isSelected && { borderColor: colors.primary, borderWidth: 2 }
                  ]}
                  activeOpacity={0.7}
                  onPress={() => handleToggleSelect(item.id)}
                >
                  <View style={styles.itemInfo}>
                    <Text style={[styles.itemName, { color: colors.text }]}>{item.name}</Text>
                    <Text style={[styles.itemAmount, { color: colors.textSecondary }]}>
                      В наявності: {item.amount} {item.unit}
                    </Text>
                  </View>

                  {/* Чіпс з номером пріоритету */}
                  <View style={[
                    styles.checkbox, 
                    { borderColor: colors.outline },
                    isSelected && { backgroundColor: colors.primary, borderColor: colors.primary }
                  ]}>
                    {isSelected && (
                      <Text style={styles.priorityText}>{priorityIndex + 1}</Text>
                    )}
                  </View>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* ФУТЕР */}
          <View style={[styles.footer, { borderTopColor: colors.outline }]}>
            <TouchableOpacity 
              style={[styles.saveBtn, { backgroundColor: colors.primary }]}
              onPress={() => onSave(targetItem.id, selectedIds)}
            >
              <Text style={styles.saveBtnText}>Зберегти пріоритети</Text>
            </TouchableOpacity>
          </View>

        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  modalContent: { height: '80%', borderTopLeftRadius: 24, borderTopRightRadius: 24, borderTopWidth: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16 },
  title: { fontSize: 18, fontWeight: 'bold' },
  iconBtn: { width: 40 },
  infoBanner: { padding: 16, backgroundColor: 'rgba(247,147,26,0.08)', borderBottomWidth: 1, borderBottomColor: 'rgba(247,147,26,0.15)' },
  infoText: { fontSize: 15, color: '#F7931A', marginBottom: 4 },
  subInfoText: { fontSize: 12, color: 'rgba(247,147,26,0.7)' },
  searchContainer: { flexDirection: 'row', alignItems: 'center', margin: 16, paddingHorizontal: 12, height: 48, borderRadius: 12, borderWidth: 1 },
  searchInput: { flex: 1, fontSize: 16 },
  listArea: { flex: 1, paddingHorizontal: 16 },
  itemRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, borderRadius: 16, borderWidth: 1, marginBottom: 10 },
  itemInfo: { flex: 1 },
  itemName: { fontSize: 16, fontWeight: 'bold', marginBottom: 4 },
  itemAmount: { fontSize: 13 },
  checkbox: { width: 28, height: 28, borderRadius: 14, borderWidth: 2, justifyContent: 'center', alignItems: 'center' },
  priorityText: { color: '#FFF', fontSize: 14, fontWeight: 'bold' },
  footer: { padding: 16, borderTopWidth: 1 },
  saveBtn: { height: 56, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  saveBtnText: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },
});