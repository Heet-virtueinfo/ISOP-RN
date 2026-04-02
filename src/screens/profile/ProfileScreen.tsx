import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Image, ScrollView, Platform } from 'react-native';
import { LogOut, User, Mail, Phone, Shield, ChevronRight, Settings } from 'lucide-react-native';
import { colors, spacing, typography, radius } from '../../theme';
import { useAuth } from '../../contexts/AuthContext';
import AdminHeader from '../../components/AdminHeader';

const ProfileScreen = () => {
  const { userProfile, logout } = useAuth();

  const ProfileItem = ({ icon: Icon, label, value, color = colors.brand.primary }: any) => (
    <View style={styles.profileItem}>
      <View style={[styles.iconBox, { backgroundColor: color + '10' }]}>
        <Icon size={20} color={color} />
      </View>
      <View style={styles.itemContent}>
        <Text style={styles.itemLabel}>{label}</Text>
        <Text style={styles.itemValue}>{value || 'Not provided'}</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <AdminHeader title="Account Profile" />
      
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Avatar Section */}
        <View style={styles.avatarSection}>
          <View style={styles.avatarWrapper}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{userProfile?.displayName?.charAt(0).toUpperCase() || 'U'}</Text>
            </View>
            <View style={styles.roleBadge}>
              <Shield size={10} color="white" />
              <Text style={styles.roleText}>{userProfile?.role.toUpperCase()}</Text>
            </View>
          </View>
          <Text style={styles.name}>{userProfile?.displayName}</Text>
          <Text style={styles.membershipDate}>ISoP Member since 2026</Text>
        </View>

        {/* Info Items */}
        <View style={styles.infoCard}>
          <ProfileItem icon={User} label="Full Name" value={userProfile?.displayName} />
          <ProfileItem icon={Mail} label="Email Address" value={userProfile?.email} color="#10B981" />
          <ProfileItem icon={Phone} label="Phone Number" value={userProfile?.phoneNumber} color="#F59E0B" />
        </View>

        {/* Actions */}
        <View style={styles.actionsBox}>
          <TouchableOpacity style={styles.actionBtn}>
             <Settings size={20} color={colors.text.secondary} />
             <Text style={styles.actionBtnText}>Account Settings</Text>
             <ChevronRight size={18} color={colors.text.tertiary} />
          </TouchableOpacity>

          <TouchableOpacity style={[styles.actionBtn, styles.logoutBtn]} onPress={logout}>
             <LogOut size={20} color="#EF4444" />
             <Text style={[styles.actionBtnText, styles.logoutText]}>Secure Logout</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.versionText}>ISoP App v1.0.4 - Premium Intelligence Edition</Text>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.layout.background,
  },
  scrollContent: {
    padding: spacing.xl,
    paddingBottom: spacing.xxl,
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: spacing.xxl,
  },
  avatarWrapper: {
    position: 'relative',
    marginBottom: spacing.md,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.layout.surface,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: colors.brand.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    borderWidth: 2,
    borderColor: 'white',
  },
  avatarText: {
    fontSize: 40,
    fontWeight: '800',
    color: colors.brand.primary,
  },
  roleBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: colors.brand.primary,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: 'white',
  },
  roleText: {
    fontSize: 9,
    fontWeight: '800',
    color: 'white',
    letterSpacing: 1,
  },
  name: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.text.primary,
    fontFamily: typography.fontFamily,
  },
  membershipDate: {
    fontSize: 12,
    color: colors.text.tertiary,
    marginTop: 4,
  },
  infoCard: {
    backgroundColor: colors.layout.surface,
    borderRadius: radius.xl,
    padding: spacing.md,
    marginBottom: spacing.xl,
    borderWidth: 1,
    borderColor: colors.layout.divider,
  },
  profileItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.03)',
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  itemContent: {
    flex: 1,
  },
  itemLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.text.tertiary,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  itemValue: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text.primary,
    marginTop: 2,
  },
  actionsBox: {
    gap: spacing.sm,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.layout.surface,
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.layout.divider,
  },
  actionBtnText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '700',
    color: colors.text.secondary,
    marginLeft: 12,
  },
  logoutBtn: {
    marginTop: spacing.md,
    borderColor: 'rgba(239, 68, 68, 0.1)',
    backgroundColor: 'rgba(239, 68, 68, 0.03)',
  },
  logoutText: {
    color: '#EF4444',
  },
  versionText: {
    textAlign: 'center',
    fontSize: 10,
    color: colors.text.tertiary,
    marginTop: 40,
    fontFamily: typography.fontFamily,
    letterSpacing: 0.5,
  },
});

export default ProfileScreen;
