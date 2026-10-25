import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StyleSheet, Text, View } from 'react-native';
import { BrandWordmark } from '../../shared/components/BrandWordmark';
import { colors, spacing } from '../../shared/ui/theme';

export default function AnalyticsScreen() {
  return (
    <SafeAreaView edges={['top']} style={styles.screen}>
      <View style={styles.content}>
        <View style={styles.brandHeader}>
          <BrandWordmark width={116} />
        </View>
        <Text style={styles.title}>Home</Text>
        <View style={styles.card}>
          <View style={styles.icon}>
            <Ionicons color={colors.burgundy} name="bar-chart-outline" size={28} />
          </View>
          <Text style={styles.cardTitle}>Your pan, at a glance</Text>
          <Text style={styles.description}>
            Progress charts and product insights will appear here as you track
            your collection.
          </Text>
          <Text style={styles.comingSoon}>Analytics coming soon</Text>
        </View>
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
    paddingTop: spacing.md,
  },
  brandHeader: {
    alignItems: 'center',
    marginTop: spacing.md,
    marginBottom: spacing.xl,
  },
  title: {
    color: colors.text,
    fontSize: 22,
    fontWeight: '700',
    marginBottom: spacing.md,
  },
  card: {
    alignItems: 'center',
    padding: spacing.lg,
    backgroundColor: colors.warmWhite,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 20,
  },
  icon: {
    width: 58,
    height: 58,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F4E0E1',
    borderRadius: 29,
    marginBottom: spacing.md,
  },
  cardTitle: {
    color: colors.burgundy,
    fontSize: 17,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  description: {
    color: colors.mutedText,
    fontSize: 13,
    lineHeight: 20,
    textAlign: 'center',
  },
  comingSoon: {
    color: colors.burgundy,
    fontSize: 12,
    fontWeight: '700',
    marginTop: spacing.md,
  },
});
