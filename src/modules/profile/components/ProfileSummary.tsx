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
  onDeleteAccount: () => void;
  signingOut: boolean;
  deletingAccount: boolean;
}

export function ProfileSummary({
  email,
  onLogout,
  onDeleteAccount,
  signingOut,
  deletingAccount,
}: ProfileSummaryProps) {
  const actionInProgress = signingOut || deletingAccount;

  return (
    <View style={styles.card}>
      <Text style={styles.label}>Signed in as</Text>
      <Text style={styles.email}>{email ?? 'Email unavailable'}</Text>
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ disabled: actionInProgress }}
        disabled={actionInProgress}
        onPress={onLogout}
        style={({ pressed }) => [
          styles.logoutButton,
          pressed && !actionInProgress && styles.logoutButtonPressed,
          actionInProgress && styles.logoutButtonDisabled,
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
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ disabled: actionInProgress }}
        disabled={actionInProgress}
        onPress={onDeleteAccount}
        style={({ pressed }) => [
          styles.deleteAccountButton,
          pressed && !actionInProgress && styles.deleteAccountButtonPressed,
          actionInProgress && styles.logoutButtonDisabled,
        ]}
      >
        {deletingAccount ? (
          <ActivityIndicator color={colors.error} />
        ) : (
          <Ionicons color={colors.error} name="trash-outline" size={20} />
        )}
        <Text style={styles.deleteAccountButtonText}>
          {deletingAccount ? 'Deleting account...' : 'Delete Account'}
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
  deleteAccountButton: {
    minHeight: 48,
    marginTop: spacing.xs,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.error,
    borderRadius: 12,
    backgroundColor: 'transparent',
  },
  deleteAccountButtonPressed: {
    backgroundColor: colors.errorSurface,
  },
  deleteAccountButtonText: {
    color: colors.error,
    fontSize: 16,
    fontWeight: '700',
  },
});
