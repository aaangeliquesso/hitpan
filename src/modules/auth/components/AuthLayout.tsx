import type { ReactNode } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BrandWordmark } from '../../../shared/components/BrandWordmark';
import { colors, spacing } from '../../../shared/ui/theme';

interface AuthLayoutProps {
  children: ReactNode;
  backButton?: ReactNode;
  variant: 'login' | 'signup';
}

export function AuthLayout({ children, backButton, variant }: AuthLayoutProps) {
  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboard}
      >
        <View
          style={[
            styles.hero,
            variant === 'signup' ? styles.signupHero : styles.loginHero,
          ]}
        >
          <View style={styles.backButton}>{backButton}</View>
          <BrandWordmark color="white" width={220} />
        </View>
        <ScrollView
          contentContainerStyle={styles.sheetContent}
          keyboardShouldPersistTaps="handled"
          style={styles.sheet}
        >
          {children}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.burgundy,
  },
  keyboard: {
    flex: 1,
  },
  hero: {
    minHeight: 218,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.burgundy,
  },
  loginHero: {
    flex: 0.9,
  },
  signupHero: {
    flex: 1.08,
  },
  backButton: {
    position: 'absolute',
    top: spacing.md,
    left: spacing.md,
  },
  sheet: {
    flex: 1.1,
    marginTop: -24,
    backgroundColor: colors.warmWhite,
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
  },
  sheetContent: {
    flexGrow: 1,
    paddingHorizontal: 30,
    paddingTop: 32,
    paddingBottom: spacing.lg,
  },
});
