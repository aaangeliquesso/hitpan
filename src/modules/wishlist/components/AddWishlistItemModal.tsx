import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing } from '../../../shared/ui/theme';
import type { CreateWishlistItemInput } from '../services/wishlistService';

interface AddWishlistItemModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (input: CreateWishlistItemInput) => Promise<void>;
}

export function AddWishlistItemModal({
  visible,
  onClose,
  onSave,
}: AddWishlistItemModalProps) {
  const [itemName, setItemName] = useState('');
  const [isBought, setIsBought] = useState(false);
  const [isNeed, setIsNeed] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cancelConfirmationVisible, setCancelConfirmationVisible] =
    useState(false);

  useEffect(() => {
    if (visible) {
      setItemName('');
      setIsBought(false);
      setIsNeed(false);
      setError(null);
      setCancelConfirmationVisible(false);
    }
  }, [visible]);

  function hasUnsavedChanges() {
    return Boolean(itemName.trim() || isBought || isNeed);
  }

  function cancelForm() {
    if (saving) return;
    if (!hasUnsavedChanges()) {
      onClose();
      return;
    }

    setCancelConfirmationVisible(true);
  }

  function discardForm() {
    setCancelConfirmationVisible(false);
    onClose();
  }

  async function submit() {
    const name = itemName.trim();
    if (!name) {
      setError('Item name is required.');
      return;
    }
    if (saving) return;

    setSaving(true);
    setError(null);
    try {
      await onSave({ item_name: name, is_bought: isBought, is_need: isNeed });
      onClose();
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : 'Unable to add this wishlist item.',
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal
      animationType="slide"
      onRequestClose={() => {
        if (cancelConfirmationVisible) {
          setCancelConfirmationVisible(false);
          return;
        }
        cancelForm();
      }}
      statusBarTranslucent
      transparent
      visible={visible}
    >
      <View style={styles.overlay}>
        <SafeAreaView edges={['bottom']} style={styles.sheet}>
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>Add wishlist item</Text>
              <Text style={styles.subtitle}>Save something for later.</Text>
            </View>
            <Pressable
              accessibilityLabel="Close add wishlist item form"
              accessibilityRole="button"
              disabled={saving}
              onPress={cancelForm}
              style={styles.closeButton}
            >
              <Ionicons color={colors.neutralIcon} name="close" size={22} />
            </Pressable>
          </View>

          <Text style={styles.label}>Item name *</Text>
          <TextInput
            editable={!saving}
            onChangeText={setItemName}
            placeholder="What would you like?"
            placeholderTextColor={colors.mutedText}
            returnKeyType="done"
            style={styles.input}
            value={itemName}
          />

          <View style={styles.toggleRow}>
            <View
              style={[
                styles.toggleItem,
                isBought && styles.boughtToggleActive,
              ]}
            >
              <View style={styles.toggleText}>
                <Text style={styles.toggleTitle}>Bought</Text>
                <Text style={styles.toggleHint}>
                  {isBought ? '✓ Bought' : '× Not bought'}
                </Text>
              </View>
              <Switch
                accessibilityLabel="Mark item as bought"
                disabled={saving}
                onValueChange={setIsBought}
                thumbColor={colors.switchThumb}
                trackColor={{
                  false: colors.switchInactive,
                  true: colors.wishlistBought,
                }}
                value={isBought}
              />
            </View>
            <View
              style={[styles.toggleItem, isNeed && styles.needToggleActive]}
            >
              <View style={styles.toggleText}>
                <Text style={styles.toggleTitle}>Need</Text>
                <Text style={styles.toggleHint}>
                  {isNeed ? '✓ Need' : '× Not a need'}
                </Text>
              </View>
              <Switch
                accessibilityLabel="Mark item as a need"
                disabled={saving}
                onValueChange={setIsNeed}
                thumbColor={colors.switchThumb}
                trackColor={{
                  false: colors.switchInactive,
                  true: colors.wishlistNeed,
                }}
                value={isNeed}
              />
            </View>
          </View>

          {error ? (
            <View style={styles.errorContainer}>
              <Text accessibilityRole="alert" style={styles.error}>
                {error}
              </Text>
            </View>
          ) : null}
          <View style={styles.actions}>
            <Pressable
              accessibilityRole="button"
              disabled={saving}
              onPress={cancelForm}
              style={[styles.actionButton, styles.cancelButton]}
            >
              <Text style={styles.cancelText}>Cancel</Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              disabled={saving}
              onPress={() => void submit()}
              style={[styles.actionButton, styles.saveButton]}
            >
              {saving ? (
                <ActivityIndicator color={colors.backgroundPrimary} />
              ) : (
                <Text style={styles.saveText}>Add item</Text>
              )}
            </Pressable>
          </View>
          {cancelConfirmationVisible ? (
            <View style={styles.confirmationOverlay}>
              <View
                accessibilityViewIsModal
                style={styles.confirmationDialog}
              >
                <View style={styles.confirmationIcon}>
                  <Ionicons
                    color={colors.error}
                    name="alert-circle-outline"
                    size={27}
                  />
                </View>
                <Text style={styles.confirmationTitle}>
                  Cancel Wishlist Item?
                </Text>
                <Text style={styles.confirmationMessage}>
                  Are you sure you want to cancel? Your item details will not be
                  saved.
                </Text>
                <View style={styles.confirmationActions}>
                  <Pressable
                    accessibilityRole="button"
                    onPress={() => setCancelConfirmationVisible(false)}
                    style={[
                      styles.confirmationButton,
                      styles.keepEditingButton,
                    ]}
                  >
                    <Text style={styles.keepEditingText}>Keep Editing</Text>
                  </Pressable>
                  <Pressable
                    accessibilityRole="button"
                    onPress={discardForm}
                    style={[
                      styles.confirmationButton,
                      styles.discardButton,
                    ]}
                  >
                    <Text style={styles.discardText}>Discard / Cancel</Text>
                  </Pressable>
                </View>
              </View>
            </View>
          ) : null}
        </SafeAreaView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(18, 18, 18, 0.45)',
  },
  confirmationOverlay: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    backgroundColor: 'rgba(18, 18, 18, 0.58)',
    zIndex: 10,
  },
  confirmationDialog: {
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
    padding: spacing.lg,
    backgroundColor: colors.cream,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 24,
    shadowColor: colors.textPrimary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 12,
  },
  confirmationIcon: {
    width: 56,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
    backgroundColor: colors.brandSurface,
    borderRadius: 28,
  },
  confirmationTitle: {
    color: colors.textPrimary,
    fontSize: 19,
    fontWeight: '700',
    textAlign: 'center',
  },
  confirmationMessage: {
    marginTop: spacing.sm,
    color: colors.mutedText,
    fontSize: 14,
    lineHeight: 21,
    textAlign: 'center',
  },
  confirmationActions: {
    width: '100%',
    gap: spacing.sm,
    marginTop: spacing.lg,
  },
  confirmationButton: {
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
  },
  keepEditingButton: {
    backgroundColor: colors.brand,
  },
  keepEditingText: {
    color: colors.backgroundPrimary,
    fontSize: 14,
    fontWeight: '700',
  },
  discardButton: {
    backgroundColor: colors.errorSurface,
    borderColor: colors.error,
    borderWidth: 1,
  },
  discardText: {
    color: colors.error,
    fontSize: 14,
    fontWeight: '700',
  },
  sheet: {
    paddingTop: spacing.lg,
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
    backgroundColor: colors.backgroundPrimary,
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  title: {
    color: colors.textPrimary,
    fontSize: 20,
    fontWeight: '700',
  },
  subtitle: {
    marginTop: 3,
    color: colors.mutedText,
    fontSize: 12,
  },
  closeButton: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 19,
    backgroundColor: colors.backgroundSecondary,
  },
  label: {
    marginBottom: spacing.xs,
    color: colors.textPrimary,
    fontSize: 13,
    fontWeight: '600',
  },
  input: {
    minHeight: 46,
    marginBottom: spacing.md,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 11,
    color: colors.textPrimary,
    backgroundColor: colors.backgroundPrimary,
    fontSize: 14,
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  toggleItem: {
    flex: 1,
    minWidth: 0,
    minHeight: 64,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    backgroundColor: colors.warmWhite,
  },
  boughtToggleActive: {
    backgroundColor: colors.wishlistBoughtSurface,
    borderColor: colors.wishlistBought,
  },
  needToggleActive: {
    backgroundColor: colors.wishlistNeedSurface,
    borderColor: colors.wishlistNeed,
  },
  toggleText: {
    flexShrink: 1,
    gap: 2,
  },
  toggleTitle: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: '600',
  },
  toggleHint: {
    color: colors.mutedText,
    fontSize: 12,
  },
  error: {
    color: colors.error,
    fontSize: 12,
  },
  errorContainer: {
    marginTop: spacing.sm,
    padding: spacing.sm,
    backgroundColor: colors.errorSurface,
    borderRadius: 10,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.lg,
  },
  actionButton: {
    minHeight: 46,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 13,
  },
  saveButton: {
    flex: 1,
    backgroundColor: colors.brand,
  },
  cancelButton: {
    width: 84,
    backgroundColor: colors.neutralSurface,
  },
  cancelText: {
    color: colors.neutralIcon,
    fontSize: 13,
    fontWeight: '600',
  },
  saveText: {
    color: colors.backgroundPrimary,
    fontSize: 13,
    fontWeight: '700',
  },
});
