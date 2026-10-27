import type { ReactNode } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  StatusBar,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BrandWordmark } from '../../../shared/components/BrandWordmark';
import { colors, spacing } from '../../../shared/ui/theme';

interface AuthLayoutProps {
  children: ReactNode;
  backButton?: ReactNode;
}

export function AuthLayout({ children, backButton }: AuthLayoutProps) {
  return (
    <>
      <StatusBar barStyle="dark-content" />
      <SafeAreaView edges={['top', 'left', 'right']} style={styles.safeArea}>
        <View style={styles.hero}>
          <View style={styles.backButton}>{backButton}</View>
          <BrandWordmark color="burgundy" width={220} />
        </View>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboard}
        >
          <ScrollView
            contentContainerStyle={styles.sheetContent}
            keyboardShouldPersistTaps="handled"
            style={styles.sheet}
          >
            {children}
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.backgroundPrimary,
  },
  keyboard: {
    flex: 1,
  },
  hero: {
    height: 168,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.backgroundPrimary,
  },
  backButton: {
    position: 'absolute',
    top: spacing.md,
    left: spacing.md,
  },
  sheet: {
    flex: 1.1,
    marginTop: -24,
    backgroundColor: colors.backgroundPrimary,
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
