import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TouchableWithoutFeedback,
  Dimensions,
} from 'react-native';
import { Trash2, X, AlertTriangle } from 'lucide-react-native';
import { colors, spacing, typography } from '../../theme';

const { width } = Dimensions.get('window');

interface DeleteAccountConfirmModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  loading?: boolean;
}

const DeleteAccountConfirmModal: React.FC<DeleteAccountConfirmModalProps> = ({
  visible,
  onClose,
  onConfirm,
  loading = false,
}) => {
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
              {/* Floating Header */}
              <View style={styles.floatingHeader}>
                <View style={styles.iconBox}>
                  <Trash2 size={36} color="#EF4444" />
                </View>
              </View>

              <TouchableOpacity
                onPress={onClose}
                disabled={loading}
                style={styles.closeBtn}
              >
                <X size={20} color={colors.text.tertiary} />
              </TouchableOpacity>

              {/* Title Section */}
              <View style={styles.titleSection}>
                <Text style={styles.preTitle}>DANGER ZONE</Text>
                <Text style={styles.mainTitle}>
                  Delete Your Account Permanently?
                </Text>
              </View>

              {/* Message */}
              <View style={styles.messageBox}>
                <AlertTriangle size={18} color="#EF4444" />
                <Text style={styles.messageText}>
                  This action cannot be undone. All your chats, connections, and
                  profile data will be erased forever.
                </Text>
              </View>

              {/* Action Stack */}
              <View style={styles.actionStack}>
                <TouchableOpacity
                  style={styles.confirmBtn}
                  onPress={onConfirm}
                  disabled={loading}
                  activeOpacity={0.8}
                >
                  <Text style={styles.confirmBtnText}>
                    {loading ? 'Deleting...' : 'Yes, Delete Account'}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.cancelBtn}
                  onPress={onClose}
                  disabled={loading}
                  activeOpacity={0.7}
                >
                  <Text style={styles.cancelBtnText}>Keep My Account</Text>
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
    maxWidth: width * 0.85,
    backgroundColor: 'white',
    borderRadius: 32,
    padding: spacing.xl,
    paddingTop: 50,
    elevation: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    position: 'relative',
  },
  floatingHeader: {
    position: 'absolute',
    top: -40,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  iconBox: {
    width: 80,
    height: 80,
    borderRadius: 28,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(241, 245, 249, 1)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  closeBtn: {
    position: 'absolute',
    top: spacing.lg,
    right: spacing.lg,
    padding: 8,
    borderRadius: 12,
    backgroundColor: 'rgba(241, 245, 249, 0.5)',
  },
  titleSection: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  preTitle: {
    fontFamily: typography.fontFamily,
    fontSize: 10,
    fontWeight: '800',
    color: '#EF4444',
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
  messageBox: {
    flexDirection: 'row',
    backgroundColor: 'rgba(239, 68, 68, 0.05)',
    padding: spacing.md,
    borderRadius: 16,
    marginBottom: spacing.xl,
    gap: 10,
    alignItems: 'center',
  },
  messageText: {
    flex: 1,
    fontFamily: typography.fontFamily,
    fontSize: 12,
    lineHeight: 18,
    color: '#991B1B',
    fontWeight: '500',
  },
  actionStack: {
    gap: 12,
  },
  confirmBtn: {
    height: 56,
    backgroundColor: '#EF4444',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  confirmBtnText: {
    fontFamily: typography.fontFamily,
    fontSize: 16,
    fontWeight: '700',
    color: 'white',
  },
  cancelBtn: {
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(241, 245, 249, 1)',
  },
  cancelBtnText: {
    fontFamily: typography.fontFamily,
    fontSize: 15,
    fontWeight: '600',
    color: colors.text.secondary,
  },
});

export default DeleteAccountConfirmModal;
