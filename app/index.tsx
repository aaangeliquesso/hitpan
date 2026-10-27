import { createElement, useEffect } from 'react';
import { Alert, Image, StatusBar, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { hideAsync } from 'expo-splash-screen';
import { supabase } from '../src/lib/supabase';
import { colors } from '../src/shared/ui/theme';

export default function SplashScreenComponent() {
  const router = useRouter();

  useEffect(() => {
    let mounted = true;

    // Set splash screen duration (e.g., 2000ms = 2 seconds)
    const DISPLAY_DURATION_MS = 2000;

    const timer = setTimeout(async () => {
      try {
        const { data, error } = await supabase.auth.getSession();

        if (!mounted) return;

        if (error) {
          Alert.alert('Session unavailable', error.message);
        }

        // Hide splash screen after delay
        await hideAsync().catch(() => {});

        router.replace(data.session ? '/(tabs)/home' : '/auth/login');
      } catch (cause) {
        if (mounted) {
          await hideAsync().catch(() => {});
          Alert.alert(
            'Unable to check your session',
            cause instanceof Error ? cause.message : 'Please log in again.',
          );
          router.replace('/auth/login');
        }
      }
    }, DISPLAY_DURATION_MS);

    return () => {
      mounted = false;
      clearTimeout(timer);
    };
  }, [router]);

  return createElement(
    View,
    { style: styles.container },
    createElement(StatusBar, { barStyle: 'dark-content' }),
    createElement(Image, {
      accessibilityLabel: 'Brand mark',
      resizeMode: 'contain',
      source: require('../logo/burgundy-secondary-logo.png'),
      style: styles.logo,
    }),
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.backgroundPrimary,
  },
  logo: {
    width: 120,
    height: 120,
  },
});