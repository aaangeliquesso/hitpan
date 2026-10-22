import { Pressable, StyleSheet, Text } from 'react-native';
import { colors } from '../ui/theme';

interface FloatingActionButtonProps {
  label: string;
  onPress: () => void;
  accessibilityLabel?: string;
}

export function FloatingActionButton({
  label,
  onPress,
  accessibilityLabel,
}: FloatingActionButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      onPress={onPress}
      style={({ pressed }) => [styles.button, pressed && styles.pressed]}
    >
      <Text style={styles.label}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minWidth: 52,
    height: 52,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.burgundy,
    borderRadius: 26,
    elevation: 4,
  },
  pressed: {
    opacity: 0.82,
  },
  label: {
    color: colors.cream,
    fontSize: 16,
    fontWeight: '700',
  },
});
