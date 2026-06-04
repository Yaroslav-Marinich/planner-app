import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Modal, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from './ThemeProvider';

type AlertType = 'success' | 'error' | 'warning' | 'info';

export type ModalConfig = {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isDanger?: boolean;
  onConfirm: () => void;
  onCancel?: () => void;
};

type AlertContextType = {
  showAlert: (title: string, message: string, type?: AlertType) => void;
  showModal: (config: ModalConfig) => void;
  hideModal: () => void;
};

const AlertContext = createContext<AlertContextType | undefined>(undefined);

export const CustomAlertProvider = ({ children }: { children: React.ReactNode }) => {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  
  const [alertConfig, setAlertConfig] = useState<{ title: string; message: string; type: AlertType } | null>(null);
  const slideAnim = useRef(new Animated.Value(-100)).current;

  const [modalConfig, setModalConfig] = useState<ModalConfig | null>(null);

  useEffect(() => {
    if (alertConfig) {
      Animated.spring(slideAnim, {
        toValue: insets.top > 0 ? insets.top + 10 : 20,
        useNativeDriver: true,
      }).start();

      const timer = setTimeout(() => {
        Animated.timing(slideAnim, {
          toValue: -150,
          duration: 300,
          useNativeDriver: true,
        }).start(() => setAlertConfig(null));
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [alertConfig, slideAnim, insets.top]);

  const showAlert = (title: string, message: string, type: AlertType = 'info') => {
    setAlertConfig({ title, message, type });
  };

  const getAlertBackgroundColor = () => {
    switch (alertConfig?.type) {
      case 'success': return colors.success;
      case 'error': return colors.errorBright;
      case 'warning': return colors.warning;
      default: return colors.info;
    }
  };

  const showModal = (config: ModalConfig) => setModalConfig(config);
  const hideModal = () => setModalConfig(null);

  const handleConfirm = () => {
    if (modalConfig?.onConfirm) modalConfig.onConfirm();
    hideModal();
  };

  const handleCancel = () => {
    if (modalConfig?.onCancel) modalConfig.onCancel();
    hideModal();
  };

  return (
    <AlertContext.Provider value={{ showAlert, showModal, hideModal }}>
      {children}
      
      {alertConfig && (
        <Animated.View
          style={[
            styles.toastContainer,
            { backgroundColor: getAlertBackgroundColor(), transform: [{ translateY: slideAnim }] },
          ]}
        >
          <Text style={styles.toastTitle}>{alertConfig.title}</Text>
          {alertConfig.message ? <Text style={styles.toastMessage}>{alertConfig.message}</Text> : null}
        </Animated.View>
      )}

      <Modal visible={!!modalConfig} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card, borderColor: colors.outline, borderWidth: 1 }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>{modalConfig?.title}</Text>
            <Text style={[styles.modalMessage, { color: colors.textSecondary }]}>{modalConfig?.message}</Text>
            
            <View style={styles.modalButtons}>
              <TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={handleCancel}>
                <Text style={[styles.buttonText, { color: colors.text }]}>
                  {modalConfig?.cancelText || 'Скасувати'}
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[
                  styles.button, 
                  { backgroundColor: modalConfig?.isDanger ? colors.danger : colors.primary }
                ]} 
                onPress={handleConfirm}
              >
                <Text style={[styles.buttonText, { color: '#FFF' }]}>
                  {modalConfig?.confirmText || 'ОК'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </AlertContext.Provider>
  );
};

export const useAppAlert = () => {
  const context = useContext(AlertContext);
  if (!context) throw new Error('useAppAlert must be used within CustomAlertProvider');
  return context;
};

const styles = StyleSheet.create({
  toastContainer: {
    position: 'absolute', top: 0, left: 20, right: 20, padding: 16,
    borderRadius: 12, zIndex: 9999, elevation: 10,
    shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 5, shadowOffset: { width: 0, height: 2 },
  },
  toastTitle: { color: '#FFF', fontWeight: 'bold', fontSize: 16, marginBottom: 4 },
  toastMessage: { color: '#FFF', fontSize: 14, opacity: 0.9 },
  
  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', 
    justifyContent: 'center', alignItems: 'center', padding: 20,
  },
  modalContent: {
    width: '100%', borderRadius: 16, padding: 24,
    shadowColor: '#000', shadowOpacity: 0.25, shadowRadius: 10, elevation: 5,
  },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 12, textAlign: 'center' },
  modalMessage: { fontSize: 16, marginBottom: 24, textAlign: 'center', lineHeight: 22 },
  modalButtons: { flexDirection: 'row', justifyContent: 'space-between', gap: 12 },
  button: { flex: 1, paddingVertical: 12, borderRadius: 8, alignItems: 'center' },
  cancelButton: { backgroundColor: 'transparent', borderWidth: 1, borderColor: '#555' },
  buttonText: { fontSize: 16, fontWeight: 'bold' },
});