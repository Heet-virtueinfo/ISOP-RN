import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { MessageCircle, BellRing, ChevronRight, MessageSquareOff } from 'lucide-react-native';
import { colors, spacing, typography, radius } from '../../theme';
import { useAuth } from '../../contexts/AuthContext';
import { getMyChats, getIncomingRequests } from '../../services/chatService';
import { Chat, ChatRequest } from '../../types';
import CustomLoader from '../../components/CustomLoader';
import AdminHeader from '../../components/AdminHeader';

const ChatInboxScreen = () => {
  const navigation = useNavigation<any>();
  const { user } = useAuth();
  const [chats, setChats] = useState<Chat[]>([]);
  const [incomingRequests, setIncomingRequests] = useState<ChatRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const unsubscribeChats = getMyChats(user.uid, (data) => {
      setChats(data);
      setLoading(false);
    });

    const unsubscribeRequests = getIncomingRequests(user.uid, (data) => {
      setIncomingRequests(data);
    });

    return () => {
      unsubscribeChats();
      unsubscribeRequests();
    };
  }, [user]);

  const renderRequestBanner = () => {
    if (incomingRequests.length === 0) return null;

    return (
      <TouchableOpacity 
        style={styles.requestBanner}
        onPress={() => navigation.navigate('ChatRequests')}
      >
        <View style={styles.bannerIcon}>
           <BellRing size={20} color="white" />
        </View>
        <View style={styles.bannerContent}>
          <Text style={styles.bannerTitle}>{incomingRequests.length} New Chat Request{incomingRequests.length > 1 ? 's' : ''}</Text>
          <Text style={styles.bannerSubtitle}>Open to see who wants to connect with you.</Text>
        </View>
        <ChevronRight size={18} color={colors.brand.primary} />
      </TouchableOpacity>
    );
  };

  const getOtherParticipant = (chat: Chat) => {
    const otherId = chat.participants.find(id => id !== user?.uid);
    return {
      name: chat.participantNames[otherId!] || 'Unknown',
      image: chat.participantImages[otherId!]
    };
  };

  const renderChatItem = ({ item }: { item: Chat }) => {
    const other = getOtherParticipant(item);
    return (
      <TouchableOpacity 
        style={styles.chatItem}
        onPress={() => navigation.navigate('Chat', { 
            chatId: item.id, 
            otherUserName: other.name,
            otherUserImage: other.image 
        })}
      >
        <View style={styles.avatarContainer}>
          {other.image ? (
            <Image source={{ uri: other.image }} style={styles.avatar} />
          ) : (
            <View style={styles.initialsAvatar}>
              <Text style={styles.initialsText}>{other.name[0]}</Text>
            </View>
          )}
        </View>
        <View style={styles.chatContent}>
          <View style={styles.chatHeader}>
            <Text style={styles.chatName}>{other.name}</Text>
            <Text style={styles.chatTime}>
              {item.lastMessageAt ? new Date(item.lastMessageAt?.toDate()).toLocaleDateString() : ''}
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
        <Text style={styles.emptyText}>Send chat requests to other participants to start networking.</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <AdminHeader title="Networking" />
      
      {loading ? (
        <CustomLoader message="Connecting to Global Inbox..." overlay={false} style={{ flex: 1 }} />
      ) : (
        <View style={{ flex: 1 }}>
          {renderRequestBanner()}
          <FlatList
            data={chats}
            keyExtractor={(item) => item.id}
            renderItem={renderChatItem}
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={renderEmpty}
            showsVerticalScrollIndicator={false}
          />
        </View>
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
    paddingBottom: spacing.xxl,
  },
  requestBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(79, 70, 229, 0.05)',
    margin: spacing.md,
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: 'rgba(79, 70, 229, 0.1)',
  },
  bannerIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: colors.brand.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  bannerContent: {
    flex: 1,
  },
  bannerTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.brand.primary,
    fontFamily: typography.fontFamily,
  },
  bannerSubtitle: {
    fontSize: 11,
    color: colors.text.tertiary,
    fontFamily: typography.fontFamily,
    marginTop: 2,
  },
  chatItem: {
    flexDirection: 'row',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.layout.divider,
  },
  avatarContainer: {
    marginRight: 12,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  initialsAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.layout.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.layout.divider,
  },
  initialsText: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.brand.primary,
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
  emptyContainer: {
    marginTop: 100,
    alignItems: 'center',
    padding: spacing.xl,
  },
  emptyIconBox: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.layout.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  emptyTitle: {
    fontSize: 20,
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
    paddingHorizontal: 40,
  },
});

export default ChatInboxScreen;
