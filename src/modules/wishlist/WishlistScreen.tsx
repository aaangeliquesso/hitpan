import { useMemo, useState } from 'react';
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
import {
  getNavbarSafePadding,
  NAVBAR_HEIGHT,
} from '../../shared/ui/navigation';
import { colors, spacing } from '../../shared/ui/theme';
import type { WishlistItem } from '../../types';
import { useWishlist } from './hooks/useWishlist';
import {
  WishlistItemRow,
  WishlistTableHeader,
} from './components/WishlistItemRow';
import { WishlistYearFilter } from './components/WishlistYearFilter';
import {
  filterWishlistByYear,
  getAvailableWishlistYears,
  getWishlistItemYear,
} from './years';

interface MonthGroup {
  name: string;
  items: WishlistItem[];
}

interface YearGroup {
  year: number;
  items: WishlistItem[];
  months: MonthGroup[];
}

const monthOrder = [
  'january',
  'february',
  'march',
  'april',
  'may',
  'june',
  'july',
  'august',
  'september',
  'october',
  'november',
  'december',
];

function createGroups(items: WishlistItem[]): YearGroup[] {
  const byYear = new Map<number, WishlistItem[]>();
  for (const item of items) {
    const year = getWishlistItemYear(item) ?? item.year;
    const yearItems = byYear.get(year) ?? [];
    yearItems.push(item);
    byYear.set(year, yearItems);
  }

  return [...byYear.keys()]
    .sort((a, b) => b - a)
    .map((year) => {
      const yearItems = byYear.get(year) ?? [];
      const byMonth = new Map<string, WishlistItem[]>();
      for (const item of yearItems) {
        const monthItems = byMonth.get(item.month_name) ?? [];
        monthItems.push(item);
        byMonth.set(item.month_name, monthItems);
      }

      const months = [...byMonth.entries()]
        .sort(([left], [right]) => {
          const leftOrder = monthOrder.indexOf(left.toLowerCase());
          const rightOrder = monthOrder.indexOf(right.toLowerCase());
          return (
            (leftOrder < 0 ? monthOrder.length : leftOrder) -
            (rightOrder < 0 ? monthOrder.length : rightOrder)
          );
        })
        .map(([name, monthItems]) => ({
          name,
          items: monthItems.sort(
            (a, b) =>
              (a.row_number ?? a.day) - (b.row_number ?? b.day),
          ),
        }));

      return { year, items: yearItems, months };
    });
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
    updateItem,
    savingIds,
  } = useWishlist();
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().toLocaleString(undefined, {
    month: 'long',
  });
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [yearFilterVisible, setYearFilterVisible] = useState(false);
  const [expandedYear, setExpandedYear] = useState<number | null>(currentYear);
  const [expandedMonths, setExpandedMonths] = useState<Set<string>>(
    () => new Set([`${currentYear}-${currentMonth}`]),
  );
  const availableYears = useMemo(
    () => getAvailableWishlistYears(items, accountCreatedAt, currentYear),
    [accountCreatedAt, currentYear, items],
  );
  const filteredItems = useMemo(
    () => filterWishlistByYear(items, selectedYear),
    [items, selectedYear],
  );
  const groups = useMemo(() => createGroups(filteredItems), [filteredItems]);

  function toggleMonth(key: string) {
    setExpandedMonths((current) => {
      const next = new Set(current);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  }

  return (
    <SafeAreaView edges={['top']} style={styles.screen}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            onRefresh={() => void refresh()}
            refreshing={loading}
            tintColor={colors.neutralIcon}
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

        {loading && !items.length ? (
          <ActivityIndicator color={colors.neutralIcon} style={styles.loader} />
        ) : error ? (
          <Text style={styles.error}>{error.message}</Text>
        ) : (
          groups.map((group) => {
            const isYearOpen = expandedYear === group.year;
            return (
              <View key={group.year} style={styles.yearCard}>
                <Pressable
                  accessibilityRole="button"
                  accessibilityState={{ expanded: isYearOpen }}
                  onPress={() =>
                    setExpandedYear(isYearOpen ? null : group.year)
                  }
                  style={styles.yearHeader}
                >
                  <Text style={styles.yearLabel}>{group.year}</Text>
                  <Text style={styles.countBadge}>{group.items.length}</Text>
                  <Ionicons
                    color={colors.neutralIcon}
                    name={isYearOpen ? 'chevron-up' : 'chevron-down'}
                    size={17}
                  />
                </Pressable>
                {isYearOpen ? (
                  <View style={styles.months}>
                    {group.months.length ? (
                      group.months.map((month) => {
                        const monthKey = `${group.year}-${month.name}`;
                        const isMonthOpen = expandedMonths.has(monthKey);
                        return (
                          <View key={monthKey} style={styles.monthBlock}>
                            <Pressable
                              accessibilityRole="button"
                              accessibilityState={{ expanded: isMonthOpen }}
                              onPress={() => toggleMonth(monthKey)}
                              style={styles.monthHeader}
                            >
                              <Text style={styles.monthLabel}>{month.name}</Text>
                              <Text style={styles.monthCount}>
                                {month.items.length}
                              </Text>
                              <Ionicons
                                color={colors.mutedText}
                                name={isMonthOpen ? 'chevron-up' : 'chevron-down'}
                                size={13}
                              />
                            </Pressable>
                            {isMonthOpen ? (
                              <View style={styles.table}>
                                <WishlistTableHeader />
                                {month.items.map((item, index) => (
                                  <WishlistItemRow
                                    item={item}
                                    key={item.id}
                                    onToggleBought={() =>
                                      void updateItem(item.id, {
                                        is_bought: !item.is_bought,
                                      })
                                    }
                                    onToggleNeed={(value) =>
                                      void updateItem(item.id, {
                                        is_need: value,
                                      })
                                    }
                                    rowNumber={index + 1}
                                    saving={savingIds.has(item.id)}
                                  />
                                ))}
                              </View>
                            ) : null}
                          </View>
                        );
                      })
                    ) : (
                      <Text style={styles.noItems}>No wishlist items yet.</Text>
                    )}
                  </View>
                ) : null}
              </View>
            );
          })
        )}
        {loading && items.length ? (
          <ActivityIndicator color={colors.neutralIcon} style={styles.refreshing} />
        ) : null}
        {!loading ? (
          <Pressable
            accessibilityRole="button"
            onPress={() => void refresh()}
            style={styles.refreshButton}
          >
            <Ionicons color={colors.neutralIcon} name="refresh" size={15} />
            <Text style={styles.refreshText}>Refresh wishlist</Text>
          </Pressable>
        ) : null}
      </ScrollView>
      <View
        accessibilityElementsHidden
        style={[
          styles.fab,
          { bottom: navbarSafePadding + NAVBAR_HEIGHT + 16 },
        ]}
      >
        <Ionicons color={colors.backgroundPrimary} name="add" size={30} />
      </View>
      <WishlistYearFilter
        onClose={() => setYearFilterVisible(false)}
        onSelect={(year) => {
          setSelectedYear(year);
          setExpandedYear(year ?? currentYear);
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
  yearCard: {
    marginBottom: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.warmWhite,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 16,
  },
  yearHeader: {
    minHeight: 34,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  yearLabel: {
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: '800',
  },
  countBadge: {
    minWidth: 18,
    paddingHorizontal: 4,
    paddingVertical: 1,
    overflow: 'hidden',
    color: colors.mutedText,
    backgroundColor: colors.backgroundPrimary,
    borderRadius: 5,
    fontSize: 10,
    textAlign: 'center',
  },
  months: {
    paddingTop: spacing.xs,
  },
  monthBlock: {
    marginBottom: spacing.xs,
  },
  monthHeader: {
    minHeight: 28,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  monthLabel: {
    color: colors.textPrimary,
    fontSize: 12,
    fontWeight: '700',
  },
  monthCount: {
    minWidth: 16,
    paddingHorizontal: 3,
    overflow: 'hidden',
    color: colors.mutedText,
    backgroundColor: colors.backgroundPrimary,
    borderRadius: 4,
    fontSize: 9,
    textAlign: 'center',
  },
  table: {
    overflow: 'hidden',
    borderRadius: 8,
  },
  noItems: {
    color: colors.mutedText,
    fontSize: 11,
    paddingBottom: spacing.sm,
  },
  refreshing: {
    margin: spacing.md,
  },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    gap: spacing.xs,
    padding: spacing.sm,
  },
  refreshText: {
    color: colors.neutralIcon,
    fontSize: 12,
    fontWeight: '600',
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
