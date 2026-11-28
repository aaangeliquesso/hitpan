import { useEffect, useMemo, useRef, useState } from 'react';
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
import { Ionicons } from '@expo/vector-icons';
import { BrandWordmark } from '../../shared/components/BrandWordmark';
import { AddWishlistItemModal } from './components/AddWishlistItemModal';
import {
  getNavbarSafePadding,
  NAVBAR_HEIGHT,
} from '../../shared/ui/navigation';
import { colors, spacing } from '../../shared/ui/theme';
import type { WishlistItem } from '../../types';
import { useWishlist } from './hooks/useWishlist';
import { WishlistItemRow } from './components/WishlistItemRow';
import { WishlistYearFilter } from './components/WishlistYearFilter';
import { getWishlistMonthsWithItems } from './services/wishlistService';
import {
  filterWishlistByYear,
  getAvailableWishlistYears,
  getWishlistItemYear,
} from './years';

interface DayGroup {
  key: string;
  label: string;
  items: WishlistItem[];
  sortDate: number;
}

interface YearGroup {
  year: number;
  days: DayGroup[];
}

function getDayGroup(item: WishlistItem) {
  const timestamp = Date.parse(item.created_at);
  if (Number.isFinite(timestamp)) {
    const date = new Date(timestamp);
    const year = date.getUTCFullYear();
    const month = date.getUTCMonth();
    const day = date.getUTCDate();
    return {
      key: `${year}-${month + 1}-${day}`,
      label: date.toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
        timeZone: 'UTC',
      }),
      sortDate: Date.UTC(year, month, day),
    };
  }

  const monthIndex = new Date(`${item.month_name} 1, ${item.year}`).getMonth();
  const sortDate = Number.isFinite(monthIndex)
    ? Date.UTC(item.year, monthIndex, item.day)
    : 0;
  return {
    key: `${item.year}-${item.month_name}-${item.day}`,
    label: `${item.month_name} ${item.day}, ${item.year}`,
    sortDate,
  };
}

function createGroups(items: WishlistItem[]): DayGroup[] {
  const byDate = new Map<string, DayGroup>();
  for (const item of items) {
    const date = getDayGroup(item);
    const group = byDate.get(date.key) ?? { ...date, items: [] };
    group.items.push(item);
    byDate.set(date.key, group);
  }

  return [...byDate.values()]
    .map((group) => ({
      ...group,
      items: group.items.sort(
        (left, right) =>
          Date.parse(right.created_at) - Date.parse(left.created_at),
      ),
    }))
    .sort((left, right) => right.sortDate - left.sortDate);
}

function getItemYear(item: WishlistItem): number {
  return getWishlistItemYear(item) ?? item.year;
}

function createYearGroups(items: WishlistItem[]): YearGroup[] {
  const itemsByYear = new Map<number, WishlistItem[]>();
  for (const item of items) {
    const year = getItemYear(item);
    const yearItems = itemsByYear.get(year) ?? [];
    yearItems.push(item);
    itemsByYear.set(year, yearItems);
  }

  return [...itemsByYear.entries()]
    .sort(([left], [right]) => right - left)
    .map(([year, yearItems]) => ({
      year,
      days: createGroups(yearItems),
    }));
}

export default function WishlistScreen() {
  const insets = useSafeAreaInsets();
  const navbarSafePadding = getNavbarSafePadding(insets.bottom);
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null);
  const [draftYear, setDraftYear] = useState<number | null>(null);
  const [draftMonth, setDraftMonth] = useState<number | null>(null);
  const [monthsWithItems, setMonthsWithItems] = useState<number[]>([]);
  const [monthsLoading, setMonthsLoading] = useState(false);
  const [monthsError, setMonthsError] = useState<Error | null>(null);
  const {
    items,
    accountCreatedAt,
    loading,
    loadingMore,
    error,
    refresh,
    loadMore,
    addItem,
    updateItem,
    savingIds,
  } = useWishlist(selectedYear, selectedMonth);
  const currentYear = new Date().getUTCFullYear();
  const [expandedYear, setExpandedYear] = useState<number | null>(null);
  const initializedAccordion = useRef(false);
  const [yearFilterVisible, setYearFilterVisible] = useState(false);
  const [addModalVisible, setAddModalVisible] = useState(false);
  useEffect(() => {
    if (!yearFilterVisible || draftYear === null) {
      setMonthsWithItems([]);
      setMonthsLoading(false);
      setMonthsError(null);
      return;
    }

    let cancelled = false;
    setMonthsWithItems([]);
    setMonthsLoading(true);
    setMonthsError(null);

    void getWishlistMonthsWithItems(draftYear)
      .then((months) => {
        if (!cancelled) {
          setMonthsWithItems(months);
        }
      })
      .catch((cause: unknown) => {
        if (!cancelled) {
          setMonthsError(
            cause instanceof Error
              ? cause
              : new Error('Unable to load months for this year.'),
          );
        }
      })
      .finally(() => {
        if (!cancelled) {
          setMonthsLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [draftYear, yearFilterVisible]);
  const availableYears = useMemo(
    () => getAvailableWishlistYears(items, accountCreatedAt, currentYear),
    [accountCreatedAt, currentYear, items],
  );
  const filteredItems = useMemo(
    () => filterWishlistByYear(items, selectedYear, selectedMonth),
    [items, selectedMonth, selectedYear],
  );
  const yearGroups = useMemo(
    () => createYearGroups(filteredItems),
    [filteredItems],
  );
  const allYearGroups = useMemo(() => createYearGroups(items), [items]);
  const activeFilterCount =
    (selectedYear === null ? 0 : 1) + (selectedMonth === null ? 0 : 1);
  useEffect(() => {
    if (!loading && !initializedAccordion.current) {
      setExpandedYear(yearGroups[0]?.year ?? currentYear);
      initializedAccordion.current = true;
    }
  }, [currentYear, loading, yearGroups]);

  return (
    <SafeAreaView edges={['top']} style={styles.screen}>
      <ScrollView
        contentContainerStyle={styles.content}
        onScroll={({ nativeEvent }) => {
          const { contentOffset, contentSize, layoutMeasurement } = nativeEvent;
          if (
            contentOffset.y + layoutMeasurement.height >=
            contentSize.height - 300
          ) {
            void loadMore();
          }
        }}
        scrollEventThrottle={300}
        refreshControl={
          <RefreshControl
            onRefresh={() => void refresh()}
            refreshing={loading}
            tintColor={colors.brand}
          />
        }
      >
        <View style={styles.brandHeader}>
          <BrandWordmark width={116} />
        </View>
        <View style={styles.titleRow}>
          <Text style={styles.title}>My Wishlist</Text>
          <Pressable
            accessibilityLabel="Filter wishlist by year and month"
            accessibilityRole="button"
            onPress={() => {
              setDraftYear(selectedYear);
              setDraftMonth(selectedMonth);
              setYearFilterVisible(true);
            }}
            style={styles.filterButton}
          >
            <Ionicons
              color={colors.neutralIcon}
              name="options-outline"
              size={20}
            />
          </Pressable>
        </View>
        {activeFilterCount > 0 ? (
          <View style={styles.activeFilterRow}>
            <Text style={styles.activeFilterText}>
              {activeFilterCount} filter
              {activeFilterCount === 1 ? '' : 's'} selected
            </Text>
            <Pressable
              accessibilityRole="button"
              onPress={() => {
                setSelectedYear(null);
                setSelectedMonth(null);
                setExpandedYear(allYearGroups[0]?.year ?? currentYear);
              }}
              style={styles.clearFiltersButton}
            >
              <Text style={styles.clearFiltersText}>Clear all</Text>
            </Pressable>
          </View>
        ) : null}

        {loading && !items.length ? (
          <ActivityIndicator color={colors.brand} style={styles.loader} />
        ) : error && !items.length ? (
          <Text style={styles.error}>{error.message}</Text>
        ) : items.length === 0 &&
          selectedYear === null &&
          selectedMonth === null ? (
          <View style={styles.emptyStateCard}>
            <Ionicons
              color={colors.mutedText}
              name="bookmark-outline"
              size={32}
            />
            <Text style={styles.emptyStateTitle}>
              Your mindful journey starts here
            </Text>
            <Text style={styles.emptyStateDescription}>
              Log items you're tempted to buy, evaluate your needs, and track
              your spending intentionality over time.
            </Text>
          </View>
        ) : yearGroups.length ? (
          yearGroups.map((yearGroup) => {
            const isYearOpen = yearGroup.year === expandedYear;
            const yearItemCount = yearGroup.days.reduce(
              (count, day) => count + day.items.length,
              0,
            );

            return (
              <View key={yearGroup.year} style={styles.yearSection}>
                <Pressable
                  accessibilityRole="button"
                  accessibilityState={{ expanded: isYearOpen }}
                  onPress={() =>
                    setExpandedYear(isYearOpen ? null : yearGroup.year)
                  }
                  style={styles.yearHeader}
                >
                  <Text style={styles.yearLabel}>{yearGroup.year}</Text>
                  <Text style={styles.yearCount}>
                    {yearItemCount}{' '}
                    {yearItemCount === 1 ? 'item' : 'items'}
                  </Text>
                  <Ionicons
                    color={colors.mutedText}
                    name={isYearOpen ? 'chevron-up' : 'chevron-down'}
                    size={16}
                  />
                </Pressable>
                {isYearOpen
                  ? yearGroup.days.map((group) => (
                      <View key={group.key} style={styles.dayCard}>
                        <View style={styles.dayHeader}>
                          <Text style={styles.dayLabel}>{group.label}</Text>
                          <View style={styles.itemCountBadge}>
                            <Text style={styles.itemCountText}>
                              {group.items.length}{' '}
                              {group.items.length === 1 ? 'item' : 'items'}
                            </Text>
                          </View>
                        </View>
                        <View style={styles.dayItems}>
                          {group.items.map((item, index) => (
                            <WishlistItemRow
                              item={item}
                              key={item.id}
                              onToggleBought={(value) =>
                                void updateItem(item.id, {
                                  is_bought: value,
                                })
                              }
                              onToggleNeed={(value) =>
                                void updateItem(item.id, {
                                  is_need: value,
                                })
                              }
                              rowNumber={group.items.length - index}
                              saving={savingIds.has(item.id)}
                            />
                          ))}
                        </View>
                      </View>
                    ))
                  : null}
              </View>
            );
          })
        ) : (
          <Text style={styles.noItems}>No wishlist items yet.</Text>
        )}
        {error && items.length ? (
          <Text style={styles.error}>{error.message}</Text>
        ) : null}
        {loadingMore ? (
          <ActivityIndicator
            color={colors.mutedText}
            size="small"
            style={styles.refreshing}
          />
        ) : null}
        {loading && items.length ? (
          <ActivityIndicator color={colors.brand} style={styles.refreshing} />
        ) : null}
      </ScrollView>
      <Pressable
        accessibilityLabel="Add wishlist item"
        accessibilityRole="button"
        onPress={() => setAddModalVisible(true)}
        style={[
          styles.fab,
          { bottom: navbarSafePadding + NAVBAR_HEIGHT + 16 },
        ]}
      >
        <Ionicons color={colors.backgroundPrimary} name="add" size={30} />
      </Pressable>
      <AddWishlistItemModal
        onClose={() => setAddModalVisible(false)}
        onSave={async (input) => {
          await addItem(input);
          setSelectedYear(null);
          setSelectedMonth(null);
          setExpandedYear(currentYear);
        }}
        visible={addModalVisible}
      />
      <WishlistYearFilter
        onClose={() => setYearFilterVisible(false)}
        onClear={() => {
          setDraftYear(null);
          setDraftMonth(null);
          setMonthsWithItems([]);
          setMonthsLoading(false);
          setMonthsError(null);
        }}
        onApply={() => {
          setSelectedYear(draftYear);
          setSelectedMonth(draftMonth);
          setExpandedYear(draftYear ?? allYearGroups[0]?.year ?? null);
          setYearFilterVisible(false);
        }}
        onMonthChange={setDraftMonth}
        onYearChange={(year) => {
          setDraftYear(year);
          setDraftMonth(null);
          setMonthsWithItems([]);
          setMonthsLoading(year !== null);
          setMonthsError(null);
        }}
        selectedMonth={draftMonth}
        selectedYear={draftYear}
        visible={yearFilterVisible}
        years={availableYears}
        monthsWithItems={monthsWithItems}
        monthsLoading={monthsLoading}
        monthsError={monthsError}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.cream,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: 150,
  },
  brandHeader: {
    alignItems: 'center',
    marginTop: spacing.md,
    marginBottom: spacing.md,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  title: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '700',
  },
  yearSection: {
    marginBottom: spacing.sm,
  },
  yearHeader: {
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
    paddingHorizontal: spacing.xs,
  },
  yearLabel: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '700',
  },
  yearCount: {
    color: colors.mutedText,
    fontSize: 12,
    fontWeight: '500',
  },
  noItems: {
    paddingVertical: spacing.md,
    color: colors.mutedText,
    fontSize: 13,
    textAlign: 'center',
  },
  emptyStateCard: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.xs,
    padding: spacing.lg,
    backgroundColor: colors.backgroundPrimary,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 14,
  },
  emptyStateTitle: {
    marginTop: spacing.md,
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  emptyStateDescription: {
    marginTop: spacing.xs,
    color: colors.mutedText,
    fontSize: 13,
    fontWeight: '400',
    lineHeight: 19,
    textAlign: 'center',
  },
  filterButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeFilterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  activeFilterText: {
    color: colors.mutedText,
    fontSize: 12,
    fontWeight: '600',
  },
  clearFiltersButton: {
    minHeight: 32,
    justifyContent: 'center',
    paddingHorizontal: spacing.sm,
  },
  clearFiltersText: {
    color: colors.brand,
    fontSize: 12,
    fontWeight: '700',
  },
  loader: {
    marginTop: 80,
  },
  error: {
    color: colors.error,
    padding: spacing.md,
    backgroundColor: colors.errorSurface,
    borderRadius: 12,
  },
  dayCard: {
    marginBottom: spacing.sm,
    backgroundColor: colors.backgroundPrimary,
    borderColor: '#E5E7EB',
    borderWidth: 1,
    borderRadius: 14,
    shadowColor: colors.textPrimary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  dayHeader: {
    minHeight: 46,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  dayLabel: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: '700',
  },
  itemCountBadge: {
    paddingHorizontal: 9,
    paddingVertical: 4,
    backgroundColor: '#F2F2F7',
    borderRadius: 12,
  },
  itemCountText: {
    color: colors.mutedText,
    fontSize: 11,
    fontWeight: '600',
  },
  dayItems: {
    paddingHorizontal: spacing.md,
  },
  refreshing: {
    margin: spacing.md,
  },
  fab: {
    position: 'absolute',
    right: 24,
    width: 58,
    height: 58,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.brand,
    borderRadius: 29,
    shadowColor: colors.textPrimary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
    zIndex: 999,
  },
});
