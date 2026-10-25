import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BrandWordmark } from '../../shared/components/BrandWordmark';
import { Header } from '../../shared/components/Header';
import { colors, spacing } from '../../shared/ui/theme';
import { ProfileSummary } from './components/ProfileSummary';
import { getCurrentUser } from './services/profileService';

export default function ProfileScreen() {
  const [email, setEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
          <ProfileSummary email={email} />
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
