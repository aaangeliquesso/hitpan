import { Ionicons } from '@expo/vector-icons';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import type { VanityItem } from '../../../types';
import { StarRating } from '../../../shared/components/StarRating';
import { colors, spacing } from '../../../shared/ui/theme';
import { ProgressBar } from './ProgressBar';
import { ProductTagBadge } from './ProductTagBadge';
import {
  getCurrentProgressPercentage,
  getProgressTextColor,
} from '../progress';

interface ProductCardProps {
  item: VanityItem;
  imageUrl?: string;
  onPress: () => void;
  onLongPress: () => void;
  selectionMode: boolean;
  selected: boolean;
}

export function ProductCard({
  item,
  imageUrl,
  onPress,
  onLongPress,
  selectionMode,
  selected,
}: ProductCardProps) {
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
      accessibilityLabel={
        selectionMode
          ? `${selected ? 'Deselect' : 'Select'} ${item.name}`
          : `View details for ${item.name}`
      }
      accessibilityState={{ selected }}
      onLongPress={onLongPress}
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        selected && styles.selectedCard,
        pressed && styles.pressed,
      ]}
    >
      <View style={styles.main}>
        <View style={styles.imageContainer}>
          {imageUrl ? (
            <Image
              accessibilityLabel={`${item.name} product photo`}
              source={{ uri: imageUrl }}
              style={styles.image}
            />
          ) : (
            <View style={styles.imagePlaceholder}>
              <Ionicons
                color={colors.textSecondary}
                name="image-outline"
                size={30}
              />
            </View>
          )}
          {selectionMode ? (
            <View
              style={[
                styles.selectionIndicator,
                selected && styles.selectedIndicator,
              ]}
            >
              {selected ? (
                <Ionicons color="#FFFFFF" name="checkmark" size={15} />
              ) : null}
            </View>
          ) : null}
        </View>

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
        <Text
          style={[
            styles.progressText,
            { color: getProgressTextColor(progressPercentage) },
          ]}
        >
          {progressPercentage}%
        </Text>
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
  selectedCard: {
    borderColor: '#7A2033',
    borderWidth: 1.5,
  },
  pressed: {
    opacity: 0.86,
  },
  main: {
    flexDirection: 'row',
    alignItems: 'stretch',
    gap: spacing.sm,
  },
  imageContainer: {
    position: 'relative',
    width: 72,
    height: 96,
    overflow: 'hidden',
    borderRadius: 12,
    backgroundColor: colors.backgroundSecondary,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.backgroundSecondary,
  },
  selectionIndicator: {
    position: 'absolute',
    top: 5,
    left: 5,
    width: 22,
    height: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#9CA3AF',
    borderRadius: 11,
  },
  selectedIndicator: {
    backgroundColor: '#7A2033',
    borderColor: '#7A2033',
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
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'right',
  },
});
