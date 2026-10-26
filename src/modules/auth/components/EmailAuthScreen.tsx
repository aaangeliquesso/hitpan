import { useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'expo-router';
import * as Linking from 'expo-linking';
import { supabase } from '../../../lib/supabase';
import { colors, spacing } from '../../../shared/ui/theme';
import { AuthField } from './AuthField';
import { AuthLayout } from './AuthLayout';
import {
  authFormSchema,
  type AuthFormValues,
} from '../validation';

type AuthMode = 'login' | 'signup';

interface EmailAuthScreenProps {
  initialMode: AuthMode;
}

interface Feedback {
  kind: 'error' | 'success';
  message: string;
}

function getAuthErrorMessage(cause: unknown, mode: AuthMode): string {
  const error = cause as {
    code?: unknown;
    message?: unknown;
    name?: unknown;
  };
  const message =
    typeof error?.message === 'string' ? error.message.toLowerCase() : '';
  const code = typeof error?.code === 'string' ? error.code.toLowerCase() : '';
  const name = typeof error?.name === 'string' ? error.name.toLowerCase() : '';

  if (
    name === 'typeerror' ||
    /network|fetch failed|failed to fetch|network request failed/.test(message)
  ) {
    return 'Network error. Please check your connection and try again.';
  }

  if (
    mode === 'signup' &&
    /invalid path|invalid.*(?:url|uri)|uri.*invalid/.test(message)
  ) {
    return 'The signup redirect URL is invalid. Check the Supabase URL and allowed redirect URLs.';
  }

  if (
    mode === 'signup' &&
    (code.includes('rate_limit') ||
      code.includes('over_email_send_rate_limit') ||
      /rate limit|too many requests|too many signup attempts/.test(message))
  ) {
    return 'Too many signup attempts. Please wait a while before trying again.';
  }

  if (
    mode === 'login' &&
    (code === 'email_not_confirmed' ||
      /email not confirmed|email_not_confirmed|unverified email/.test(message))
  ) {
    return 'Please check your inbox and verify your email before logging in.';
  }

  if (
    mode === 'signup' &&
    (code === 'user_already_exists' ||
      code === 'email_exists' ||
      /user already registered|user_already_exists|email already (?:exists|registered)/.test(
        message,
      ))
  ) {
    return 'An account with this email already exists.';
  }

  if (
    mode === 'login' &&
    (code === 'invalid_credentials' ||
      /invalid login credentials|invalid credentials|invalid_credentials|account not found|user not found/.test(
        message,
      ))
  ) {
    return 'Invalid email or password. Please check your details or sign up.';
  }

  return 'Something went wrong. Please try again.';
}

export function EmailAuthScreen({ initialMode }: EmailAuthScreenProps) {
  const router = useRouter();
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [resetLoading, setResetLoading] = useState(false);
  const [resetEmailError, setResetEmailError] = useState<string | null>(null);
  const {
    control,
    getValues,
    handleSubmit,
    setValue,
    trigger,
    clearErrors,
    formState: { errors, isSubmitting },
  } = useForm<AuthFormValues>({
    resolver: zodResolver(authFormSchema),
    mode: 'onChange',
    reValidateMode: 'onChange',
    defaultValues: {
      mode: initialMode,
      email: '',
      password: '',
      confirmPassword: '',
    },
  });
  const loading = isSubmitting || resetLoading;
  const isSignup = mode === 'signup';

  function changeMode(nextMode: AuthMode) {
    if (loading || nextMode === mode) return;
    setMode(nextMode);
    setValue('mode', nextMode);
    clearErrors();
    setFeedback(null);
  }

  async function submit(values: AuthFormValues) {
    setFeedback(null);
    try {
      if (values.mode === 'signup') {
        const { data, error } = await supabase.auth.signUp({
          email: values.email,
          password: values.password,
          options: {
            emailRedirectTo: Linking.createURL('/'),
          },
        });
        if (error) throw error;
        if (data.session) {
          router.replace('/(tabs)/home');
          return;
        }
        setFeedback({
          kind: 'success',
          message:
            'Check your email for the verification link sent by Supabase to finish creating your account.',
        });
        return;
      }

      const { error } = await supabase.auth.signInWithPassword({
        email: values.email,
        password: values.password,
      });
      if (error) throw error;
      router.replace('/(tabs)/home');
    } catch (error) {
      if (values.mode === 'signup') {
        console.error('SignUp Error:', error);
      }
      setFeedback({
        kind: 'error',
        message: getAuthErrorMessage(error, values.mode),
      });
    }
  }

  async function sendPasswordReset() {
    if (loading || !(await trigger('email'))) return;
    const email = getValues('email').trim().toLowerCase();
    setResetLoading(true);
    setResetEmailError(null);
    setFeedback(null);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: 'hitpan://reset-password',
      });
      if (error) {
        setResetEmailError('No account found with this email address.');
        return;
      }
      setFeedback({
        kind: 'success',
        message: 'Password reset link sent! Please check your inbox.',
      });
    } catch {
      setResetEmailError('No account found with this email address.');
    } finally {
      setResetLoading(false);
    }
  }

  return (
    <AuthLayout>
      <Text style={styles.heading}>
        {isSignup ? 'Create your account' : 'Welcome back'}
      </Text>

      <View accessibilityLabel="Authentication mode" style={styles.modeTabs}>
        {(['login', 'signup'] as const).map((tabMode) => {
          const selected = tabMode === mode;
          return (
            <Pressable
              key={tabMode}
              accessibilityRole="button"
              accessibilityState={{ selected }}
              disabled={loading}
              onPress={() => changeMode(tabMode)}
              style={[styles.modeTab, selected && styles.modeTabSelected]}
            >
              <Text
                style={[
                  styles.modeTabLabel,
                  selected && styles.modeTabLabelSelected,
                ]}
              >
                {tabMode === 'login' ? 'Log In' : 'Sign Up'}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {feedback ? (
        <Text
          accessibilityLiveRegion={
            feedback.kind === 'error' ? 'assertive' : 'polite'
          }
          accessibilityRole={feedback.kind === 'error' ? 'alert' : 'text'}
          style={[
            styles.feedback,
            feedback.kind === 'success'
              ? styles.successFeedback
              : styles.errorFeedback,
          ]}
        >
          {feedback.message}
        </Text>
      ) : null}

      <Controller
        control={control}
        name="email"
        render={({ field }) => (
          <AuthField
            autoCapitalize="none"
            error={resetEmailError ?? errors.email?.message}
            keyboardType="email-address"
            label="Email Address"
            onChangeText={(text) => {
              field.onChange(text);
              setResetEmailError(null);
              setFeedback(null);
            }}
            textContentType="emailAddress"
            value={field.value}
          />
        )}
      />
      <Controller
        control={control}
        name="password"
        render={({ field }) => (
          <AuthField
            error={errors.password?.message}
            label="Password"
            onChangeText={(text) => {
              field.onChange(text);
              setFeedback(null);
            }}
            secureTextEntry={true}
            textContentType={isSignup ? 'newPassword' : 'password'}
            value={field.value}
          />
        )}
      />
      {isSignup ? (
        <Controller
          control={control}
          name="confirmPassword"
          render={({ field }) => (
            <AuthField
              error={errors.confirmPassword?.message}
              label="Confirm Password"
              onChangeText={(text) => {
                field.onChange(text);
                setFeedback(null);
              }}
              secureTextEntry={true}
              textContentType="newPassword"
              value={field.value ?? ''}
            />
          )}
        />
      ) : (
        <Pressable
          accessibilityRole="button"
          disabled={loading}
          onPress={() => void sendPasswordReset()}
          style={styles.forgot}
        >
          {resetLoading ? (
            <ActivityIndicator color={colors.burgundy} size="small" />
          ) : (
            <Text style={styles.forgotLabel}>Forgot password?</Text>
          )}
        </Pressable>
      )}

      <Pressable
        accessibilityRole="button"
        disabled={loading}
        onPress={() => void handleSubmit(submit)()}
        style={[styles.submitButton, loading && styles.disabled]}
      >
        {isSubmitting ? (
          <ActivityIndicator color={colors.warmWhite} />
        ) : (
          <Text style={styles.submitLabel}>
            {isSignup ? 'Create account' : 'Log In'}
          </Text>
        )}
      </Pressable>
    </AuthLayout>
  );
}

const styles = StyleSheet.create({
  heading: {
    marginBottom: spacing.md,
    color: colors.text,
    fontSize: 18,
    fontWeight: '700',
  },
  modeTabs: {
    flexDirection: 'row',
    marginBottom: spacing.lg,
    padding: 4,
    backgroundColor: '#F1E5E1',
    borderRadius: 14,
  },
  modeTab: {
    flex: 1,
    minHeight: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 11,
  },
  modeTabSelected: {
    backgroundColor: colors.burgundy,
  },
  modeTabLabel: {
    color: colors.burgundy,
    fontSize: 13,
    fontWeight: '600',
  },
  modeTabLabelSelected: {
    color: colors.warmWhite,
  },
  feedback: {
    marginBottom: spacing.md,
    padding: spacing.md,
    borderRadius: 12,
    fontSize: 13,
    lineHeight: 19,
  },
  successFeedback: {
    color: colors.success,
    backgroundColor: '#EAF3EA',
  },
  errorFeedback: {
    color: colors.burgundy,
    backgroundColor: '#F8E2E0',
  },
  forgot: {
    minHeight: 30,
    alignSelf: 'flex-end',
    justifyContent: 'center',
    marginTop: -spacing.sm,
    marginBottom: spacing.md,
  },
  forgotLabel: {
    color: colors.mutedText,
    fontSize: 12,
    textDecorationLine: 'underline',
  },
  submitButton: {
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.xs,
    backgroundColor: colors.burgundy,
    borderRadius: 13,
  },
  disabled: {
    opacity: 0.65,
  },
  submitLabel: {
    color: colors.warmWhite,
    fontSize: 14,
    fontWeight: '700',
  },
});
