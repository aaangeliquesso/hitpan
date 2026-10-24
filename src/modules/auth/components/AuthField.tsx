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
  label: string;
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
      <View style={[styles.inputContainer, error && styles.inputError]}>
        <TextInput
          accessibilityLabel={label}
          accessibilityHint={error}
          autoCapitalize={autoCapitalize}
          autoCorrect={false}
          keyboardType={keyboardType}
          onChangeText={onChangeText}
          placeholder={label}
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
  inputContainer: {
    minHeight: 46,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.warmWhite,
    borderColor: colors.mutedBurgundy,
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
    borderColor: colors.burgundy,
  },
  error: {
    marginTop: spacing.xs,
    color: colors.burgundy,
    fontSize: 12,
  },
});
