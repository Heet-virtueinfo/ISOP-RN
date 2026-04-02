import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TouchableWithoutFeedback,
  Dimensions,
  Platform,
} from 'react-native';
import { LogOut, X, AlertCircle } from 'lucide-react-native';
import { colors, spacing, typography } from '../../theme';

const { width } = Dimensions.get('window');

interface LogoutConfirmModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  loading?: boolean;
}

const LogoutConfirmModal: React.FC<LogoutConfirmModalProps> = ({
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
                  <LogOut size={36} color={colors.status.error} />
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
                <Text style={styles.preTitle}>SESSION MANAGEMENT</Text>
                <Text style={styles.mainTitle}>
                  Securely Logout{'\n'}of Your Account?
                </Text>
              </View>

              {/* Message */}
              <View style={styles.messageBox}>
                <AlertCircle size={14} color={colors.text.tertiary} />
                <Text style={styles.messageText}>
                  You will need to re-authenticate to access your dashboard and
                  event highlights.
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
                  <Text style={styles.confirmBtnText}>Yes, Logout</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.cancelBtn}
                  onPress={onClose}
                  disabled={loading}
                  activeOpacity={0.7}
                >
                  <Text style={styles.cancelBtnText}>Cancel</Text>
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
    color: colors.text.tertiary,
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
    backgroundColor: 'rgba(241, 245, 249, 0.5)',
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
    color: colors.text.secondary,
    fontWeight: '500',
  },
  actionStack: {
    gap: 12,
  },
  confirmBtn: {
    height: 56,
    backgroundColor: colors.status.error,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
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

export default LogoutConfirmModal;
