import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../../lib/supabase';
import { BrandWordmark } from '../../shared/components/BrandWordmark';
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
  const [logoutConfirmationVisible, setLogoutConfirmationVisible] =
    useState(false);
  const signOutInProgress = useRef(false);

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
    if (signOutInProgress.current) {
      return;
    }

    signOutInProgress.current = true;
    setSigningOut(true);

    try {
      const { error: signOutError } = await supabase.auth.signOut();

      if (signOutError) {
        throw signOutError;
      }
    } catch (cause) {
      signOutInProgress.current = false;
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

  return (
    <>
      <SafeAreaView edges={['top']} style={styles.screen}>
        <View style={styles.content}>
          <View style={styles.brandHeader}>
            <BrandWordmark width={116} />
          </View>
          <Header title="Profile" subtitle="Your HitPan account." />
          {loading ? (
            <ActivityIndicator color={colors.neutralIcon} />
          ) : error ? (
            <Text style={styles.error}>{error}</Text>
          ) : (
            <ProfileSummary
              email={email}
              onLogout={confirmLogout}
              signingOut={signingOut}
            />
          )}
        </View>
      </SafeAreaView>
      <Modal
        animationType="fade"
        onRequestClose={() => setLogoutConfirmationVisible(false)}
        transparent
        visible={logoutConfirmationVisible}
      >
        <View style={styles.modalBackdrop}>
          <View
            accessibilityViewIsModal
            style={styles.confirmationCard}
          >
            <View style={styles.confirmationIcon}>
              <Ionicons
                color={colors.neutralIcon}
                name="log-out-outline"
                size={24}
              />
            </View>
            <Text style={styles.confirmationTitle}>Log out?</Text>
            <Text style={styles.confirmationMessage}>
              Are you sure you want to log out?
            </Text>
            <View style={styles.confirmationActions}>
              <Pressable
                accessibilityRole="button"
                onPress={() => setLogoutConfirmationVisible(false)}
                style={({ pressed }) => [
                  styles.cancelButton,
                  pressed && styles.confirmationButtonPressed,
                ]}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                onPress={() => {
                  setLogoutConfirmationVisible(false);
                  void handleLogout();
                }}
                style={({ pressed }) => [
                  styles.confirmLogoutButton,
                  pressed && styles.confirmationButtonPressed,
                ]}
              >
                <Text style={styles.confirmLogoutButtonText}>Log Out</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
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
  modalBackdrop: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
    backgroundColor: 'rgba(18, 18, 18, 0.55)',
  },
  confirmationCard: {
    width: '100%',
    maxWidth: 360,
    alignItems: 'center',
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 22,
    backgroundColor: colors.backgroundPrimary,
  },
  confirmationIcon: {
    width: 48,
    height: 48,
    marginBottom: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 24,
    backgroundColor: colors.backgroundSecondary,
  },
  confirmationTitle: {
    color: colors.textPrimary,
    fontSize: 21,
    fontWeight: '700',
  },
  confirmationMessage: {
    marginTop: spacing.sm,
    color: colors.mutedText,
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
  },
  confirmationActions: {
    width: '100%',
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.lg,
  },
  cancelButton: {
    flex: 1,
    minHeight: 46,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    backgroundColor: colors.cream,
  },
  cancelButtonText: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '600',
  },
  confirmLogoutButton: {
    flex: 1,
    minHeight: 46,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    backgroundColor: colors.brand,
  },
  confirmLogoutButtonText: {
    color: colors.backgroundPrimary,
    fontSize: 15,
    fontWeight: '700',
  },
  confirmationButtonPressed: {
    opacity: 0.8,
  },
});
