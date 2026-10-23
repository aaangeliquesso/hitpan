import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  type TouchableOpacityProps,
} from 'react-native';
import { colors, spacing } from '../../../shared/ui/theme';

interface GoogleLoginButtonProps extends TouchableOpacityProps {
  label?: string;
}

export function GoogleLoginButton({
  label = 'Sign in with Google',
  style,
  ...touchableProps
}: GoogleLoginButtonProps) {
  return (
    <TouchableOpacity
      accessibilityLabel={label}
      accessibilityRole="button"
      {...touchableProps}
      style={[styles.button, touchableProps.disabled && styles.disabled, style]}
    >
      <Image
        accessibilityIgnoresInvertColors
        resizeMode="contain"
        source={require('../../../../logo/google-logo.webp')}
        style={styles.icon}
      />
      <Text style={styles.label}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    marginTop: spacing.md,
    backgroundColor: '#FFFFFF',
    borderColor: '#DDDDDD',
    borderWidth: 1,
    borderRadius: 13,
  },
  disabled: {
    opacity: 0.65,
  },
  icon: {
    width: 17,
    height: 17,
  },
  label: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '500',
  },
});
