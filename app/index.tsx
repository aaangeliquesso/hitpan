import { useEffect } from 'react';
import { Alert, Image, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { colors } from '../src/shared/ui/theme';
import { supabase } from '../src/lib/supabase';

export default function SplashScreen() {
  const router = useRouter();

  useEffect(() => {
    let mounted = true;

    void supabase.auth
      .getSession()
      .then(({ data, error }) => {
        if (!mounted) {
          return;
        }

        if (error) {
          Alert.alert('Session unavailable', error.message);
        }

        router.replace(data.session ? '/(tabs)' : '/auth/login');
      })
      .catch((cause: unknown) => {
        if (mounted) {
          Alert.alert(
            'Unable to check your session',
            cause instanceof Error ? cause.message : 'Please log in again.',
          );
          router.replace('/auth/login');
        }
      });

    return () => {
      mounted = false;
    };
  }, [router]);

  return (
    <View style={styles.container}>
      <Image
        accessibilityLabel="HitPan"
        resizeMode="contain"
        source={require('../logo/white-secondary-logo.png')}
        style={styles.logo}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.burgundy,
  },
  logo: {
    width: 88,
    height: 88,
  },
});
