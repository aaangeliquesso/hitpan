import { Ionicons } from '@expo/vector-icons';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import type { VanityItem } from '../../../types';
import { StarRating } from '../../../shared/components/StarRating';
import { colors, spacing } from '../../../shared/ui/theme';
import { ProgressBar } from './ProgressBar';

interface ProductCardProps {
  item: VanityItem;
  imageUrl?: string;
  onPress: () => void;
}

export function ProductCard({ item, imageUrl, onPress }: ProductCardProps) {
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
            <Ionicons
              color={colors.mutedBurgundy}
              name="image-outline"
              size={30}
            />
          </View>
        )}

        <View style={styles.details}>
          <Text numberOfLines={2} style={styles.name}>
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
            <Text style={[styles.pill, styles.giftPill]}>Gift</Text>
          ) : item.price !== undefined ? (
            <Text style={[styles.pill, styles.pricePill]}>
              ₱{item.price.toLocaleString()}
            </Text>
          ) : null}
          <Text numberOfLines={2} style={[styles.pill, styles.categoryPill]}>
            {item.category}
          </Text>
          <View style={styles.rating}>
            <StarRating rating={item.rating ?? 0} />
          </View>
        </View>
      </View>

      <View style={styles.progressRow}>
        <View style={styles.progressBar}>
          <ProgressBar progress={item.current_progress} />
        </View>
        <Text style={styles.progressText}>{item.current_progress}%</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 10,
    marginBottom: spacing.md,
    backgroundColor: '#FFF0F0',
    borderColor: '#F1D3D5',
    borderWidth: 1,
    borderRadius: 18,
    shadowColor: '#392424',
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
    width: 76,
    height: 128,
    borderRadius: 14,
    backgroundColor: colors.border,
  },
  imagePlaceholder: {
    width: 76,
    height: 128,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F1E5E1',
    borderRadius: 14,
  },
  details: {
    flex: 1,
    minWidth: 0,
    justifyContent: 'space-between',
    paddingTop: spacing.xs,
    paddingBottom: spacing.xs,
  },
  name: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 19,
  },
  brand: {
    color: colors.text,
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
    justifyContent: 'space-between',
    paddingVertical: spacing.xs,
    gap: spacing.xs,
  },
  pill: {
    maxWidth: '100%',
    overflow: 'hidden',
    paddingHorizontal: spacing.sm,
    paddingVertical: 5,
    borderRadius: 14,
    textAlign: 'center',
    fontSize: 10,
    fontWeight: '600',
  },
  pricePill: {
    color: colors.burgundy,
    backgroundColor: '#F8E2E0',
    fontSize: 13,
    fontWeight: '700',
  },
  giftPill: {
    color: colors.success,
    backgroundColor: '#E5EFE4',
  },
  categoryPill: {
    color: colors.burgundy,
    backgroundColor: '#F7E9E7',
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
    marginTop: spacing.sm,
  },
  progressBar: {
    flex: 1,
  },
  progressText: {
    minWidth: 38,
    color: colors.burgundy,
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'right',
  },
});
