import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing } from '../../../shared/ui/theme';

const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

interface WishlistYearFilterProps {
  visible: boolean;
  years: number[];
  selectedYear: number | null;
  selectedMonth: number | null;
  monthsWithItems: number[];
  monthsLoading: boolean;
  monthsError: Error | null;
  onYearChange: (year: number | null) => void;
  onMonthChange: (month: number | null) => void;
  onApply: () => void;
  onClose: () => void;
}

export function WishlistYearFilter({
  visible,
  years,
  selectedYear,
  selectedMonth,
  monthsWithItems,
  monthsLoading,
  monthsError,
  onYearChange,
  onMonthChange,
  onApply,
  onClose,
}: WishlistYearFilterProps) {
  const yearOptions = [
    { label: 'All Years', year: null },
    ...years.map((year) => ({ label: String(year), year })),
  ];

  return (
    <Modal
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent
      transparent
      visible={visible}
    >
      <View style={styles.overlay}>
        <SafeAreaView edges={['bottom']} style={styles.sheet}>
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>Filter wishlist</Text>
              <Text style={styles.subtitle}>Choose a year and month.</Text>
            </View>
            <Pressable
              accessibilityLabel="Close wishlist filter"
              accessibilityRole="button"
              onPress={onClose}
              style={styles.closeButton}
            >
              <Text style={styles.closeText}>×</Text>
            </Pressable>
          </View>
          <ScrollView contentContainerStyle={styles.content}>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Year</Text>
              <View style={styles.options}>
                {yearOptions.map((option) => {
                  const selected = selectedYear === option.year;
                  return (
                    <Pressable
                      accessibilityRole="radio"
                      accessibilityState={{ selected }}
                      key={option.label}
                      onPress={() => {
                        onYearChange(option.year);
                        onMonthChange(null);
                      }}
                      style={[
                        styles.option,
                        selected && styles.selectedOption,
                      ]}
                    >
                      <Text
                        style={[
                          styles.optionText,
                          selected && styles.selectedOptionText,
                        ]}
                      >
                        {option.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Month</Text>
              <View style={styles.monthOptions}>
                <Pressable
                  accessibilityRole="radio"
                  accessibilityState={{ selected: selectedMonth === null }}
                  onPress={() => onMonthChange(null)}
                  style={[
                    styles.monthOption,
                    styles.allMonthsOption,
                    selectedMonth === null && styles.selectedOption,
                  ]}
                >
                  <Text
                    style={[
                      styles.optionText,
                      selectedMonth === null && styles.selectedOptionText,
                    ]}
                  >
                    All months
                  </Text>
                </Pressable>
                {MONTHS.map((month, monthIndex) => {
                  const disabled =
                    selectedYear === null ||
                    monthsLoading ||
                    monthsError !== null ||
                    !monthsWithItems.includes(monthIndex);
                  const selected = selectedMonth === monthIndex;
                  return (
                    <Pressable
                      accessibilityRole="radio"
                      accessibilityState={{ disabled, selected }}
                      disabled={disabled}
                      key={month}
                      onPress={() => onMonthChange(monthIndex)}
                      style={[
                        styles.monthOption,
                        selected && !disabled && styles.selectedOption,
                        disabled && styles.disabledOption,
                      ]}
                    >
                      <Text
                        style={[
                          styles.optionText,
                          selected && !disabled && styles.selectedOptionText,
                          disabled && styles.disabledOptionText,
                        ]}
                      >
                        {month}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
              {selectedYear === null ? (
                <Text style={styles.statusText}>
                  Choose a year to enable month filtering.
                </Text>
              ) : monthsLoading ? (
                <ActivityIndicator
                  color={colors.brand}
                  style={styles.statusIndicator}
                />
              ) : monthsError ? (
                <Text accessibilityRole="alert" style={styles.errorText}>
                  {monthsError.message}
                </Text>
              ) : null}
            </View>
          </ScrollView>
          <View style={styles.actions}>
            <Pressable
              accessibilityRole="button"
              onPress={onClose}
              style={styles.cancelButton}
            >
              <Text style={styles.cancelText}>Cancel</Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              onPress={onApply}
              style={styles.applyButton}
            >
              <Text style={styles.applyText}>Apply filter</Text>
            </Pressable>
          </View>
        </SafeAreaView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(18, 18, 18, 0.45)',
  },
  sheet: {
    maxHeight: '85%',
    paddingTop: spacing.lg,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.backgroundPrimary,
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  title: {
    color: colors.textPrimary,
    fontSize: 20,
    fontWeight: '700',
  },
  subtitle: {
    marginTop: 3,
    color: colors.mutedText,
    fontSize: 12,
  },
  closeButton: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 19,
    backgroundColor: colors.backgroundSecondary,
  },
  closeText: {
    color: colors.neutralIcon,
    fontSize: 24,
    lineHeight: 28,
  },
  content: {
    paddingBottom: spacing.md,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    marginBottom: spacing.sm,
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: '700',
  },
  options: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  option: {
    minHeight: 38,
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 19,
    backgroundColor: colors.warmWhite,
  },
  selectedOption: {
    borderColor: colors.brand,
    backgroundColor: colors.brand,
  },
  optionText: {
    color: colors.mutedText,
    fontSize: 13,
    fontWeight: '600',
  },
  selectedOptionText: {
    color: colors.backgroundPrimary,
  },
  monthOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  monthOption: {
    width: '31%',
    minHeight: 40,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xs,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 20,
    backgroundColor: colors.warmWhite,
  },
  allMonthsOption: {
    width: '100%',
  },
  disabledOption: {
    borderColor: '#E5E5EA',
    backgroundColor: '#F2F2F5',
  },
  disabledOptionText: {
    color: '#A0A0A5',
  },
  statusText: {
    marginTop: spacing.sm,
    color: colors.mutedText,
    fontSize: 12,
  },
  statusIndicator: {
    marginTop: spacing.sm,
  },
  errorText: {
    marginTop: spacing.sm,
    color: colors.error,
    fontSize: 12,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  cancelButton: {
    flex: 1,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 22,
  },
  cancelText: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: '600',
  },
  applyButton: {
    flex: 1,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.brand,
    borderRadius: 22,
  },
  applyText: {
    color: colors.backgroundPrimary,
    fontSize: 14,
    fontWeight: '600',
  },
});
