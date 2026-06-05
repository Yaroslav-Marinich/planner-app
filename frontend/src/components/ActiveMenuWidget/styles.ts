import { StyleSheet } from 'react-native';
import { ThemeColors } from '../../theme/colors';

export const getStyles = (colors: ThemeColors) => StyleSheet.create({
  container: {
    marginVertical: 16,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
  },
  menuTypeBadge: {
    backgroundColor: colors.surfaceSoft,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  menuTypeText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  // Заголовок категорії (Сніданок, Обід тощо)
  categoryTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: colors.textTertiary,
    textTransform: 'uppercase',
    marginTop: 12,
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  // Компактна картка-рядок
  compactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.outline,
  },
  warningBorder: {
    borderColor: colors.warningAccent,
  },
  dishInfoBox: {
    flex: 1,
    paddingRight: 8,
  },
  dishName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  dishMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  portionsText: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  warningText: {
    fontSize: 12,
    color: colors.warning,
    fontWeight: '600',
  },
  // Маленька квадратна кнопка
  cookButtonSm: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  }
});