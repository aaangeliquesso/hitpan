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
import {
  deletePanItem,
  getPanItemById,
  updatePanItemRating,
} from '../../src/modules/project-pan/services/panService';
import { useProgressLogs } from '../../src/modules/project-pan/hooks/useProgressLogs';
import type { VanityItem } from '../../src/types';

export default function ProductDetailsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [item, setItem] = useState<VanityItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [savingRating, setSavingRating] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const { logs, loading: logsLoading, error: logsError } = useProgressLogs(id);

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
      `Are you sure you want to delete "${item.name}"? This action cannot be undone.`,
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

  return (
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
        <Pressable
          accessibilityLabel="Delete product"
          accessibilityRole="button"
          disabled={deleting}
          hitSlop={10}
          onPress={confirmDelete}
          style={styles.deleteButton}
        >
          {deleting ? (
            <ActivityIndicator color={colors.burgundy} size="small" />
          ) : (
            <Ionicons color={colors.burgundy} name="trash-outline" size={21} />
          )}
        </Pressable>
      </View>
      {loading ? (
        <ActivityIndicator color={colors.burgundy} style={styles.loader} />
      ) : error ? (
        <Text style={styles.error}>{error}</Text>
      ) : item ? (
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.productCard}>
            <View style={styles.metadata}>
              <Text style={styles.metadataLabel}>Name</Text>
              <Text style={styles.metadataValue}>{item.name}</Text>
              <Text style={styles.metadataLabel}>Brand</Text>
              <Text style={styles.metadataValue}>{item.brand}</Text>
              {item.variant ? (
                <>
                  <Text style={styles.metadataLabel}>Variant</Text>
                  <Text style={styles.metadataValue}>{item.variant}</Text>
                </>
              ) : null}
              <Text style={styles.metadataLabel}>
                {item.acquisition_type === 'gifted' ? 'Gifted on' : 'Bought on'}
              </Text>
              <Text style={styles.metadataValue}>
                {new Date(`${item.acquired_on}T00:00:00`).toLocaleDateString()}
              </Text>
            </View>
            <View style={styles.badges}>
              {item.acquisition_type === 'gifted' ? (
                <Text style={styles.badge}>Gift</Text>
              ) : null}
              <Text style={styles.badge}>{item.category}</Text>
              {item.price !== undefined ? (
                <Text style={styles.badge}>₱{item.price}</Text>
              ) : null}
            </View>
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
            <View style={styles.progressHeader}>
              <Text style={styles.progressLabel}>Progress</Text>
              <Text style={styles.progressValue}>{item.current_progress}%</Text>
            </View>
            <ProgressBar progress={item.current_progress} />
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
  deleteButton: {
    position: 'absolute',
    right: spacing.md,
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F4E5E3',
    borderRadius: 19,
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
    gap: spacing.sm,
  },
  metadata: {
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    rowGap: spacing.xs,
  },
  metadataLabel: {
    width: '28%',
    color: colors.mutedText,
    fontSize: 12,
  },
  metadataValue: {
    width: '72%',
    color: colors.text,
    fontSize: 12,
    fontWeight: '500',
  },
  badges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    paddingTop: spacing.xs,
  },
  badge: {
    color: colors.burgundy,
    backgroundColor: '#F5E6E4',
    borderRadius: 10,
    overflow: 'hidden',
    paddingHorizontal: 8,
    paddingVertical: 4,
    fontSize: 10,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
  progressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  progressLabel: {
    color: colors.mutedText,
    fontSize: 12,
  },
  progressValue: {
    color: colors.success,
    fontSize: 11,
    fontWeight: '700',
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
