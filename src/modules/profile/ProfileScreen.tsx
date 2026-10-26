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
    Alert.alert('Log Out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Log Out',
        style: 'destructive',
        onPress: () => void handleLogout(),
      },
    ]);
  };

  return (
    <SafeAreaView edges={['top']} style={styles.screen}>
      <View style={styles.content}>
        <View style={styles.brandHeader}>
          <BrandWordmark width={116} />
        </View>
        <Header title="Profile" subtitle="Your HitPan account." />
        {loading ? (
          <ActivityIndicator color={colors.burgundy} />
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
    color: colors.burgundy,
  },
});
