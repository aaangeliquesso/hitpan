import { Ionicons } from '@expo/vector-icons';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { colors, spacing } from '../../../shared/ui/theme';

interface ProfileSummaryProps {
  email: string | null;
  onLogout: () => void;
  signingOut: boolean;
}

export function ProfileSummary({
  email,
  onLogout,
  signingOut,
}: ProfileSummaryProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.label}>Signed in as</Text>
      <Text style={styles.email}>{email ?? 'Email unavailable'}</Text>
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ disabled: signingOut }}
        disabled={signingOut}
        onPress={onLogout}
        style={({ pressed }) => [
          styles.logoutButton,
          pressed && !signingOut && styles.logoutButtonPressed,
          signingOut && styles.logoutButtonDisabled,
        ]}
      >
        {signingOut ? (
          <ActivityIndicator color={colors.backgroundPrimary} />
        ) : (
          <Ionicons
            color={colors.backgroundPrimary}
            name="log-out-outline"
            size={20}
          />
        )}
        <Text style={styles.logoutButtonText}>
          {signingOut ? 'Logging out...' : 'Log Out'}
        </Text>
      </Pressable>
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
  logoutButton: {
    minHeight: 48,
    marginTop: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    borderRadius: 12,
    backgroundColor: colors.brand,
  },
  logoutButtonPressed: {
    opacity: 0.85,
  },
  logoutButtonDisabled: {
    opacity: 0.65,
  },
  logoutButtonText: {
    color: colors.backgroundPrimary,
    fontSize: 16,
    fontWeight: '700',
  },
});
