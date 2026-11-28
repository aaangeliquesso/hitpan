import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import { BrandWordmark } from '../../shared/components/BrandWordmark';
import {
  getNavbarSafePadding,
  NAVBAR_HEIGHT,
} from '../../shared/ui/navigation';
import { colors, spacing } from '../../shared/ui/theme';
import type { VanityItem, WishlistItem } from '../../types';
import { usePanItems } from './hooks/usePanItems';
import { getCurrentProgressPercentage } from './progress';
import { getWishlistItemsForYear } from '../wishlist/services/wishlistService';

const palette = {
  background: colors.cream,
  card: colors.backgroundPrimary,
  border: '#E8DFD5',
  burgundy: colors.brand,
  sage: colors.success,
  charcoal: '#2C2522',
  muted: '#796E67',
  track: '#EEE7DF',
  sageSurface: '#EDF2EA',
  burgundySurface: '#F6ECEE',
  error: '#B3262D',
  errorSurface: '#FBEDEE',
} as const;

const DAY_IN_MS = 24 * 60 * 60 * 1000;

interface CategorySummary {
  category: string;
  total: number;
  finished: number;
}

function getUtcYear(value: string): number | null {
  const timestamp = Date.parse(value);
  return Number.isFinite(timestamp)
    ? new Date(timestamp).getUTCFullYear()
    : null;
}

function getDaysBetween(start: string, end: string): number | null {
  const startTime = Date.parse(start);
  const endTime = Date.parse(end);
  if (!Number.isFinite(startTime) || !Number.isFinite(endTime)) return null;

  const days = (endTime - startTime) / DAY_IN_MS;
  return days >= 0 ? days : null;
}

function isFinished(item: VanityItem): boolean {
  if (item.status === 'finished') return true;
  if (item.status === 'decluttered') return false;
  return (
    getCurrentProgressPercentage(item, item.progress_logs?.[0]) >= 100
  );
}

function EmptyStateCard({
  icon,
  title,
  description,
  action,
}: {
  icon: 'bookmark-outline' | 'leaf-outline';
  title: string;
  description: string;
  action: string;
}) {
  return (
    <View style={styles.emptyCard}>
      <View style={styles.emptyIcon}>
        <Ionicons color={palette.burgundy} name={icon} size={22} />
      </View>
      <Text style={styles.emptyTitle}>{title}</Text>
      <Text style={styles.emptyDescription}>{description}</Text>
      <Text style={styles.emptyAction}>{action}</Text>
    </View>
  );
}

function ErrorMessage({ message }: { message: string }) {
  return (
    <Text accessibilityRole="alert" style={styles.errorMessage}>
      {message}
    </Text>
  );
}

export default function AnalyticsScreen() {
  const insets = useSafeAreaInsets();
  const navbarSafePadding = getNavbarSafePadding(insets.bottom);
  const currentYear = new Date().getUTCFullYear();
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [wishlistLoading, setWishlistLoading] = useState(true);
  const [wishlistError, setWishlistError] = useState<Error | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const wishlistRequestId = useRef(0);
  const {
    items: panItems,
    loading: panLoading,
    error: panError,
    refresh: refreshPanItems,
  } = usePanItems();

  const loadWishlistItems = useCallback(async () => {
    const requestId = ++wishlistRequestId.current;
    setWishlistLoading(true);
    setWishlistError(null);

    try {
      const items = await getWishlistItemsForYear(currentYear);
      if (requestId === wishlistRequestId.current) {
        setWishlistItems(items);
      }
    } catch (cause) {
      if (requestId === wishlistRequestId.current) {
        setWishlistError(
          cause instanceof Error
            ? cause
            : new Error('Unable to load wishlist analytics.'),
        );
      }
    } finally {
      if (requestId === wishlistRequestId.current) {
        setWishlistLoading(false);
      }
    }
  }, [currentYear]);

  useEffect(() => {
    void loadWishlistItems();
  }, [loadWishlistItems]);

  const refreshData = useCallback(async () => {
    await Promise.all([loadWishlistItems(), refreshPanItems()]);
  }, [loadWishlistItems, refreshPanItems]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refreshData();
    } finally {
      setRefreshing(false);
    }
  }, [refreshData]);

  const hasFocusedScreen = useRef(false);
  useFocusEffect(
    useCallback(() => {
      if (hasFocusedScreen.current) {
        void refreshData();
      } else {
        hasFocusedScreen.current = true;
      }
    }, [refreshData]),
  );

  const wishlistSummary = useMemo(() => {
    const total = wishlistItems.length;
    const bought = wishlistItems.filter((item) => item.is_bought).length;
    const resisted = total - bought;

    return {
      total,
      bought,
      resisted,
      resistedPercentage: total ? Math.round((resisted / total) * 100) : 0,
      boughtPercentage: total
        ? 100 - Math.round((resisted / total) * 100)
        : 0,
    };
  }, [wishlistItems]);

  const panMetrics = useMemo(() => {
    const cohort = panItems.filter(
      (item) => getUtcYear(item.acquired_on) === currentYear,
    );
    const finished = cohort.filter(isFinished);
    const activeCount = cohort.filter(
      (item) =>
        item.status === 'active' &&
        !isFinished(item),
    ).length;
    const finishedRatings = finished
      .map((item) => item.rating)
      .filter(
        (rating): rating is number =>
          typeof rating === 'number' &&
          Number.isFinite(rating) &&
          rating >= 1 &&
          rating <= 5,
      );
    const categoryMap = new Map<string, CategorySummary>();

    for (const item of cohort) {
      const category = item.category || 'Uncategorized';
      const summary = categoryMap.get(category) ?? {
        category,
        total: 0,
        finished: 0,
      };
      summary.total += 1;
      if (isFinished(item)) summary.finished += 1;
      categoryMap.set(category, summary);
    }

    const durations = finished
      .map((item) => getDaysBetween(item.acquired_on, item.updated_at))
      .filter((days): days is number => days !== null);
    const categories = [...categoryMap.values()].sort(
      (left, right) =>
        right.total - left.total ||
        left.category.localeCompare(right.category),
    );

    return {
      total: cohort.length,
      finished: finished.length,
      activeCount,
      completionPercentage: cohort.length
        ? Math.round((finished.length / cohort.length) * 100)
        : 0,
      wouldRebuy: finishedRatings.filter((rating) => rating >= 4).length,
      skipNextTime: finishedRatings.filter((rating) => rating <= 3).length,
      categories,
      averageDaysToFinish: durations.length
        ? Math.round(
            durations.reduce((sum, days) => sum + days, 0) / durations.length,
          )
        : null,
    };
  }, [currentYear, panItems]);

  const initialLoading =
    (wishlistLoading && wishlistItems.length === 0) ||
    (panLoading && panItems.length === 0);

  return (
    <SafeAreaView edges={['top']} style={styles.screen}>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: navbarSafePadding + NAVBAR_HEIGHT + spacing.lg },
        ]}
        refreshControl={
          <RefreshControl
            onRefresh={() => void onRefresh()}
            refreshing={refreshing}
            tintColor={palette.burgundy}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.brandHeader}>
          <BrandWordmark width={116} />
        </View>
        <Text style={styles.title}>{currentYear} Mindful Overview</Text>
        <Text style={styles.subtitle}>Your consumption loop at a glance</Text>

        {initialLoading ? (
          <View style={styles.loadingState}>
            <ActivityIndicator color={palette.burgundy} size="large" />
            <Text style={styles.loadingText}>Gathering your mindful stats</Text>
          </View>
        ) : (
          <>
            <View style={styles.sectionHeading}>
              <Text style={styles.sectionEyebrow}>PROJECT PAN UTILIZATION</Text>
              <Text style={styles.sectionTitle}>Intentional Finishing</Text>
            </View>
            {panError ? (
              <ErrorMessage message={panError.message} />
            ) : panMetrics.total === 0 ? (
              <EmptyStateCard
                action="Add a product to your Project Pan"
                description={`No products acquired in ${currentYear} yet. Add one to start tracking this year's finishing progress.`}
                icon="leaf-outline"
                title="Your pan starts here"
              />
            ) : (
              <View style={styles.card}>
                <Text style={styles.metricLabel}>
                  {currentYear} Pan Completion Rate
                </Text>
                <View style={styles.completionHeading}>
                  <Text style={styles.completionPercentage}>
                    {panMetrics.completionPercentage}%
                  </Text>
                  <Text style={styles.completionLabel}>Completion Rate</Text>
                </View>
                <View
                  accessibilityLabel={`${panMetrics.completionPercentage}% pan completion`}
                  accessibilityRole="progressbar"
                  style={styles.completionTrack}
                >
                  <View
                    style={[
                      styles.completionBar,
                      { width: `${panMetrics.completionPercentage}%` },
                    ]}
                  />
                </View>
                <View style={styles.completionFooter}>
                  <Text style={styles.completionCount}>
                    {panMetrics.finished} of {panMetrics.total} items panned
                  </Text>
                  <View style={styles.activeBadge}>
                    <Text style={styles.activeBadgeText}>
                      {panMetrics.activeCount} currently panning
                    </Text>
                  </View>
                </View>

                <View style={styles.divider} />
                <Text style={styles.subsectionTitle}>Repurchase verdict</Text>
                <View style={styles.ratingPills}>
                  <View style={[styles.ratingPill, styles.rebuyPill]}>
                    <Text style={styles.ratingStars}>4-5 ★</Text>
                    <Text style={styles.rebuyCount}>{panMetrics.wouldRebuy}</Text>
                    <Text style={styles.ratingCaption}>Would rebuy</Text>
                  </View>
                  <View style={[styles.ratingPill, styles.skipPill]}>
                    <Text style={styles.ratingStars}>1-3 ★</Text>
                    <Text style={styles.skipCount}>{panMetrics.skipNextTime}</Text>
                    <Text style={styles.ratingCaption}>Finished, skip next time</Text>
                  </View>
                </View>

                <View style={styles.divider} />
                <Text style={styles.subsectionTitle}>Category progress</Text>
                {panMetrics.categories.map((category) => {
                  const percentage = Math.round(
                    (category.finished / category.total) * 100,
                  );
                  return (
                    <View key={category.category} style={styles.categoryRow}>
                      <View style={styles.categoryLabelRow}>
                        <Text style={styles.categoryName}>
                          {category.category}
                        </Text>
                        <Text style={styles.categoryCount}>
                          {category.finished}/{category.total}
                        </Text>
                      </View>
                      <View
                        accessibilityLabel={`${category.category}: ${category.finished} of ${category.total} items panned`}
                        accessibilityRole="progressbar"
                        style={styles.categoryTrack}
                      >
                        <View
                          style={[
                            styles.categoryBar,
                            { width: `${percentage}%` },
                          ]}
                        />
                      </View>
                    </View>
                  );
                })}

                <View style={styles.durationPill}>
                  <Ionicons
                    color={palette.burgundy}
                    name="time-outline"
                    size={17}
                  />
                  <Text style={styles.durationText}>
                    Avg.{' '}
                    {panMetrics.averageDaysToFinish === null
                      ? '—'
                      : `${panMetrics.averageDaysToFinish} days`}{' '}
                    to finish
                  </Text>
                </View>
                <Text style={styles.durationNote}>
                  Calculated from acquired_on to updated_at for finished items
                </Text>
              </View>
            )}

            <View style={styles.sectionHeading}>
              <Text style={styles.sectionEyebrow}>WISHLIST HABITS</Text>
              <Text style={styles.sectionTitle}>Mindful Buying</Text>
            </View>
            {wishlistError ? (
              <ErrorMessage message={wishlistError.message} />
            ) : wishlistItems.length === 0 ? (
              <EmptyStateCard
                action="Log your first wishlist item"
                description={`Add items you are considering to track your ${currentYear} mindful buying habits.`}
                icon="bookmark-outline"
                title="Your wishlist starts here"
              />
            ) : (
              <View style={styles.card}>
                <Text style={styles.metricLabel}>
                  {currentYear} Mindful Spending Ratio
                </Text>
                <View style={styles.ratioLabels}>
                  <Text style={styles.resistedLabel}>
                    {wishlistSummary.resistedPercentage}% Resisted
                  </Text>
                  <Text style={styles.boughtLabel}>
                    {wishlistSummary.boughtPercentage}% Bought
                  </Text>
                </View>
                <View
                  accessibilityLabel={`${wishlistSummary.resistedPercentage}% resisted, ${wishlistSummary.boughtPercentage}% bought`}
                  accessibilityRole="progressbar"
                  style={styles.ratioTrack}
                >
                  <View
                    style={[
                      styles.resistedBar,
                      { width: `${wishlistSummary.resistedPercentage}%` },
                    ]}
                  />
                  <View
                    style={[
                      styles.boughtBar,
                      { width: `${wishlistSummary.boughtPercentage}%` },
                    ]}
                  />
                </View>
                <View style={styles.wishlistStats}>
                  <View style={styles.resistedStat}>
                    <Text style={styles.resistedCount}>
                      {wishlistSummary.resisted}
                    </Text>
                    <Text style={styles.resistedDescription}>
                      {wishlistSummary.resisted === 1 ? 'item' : 'items'} paused
                      {' & '}unbought
                    </Text>
                  </View>
                  <View style={styles.boughtPill}>
                    <Ionicons
                      color={palette.burgundy}
                      name="bag-check-outline"
                      size={16}
                    />
                    <Text style={styles.boughtPillText}>
                      {wishlistSummary.bought} bought
                    </Text>
                  </View>
                </View>
                <Text style={styles.totalNote}>
                  Based on {wishlistSummary.total} logged wishlist{' '}
                  {wishlistSummary.total === 1 ? 'item' : 'items'}
                </Text>
              </View>
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: palette.background,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
  },
  brandHeader: {
    alignItems: 'center',
    marginTop: spacing.md,
    marginBottom: spacing.md,
  },
  title: {
    color: palette.charcoal,
    fontSize: 23,
    fontWeight: '800',
  },
  subtitle: {
    marginTop: spacing.xs,
    marginBottom: spacing.lg,
    color: palette.muted,
    fontSize: 13,
  },
  sectionHeading: {
    marginBottom: spacing.sm,
  },
  sectionEyebrow: {
    color: palette.sage,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
  },
  sectionTitle: {
    marginTop: 2,
    color: palette.charcoal,
    fontSize: 19,
    fontWeight: '700',
  },
  card: {
    marginBottom: spacing.lg,
    padding: spacing.md,
    backgroundColor: palette.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 18,
    shadowColor: colors.textPrimary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 2,
  },
  metricLabel: {
    color: palette.muted,
    fontSize: 12,
    fontWeight: '600',
  },
  ratioLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
  },
  resistedLabel: {
    color: palette.sage,
    fontSize: 13,
    fontWeight: '700',
  },
  boughtLabel: {
    color: palette.burgundy,
    fontSize: 13,
    fontWeight: '700',
  },
  ratioTrack: {
    height: 12,
    flexDirection: 'row',
    overflow: 'hidden',
    backgroundColor: palette.track,
    borderRadius: 8,
  },
  resistedBar: {
    height: '100%',
    backgroundColor: palette.sage,
  },
  boughtBar: {
    height: '100%',
    backgroundColor: palette.burgundy,
  },
  wishlistStats: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  resistedStat: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'baseline',
    flexWrap: 'wrap',
    columnGap: spacing.xs,
  },
  resistedCount: {
    color: palette.sage,
    fontSize: 28,
    fontWeight: '800',
  },
  resistedDescription: {
    color: palette.charcoal,
    fontSize: 12,
    fontWeight: '600',
  },
  boughtPill: {
    minHeight: 38,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    backgroundColor: palette.burgundySurface,
    borderRadius: 20,
  },
  boughtPillText: {
    color: palette.burgundy,
    fontSize: 12,
    fontWeight: '700',
  },
  totalNote: {
    marginTop: spacing.sm,
    color: palette.muted,
    fontSize: 11,
  },
  completionHeading: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  completionPercentage: {
    color: palette.charcoal,
    fontSize: 34,
    fontWeight: '800',
  },
  completionLabel: {
    color: palette.muted,
    fontSize: 13,
    fontWeight: '600',
  },
  completionTrack: {
    height: 10,
    overflow: 'hidden',
    backgroundColor: palette.track,
    borderRadius: 7,
  },
  completionBar: {
    height: '100%',
    backgroundColor: palette.burgundy,
    borderRadius: 7,
  },
  completionFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  completionCount: {
    color: palette.charcoal,
    fontSize: 12,
    fontWeight: '600',
  },
  activeBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    backgroundColor: palette.sageSurface,
    borderRadius: 14,
  },
  activeBadgeText: {
    color: palette.sage,
    fontSize: 11,
    fontWeight: '700',
  },
  divider: {
    height: 1,
    marginVertical: spacing.md,
    backgroundColor: palette.border,
  },
  subsectionTitle: {
    marginBottom: spacing.sm,
    color: palette.charcoal,
    fontSize: 13,
    fontWeight: '700',
  },
  ratingPills: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  ratingPill: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xs,
    borderWidth: 1,
    borderRadius: 14,
  },
  rebuyPill: {
    backgroundColor: palette.sageSurface,
    borderColor: '#D5E1D1',
  },
  skipPill: {
    backgroundColor: palette.burgundySurface,
    borderColor: '#E8D3D7',
  },
  ratingStars: {
    color: palette.muted,
    fontSize: 10,
    fontWeight: '700',
  },
  rebuyCount: {
    marginTop: 2,
    color: palette.sage,
    fontSize: 22,
    fontWeight: '800',
  },
  skipCount: {
    marginTop: 2,
    color: palette.burgundy,
    fontSize: 22,
    fontWeight: '800',
  },
  ratingCaption: {
    color: palette.charcoal,
    fontSize: 10,
    fontWeight: '600',
    textAlign: 'center',
  },
  categoryRow: {
    marginBottom: spacing.sm,
  },
  categoryLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  categoryName: {
    color: palette.charcoal,
    fontSize: 12,
    fontWeight: '600',
  },
  categoryCount: {
    color: palette.muted,
    fontSize: 11,
    fontWeight: '600',
  },
  categoryTrack: {
    height: 7,
    overflow: 'hidden',
    backgroundColor: palette.track,
    borderRadius: 5,
  },
  categoryBar: {
    height: '100%',
    backgroundColor: palette.sage,
    borderRadius: 5,
  },
  durationPill: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    backgroundColor: palette.burgundySurface,
    borderRadius: 16,
  },
  durationText: {
    color: palette.burgundy,
    fontSize: 12,
    fontWeight: '700',
  },
  durationNote: {
    marginTop: spacing.xs,
    color: palette.muted,
    fontSize: 10,
  },
  emptyCard: {
    alignItems: 'center',
    marginBottom: spacing.lg,
    padding: spacing.lg,
    backgroundColor: palette.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 18,
    shadowColor: colors.textPrimary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 2,
  },
  emptyIcon: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: palette.burgundySurface,
    borderRadius: 24,
  },
  emptyTitle: {
    marginTop: spacing.sm,
    color: palette.charcoal,
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
  },
  emptyDescription: {
    marginTop: spacing.xs,
    color: palette.muted,
    fontSize: 12,
    lineHeight: 18,
    textAlign: 'center',
  },
  emptyAction: {
    marginTop: spacing.sm,
    color: palette.burgundy,
    fontSize: 12,
    fontWeight: '700',
  },
  loadingState: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 240,
  },
  loadingText: {
    marginTop: spacing.sm,
    color: palette.muted,
    fontSize: 12,
  },
  errorMessage: {
    marginBottom: spacing.lg,
    padding: spacing.md,
    color: palette.error,
    backgroundColor: palette.errorSurface,
    borderWidth: 1,
    borderColor: '#F1CED1',
    borderRadius: 14,
  },
});
