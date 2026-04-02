import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, SafeAreaView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ChevronLeft, UserPlus, Check, X, Send } from 'lucide-react-native';
import { colors, spacing, typography, radius } from '../../theme';
import { useAuth } from '../../contexts/AuthContext';
import { getIncomingRequests, getSentRequests, acceptChatRequest, declineChatRequest } from '../../services/chatService';
import { ChatRequest } from '../../types';
import CustomLoader from '../../components/CustomLoader';
import Toast from 'react-native-toast-message';

const ChatRequestsScreen = () => {
  const navigation = useNavigation<any>();
  const { user } = useAuth();
  const [incoming, setIncoming] = useState<ChatRequest[]>([]);
  const [sent, setSent] = useState<ChatRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'incoming' | 'sent'>('incoming');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (!user) return;

    const unsubscribeIncoming = getIncomingRequests(user.uid, (data) => {
      setIncoming(data);
      if (activeTab === 'incoming') setLoading(false);
    });

    const unsubscribeSent = getSentRequests(user.uid, (data) => {
      setSent(data);
      if (activeTab === 'sent') setLoading(false);
    });

    return () => {
      unsubscribeIncoming();
      unsubscribeSent();
    };
  }, [user, activeTab]);

  const handleAccept = async (request: ChatRequest) => {
    setActionLoading(true);
    try {
      await acceptChatRequest(request);
      Toast.show({ type: 'success', text1: 'Request Accepted', text2: `You can now chat with ${request.fromName}` });
      navigation.navigate('Chat', { 
        chatId: request.id, 
        otherUserName: request.fromName,
        otherUserImage: request.fromImage 
      });
    } catch (error) {
      Toast.show({ type: 'error', text1: 'Action Failed' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleDecline = async (requestId: string) => {
    try {
      await declineChatRequest(requestId);
      Toast.show({ type: 'success', text1: 'Request Declined' });
    } catch (error) {
      Toast.show({ type: 'error', text1: 'Action Failed' });
    }
  };

  const renderRequestItem = ({ item }: { item: ChatRequest }) => {
    const isIncoming = activeTab === 'incoming';
    const name = isIncoming ? item.fromName : item.toName;
    
    return (
      <View style={styles.requestItem}>
        <View style={styles.requestInfo}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{name[0]}</Text>
          </View>
          <View style={styles.content}>
            <Text style={styles.name}>{name}</Text>
            <Text style={styles.eventTitle} numberOfLines={1}>{item.eventTitle}</Text>
          </View>
        </View>

        {isIncoming ? (
          <View style={styles.actions}>
            <TouchableOpacity 
                style={[styles.actionBtn, styles.declineBtn]} 
                onPress={() => handleDecline(item.id)}
            >
              <X size={20} color="#EF4444" />
            </TouchableOpacity>
            <TouchableOpacity 
                style={[styles.actionBtn, styles.acceptBtn]} 
                onPress={() => handleAccept(item)}
            >
              <Check size={20} color="white" />
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.sentBadge}>
            <Text style={styles.sentBadgeText}>{item.status.toUpperCase()}</Text>
          </View>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <ChevronLeft size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Network Requests</Text>
      </View>

      <View style={styles.tabs}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'incoming' && styles.activeTab]}
          onPress={() => setActiveTab('incoming')}
        >
          <Text style={[styles.tabText, activeTab === 'incoming' && styles.activeTabText]}>
            Incoming ({incoming.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'sent' && styles.activeTab]}
          onPress={() => setActiveTab('sent')}
        >
          <Text style={[styles.tabText, activeTab === 'sent' && styles.activeTabText]}>
            Sent ({sent.length})
          </Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <CustomLoader message="Syncing Requests..." overlay={false} style={{ flex: 1 }} />
      ) : (
        <FlatList
          data={activeTab === 'incoming' ? incoming : sent}
          keyExtractor={(item) => item.id}
          renderItem={renderRequestItem}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <UserPlus size={40} color={colors.text.tertiary} />
              <Text style={styles.emptyTitle}>No {activeTab} Requests</Text>
            </View>
          }
        />
      )}
      {actionLoading && <CustomLoader overlay message="Initiating Connection..." />}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.layout.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.layout.divider,
  },
  backBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.text.primary,
    fontFamily: typography.fontFamily,
    marginLeft: 12,
  },
  tabs: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    marginVertical: spacing.md,
    backgroundColor: colors.layout.surface,
    marginHorizontal: spacing.md,
    borderRadius: 12,
    paddingVertical: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: colors.brand.primary,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text.tertiary,
  },
  activeTabText: {
    color: 'white',
  },
  listContent: {
    padding: spacing.md,
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
    borderColor: colors.layout.divider,
  },
  requestInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(79, 70, 229, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.brand.primary,
  },
  content: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text.primary,
  },
  eventTitle: {
    fontSize: 12,
    color: colors.text.tertiary,
    marginTop: 2,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  declineBtn: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
  },
  acceptBtn: {
    backgroundColor: colors.status.success,
  },
  sentBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: 'rgba(107, 114, 128, 0.1)',
  },
  sentBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.text.tertiary,
  },
  emptyContainer: {
    marginTop: 100,
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text.tertiary,
    marginTop: 12,
  },
});

export default ChatRequestsScreen;
