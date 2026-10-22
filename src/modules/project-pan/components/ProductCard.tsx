import { Ionicons } from '@expo/vector-icons';
import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
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
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`View ${item.name}`}
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        item.status === 'finished' && styles.finishedCard,
        pressed && styles.pressed,
      ]}
    >
      <View style={styles.main}>
        {imageUrl ? (
          <Image source={{ uri: imageUrl }} style={styles.image} />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Ionicons color={colors.mutedBurgundy} name="image-outline" size={27} />
          </View>
        )}
        <View style={styles.details}>
          <View style={styles.topRow}>
            <Text numberOfLines={2} style={styles.name}>
              {item.name}
            </Text>
            {item.price !== undefined ? (
              <Text style={styles.price}>₱{item.price}</Text>
            ) : null}
          </View>
          <Text numberOfLines={1} style={styles.brand}>
            {item.brand}{item.variant ? ` · ${item.variant}` : ''}
          </Text>
          <Text style={styles.acquired}>
            {item.acquisition_type === 'gifted' ? 'Gifted' : 'Bought'} on{' '}
            {new Date(`${item.acquired_on}T00:00:00`).toLocaleDateString(
              undefined,
              { month: 'short', day: 'numeric', year: 'numeric' },
            )}
          </Text>
          <View style={styles.pills}>
            <Text style={styles.category}>{item.category}</Text>
          </View>
          <StarRating rating={item.rating ?? 0} />
        </View>
      </View>
      <View style={styles.progressRow}>
        <ProgressBar progress={item.current_progress} />
        <Text style={styles.progressText}>{item.current_progress}%</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 10,
    marginBottom: spacing.md,
    backgroundColor: colors.warmWhite,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 16,
    shadowColor: '#3D2222',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 5,
    elevation: 2,
  },
  finishedCard: {
    backgroundColor: '#FFFCFA',
  },
  pressed: {
    opacity: 0.85,
  },
  main: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  image: {
    width: 68,
    height: 74,
    borderRadius: 10,
    backgroundColor: colors.border,
  },
  imagePlaceholder: {
    width: 68,
    height: 74,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F1E5E1',
    borderRadius: 10,
  },
  details: {
    flex: 1,
    gap: 3,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.xs,
  },
  name: {
    flex: 1,
    color: colors.text,
    fontSize: 12,
    fontWeight: '700',
  },
  price: {
    color: colors.burgundy,
    backgroundColor: '#F8E2E0',
    borderRadius: 10,
    overflow: 'hidden',
    paddingHorizontal: 7,
    paddingVertical: 2,
    fontSize: 10,
    fontWeight: '700',
  },
  brand: {
    color: colors.mutedText,
    fontSize: 10,
  },
  acquired: {
    color: colors.mutedText,
    fontSize: 9,
  },
  pills: {
    flexDirection: 'row',
  },
  category: {
    color: colors.burgundy,
    backgroundColor: '#F7E9E7',
    overflow: 'hidden',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 8,
    fontSize: 9,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  progressText: {
    minWidth: 34,
    color: colors.burgundy,
    fontSize: 10,
    fontWeight: '700',
    textAlign: 'right',
  },
});
