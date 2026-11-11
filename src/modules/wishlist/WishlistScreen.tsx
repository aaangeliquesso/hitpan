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
  const {
    items,
    accountCreatedAt,
    loading,
    error,
    refresh,
    addItem,
    updateItem,
    savingIds,
  } = useWishlist();
  const currentYear = new Date().getUTCFullYear();
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [expandedYear, setExpandedYear] = useState<number | null>(null);
  const initializedAccordion = useRef(false);
  const [yearFilterVisible, setYearFilterVisible] = useState(false);
  const [addModalVisible, setAddModalVisible] = useState(false);
  const availableYears = useMemo(
    () => getAvailableWishlistYears(items, accountCreatedAt, currentYear),
    [accountCreatedAt, currentYear, items],
  );
  const filteredItems = useMemo(
    () => filterWishlistByYear(items, selectedYear),
    [items, selectedYear],
  );
  const yearGroups = useMemo(
    () => createYearGroups(filteredItems),
    [filteredItems],
  );
  const allYearGroups = useMemo(() => createYearGroups(items), [items]);
  useEffect(() => {
    if (!loading && !initializedAccordion.current) {
      setExpandedYear(yearGroups[0]?.year ?? currentYear);
      initializedAccordion.current = true;
    }
  }, [currentYear, loading, yearGroups]);
  const activeYear =
    selectedYear ??
    expandedYear ??
    yearGroups[0]?.year ??
    currentYear;
  const activeYearItems = useMemo(
    () => filteredItems.filter((item) => getItemYear(item) === activeYear),
    [activeYear, filteredItems],
  );
  const wishlistSummary = useMemo(() => {
    const total = activeYearItems.length;
    const need = activeYearItems.filter((item) => item.is_need).length;
    const bought = activeYearItems.filter((item) => item.is_bought).length;
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
  }, [activeYearItems]);

  return (
    <SafeAreaView edges={['top']} style={styles.screen}>
      <ScrollView
        contentContainerStyle={styles.content}
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
            accessibilityLabel="Filter wishlist by year"
            accessibilityRole="button"
            onPress={() => setYearFilterVisible(true)}
            style={styles.filterButton}
          >
            <Ionicons
              color={colors.neutralIcon}
              name="options-outline"
              size={20}
            />
          </Pressable>
        </View>

        <View style={styles.analyticsCard}>
          <View style={styles.analyticsHeader}>
            <Text style={styles.analyticsTitle}>
              {activeYear} Mindful Spending Ratio
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
          </View>
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
        </View>

        {loading && !items.length ? (
          <ActivityIndicator color={colors.brand} style={styles.loader} />
        ) : error ? (
          <Text style={styles.error}>{error.message}</Text>
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
          setExpandedYear(currentYear);
        }}
        visible={addModalVisible}
      />
      <WishlistYearFilter
        onClose={() => setYearFilterVisible(false)}
        onSelect={(year) => {
          setSelectedYear(year);
          setExpandedYear(year ?? allYearGroups[0]?.year ?? null);
        }}
        selectedYear={selectedYear}
        visible={yearFilterVisible}
        years={availableYears}
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
  yearSection: {
    marginBottom: spacing.sm,
  },
  yearHeader: {
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
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
  filterButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
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
