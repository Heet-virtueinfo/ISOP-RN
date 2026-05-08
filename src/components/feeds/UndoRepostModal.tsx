import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  Pressable,
  StyleSheet,
  Platform,
} from 'react-native';
import { colors, spacing, typography, radius } from '../../theme';

interface UndoRepostModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const UndoRepostModal = ({ visible, onClose, onConfirm }: UndoRepostModalProps) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.confirmOverlay} onPress={onClose}>
        <View style={styles.confirmModal}>
          <Text style={styles.confirmTitle}>Undo Repost?</Text>
          <Text style={styles.confirmSub}>
            Are you sure you want to remove this repost from your feed?
          </Text>
          <View style={styles.confirmButtons}>
            <TouchableOpacity
              style={[styles.confirmBtn, styles.confirmBtnCancel]}
              onPress={onClose}
            >
              <Text style={styles.confirmBtnCancelText}>No</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.confirmBtn, styles.confirmBtnYes]}
              onPress={() => {
                onClose();
                onConfirm();
              }}
            >
              <Text style={styles.confirmBtnYesText}>Yes</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  confirmOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  confirmModal: {
    width: '85%',
    backgroundColor: colors.layout.surface,
    borderRadius: radius.lg,
    padding: spacing.xl,
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
      },
      android: { elevation: 10 },
    }),
  },
  confirmTitle: {
    fontFamily: typography.fontFamily,
    fontSize: 18,
    fontWeight: '800',
    color: colors.text.primary,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  confirmSub: {
    fontFamily: typography.fontFamily,
    fontSize: 14,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: spacing.xl,
  },
  confirmButtons: {
    flexDirection: 'row',
    gap: spacing.md,
    width: '100%',
  },
  confirmBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmBtnCancel: {
    backgroundColor: colors.layout.surfaceElevated,
    borderWidth: 1,
    borderColor: colors.layout.divider,
  },
  confirmBtnYes: {
    backgroundColor: '#EF4444',
  },
  confirmBtnCancelText: {
    fontFamily: typography.fontFamily,
    fontSize: 15,
    fontWeight: '700',
    color: colors.text.secondary,
  },
  confirmBtnYesText: {
    fontFamily: typography.fontFamily,
    fontSize: 15,
    fontWeight: '700',
    color: 'white',
  },
});

export default UndoRepostModal;
