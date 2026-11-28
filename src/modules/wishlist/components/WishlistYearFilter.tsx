import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
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
  onClear: () => void;
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
  onClear,
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
              <Text style={styles.title}>Filter your wishlist</Text>
              <Text style={styles.subtitle}>Choose a year and month.</Text>
            </View>
            <Pressable
              accessibilityLabel="Close wishlist filter"
              accessibilityRole="button"
              onPress={onClose}
              style={styles.closeButton}
            >
              <Ionicons color={colors.neutralIcon} name="close" size={22} />
            </Pressable>
          </View>
          <ScrollView
            contentContainerStyle={styles.filterList}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.filterGroup}>
              <Text style={styles.filterGroupTitle}>Year</Text>
              <View style={styles.filterOptions}>
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
                        styles.filterOption,
                        selected && styles.selectedStatusOption,
                      ]}
                    >
                      <Text
                        style={[
                          styles.filterOptionText,
                          selected && styles.selectedStatusOptionText,
                        ]}
                      >
                        {option.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>
            <View style={styles.filterGroup}>
              <Text style={styles.filterGroupTitle}>Month</Text>
              <View style={styles.filterOptions}>
                <Pressable
                  accessibilityRole="radio"
                  accessibilityState={{ selected: selectedMonth === null }}
                  onPress={() => onMonthChange(null)}
                  style={[
                    styles.filterOption,
                    selectedMonth === null && styles.selectedStatusOption,
                  ]}
                >
                  <Text
                    style={[
                      styles.filterOptionText,
                      selectedMonth === null &&
                        styles.selectedStatusOptionText,
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
                        styles.filterOption,
                        selected && !disabled && styles.selectedFilterOption,
                        disabled && styles.disabledOption,
                      ]}
                    >
                      <Text
                        style={[
                          styles.filterOptionText,
                          selected && !disabled && styles.selectedOptionText,
                          disabled && styles.disabledOptionText,
                        ]}
                      >
                        {month}
                      </Text>
                      {selected && !disabled ? (
                        <Ionicons
                          color={colors.brand}
                          name="checkmark"
                          size={15}
                        />
                      ) : null}
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
              onPress={onClear}
              style={[styles.actionButton, styles.clearButton]}
            >
              <Text style={styles.clearText}>Clear</Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              onPress={onApply}
              style={[styles.actionButton, styles.applyButton]}
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
    maxHeight: '84%',
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
    color: colors.mutedText,
    fontSize: 12,
    marginTop: 3,
  },
  closeButton: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 19,
    backgroundColor: colors.backgroundSecondary,
  },
  filterList: {
    paddingBottom: spacing.md,
  },
  filterGroup: {
    paddingVertical: spacing.sm,
    borderBottomColor: colors.border,
    borderBottomWidth: 1,
  },
  filterGroupTitle: {
    marginBottom: spacing.sm,
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: '700',
  },
  filterOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  filterOption: {
    minHeight: 34,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: colors.backgroundPrimary,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 17,
  },
  selectedFilterOption: {
    backgroundColor: colors.brandSurface,
    borderColor: colors.brand,
  },
  filterOptionText: {
    color: colors.textPrimary,
    fontSize: 11,
  },
  selectedStatusOption: {
    borderColor: colors.brand,
    backgroundColor: colors.brand,
  },
  selectedStatusOptionText: {
    color: colors.backgroundPrimary,
    fontWeight: '600',
  },
  selectedOptionText: {
    color: colors.brand,
    fontWeight: '600',
  },
  disabledOption: {
    borderColor: colors.switchInactive,
    backgroundColor: colors.switchInactive,
  },
  disabledOptionText: {
    color: '#8E8E93',
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
    backgroundColor: colors.backgroundPrimary,
  },
  actionButton: {
    minHeight: 46,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 13,
  },
  clearButton: {
    width: 84,
    backgroundColor: colors.neutralSurface,
  },
  clearText: {
    color: colors.neutralIcon,
    fontSize: 13,
    fontWeight: '600',
  },
  applyButton: {
    flex: 1,
    minHeight: 44,
    backgroundColor: colors.brand,
  },
  applyText: {
    color: colors.backgroundPrimary,
    fontSize: 13,
    fontWeight: '700',
  },
});
