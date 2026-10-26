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
import { colors, spacing } from '../../src/shared/ui/theme';
import { ProgressBar } from '../../src/modules/project-pan/components/ProgressBar';
import { ProgressLogCard } from '../../src/modules/project-pan/components/ProgressLogCard';
import { LogProgressModal } from '../../src/modules/project-pan/components/LogProgressModal';
import {
  deletePanItem,
  getPanItemById,
  updatePanItem,
  updatePanItemRating,
} from '../../src/modules/project-pan/services/panService';
import { createProgressLog } from '../../src/modules/project-pan/services/progressLogService';
import { useProgressLogs } from '../../src/modules/project-pan/hooks/useProgressLogs';
import type { VanityItem } from '../../src/types';
import { AddPanItemModal } from '../../src/modules/project-pan/components/AddPanItemModal';

export default function ProductDetailsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [item, setItem] = useState<VanityItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [savingRating, setSavingRating] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [editVisible, setEditVisible] = useState(false);
  const [logProgressVisible, setLogProgressVisible] = useState(false);
  const {
    logs,
    loading: logsLoading,
    error: logsError,
    refresh: refreshLogs,
  } = useProgressLogs(id);

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

  async function handleRatingChange(rating: number) {
    if (!item || savingRating) {
      return;
    }

    const previousRating = item.rating;
    setItem({ ...item, rating });
    setSavingRating(true);
    try {
      await updatePanItemRating(item.id, rating);
    } catch (cause) {
      setItem({ ...item, rating: previousRating });
      Alert.alert(
        'Rating not saved',
        cause instanceof Error ? cause.message : 'Please try again.',
      );
    } finally {
      setSavingRating(false);
    }
  }

  function confirmDelete() {
    if (!item || deleting) return;

    Alert.alert(
      'Delete product?',
      'Are you sure you want to delete this product?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => void handleDelete(),
        },
      ],
    );
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
            <Ionicons color={colors.burgundy} name="arrow-back" size={22} />
          </Pressable>
          <BrandWordmark width={112} />
        </View>
        {loading ? (
          <ActivityIndicator color={colors.burgundy} style={styles.loader} />
        ) : error ? (
          <Text style={styles.error}>{error}</Text>
        ) : item ? (
          <ScrollView contentContainerStyle={styles.content}>
            <View style={styles.productCard}>
              <View style={styles.titleRow}>
                <Text numberOfLines={2} style={styles.productName}>
                  {item.name}
                </Text>
                <View style={styles.cardActions}>
                  <Pressable
                    accessibilityLabel="Edit product"
                    accessibilityRole="button"
                    onPress={() => setEditVisible(true)}
                    style={({ pressed }) => [
                      styles.cardActionButton,
                      pressed && styles.cardActionPressed,
                    ]}
                  >
                    <Ionicons
                      color={colors.burgundy}
                      name="create-outline"
                      size={18}
                    />
                  </Pressable>
                  <Pressable
                    accessibilityLabel="Delete product"
                    accessibilityRole="button"
                    disabled={deleting}
                    onPress={confirmDelete}
                    style={({ pressed }) => [
                      styles.cardActionButton,
                      pressed && styles.cardActionPressed,
                    ]}
                  >
                    {deleting ? (
                      <ActivityIndicator color={colors.burgundy} size="small" />
                    ) : (
                      <Ionicons
                        color={colors.burgundy}
                        name="trash-outline"
                        size={18}
                      />
                    )}
                  </Pressable>
                </View>
              </View>
              <Text style={styles.productSubtitle}>
                {item.brand}
                {item.variant ? ` • ${item.variant}` : ''}
              </Text>
              <View style={styles.badgeRow}>
                <Text numberOfLines={1} style={[styles.badge, styles.categoryBadge]}>
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
              <Text style={styles.acquiredDate}>
                {item.acquisition_type === 'gifted' ? 'Received on' : 'Bought on'}{' '}
                {new Date(`${item.acquired_on}T00:00:00`).toLocaleDateString(
                  undefined,
                  { month: 'long', day: 'numeric', year: 'numeric' },
                )}
              </Text>
              <View style={styles.ratingRow}>
                <Text style={styles.ratingLabel}>Rating</Text>
                <View style={styles.stars}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Pressable
                      accessibilityLabel={`Rate ${star} out of 5`}
                      accessibilityRole="button"
                      disabled={savingRating}
                      key={star}
                      onPress={() => void handleRatingChange(star)}
                      hitSlop={4}
                    >
                      <Text
                        style={[
                          styles.star,
                          star <= (item.rating ?? 0) && styles.filledStar,
                        ]}
                      >
                        ★
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>
              <View style={styles.progressRow}>
                <Text style={styles.progressValue}>
                  {item.current_progress}%
                </Text>
                <View style={styles.progressBar}>
                  <ProgressBar progress={item.current_progress} />
                </View>
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
                  color={colors.warmWhite}
                  name="camera-outline"
                  size={18}
                />
                <Text style={styles.logProgressButtonText}>Log Progress</Text>
              </Pressable>
            </View>

            <View style={styles.sectionHeading}>
              <View style={styles.rule} />
              <Text style={styles.sectionTitle}>Pictures</Text>
              <View style={styles.rule} />
            </View>
            {logsLoading ? (
              <ActivityIndicator color={colors.burgundy} />
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
        currentProgress={item?.current_progress ?? 0}
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
    </>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.cream,
  },
  header: {
    height: 66,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: spacing.xs,
    backgroundColor: colors.cream,
  },
  backButton: {
    position: 'absolute',
    left: spacing.md,
    zIndex: 1,
  },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    marginBottom: spacing.xs,
  },
  cardActionButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(244, 229, 227, 0.75)',
    borderRadius: 18,
  },
  cardActionPressed: {
    backgroundColor: '#F4E5E3',
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
    backgroundColor: colors.warmWhite,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 16,
    gap: spacing.md,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  productName: {
    flex: 1,
    color: colors.text,
    fontSize: 20,
    fontWeight: 'bold',
  },
  productSubtitle: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '500',
    marginTop: -spacing.xs,
  },
  acquiredDate: {
    color: colors.mutedText,
    fontSize: 12,
    marginTop: -spacing.xs,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
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
    color: colors.burgundy,
    backgroundColor: '#F5E6E4',
  },
  priceBadge: {
    color: colors.burgundy,
    backgroundColor: '#F8E2E0',
    fontWeight: '700',
  },
  giftBadge: {
    color: colors.success,
    backgroundColor: '#E5EFE4',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: -spacing.xs,
  },
  ratingLabel: {
    color: colors.mutedText,
    fontSize: 12,
  },
  stars: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  star: {
    color: colors.border,
    fontSize: 19,
  },
  filledStar: {
    color: '#E3B532',
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  progressValue: {
    color: colors.success,
    fontSize: 13,
    fontWeight: '700',
  },
  progressBar: {
    flex: 1,
  },
  logProgressButton: {
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    marginTop: spacing.xs,
    borderRadius: 12,
    backgroundColor: colors.burgundy,
  },
  logProgressButtonText: {
    color: colors.warmWhite,
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
    color: colors.burgundy,
    padding: spacing.md,
    textAlign: 'center',
  },
});
