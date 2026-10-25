import { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
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
import { useRouter } from 'expo-router';
import { BrandWordmark } from '../../shared/components/BrandWordmark';
import {
  getNavbarSafePadding,
  NAVBAR_HEIGHT,
} from '../../shared/ui/navigation';
import { colors, spacing } from '../../shared/ui/theme';
import { AddPanItemModal } from './components/AddPanItemModal';
import { ProductCard } from './components/ProductCard';
import { usePanItems } from './hooks/usePanItems';
import { useProgressLogs } from './hooks/useProgressLogs';
import { createPanItem } from './services/panService';
import type { VanityItem } from '../../types';

function ProductSection({
  title,
  items,
  photoByItem,
  onSelect,
}: {
  title?: string;
  items: VanityItem[];
  photoByItem: Map<string, string>;
  onSelect: (item: VanityItem) => void;
}) {
  if (!items.length) {
    return null;
  }

  return (
    <View>
      {title ? (
        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}> {title} </Text>
          <View style={styles.dividerLine} />
        </View>
      ) : null}
      {items.map((item) => (
        <ProductCard
          imageUrl={photoByItem.get(item.id)}
          item={item}
          key={item.id}
          onPress={() => onSelect(item)}
        />
      ))}
    </View>
  );
}

export default function ProjectPanScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const navbarSafePadding = getNavbarSafePadding(insets.bottom);
  const { items, loading, error, refresh, addItem } = usePanItems();
  const {
    logs,
    error: logsError,
    refresh: refreshLogs,
  } = useProgressLogs();
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [addModalVisible, setAddModalVisible] = useState(false);

  const categories = useMemo(
    () => [...new Set(items.map((item) => item.category))].sort(),
    [items],
  );
  const filteredItems = useMemo(
    () =>
      categoryFilter
        ? items.filter((item) => item.category === categoryFilter)
        : items,
    [categoryFilter, items],
  );
  const photoByItem = useMemo(() => {
    const map = new Map<string, string>();
    for (const log of logs) {
      if (!map.has(log.vanity_item_id)) {
        map.set(log.vanity_item_id, log.photo_url);
      }
    }
    return map;
  }, [logs]);

  function showCategoryFilter() {
    Alert.alert('Filter by category', undefined, [
      {
        text: categoryFilter ? 'Show all' : 'All categories',
        onPress: () => setCategoryFilter(null),
      },
      ...categories.map((category) => ({
        text: category,
        onPress: () => setCategoryFilter(category),
      })),
      { text: 'Cancel', style: 'cancel' },
    ]);
  }

  async function handleRefresh() {
    await Promise.all([refresh(), refreshLogs()]);
  }

  function openDetails(item: VanityItem) {
    router.push({ pathname: '/product/[id]', params: { id: item.id } });
  }

  async function saveProduct(input: Parameters<typeof createPanItem>[0]) {
    addItem(await createPanItem(input));
  }

  const activeItems = filteredItems.filter((item) => item.status === 'active');
  const finishedItems = filteredItems.filter(
    (item) => item.status === 'finished',
  );

  return (
    <SafeAreaView edges={['top']} style={styles.screen}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            onRefresh={() => void handleRefresh()}
            refreshing={loading}
            tintColor={colors.burgundy}
          />
        }
      >
        <View style={styles.brandHeader}>
          <BrandWordmark width={116} />
        </View>
        <View style={styles.titleRow}>
          <Text style={styles.title}>My Project Pan</Text>
          <Pressable
            accessibilityLabel="Filter products by category"
            accessibilityRole="button"
            onPress={showCategoryFilter}
            style={styles.filterButton}
          >
            <Ionicons color={colors.burgundy} name="filter" size={19} />
          </Pressable>
        </View>
        {categoryFilter ? (
          <Pressable
            onPress={() => setCategoryFilter(null)}
            style={styles.activeFilter}
          >
            <Text style={styles.activeFilterText}>{categoryFilter}  ×</Text>
          </Pressable>
        ) : null}
        {logsError ? (
          <Text style={styles.error}>
            Progress photos could not be loaded: {logsError.message}
          </Text>
        ) : null}
        {loading && items.length === 0 ? (
          <ActivityIndicator color={colors.burgundy} style={styles.loader} />
        ) : error ? (
          <Text style={styles.error}>{error.message}</Text>
        ) : filteredItems.length ? (
          <>
            <ProductSection
              items={activeItems}
              onSelect={openDetails}
              photoByItem={photoByItem}
            />
            <ProductSection
              title="Finished"
              items={finishedItems}
              onSelect={openDetails}
              photoByItem={photoByItem}
            />
          </>
        ) : (
          <View style={styles.empty}>
            <Ionicons color={colors.mutedBurgundy} name="sparkles-outline" size={30} />
            <Text style={styles.emptyTitle}>Your project pan starts here</Text>
            <Text style={styles.emptyText}>
              Add a product you own and track its progress over time.
            </Text>
          </View>
        )}
        {loading && items.length > 0 ? (
          <ActivityIndicator color={colors.burgundy} style={styles.refreshing} />
        ) : null}
        <Pressable
          accessibilityLabel="Refresh products"
          accessibilityRole="button"
          onPress={() => void handleRefresh()}
          style={styles.refreshButton}
        >
          <Ionicons color={colors.burgundy} name="refresh" size={16} />
          <Text style={styles.refreshText}>Refresh</Text>
        </Pressable>
      </ScrollView>
      <Pressable
        accessibilityLabel="Add product"
        accessibilityRole="button"
        onPress={() => setAddModalVisible(true)}
        style={({ pressed }) => [
          styles.fab,
          { bottom: navbarSafePadding + NAVBAR_HEIGHT + 16 },
          pressed && styles.fabPressed,
        ]}
      >
        <Ionicons color={colors.burgundy} name="add" size={30} />
      </Pressable>
      <AddPanItemModal
        onClose={() => setAddModalVisible(false)}
        onSave={saveProduct}
        visible={addModalVisible}
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
  activeFilter: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginBottom: spacing.sm,
    backgroundColor: '#F2DDDA',
    borderRadius: 12,
  },
  activeFilterText: {
    color: colors.burgundy,
    fontSize: 11,
    fontWeight: '600',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: spacing.sm,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
  },
  dividerText: {
    color: colors.mutedText,
    fontSize: 11,
  },
  loader: {
    marginTop: 80,
  },
  error: {
    color: colors.burgundy,
    padding: spacing.md,
  },
  empty: {
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: 76,
  },
  emptyTitle: {
    color: colors.burgundy,
    fontSize: 16,
    fontWeight: '700',
    marginTop: spacing.md,
  },
  emptyText: {
    color: colors.mutedText,
    fontSize: 13,
    lineHeight: 20,
    marginTop: spacing.xs,
    textAlign: 'center',
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
    color: colors.burgundy,
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
    backgroundColor: colors.cyan,
    borderRadius: 29,
    shadowColor: '#301A1A',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
    zIndex: 999,
  },
  fabPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.96 }],
  },
});
