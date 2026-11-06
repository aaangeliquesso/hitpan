import { StyleSheet, Switch, Text, View } from 'react-native';
import type { WishlistItem } from '../../../types';
import { colors } from '../../../shared/ui/theme';

interface WishlistItemRowProps {
  item: WishlistItem;
  rowNumber: number;
  saving: boolean;
  onToggleBought: (value: boolean) => void;
  onToggleNeed: (value: boolean) => void;
}

export function WishlistItemRow({
  item,
  rowNumber,
  saving,
  onToggleBought,
  onToggleNeed,
}: WishlistItemRowProps) {
  return (
    <View style={styles.row}>
      <View style={styles.itemDetails}>
        <Text style={styles.index}>#{rowNumber}</Text>
        <Text numberOfLines={2} style={styles.item}>
          {item.item_name}
        </Text>
      </View>
      <View style={styles.toggleControls}>
        <View style={styles.toggleGroup}>
          <Text
            style={[
              styles.toggleLabel,
              item.is_bought && styles.boughtLabelActive,
            ]}
          >
            Bought
          </Text>
          <Switch
            accessibilityLabel={`Mark ${item.item_name} as bought`}
            disabled={saving}
            onValueChange={onToggleBought}
            trackColor={{
              false: colors.switchInactive,
              true: colors.wishlistBought,
            }}
            thumbColor={colors.switchThumb}
            value={item.is_bought}
            style={styles.switch}
          />
        </View>
        <View style={styles.toggleGroup}>
          <Text
            style={[
              styles.toggleLabel,
              item.is_need && styles.needLabelActive,
            ]}
          >
            Need
          </Text>
          <Switch
            accessibilityLabel={`Mark ${item.item_name} as a need`}
            disabled={saving}
            onValueChange={onToggleNeed}
            trackColor={{
              false: colors.switchInactive,
              true: colors.wishlistNeed,
            }}
            thumbColor={colors.switchThumb}
            value={item.is_need}
            style={styles.switch}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    minHeight: 68,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    paddingVertical: 7,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  itemDetails: {
    flex: 1,
    minWidth: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  index: {
    width: 32,
    height: 25,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 13,
    color: colors.mutedText,
    fontSize: 11,
    fontWeight: '700',
    lineHeight: 23,
    textAlign: 'center',
  },
  item: {
    flex: 1,
    color: colors.text,
    fontSize: 13,
    fontWeight: '500',
  },
  toggleControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  toggleGroup: {
    width: 56,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
  },
  toggleLabel: {
    marginBottom: 1,
    color: colors.mutedText,
    fontSize: 9,
    fontWeight: '600',
  },
  boughtLabelActive: {
    color: colors.wishlistBought,
  },
  needLabelActive: {
    color: colors.wishlistNeed,
  },
  switch: {
    transform: [{ scaleX: 0.68 }, { scaleY: 0.68 }],
  },
});
