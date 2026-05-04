import React from 'react';
import { getImageSource } from '../utils/imageHelpers';
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
import { colors, spacing, typography, radius } from '../theme';
import { useAuth } from '../contexts/AuthContext';

interface AdminHeaderProps {
  title?: string;
  showBack?: boolean;
  onBackPress?: () => void;
}

const AdminHeader: React.FC<AdminHeaderProps> = ({
  title = 'ISoP Admin',
  showBack = false,
  onBackPress,
}) => {
  const insets = useSafeAreaInsets();
  const { userProfile } = useAuth();

  return (
    <View style={styles.outerContainer}>
      <View
        style={[
          styles.container,
          { paddingTop: insets.top + spacing.sm },
        ]}
      >
        <View style={styles.contentRow}>

          {/* LEFT — back button (optional) + title */}
          <View style={styles.leftGroup}>
            {showBack && (
              <TouchableOpacity
                style={styles.backBtn}
                onPress={onBackPress}
                activeOpacity={0.7}
              >
                <ChevronLeft size={22} color={colors.text.primary} />
              </TouchableOpacity>
            )}
            <Text style={styles.title} numberOfLines={1}>
              {title}
            </Text>
          </View>

          {/* RIGHT — notification + avatar */}
          <View style={styles.actionsRow}>
            <TouchableOpacity
              style={styles.notificationBtn}
              activeOpacity={0.7}
              onPress={() => console.log('Notifications')}
            >
              <Bell size={20} color={colors.text.primary} />
              <View style={styles.badge} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.profileBtn} activeOpacity={0.8}>
              {userProfile?.profileImage ? (
                <Image
                  source={getImageSource(userProfile.profileImage)}
                  style={styles.avatar}
                />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Text style={styles.avatarText}>
                    {userProfile?.displayName?.charAt(0).toUpperCase() || 'A'}
                  </Text>
                </View>
              )}
              <View style={styles.statusDot} />
            </TouchableOpacity>
          </View>

        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  outerContainer: {
    backgroundColor: colors.layout.surface,
    zIndex: 100,
    ...Platform.select({
      ios: {
        shadowColor: 'rgba(0, 0, 0, 0.1)',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  container: {
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.ui.inputBorderLight,
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
  },
  // Back button + title grouped on the left
  leftGroup: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginRight: spacing.md,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.palette.slate.bg,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.ui.inputBorderLight,
    flexShrink: 0,
  },
  title: {
    fontFamily: typography.fontFamily,
    fontSize: 20,
    fontWeight: '800',
    color: colors.text.primary,
    letterSpacing: -0.5,
    flexShrink: 1,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  notificationBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.palette.slate.bg,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
    borderWidth: 1,
    borderColor: colors.ui.inputBorderLight,
  },
  badge: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: colors.status.error,
    borderWidth: 1.5,
    borderColor: '#F8FAFC',
  },
  profileBtn: {
    position: 'relative',
  },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1,
    borderColor: colors.layout.divider,
  },
  avatarPlaceholder: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.brand.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.brand.primary,
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

export default AdminHeader;
