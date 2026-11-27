import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../../lib/supabase';
import {
  AccountDeletedSignOutError,
  deleteUserAccount,
} from '../auth/services/authService';
import { BrandWordmark } from '../../shared/components/BrandWordmark';
import { ConfirmationModal } from '../../shared/components/ConfirmationModal';
import { Header } from '../../shared/components/Header';
import { colors, spacing } from '../../shared/ui/theme';
import { ProfileSummary } from './components/ProfileSummary';
import { getCurrentUser } from './services/profileService';

export default function ProfileScreen() {
  const router = useRouter();
  const [email, setEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [signingOut, setSigningOut] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState(false);
  const [logoutConfirmationVisible, setLogoutConfirmationVisible] =
    useState(false);
  const [deleteConfirmationVisible, setDeleteConfirmationVisible] =
    useState(false);
  const accountActionInProgress = useRef(false);

  useEffect(() => {
    let active = true;

    void getCurrentUser()
      .then((user) => {
        if (active) {
          setEmail(user.email ?? null);
        }
      })
      .catch((cause: unknown) => {
        if (active) {
          setError(
            cause instanceof Error ? cause.message : 'Unable to load profile.',
          );
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  const handleLogout = async () => {
    if (accountActionInProgress.current) {
      return;
    }

    accountActionInProgress.current = true;
    setSigningOut(true);

    try {
      const { error: signOutError } = await supabase.auth.signOut();

      if (signOutError) {
        throw signOutError;
      }
    } catch (cause) {
      accountActionInProgress.current = false;
      setSigningOut(false);
      Alert.alert(
        'Unable to log out',
        cause instanceof Error ? cause.message : 'Please try again.',
      );
      return;
    }

    router.replace('/auth/login');
  };

  const confirmLogout = () => {
    setLogoutConfirmationVisible(true);
  };

  const handleDeleteAccount = async () => {
    if (accountActionInProgress.current) {
      return;
    }

    accountActionInProgress.current = true;
    setDeletingAccount(true);

    try {
      await deleteUserAccount();
    } catch (cause) {
      accountActionInProgress.current = false;
      setDeletingAccount(false);

      if (cause instanceof AccountDeletedSignOutError) {
        router.replace('/auth/login');
        Alert.alert('Account deleted', cause.message);
        return;
      }

      Alert.alert(
        'Unable to delete account',
        cause instanceof Error ? cause.message : 'Please try again.',
      );
      return;
    }

    router.replace('/auth/login');
  };

  const confirmDeleteAccount = () => {
    setDeleteConfirmationVisible(true);
  };

  return (
    <>
      <SafeAreaView edges={['top']} style={styles.screen}>
        <View style={styles.content}>
          <View style={styles.brandHeader}>
            <BrandWordmark width={116} />
          </View>
          <Header title="Profile" subtitle="Your HitPan account." />
          {loading ? (
            <ActivityIndicator color={colors.brand} />
          ) : error ? (
            <Text style={styles.error}>{error}</Text>
          ) : (
            <ProfileSummary
              deletingAccount={deletingAccount}
              email={email}
              onDeleteAccount={confirmDeleteAccount}
              onLogout={confirmLogout}
              signingOut={signingOut}
            />
          )}
        </View>
      </SafeAreaView>
      <ConfirmationModal
        cancelText="Go Back"
        confirmText="Log Out"
        loading={signingOut}
        message="Are you sure you want to log out?"
        onCancel={() => setLogoutConfirmationVisible(false)}
        onConfirm={() => {
          setLogoutConfirmationVisible(false);
          void handleLogout();
        }}
        title="Log out?"
        variant="neutral"
        visible={logoutConfirmationVisible}
      />
      <ConfirmationModal
        cancelText="Keep Account"
        confirmText="Delete"
        loading={deletingAccount}
        message="This action is permanent. All your tracked vanity items, progress photos, and profile data will be permanently deleted."
        onCancel={() => setDeleteConfirmationVisible(false)}
        onConfirm={() => void handleDeleteAccount()}
        title="Delete account?"
        variant="destructive"
        visible={deleteConfirmationVisible}
      />
    </>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.cream,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
  },
  brandHeader: {
    alignItems: 'center',
    marginTop: spacing.md,
    marginBottom: spacing.lg,
  },
  error: {
    color: colors.error,
    padding: spacing.md,
    backgroundColor: colors.errorSurface,
    borderRadius: 12,
  },
});
