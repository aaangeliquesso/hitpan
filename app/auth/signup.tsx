import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Link, useRouter } from 'expo-router';
import { AuthField } from '../../src/modules/auth/components/AuthField';
import { AuthLayout } from '../../src/modules/auth/components/AuthLayout';
import { signInWithGoogle } from '../../src/modules/auth/services/authActions';
import { supabase } from '../../src/lib/supabase';
import { colors, spacing } from '../../src/shared/ui/theme';

export default function SignupScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSignup() {
    if (!email.trim() || !password || !confirmPassword) {
      Alert.alert('Missing details', 'Complete all fields to create an account.');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Passwords don’t match', 'Check the passwords and try again.');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Password is too short', 'Use at least 6 characters.');
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
      });
      if (error) {
        throw error;
      }
      if (data.session) {
        router.replace('/(tabs)');
      } else {
        Alert.alert(
          'Check your email',
          'Confirm your email address to finish creating your account.',
        );
        router.replace('/auth/login');
      }
    } catch (cause) {
      Alert.alert(
        'Unable to create account',
        cause instanceof Error ? cause.message : 'Please try again.',
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleSignup() {
    setLoading(true);
    try {
      await signInWithGoogle();
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        router.replace('/(tabs)');
      }
    } catch (cause) {
      Alert.alert(
        'Google sign-up failed',
        cause instanceof Error ? cause.message : 'Please try again.',
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout
      backButton={
        <Link href="/auth/login" asChild>
          <Pressable accessibilityLabel="Back to login" hitSlop={12}>
            <Ionicons color={colors.warmWhite} name="arrow-back" size={22} />
          </Pressable>
        </Link>
      }
    >
      <Text style={styles.heading}>Create your Account</Text>
      <AuthField
        autoCapitalize="none"
        keyboardType="email-address"
        label="Email Address"
        onChangeText={setEmail}
        textContentType="emailAddress"
        value={email}
      />
      <AuthField
        label="Password"
        onChangeText={setPassword}
        secureTextEntry
        textContentType="newPassword"
        value={password}
      />
      <AuthField
        label="Confirm Password"
        onChangeText={setConfirmPassword}
        secureTextEntry
        textContentType="newPassword"
        value={confirmPassword}
      />
      <Pressable
        accessibilityRole="button"
        disabled={loading}
        onPress={() => void handleSignup()}
        style={[styles.primaryButton, loading && styles.disabled]}
      >
        {loading ? (
          <ActivityIndicator color={colors.warmWhite} />
        ) : (
          <Text style={styles.primaryLabel}>Sign up</Text>
        )}
      </Pressable>
      <Pressable
        accessibilityRole="button"
        disabled={loading}
        onPress={() => void handleGoogleSignup()}
        style={styles.googleButton}
      >
        <Ionicons color="#4285F4" name="logo-google" size={17} />
        <Text style={styles.googleLabel}>Sign up with Google</Text>
      </Pressable>
      <View style={styles.footer}>
        <Text style={styles.footerText}>Already have an account? </Text>
        <Link href="/auth/login" style={styles.link}>
          Log in
        </Link>
      </View>
    </AuthLayout>
  );
}

const styles = StyleSheet.create({
  heading: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: spacing.md,
  },
  primaryButton: {
    minHeight: 46,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.sm,
    backgroundColor: colors.burgundy,
    borderRadius: 13,
  },
  disabled: {
    opacity: 0.65,
  },
  primaryLabel: {
    color: colors.warmWhite,
    fontSize: 14,
    fontWeight: '600',
  },
  googleButton: {
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    marginTop: spacing.md,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 13,
  },
  googleLabel: {
    color: colors.mutedText,
    fontSize: 13,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: spacing.lg,
  },
  footerText: {
    color: colors.mutedText,
    fontSize: 12,
  },
  link: {
    color: colors.burgundy,
    fontSize: 12,
    fontWeight: '700',
  },
});
