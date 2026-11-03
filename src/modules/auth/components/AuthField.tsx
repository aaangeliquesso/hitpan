import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { colors, spacing } from '../../../shared/ui/theme';

interface AuthFieldProps {
  label?: string;
  placeholder: string;
  value: string;
  onChangeText: (value: string) => void;
  error?: string;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'email-address';
  autoCapitalize?: 'none' | 'sentences';
  textContentType?: 'emailAddress' | 'password' | 'newPassword';
}

export function AuthField({
  label,
  placeholder,
  value,
  onChangeText,
  error,
  secureTextEntry,
  keyboardType = 'default',
  autoCapitalize = 'sentences',
  textContentType,
}: AuthFieldProps) {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  return (
    <View style={styles.container}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <View
        style={[
          styles.inputContainer,
          error && styles.inputError,
        ]}
      >
        <TextInput
          accessibilityLabel={label ?? placeholder}
          accessibilityHint={error}
          autoCapitalize={autoCapitalize}
          autoCorrect={false}
          keyboardType={keyboardType}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.accessibleMutedText}
          secureTextEntry={secureTextEntry && !isPasswordVisible}
          style={styles.input}
          textContentType={textContentType}
          value={value}
        />
        {secureTextEntry ? (
          <Pressable
            accessibilityLabel={
              isPasswordVisible ? 'Hide password' : 'Show password'
            }
            accessibilityRole="button"
            accessibilityState={{ expanded: isPasswordVisible }}
            hitSlop={8}
            onPress={() => setIsPasswordVisible((visible) => !visible)}
            style={styles.visibilityButton}
          >
            <Ionicons
              color={colors.mutedText}
              name={isPasswordVisible ? 'eye-off-outline' : 'eye-outline'}
              size={20}
            />
          </Pressable>
        ) : null}
      </View>
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  label: {
    marginBottom: 6,
    color: '#121212',
    fontSize: 14,
    fontWeight: '600',
  },
  inputContainer: {
    minHeight: 46,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundPrimary,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 13,
  },
  input: {
    flex: 1,
    height: 46,
    paddingHorizontal: spacing.md,
    color: colors.text,
    fontSize: 13,
  },
  visibilityButton: {
    minWidth: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputError: {
    borderColor: colors.error,
  },
  error: {
    marginTop: spacing.xs,
    padding: spacing.sm,
    color: colors.error,
    backgroundColor: colors.errorSurface,
    borderRadius: 8,
    fontSize: 12,
  },
});
