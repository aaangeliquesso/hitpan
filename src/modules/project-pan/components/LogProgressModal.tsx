import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { colors, spacing } from '../../../shared/ui/theme';
import { ProgressSlider } from './ProgressSlider';
import type { CreateProgressLogInput } from '../services/progressLogService';

interface LogProgressModalProps {
  visible: boolean;
  itemId: string;
  itemName: string;
  currentProgress: number;
  onClose: () => void;
  onSave: (input: CreateProgressLogInput) => Promise<void>;
}

export function LogProgressModal({
  visible,
  itemId,
  itemName,
  currentProgress,
  onClose,
  onSave,
}: LogProgressModalProps) {
  const [progress, setProgress] = useState(currentProgress);
  const [notes, setNotes] = useState('');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notesFocused, setNotesFocused] = useState(false);

  useEffect(() => {
    if (visible) {
      setProgress(currentProgress);
      setNotes('');
      setImageUri(null);
      setError(null);
    }
  }, [currentProgress, visible]);

  async function takePhoto() {
    try {
      const permission = await ImagePicker.requestCameraPermissionsAsync();
      if (!permission.granted) {
        Alert.alert(
          'Permission Denied',
          'Camera access is required to take product photos. Please enable it in your device settings.',
        );
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]?.uri) {
        setImageUri(result.assets[0].uri);
        setError(null);
      }
    } catch (cause) {
      Alert.alert(
        'Unable to open camera',
        cause instanceof Error ? cause.message : 'Please try again.',
      );
    }
  }

  async function submit() {
    if (saving) return;
    if (!imageUri) {
      setError('Take a photo to save this progress update.');
      return;
    }

    setError(null);
    setSaving(true);
    try {
      await onSave({
        vanityItemId: itemId,
        progressPercentage: progress,
        ...(notes.trim() ? { notes: notes.trim() } : {}),
        imageUri,
      });
      onClose();
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : 'Unable to save this progress update. Please try again.',
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal
      animationType="slide"
      onRequestClose={() => {
        if (!saving) onClose();
      }}
      statusBarTranslucent
      transparent
      visible={visible}
    >
      <View style={styles.overlay}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardArea}
        >
          <SafeAreaView edges={['bottom']} style={styles.sheet}>
            <View style={styles.header}>
              <View style={styles.headerText}>
                <Text style={styles.title}>Log progress</Text>
                <Text numberOfLines={1} style={styles.subtitle}>
                  {itemName}
                </Text>
              </View>
              <Pressable
                accessibilityLabel="Close progress form"
                accessibilityRole="button"
                disabled={saving}
                onPress={onClose}
                style={styles.closeButton}
              >
                <Ionicons color={colors.neutralIcon} name="close" size={22} />
              </Pressable>
            </View>

            <ScrollView
              contentContainerStyle={styles.content}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.section}>
                <View style={styles.sectionHeading}>
                  <Text style={styles.label}>Progress after use</Text>
                  <Text style={styles.progressValue}>{progress}%</Text>
                </View>
                <ProgressSlider
                  accessibilityLabel="Progress after use"
                  onValueChange={setProgress}
                  value={progress}
                />
                <View style={styles.progressLabels}>
                  {[0, 25, 50, 75, 100].map((value) => (
                    <Text
                      key={value}
                      style={[
                        styles.progressLabel,
                        value === progress && styles.activeProgressLabel,
                      ]}
                    >
                      {value}%
                    </Text>
                  ))}
                </View>
              </View>

              <View style={styles.section}>
                <Text style={styles.label}>Progress photo</Text>
                {imageUri ? (
                  <View style={styles.photoRow}>
                    <Image
                      accessibilityLabel="Progress photo preview"
                      source={{ uri: imageUri }}
                      style={styles.preview}
                    />
                    <View style={styles.photoActions}>
                      <Text style={styles.photoHint}>Photo ready to upload</Text>
                      <Pressable
                        accessibilityRole="button"
                        disabled={saving}
                        onPress={() => void takePhoto()}
                        style={styles.secondaryButton}
                      >
                        <Ionicons
                          color={colors.neutralIcon}
                          name="camera-outline"
                          size={17}
                        />
                        <Text style={styles.secondaryButtonText}>Retake</Text>
                      </Pressable>
                      <Pressable
                        accessibilityRole="button"
                        disabled={saving}
                        onPress={() => setImageUri(null)}
                        style={styles.secondaryButton}
                      >
                        <Ionicons
                          color={colors.neutralIcon}
                          name="trash-outline"
                          size={17}
                        />
                        <Text style={styles.secondaryButtonText}>Remove</Text>
                      </Pressable>
                    </View>
                  </View>
                ) : (
                  <Pressable
                    accessibilityRole="button"
                    disabled={saving}
                    onPress={() => void takePhoto()}
                    style={({ pressed }) => [
                      styles.takePhotoButton,
                      pressed && styles.buttonPressed,
                    ]}
                  >
                    <Ionicons
                      color={colors.neutralIcon}
                      name="camera-outline"
                      size={22}
                    />
                    <Text style={styles.takePhotoText}>Take Photo</Text>
                    <Ionicons
                      color={colors.mutedText}
                      name="chevron-forward"
                      size={18}
                    />
                  </Pressable>
                )}
              </View>

              <View style={styles.section}>
                <Text style={styles.label}>Notes (optional)</Text>
                <TextInput
                  editable={!saving}
                  maxLength={500}
                  multiline
                  onBlur={() => setNotesFocused(false)}
                  onChangeText={setNotes}
                  onFocus={() => setNotesFocused(true)}
                  placeholder="Add a note about your progress..."
                  placeholderTextColor={colors.mutedText}
                  style={[
                    styles.notesInput,
                    notesFocused && styles.notesInputFocused,
                  ]}
                  textAlignVertical="top"
                  value={notes}
                />
              </View>

              {error ? (
                <Text accessibilityRole="alert" style={styles.error}>
                  {error}
                </Text>
              ) : null}

              <View style={styles.actions}>
                <Pressable
                  accessibilityRole="button"
                  disabled={saving}
                  onPress={onClose}
                  style={[styles.actionButton, styles.cancelButton]}
                >
                  <Text style={styles.cancelText}>Cancel</Text>
                </Pressable>
                <Pressable
                  accessibilityRole="button"
                  disabled={saving}
                  onPress={() => void submit()}
                  style={[
                    styles.actionButton,
                    styles.saveButton,
                    saving && styles.disabledButton,
                  ]}
                >
                  {saving ? (
                    <ActivityIndicator color={colors.backgroundPrimary} />
                  ) : (
                    <Text style={styles.saveText}>Save update</Text>
                  )}
                </Pressable>
              </View>
            </ScrollView>
          </SafeAreaView>
        </KeyboardAvoidingView>
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
  keyboardArea: {
    maxHeight: '92%',
    justifyContent: 'flex-end',
  },
  sheet: {
    overflow: 'hidden',
    paddingTop: spacing.lg,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.backgroundPrimary,
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  headerText: {
    flex: 1,
    marginRight: spacing.md,
  },
  title: {
    color: colors.textPrimary,
    fontSize: 21,
    fontWeight: '700',
  },
  subtitle: {
    marginTop: 3,
    color: colors.mutedText,
    fontSize: 13,
  },
  closeButton: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 19,
    backgroundColor: colors.backgroundSecondary,
  },
  content: {
    gap: spacing.md,
    paddingBottom: spacing.lg,
  },
  section: {
    gap: spacing.xs,
  },
  sectionHeading: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  label: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '600',
  },
  progressValue: {
    color: colors.brand,
    fontSize: 16,
    fontWeight: '700',
  },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  progressLabel: {
    color: colors.mutedText,
    fontSize: 10,
  },
  activeProgressLabel: {
    color: colors.brand,
    fontWeight: '700',
  },
  takePhotoButton: {
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    backgroundColor: colors.warmWhite,
  },
  takePhotoText: {
    flex: 1,
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: '600',
  },
  photoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    backgroundColor: colors.warmWhite,
  },
  preview: {
    width: 84,
    height: 96,
    borderRadius: 10,
    backgroundColor: colors.border,
  },
  photoActions: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: spacing.sm,
  },
  photoHint: {
    width: '100%',
    color: colors.mutedText,
    fontSize: 11,
  },
  secondaryButton: {
    minHeight: 34,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: 9,
    backgroundColor: colors.backgroundSecondary,
  },
  secondaryButtonText: {
    color: colors.neutralIcon,
    fontSize: 12,
    fontWeight: '600',
  },
  notesInput: {
    minHeight: 78,
    padding: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    backgroundColor: colors.backgroundPrimary,
    color: colors.text,
    fontSize: 14,
  },
  notesInputFocused: {
    borderColor: colors.textPrimary,
  },
  error: {
    color: colors.error,
    padding: spacing.sm,
    backgroundColor: colors.errorSurface,
    borderRadius: 8,
    fontSize: 12,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  actionButton: {
    flex: 1,
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
  },
  cancelButton: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.warmWhite,
  },
  cancelText: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: colors.brand,
  },
  saveText: {
    color: colors.backgroundPrimary,
    fontSize: 14,
    fontWeight: '700',
  },
  disabledButton: {
    opacity: 0.65,
  },
  buttonPressed: {
    opacity: 0.8,
  },
});
