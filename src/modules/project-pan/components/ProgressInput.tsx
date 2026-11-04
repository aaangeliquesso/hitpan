import { useEffect, useState } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import {
  Controller,
  type Control,
  type FieldPathByValue,
  type FieldValues,
} from 'react-hook-form';
import { colors, spacing } from '../../../shared/ui/theme';

const PRESETS = [25, 50, 75, 100] as const;

export function clampProgressPercentage(value: number | null | undefined) {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return 0;
  }
  return Math.max(0, Math.min(100, Math.round(value)));
}

interface ProgressInputProps<TFieldValues extends FieldValues> {
  control: Control<TFieldValues>;
  name: FieldPathByValue<TFieldValues, number>;
  accessibilityLabel?: string;
  disabled?: boolean;
}

interface ProgressInputControlsProps {
  value: number;
  onChange: (value: number) => void;
  onBlur: () => void;
  accessibilityLabel: string;
  disabled: boolean;
}

function ProgressInputControls({
  value,
  onChange,
  onBlur,
  accessibilityLabel,
  disabled,
}: ProgressInputControlsProps) {
  const progress = clampProgressPercentage(value);
  const [draft, setDraft] = useState(String(progress));
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    setDraft(String(progress));
  }, [progress]);

  function changeBy(amount: number) {
    onChange(clampProgressPercentage(progress + amount));
  }

  return (
    <View style={styles.container}>
      <View style={styles.valueRow}>
        <Pressable
          accessibilityLabel="Decrease progress by 5 percent"
          accessibilityRole="button"
          disabled={disabled || progress === 0}
          onPress={() => changeBy(-5)}
          style={({ pressed }) => [
            styles.stepper,
            (disabled || progress === 0) && styles.stepperDisabled,
            pressed && styles.pressed,
          ]}
        >
          <Text style={styles.stepperText}>−</Text>
        </Pressable>
        <View
          style={[
            styles.inputContainer,
            focused && styles.inputFocused,
            disabled && styles.inputDisabled,
          ]}
        >
          <TextInput
            accessibilityLabel={accessibilityLabel}
            editable={!disabled}
            keyboardType="number-pad"
            onBlur={() => {
              setFocused(false);
              if (!draft) {
                setDraft(String(progress));
              }
              onBlur();
            }}
            onChangeText={(text) => {
              if (text === '') {
                setDraft('');
                return;
              }
              if (!/^\d+$/.test(text)) {
                return;
              }
              const nextValue = clampProgressPercentage(Number(text));
              setDraft(String(nextValue));
              onChange(nextValue);
            }}
            onFocus={() => setFocused(true)}
            selectTextOnFocus
            style={styles.input}
            value={draft}
          />
          <Text style={styles.percentSign}>%</Text>
        </View>
        <Pressable
          accessibilityLabel="Increase progress by 5 percent"
          accessibilityRole="button"
          disabled={disabled || progress === 100}
          onPress={() => changeBy(5)}
          style={({ pressed }) => [
            styles.stepper,
            (disabled || progress === 100) && styles.stepperDisabled,
            pressed && styles.pressed,
          ]}
        >
          <Text style={styles.stepperText}>+</Text>
        </Pressable>
      </View>
      <View style={styles.presets}>
        {PRESETS.map((preset) => {
          const selected = progress === preset;
          return (
            <Pressable
              accessibilityLabel={`Set progress to ${preset} percent`}
              accessibilityRole="button"
              accessibilityState={{ selected }}
              disabled={disabled}
              key={preset}
              onPress={() => onChange(preset)}
              style={({ pressed }) => [
                styles.preset,
                selected && styles.presetSelected,
                pressed && styles.pressed,
              ]}
            >
              <Text
                style={[
                  styles.presetText,
                  selected && styles.presetTextSelected,
                ]}
              >
                {preset}%
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

export function ProgressInput<TFieldValues extends FieldValues>({
  control,
  name,
  accessibilityLabel = 'Progress percentage',
  disabled = false,
}: ProgressInputProps<TFieldValues>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => (
        <ProgressInputControls
          accessibilityLabel={accessibilityLabel}
          disabled={disabled}
          onBlur={field.onBlur}
          onChange={(value) => field.onChange(clampProgressPercentage(value))}
          value={field.value}
        />
      )}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.sm,
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
  },
  stepper: {
    width: 42,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    backgroundColor: colors.brand,
  },
  stepperDisabled: {
    backgroundColor: colors.border,
  },
  stepperText: {
    color: colors.backgroundPrimary,
    fontSize: 24,
    fontWeight: '700',
    lineHeight: 28,
  },
  inputContainer: {
    minWidth: 92,
    height: 46,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    backgroundColor: colors.backgroundPrimary,
  },
  inputFocused: {
    borderColor: colors.brand,
    borderWidth: 2,
  },
  inputDisabled: {
    opacity: 0.6,
  },
  input: {
    minWidth: 42,
    padding: 0,
    color: colors.brand,
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'right',
  },
  percentSign: {
    marginLeft: 2,
    color: colors.brand,
    fontSize: 16,
    fontWeight: '700',
  },
  presets: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  preset: {
    minWidth: 54,
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 18,
    backgroundColor: colors.backgroundPrimary,
  },
  presetSelected: {
    borderColor: colors.brand,
    backgroundColor: colors.brand,
  },
  presetText: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '600',
  },
  presetTextSelected: {
    color: colors.backgroundPrimary,
  },
  pressed: {
    opacity: 0.75,
  },
});
