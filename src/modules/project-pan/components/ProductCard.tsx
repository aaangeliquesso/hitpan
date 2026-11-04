import { Ionicons } from '@expo/vector-icons';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import type { VanityItem } from '../../../types';
import { StarRating } from '../../../shared/components/StarRating';
import { colors, spacing } from '../../../shared/ui/theme';
import { ProgressBar } from './ProgressBar';
import { ProductTagBadge } from './ProductTagBadge';
import { getCurrentProgressPercentage } from '../progress';

interface ProductCardProps {
  item: VanityItem;
  imageUrl?: string;
  onPress: () => void;
}

export function ProductCard({ item, imageUrl, onPress }: ProductCardProps) {
  const progressPercentage = getCurrentProgressPercentage(
    item,
    item.progress_logs?.[0],
  );
  const acquiredLabel =
    item.acquisition_type === 'gifted' ? 'Received on' : 'Bought on';
  const acquiredDate = new Date(
    `${item.acquired_on}T00:00:00`,
  ).toLocaleDateString(undefined, {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`View details for ${item.name}`}
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      <View style={styles.main}>
        {imageUrl ? (
          <Image
            accessibilityLabel={`${item.name} product photo`}
            source={{ uri: imageUrl }}
            style={styles.image}
          />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Ionicons color={colors.textSecondary} name="image-outline" size={30} />
          </View>
        )}

        <View style={styles.details}>
          <Text numberOfLines={1} style={styles.name}>
            {item.name}
          </Text>
          <Text numberOfLines={1} style={styles.brand}>
            {item.brand}
          </Text>
          {item.variant ? (
            <Text numberOfLines={1} style={styles.variant}>
              {item.variant}
            </Text>
          ) : null}
          <Text numberOfLines={1} style={styles.acquired}>
            {acquiredLabel} {acquiredDate}
          </Text>
        </View>
        <View style={styles.tags}>
          {item.acquisition_type === 'gifted' ? (
            <ProductTagBadge label="Gift" type="gift" />
          ) : typeof item.price === 'number' ? (
            <ProductTagBadge
              label={`₱${item.price.toLocaleString()}`}
              type="price"
            />
          ) : null}
          <ProductTagBadge label={item.category} type="category" />
          <View style={styles.rating}>
            <StarRating rating={item.rating ?? 0} />
          </View>
        </View>
      </View>
      <View style={styles.progressRow}>
        <View style={styles.progressBar}>
          <ProgressBar progress={progressPercentage} />
        </View>
        <Text style={styles.progressText}>{progressPercentage}%</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 12,
    marginBottom: spacing.md,
    backgroundColor: colors.backgroundPrimary,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 18,
    shadowColor: colors.textPrimary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 2,
  },
  pressed: {
    opacity: 0.86,
  },
  main: {
    flexDirection: 'row',
    alignItems: 'stretch',
    gap: spacing.sm,
  },
  image: {
    width: 72,
    height: 96,
    borderRadius: 12,
    backgroundColor: colors.border,
  },
  imagePlaceholder: {
    width: 72,
    height: 96,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.backgroundSecondary,
    borderRadius: 12,
  },
  details: {
    flex: 1,
    minWidth: 0,
    justifyContent: 'center',
    gap: 2,
    marginRight: spacing.xs,
  },
  name: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 19,
  },
  brand: {
    color: colors.textSecondary,
    fontSize: 14,
    fontWeight: '700',
  },
  variant: {
    color: colors.mutedText,
    fontSize: 12,
  },
  tags: {
    width: 84,
    alignItems: 'flex-end',
    gap: 4,
  },
  rating: {
    alignSelf: 'flex-end',
    marginTop: 'auto',
  },
  acquired: {
    color: colors.mutedText,
    fontSize: 10,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: 2,
  },
  progressBar: {
    flex: 1,
  },
  progressText: {
    minWidth: 38,
    color: colors.brand,
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'right',
  },
});
