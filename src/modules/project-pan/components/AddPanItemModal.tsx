import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  type StyleProp,
  type TextInputProps,
  type ViewStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing } from '../../../shared/ui/theme';
import { PRODUCT_CATEGORIES } from '../categories';
import { ProgressSlider } from './ProgressSlider';
import type { NewPanItemInput } from '../services/panService';

interface AddPanItemModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (input: NewPanItemInput) => Promise<void>;
}

interface FormFieldProps extends TextInputProps {
  label: string;
  required?: boolean;
  error?: string;
  shakeValue?: Animated.Value;
  containerStyle?: StyleProp<ViewStyle>;
}

function FormField({
  label,
  required = false,
  error,
  shakeValue,
  containerStyle,
  ...inputProps
}: FormFieldProps) {
  return (
    <View style={[styles.field, containerStyle]}>
      <Text style={styles.fieldLabel}>
        {label}
        {required ? <Text style={styles.requiredMark}>*</Text> : null}
      </Text>
      <Animated.View
        style={[
          shakeValue ? { transform: [{ translateX: shakeValue }] } : undefined,
        ]}
      >
        <TextInput
          placeholderTextColor={colors.mutedText}
          style={[styles.input, error ? styles.invalidInput : undefined]}
          {...inputProps}
        />
      </Animated.View>
      {error ? <Text style={styles.fieldError}>{error}</Text> : null}
    </View>
  );
}

function getToday(): string {
  const today = new Date();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${today.getFullYear()}-${month}-${day}`;
}

function parseDate(value: string): Date {
  const [year, month, day] = value.split('-').map(Number);
  return new Date(year, month - 1, day);
}

function formatDate(value: string): string {
  return parseDate(value).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function getCalendarCells(month: Date): Array<number | null> {
  const year = month.getFullYear();
  const monthIndex = month.getMonth();
  const leadingDays = new Date(year, monthIndex, 1).getDay();
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
  const trailingDays = 42 - leadingDays - daysInMonth;

  return [
    ...Array<number | null>(leadingDays).fill(null),
    ...Array.from({ length: daysInMonth }, (_, index) => index + 1),
    ...Array<number | null>(trailingDays).fill(null),
  ];
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
  const [categoryPickerVisible, setCategoryPickerVisible] = useState(false);
  const [datePickerVisible, setDatePickerVisible] = useState(false);
  const [calendarSelectionMode, setCalendarSelectionMode] = useState<
    'days' | 'month' | 'year'
  >('days');
  const [calendarMonth, setCalendarMonth] = useState(() => {
    const [year, month] = getToday().split('-').map(Number);
    return new Date(year, month - 1, 1);
  });
  const [customCategoryMode, setCustomCategoryMode] = useState(false);
  const [customCategory, setCustomCategory] = useState('');
  const [price, setPrice] = useState('');
  const [acquisitionType, setAcquisitionType] =
    useState<NewPanItemInput['acquisition_type']>('bought');
  const [acquiredOn, setAcquiredOn] = useState(getToday);
  const [dateYear, setDateYear] = useState(() => getToday().slice(0, 4));
  const [dateMonth, setDateMonth] = useState(() => getToday().slice(5, 7));
  const [dateDay, setDateDay] = useState(() => getToday().slice(8, 10));
  const [progress, setProgress] = useState(0);
  const [saving, setSaving] = useState(false);
  const [cancelConfirmationVisible, setCancelConfirmationVisible] =
    useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{
    name?: string;
    brand?: string;
    category?: string;
    price?: string;
  }>({});
  const nameShake = useRef(new Animated.Value(0)).current;
  const brandShake = useRef(new Animated.Value(0)).current;
  const categoryShake = useRef(new Animated.Value(0)).current;
  const priceShake = useRef(new Animated.Value(0)).current;

  function resetForm() {
    setName('');
    setBrand('');
    setVariant('');
    setCategory('');
    setCategoryPickerVisible(false);
    setDatePickerVisible(false);
    setCalendarSelectionMode('days');
    setCustomCategoryMode(false);
    setCustomCategory('');
    setPrice('');
    setAcquisitionType('bought');
    setAcquiredOn(getToday());
    setDateYear(getToday().slice(0, 4));
    setDateMonth(getToday().slice(5, 7));
    setDateDay(getToday().slice(8, 10));
    const today = new Date();
    setCalendarMonth(new Date(today.getFullYear(), today.getMonth(), 1));
    setProgress(0);
    setError(null);
    setFieldErrors({});
    nameShake.setValue(0);
    brandShake.setValue(0);
    categoryShake.setValue(0);
    priceShake.setValue(0);
  }

  useEffect(() => {
    if (!visible) return;
    resetForm();
  }, [visible]);

  function selectCategory(value: string) {
    setCategory(value);
    setFieldErrors((current) => ({ ...current, category: undefined }));
    setCategoryPickerVisible(false);
    setCustomCategoryMode(false);
    setCustomCategory('');
    setError(null);
  }

  function openDatePicker() {
    const selectedDate = parseDate(acquiredOn);
    setDateYear(acquiredOn.slice(0, 4));
    setDateMonth(acquiredOn.slice(5, 7));
    setDateDay(acquiredOn.slice(8, 10));
    setCalendarMonth(
      new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1),
    );
    setCalendarSelectionMode('days');
    setDatePickerVisible(true);
  }

  function changeCalendarMonth(offset: number) {
    setCalendarMonth(
      (current) =>
        new Date(current.getFullYear(), current.getMonth() + offset, 1),
    );
  }

  function selectCalendarMonth(month: number) {
    setCalendarMonth(
      (current) => new Date(current.getFullYear(), month, 1),
    );
    setCalendarSelectionMode('days');
  }

  function selectCalendarYear(year: number) {
    setCalendarMonth(
      (current) => new Date(year, current.getMonth(), 1),
    );
    setCalendarSelectionMode('days');
  }

  function selectDate(day: number) {
    useCalendarDateParts(
      calendarMonth.getFullYear(),
      calendarMonth.getMonth() + 1,
      day,
    );
  }

  function useCalendarDateParts(year: number, month: number, day: number) {
    const selected = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    setDateYear(String(year));
    setDateMonth(String(month).padStart(2, '0'));
    setDateDay(String(day).padStart(2, '0'));
    const date = parseDate(selected);
    setCalendarMonth(new Date(date.getFullYear(), date.getMonth(), 1));
  }

  function changeDatePart(part: 'year' | 'month' | 'day', value: string) {
    const digits = value.replace(/\D/g, '');
    const limits = { year: 4, month: 2, day: 2 };
    const nextValue = digits.slice(0, limits[part]);
    const nextParts = {
      year: dateYear,
      month: dateMonth,
      day: dateDay,
      [part]: nextValue,
    };
    setDateYear(nextParts.year);
    setDateMonth(nextParts.month);
    setDateDay(nextParts.day);

    if (nextParts.year.length !== 4 || !nextParts.month || !nextParts.day) {
      return;
    }
    const candidate = `${nextParts.year}-${nextParts.month.padStart(2, '0')}-${nextParts.day.padStart(2, '0')}`;
    if (!isValidDate(candidate)) return;
    const date = parseDate(candidate);
    setCalendarMonth(new Date(date.getFullYear(), date.getMonth(), 1));
    setCalendarSelectionMode('days');
  }

  function useToday() {
    const today = new Date();
    setDateYear(String(today.getFullYear()));
    setDateMonth(String(today.getMonth() + 1).padStart(2, '0'));
    setDateDay(String(today.getDate()).padStart(2, '0'));
    setCalendarMonth(new Date(today.getFullYear(), today.getMonth(), 1));
    setCalendarSelectionMode('days');
  }

  function confirmDateInput() {
    if (!isValidDate(dateInput)) return;
    setAcquiredOn(dateInput);
    setDatePickerVisible(false);
  }

  function cancelDatePicker() {
    setCalendarSelectionMode('days');
    setDateYear(acquiredOn.slice(0, 4));
    setDateMonth(acquiredOn.slice(5, 7));
    setDateDay(acquiredOn.slice(8, 10));
    setDatePickerVisible(false);
  }

  function shakeInvalidFields(fields: Array<Animated.Value>) {
    const animations = fields.map((value) => {
      value.setValue(0);
      return Animated.sequence([
        Animated.timing(value, {
          toValue: -10,
          duration: 45,
          useNativeDriver: true,
        }),
        Animated.timing(value, {
          toValue: 10,
          duration: 45,
          useNativeDriver: true,
        }),
        Animated.timing(value, {
          toValue: -8,
          duration: 45,
          useNativeDriver: true,
        }),
        Animated.timing(value, {
          toValue: 8,
          duration: 45,
          useNativeDriver: true,
        }),
        Animated.timing(value, {
          toValue: -4,
          duration: 45,
          useNativeDriver: true,
        }),
        Animated.timing(value, {
          toValue: 4,
          duration: 45,
          useNativeDriver: true,
        }),
        Animated.timing(value, {
          toValue: 0,
          duration: 45,
          useNativeDriver: true,
        }),
      ]);
    });
    Animated.parallel(animations).start();
  }

  function hasUnsavedChanges() {
    return Boolean(
      name.trim() ||
        brand.trim() ||
        variant.trim() ||
        category ||
        customCategory.trim() ||
        price.trim() ||
        acquisitionType !== 'bought' ||
        acquiredOn !== getToday() ||
        progress !== 0,
    );
  }

  function cancelForm() {
    if (saving) return;
    if (!hasUnsavedChanges()) {
      resetForm();
      onClose();
      return;
    }

    setCancelConfirmationVisible(true);
  }

  function discardForm() {
    setCancelConfirmationVisible(false);
    resetForm();
    onClose();
  }

  async function submit() {
    if (saving) return;
    const normalizedName = name.trim();
    const normalizedBrand = brand.trim();
    const normalizedCategory = category.trim();
    const parsedProgress = progress;
    const parsedPrice = Number(price);

    const nextFieldErrors = {
      ...(!normalizedName ? { name: 'Product name is required' } : {}),
      ...(!normalizedBrand ? { brand: 'Brand is required' } : {}),
      ...(!normalizedCategory ? { category: 'Category is required' } : {}),
      ...(acquisitionType === 'bought' &&
      (!price.trim() || !Number.isFinite(parsedPrice) || parsedPrice < 0)
        ? { price: 'Enter a valid price' }
        : {}),
    };
    setFieldErrors(nextFieldErrors);

    if (Object.keys(nextFieldErrors).length > 0) {
      const invalidFields = [
        nextFieldErrors.name ? nameShake : null,
        nextFieldErrors.brand ? brandShake : null,
        nextFieldErrors.category ? categoryShake : null,
        nextFieldErrors.price ? priceShake : null,
      ].filter((field): field is Animated.Value => field !== null);
      shakeInvalidFields(invalidFields);
      return;
    }
    if (!isValidDate(acquiredOn)) {
      setError('Enter a valid date in YYYY-MM-DD format.');
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

  const calendarCells = getCalendarCells(calendarMonth);
  const dateInput =
    dateYear.length === 4 && dateMonth.length > 0 && dateDay.length > 0
      ? `${dateYear}-${dateMonth.padStart(2, '0')}-${dateDay.padStart(2, '0')}`
      : '';
  const hasDateInput = Boolean(dateYear || dateMonth || dateDay);
  const hasValidDateInput = Boolean(dateInput) && isValidDate(dateInput);
  const selectedDate = parseDate(
    dateInput && isValidDate(dateInput) ? dateInput : acquiredOn,
  );
  const monthLabel = calendarMonth.toLocaleDateString(undefined, {
    month: 'long',
  });
  const yearLabel = String(calendarMonth.getFullYear());
  const firstYear = Math.max(1900, calendarMonth.getFullYear() - 50);
  const calendarYears = Array.from(
    { length: 101 },
    (_, index) => firstYear + index,
  );

  return (
    <Modal
      animationType="slide"
      onRequestClose={() => {
        if (cancelConfirmationVisible) {
          setCancelConfirmationVisible(false);
          return;
        }
        cancelForm();
      }}
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
                onPress={cancelForm}
                style={styles.closeButton}
              >
                <Ionicons color={colors.burgundy} name="close" size={23} />
              </Pressable>
            </View>
            <ScrollView
              style={styles.formScroll}
              contentContainerStyle={styles.form}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.compactRow}>
                <FormField
                  autoCapitalize="words"
                  containerStyle={styles.compactField}
                  label="Product name"
                  required
                  error={fieldErrors.name}
                  shakeValue={nameShake}
                  onChangeText={(value) => {
                    setName(value);
                    if (value.trim()) {
                      setFieldErrors((current) => ({
                        ...current,
                        name: undefined,
                      }));
                    }
                  }}
                  placeholder="e.g. Lipstick"
                  value={name}
                />
                <FormField
                  autoCapitalize="words"
                  containerStyle={styles.compactField}
                  label="Brand"
                  required
                  error={fieldErrors.brand}
                  shakeValue={brandShake}
                  onChangeText={(value) => {
                    setBrand(value);
                    if (value.trim()) {
                      setFieldErrors((current) => ({
                        ...current,
                        brand: undefined,
                      }));
                    }
                  }}
                  placeholder="Brand name"
                  value={brand}
                />
              </View>
              <View style={styles.compactRow}>
                <FormField
                  autoCapitalize="words"
                  containerStyle={styles.compactField}
                  label="Variant (optional)"
                  onChangeText={setVariant}
                  placeholder="Shade or finish"
                  value={variant}
                />
                <View style={[styles.field, styles.compactField]}>
                  <Text style={styles.fieldLabel}>
                    Category<Text style={styles.requiredMark}>*</Text>
                  </Text>
                  <Animated.View
                    style={{ transform: [{ translateX: categoryShake }] }}
                  >
                    <Pressable
                      accessibilityLabel={
                        category ? `Category: ${category}` : 'Select category'
                      }
                      accessibilityRole="button"
                      onPress={() => {
                        setCustomCategoryMode(false);
                        setCustomCategory('');
                        setCategoryPickerVisible(true);
                      }}
                      style={[
                        styles.categorySelector,
                        fieldErrors.category && styles.invalidInput,
                      ]}
                    >
                      <Text
                        numberOfLines={1}
                        style={[
                          styles.categorySelectorText,
                          !category && styles.categoryPlaceholder,
                        ]}
                      >
                        {category || 'Select Category'}
                      </Text>
                      <Ionicons
                        color={colors.burgundy}
                        name="chevron-down"
                        size={18}
                      />
                    </Pressable>
                  </Animated.View>
                  {fieldErrors.category ? (
                    <Text style={styles.fieldError}>
                      {fieldErrors.category}
                    </Text>
                  ) : null}
                </View>
              </View>

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
                <View style={styles.purchaseRow}>
                  <View style={[styles.field, styles.purchaseColumn]}>
                    <Text style={styles.fieldLabel}>
                      Price (₱)
                      {acquisitionType === 'bought' ? (
                        <Text style={styles.requiredMark}>*</Text>
                      ) : null}
                    </Text>
                    <Animated.View
                      style={{ transform: [{ translateX: priceShake }] }}
                    >
                      <TextInput
                        keyboardType="decimal-pad"
                        onChangeText={(value) => {
                          setPrice(value);
                          if (
                            value.trim() &&
                            Number.isFinite(Number(value)) &&
                            Number(value) >= 0
                          ) {
                            setFieldErrors((current) => ({
                              ...current,
                              price: undefined,
                            }));
                          }
                        }}
                        placeholder="0.00"
                        placeholderTextColor={colors.mutedText}
                        style={[
                          styles.input,
                          fieldErrors.price && styles.invalidInput,
                        ]}
                        value={price}
                      />
                    </Animated.View>
                    {fieldErrors.price ? (
                      <Text style={styles.fieldError}>{fieldErrors.price}</Text>
                    ) : null}
                  </View>
                  <View style={[styles.field, styles.purchaseColumn]}>
                    <Text style={styles.fieldLabel}>Purchase date</Text>
                    <Pressable
                      accessibilityLabel={`Purchase date: ${formatDate(acquiredOn)}`}
                      accessibilityRole="button"
                      onPress={openDatePicker}
                      style={styles.dateSelector}
                    >
                      <Text numberOfLines={1} style={styles.dateSelectorText}>
                        {formatDate(acquiredOn)}
                      </Text>
                      <Ionicons
                        color={colors.burgundy}
                        name="calendar-outline"
                        size={18}
                      />
                    </Pressable>
                  </View>
                </View>
              ) : (
                <View style={styles.field}>
                  <Text style={styles.fieldLabel}>Gift date</Text>
                  <Pressable
                    accessibilityLabel={`Gift date: ${formatDate(acquiredOn)}`}
                    accessibilityRole="button"
                    onPress={openDatePicker}
                    style={styles.dateSelector}
                  >
                    <Text numberOfLines={1} style={styles.dateSelectorText}>
                      {formatDate(acquiredOn)}
                    </Text>
                    <Ionicons
                      color={colors.burgundy}
                      name="calendar-outline"
                      size={18}
                    />
                  </Pressable>
                </View>
              )}
              <View style={styles.field}>
                <View style={styles.progressCard}>
                  <View style={styles.progressHeading}>
                    <View style={styles.progressTitleGroup}>
                      <View style={styles.progressIcon}>
                        <Ionicons
                          color={colors.burgundy}
                          name="pie-chart-outline"
                          size={17}
                        />
                      </View>
                      <View>
                        <Text style={styles.progressTitle}>
                          Initial progress
                        </Text>
                        <Text style={styles.progressHint}>
                          How much have you used?
                        </Text>
                      </View>
                    </View>
                    <View style={styles.progressBadge}>
                      <Text style={styles.progressValue}>{progress}%</Text>
                    </View>
                  </View>
                  <ProgressSlider
                    onValueChange={setProgress}
                    value={progress}
                  />
                  <View style={styles.progressLabels}>
                    {[0, 25, 50, 75, 100].map((value) => (
                      <Text
                        key={value}
                        style={[
                          styles.progressEndpoint,
                          progress === value && styles.activeProgressEndpoint,
                        ]}
                      >
                        {value}%
                      </Text>
                    ))}
                  </View>
                </View>
              </View>

              {error ? (
                <Text accessibilityRole="alert" style={styles.error}>
                  {error}
                </Text>
              ) : null}
              <View style={styles.actions}>
                <Pressable
                  disabled={saving}
                  onPress={cancelForm}
                  style={[styles.actionButton, styles.dismissButton]}
                >
                  <Text style={styles.dismissText}>Cancel</Text>
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
        <Modal
          animationType="slide"
          onRequestClose={() => setCategoryPickerVisible(false)}
          transparent
          visible={categoryPickerVisible}
        >
          <View style={styles.categoryOverlay}>
            <View style={styles.categorySheet}>
              <View style={styles.categoryHeading}>
                <View>
                  <Text style={styles.categoryTitle}>Choose a category</Text>
                  <Text style={styles.categorySubtitle}>
                    Select a product type or add your own.
                  </Text>
                </View>
                <Pressable
                  accessibilityLabel="Close category selector"
                  accessibilityRole="button"
                  onPress={() => setCategoryPickerVisible(false)}
                  style={styles.closeButton}
                >
                  <Ionicons color={colors.burgundy} name="close" size={23} />
                </Pressable>
              </View>
              <ScrollView
                contentContainerStyle={styles.categoryList}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
              >
                {PRODUCT_CATEGORIES.map((group) => (
                  <View key={group.title} style={styles.categoryGroup}>
                    <Text style={styles.categoryGroupTitle}>{group.title}</Text>
                    <View style={styles.categoryOptions}>
                      {group.options.map((option) => {
                        const selected = category === option;
                        return (
                          <Pressable
                            accessibilityRole="radio"
                            accessibilityState={{ checked: selected }}
                            key={option}
                            onPress={() => selectCategory(option)}
                            style={[
                              styles.categoryOption,
                              selected && styles.selectedCategoryOption,
                            ]}
                          >
                            <Text
                              style={[
                                styles.categoryOptionText,
                                selected && styles.selectedCategoryOptionText,
                              ]}
                            >
                              {option}
                            </Text>
                          </Pressable>
                        );
                      })}
                    </View>
                  </View>
                ))}
                <View style={styles.customCategorySection}>
                  <Text style={styles.categoryGroupTitle}>Custom</Text>
                  {!customCategoryMode ? (
                    <Pressable
                      accessibilityRole="button"
                      onPress={() => setCustomCategoryMode(true)}
                      style={styles.customCategoryOption}
                    >
                      <Ionicons
                        color={colors.burgundy}
                        name="add"
                        size={18}
                      />
                      <Text style={styles.customCategoryOptionText}>
                        Custom Category
                      </Text>
                    </Pressable>
                  ) : (
                    <>
                      <TextInput
                        accessibilityLabel="Custom category name"
                        autoCapitalize="words"
                        onChangeText={setCustomCategory}
                        placeholder="Enter a custom category"
                        placeholderTextColor={colors.mutedText}
                        returnKeyType="done"
                        style={styles.input}
                        value={customCategory}
                      />
                      <Pressable
                        accessibilityRole="button"
                        disabled={!customCategory.trim()}
                        onPress={() => selectCategory(customCategory.trim())}
                        style={[
                          styles.customCategoryButton,
                          !customCategory.trim() && styles.disabled,
                        ]}
                      >
                        <Text style={styles.customCategoryButtonText}>
                          Use Custom Category
                        </Text>
                      </Pressable>
                    </>
                  )}
                </View>
              </ScrollView>
            </View>
          </View>
        </Modal>
        <Modal
          animationType="slide"
          onRequestClose={cancelDatePicker}
          transparent
          visible={datePickerVisible}
        >
          <View style={styles.calendarOverlay}>
            <KeyboardAvoidingView
              behavior={Platform.OS === 'ios' ? 'padding' : undefined}
              style={styles.calendarKeyboardArea}
            >
              <SafeAreaView edges={['bottom']} style={styles.calendarSheet}>
              <View style={styles.calendarHeader}>
                <View>
                  <Text style={styles.calendarTitle}>
                    {acquisitionType === 'gifted' ? 'Gift date' : 'Purchase date'}
                  </Text>
                  <Text style={styles.calendarSelectedDate}>
                    {hasValidDateInput
                      ? formatDate(dateInput)
                      : 'Choose a date'}
                  </Text>
                </View>
                <Pressable
                  accessibilityLabel="Cancel date selection"
                  accessibilityRole="button"
                  onPress={cancelDatePicker}
                  style={styles.closeButton}
                >
                  <Ionicons color={colors.burgundy} name="close" size={23} />
                </Pressable>
              </View>
              <View style={styles.dateEntryCard}>
                <View style={styles.dateEntryHeading}>
                  <Ionicons
                    color={colors.burgundy}
                    name="create-outline"
                    size={17}
                  />
                  <Text style={styles.dateEntryLabel}>Or enter a date</Text>
                  <Pressable
                    accessibilityRole="button"
                    onPress={useToday}
                    style={styles.todayButton}
                  >
                    <Text style={styles.todayButtonText}>Today</Text>
                  </Pressable>
                </View>
                <View style={styles.dateEntryFields}>
                  <View style={[styles.datePartField, styles.dateYearField]}>
                    <Text style={styles.datePartLabel}>Year</Text>
                    <TextInput
                      accessibilityLabel="Year"
                      autoCapitalize="none"
                      autoCorrect={false}
                      keyboardType="number-pad"
                      maxLength={4}
                      onChangeText={(value) => changeDatePart('year', value)}
                      placeholder="YYYY"
                      placeholderTextColor={colors.mutedText}
                      returnKeyType="next"
                      selectTextOnFocus
                      style={[
                        styles.datePartInput,
                        hasDateInput &&
                          dateYear.length > 0 &&
                          dateYear.length !== 4 &&
                          styles.invalidDateEntryInput,
                      ]}
                      value={dateYear}
                    />
                  </View>
                  <Text style={styles.datePartSeparator}>/</Text>
                  <View style={styles.datePartField}>
                    <Text style={styles.datePartLabel}>Month</Text>
                    <TextInput
                      accessibilityLabel="Month, 1 to 12"
                      autoCapitalize="none"
                      autoCorrect={false}
                      keyboardType="number-pad"
                      maxLength={2}
                      onChangeText={(value) => changeDatePart('month', value)}
                      placeholder="MM"
                      placeholderTextColor={colors.mutedText}
                      returnKeyType="next"
                      selectTextOnFocus
                      style={[
                        styles.datePartInput,
                        dateMonth.length > 0 &&
                          (Number(dateMonth) < 1 || Number(dateMonth) > 12) &&
                          styles.invalidDateEntryInput,
                      ]}
                      value={dateMonth}
                    />
                  </View>
                  <Text style={styles.datePartSeparator}>/</Text>
                  <View style={styles.datePartField}>
                    <Text style={styles.datePartLabel}>Day</Text>
                    <TextInput
                      accessibilityLabel="Day"
                      autoCapitalize="none"
                      autoCorrect={false}
                      keyboardType="number-pad"
                      maxLength={2}
                      onChangeText={(value) => changeDatePart('day', value)}
                      placeholder="DD"
                      placeholderTextColor={colors.mutedText}
                      returnKeyType="done"
                      selectTextOnFocus
                      style={[
                        styles.datePartInput,
                        dateInput.length > 0 &&
                          !hasValidDateInput &&
                          styles.invalidDateEntryInput,
                      ]}
                      value={dateDay}
                    />
                  </View>
                </View>
                <Text
                  style={[
                    styles.dateEntryHint,
                    hasDateInput &&
                      dateInput.length > 0 &&
                      !hasValidDateInput &&
                      styles.invalidDateEntryHint,
                  ]}
                >
                  {hasDateInput &&
                  dateInput.length > 0 &&
                  !hasValidDateInput
                    ? 'Check the year, month, and day.'
                    : 'Enter a date above or select a day below.'}
                </Text>
              </View>
              <View style={styles.calendarMonthRow}>
                {calendarSelectionMode === 'days' ? (
                  <>
                    <Pressable
                      accessibilityLabel="Previous month"
                      accessibilityRole="button"
                      onPress={() => changeCalendarMonth(-1)}
                      style={styles.calendarArrow}
                    >
                      <Ionicons
                        color={colors.burgundy}
                        name="chevron-back"
                        size={20}
                      />
                    </Pressable>
                    <View style={styles.calendarDateSelectors}>
                      <Pressable
                        accessibilityLabel={`Choose month, ${monthLabel}`}
                        accessibilityRole="button"
                        onPress={() => setCalendarSelectionMode('month')}
                        style={styles.calendarDateSelector}
                      >
                        <Text style={styles.calendarMonth}>{monthLabel}</Text>
                        <Ionicons
                          color={colors.burgundy}
                          name="chevron-down"
                          size={14}
                        />
                      </Pressable>
                      <Pressable
                        accessibilityLabel={`Choose year, ${yearLabel}`}
                        accessibilityRole="button"
                        onPress={() => setCalendarSelectionMode('year')}
                        style={styles.calendarDateSelector}
                      >
                        <Text style={styles.calendarMonth}>{yearLabel}</Text>
                        <Ionicons
                          color={colors.burgundy}
                          name="chevron-down"
                          size={14}
                        />
                      </Pressable>
                    </View>
                    <Pressable
                      accessibilityLabel="Next month"
                      accessibilityRole="button"
                      onPress={() => changeCalendarMonth(1)}
                      style={styles.calendarArrow}
                    >
                      <Ionicons
                        color={colors.burgundy}
                        name="chevron-forward"
                        size={20}
                      />
                    </Pressable>
                  </>
                ) : (
                  <>
                    <Pressable
                      accessibilityLabel="Back to calendar"
                      accessibilityRole="button"
                      onPress={() => setCalendarSelectionMode('days')}
                      style={styles.calendarArrow}
                    >
                      <Ionicons
                        color={colors.burgundy}
                        name="chevron-back"
                        size={20}
                      />
                    </Pressable>
                    <Text style={styles.calendarMonth}>
                      {calendarSelectionMode === 'month'
                        ? yearLabel
                        : 'Choose year'}
                    </Text>
                    <Pressable
                      accessibilityLabel="Back to calendar"
                      accessibilityRole="button"
                      onPress={() => setCalendarSelectionMode('days')}
                      style={styles.calendarArrow}
                    >
                      <Ionicons
                        color={colors.burgundy}
                        name="close"
                        size={20}
                      />
                    </Pressable>
                  </>
                )}
              </View>
              {calendarSelectionMode === 'month' ? (
                <View style={styles.calendarChoiceGrid}>
                  {Array.from({ length: 12 }, (_, month) => {
                    const selected =
                      calendarMonth.getMonth() === month;
                    const label = new Date(
                      calendarMonth.getFullYear(),
                      month,
                      1,
                    ).toLocaleDateString(undefined, { month: 'long' });
                    return (
                      <Pressable
                        accessibilityRole="button"
                        accessibilityState={{ selected }}
                        key={month}
                        onPress={() => selectCalendarMonth(month)}
                        style={[
                          styles.calendarChoice,
                          selected && styles.selectedCalendarChoice,
                        ]}
                      >
                        <Text
                          style={[
                            styles.calendarChoiceText,
                            selected && styles.selectedCalendarChoiceText,
                          ]}
                        >
                          {label}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              ) : calendarSelectionMode === 'year' ? (
                <ScrollView
                  contentContainerStyle={styles.calendarYearGrid}
                  showsVerticalScrollIndicator={false}
                >
                  {calendarYears.map((year) => {
                    const selected = calendarMonth.getFullYear() === year;
                    return (
                      <Pressable
                        accessibilityRole="button"
                        accessibilityState={{ selected }}
                        key={year}
                        onPress={() => selectCalendarYear(year)}
                        style={[
                          styles.calendarYearChoice,
                          selected && styles.selectedCalendarChoice,
                        ]}
                      >
                        <Text
                          style={[
                            styles.calendarChoiceText,
                            selected && styles.selectedCalendarChoiceText,
                          ]}
                        >
                          {year}
                        </Text>
                      </Pressable>
                    );
                  })}
                </ScrollView>
              ) : (
                <View style={styles.calendarGrid}>
                  {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => (
                    <Text
                      key={`${day}-${index}`}
                      style={styles.calendarWeekday}
                    >
                      {day}
                    </Text>
                  ))}
                  {calendarCells.map((day, index) => {
                  if (day === null) {
                    return (
                      <View
                        key={`empty-${index}`}
                        style={styles.calendarDay}
                      />
                    );
                  }

                  const isSelected =
                    selectedDate.getFullYear() === calendarMonth.getFullYear() &&
                    selectedDate.getMonth() === calendarMonth.getMonth() &&
                    selectedDate.getDate() === day;
                  const isToday =
                    new Date().getFullYear() === calendarMonth.getFullYear() &&
                    new Date().getMonth() === calendarMonth.getMonth() &&
                    new Date().getDate() === day;

                    return (
                      <Pressable
                        accessibilityLabel={`${monthLabel} ${day}, ${yearLabel}`}
                        accessibilityRole="button"
                        accessibilityState={{ selected: isSelected }}
                        key={`day-${day}`}
                        onPress={() => selectDate(day)}
                        style={[
                          styles.calendarDay,
                          isToday && styles.todayCalendarDay,
                          isSelected && styles.selectedCalendarDay,
                        ]}
                      >
                        <Text
                          style={[
                            styles.calendarDayText,
                            isToday && styles.todayCalendarDayText,
                            isSelected && styles.selectedCalendarDayText,
                          ]}
                        >
                          {day}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              )}
              <View style={styles.calendarActions}>
                <Pressable
                  accessibilityRole="button"
                  onPress={cancelDatePicker}
                  style={[styles.calendarAction, styles.calendarCancelAction]}
                >
                  <Text style={styles.calendarCancelText}>Cancel</Text>
                </Pressable>
                <Pressable
                  accessibilityRole="button"
                  disabled={!hasValidDateInput}
                  onPress={confirmDateInput}
                  style={[
                    styles.calendarAction,
                    styles.calendarConfirmAction,
                    !hasValidDateInput && styles.disabled,
                  ]}
                >
                  <Text style={styles.calendarConfirmText}>Confirm date</Text>
                </Pressable>
              </View>
              </SafeAreaView>
            </KeyboardAvoidingView>
          </View>
        </Modal>
        {cancelConfirmationVisible ? (
          <View style={styles.confirmationOverlay}>
            <View
              accessibilityViewIsModal
              style={styles.confirmationDialog}
            >
              <View style={styles.confirmationIcon}>
                <Ionicons
                  color={colors.burgundy}
                  name="alert-circle-outline"
                  size={27}
                />
              </View>
              <Text style={styles.confirmationTitle}>
                Cancel Product Setup
              </Text>
              <Text style={styles.confirmationMessage}>
                Are you sure you want to cancel? All details will not be saved.
              </Text>
              <View style={styles.confirmationActions}>
                <Pressable
                  accessibilityRole="button"
                  onPress={() => setCancelConfirmationVisible(false)}
                  style={[
                    styles.confirmationButton,
                    styles.keepEditingButton,
                  ]}
                >
                  <Text style={styles.keepEditingText}>Keep Editing</Text>
                </Pressable>
                <Pressable
                  accessibilityRole="button"
                  onPress={discardForm}
                  style={[
                    styles.confirmationButton,
                    styles.discardButton,
                  ]}
                >
                  <Text style={styles.discardText}>Discard / Cancel</Text>
                </Pressable>
              </View>
            </View>
          </View>
        ) : null}
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
  confirmationOverlay: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    backgroundColor: 'rgba(35, 18, 18, 0.58)',
    zIndex: 10,
  },
  confirmationDialog: {
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
    padding: spacing.lg,
    backgroundColor: colors.cream,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 24,
    shadowColor: '#241010',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 12,
  },
  confirmationIcon: {
    width: 56,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
    backgroundColor: '#F4E5E3',
    borderRadius: 28,
  },
  confirmationTitle: {
    color: colors.burgundy,
    fontSize: 19,
    fontWeight: '700',
    textAlign: 'center',
  },
  confirmationMessage: {
    color: colors.mutedText,
    fontSize: 14,
    lineHeight: 21,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
  confirmationActions: {
    width: '100%',
    gap: spacing.sm,
    marginTop: spacing.lg,
  },
  confirmationButton: {
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
  },
  keepEditingButton: {
    backgroundColor: colors.burgundy,
  },
  keepEditingText: {
    color: colors.cream,
    fontSize: 14,
    fontWeight: '700',
  },
  discardButton: {
    backgroundColor: '#F4E5E3',
    borderColor: '#E8C9CB',
    borderWidth: 1,
  },
  discardText: {
    color: colors.burgundy,
    fontSize: 14,
    fontWeight: '700',
  },
  keyboardArea: {
    justifyContent: 'flex-end',
    maxHeight: '92%',
  },
  sheet: {
    overflow: 'hidden',
    paddingTop: spacing.lg,
    paddingHorizontal: spacing.lg,
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
  formScroll: {
    flexShrink: 1,
  },
  compactRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  field: {
    marginBottom: spacing.sm,
  },
  compactField: {
    flex: 1,
    minWidth: 0,
  },
  purchaseRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  purchaseColumn: {
    flex: 1,
    minWidth: 0,
  },
  fieldLabel: {
    color: colors.text,
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 5,
  },
  requiredMark: {
    color: '#FF4D4D',
    fontWeight: '700',
  },
  fieldError: {
    color: '#FF4D4D',
    fontSize: 11,
    marginTop: 4,
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
  invalidInput: {
    borderColor: '#FF4D4D',
    borderWidth: 1.5,
  },
  dateSelector: {
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.xs,
    paddingHorizontal: 12,
    backgroundColor: colors.warmWhite,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 11,
  },
  dateSelectorText: {
    flexShrink: 1,
    color: colors.text,
    fontSize: 12,
  },
  calendarOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(35, 18, 18, 0.45)',
  },
  calendarKeyboardArea: {
    justifyContent: 'flex-end',
  },
  calendarSheet: {
    minHeight: Dimensions.get('window').height * 0.7,
    maxHeight: Dimensions.get('window').height * 0.9,
    justifyContent: 'space-between',
    paddingTop: spacing.lg,
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.xl + 8,
    backgroundColor: colors.cream,
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
  },
  calendarHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  calendarTitle: {
    color: colors.burgundy,
    fontSize: 19,
    fontWeight: '700',
  },
  calendarSelectedDate: {
    color: colors.mutedText,
    fontSize: 13,
    marginTop: 3,
  },
  dateEntryCard: {
    padding: 12,
    marginBottom: spacing.md,
    backgroundColor: colors.warmWhite,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 16,
  },
  dateEntryHeading: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  dateEntryLabel: {
    flex: 1,
    color: colors.text,
    fontSize: 12,
    fontWeight: '600',
  },
  todayButton: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: '#F4E5E3',
    borderRadius: 11,
  },
  todayButtonText: {
    color: colors.burgundy,
    fontSize: 11,
    fontWeight: '700',
  },
  dateEntryFields: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.xs,
  },
  datePartField: {
    flex: 1,
    minWidth: 0,
  },
  dateYearField: {
    flex: 1.35,
  },
  datePartLabel: {
    color: colors.mutedText,
    fontSize: 10,
    fontWeight: '600',
    marginBottom: 5,
    textAlign: 'center',
  },
  datePartInput: {
    minHeight: 44,
    paddingHorizontal: 6,
    color: colors.text,
    backgroundColor: colors.cream,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 12,
    fontSize: 15,
    fontWeight: '600',
    textAlign: 'center',
  },
  datePartSeparator: {
    color: colors.mutedText,
    fontSize: 16,
    fontWeight: '600',
    paddingBottom: 12,
  },
  invalidDateEntryInput: {
    borderColor: colors.burgundy,
  },
  dateEntryHint: {
    color: colors.mutedText,
    fontSize: 11,
    marginTop: spacing.xs,
  },
  invalidDateEntryHint: {
    color: colors.burgundy,
  },
  calendarMonthRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  calendarDateSelectors: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  calendarDateSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: colors.warmWhite,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 12,
  },
  calendarMonth: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '700',
  },
  calendarChoiceGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
  },
  calendarChoice: {
    width: '31%',
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.warmWhite,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 14,
  },
  calendarYearGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
  },
  calendarYearChoice: {
    width: '22%',
    minHeight: 42,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.warmWhite,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 13,
  },
  calendarChoiceText: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '600',
  },
  selectedCalendarChoice: {
    backgroundColor: '#F4E0E1',
    borderColor: colors.burgundy,
  },
  selectedCalendarChoiceText: {
    color: colors.burgundy,
    fontWeight: '700',
  },
  calendarArrow: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F0E4DA',
    borderRadius: 19,
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  calendarWeekday: {
    width: '14.2857%',
    height: 34,
    color: colors.mutedText,
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 34,
    textAlign: 'center',
  },
  calendarDay: {
    width: '14.2857%',
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 21,
  },
  calendarActions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  calendarAction: {
    minHeight: 48,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
  },
  calendarCancelAction: {
    backgroundColor: '#EDE2D8',
  },
  calendarCancelText: {
    color: colors.burgundy,
    fontSize: 14,
    fontWeight: '700',
  },
  calendarConfirmAction: {
    backgroundColor: colors.burgundy,
  },
  calendarConfirmText: {
    color: colors.cream,
    fontSize: 14,
    fontWeight: '700',
  },
  calendarDayText: {
    color: colors.text,
    fontSize: 13,
  },
  todayCalendarDay: {
    borderColor: '#D6A9AC',
    borderWidth: 1,
  },
  todayCalendarDayText: {
    color: colors.burgundy,
    fontWeight: '700',
  },
  selectedCalendarDay: {
    backgroundColor: colors.burgundy,
    borderColor: colors.burgundy,
  },
  selectedCalendarDayText: {
    color: colors.cream,
    fontWeight: '700',
  },
  progressCard: {
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 10,
    backgroundColor: colors.warmWhite,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 15,
  },
  progressHeading: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  progressTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  progressIcon: {
    width: 34,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F4E5E3',
    borderRadius: 17,
  },
  progressTitle: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '700',
  },
  progressHint: {
    color: colors.mutedText,
    fontSize: 11,
    marginTop: 2,
  },
  progressBadge: {
    minWidth: 54,
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: '#F4E5E3',
    borderRadius: 13,
  },
  progressValue: {
    color: colors.burgundy,
    fontSize: 13,
    fontWeight: '700',
  },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: -2,
  },
  progressEndpoint: {
    color: colors.mutedText,
    fontSize: 11,
  },
  activeProgressEndpoint: {
    color: colors.burgundy,
    fontWeight: '700',
  },
  categorySelector: {
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    backgroundColor: colors.warmWhite,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 11,
  },
  categorySelectorText: {
    flex: 1,
    color: colors.text,
    fontSize: 14,
    marginRight: spacing.sm,
  },
  categoryPlaceholder: {
    color: colors.mutedText,
  },
  categoryOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(35, 18, 18, 0.45)',
  },
  categorySheet: {
    maxHeight: '82%',
    paddingTop: spacing.lg,
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
    backgroundColor: colors.cream,
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
  },
  categoryHeading: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  categoryTitle: {
    color: colors.burgundy,
    fontSize: 19,
    fontWeight: '700',
  },
  categorySubtitle: {
    color: colors.mutedText,
    fontSize: 12,
    marginTop: 3,
  },
  categoryList: {
    paddingBottom: spacing.md,
  },
  categoryGroup: {
    marginBottom: spacing.md,
  },
  categoryGroupTitle: {
    color: colors.burgundy,
    fontSize: 13,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  categoryOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  categoryOption: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: colors.warmWhite,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 16,
  },
  selectedCategoryOption: {
    backgroundColor: '#F4E0E1',
    borderColor: colors.burgundy,
  },
  categoryOptionText: {
    color: colors.mutedText,
    fontSize: 12,
  },
  selectedCategoryOptionText: {
    color: colors.burgundy,
    fontWeight: '600',
  },
  customCategorySection: {
    gap: spacing.xs,
    paddingTop: spacing.sm,
    borderTopColor: colors.border,
    borderTopWidth: 1,
  },
  customCategoryOption: {
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    backgroundColor: '#F4E0E1',
    borderColor: '#E8C9CB',
    borderWidth: 1,
    borderRadius: 12,
  },
  customCategoryOptionText: {
    color: colors.burgundy,
    fontSize: 13,
    fontWeight: '600',
  },
  customCategoryButton: {
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.burgundy,
    borderRadius: 12,
  },
  customCategoryButtonText: {
    color: colors.cream,
    fontSize: 13,
    fontWeight: '700',
  },
  choiceRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  choice: {
    flex: 1,
    minHeight: 38,
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
    minHeight: 44,
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
