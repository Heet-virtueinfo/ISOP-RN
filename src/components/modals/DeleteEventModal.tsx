import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
  TouchableWithoutFeedback,
  Dimensions,
  Image,
} from 'react-native';
import { AlertTriangle, Trash2, X, AlertCircle } from 'lucide-react-native';
import { colors, spacing, typography } from '../../theme';
import { AppEvent } from '../../types';
import { getEventImage } from '../../utils/eventHelpers';

const { width } = Dimensions.get('window');

interface DeleteEventModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  event: AppEvent | null;
  loading?: boolean;
}

const DeleteEventModal: React.FC<DeleteEventModalProps> = ({
  visible,
  onClose,
  onConfirm,
  event,
  loading = false,
}) => {
  if (!event) return null;

  const imageSource = getEventImage(event);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={loading ? undefined : onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={styles.capsule}>
              {/* Floating Security Header */}
              <View style={styles.floatingHeader}>
                <View style={styles.securityIconBox}>
                  <AlertTriangle size={36} color={colors.status.error} />
                </View>
              </View>

              <TouchableOpacity
                onPress={onClose}
                disabled={loading}
                style={styles.closeBtn}
              >
                <X size={20} color={colors.text.tertiary} />
              </TouchableOpacity>

              {/* Security Directive */}
              <View style={styles.directiveSection}>
                <Text style={styles.directiveTitle}>SECURITY CHECK</Text>
                <Text style={styles.mainTitle}>
                  Permanently Delete{'\n'}This Event?
                </Text>
              </View>

              {/* Event Perspective Card */}
              <View style={styles.perspectiveCard}>
                <Image
                  source={imageSource}
                  style={styles.previewImage}
                  resizeMode="cover"
                />
                <View style={styles.previewContent}>
                  <Text style={styles.previewLabel}>SELECTED TARGET</Text>
                  <Text style={styles.previewTitle} numberOfLines={1}>
                    {event.title}
                  </Text>
                  <View style={styles.enrolledBadge}>
                    <Text style={styles.enrolledText}>
                      {event.enrolledCount} ACTIVE ENROLLMENTS
                    </Text>
                  </View>
                </View>
              </View>

              {/* Impact Warning */}
              <View style={styles.impactBox}>
                <AlertCircle size={14} color={colors.status.error} />
                <Text style={styles.impactText}>
                  All associated student data and enrollments will be
                  permanently deleted from the ecosystem.
                </Text>
              </View>

              {/* Executive Action Stack */}
              <View style={styles.actionStack}>
                <TouchableOpacity
                  style={[styles.deleteBtn, loading && styles.btnLoading]}
                  onPress={onConfirm}
                  disabled={loading}
                  activeOpacity={0.8}
                >
                  {loading ? (
                    <ActivityIndicator size="small" color="white" />
                  ) : (
                    <>
                      <Trash2 size={18} color="white" />
                      <Text style={styles.deleteBtnText}>Delete Event</Text>
                    </>
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.abortBtn}
                  onPress={onClose}
                  disabled={loading}
                  activeOpacity={0.7}
                >
                  <Text style={styles.abortBtnText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.8)', // Darker, more intense
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  capsule: {
    width: '100%',
    maxWidth: width * 0.9,
    backgroundColor: colors.layout.surface,
    borderRadius: 40, // Extreme curvature for capsule feel
    padding: spacing.xl,
    paddingTop: 50, // More space for floating icon
    elevation: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 15 },
    shadowOpacity: 0.3,
    shadowRadius: 25,
    position: 'relative',
  },
  floatingHeader: {
    position: 'absolute',
    top: -40,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 10,
  },
  securityIconBox: {
    width: 80,
    height: 80,
    borderRadius: 30,
    backgroundColor: colors.layout.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: colors.layout.background,
    shadowColor: colors.status.error,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  closeBtn: {
    position: 'absolute',
    top: spacing.lg,
    right: spacing.lg,
    padding: 8,
    borderRadius: 12,
    backgroundColor: colors.palette.slate.bg,
  },
  directiveSection: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  directiveTitle: {
    fontFamily: typography.fontFamily,
    fontSize: 10,
    fontWeight: '800',
    color: colors.status.error,
    letterSpacing: 2,
    marginBottom: 8,
  },
  mainTitle: {
    fontFamily: typography.fontFamily,
    fontSize: 24,
    fontWeight: '800',
    color: colors.text.primary,
    textAlign: 'center',
    lineHeight: 30,
  },
  perspectiveCard: {
    flexDirection: 'row',
    backgroundColor: colors.palette.slate.bg,
    borderRadius: 24,
    padding: spacing.sm,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(226, 232, 240, 0.5)',
  },
  previewImage: {
    width: 80,
    height: 80,
    borderRadius: 18,
  },
  previewContent: {
    flex: 1,
    marginLeft: 16,
    justifyContent: 'center',
  },
  previewLabel: {
    fontFamily: typography.fontFamily,
    fontSize: 8,
    fontWeight: '800',
    color: colors.text.tertiary,
    letterSpacing: 1,
    marginBottom: 4,
  },
  previewTitle: {
    fontFamily: typography.fontFamily,
    fontSize: 16,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: 6,
  },
  enrolledBadge: {
    backgroundColor: 'rgba(79, 70, 229, 0.05)',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  enrolledText: {
    fontFamily: typography.fontFamily,
    fontSize: 8,
    fontWeight: '800',
    color: colors.brand.primary,
  },
  impactBox: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    marginBottom: spacing.xl,
    gap: 10,
  },
  impactText: {
    flex: 1,
    fontFamily: typography.fontFamily,
    fontSize: 11,
    lineHeight: 16,
    color: colors.text.secondary,
    fontWeight: '500',
  },
  actionStack: {
    gap: 12,
  },
  deleteBtn: {
    height: 60,
    backgroundColor: colors.status.error,
    borderRadius: 20,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
    shadowColor: colors.status.error,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  btnLoading: {
    opacity: 0.8,
  },
  deleteBtnText: {
    fontFamily: typography.fontFamily,
    fontSize: 16,
    fontWeight: '800',
    color: 'white',
    letterSpacing: 1,
  },
  abortBtn: {
    height: 54,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.layout.divider,
  },
  abortBtnText: {
    fontFamily: typography.fontFamily,
    fontSize: 14,
    fontWeight: '700',
    color: colors.text.secondary,
    letterSpacing: 0.5,
  },
});

export default DeleteEventModal;
