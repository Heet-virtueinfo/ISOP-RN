import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  Platform,
  StatusBar,
} from 'react-native';
import {
  LogOut,
  User,
  Mail,
  Phone,
  Shield,
  ChevronRight,
  Settings,
} from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { colors, spacing, typography, radius } from '../../theme';
import { useAuth } from '../../contexts/AuthContext';
import UserHeader from '../../components/UserHeader';
import Button from '../../components/Button';
import LogoutConfirmModal from '../../components/modals/LogoutConfirmModal';

const ProfileScreen = () => {
  const navigation = useNavigation<any>();
  const { userProfile, logout } = useAuth();
  const [showLogoutModal, setShowLogoutModal] = React.useState(false);

  const handleLogout = async () => {
    setShowLogoutModal(false);
    await logout();
  };

  const ProfileItem = ({
    icon: Icon,
    label,
    value,
    color = colors.brand.primary,
    isLast = false,
  }: any) => (
    <View style={[styles.profileItem, isLast && { borderBottomWidth: 0 }]}>
      <View style={[styles.iconBox, { backgroundColor: color + '10' }]}>
        <Icon size={18} color={color} />
      </View>
      <View style={styles.itemContent}>
        <Text style={styles.itemLabel}>{label}</Text>
        <Text style={styles.itemValue}>{value || 'Not provided'}</Text>
      </View>
    </View>
  );

  const getInitials = (name: string) => {
    return (
      name
        ?.split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .substring(0, 2) || 'U'
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      <UserHeader title="Account Profile" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Identity Header */}
        <View style={styles.avatarSection}>
          <View style={styles.avatarWrapper}>
            <View style={styles.avatarOuterShadow}>
              <View style={styles.avatarImageContainer}>
                {userProfile?.profileImage ? (
                  <Image
                    source={{ uri: userProfile.profileImage }}
                    style={styles.avatarImage}
                  />
                ) : (
                  <Text style={styles.avatarText}>
                    {getInitials(userProfile?.displayName || '')[0]}
                  </Text>
                )}
              </View>
            </View>
            <View style={styles.roleBadge}>
              <Shield size={10} color="white" />
              <Text style={styles.roleText}>
                {userProfile?.role.toUpperCase()}
              </Text>
            </View>
          </View>
          <Text style={styles.name}>{userProfile?.displayName}</Text>
          <Text style={styles.membershipDate}>ISoP MEMBER SINCE 2026</Text>
        </View>

        {/* Bento Info Dashboard */}
        <View style={styles.infoCard}>
          <ProfileItem
            icon={User}
            label="Full Name"
            value={userProfile?.displayName}
          />
          <View style={styles.divider} />
          <ProfileItem
            icon={Mail}
            label="Email Address"
            value={userProfile?.email}
            color="#10B981"
          />
          <View style={styles.divider} />
          <ProfileItem
            icon={Phone}
            label="Phone Number"
            value={userProfile?.phoneNumber}
            color="#F59E0B"
            isLast={true}
          />
        </View>

        {/* Premium Action Stack */}
        <View style={styles.actionsBox}>
          <TouchableOpacity
            style={styles.actionRow}
            activeOpacity={0.7}
            onPress={() => navigation.navigate('EditProfile')}
          >
            <View style={styles.actionIconContainer}>
              <User size={20} color={colors.brand.primary} />
            </View>
            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>Profile Settings</Text>
              <Text style={styles.actionSubtitle}>
                Update your presence and info
              </Text>
            </View>
            <ChevronRight size={18} color={colors.text.tertiary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.logoutBtn}
            activeOpacity={0.7}
            onPress={() => setShowLogoutModal(true)}
          >
            <View style={styles.logoutIconBox}>
              <LogOut size={20} color="#EF4444" />
            </View>
            <Text style={styles.logoutText}>Logout</Text>
            <ChevronRight size={18} color="rgba(239, 68, 68, 0.2)" />
          </TouchableOpacity>
        </View>
      </ScrollView>

      <LogoutConfirmModal
        visible={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={handleLogout}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.layout.background,
  },
  scrollContent: {
    padding: spacing.xl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  avatarWrapper: {
    position: 'relative',
    marginBottom: spacing.xl,
  },
  avatarOuterShadow: {
    padding: 4,
    borderRadius: 60,
    backgroundColor: 'white',
    ...Platform.select({
      ios: {
        shadowColor: '#64748B',
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.08,
        shadowRadius: 20,
      },
      android: { elevation: 10 },
    }),
  },
  avatarImageContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: 'rgba(241, 245, 249, 1)',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  avatarText: {
    fontSize: 40,
    fontWeight: '800',
    color: colors.brand.primary,
  },
  roleBadge: {
    position: 'absolute',
    bottom: -4,
    alignSelf: 'center',
    backgroundColor: colors.brand.primary,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 3,
    borderColor: 'white',
    ...Platform.select({
      ios: {
        shadowColor: colors.brand.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: { elevation: 6 },
    }),
  },
  roleText: {
    fontSize: 10,
    fontWeight: '900',
    color: 'white',
    letterSpacing: 1.5,
  },
  name: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.text.primary,
    fontFamily: typography.fontFamily,
    marginBottom: 4,
    letterSpacing: -0.5,
  },
  membershipDate: {
    fontSize: 11,
    color: colors.text.tertiary,
    fontWeight: '800',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  infoCard: {
    backgroundColor: 'white',
    borderRadius: 28,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(241, 245, 249, 1)',
    ...Platform.select({
      ios: {
        shadowColor: '#64748B',
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.05,
        shadowRadius: 24,
      },
      android: { elevation: 8 },
    }),
  },
  profileItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 18,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(241, 245, 249, 1)',
    marginHorizontal: spacing.xs,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  itemContent: {
    flex: 1,
  },
  itemLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.text.tertiary,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: 4,
  },
  itemValue: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text.primary,
    fontFamily: typography.fontFamily,
  },
  actionsBox: {
    gap: 12,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: spacing.md,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(241, 245, 249, 1)',
    ...Platform.select({
      ios: {
        shadowColor: '#64748B',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.04,
        shadowRadius: 16,
      },
      android: { elevation: 4 },
    }),
  },
  actionIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: 'rgba(79, 70, 229, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  actionContent: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.text.primary,
    fontFamily: typography.fontFamily,
  },
  actionSubtitle: {
    fontSize: 12,
    color: colors.text.tertiary,
    fontWeight: '500',
    marginTop: 2,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.02)',
    padding: spacing.md,
    borderRadius: 24,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: 'rgba(239, 68, 68, 0.2)',
    marginTop: 8,
  },
  logoutIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(239, 68, 68, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  logoutText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '800',
    color: '#EF4444',
    fontFamily: typography.fontFamily,
  },
});

export default ProfileScreen;
