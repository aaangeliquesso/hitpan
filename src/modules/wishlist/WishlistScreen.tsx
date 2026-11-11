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
} from './years';

interface DayGroup {
  key: string;
  label: string;
  items: WishlistItem[];
  sortDate: number;
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
  const groups = useMemo(() => createGroups(filteredItems), [filteredItems]);

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

        {loading && !items.length ? (
          <ActivityIndicator color={colors.brand} style={styles.loader} />
        ) : error ? (
          <Text style={styles.error}>{error.message}</Text>
        ) : (
          groups.map((group) => (
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
                      void updateItem(item.id, { is_bought: value })
                    }
                    onToggleNeed={(value) =>
                      void updateItem(item.id, { is_need: value })
                    }
                    rowNumber={group.items.length - index}
                    saving={savingIds.has(item.id)}
                  />
                ))}
              </View>
            </View>
          ))
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
        }}
        visible={addModalVisible}
      />
      <WishlistYearFilter
        onClose={() => setYearFilterVisible(false)}
        onSelect={(year) => {
          setSelectedYear(year);
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
