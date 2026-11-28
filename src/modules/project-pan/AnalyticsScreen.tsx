import { useCallback, useMemo, useRef } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';
import { BrandWordmark } from '../../shared/components/BrandWordmark';
import { colors, spacing } from '../../shared/ui/theme';
import { useWishlist } from '../wishlist/hooks/useWishlist';
import { usePanItems } from './hooks/usePanItems';

export default function AnalyticsScreen() {
  const currentYear = new Date().getUTCFullYear();
  const {
    items: wishlistItems,
    loading,
    error,
  } = useWishlist(currentYear);
  const {
    items: panItems,
    loading: panLoading,
    error: panError,
    refresh: refreshPanItems,
  } = usePanItems();
  const hasFocusedHome = useRef(false);
  useFocusEffect(
    useCallback(() => {
      if (hasFocusedHome.current) {
        void refreshPanItems();
      } else {
        hasFocusedHome.current = true;
      }
    }, [refreshPanItems]),
  );
  const wishlistSummary = useMemo(() => {
    const total = wishlistItems.length;
    const need = wishlistItems.filter((item) => item.is_need).length;
    const bought = wishlistItems.filter((item) => item.is_bought).length;
    const needPercentage = total ? (need / total) * 100 : 0;
    const boughtPercentage = total ? (bought / total) * 100 : 0;
    const markedPercentage = needPercentage + boughtPercentage;
    const barScale = markedPercentage > 100 ? 100 / markedPercentage : 1;

    return {
      total,
      need,
      bought,
      needPercentage,
      boughtPercentage,
      needBarPercentage: needPercentage * barScale,
      boughtBarPercentage: boughtPercentage * barScale,
    };
  }, [wishlistItems]);

  return (
    <SafeAreaView edges={['top']} style={styles.screen}>
      <View style={styles.content}>
        <View style={styles.brandHeader}>
          <BrandWordmark width={116} />
        </View>
        <Text style={styles.title}>Home</Text>
        <View style={styles.analyticsCard}>
          <View style={styles.analyticsHeader}>
            <Text style={styles.analyticsTitle}>
              {currentYear} Mindful Spending Ratio
            </Text>
            <Text style={styles.analyticsTotal}>
              {wishlistSummary.total}{' '}
              {wishlistSummary.total === 1 ? 'item' : 'items'}
            </Text>
          </View>
          <View
            accessibilityLabel={`${wishlistSummary.needPercentage.toFixed(0)}% intentional, ${wishlistSummary.boughtPercentage.toFixed(0)}% purchased`}
            accessibilityRole="progressbar"
            style={styles.analyticsBar}
          >
            {wishlistSummary.total > 0 ? (
              <>
                <View
                  style={[
                    styles.needBar,
                    { width: `${wishlistSummary.needBarPercentage}%` },
                  ]}
                />
                <View
                  style={[
                    styles.boughtBar,
                    { width: `${wishlistSummary.boughtBarPercentage}%` },
                  ]}
                />
              </>
            ) : null}
          </View>
          {loading && !wishlistItems.length ? (
            <ActivityIndicator
              color={colors.brand}
              style={styles.analyticsStatus}
            />
          ) : error && !wishlistItems.length ? (
            <Text style={styles.analyticsError}>{error.message}</Text>
          ) : wishlistSummary.total > 0 ? (
            <View style={styles.analyticsMetrics}>
              <Text style={styles.needMetric}>
                {wishlistSummary.needPercentage.toFixed(0)}% Intentional (
                {wishlistSummary.need})
              </Text>
              <Text style={styles.boughtMetric}>
                {wishlistSummary.boughtPercentage.toFixed(0)}% Purchased (
                {wishlistSummary.bought})
              </Text>
            </View>
          ) : (
            <Text style={styles.analyticsEmptyCaption}>
              No items logged yet
            </Text>
          )}
        </View>
        {panLoading && !panItems.length ? (
          <ActivityIndicator color={colors.brand} style={styles.panStatus} />
        ) : panError ? (
          <Text style={styles.panError}>{panError.message}</Text>
        ) : panItems.length === 0 ? (
          <View style={styles.card}>
            <View style={styles.icon}>
              <Ionicons
                color={colors.neutralIcon}
                name="bar-chart-outline"
                size={28}
              />
            </View>
            <Text style={styles.cardTitle}>Your pan, at a glance</Text>
            <Text style={styles.description}>
              Progress charts and product insights will appear here as you
              track your collection.
            </Text>
            <Text style={styles.comingSoon}>Analytics coming soon</Text>
          </View>
        ) : null}
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
    marginBottom: spacing.md,
  },
  title: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: spacing.md,
  },
  analyticsCard: {
    marginBottom: spacing.md,
    padding: spacing.md,
    backgroundColor: colors.backgroundPrimary,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
  },
  analyticsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  analyticsTitle: {
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: '700',
  },
  analyticsTotal: {
    color: colors.mutedText,
    fontSize: 12,
    fontWeight: '600',
  },
  analyticsBar: {
    height: 11,
    flexDirection: 'row',
    overflow: 'hidden',
    backgroundColor: '#E5E5EA',
    borderRadius: 6,
  },
  analyticsStatus: {
    marginTop: spacing.sm,
  },
  analyticsError: {
    marginTop: spacing.sm,
    color: colors.error,
    fontSize: 12,
  },
  analyticsEmptyCaption: {
    marginTop: spacing.sm,
    color: colors.mutedText,
    fontSize: 12,
    textAlign: 'center',
  },
  needBar: {
    height: '100%',
    backgroundColor: colors.wishlistNeed,
  },
  boughtBar: {
    height: '100%',
    backgroundColor: colors.wishlistBought,
  },
  analyticsMetrics: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  needMetric: {
    flex: 1,
    color: colors.wishlistNeed,
    fontSize: 11,
    fontWeight: '600',
  },
  boughtMetric: {
    flex: 1,
    color: colors.wishlistBought,
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'right',
  },
  card: {
    alignItems: 'center',
    padding: spacing.lg,
    backgroundColor: colors.warmWhite,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 20,
  },
  panStatus: {
    marginTop: spacing.md,
  },
  panError: {
    marginTop: spacing.md,
    padding: spacing.md,
    color: colors.error,
    backgroundColor: colors.errorSurface,
    borderRadius: 12,
  },
  icon: {
    width: 58,
    height: 58,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.brandSurface,
    borderRadius: 29,
    marginBottom: spacing.md,
  },
  cardTitle: {
    color: colors.textPrimary,
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
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '700',
    marginTop: spacing.md,
  },
});
