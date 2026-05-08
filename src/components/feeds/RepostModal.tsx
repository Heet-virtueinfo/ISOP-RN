import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { ListCheck, Repeat2 } from 'lucide-react-native';
import { colors, spacing, typography, radius } from '../../theme';

interface RepostModalProps {
  visible: boolean;
  reposting: boolean;
  isAlreadyReposted: boolean;
  onClose: () => void;
  onRepostWithThoughts: () => void;
  onInstantRepost: () => void;
}

const RepostModal = ({
  visible,
  reposting,
  isAlreadyReposted,
  onClose,
  onRepostWithThoughts,
  onInstantRepost,
}: RepostModalProps) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable style={styles.repostOverlay} onPress={onClose}>
        <Pressable style={styles.repostSheet} onPress={() => {}}>
          <View style={styles.repostHandle} />
          <View style={styles.repostTitleRow}>
            <Text style={styles.repostTitle}>Share Post</Text>
            <TouchableOpacity
              style={styles.repostCloseBtn}
              onPress={onClose}
              activeOpacity={0.7}
            >
              <Text style={styles.repostCloseX}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Repost with Thoughts */}
          <TouchableOpacity
            style={styles.repostOption}
            activeOpacity={0.75}
            onPress={isAlreadyReposted ? onInstantRepost : onRepostWithThoughts}
            disabled={reposting}
          >
            <View style={styles.repostOptionIcon}>
              <ListCheck size={20} color={colors.brand.primary} />
            </View>
            <View style={styles.repostOptionContent}>
              <Text style={styles.repostOptionTitle}>
                Repost with your thoughts
              </Text>
              <Text style={styles.repostOptionSub}>
                Share this post with your own commentary
              </Text>
            </View>
          </TouchableOpacity>

          {/* Instant Repost */}
          <TouchableOpacity
            style={styles.repostOption}
            activeOpacity={0.75}
            onPress={onInstantRepost}
            disabled={reposting}
          >
            <View style={styles.repostOptionIcon}>
              {reposting ? (
                <ActivityIndicator size="small" color={colors.brand.primary} />
              ) : (
                <Repeat2 size={20} color={colors.brand.primary} />
              )}
            </View>
            <View style={styles.repostOptionContent}>
              <Text style={styles.repostOptionTitle}>Repost</Text>
              <Text style={styles.repostOptionSub}>
                Instantly share this post with your network
              </Text>
            </View>
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  repostOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
    justifyContent: 'flex-end',
  },
  repostSheet: {
    backgroundColor: colors.layout.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
    paddingTop: spacing.sm,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.1,
        shadowRadius: 16,
      },
      android: { elevation: 16 },
    }),
  },
  repostHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.layout.divider,
    alignSelf: 'center',
    marginBottom: spacing.md,
  },
  repostTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  repostTitle: {
    fontFamily: typography.fontFamily,
    fontSize: 18,
    fontWeight: '800',
    color: colors.text.primary,
  },
  repostCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.layout.surfaceElevated,
    justifyContent: 'center',
    alignItems: 'center',
  },
  repostCloseX: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text.secondary,
  },
  repostOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
    borderRadius: radius.lg,
  },
  repostOptionIcon: {
    width: 52,
    height: 52,
    borderRadius: radius.md,
    backgroundColor: colors.layout.surfaceElevated,
    justifyContent: 'center',
    alignItems: 'center',
  },
  repostOptionContent: { flex: 1 },
  repostOptionTitle: {
    fontFamily: typography.fontFamily,
    fontSize: 15,
    fontWeight: '800',
    color: colors.text.primary,
    marginBottom: 3,
  },
  repostOptionSub: {
    fontFamily: typography.fontFamily,
    fontSize: 13,
    color: colors.text.tertiary,
  },
});

export default RepostModal;
