import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import {
  ActivityIndicator,
  Pressable,
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
import { getWishlistItemsForAllYears } from '../wishlist/services/wishlistService';
import {
  getWishlistItemMonth,
  getWishlistItemMonthIndex,
} from '../wishlist/years';

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
  progressPercentage: number;
}

interface PanSummary {
  year: number;
  total: number;
  finished: number;
  activeCount: number;
  averageProgressPercentage: number;
  wouldRebuy: number;
  skipNextTime: number;
  categories: CategorySummary[];
  averageDaysToFinish: number | null;
  averageDaysInRotation: number | null;
}

interface WishlistSummary {
  year: number;
  total: number;
  bought: number;
  resisted: number;
  resistedPercentage: number;
  boughtPercentage: number;
  months: WishlistMonthSummary[];
}

interface WishlistMonthSummary {
  monthIndex: number;
  name: string;
  bought: number;
  resisted: number;
  resistedPercentage: number;
  boughtPercentage: number;
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

function getItemProgressPercentage(item: VanityItem): number {
  if (isFinished(item)) return 100;

  const progress = getCurrentProgressPercentage(
    item,
    item.progress_logs?.[0],
  );
  return Math.max(0, Math.min(100, progress));
}

function EmptyStateCard({
  icon,
  title,
  description,
}: {
  icon: 'bookmark-outline' | 'leaf-outline';
  title: string;
  description: string;
}) {
  return (
    <View style={styles.emptyCard}>
      <View style={styles.emptyIcon}>
        <Ionicons color={palette.burgundy} name={icon} size={22} />
      </View>
      <Text style={styles.emptyTitle}>{title}</Text>
      <Text style={styles.emptyDescription}>{description}</Text>
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

function ProjectPanAnalyticsCard({
  summary,
  expanded,
  onToggle,
}: {
  summary: PanSummary;
  expanded: boolean;
  onToggle: () => void;
}) {
  const maxRatingCount = Math.max(
    summary.wouldRebuy,
    summary.skipNextTime,
    1,
  );
  const ratingMetrics = [
    {
      key: 'rebuy',
      label: 'Holy Grails · 4-5 ★',
      count: summary.wouldRebuy,
      barStyle: styles.rebuyChartBar,
    },
    {
      key: 'skip',
      label: 'Skip next time · 1-3 ★',
      count: summary.skipNextTime,
      barStyle: styles.skipChartBar,
    },
  ];

  return (
    <Pressable
      accessibilityLabel={`${summary.year} Project Pan: ${summary.averageProgressPercentage}% average progress`}
      accessibilityRole="button"
      accessibilityState={{ expanded }}
      onPress={onToggle}
      style={({ pressed }) => [
        styles.card,
        pressed && styles.cardPressed,
      ]}
    >
      <View style={styles.panCardHeader}>
        <View>
          <Text style={styles.metricLabel}>{summary.year}</Text>
          <Text style={styles.completionCount}>
            {summary.finished} of {summary.total} finished
          </Text>
        </View>
        <View style={styles.panCardCompletion}>
          <View style={styles.panCardCompletionText}>
            <Text style={styles.completionPercentage}>
              {summary.averageProgressPercentage}%
            </Text>
            <Text style={styles.completionLabel}>avg. progress</Text>
          </View>
          <Ionicons
            color={palette.muted}
            name={expanded ? 'chevron-up' : 'chevron-down'}
            size={18}
          />
        </View>
      </View>
      <View
        accessibilityLabel={`${summary.averageProgressPercentage}% average progress across tracked products`}
        accessibilityRole="progressbar"
        accessibilityValue={{
          min: 0,
          max: 100,
          now: summary.averageProgressPercentage,
        }}
        style={styles.completionTrack}
      >
        <View
          style={[
            styles.completionBar,
            { width: String(summary.averageProgressPercentage) + '%' },
          ]}
        />
        <View
          style={[
            styles.completionRemainingBar,
            {
              width:
                String(100 - summary.averageProgressPercentage) + '%',
            },
          ]}
        />
      </View>

      {expanded ? (
        <View style={styles.expandedPanDetails}>
          <View style={styles.activeBadge}>
            <Text style={styles.activeBadgeText}>
              {summary.activeCount} currently panning
            </Text>
          </View>

          <View style={styles.divider} />
          <Text style={styles.subsectionTitle}>Star ratings</Text>
          {ratingMetrics.map((rating) => {
            const percentage = (rating.count / maxRatingCount) * 100;

            return (
              <View key={rating.key} style={styles.ratingChartRow}>
                <View style={styles.ratingChartHeading}>
                  <Text style={styles.ratingChartLabel}>{rating.label}</Text>
                  <Text style={styles.ratingChartCount}>{rating.count}</Text>
                </View>
                <View
                  accessibilityLabel={`${rating.label}: ${rating.count}`}
                  accessibilityRole="progressbar"
                  accessibilityValue={{
                    min: 0,
                    max: maxRatingCount,
                    now: rating.count,
                  }}
                  style={styles.ratingChartTrack}
                >
                  <View
                    style={[
                      styles.ratingChartBar,
                      rating.barStyle,
                      { width: `${percentage}%` },
                    ]}
                  />
                </View>
              </View>
            );
          })}

          <View style={styles.divider} />
          <Text style={styles.subsectionTitle}>Category progress</Text>
          {summary.categories.map((category) => {
            const percentage = category.progressPercentage;

            return (
              <View key={category.category} style={styles.categoryRow}>
                <View style={styles.categoryLabelRow}>
                  <Text style={styles.categoryName}>{category.category}</Text>
                  <Text style={styles.categoryCount}>
                    {percentage}%
                  </Text>
                </View>
                <View
                  accessibilityLabel={`${category.category}: ${percentage}% average progress across ${category.total} products`}
                  accessibilityRole="progressbar"
                  accessibilityValue={{
                    min: 0,
                    max: 100,
                    now: percentage,
                  }}
                  style={styles.categoryTrack}
                >
                  <View
                    style={[
                      styles.categoryBar,
                      { width: `${percentage}%` },
                    ]}
                  />
                  <View
                    style={[
                      styles.categoryRemainingBar,
                      { width: `${100 - percentage}%` },
                    ]}
                  />
                </View>
              </View>
            );
          })}

          <View style={styles.durationMetrics}>
            <View style={styles.durationPill}>
              <Ionicons
                color={palette.burgundy}
                name="time-outline"
                size={17}
              />
              <Text style={styles.durationText}>
                Avg.{' '}
                {summary.averageDaysToFinish === null
                  ? '—'
                  : `${summary.averageDaysToFinish} days`}{' '}
                to finish
              </Text>
            </View>
            {summary.activeCount > 0 ? (
              <View style={styles.durationPill}>
                <Ionicons
                  color={palette.burgundy}
                  name="time-outline"
                  size={17}
                />
                <Text style={styles.durationText}>
                  Avg.{' '}
                  {summary.averageDaysInRotation === null
                    ? '—'
                    : `${summary.averageDaysInRotation} days`}{' '}
                  in rotation
                </Text>
              </View>
            ) : null}
          </View>
        </View>
      ) : null}
    </Pressable>
  );
}

export default function AnalyticsScreen() {
  const insets = useSafeAreaInsets();
  const navbarSafePadding = getNavbarSafePadding(insets.bottom);
  const [selectedView, setSelectedView] = useState<'project-pan' | 'wishlist'>(
    'project-pan',
  );
  const [expandedPanYear, setExpandedPanYear] = useState<number | null>(null);
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
      const items = await getWishlistItemsForAllYears();
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
  }, []);

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

  const wishlistSummaries = useMemo(() => {
    const itemsByYear = new Map<number, WishlistItem[]>();
    for (const item of wishlistItems) {
      const year = getUtcYear(item.created_at);
      if (year === null) continue;

      const items = itemsByYear.get(year) ?? [];
      items.push(item);
      itemsByYear.set(year, items);
    }

    return [...itemsByYear.entries()]
      .sort(([yearA], [yearB]) => yearB - yearA)
      .map(([year, items]): WishlistSummary => {
        const total = items.length;
        const bought = items.filter((item) => item.is_bought).length;
        const resisted = total - bought;
        const resistedPercentage = Math.round((resisted / total) * 100);
        const itemsByMonth = new Map<number, WishlistItem[]>();

        for (const item of items) {
          const monthIndex = getWishlistItemMonthIndex(item);
          if (monthIndex === null) continue;

          const monthItems = itemsByMonth.get(monthIndex) ?? [];
          monthItems.push(item);
          itemsByMonth.set(monthIndex, monthItems);
        }

        const months = [...itemsByMonth.entries()]
          .sort(([monthA], [monthB]) => monthA - monthB)
          .map(([monthIndex, monthItems]): WishlistMonthSummary => {
            const monthTotal = monthItems.length;
            const monthBought = monthItems.filter(
              (item) => item.is_bought,
            ).length;
            const monthResisted = monthTotal - monthBought;
            const monthResistedPercentage = Math.round(
              (monthResisted / monthTotal) * 100,
            );

            return {
              monthIndex,
              name: getWishlistItemMonth(monthItems[0]),
              bought: monthBought,
              resisted: monthResisted,
              resistedPercentage: monthResistedPercentage,
              boughtPercentage: 100 - monthResistedPercentage,
            };
          });

        return {
          year,
          total,
          bought,
          resisted,
          resistedPercentage,
          boughtPercentage: 100 - resistedPercentage,
          months,
        };
      });
  }, [wishlistItems]);

  const panSummaries = useMemo(() => {
    const itemsByYear = new Map<number, VanityItem[]>();
    for (const item of panItems) {
      const year = getUtcYear(item.acquired_on);
      if (year === null) continue;

      const items = itemsByYear.get(year) ?? [];
      items.push(item);
      itemsByYear.set(year, items);
    }

    return [...itemsByYear.entries()]
      .sort(([yearA], [yearB]) => yearB - yearA)
      .map(([year, cohort]): PanSummary => {
        const finished = cohort.filter(isFinished);
        const activeCount = cohort.filter(
          (item) => item.status === 'active' && !isFinished(item),
        ).length;
        const ratedItems = cohort.filter(
          (item) => item.status === 'active' || isFinished(item),
        );
        const ratedItemsRatings = ratedItems
          .map((item) => item.rating)
          .filter(
            (rating): rating is number =>
              typeof rating === 'number' &&
              Number.isFinite(rating) &&
              rating >= 1 &&
              rating <= 5,
          );
        const categoryMap = new Map<
          string,
          {
            category: string;
            total: number;
            progressTotal: number;
          }
        >();

        for (const item of cohort) {
          const category = item.category || 'Uncategorized';
          const summary = categoryMap.get(category) ?? {
            category,
            total: 0,
            progressTotal: 0,
          };
          summary.total += 1;
          summary.progressTotal += getItemProgressPercentage(item);
          categoryMap.set(category, summary);
        }

        const durations = finished
          .map((item) => getDaysBetween(item.acquired_on, item.updated_at))
          .filter((days): days is number => days !== null);
        const today = new Date().toISOString().slice(0, 10);
        const activeDurations = cohort
          .filter((item) => item.status === 'active' && !isFinished(item))
          .map((item) => getDaysBetween(item.acquired_on, today))
          .filter((days): days is number => days !== null);
        const categories: CategorySummary[] = [...categoryMap.values()]
          .map(({ progressTotal, ...category }) => ({
            ...category,
            progressPercentage: Math.round(
              progressTotal / category.total,
            ),
          }))
          .sort(
            (left, right) =>
              right.total - left.total ||
              left.category.localeCompare(right.category),
          );
        const averageProgressPercentage = Math.round(
          cohort.reduce(
            (totalProgress, item) =>
              totalProgress + getItemProgressPercentage(item),
            0,
          ) / cohort.length,
        );

        return {
          year,
          total: cohort.length,
          finished: finished.length,
          activeCount,
          averageProgressPercentage,
          wouldRebuy: ratedItemsRatings.filter((rating) => rating >= 4).length,
          skipNextTime: ratedItemsRatings.filter((rating) => rating <= 3).length,
          categories,
          averageDaysToFinish: durations.length
            ? Math.round(
                durations.reduce((sum, days) => sum + days, 0) /
                  durations.length,
              )
            : null,
          averageDaysInRotation: activeDurations.length
            ? Math.round(
                activeDurations.reduce((sum, days) => sum + days, 0) /
                  activeDurations.length,
              )
            : null,
        };
      });
  }, [panItems]);

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
        <Text style={styles.title}>My Analytics</Text>
        <View style={styles.segmentedControl}>
          <Pressable
            accessibilityLabel="Show Project Pan analytics"
            accessibilityRole="button"
            accessibilityState={{ selected: selectedView === 'project-pan' }}
            onPress={() => setSelectedView('project-pan')}
            style={({ pressed }) => [
              styles.segmentButton,
              selectedView === 'project-pan' && styles.activeSegmentButton,
              pressed && styles.segmentPressed,
            ]}
          >
            <Text
              style={[
                styles.segmentText,
                selectedView === 'project-pan' && styles.activeSegmentText,
              ]}
            >
              Project Pan
            </Text>
          </Pressable>
          <Pressable
            accessibilityLabel="Show Wishlist analytics"
            accessibilityRole="button"
            accessibilityState={{ selected: selectedView === 'wishlist' }}
            onPress={() => setSelectedView('wishlist')}
            style={({ pressed }) => [
              styles.segmentButton,
              selectedView === 'wishlist' && styles.activeSegmentButton,
              pressed && styles.segmentPressed,
            ]}
          >
            <Text
              style={[
                styles.segmentText,
                selectedView === 'wishlist' && styles.activeSegmentText,
              ]}
            >
              Wishlist
            </Text>
          </Pressable>
        </View>

        {initialLoading ? (
          <View style={styles.loadingState}>
            <ActivityIndicator color={palette.burgundy} size="large" />
            <Text style={styles.loadingText}>Loading analytics</Text>
          </View>
        ) : selectedView === 'project-pan' ? (
          <>
            {panError ? (
              <ErrorMessage message={panError.message} />
            ) : panSummaries.length === 0 ? (
              <EmptyStateCard
                description="Add your first product."
                icon="leaf-outline"
                title="Your pan starts here"
              />
            ) : (
              panSummaries.map((summary) => (
                <ProjectPanAnalyticsCard
                  expanded={expandedPanYear === summary.year}
                  key={summary.year}
                  onToggle={() =>
                    setExpandedPanYear((current) =>
                      current === summary.year ? null : summary.year,
                    )
                  }
                  summary={summary}
                />
              ))
            )}
          </>
        ) : (
          <>
            {wishlistError ? (
              <ErrorMessage message={wishlistError.message} />
            ) : wishlistSummaries.length === 0 ? (
              <EmptyStateCard
                description="Add your first item."
                icon="bookmark-outline"
                title="Your wishlist starts here"
              />
            ) : (
              wishlistSummaries.map((wishlistSummary) => (
                <View key={wishlistSummary.year} style={styles.card}>
                  <Text style={styles.metricLabel}>
                    {wishlistSummary.year}
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
                        {wishlistSummary.resisted === 1 ? 'item' : 'items'}{' '}
                        unbought
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
                  <View style={styles.divider} />
                  <Text style={styles.subsectionTitle}>Monthly</Text>
                  {wishlistSummary.months.map((month) => (
                    <View key={month.monthIndex} style={styles.monthRow}>
                      <View style={styles.monthHeading}>
                        <Text style={styles.monthName}>{month.name}</Text>
                        <Text style={styles.monthCounts}>
                          {month.resisted} unbought · {month.bought} bought
                        </Text>
                      </View>
                      <View
                        accessibilityLabel={`${month.name} ${wishlistSummary.year}: ${month.resistedPercentage}% unbought, ${month.boughtPercentage}% bought`}
                        accessibilityRole="progressbar"
                        style={styles.monthTrack}
                      >
                        <View
                          style={[
                            styles.monthResistedBar,
                            { width: `${month.resistedPercentage}%` },
                          ]}
                        />
                        <View
                          style={[
                            styles.monthBoughtBar,
                            { width: `${month.boughtPercentage}%` },
                          ]}
                        />
                      </View>
                    </View>
                  ))}
                </View>
              ))
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
  segmentedControl: {
    flexDirection: 'row',
    gap: spacing.xs,
    marginTop: spacing.md,
    marginBottom: spacing.lg,
    padding: spacing.xs,
    backgroundColor: palette.track,
    borderWidth: 1,
    borderColor: palette.border,
    borderRadius: 14,
  },
  segmentButton: {
    flex: 1,
    minHeight: 40,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.sm,
    borderRadius: 10,
  },
  activeSegmentButton: {
    backgroundColor: palette.burgundy,
  },
  segmentText: {
    color: palette.muted,
    fontSize: 13,
    fontWeight: '600',
  },
  activeSegmentText: {
    color: colors.backgroundPrimary,
    fontWeight: '700',
  },
  segmentPressed: {
    opacity: 0.8,
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
  cardPressed: {
    opacity: 0.88,
  },
  panCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  panCardCompletion: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  panCardCompletionText: {
    alignItems: 'flex-end',
  },
  expandedPanDetails: {
    marginTop: spacing.sm,
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
  monthRow: {
    marginBottom: spacing.sm,
  },
  monthHeading: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  monthName: {
    width: 72,
    color: palette.charcoal,
    fontSize: 11,
    fontWeight: '600',
  },
  monthCounts: {
    flex: 1,
    color: palette.muted,
    fontSize: 10,
    textAlign: 'right',
  },
  monthTrack: {
    height: 6,
    flexDirection: 'row',
    overflow: 'hidden',
    backgroundColor: palette.track,
    borderRadius: 4,
  },
  monthResistedBar: {
    height: '100%',
    backgroundColor: palette.sage,
  },
  monthBoughtBar: {
    height: '100%',
    backgroundColor: palette.burgundy,
  },
  completionPercentage: {
    color: palette.charcoal,
    fontSize: 28,
    fontWeight: '800',
  },
  completionLabel: {
    color: palette.muted,
    fontSize: 10,
    fontWeight: '600',
  },
  completionTrack: {
    height: 10,
    flexDirection: 'row',
    overflow: 'hidden',
    marginTop: spacing.sm,
    backgroundColor: palette.track,
    borderRadius: 7,
  },
  completionBar: {
    height: '100%',
    backgroundColor: palette.sage,
  },
  completionRemainingBar: {
    height: '100%',
    backgroundColor: palette.track,
  },
  completionCount: {
    color: palette.charcoal,
    fontSize: 12,
    fontWeight: '600',
  },
  activeBadge: {
    alignSelf: 'flex-start',
    marginBottom: spacing.sm,
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
  ratingChartRow: {
    marginBottom: spacing.sm,
  },
  ratingChartHeading: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  ratingChartLabel: {
    color: palette.charcoal,
    fontSize: 11,
    fontWeight: '600',
  },
  ratingChartCount: {
    color: palette.muted,
    fontSize: 11,
    fontWeight: '700',
  },
  ratingChartTrack: {
    height: 8,
    overflow: 'hidden',
    backgroundColor: palette.track,
    borderRadius: 4,
  },
  ratingChartBar: {
    height: '100%',
    borderRadius: 4,
  },
  rebuyChartBar: {
    backgroundColor: palette.sage,
  },
  skipChartBar: {
    backgroundColor: palette.burgundy,
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
    flexDirection: 'row',
    overflow: 'hidden',
    backgroundColor: palette.track,
    borderRadius: 5,
  },
  categoryBar: {
    height: '100%',
    backgroundColor: palette.sage,
  },
  categoryRemainingBar: {
    height: '100%',
    backgroundColor: palette.track,
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
  durationMetrics: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  durationText: {
    color: palette.burgundy,
    fontSize: 12,
    fontWeight: '700',
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
