import { StyleSheet, TextInput, View } from 'react-native';
import { colors, spacing } from '../../../shared/ui/theme';

interface AuthFieldProps {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'email-address';
  autoCapitalize?: 'none' | 'sentences';
  textContentType?: 'emailAddress' | 'password' | 'newPassword';
}

export function AuthField({
  label,
  value,
  onChangeText,
  secureTextEntry,
  keyboardType = 'default',
  autoCapitalize = 'sentences',
  textContentType,
}: AuthFieldProps) {
  return (
    <View style={styles.container}>
      <TextInput
        accessibilityLabel={label}
        autoCapitalize={autoCapitalize}
        autoCorrect={false}
        keyboardType={keyboardType}
        onChangeText={onChangeText}
        placeholder={label}
        placeholderTextColor={colors.mutedText}
        secureTextEntry={secureTextEntry}
        style={styles.input}
        textContentType={textContentType}
        value={value}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  input: {
    height: 46,
    paddingHorizontal: spacing.md,
    color: colors.text,
    backgroundColor: colors.warmWhite,
    borderColor: colors.mutedBurgundy,
    borderWidth: 1,
    borderRadius: 13,
    fontSize: 13,
  },
});
