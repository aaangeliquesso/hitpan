import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Link, useRouter } from 'expo-router';
import { AuthField } from '../../src/modules/auth/components/AuthField';
import { AuthLayout } from '../../src/modules/auth/components/AuthLayout';
import { GoogleLoginButton } from '../../src/modules/auth/components/GoogleLoginButton';
import {
  GoogleSignInUnavailableError,
  signInWithGoogle,
} from '../../src/modules/auth/services/authActions';
import { supabase } from '../../src/lib/supabase';
import { colors, spacing } from '../../src/shared/ui/theme';

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    if (!email.trim() || !password) {
      Alert.alert('Missing details', 'Enter your email and password to log in.');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (error) {
        throw error;
      }
      router.replace('/(tabs)');
    } catch (cause) {
      Alert.alert(
        'Unable to log in',
        cause instanceof Error ? cause.message : 'Please try again.',
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleLogin() {
    setLoading(true);
    try {
      const signedIn = await signInWithGoogle();
      if (signedIn) {
        router.replace('/(tabs)');
      }
    } catch (cause) {
      if (!(cause instanceof GoogleSignInUnavailableError)) {
        console.error('Google login failed:', cause);
      }
      Alert.alert('Google sign-in failed', googleLoginErrorMessage(cause));
    } finally {
      setLoading(false);
    }
  }

  async function handleForgotPassword() {
    if (!email.trim()) {
      Alert.alert('Enter your email', 'Add your email address first.');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim());
      if (error) {
        throw error;
      }
      Alert.alert('Check your email', 'We sent you a password reset link.');
    } catch (cause) {
      Alert.alert(
        'Unable to send reset link',
        cause instanceof Error ? cause.message : 'Please try again.',
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout>
      <Text style={styles.heading}>Login to your Account</Text>
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
        textContentType="password"
        value={password}
      />
      <Pressable
        accessibilityRole="button"
        disabled={loading}
        onPress={() => void handleForgotPassword()}
        style={styles.forgot}
      >
        <Text style={styles.forgotText}>Forgot Password?</Text>
      </Pressable>
      <Pressable
        accessibilityRole="button"
        disabled={loading}
        onPress={() => void handleLogin()}
        style={[styles.primaryButton, loading && styles.disabled]}
      >
        {loading ? (
          <ActivityIndicator color={colors.warmWhite} />
        ) : (
          <Text style={styles.primaryLabel}>Log in</Text>
        )}
      </Pressable>
      <GoogleLoginButton
        disabled={loading}
        label="Log in with Google"
        onPress={handleGoogleLogin}
      />
      <View style={styles.footer}>
        <Text style={styles.footerText}>Don’t have an account? </Text>
        <Link href="/auth/signup" style={styles.link}>
          Sign Up
        </Link>
      </View>
    </AuthLayout>
  );
}

function googleLoginErrorMessage(cause: unknown): string {
  if (cause instanceof GoogleSignInUnavailableError) {
    return cause.message;
  }
  return 'We couldn’t sign you in with Google. Please try again.';
}

const styles = StyleSheet.create({
  heading: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: spacing.md,
  },
  forgot: {
    alignSelf: 'flex-end',
    marginTop: -spacing.xs,
    marginBottom: spacing.md,
    paddingVertical: spacing.xs,
  },
  forgotText: {
    color: colors.mutedText,
    fontSize: 11,
    textDecorationLine: 'underline',
  },
  primaryButton: {
    minHeight: 46,
    alignItems: 'center',
    justifyContent: 'center',
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
