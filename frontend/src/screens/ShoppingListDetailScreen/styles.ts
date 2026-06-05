import { StyleSheet } from 'react-native';
import { ThemeColors } from '../../theme/colors';

export const getStyles = (colors: ThemeColors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 120, 
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    flex: 1,
    marginLeft: 12,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  actionBtnManual: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.outline,
  },
  actionBtnMenu: {
    backgroundColor: colors.primary,
  },
  actionBtnText: {
    fontWeight: 'bold',
    fontSize: 14,
  },
  
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: 16,
    borderRadius: 16,
    marginBottom: 10,
    borderWidth: 1,
      borderColor: colors.outline,
    overflow: 'hidden',
  },
  itemRowInCart: {
    borderColor: colors.warningAccent,
    },
  inCartOverlay: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(247,147,26,0.08)',
  },
  itemRowUnavailable: {
    opacity: 0.5,
    backgroundColor: colors.surfaceAlt,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  itemAmount: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  itemNameCrossed: {
    textDecorationLine: 'line-through',
    color: colors.textSecondary,
  },
  
  itemRightAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  emptyCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: colors.outline,
  },
  cartIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.warningAccent,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pickerAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pickerAvatarText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: 'bold',
  },

unavailableAction: {
    backgroundColor: colors.errorBright,
  },
  unavailableActionText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: 'bold',
    marginTop: 4,
  },

  checkoutPanel: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.card,
    borderTopWidth: 1,
    borderTopColor: colors.outline,
    paddingHorizontal: 20,
    paddingTop: 16,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  checkoutPanelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  checkoutText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
  checkoutBtn: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  checkoutBtnText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
swipeActionsContainer: {
    flexDirection: 'row',
    marginBottom: 10,
    marginLeft: 8,
    borderRadius: 16,
    overflow: 'hidden', 
    width: 140, 
  },
  swipeActionBtn: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  editAction: {
    backgroundColor: colors.info,
  },
  swipeActionText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: 'bold',
    marginTop: 4,
  },
});