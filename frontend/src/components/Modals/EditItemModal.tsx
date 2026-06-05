import React, { useState, useEffect } from 'react';
import { 
  View, Text, StyleSheet, Modal, TouchableOpacity, TextInput, 
  ScrollView, Keyboard, KeyboardAvoidingView, Platform 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../providers/ThemeProvider';
import { AVAILABLE_UNITS, MOCK_PRODUCTS_DB } from '../../constants/productsDb';

interface EditItemModalProps {
  visible: boolean;
  item: any | null; 
  onClose: () => void;
  onSave: (id: string | null, name: string, amount: number, unit: string) => void;
  onDelete?: (id: string) => void;
}

export default function EditItemModal({ visible, item, onClose, onSave, onDelete }: EditItemModalProps) {
  const { colors } = useTheme();
  
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [unit, setUnit] = useState(AVAILABLE_UNITS[0]);
  const [suggestions, setSuggestions] = useState<{name: string, defaultUnit: string}[]>([]);
  
  // Стани для відстеження скролу одиниць виміру
  const [unitScrollOffset, setUnitScrollOffset] = useState(0);
  const [unitContentWidth, setUnitContentWidth] = useState(0);
  const [unitLayoutWidth, setUnitLayoutWidth] = useState(0);

  // Стани для відстеження скролу підказок
  const [sugScrollOffset, setSugScrollOffset] = useState(0);
  const [sugContentWidth, setSugContentWidth] = useState(0);
  const [sugLayoutWidth, setSugLayoutWidth] = useState(0);

  useEffect(() => {
    if (visible) {
      if (item) {
        setName(item.name);
        setAmount(item.amount.toString());
        setUnit(item.unit || AVAILABLE_UNITS[0]);
      } else {
        setName('');
        setAmount('');
        setUnit(AVAILABLE_UNITS[0]);
      }
      setSuggestions([]);
      setUnitScrollOffset(0);
      setSugScrollOffset(0);
    }
  }, [item, visible]);

  const handleNameChange = (text: string) => {
    setName(text);
    if (text.length > 1) {
      const filtered = MOCK_PRODUCTS_DB.filter(p => p.name.toLowerCase().includes(text.toLowerCase()));
      setSuggestions(filtered);
    } else {
      setSuggestions([]);
    }
    // Скидаємо позицію скролу підказок при новому вводі
    setSugScrollOffset(0);
  };

  const handleSelectSuggestion = (product: {name: string, defaultUnit: string}) => {
    setName(product.name);
    setUnit(product.defaultUnit);
    setSuggestions([]);
    Keyboard.dismiss();
  };

  const handleSave = () => {
    if (!name.trim()) return;
    onSave(item ? item.id : null, name.trim(), parseFloat(amount.replace(',', '.')) || 1, unit);
    onClose();
  };

  // Логіка для відображення стрілок (Одиниці)
  const isUnitScrolledToStart = unitScrollOffset <= 5;
  const isUnitScrolledToEnd = unitScrollOffset >= unitContentWidth - unitLayoutWidth - 5;
  const showUnitArrows = unitContentWidth > unitLayoutWidth;

  // Логіка для відображення стрілок (Підказки)
  const isSugScrolledToStart = sugScrollOffset <= 5;
  const isSugScrolledToEnd = sugScrollOffset >= sugContentWidth - sugLayoutWidth - 5;
  const showSugArrows = sugContentWidth > sugLayoutWidth;

  return (
    <Modal visible={visible} transparent animationType="fade">
      <KeyboardAvoidingView 
        style={styles.overlay} 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={[styles.modalContent, { backgroundColor: colors.surface, borderColor: colors.outline }]}>
          
          <Text style={[styles.title, { color: colors.text }]}>
            {item ? 'Редагувати товар' : 'Додати новий товар'}
          </Text>

          {/* ПОЛЕ НАЗВИ ТА ПІДКАЗКИ */}
          <View style={styles.section}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>Назва продукту</Text>
            <TextInput
              style={[styles.input, { color: colors.text, borderColor: colors.outline, backgroundColor: colors.background }]}
              value={name}
              onChangeText={handleNameChange}
              placeholder="Наприклад: Молоко"
              placeholderTextColor={colors.textTertiary}
            />
            
            {/* Горизонтальний скрол підказок зі стрілками */}
            {suggestions.length > 0 && (
              <View style={styles.scrollWrapper}>
                {/* Ліва стрілка підказок */}
                <View style={[styles.arrowContainer, { opacity: showSugArrows && !isSugScrolledToStart ? 1 : 0 }]}>
                  <Ionicons name="chevron-back" size={18} color={colors.textSecondary} />
                </View>

                <ScrollView 
                  horizontal 
                  showsHorizontalScrollIndicator={false} 
                  style={styles.scrollView}
                  contentContainerStyle={styles.suggestionsScrollContent}
                  keyboardShouldPersistTaps="handled"
                  scrollEventThrottle={16}
                  onContentSizeChange={(w) => setSugContentWidth(w)}
                  onLayout={(e) => setSugLayoutWidth(e.nativeEvent.layout.width)}
                  onScroll={(e) => setSugScrollOffset(e.nativeEvent.contentOffset.x)}
                >
                  {suggestions.map((sug, idx) => (
                    <TouchableOpacity 
                      key={idx} 
                      style={[
                        styles.suggestionItemPlain, 
                        idx < suggestions.length - 1 && { marginRight: 16 }
                      ]}
                      onPress={() => handleSelectSuggestion(sug)}
                    >
                      <Ionicons name="search" size={16} color={colors.primary} style={{ marginRight: 6 }} />
                      <Text style={{ color: colors.text, fontSize: 15, fontWeight: '500' }}>{sug.name}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>

                {/* Права стрілка підказок */}
                <View style={[styles.arrowContainer, { opacity: showSugArrows && !isSugScrolledToEnd ? 1 : 0 }]}>
                  <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
                </View>
              </View>
            )}
          </View>

          {/* ПОЛЕ ВАГИ ТА ОДИНИЦІ */}
          <View style={styles.section}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>Кількість та одиниця виміру</Text>
            
            {/* Рядок 1: Ввід ваги + Поточна одиниця */}
            <View style={styles.amountUnitRow}>
              <TextInput
                style={[
                  styles.input, 
                  styles.amountInput, 
                  { color: colors.text, borderColor: colors.outline, backgroundColor: colors.background }
                ]}
                value={amount}
                onChangeText={setAmount}
                keyboardType="numeric"
                placeholder="1"
                placeholderTextColor={colors.textTertiary}
              />
              
              <View style={[styles.selectedUnitBox, { backgroundColor: colors.surfaceAlt, borderColor: colors.outline }]}>
                <Text style={{ color: colors.text, fontSize: 18, fontWeight: 'bold' }}>{unit}</Text>
              </View>
            </View>

            {/* Рядок 2: Скрол для вибору одиниць зі стрілками з боків */}
            <View style={styles.scrollWrapper}>
              
              {/* Ліва стрілка одиниць */}
              <View style={[styles.arrowContainer, { opacity: showUnitArrows && !isUnitScrolledToStart ? 1 : 0 }]}>
                <Ionicons name="chevron-back" size={20} color={colors.textSecondary} />
              </View>

              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                style={styles.scrollView}
                contentContainerStyle={styles.unitsScrollContent}
                scrollEventThrottle={16}
                onContentSizeChange={(w) => setUnitContentWidth(w)}
                onLayout={(e) => setUnitLayoutWidth(e.nativeEvent.layout.width)}
                onScroll={(e) => setUnitScrollOffset(e.nativeEvent.contentOffset.x)}
              >
                {AVAILABLE_UNITS.map((u, index) => {
                  const isSelected = unit === u;
                  return (
                    <TouchableOpacity 
                      key={u}
                      style={[
                        styles.unitChip, 
                        index < AVAILABLE_UNITS.length - 1 && { marginRight: 8 },
                        { 
                          backgroundColor: isSelected ? colors.primary : 'transparent', 
                          borderColor: isSelected ? colors.primary : colors.outline 
                        }
                      ]}
                      onPress={() => setUnit(u)}
                    >
                      <Text style={{ 
                        color: isSelected ? '#FFF' : colors.text, 
                        fontWeight: isSelected ? 'bold' : 'normal',
                        fontSize: 14 
                      }}>
                        {u}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>

              {/* Права стрілка одиниць */}
              <View style={[styles.arrowContainer, { opacity: showUnitArrows && !isUnitScrolledToEnd ? 1 : 0 }]}>
                <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
              </View>

            </View>
          </View>

          {/* КНОПКИ ДІЙ */}
          <View style={styles.buttonsRow}>
            {item && onDelete && (
              <TouchableOpacity style={[styles.btn, styles.deleteBtn]} onPress={() => { onDelete(item.id); onClose(); }}>
                <Ionicons name="trash" size={20} color={colors.error} />
              </TouchableOpacity>
            )}
            
            <TouchableOpacity style={[styles.btn, { borderColor: colors.outline, flex: 1 }]} onPress={onClose}>
              <Text style={{ color: colors.text, fontWeight: 'bold' }}>Скасувати</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.btn, { backgroundColor: name.trim() ? colors.primary : colors.surfaceAlt, flex: 1 }]} 
              onPress={handleSave}
              disabled={!name.trim()}
            >
              <Text style={{ color: name.trim() ? '#FFF' : colors.textSecondary, fontWeight: 'bold' }}>Зберегти</Text>
            </TouchableOpacity>
          </View>

        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { 
    flex: 1, 
    backgroundColor: 'rgba(0,0,0,0.6)', 
    justifyContent: 'center', 
    padding: 20 
  },
  modalContent: { 
    borderRadius: 24, 
    padding: 24, 
    borderWidth: 1,
  },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 24, textAlign: 'center' },
  section: { marginBottom: 24 },
  label: { fontSize: 14, marginBottom: 8, fontWeight: '500' },
  
  input: { 
    borderWidth: 1, 
    borderRadius: 14, 
    paddingHorizontal: 16, 
    height: 52, 
    fontSize: 16, 
  },

  // --- СПІЛЬНІ СТИЛІ ДЛЯ ОБОХ СКРОЛІВ (ПІДКАЗКИ ТА ОДИНИЦІ) ---
  scrollWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  arrowContainer: {
    width: 24,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },

  // --- СТИЛІ ПІДКАЗОК (БЕЗ РАМОК) ---
  suggestionsScrollContent: {
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  suggestionItemPlain: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 4,
  },

  // --- БЛОК ВАГИ ТА ОДИНИЦЬ ---
  amountUnitRow: { 
    flexDirection: 'row', 
    alignItems: 'center',
    marginBottom: 8,
  },
  amountInput: { 
    flex: 1, 
    marginRight: 12, 
    textAlign: 'center',
    fontSize: 18,
    fontWeight: 'bold',
  },
  selectedUnitBox: {
    width: 80, 
    height: 52,
    borderRadius: 14,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  unitsScrollContent: { 
    alignItems: 'center',
    paddingHorizontal: 4, 
  },
  unitChip: {
    height: 40, 
    minWidth: 48,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12, 
    borderWidth: 1,
    paddingHorizontal: 12,
  },

  buttonsRow: { flexDirection: 'row', gap: 12, marginTop: 8 },
  btn: { paddingVertical: 16, borderRadius: 14, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'transparent' },
  deleteBtn: { backgroundColor: 'transparent', borderColor: '#E57373', paddingHorizontal: 16 },
});