import React, { useEffect, useState, useMemo } from 'react';
import { getImageSource } from '../../utils/imageHelpers';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  Platform,
} from 'react-native';
import {
  Search,
  X,
  Filter,
  Users,
  Mail,
  Phone,
  Calendar,
} from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { colors, spacing, typography, radius } from '../../theme';
import MemberDetailModal from '../../components/modals/MemberDetailModal';
import UserHeader from '../../components/UserHeader';
import {
  adminGetUsers,
  adminGetEvents,
} from '../../services/admin';
import { COLLECTIONS } from '../../constants/collections';
import { Enrollment, UserProfile, AppEvent } from '../../types';
import CustomLoader from '../../components/CustomLoader';

interface MemberEntry {
  uid: string;
  displayName: string;
  email: string;
  profileImage?: string | null;
  phoneNumber?: string;
  events: { eventId: string; enrolledAt: any }[];
}

const getInitials = (name: string) =>
  name
    .split(' ')
    .filter(Boolean)
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);

const MemberCard = ({
  member,
  eventsMap,
}: {
  member: MemberEntry;
  eventsMap: Record<string, AppEvent>;
}) => (
  <View style={cardStyles.container}>
    <View style={cardStyles.headerRow}>
      <View style={cardStyles.avatarContainer}>
        {member.profileImage ? (
          <Image
            source={getImageSource(member.profileImage)}
            style={cardStyles.avatar}
          />
        ) : (
          <View style={[cardStyles.avatar, cardStyles.initialsAvatar]}>
            <Text style={cardStyles.initialsText}>
              {getInitials(member.displayName)}
            </Text>
          </View>
        )}
        <View style={cardStyles.onlineIndicator} />
      </View>

      <View style={cardStyles.profileBasic}>
        <Text style={cardStyles.name} numberOfLines={1}>
          {member.displayName}
        </Text>
        <Text style={cardStyles.email} numberOfLines={1}>
          {member.email}
        </Text>
      </View>

      <View style={cardStyles.badgeContainer}>
        <View style={cardStyles.countPill}>
          <Text style={cardStyles.countNum}>{member.events.length}</Text>
          <Text style={cardStyles.countLabel}>INTEL</Text>
        </View>
      </View>
    </View>

    <View style={cardStyles.divider} />

    <View style={cardStyles.participationRow}>
      <View style={cardStyles.metaItem}>
        <Mail size={12} color={colors.text.tertiary} />
        <Text style={cardStyles.metaText}>Verified Associate</Text>
      </View>
      <View style={cardStyles.eventPreview}>
        {member.events.slice(0, 2).map((ev, idx) => (
          <View
            key={ev.eventId}
            style={[
              cardStyles.eventDot,
              {
                backgroundColor:
                  idx === 0 ? colors.brand.primary : colors.brand.secondary,
              },
            ]}
          />
        ))}
        {member.events.length > 2 && (
          <Text style={cardStyles.moreText}>+{member.events.length - 2}</Text>
        )}
      </View>
    </View>
  </View>
);

const cardStyles = StyleSheet.create({
  container: {
    backgroundColor: colors.layout.surface,
    borderRadius: 24,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(226, 232, 240, 0.8)',
    ...Platform.select({
      ios: {
        shadowColor: colors.brand.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.04,
        shadowRadius: 10,
      },
      android: { elevation: 3 },
    }),
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
    marginRight: spacing.md,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: colors.palette.slate.bg,
  },
  initialsAvatar: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.brand.primary + '10',
    borderWidth: 1,
    borderColor: colors.brand.primary + '20',
  },
  initialsText: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.brand.primary,
    fontFamily: typography.fontFamily,
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: colors.status.success,
    borderWidth: 3,
    borderColor: colors.layout.surface,
  },
  profileBasic: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.text.primary,
    fontFamily: typography.fontFamily,
    letterSpacing: -0.5,
  },
  email: {
    fontSize: 12,
    color: colors.text.tertiary,
    fontFamily: typography.fontFamily,
    marginTop: 2,
  },
  badgeContainer: {
    marginLeft: spacing.sm,
  },
  countPill: {
    backgroundColor: 'rgba(79, 70, 229, 0.05)',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 6,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(79, 70, 229, 0.1)',
  },
  countNum: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.brand.primary,
    fontFamily: typography.fontFamily,
    lineHeight: 16,
  },
  countLabel: {
    fontSize: 7,
    fontWeight: '900',
    color: colors.brand.primary,
    fontFamily: typography.fontFamily,
    letterSpacing: 1,
  },
  divider: {
    height: 1,
    backgroundColor: colors.layout.divider,
    marginVertical: spacing.md,
    opacity: 0.5,
  },
  participationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.text.tertiary,
    fontFamily: typography.fontFamily,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  eventPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  eventDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  moreText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.text.tertiary,
    marginLeft: 2,
  },
});

const MembersScreen = () => {
  const insets = useSafeAreaInsets();

  const [membersList, setMembersList] = useState<MemberEntry[]>([]);
  const [eventsMap, setEventsMap] = useState<Record<string, AppEvent>>({});
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [selectedEvent, setSelectedEvent] = useState<string | null>(null);

  // Modal State
  const [selectedMember, setSelectedMember] = useState<MemberEntry | null>(
    null,
  );
  const [isModalVisible, setIsModalVisible] = useState(false);

  const handleMemberPress = (member: MemberEntry) => {
    setSelectedMember(member);
    setIsModalVisible(true);
  };

  useFocusEffect(
    React.useCallback(() => {
      let mounted = true;

      const loadData = async () => {
        try {
          const [users, events] = await Promise.all([
            adminGetUsers(),
            adminGetEvents(),
          ]);

          const evMap: Record<string, AppEvent> = {};
          events.forEach(e => {
            evMap[e.id] = e;
          });
          if (mounted) setEventsMap(evMap);

          const finalMembers: MemberEntry[] = users.map(u => ({
            uid: u.uid,
            displayName: u.displayName || 'Unknown Executive',
            email: u.email || 'No Email',
            profileImage: u.profileImage,
            phoneNumber: u.phoneNumber,
            events: (u.joinedEventIds || []).map(eventId => ({
              eventId,
              enrolledAt: new Date().toISOString(), // Fallback since specific date isn't in user object
            })),
          })).sort((a, b) => a.displayName.localeCompare(b.displayName));

          if (mounted) {
            setMembersList(finalMembers);
            setLoading(false);
          }
        } catch (err) {
          console.error('Members load failed', err);
          if (mounted) setLoading(false);
        }
      };

      loadData();

      return () => {
        mounted = false;
      };
    }, [])
  );

  const eventTitles = useMemo<string[]>(() => {
    const set = new Set<string>();
    membersList.forEach(m => {
      m.events.forEach(e => {
        const title = eventsMap[e.eventId]?.title;
        if (title) set.add(title);
      });
    });
    return Array.from(set).sort();
  }, [membersList, eventsMap]);

  const filteredMembers = useMemo(() => {
    let list = membersList;

    if (selectedEvent) {
      list = list.filter(m =>
        m.events.some(e => eventsMap[e.eventId]?.title === selectedEvent),
      );
    }

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(
        m =>
          m.displayName.toLowerCase().includes(q) ||
          m.email.toLowerCase().includes(q) ||
          (m.phoneNumber && m.phoneNumber.toLowerCase().includes(q)),
      );
    }

    return list;
  }, [membersList, search, selectedEvent]);

  return (
    <View style={styles.root}>
      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        {/* Talent Pool Dashboard */}
        <View style={styles.dashboardContainer}>
          <View style={styles.dashCardMain}>
            <View style={styles.dashIconBox}>
              <Users size={24} color={colors.brand.primary} />
            </View>
            <View>
              <Text style={styles.dashValue}>{membersList.length}</Text>
              <Text style={styles.dashLabel}>ACTIVE EXECUTIVES</Text>
            </View>
          </View>
        </View>

        <View style={styles.searchSection}>
          <View style={styles.searchBar}>
            <Search size={18} color={colors.brand.primary} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search executive database..."
              placeholderTextColor={colors.text.tertiary}
              value={search}
              onChangeText={setSearch}
              autoCapitalize="none"
              autoCorrect={false}
            />
            {search.length > 0 && (
              <TouchableOpacity onPress={() => setSearch('')}>
                <X size={16} color={colors.text.tertiary} />
              </TouchableOpacity>
            )}
          </View>

          {eventTitles.length > 0 && (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.filterRow}
              style={styles.filterScroll}
            >
              <TouchableOpacity
                style={[
                  styles.filterChip,
                  !selectedEvent && styles.filterChipActive,
                ]}
                onPress={() => setSelectedEvent(null)}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    !selectedEvent && styles.filterChipTextActive,
                  ]}
                >
                  All Assets
                </Text>
              </TouchableOpacity>

              {eventTitles.map(title => (
                <TouchableOpacity
                  key={title}
                  style={[
                    styles.filterChip,
                    selectedEvent === title && styles.filterChipActive,
                  ]}
                  onPress={() =>
                    setSelectedEvent(prev => (prev === title ? null : title))
                  }
                >
                  <Text
                    style={[
                      styles.filterChipText,
                      selectedEvent === title && styles.filterChipTextActive,
                    ]}
                  >
                    {title}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </View>

        {loading ? (
          <CustomLoader
            message="Analyzing executive profiles..."
            overlay={false}
            style={{ marginTop: 40 }}
          />
        ) : (
          <View style={styles.listContent}>
            {filteredMembers.map(item => (
              <TouchableOpacity
                key={item.uid}
                activeOpacity={0.7}
                onPress={() => handleMemberPress(item)}
              >
                <MemberCard member={item} eventsMap={eventsMap} />
              </TouchableOpacity>
            ))}

            {filteredMembers.length === 0 && (
              <View style={styles.empty}>
                <Users size={48} color={colors.text.tertiary + '40'} />
                <Text style={styles.emptyTitle}>
                  {search || selectedEvent ? 'No Matches Found' : 'Pool Empty'}
                </Text>
                <Text style={styles.emptyText}>
                  {search || selectedEvent
                    ? 'Adjust your parameters to broaden the search.'
                    : 'Awaiting first executive enrollment.'}
                </Text>
              </View>
            )}
          </View>
        )}
      </ScrollView>

      <MemberDetailModal
        visible={isModalVisible}
        onClose={() => {
          setIsModalVisible(false);
          setSelectedMember(null);
        }}
        member={selectedMember}
        eventsMap={eventsMap}
        onDeleteSuccess={uid => {
          setMembersList(prev => prev.filter(m => m.uid !== uid));
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.layout.background,
  },
  dashboardContainer: {
    padding: spacing.md,
    gap: spacing.md,
  },
  dashCardMain: {
    backgroundColor: 'white',
    borderRadius: 24,
    padding: spacing.xl,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(226, 232, 240, 0.8)',
    ...Platform.select({
      ios: {
        shadowColor: colors.brand.primary,
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.05,
        shadowRadius: 15,
      },
      android: { elevation: 4 },
    }),
  },
  dashIconBox: {
    width: 56,
    height: 56,
    borderRadius: 18,
    backgroundColor: colors.brand.primary + '10',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dashValue: {
    fontSize: 32,
    fontWeight: '900',
    color: colors.text.primary,
    letterSpacing: -1,
  },
  dashLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.text.tertiary,
    letterSpacing: 1,
    marginTop: 2,
  },
  searchSection: {
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 16,
    paddingHorizontal: spacing.md,
    paddingVertical: Platform.OS === 'ios' ? 12 : 8,
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: 'rgba(226, 232, 240, 0.8)',
  },
  searchInput: {
    flex: 1,
    fontFamily: typography.fontFamily,
    fontSize: 14,
    color: colors.text.primary,
  },
  filterScroll: {
    marginTop: spacing.sm,
  },
  filterRow: {
    gap: spacing.sm,
    paddingRight: 40,
  },
  filterChip: {
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(226, 232, 240, 0.8)',
  },
  filterChipActive: {
    backgroundColor: colors.brand.primary,
    borderColor: colors.brand.primary,
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.text.tertiary,
    fontFamily: typography.fontFamily,
  },
  filterChipTextActive: {
    color: 'white',
  },
  listContent: {
    padding: spacing.md,
    paddingBottom: spacing.xxl * 2,
  },
  empty: {
    alignItems: 'center',
    paddingTop: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.text.primary,
    marginTop: spacing.md,
  },
  emptyText: {
    fontSize: 14,
    color: colors.text.tertiary,
    textAlign: 'center',
    marginTop: 4,
    paddingHorizontal: 40,
  },
});

export default MembersScreen;
