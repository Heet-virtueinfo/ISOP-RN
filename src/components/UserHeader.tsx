import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Bell, ChevronLeft } from 'lucide-react-native';
import { colors, spacing, typography } from '../theme';
import { useAuth } from '../contexts/AuthContext';

interface UserHeaderProps {
  title: string;
  onNotificationPress?: () => void;
  showBack?: boolean;
  onBackPress?: () => void;
  showActions?: boolean;
  participantsCount?: number;
}

const UserHeader: React.FC<UserHeaderProps> = ({
  title,
  onNotificationPress,
  showBack = false,
  onBackPress,
  showActions = true,
  participantsCount,
}) => {
  const insets = useSafeAreaInsets();
  const { userProfile } = useAuth();

  return (
    <View style={styles.outerContainer}>
      <View
        style={[
          styles.container,
          { paddingTop: Math.max(insets.top, spacing.xs) },
        ]}
      >
        <View style={styles.contentRow}>
          <View style={styles.leftSection}>
            {showBack && (
              <TouchableOpacity style={styles.backBtn} onPress={onBackPress}>
                <ChevronLeft size={22} color={colors.text.primary} />
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.titleContainer}>
            <Text style={styles.title} numberOfLines={1}>
              {title}
            </Text>
          </View>

          <View style={styles.actionsRow}>
            {!!participantsCount && (
              <View style={styles.participantsCount}>
                <Text style={styles.participantsCountText}>
                  {participantsCount}
                </Text>
              </View>
            )}
            {showActions && (
              <View style={styles.actionPod}>
                <TouchableOpacity
                  style={styles.notificationBtn}
                  activeOpacity={0.7}
                  onPress={onNotificationPress}
                >
                  <Bell size={18} color={colors.text.primary} />
                  <View style={styles.badge} />
                </TouchableOpacity>

                <View style={styles.profileBtn}>
                  {userProfile?.profileImage ? (
                    <Image
                      source={{ uri: userProfile.profileImage }}
                      style={styles.avatar}
                    />
                  ) : (
                    <View style={styles.avatarPlaceholder}>
                      <Text style={styles.avatarText}>
                        {userProfile?.displayName?.charAt(0).toUpperCase() ||
                          'U'}
                      </Text>
                    </View>
                  )}
                  <View style={styles.statusDot} />
                </View>
              </View>
            )}
            {!showActions && showBack && <View style={{ width: 32 }} />}
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  outerContainer: {
    backgroundColor: '#FAFAFA',
    zIndex: 100,
    width: '100%',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
      },
      android: {
        elevation: 3,
      },
    }),
  },

  container: {
    paddingBottom: 0,
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    height: 54,
  },
  leftSection: {
    minWidth: 80,
  },
  backBtn: {
    marginRight: spacing.sm,
    marginLeft: -4,
  },
  titleContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontFamily: typography.fontFamily,
    fontSize: 14,
    fontWeight: '800',
    color: colors.text.primary,
    textTransform: 'uppercase',
    letterSpacing: 2,
    textAlign: 'center',
  },
  participantsCount: {
    paddingHorizontal: spacing.xs,
    paddingVertical: spacing.xxs,
    borderRadius: 8,
    backgroundColor: 'rgba(0,0,0,0.03)',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  participantsCountText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text.primary,
  },
  actionsRow: {
    minWidth: 80,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  actionPod: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.03)',
    gap: spacing.xs,
    padding: 3,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  notificationBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  badge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.status.error,
    borderWidth: 1,
    borderColor: 'white',
  },
  profileBtn: {
    position: 'relative',
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'white',
  },
  avatarPlaceholder: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.brand.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'white',
  },
  avatarText: {
    fontFamily: typography.fontFamily,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    color: colors.text.inverse,
  },
  statusDot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: colors.status.success,
    borderWidth: 2,
    borderColor: colors.layout.surface,
  },
});

export default UserHeader;
