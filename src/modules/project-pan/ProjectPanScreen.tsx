import { useCallback, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
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
import { useFocusEffect, useRouter } from 'expo-router';
import { BrandWordmark } from '../../shared/components/BrandWordmark';
import {
  getNavbarSafePadding,
  NAVBAR_HEIGHT,
} from '../../shared/ui/navigation';
import { colors, spacing } from '../../shared/ui/theme';
import { AddPanItemModal } from './components/AddPanItemModal';
import { ProductCard } from './components/ProductCard';
import { getCategoryGroup, PRODUCT_CATEGORIES } from './categories';
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

function matchesCategoryFilters(
  item: VanityItem,
  selectedCategories: Set<string>,
  customCategories: string[],
): boolean {
  if (selectedCategories.size === 0) return true;
  const group = getCategoryGroup(item.category);
  const groupName =
    group?.title ??
    (customCategories.includes(item.category)
      ? 'Custom Categories'
      : undefined);

  return (
    selectedCategories.has(item.category) ||
    (groupName !== undefined && selectedCategories.has(groupName))
  );
}

export default function ProjectPanScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const navbarSafePadding = getNavbarSafePadding(insets.bottom);
  const { items, loading, error, refresh, addItem } = usePanItems();
  const hasFocusedProjectPan = useRef(false);
  const {
    logs,
    error: logsError,
    refresh: refreshLogs,
  } = useProgressLogs();
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(
    () => new Set(),
  );
  const [draftCategories, setDraftCategories] = useState<Set<string>>(
    () => new Set(),
  );
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [addModalVisible, setAddModalVisible] = useState(false);

  useFocusEffect(
    useCallback(() => {
      if (hasFocusedProjectPan.current) {
        void refresh();
      } else {
        hasFocusedProjectPan.current = true;
      }
    }, [refresh]),
  );

  const customCategories = useMemo(() => {
    const predefinedCategories = new Set<string>(
      PRODUCT_CATEGORIES.flatMap((group) => [group.title, ...group.options]),
    );
    return [
      ...new Set(
        items
          .map((item) => item.category)
          .filter((category) => !predefinedCategories.has(category)),
      ),
    ].sort();
  }, [items]);
  const filterGroups = useMemo(
    () => [
      ...PRODUCT_CATEGORIES,
      ...(customCategories.length
        ? [{ title: 'Custom Categories', options: customCategories }]
        : []),
    ],
    [customCategories],
  );
  const filteredItems = useMemo(
    () =>
      items.filter((item) =>
        matchesCategoryFilters(item, selectedCategories, customCategories),
      ),
    [customCategories, items, selectedCategories],
  );
  const draftFilteredCount = useMemo(
    () =>
      items.filter((item) =>
        matchesCategoryFilters(item, draftCategories, customCategories),
      ).length,
    [customCategories, draftCategories, items],
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

  function openCategoryFilter() {
    setDraftCategories(new Set(selectedCategories));
    setFilterModalVisible(true);
  }

  function toggleDraftCategory(category: string) {
    setDraftCategories((current) => {
      const next = new Set(current);
      if (next.has(category)) {
        next.delete(category);
      } else {
        next.add(category);
      }
      return next;
    });
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
            tintColor={colors.neutralIcon}
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
            onPress={openCategoryFilter}
            style={styles.filterButton}
          >
            <Ionicons color={colors.neutralIcon} name="options-outline" size={20} />
          </Pressable>
        </View>
        {selectedCategories.size > 0 ? (
          <View style={styles.activeFilterRow}>
            <Text style={styles.activeFilterText}>
              {selectedCategories.size} filter
              {selectedCategories.size === 1 ? '' : 's'} selected
            </Text>
            <Pressable
              accessibilityRole="button"
              onPress={() => setSelectedCategories(new Set())}
              style={styles.clearFiltersButton}
            >
              <Text style={styles.clearFiltersText}>Clear all</Text>
            </Pressable>
          </View>
        ) : null}
        {logsError ? (
          <Text style={styles.error}>
            Progress photos could not be loaded: {logsError.message}
          </Text>
        ) : null}
        {loading && items.length === 0 ? (
          <ActivityIndicator color={colors.neutralIcon} style={styles.loader} />
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
            <Ionicons color={colors.textSecondary} name="sparkles-outline" size={30} />
            <Text style={styles.emptyTitle}>Your project pan starts here</Text>
            <Text style={styles.emptyText}>
              Add a product you own and track its progress over time.
            </Text>
          </View>
        )}
        {loading && items.length > 0 ? (
          <ActivityIndicator color={colors.neutralIcon} style={styles.refreshing} />
        ) : null}
        <Pressable
          accessibilityLabel="Refresh products"
          accessibilityRole="button"
          onPress={() => void handleRefresh()}
          style={styles.refreshButton}
        >
          <Ionicons color={colors.neutralIcon} name="refresh" size={16} />
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
        <Ionicons color={colors.backgroundPrimary} name="add" size={30} />
      </Pressable>
      <Modal
        animationType="slide"
        onRequestClose={() => setFilterModalVisible(false)}
        statusBarTranslucent
        transparent
        visible={filterModalVisible}
      >
        <View style={styles.filterOverlay}>
          <SafeAreaView edges={['bottom']} style={styles.filterSheet}>
            <View style={styles.filterHeader}>
              <View>
                <Text style={styles.filterTitle}>Filter your pan</Text>
                <Text style={styles.filterSubtitle}>
                  Choose categories and product types.
                </Text>
              </View>
              <Pressable
                accessibilityLabel="Close category filters"
                accessibilityRole="button"
                onPress={() => setFilterModalVisible(false)}
                style={styles.filterCloseButton}
              >
                <Ionicons color={colors.neutralIcon} name="close" size={22} />
              </Pressable>
            </View>
            <ScrollView
              contentContainerStyle={styles.filterList}
              showsVerticalScrollIndicator={false}
            >
              {filterGroups.map((group) => {
                const groupSelected = draftCategories.has(group.title);
                return (
                  <View key={group.title} style={styles.filterGroup}>
                    <Pressable
                      accessibilityRole="checkbox"
                      accessibilityState={{ checked: groupSelected }}
                      onPress={() => toggleDraftCategory(group.title)}
                      style={styles.filterGroupHeader}
                    >
                      <View style={styles.filterGroupHeading}>
                        <Text style={styles.filterGroupTitle}>
                          {group.title}
                        </Text>
                        <Text style={styles.filterGroupCount}>
                          {group.options.length}
                        </Text>
                      </View>
                      <Ionicons
                        color={
                          groupSelected ? colors.brand : colors.mutedText
                        }
                        name={
                          groupSelected
                            ? 'checkbox'
                            : 'square-outline'
                        }
                        size={21}
                      />
                    </Pressable>
                    <View style={styles.filterOptions}>
                      {group.options.map((category) => {
                        const checked = draftCategories.has(category);
                        return (
                          <Pressable
                            accessibilityRole="checkbox"
                            accessibilityState={{ checked }}
                            key={category}
                            onPress={() => toggleDraftCategory(category)}
                            style={[
                              styles.filterOption,
                              checked && styles.selectedFilterOption,
                            ]}
                          >
                            <Text
                              style={[
                                styles.filterOptionText,
                                checked && styles.selectedFilterOptionText,
                              ]}
                            >
                              {category}
                            </Text>
                            {checked ? (
                              <Ionicons
                                color={colors.brand}
                                name="checkmark"
                                size={15}
                              />
                            ) : null}
                          </Pressable>
                        );
                      })}
                    </View>
                  </View>
                );
              })}
            </ScrollView>
            <View style={styles.filterActions}>
              <Pressable
                accessibilityRole="button"
                onPress={() => setDraftCategories(new Set())}
                style={[styles.filterAction, styles.resetFilterAction]}
              >
                <Text style={styles.resetFilterText}>Clear</Text>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                onPress={() => {
                  setSelectedCategories(new Set(draftCategories));
                  setFilterModalVisible(false);
                }}
                style={[styles.filterAction, styles.applyFilterAction]}
              >
                <Text style={styles.applyFilterText}>
                  Show {draftFilteredCount} products
                </Text>
              </Pressable>
            </View>
          </SafeAreaView>
        </View>
      </Modal>
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
  activeFilterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  activeFilterText: {
    color: colors.brand,
    fontSize: 11,
    fontWeight: '600',
  },
  clearFiltersButton: {
    paddingHorizontal: 9,
    paddingVertical: 5,
    backgroundColor: colors.neutralSurface,
    borderRadius: 12,
  },
  clearFiltersText: {
    color: colors.neutralIcon,
    fontSize: 11,
    fontWeight: '600',
  },
  filterOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(18, 18, 18, 0.45)',
  },
  filterSheet: {
    maxHeight: '84%',
    paddingTop: spacing.lg,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.backgroundPrimary,
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
  },
  filterHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  filterTitle: {
    color: colors.textPrimary,
    fontSize: 20,
    fontWeight: '700',
  },
  filterSubtitle: {
    color: colors.mutedText,
    fontSize: 12,
    marginTop: 3,
  },
  filterCloseButton: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 19,
    backgroundColor: colors.backgroundSecondary,
  },
  filterList: {
    paddingBottom: spacing.md,
  },
  filterGroup: {
    paddingVertical: spacing.sm,
    borderBottomColor: colors.border,
    borderBottomWidth: 1,
  },
  filterGroupHeader: {
    minHeight: 36,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  filterGroupHeading: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  filterGroupTitle: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: '700',
  },
  filterGroupCount: {
    minWidth: 20,
    paddingHorizontal: 5,
    paddingVertical: 2,
    overflow: 'hidden',
    color: colors.mutedText,
    backgroundColor: colors.backgroundSecondary,
    borderRadius: 8,
    fontSize: 10,
    textAlign: 'center',
  },
  filterOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  filterOption: {
    minHeight: 34,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: colors.warmWhite,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 17,
  },
  selectedFilterOption: {
    backgroundColor: colors.brandSurface,
    borderColor: colors.brand,
  },
  filterOptionText: {
    color: colors.mutedText,
    fontSize: 11,
  },
  selectedFilterOptionText: {
    color: colors.brand,
    fontWeight: '600',
  },
  filterActions: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
    backgroundColor: colors.backgroundPrimary,
  },
  filterAction: {
    minHeight: 46,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 13,
  },
  resetFilterAction: {
    width: 84,
    backgroundColor: colors.neutralSurface,
  },
  resetFilterText: {
    color: colors.neutralIcon,
    fontSize: 13,
    fontWeight: '600',
  },
  applyFilterAction: {
    flex: 1,
    backgroundColor: colors.brand,
  },
  applyFilterText: {
    color: colors.backgroundPrimary,
    fontSize: 13,
    fontWeight: '700',
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
    color: colors.error,
    padding: spacing.md,
    backgroundColor: colors.errorSurface,
    borderRadius: 12,
  },
  empty: {
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: 76,
  },
  emptyTitle: {
    color: colors.textPrimary,
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
  fabPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.96 }],
  },
});
