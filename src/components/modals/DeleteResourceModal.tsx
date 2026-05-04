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
} from 'react-native';
import { AlertCircle, Trash2, X, AlertTriangle } from 'lucide-react-native';
import { colors, spacing, typography, radius } from '../../theme';
import { ResourceItem } from '../../types';

const { width } = Dimensions.get('window');

interface DeleteResourceModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  resource: ResourceItem | null;
  loading?: boolean;
}

const DeleteResourceModal: React.FC<DeleteResourceModalProps> = ({
  visible,
  onClose,
  onConfirm,
  resource,
  loading = false,
}) => {
  if (!resource) return null;

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
              {/* Security Header */}
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

              {/* Title & Directive */}
              <View style={styles.directiveSection}>
                <Text style={styles.directiveTitle}>CONFIRM REMOVAL</Text>
                <Text style={styles.mainTitle}>
                  Permanently Delete{'\n'}This Resource?
                </Text>
              </View>

              {/* Resource Detail Card */}
              <View style={styles.resourceCard}>
                <View style={styles.categoryBadge}>
                  <Text style={styles.categoryText}>{resource.category.toUpperCase()}</Text>
                </View>
                <Text style={styles.resourceTitle} numberOfLines={2}>
                  {resource.title}
                </Text>
                <Text style={styles.resourceType}>
                  Type: {resource.type === 'pdf' ? 'Document (PDF)' : 'External Link'}
                </Text>
              </View>

              {/* Warning box */}
              <View style={styles.impactBox}>
                <AlertCircle size={14} color={colors.status.error} />
                <Text style={styles.impactText}>
                  This document will be permanently removed from the Knowledge Resources library for all users.
                </Text>
              </View>

              {/* Actions */}
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
                      <Text style={styles.deleteBtnText}>Delete Resource</Text>
                    </>
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.cancelBtn}
                  onPress={onClose}
                  disabled={loading}
                  activeOpacity={0.7}
                >
                  <Text style={styles.cancelBtnText}>Keep Resource</Text>
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
    backgroundColor: 'rgba(15, 23, 42, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  capsule: {
    width: '100%',
    maxWidth: width * 0.9,
    backgroundColor: colors.layout.surface,
    borderRadius: radius.xxl,
    padding: spacing.xl,
    paddingTop: 50,
    elevation: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 15,
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
    borderRadius: 24,
    backgroundColor: colors.layout.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: colors.layout.background,
    shadowColor: colors.status.error,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
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
    fontSize: 22,
    fontWeight: '800',
    color: colors.text.primary,
    textAlign: 'center',
    lineHeight: 28,
  },
  resourceCard: {
    backgroundColor: colors.palette.slate.bg,
    borderRadius: radius.xl,
    padding: spacing.md,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.layout.divider,
  },
  categoryBadge: {
    backgroundColor: colors.brand.primary,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  categoryText: {
    fontFamily: typography.fontFamily,
    fontSize: 9,
    fontWeight: '800',
    color: 'white',
  },
  resourceTitle: {
    fontFamily: typography.fontFamily,
    fontSize: 15,
    fontWeight: '700',
    color: colors.text.primary,
    lineHeight: 20,
    marginBottom: 4,
  },
  resourceType: {
    fontFamily: typography.fontFamily,
    fontSize: 11,
    color: colors.text.tertiary,
    fontWeight: '500',
  },
  impactBox: {
    flexDirection: 'row',
    paddingHorizontal: spacing.sm,
    marginBottom: spacing.xl,
    gap: 8,
    alignItems: 'center',
  },
  impactText: {
    flex: 1,
    fontFamily: typography.fontFamily,
    fontSize: 12,
    color: colors.text.secondary,
    fontWeight: '500',
    lineHeight: 16,
  },
  actionStack: {
    gap: 12,
  },
  deleteBtn: {
    height: 56,
    backgroundColor: colors.status.error,
    borderRadius: radius.lg,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
    shadowColor: colors.status.error,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  btnLoading: {
    opacity: 0.8,
  },
  deleteBtnText: {
    fontFamily: typography.fontFamily,
    fontSize: 16,
    fontWeight: '800',
    color: 'white',
  },
  cancelBtn: {
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.layout.divider,
  },
  cancelBtnText: {
    fontFamily: typography.fontFamily,
    fontSize: 14,
    fontWeight: '700',
    color: colors.text.secondary,
  },
});

export default DeleteResourceModal;
