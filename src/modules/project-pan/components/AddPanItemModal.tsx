import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  type TextInputProps,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing } from '../../../shared/ui/theme';
import type { NewPanItemInput } from '../services/panService';

interface AddPanItemModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (input: NewPanItemInput) => Promise<void>;
}

interface FormFieldProps extends TextInputProps {
  label: string;
}

function FormField({ label, ...inputProps }: FormFieldProps) {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        placeholderTextColor={colors.mutedText}
        style={styles.input}
        {...inputProps}
      />
    </View>
  );
}

function getToday(): string {
  const today = new Date();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${today.getFullYear()}-${month}-${day}`;
}

function isValidDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }
  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  return (
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day
  );
}

export function AddPanItemModal({
  visible,
  onClose,
  onSave,
}: AddPanItemModalProps) {
  const [name, setName] = useState('');
  const [brand, setBrand] = useState('');
  const [variant, setVariant] = useState('');
  const [category, setCategory] = useState('');
  const [price, setPrice] = useState('');
  const [acquisitionType, setAcquisitionType] =
    useState<NewPanItemInput['acquisition_type']>('bought');
  const [acquiredOn, setAcquiredOn] = useState(getToday);
  const [progress, setProgress] = useState('0');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!visible) return;
    setName('');
    setBrand('');
    setVariant('');
    setCategory('');
    setPrice('');
    setAcquisitionType('bought');
    setAcquiredOn(getToday());
    setProgress('0');
    setError(null);
  }, [visible]);

  async function submit() {
    if (saving) return;
    const normalizedName = name.trim();
    const normalizedBrand = brand.trim();
    const normalizedCategory = category.trim();
    const parsedProgress = Number(progress);
    const parsedPrice = Number(price);

    if (!normalizedName || !normalizedBrand || !normalizedCategory) {
      setError('Enter a product name, brand, and category.');
      return;
    }
    if (!isValidDate(acquiredOn)) {
      setError('Enter a valid date in YYYY-MM-DD format.');
      return;
    }
    if (!Number.isFinite(parsedProgress) || parsedProgress < 0 || parsedProgress > 100) {
      setError('Progress must be a number from 0 to 100.');
      return;
    }
    if (
      acquisitionType === 'bought' &&
      (!price.trim() || !Number.isFinite(parsedPrice) || parsedPrice < 0)
    ) {
      setError('Enter a valid price, or choose Gift.');
      return;
    }

    setError(null);
    setSaving(true);
    try {
      await onSave({
        name: normalizedName,
        brand: normalizedBrand,
        ...(variant.trim() ? { variant: variant.trim() } : {}),
        category: normalizedCategory,
        ...(acquisitionType === 'bought' ? { price: parsedPrice } : {}),
        acquisition_type: acquisitionType,
        acquired_on: acquiredOn,
        current_progress: parsedProgress,
      });
      onClose();
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : 'Unable to save this product. Please try again.',
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent
      transparent
      visible={visible}
    >
      <View style={styles.overlay}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.keyboardArea}
        >
          <SafeAreaView edges={['bottom']} style={styles.sheet}>
            <View style={styles.heading}>
              <View>
                <Text style={styles.title}>Add a product</Text>
                <Text style={styles.subtitle}>Start tracking your progress.</Text>
              </View>
              <Pressable
                accessibilityLabel="Close add product form"
                accessibilityRole="button"
                disabled={saving}
                onPress={onClose}
                style={styles.closeButton}
              >
                <Ionicons color={colors.burgundy} name="close" size={23} />
              </Pressable>
            </View>
            <ScrollView
              contentContainerStyle={styles.form}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              <FormField
                autoCapitalize="words"
                label="Product name"
                onChangeText={setName}
                placeholder="e.g. Velvet lipstick"
                value={name}
              />
              <FormField
                autoCapitalize="words"
                label="Brand"
                onChangeText={setBrand}
                placeholder="e.g. Example Beauty"
                value={brand}
              />
              <FormField
                autoCapitalize="words"
                label="Variant (optional)"
                onChangeText={setVariant}
                placeholder="Shade, size, or finish"
                value={variant}
              />
              <FormField
                autoCapitalize="words"
                label="Category"
                onChangeText={setCategory}
                placeholder="e.g. Lip Product"
                value={category}
              />

              <View style={styles.field}>
                <Text style={styles.fieldLabel}>Price or gift</Text>
                <View style={styles.choiceRow}>
                  {(['bought', 'gifted'] as const).map((choice) => {
                    const selected = acquisitionType === choice;
                    return (
                      <Pressable
                        accessibilityRole="radio"
                        accessibilityState={{ checked: selected }}
                        key={choice}
                        onPress={() => setAcquisitionType(choice)}
                        style={[
                          styles.choice,
                          selected && styles.selectedChoice,
                        ]}
                      >
                        <Text
                          style={[
                            styles.choiceText,
                            selected && styles.selectedChoiceText,
                          ]}
                        >
                          {choice === 'bought' ? 'Bought' : 'Gift'}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>
              {acquisitionType === 'bought' ? (
                <FormField
                  keyboardType="decimal-pad"
                  label="Price (₱)"
                  onChangeText={setPrice}
                  placeholder="0.00"
                  value={price}
                />
              ) : null}
              <FormField
                autoCapitalize="none"
                label={acquisitionType === 'gifted' ? 'Gift date' : 'Purchase date'}
                onChangeText={setAcquiredOn}
                placeholder="YYYY-MM-DD"
                value={acquiredOn}
              />
              <FormField
                keyboardType="decimal-pad"
                label="Initial progress (%)"
                onChangeText={setProgress}
                placeholder="0"
                value={progress}
              />

              {error ? (
                <Text accessibilityRole="alert" style={styles.error}>
                  {error}
                </Text>
              ) : null}
              <View style={styles.actions}>
                <Pressable
                  disabled={saving}
                  onPress={onClose}
                  style={[styles.actionButton, styles.dismissButton]}
                >
                  <Text style={styles.dismissText}>Close</Text>
                </Pressable>
                <Pressable
                  accessibilityRole="button"
                  disabled={saving}
                  onPress={() => void submit()}
                  style={[styles.actionButton, styles.saveButton, saving && styles.disabled]}
                >
                  {saving ? (
                    <ActivityIndicator color={colors.cream} />
                  ) : (
                    <Text style={styles.saveText}>Save product</Text>
                  )}
                </Pressable>
              </View>
            </ScrollView>
          </SafeAreaView>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(35, 18, 18, 0.45)',
  },
  keyboardArea: {
    justifyContent: 'flex-end',
    maxHeight: '94%',
  },
  sheet: {
    overflow: 'hidden',
    paddingTop: spacing.lg,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.cream,
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
  },
  heading: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  title: {
    color: colors.burgundy,
    fontSize: 21,
    fontWeight: '700',
  },
  subtitle: {
    color: colors.mutedText,
    fontSize: 13,
    marginTop: 3,
  },
  closeButton: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 19,
    backgroundColor: '#F0E4DA',
  },
  form: {
    paddingBottom: spacing.md,
  },
  field: {
    marginBottom: spacing.sm,
  },
  fieldLabel: {
    color: colors.text,
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 5,
  },
  input: {
    minHeight: 44,
    paddingHorizontal: 12,
    paddingVertical: 9,
    color: colors.text,
    backgroundColor: colors.warmWhite,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 11,
    fontSize: 14,
  },
  choiceRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  choice: {
    flex: 1,
    minHeight: 42,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.warmWhite,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 11,
  },
  selectedChoice: {
    backgroundColor: '#F4E0E1',
    borderColor: colors.burgundy,
  },
  choiceText: {
    color: colors.mutedText,
    fontSize: 13,
    fontWeight: '600',
  },
  selectedChoiceText: {
    color: colors.burgundy,
  },
  error: {
    color: colors.burgundy,
    fontSize: 13,
    marginBottom: spacing.sm,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  actionButton: {
    minHeight: 48,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
  },
  dismissButton: {
    backgroundColor: '#EDE2D8',
  },
  dismissText: {
    color: colors.burgundy,
    fontSize: 14,
    fontWeight: '700',
  },
  saveButton: {
    backgroundColor: colors.burgundy,
  },
  saveText: {
    color: colors.cream,
    fontSize: 14,
    fontWeight: '700',
  },
  disabled: {
    opacity: 0.7,
  },
});
