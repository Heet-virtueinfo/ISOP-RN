import React, { useEffect, useState, useMemo } from 'react';
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
import { colors, spacing, typography, radius } from '../../theme';
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  doc,
  FirebaseFirestoreTypes,
} from '@react-native-firebase/firestore';
import { firebaseFirestore } from '../../config/firebase';
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
    {/* Avatar + Name row */}
    <View style={cardStyles.topRow}>
      <View style={cardStyles.avatarWrap}>
        {member.profileImage ? (
          <Image
            source={{ uri: member.profileImage }}
            style={cardStyles.avatar}
          />
        ) : (
          <View style={[cardStyles.avatar, cardStyles.initialsAvatar]}>
            <Text style={cardStyles.initialsText}>
              {getInitials(member.displayName)}
            </Text>
          </View>
        )}
      </View>

      <View style={cardStyles.nameBlock}>
        <Text style={cardStyles.name} numberOfLines={1}>
          {member.displayName}
        </Text>
        <View style={cardStyles.infoRow}>
          <Mail size={11} color={colors.text.tertiary} />
          <Text style={cardStyles.infoText} numberOfLines={1}>
            {member.email}
          </Text>
        </View>
        {!!member.phoneNumber && (
          <View style={cardStyles.infoRow}>
            <Phone size={11} color={colors.text.tertiary} />
            <Text style={cardStyles.infoText}>{member.phoneNumber}</Text>
          </View>
        )}
      </View>

      {/* Event count badge */}
      <View style={cardStyles.countBadge}>
        <Text style={cardStyles.countNum}>{member.events.length}</Text>
        <Text style={cardStyles.countLabel}>
          {member.events.length === 1 ? 'event' : 'events'}
        </Text>
      </View>
    </View>

    {/* Events chip list */}
    <View style={cardStyles.eventsWrap}>
      {member.events.map(ev => (
        <View key={ev.eventId} style={cardStyles.eventChip}>
          <Calendar
            size={10}
            color={colors.brand.primary}
            style={{ marginRight: 4 }}
          />
          <Text style={cardStyles.eventChipText} numberOfLines={1}>
            {eventsMap[ev.eventId]?.title || 'Unknown Event'}
          </Text>
        </View>
      ))}
    </View>
  </View>
);

const cardStyles = StyleSheet.create({
  container: {
    backgroundColor: colors.layout.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.layout.divider,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 6,
      },
      android: { elevation: 2 },
    }),
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  avatarWrap: { marginRight: spacing.md },
  avatar: { width: 50, height: 50, borderRadius: 25 },
  initialsAvatar: {
    backgroundColor: 'rgba(79, 70, 229, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  initialsText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.brand.primary,
    fontFamily: typography.fontFamily,
  },
  nameBlock: { flex: 1, gap: 3 },
  name: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text.primary,
    fontFamily: typography.fontFamily,
  },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  infoText: {
    fontSize: 12,
    color: colors.text.tertiary,
    fontFamily: typography.fontFamily,
    flexShrink: 1,
  },
  countBadge: {
    backgroundColor: 'rgba(79,70,229,0.08)',
    borderRadius: radius.md,
    paddingHorizontal: 10,
    paddingVertical: 6,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(79,70,229,0.12)',
    marginLeft: spacing.sm,
  },
  countNum: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.brand.primary,
    fontFamily: typography.fontFamily,
  },
  countLabel: {
    fontSize: 9,
    fontWeight: '600',
    color: colors.brand.primary,
    fontFamily: typography.fontFamily,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  eventsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  eventChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(79,70,229,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(79,70,229,0.15)',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
    maxWidth: '90%',
  },
  eventChipText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.brand.primary,
    fontFamily: typography.fontFamily,
  },
});

const MembersScreen = () => {
  const insets = useSafeAreaInsets();

  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [userProfiles, setUserProfiles] = useState<Record<string, UserProfile>>(
    {},
  );
  const [eventsMap, setEventsMap] = useState<Record<string, AppEvent>>({});
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [selectedEvent, setSelectedEvent] = useState<string | null>(null);

  useEffect(() => {
    const q = query(
      collection(firebaseFirestore, COLLECTIONS.ENROLLMENTS),
      orderBy('enrolledAt', 'desc'),
    );
    const unsub = onSnapshot(
      q,
      snap => {
        const data = snap.docs.map(
          (d: FirebaseFirestoreTypes.QueryDocumentSnapshot) =>
            d.data() as Enrollment,
        );
        setEnrollments(data);
        setLoading(false);
      },
      err => {
        console.error('MembersScreen enrollments error:', err);
        setLoading(false);
      },
    );
    return () => unsub();
  }, []);

  useEffect(() => {
    const unsub = onSnapshot(
      collection(firebaseFirestore, COLLECTIONS.EVENTS),
      snap => {
        const map: Record<string, AppEvent> = {};
        snap.docs.forEach((d: FirebaseFirestoreTypes.QueryDocumentSnapshot) => {
          const event = d.data() as AppEvent;
          map[event.id] = event;
        });
        setEventsMap(map);
      },
      err => console.error('MembersScreen events error:', err),
    );
    return () => unsub();
  }, []);

  useEffect(() => {
    const uniqueUids = [...new Set(enrollments.map(e => e.uid))];
    if (uniqueUids.length === 0) return;

    const unsubscribers: (() => void)[] = [];

    uniqueUids.forEach(uid => {
      const unsub = onSnapshot(
        doc(firebaseFirestore, COLLECTIONS.USERS, uid),
        snapshot => {
          if (snapshot.exists()) {
            setUserProfiles(prev => ({
              ...prev,
              [uid]: snapshot.data() as UserProfile,
            }));
          }
        },
        err => console.error('Profile fetch error:', err),
      );
      unsubscribers.push(unsub);
    });

    return () => unsubscribers.forEach(u => u());
  }, [enrollments.map(e => e.uid).join(',')]);

  const members = useMemo<MemberEntry[]>(() => {
    const map = new Map<string, MemberEntry>();

    enrollments.forEach(en => {
      if (!map.has(en.uid)) {
        const profile = userProfiles[en.uid];
        map.set(en.uid, {
          uid: en.uid,
          displayName: profile?.displayName || en.displayName,
          email: profile?.email || en.email,
          profileImage: profile?.profileImage ?? en.profileImage ?? null,
          phoneNumber: profile?.phoneNumber,
          events: [],
        });
      }
      const entry = map.get(en.uid)!;
      if (!entry.events.some(e => e.eventId === en.eventId)) {
        entry.events.push({
          eventId: en.eventId,
          enrolledAt: en.enrolledAt,
        });
      }
    });

    return Array.from(map.values()).sort((a, b) =>
      a.displayName.localeCompare(b.displayName),
    );
  }, [enrollments, userProfiles]);

  const eventTitles = useMemo<string[]>(() => {
    const set = new Set<string>();
    enrollments.forEach(e => {
      const title = eventsMap[e.eventId]?.title;
      if (title) set.add(title);
    });
    return Array.from(set).sort();
  }, [enrollments, eventsMap]);

  const filteredMembers = useMemo(() => {
    let list = members;

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
  }, [members, search, selectedEvent]);

  return (
    <View style={styles.root}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.headerTitle}>Members</Text>
            <Text style={styles.headerSub}>
              {loading
                ? 'Loading…'
                : `${members.length} registered member${
                    members.length !== 1 ? 's' : ''
                  }`}
            </Text>
          </View>
          <View style={styles.headerBadge}>
            <Users size={18} color={colors.brand.primary} />
            <Text style={styles.headerBadgeText}>{members.length}</Text>
          </View>
        </View>

        {/* Search bar */}
        <View style={styles.searchBar}>
          <Search size={16} color={colors.text.tertiary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by name, email or phone…"
            placeholderTextColor={colors.text.tertiary}
            value={search}
            onChangeText={setSearch}
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="search"
          />
          {search.length > 0 && (
            <TouchableOpacity
              onPress={() => setSearch('')}
              hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}
            >
              <X size={15} color={colors.text.tertiary} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {eventTitles.length > 0 && (
        <View style={styles.filterSection}>
          <View style={styles.filterLabelRow}>
            <Filter size={12} color={colors.text.tertiary} />
            <Text style={styles.filterLabel}>Filter by Event</Text>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterRow}
          >
            {/* "All" chip */}
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
                All
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
                  numberOfLines={1}
                >
                  {title}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {loading ? (
        <CustomLoader
          message="Loading members…"
          overlay={false}
          style={{ flex: 1 }}
        />
      ) : (
        <FlatList
          data={filteredMembers}
          keyExtractor={item => item.uid}
          renderItem={({ item }) => (
            <MemberCard member={item} eventsMap={eventsMap} />
          )}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Users size={48} color={colors.text.tertiary} />
              <Text style={styles.emptyTitle}>
                {search || selectedEvent
                  ? 'No results found'
                  : 'No members yet'}
              </Text>
              <Text style={styles.emptyText}>
                {search || selectedEvent
                  ? 'Try adjusting your search or filter.'
                  : 'Members who join events will appear here.'}
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.layout.background,
  },
  header: {
    backgroundColor: colors.layout.surface,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm, // Compact but balanced top padding
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.layout.divider,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  headerTitle: {
    fontFamily: typography.fontFamily,
    fontSize: 24,
    fontWeight: '800',
    color: colors.text.primary,
    letterSpacing: -0.5,
  },
  headerSub: {
    fontFamily: typography.fontFamily,
    fontSize: 13,
    color: colors.text.tertiary,
    marginTop: 2,
  },
  headerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(79,70,229,0.08)',
    borderRadius: radius.md,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: 'rgba(79,70,229,0.15)',
  },
  headerBadgeText: {
    fontFamily: typography.fontFamily,
    fontSize: 18,
    fontWeight: '800',
    color: colors.brand.primary,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.layout.background,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.ui.inputBorder,
    paddingHorizontal: spacing.md,
    paddingVertical: Platform.OS === 'ios' ? 10 : 6,
    gap: spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontFamily: typography.fontFamily,
    fontSize: 14,
    color: colors.text.primary,
    padding: 0,
    margin: 0,
  },
  filterSection: {
    backgroundColor: colors.layout.surface,
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.layout.divider,
  },
  filterLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing.md,
    marginBottom: 6,
  },
  filterLabel: {
    fontFamily: typography.fontFamily,
    fontSize: 11,
    fontWeight: '600',
    color: colors.text.tertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  filterRow: {
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },
  filterChip: {
    backgroundColor: colors.layout.background,
    borderWidth: 1,
    borderColor: colors.ui.inputBorder,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 6,
    maxWidth: 200,
  },
  filterChipActive: {
    backgroundColor: colors.brand.primary,
    borderColor: colors.brand.primary,
  },
  filterChipText: {
    fontFamily: typography.fontFamily,
    fontSize: 12,
    fontWeight: '600',
    color: colors.text.secondary,
  },
  filterChipTextActive: {
    color: '#FFFFFF',
  },
  listContent: {
    padding: spacing.md,
    paddingBottom: spacing.xxl,
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
    paddingHorizontal: spacing.xl,
  },
  emptyTitle: {
    fontFamily: typography.fontFamily,
    fontSize: 17,
    fontWeight: '700',
    color: colors.text.primary,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontFamily: typography.fontFamily,
    fontSize: 14,
    color: colors.text.tertiary,
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default MembersScreen;
