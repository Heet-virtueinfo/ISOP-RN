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
import { AlertTriangle, X, Info } from 'lucide-react-native';
import { colors, spacing, typography } from '../../theme';
import CustomLoader from '../CustomLoader';

const { width } = Dimensions.get('window');

interface UnenrollConfirmModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  eventName: string;
  loading?: boolean;
}

const UnenrollConfirmModal: React.FC<UnenrollConfirmModalProps> = ({
  visible,
  onClose,
  onConfirm,
  eventName,
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
              <View style={styles.floatingHeader}>
                <View style={styles.iconBox}>
                  <AlertTriangle size={36} color="#EF4444" />
                </View>
              </View>

              <TouchableOpacity
                onPress={onClose}
                disabled={loading}
                style={styles.closeBtn}
              >
                <X size={20} color={colors.text.tertiary} />
              </TouchableOpacity>

              <View style={styles.titleSection}>
                <Text style={styles.preTitle}>LEAVE EVENT?</Text>
                <Text style={styles.mainTitle}>
                  Unenroll From {'\n'}
                  <Text style={{ color: '#EF4444' }}>{eventName}</Text>?
                </Text>
              </View>

              <View style={styles.messageBox}>
                <Info size={14} color={colors.text.tertiary} />
                <Text style={styles.messageText}>
                  You'll be removed from the participant list and will no longer
                  receive session updates or networking access.
                </Text>
              </View>

              <View style={styles.actionStack}>
                <TouchableOpacity
                  style={[styles.confirmBtn, { backgroundColor: '#EF4444' }]}
                  onPress={onConfirm}
                  disabled={loading}
                  activeOpacity={0.8}
                >
                  {loading ? (
                    <CustomLoader size={24} color="white" overlay={false} />
                  ) : (
                    <Text style={styles.confirmBtnText}>Yes, Unenroll</Text>
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.cancelBtn}
                  onPress={onClose}
                  disabled={loading}
                  activeOpacity={0.7}
                >
                  <Text style={styles.cancelBtnText}>Keep Enrollment</Text>
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
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
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
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
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
    fontSize: 20,
    fontWeight: '800',
    color: colors.text.primary,
    textAlign: 'center',
    lineHeight: 26,
  },
  messageBox: {
    flexDirection: 'row',
    backgroundColor: 'rgba(239, 68, 68, 0.03)',
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
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#EF4444',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: { elevation: 4 },
    }),
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

export default UnenrollConfirmModal;
