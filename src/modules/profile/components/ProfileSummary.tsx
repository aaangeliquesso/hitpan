import { StyleSheet, Text, View } from 'react-native';
import { colors, spacing } from '../../../shared/ui/theme';

interface ProfileSummaryProps {
  email: string | null;
}

export function ProfileSummary({ email }: ProfileSummaryProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.label}>Signed in as</Text>
      <Text style={styles.email}>{email ?? 'Email unavailable'}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: spacing.md,
    backgroundColor: colors.warmWhite,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 16,
    gap: spacing.xs,
  },
  label: {
    color: colors.mutedText,
    fontSize: 12,
  },
  email: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
});
