import { StyleSheet, Switch, Text, View } from 'react-native';
import type { WishlistItem } from '../../../types';
import { colors } from '../../../shared/ui/theme';
import { getWishlistItemDay } from '../years';

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
    <View style={[styles.row, rowNumber % 2 === 0 && styles.alternate]}>
      <Text style={styles.index}>{rowNumber}</Text>
      <Text style={styles.day}>{getWishlistItemDay(item)}</Text>
      <Text numberOfLines={1} style={styles.item}>
        {item.item_name}
      </Text>
      <View
        style={[
          styles.toggleCell,
          item.is_bought && styles.boughtActive,
        ]}
      >
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
      <View
        style={[
          styles.toggleCell,
          item.is_need && styles.needActive,
        ]}
      >
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
  );
}

export function WishlistTableHeader() {
  return (
    <View style={styles.header}>
      <Text style={[styles.headerText, styles.index]}>#</Text>
      <Text style={[styles.headerText, styles.day]}>Day</Text>
      <Text style={[styles.headerText, styles.item]}>Item</Text>
      <Text style={[styles.headerText, styles.toggleCell]}>Bought</Text>
      <Text style={[styles.headerText, styles.toggleCell]}>Need?</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 7,
    backgroundColor: colors.backgroundSecondary,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  headerText: {
    color: colors.text,
    fontSize: 9,
    fontWeight: '700',
    textAlign: 'center',
  },
  row: {
    minHeight: 34,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    backgroundColor: colors.backgroundPrimary,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  alternate: {
    backgroundColor: colors.backgroundSecondary,
  },
  index: {
    width: 24,
    textAlign: 'center',
  },
  day: {
    width: '12%',
    textAlign: 'center',
  },
  item: {
    flex: 1,
    color: colors.text,
    fontSize: 9,
    paddingHorizontal: 3,
  },
  toggleCell: {
    width: '16%',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
  },
  boughtActive: {
    backgroundColor: colors.wishlistBoughtSurface,
  },
  needActive: {
    backgroundColor: colors.wishlistNeedSurface,
  },
  switch: {
    transform: [{ scaleX: 0.64 }, { scaleY: 0.64 }],
    marginHorizontal: -7,
  },
});
