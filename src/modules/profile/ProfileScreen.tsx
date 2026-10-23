import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
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
    <View style={styles.content}>
      <Header title="Profile" subtitle="Your HitPan account." />
      {loading ? (
        <ActivityIndicator color={colors.burgundy} />
      ) : error ? (
        <Text style={styles.error}>{error}</Text>
      ) : (
        <ProfileSummary email={email} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    padding: spacing.md,
    paddingTop: spacing.lg,
    backgroundColor: colors.cream,
  },
  error: {
    color: colors.burgundy,
  },
});
