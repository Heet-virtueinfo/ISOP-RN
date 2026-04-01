import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
} from 'react-native';
import {
  Settings as SettingsIcon,
  LogOut,
  Bell,
  Shield,
  ChevronRight,
  Info,
  ExternalLink,
} from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { colors, spacing, typography, radius } from '../../theme';
import { useAuth } from '../../contexts/AuthContext';

const AdminSettingsScreen = () => {
  const { userProfile, logout } = useAuth();
  const navigation = useNavigation<any>();

  const [logoutModalVisible, setLogoutModalVisible] = useState(false);

  const handleLogout = () => {
    setLogoutModalVisible(true);
  };

  const confirmLogout = async () => {
    setLogoutModalVisible(false);
    await logout();
  };

  const SettingsRow = ({
    icon: Icon,
    label,
    iconBg = colors.brand.primaryLight,
    iconColor = colors.brand.primary,
    onPress,
    showChevron = true,
  }: any) => (
    <TouchableOpacity style={styles.row} onPress={onPress} activeOpacity={0.6}>
      <View style={[styles.iconBox, { backgroundColor: iconBg }]}>
        <Icon size={20} color={iconColor} />
      </View>
      <Text style={styles.rowLabel}>{label}</Text>
      {showChevron && <ChevronRight size={18} color={colors.text.tertiary} />}
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Profile Hero Card */}
      <View style={styles.profileCard}>
        {/* Subtle Watermark Decoration */}
        <Shield
          size={120}
          color={colors.brand.primary}
          style={styles.watermark}
        />

        <View style={styles.profileHeader}>
          {/* Multi-layered Avatar Design */}
          <View style={styles.avatarContainer}>
            <View style={styles.avatarRingOuter}>
              <View style={styles.avatarRingInner}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>
                    {userProfile?.displayName?.charAt(0)?.toUpperCase() || 'A'}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>
              {userProfile?.displayName || 'Administrator'}
            </Text>
            <Text style={styles.profileEmail}>
              {userProfile?.email || 'admin@isop.org'}
            </Text>
            <View style={styles.roleBadge}>
              <Shield size={12} color={colors.text.inverse} />
              <Text style={styles.roleText}>Platform Admin</Text>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>PREFERENCES</Text>
        <View style={styles.settingsCard}>
          <SettingsRow
            icon={SettingsIcon}
            label="General Settings"
            iconBg={colors.palette.indigo.bg}
            iconColor={colors.palette.indigo.accent}
            onPress={() => {}}
          />
          <View style={styles.divider} />
          <SettingsRow
            icon={Bell}
            label="Notification Alerts"
            iconBg={colors.palette.amber.bg}
            iconColor={colors.palette.amber.accent}
            onPress={() => {}}
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>SUPPORT & ABOUT</Text>
        <View style={styles.settingsCard}>
          <SettingsRow
            icon={Info}
            label="About ISoP"
            iconBg={colors.palette.emerald.bg}
            iconColor={colors.palette.emerald.accent}
            onPress={() => {}}
          />
          <View style={styles.divider} />
          <SettingsRow
            icon={ExternalLink}
            label="Help & Documentation"
            iconBg={colors.palette.purple.bg}
            iconColor={colors.palette.purple.accent}
            onPress={() => {}}
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>ACCOUNT ACTIONS</Text>
        <View style={styles.settingsCard}>
          <SettingsRow
            icon={LogOut}
            label="Log Out"
            iconBg={colors.palette.rose.bg}
            iconColor={colors.palette.rose.accent}
            showChevron={false}
            onPress={handleLogout}
          />
        </View>
      </View>

      {/* Custom Logout Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={logoutModalVisible}
        onRequestClose={() => setLogoutModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalIconContainer}>
              <LogOut size={32} color={colors.palette.rose.accent} />
            </View>
            <Text style={styles.modalTitle}>Sign Out</Text>
            <Text style={styles.modalDescription}>
              Are you sure you want to log out of your admin account?
            </Text>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalBtn, styles.cancelBtn]}
                onPress={() => setLogoutModalVisible(false)}
                activeOpacity={0.7}
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalBtn, styles.logoutBtn]}
                onPress={confirmLogout}
                activeOpacity={0.8}
              >
                <Text style={styles.logoutBtnText}>Logout</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.layout.background,
  },
  content: {
    padding: spacing.xl,
    paddingBottom: spacing.xxl,
  },
  profileCard: {
    backgroundColor: colors.layout.surface,
    borderRadius: radius.xxl,
    padding: spacing.xl,
    marginBottom: spacing.xl,
    position: 'relative',
    overflow: 'hidden',
    shadowColor: colors.brand.primary,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 8,
    borderWidth: 1,
    borderColor: colors.ui.inputBorderLight,
  },
  watermark: {
    position: 'absolute',
    bottom: -30,
    right: -20,
    opacity: 0.04,
    transform: [{ rotate: '-15deg' }],
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 2,
  },
  avatarContainer: {
    marginRight: spacing.lg,
  },
  avatarRingOuter: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: 'rgba(30, 58, 138, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarRingInner: {
    width: 68,
    height: 68,
    borderRadius: 34,
    borderWidth: 2,
    borderColor: colors.layout.surface,
    backgroundColor: colors.layout.surface,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.brand.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontFamily: typography.fontFamily,
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.text.inverse,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontFamily: typography.fontFamily,
    fontSize: 22,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
    marginBottom: 2,
  },
  profileEmail: {
    fontFamily: typography.fontFamily,
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
    marginBottom: 8,
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.brand.primary,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: radius.round,
    alignSelf: 'flex-start',
    shadowColor: colors.brand.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  roleText: {
    fontFamily: typography.fontFamily,
    fontSize: 10,
    fontWeight: typography.weights.bold,
    color: colors.text.inverse,
    marginLeft: 6,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontFamily: typography.fontFamily,
    fontSize: 11,
    fontWeight: typography.weights.bold,
    color: colors.text.tertiary,
    marginBottom: spacing.sm,
    paddingLeft: spacing.xs,
    letterSpacing: 1,
  },
  settingsCard: {
    backgroundColor: colors.layout.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.ui.inputBorder,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: colors.layout.surface,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  rowLabel: {
    flex: 1,
    fontFamily: typography.fontFamily,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.medium,
    color: colors.text.primary,
  },
  divider: {
    height: 1,
    backgroundColor: colors.layout.divider,
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: colors.transparent.overlayDark,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  modalCard: {
    width: '100%',
    backgroundColor: colors.layout.surface,
    borderRadius: radius.xl,
    padding: spacing.xl,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 15,
    elevation: 10,
    borderWidth: 1,
    borderColor: colors.ui.inputBorderLight,
  },
  modalIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.palette.rose.bg,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  modalTitle: {
    fontFamily: typography.fontFamily,
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  modalDescription: {
    fontFamily: typography.fontFamily,
    fontSize: typography.sizes.md,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: spacing.xl,
    lineHeight: 22,
  },
  modalActions: {
    flexDirection: 'row',
    width: '100%',
    gap: spacing.md,
  },
  modalBtn: {
    flex: 1,
    height: 48,
    borderRadius: radius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelBtn: {
    backgroundColor: colors.layout.background,
    borderWidth: 1,
    borderColor: colors.ui.inputBorder,
  },
  logoutBtn: {
    backgroundColor: colors.status.error,
  },
  cancelBtnText: {
    fontFamily: typography.fontFamily,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semiBold,
    color: colors.text.secondary,
  },
  logoutBtnText: {
    fontFamily: typography.fontFamily,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semiBold,
    color: colors.text.inverse,
  },
});

export default AdminSettingsScreen;
