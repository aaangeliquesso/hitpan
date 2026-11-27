import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BrandWordmark } from '../../src/shared/components/BrandWordmark';
import { ConfirmationModal } from '../../src/shared/components/ConfirmationModal';
import { StarRating } from '../../src/shared/components/StarRating';
import { colors, spacing } from '../../src/shared/ui/theme';
import { ProgressBar } from '../../src/modules/project-pan/components/ProgressBar';
import { ProgressLogCard } from '../../src/modules/project-pan/components/ProgressLogCard';
import { LogProgressModal } from '../../src/modules/project-pan/components/LogProgressModal';
import {
  deletePanItem,
  getPanItemById,
  updatePanItem,
} from '../../src/modules/project-pan/services/panService';
import { createProgressLog } from '../../src/modules/project-pan/services/progressLogService';
import {
  getCurrentProgressPercentage,
  getProgressTextColor,
} from '../../src/modules/project-pan/progress';
import { useProgressLogs } from '../../src/modules/project-pan/hooks/useProgressLogs';
import type { VanityItem } from '../../src/types';
import { AddPanItemModal } from '../../src/modules/project-pan/components/AddPanItemModal';

export default function ProductDetailsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [item, setItem] = useState<VanityItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteConfirmationVisible, setDeleteConfirmationVisible] =
    useState(false);
  const [editVisible, setEditVisible] = useState(false);
  const [logProgressVisible, setLogProgressVisible] = useState(false);
  const {
    logs,
    loading: logsLoading,
    error: logsError,
    refresh: refreshLogs,
  } = useProgressLogs(id);
  const progressPercentage = item
    ? getCurrentProgressPercentage(item, logs[0])
    : 0;
  const productImageUrl =
    logs[0]?.photo_url ?? item?.image_url ?? undefined;

  const loadItem = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setItem(await getPanItemById(id));
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : 'Unable to load this product.',
      );
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void loadItem();
  }, [loadItem]);

  function confirmDelete() {
    if (!item || deleting) return;
    setDeleteConfirmationVisible(true);
  }

  async function handleDelete() {
    if (!item || deleting) return;

    setDeleting(true);
    try {
      await deletePanItem(item.id);
      router.back();
    } catch (cause) {
      Alert.alert(
        'Product not deleted',
        cause instanceof Error ? cause.message : 'Please try again.',
      );
    } finally {
      setDeleting(false);
    }
  }

  async function saveProgress(
    input: Parameters<typeof createProgressLog>[0],
  ) {
    await createProgressLog(input);
    await refreshLogs();
  }

  async function saveProductChanges(
    input: Parameters<typeof updatePanItem>[1],
  ) {
    if (!item) {
      throw new Error('This product could not be found.');
    }

    const updatedItem = await updatePanItem(item.id, input);
    setItem(updatedItem);
  }

  return (
    <>
      <SafeAreaView edges={['top']} style={styles.screen}>
        <View style={styles.header}>
          <Pressable
            accessibilityLabel="Go back"
            accessibilityRole="button"
            hitSlop={10}
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Ionicons color={colors.neutralIcon} name="arrow-back" size={22} />
          </Pressable>
          <BrandWordmark width={112} />
        </View>
        {loading ? (
          <ActivityIndicator color={colors.neutralIcon} style={styles.loader} />
        ) : error ? (
          <Text style={styles.error}>{error}</Text>
        ) : item ? (
          <ScrollView contentContainerStyle={styles.content}>
            <View style={styles.productCard}>
              <View style={styles.productHero}>
                {productImageUrl ? (
                  <Image
                    accessibilityLabel={`${item.name} product photo`}
                    source={{ uri: productImageUrl }}
                    style={styles.productImage}
                  />
                ) : (
                  <View style={styles.productImagePlaceholder}>
                    <Ionicons
                      color={colors.textSecondary}
                      name="image-outline"
                      size={32}
                    />
                  </View>
                )}
                <View style={styles.productInfo}>
                  <Text numberOfLines={2} style={styles.productName}>
                    {item.name}
                  </Text>
                  <Text numberOfLines={2} style={styles.productSubtitle}>
                    {item.brand}
                    {item.variant ? ` · ${item.variant}` : ''}
                  </Text>
                  <View style={styles.badgeRow}>
                    <Text
                      numberOfLines={1}
                      style={[styles.badge, styles.categoryBadge]}
                    >
                      {item.category}
                    </Text>
                    {item.acquisition_type === 'gifted' ? (
                      <Text style={[styles.badge, styles.giftBadge]}>Gift</Text>
                    ) : typeof item.price === 'number' ? (
                      <Text style={[styles.badge, styles.priceBadge]}>
                        ₱{item.price.toLocaleString()}
                      </Text>
                    ) : null}
                  </View>
                </View>
              </View>
              <View style={styles.acquiredRow}>
                <Ionicons
                  color={colors.neutralIcon}
                  name="calendar-outline"
                  size={16}
                />
                <Text style={styles.acquiredDate}>
                  {item.acquisition_type === 'gifted'
                    ? 'Received on'
                    : 'Bought on'}{' '}
                  {new Date(`${item.acquired_on}T00:00:00`).toLocaleDateString(
                    undefined,
                    { month: 'long', day: 'numeric', year: 'numeric' },
                  )}
                </Text>
              </View>
              <View style={styles.productActions}>
                <Pressable
                  accessibilityLabel="Edit product"
                  accessibilityRole="button"
                  onPress={() => setEditVisible(true)}
                  style={({ pressed }) => [
                    styles.productActionButton,
                    styles.editProductButton,
                    pressed && styles.productActionPressed,
                  ]}
                >
                  <Ionicons
                    color={colors.neutralIcon}
                    name="create-outline"
                    size={17}
                  />
                  <Text style={styles.editProductText}>Edit product</Text>
                </Pressable>
                <Pressable
                  accessibilityLabel="Delete product"
                  accessibilityRole="button"
                  disabled={deleting}
                  onPress={confirmDelete}
                  style={({ pressed }) => [
                    styles.productActionButton,
                    styles.deleteProductButton,
                    pressed && styles.productActionPressed,
                  ]}
                >
                  {deleting ? (
                    <ActivityIndicator color={colors.error} size="small" />
                  ) : (
                    <Ionicons
                      color={colors.error}
                      name="trash-outline"
                      size={17}
                    />
                  )}
                  <Text style={styles.deleteProductText}>Delete</Text>
                </Pressable>
              </View>
              <View style={styles.ratingCard}>
                <View style={styles.ratingHeader}>
                  <View>
                    <Text style={styles.ratingTitle}>Your rating</Text>
                    <Text style={styles.ratingSubtitle}>
                      Edit product to update this rating
                    </Text>
                  </View>
                  <View style={styles.ratingValueBadge}>
                    <Text style={styles.ratingValueText}>
                      {item.rating ? `${item.rating}/5` : 'Not rated'}
                    </Text>
                  </View>
                </View>
                <View style={styles.ratingDisplay}>
                  <StarRating rating={item.rating ?? 0} size={22} />
                </View>
              </View>
              <View style={styles.progressCard}>
                <View style={styles.progressHeader}>
                  <View>
                    <Text style={styles.progressTitle}>Usage progress</Text>
                    <Text style={styles.progressSubtitle}>
                      Keep logging your product use
                    </Text>
                  </View>
                  <Text
                    style={[
                      styles.progressValue,
                      { color: getProgressTextColor(progressPercentage) },
                    ]}
                  >
                    {progressPercentage}%
                  </Text>
                </View>
                <ProgressBar progress={progressPercentage} />
              </View>
              <Pressable
                accessibilityRole="button"
                onPress={() => setLogProgressVisible(true)}
                style={({ pressed }) => [
                  styles.logProgressButton,
                  pressed && styles.logProgressButtonPressed,
                ]}
              >
                <Ionicons
                  color={colors.backgroundPrimary}
                  name="camera-outline"
                  size={18}
                />
                <Text style={styles.logProgressButtonText}>Log Progress</Text>
              </Pressable>
            </View>

            <View style={styles.sectionHeading}>
              <View style={styles.rule} />
              <Text style={styles.sectionTitle}>Progress</Text>
              <View style={styles.rule} />
            </View>
            {logsLoading ? (
              <ActivityIndicator color={colors.neutralIcon} />
            ) : logsError ? (
              <Text style={styles.error}>{logsError.message}</Text>
            ) : logs.length ? (
              <View style={styles.logs}>
                {logs.map((log) => (
                  <ProgressLogCard key={log.id} log={log} />
                ))}
              </View>
            ) : (
              <Text style={styles.empty}>
                Progress photos will appear here as you log updates.
              </Text>
            )}
          </ScrollView>
        ) : null}
      </SafeAreaView>
      <LogProgressModal
        currentProgress={progressPercentage}
        itemId={item?.id ?? id}
        itemName={item?.name ?? 'Product'}
        onClose={() => setLogProgressVisible(false)}
        onSave={saveProgress}
        visible={logProgressVisible}
      />
      <AddPanItemModal
        initialItem={item ?? undefined}
        onClose={() => setEditVisible(false)}
        onSave={saveProductChanges}
        visible={editVisible}
      />
      <ConfirmationModal
        cancelText="Keep product"
        confirmText="Delete product"
        loading={deleting}
        message={
          item
            ? `${item.name} will be permanently deleted. This action cannot be undone.`
            : 'This product will be permanently deleted. This action cannot be undone.'
        }
        onCancel={() => setDeleteConfirmationVisible(false)}
        onConfirm={() => void handleDelete()}
        title="Delete product?"
        variant="destructive"
        visible={deleteConfirmationVisible}
      />
    </>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.backgroundPrimary,
  },
  header: {
    height: 66,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: spacing.xs,
    backgroundColor: colors.backgroundPrimary,
  },
  backButton: {
    position: 'absolute',
    left: spacing.md,
    zIndex: 1,
  },
  loader: {
    flex: 1,
  },
  content: {
    padding: spacing.md,
    paddingBottom: spacing.xl,
  },
  productCard: {
    padding: spacing.md,
    backgroundColor: colors.backgroundPrimary,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 20,
    gap: spacing.md,
    shadowColor: colors.textPrimary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 2,
  },
  productHero: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  productImage: {
    width: 88,
    height: 112,
    borderRadius: 14,
    backgroundColor: colors.backgroundSecondary,
  },
  productImagePlaceholder: {
    width: 88,
    height: 112,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.backgroundSecondary,
    borderRadius: 14,
  },
  productInfo: {
    flex: 1,
    minWidth: 0,
    justifyContent: 'center',
    gap: spacing.xs,
  },
  productName: {
    color: colors.text,
    fontSize: 19,
    fontWeight: '700',
    lineHeight: 24,
  },
  productSubtitle: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: '500',
    lineHeight: 18,
  },
  acquiredRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.xs,
  },
  acquiredDate: {
    flex: 1,
    color: colors.mutedText,
    fontSize: 12,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  badge: {
    borderRadius: 10,
    overflow: 'hidden',
    paddingHorizontal: 8,
    paddingVertical: 4,
    fontSize: 11,
    fontWeight: '600',
  },
  categoryBadge: {
    color: colors.brand,
    backgroundColor: colors.brandSurface,
  },
  priceBadge: {
    color: colors.brand,
    backgroundColor: colors.brandSurface,
    fontWeight: '700',
  },
  giftBadge: {
    color: colors.success,
    backgroundColor: colors.backgroundSecondary,
  },
  productActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  productActionButton: {
    flex: 1,
    minWidth: 0,
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderWidth: 1,
    borderRadius: 12,
  },
  editProductButton: {
    backgroundColor: colors.neutralSurface,
    borderColor: colors.border,
  },
  deleteProductButton: {
    backgroundColor: colors.errorSurface,
    borderColor: colors.errorSurface,
  },
  productActionPressed: {
    opacity: 0.75,
  },
  editProductText: {
    color: colors.neutralIcon,
    fontSize: 13,
    fontWeight: '700',
  },
  deleteProductText: {
    color: colors.error,
    fontSize: 13,
    fontWeight: '700',
  },
  ratingCard: {
    padding: spacing.md,
    backgroundColor: colors.backgroundSecondary,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 14,
  },
  ratingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  ratingTitle: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '700',
  },
  ratingSubtitle: {
    color: colors.mutedText,
    fontSize: 12,
    marginTop: 3,
  },
  ratingValueBadge: {
    minHeight: 34,
    minWidth: 52,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.sm,
    backgroundColor: colors.brandSurface,
    borderRadius: 12,
  },
  ratingValueText: {
    color: colors.brand,
    fontSize: 13,
    fontWeight: '700',
  },
  ratingDisplay: {
    alignItems: 'flex-start',
    marginTop: spacing.sm,
  },
  progressCard: {
    padding: spacing.md,
    gap: spacing.sm,
    backgroundColor: colors.backgroundSecondary,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 14,
  },
  progressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  progressTitle: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '700',
  },
  progressSubtitle: {
    color: colors.mutedText,
    fontSize: 12,
    marginTop: 3,
  },
  progressValue: {
    fontSize: 18,
    fontWeight: '700',
  },
  logProgressButton: {
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    marginTop: spacing.xs,
    borderRadius: 12,
    backgroundColor: colors.brand,
  },
  logProgressButtonText: {
    color: colors.backgroundPrimary,
    fontSize: 13,
    fontWeight: '700',
  },
  logProgressButtonPressed: {
    opacity: 0.82,
  },
  sectionHeading: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginVertical: spacing.lg,
  },
  rule: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
  },
  sectionTitle: {
    color: colors.mutedText,
    fontSize: 12,
  },
  logs: {
    gap: spacing.md,
  },
  empty: {
    color: colors.mutedText,
    fontSize: 13,
    textAlign: 'center',
    padding: spacing.lg,
  },
  error: {
    color: colors.error,
    padding: spacing.md,
    backgroundColor: colors.errorSurface,
    borderRadius: 12,
    textAlign: 'center',
  },
});
