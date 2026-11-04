import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing } from '../../../shared/ui/theme';

interface WishlistYearFilterProps {
  visible: boolean;
  years: number[];
  selectedYear: number | null;
  onSelect: (year: number | null) => void;
  onClose: () => void;
}

export function WishlistYearFilter({
  visible,
  years,
  selectedYear,
  onSelect,
  onClose,
}: WishlistYearFilterProps) {
  const options = [
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
              <Text style={styles.subtitle}>Choose a creation year.</Text>
            </View>
            <Pressable
              accessibilityLabel="Close year filter"
              accessibilityRole="button"
              onPress={onClose}
              style={styles.closeButton}
            >
              <Text style={styles.closeText}>×</Text>
            </Pressable>
          </View>
          <ScrollView contentContainerStyle={styles.options}>
            {options.map((option) => {
              const selected = selectedYear === option.year;
              return (
                <Pressable
                  accessibilityRole="radio"
                  accessibilityState={{ selected }}
                  key={option.label}
                  onPress={() => {
                    onSelect(option.year);
                    onClose();
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
          </ScrollView>
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
    maxHeight: '70%',
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
  options: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    paddingBottom: spacing.lg,
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
});
