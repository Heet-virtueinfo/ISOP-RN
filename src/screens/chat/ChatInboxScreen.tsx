import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  Platform,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { colors, spacing, typography, radius } from '../../theme';
import { useAuth } from '../../contexts/AuthContext';
import { Chat } from '../../types';
import CustomLoader from '../../components/CustomLoader';
import UserHeader from '../../components/UserHeader';
import { getMyChats } from '../../services/chatService';
import { MessageSquareOff } from 'lucide-react-native';

const ChatInboxScreen = () => {
  const navigation = useNavigation<any>();
  const { user } = useAuth();
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      if (!user) return;
      let isMounted = true;

      const fetchChats = async () => {
        try {
          const data = await getMyChats();
          console.log('Data of fetchChats:', data);
          if (isMounted) {
            const uniqueChats = data.filter((item, index, self) => {
              const getOtherUid = (chat: Chat) =>
                chat.participants.find(id => id !== user?.uid);
              return (
                index ===
                self.findIndex(t => getOtherUid(t) === getOtherUid(item))
              );
            });
            setChats(uniqueChats);
            setLoading(false);
          }
        } catch (error) {
          if (isMounted) setLoading(false);
        }
      };

      fetchChats();
      const interval = setInterval(fetchChats, 15000); // 15s

      return () => {
        isMounted = false;
        clearInterval(interval);
      };
    }, [user])
  );

  const getOtherParticipant = (chat: Chat) => {
    const otherId = chat.participants.find(id => id !== user?.uid);
    return {
      name: chat.participantNames[otherId!] || 'Unknown',
      image: chat.participantImages[otherId!],
    };
  };

  const renderChatItem = ({ item }: { item: Chat }) => {
    const other = getOtherParticipant(item);
    return (
      <TouchableOpacity
        style={styles.chatItem}
        onPress={() =>
          navigation.navigate('Chat', {
            chatId: item.id,
            otherUserName: other.name,
            otherUserImage: other.image,
          })
        }
      >
        <View style={styles.avatarContainer}>
          {other.image ? (
            <Image source={{ uri: other.image }} style={styles.avatar} />
          ) : (
            <View style={styles.initialsAvatarSmall}>
              <Text style={styles.initialsTextSmall}>{other.name[0]}</Text>
            </View>
          )}
        </View>
        <View style={styles.chatContent}>
          <View style={styles.chatHeader}>
            <Text style={styles.chatName}>{other.name}</Text>
            <Text style={styles.chatTime}>
              {item.lastMessageAt
                ? new Date(item.lastMessageAt).toLocaleDateString()
                : ''}
            </Text>
          </View>
          <Text style={styles.lastMessage} numberOfLines={1}>
            {item.lastMessage || 'Start a conversation...'}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmpty = () => {
    if (loading) return null;
    return (
      <View style={styles.emptyContainer}>
        <View style={styles.emptyIconBox}>
          <MessageSquareOff size={40} color={colors.text.tertiary} />
        </View>
        <Text style={styles.emptyTitle}>No Messages Yet</Text>
        <Text style={styles.emptyText}>
          Networking with event participants to start chatting.
        </Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <UserHeader title="Chats" />

      {loading ? (
        <CustomLoader
          message="Syncing Conversations..."
          overlay={false}
          style={{ flex: 1 }}
        />
      ) : (
        <FlatList
          data={chats}
          keyExtractor={item => item.id}
          renderItem={renderChatItem}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={renderEmpty}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.layout.background,
  },
  listContent: {
    padding: spacing.md,
    paddingBottom: spacing.xxl,
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: colors.layout.surface,
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.ui.inputBorderLight,
  },
  tab: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    marginRight: spacing.md,
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: colors.brand.primary,
  },
  tabText: {
    fontFamily: typography.fontFamily,
    fontSize: 15,
    fontWeight: '700',
    color: colors.text.tertiary,
  },
  activeTabText: {
    color: colors.brand.primary,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.brand.primary,
    marginLeft: 6,
  },
  countBadge: {
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 6,
    paddingHorizontal: 4,
  },
  countText: {
    fontSize: 10,
    fontWeight: '900',
    color: 'white',
  },
  subTabs: {
    flexDirection: 'row',
    padding: spacing.md,
    gap: 8,
  },
  subTab: {
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 100,
    backgroundColor: colors.palette.slate.bg,
    borderWidth: 1,
    borderColor: colors.ui.inputBorderLight,
  },
  activeSubTab: {
    backgroundColor: colors.brand.primary,
    borderColor: colors.brand.primary,
  },
  subTabText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.text.tertiary,
  },
  activeSubTabText: {
    color: 'white',
  },
  chatItem: {
    flexDirection: 'row',
    padding: spacing.md,
    backgroundColor: colors.layout.surface,
    borderRadius: radius.lg,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.ui.inputBorderLight,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  avatarContainer: {
    marginRight: 12,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
  },
  initialsAvatarSmall: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.palette.indigo.bg,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(79, 70, 229, 0.1)',
  },
  initialsTextSmall: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.palette.indigo.accent,
  },
  chatContent: {
    flex: 1,
    justifyContent: 'center',
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  chatName: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text.primary,
    fontFamily: typography.fontFamily,
  },
  chatTime: {
    fontSize: 11,
    color: colors.text.tertiary,
    fontFamily: typography.fontFamily,
  },
  lastMessage: {
    fontSize: 13,
    color: colors.text.tertiary,
    fontFamily: typography.fontFamily,
  },
  requestItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.layout.surface,
    padding: spacing.md,
    borderRadius: radius.lg,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.ui.inputBorderLight,
  },
  requestInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatarPlaceholder: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.palette.indigo.bg,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarInitial: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.palette.indigo.accent,
  },
  requestContent: {
    flex: 1,
  },
  requestName: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text.primary,
  },
  requestEvent: {
    fontSize: 12,
    color: colors.text.tertiary,
    marginTop: 2,
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
  },
  actionBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
  },
  declineBtn: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
  },
  acceptBtn: {
    backgroundColor: colors.status.success,
  },
  sentStatusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: colors.palette.slate.bg,
    borderWidth: 1,
    borderColor: colors.ui.inputBorderLight,
  },
  sentStatusText: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.text.tertiary,
  },
  emptyContainer: {
    marginTop: 80,
    alignItems: 'center',
    padding: spacing.xl,
  },
  emptyIconBox: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.palette.slate.bg,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.ui.inputBorderLight,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.text.primary,
    fontFamily: typography.fontFamily,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: colors.text.tertiary,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 30,
  },
});

export default ChatInboxScreen;
