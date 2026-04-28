import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Platform,
  Image,
  StatusBar,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { MessageSquare, UserPlus, Check, X } from 'lucide-react-native';
import { colors, spacing, typography } from '../../theme';
import { useAuth } from '../../contexts/AuthContext';
import {
  getIncomingRequests,
  getSentRequests,
  getAcceptedRequests,
  acceptChatRequest,
  declineChatRequest,
} from '../../services/chatService';
import { ChatRequest, UserProfile } from '../../types';
import CustomLoader from '../../components/CustomLoader';
import Toast from 'react-native-toast-message';
import UserHeader from '../../components/UserHeader';
import { apiService } from '../../services/apiService';
// Removed Firebase imports

const ChatRequestsScreen = () => {
  const navigation = useNavigation<any>();
  const { user } = useAuth();
  const [incoming, setIncoming] = useState<ChatRequest[]>([]);
  const [sent, setSent] = useState<ChatRequest[]>([]);
  const [accepted, setAccepted] = useState<ChatRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'incoming' | 'sent' | 'accepted'>(
    'incoming',
  );
  const [actionLoading, setActionLoading] = useState(false);
  useFocusEffect(
    useCallback(() => {
      if (!user) return;
      let isMounted = true;

      const loadData = async () => {
        try {
          const [incomingReqs, sentReqs, acceptedReqs] = await Promise.all([
            getIncomingRequests(),
            getSentRequests(),
            getAcceptedRequests(),
          ]);
          if (!isMounted) return;
          const uniqueIncoming = incomingReqs.filter(
            (item, index, self) =>
              index === self.findIndex(t => t.fromUid === item.fromUid),
          );
          const uniqueSent = sentReqs.filter(
            (item, index, self) =>
              index === self.findIndex(t => t.toUid === item.toUid),
          );
          const uniqueAccepted = acceptedReqs.filter((item, index, self) => {
            const getUid = (req: ChatRequest) =>
              req.fromUid === user.uid ? req.toUid : req.fromUid;
            return index === self.findIndex(t => getUid(t) === getUid(item));
          });

          setIncoming(uniqueIncoming);
          setSent(uniqueSent);
          setAccepted(uniqueAccepted);
          setLoading(false);
        } catch (error) {
          if (isMounted) setLoading(false);
        }
      };

      loadData();
      const interval = setInterval(loadData, 20000); // 20s for requests

      return () => {
        isMounted = false;
        clearInterval(interval);
      };
    }, [user])
  );

  const handleAccept = async (request: ChatRequest) => {
    setActionLoading(true);
    try {
      await acceptChatRequest(request);

      Toast.show({
        type: 'success',
        text1: 'Connection Established',
        text2: `Now chatting with ${request.fromName}`,
      });
      navigation.navigate('Chat', {
        chatId: request.id,
        otherUserName: request.fromName,
        otherUserImage: request.fromImage,
      });
    } catch (error) {
      Toast.show({ type: 'error', text1: 'Action Failed' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleDecline = async (request: ChatRequest) => {
    try {
      await declineChatRequest(request.id);

      Toast.show({ type: 'success', text1: 'Request Declined' });
    } catch (error) {
      Toast.show({ type: 'error', text1: 'Action Failed' });
    }
  };

  const renderRequestItem = ({ item }: { item: ChatRequest }) => {
    const isIncoming = activeTab === 'incoming';
    const isSent = activeTab === 'sent';
    const isAccepted = activeTab === 'accepted';
    const name = isIncoming
      ? item.fromName
      : isAccepted
        ? item.fromUid === user?.uid
          ? item.toName
          : item.fromName
        : item.toName;
    const image = isIncoming
      ? item.fromImage
      : isSent
        ? item.toImage
        : isAccepted
          ? item.fromUid === user?.uid
            ? item.toImage
            : item.fromImage
          : item.toImage;

    return (
      <View style={styles.cardWrapper}>
        <View style={styles.bentoCard}>
          <View style={styles.cardHeader}>
            <View style={styles.avatarWrapper}>
              {image ? (
                <Image source={{ uri: image }} style={styles.avatarImage} />
              ) : (
                <View style={styles.initialsAvatar}>
                  <Text style={styles.avatarText}>
                    {name && name.length > 0 ? name[0].toUpperCase() : '?'}
                  </Text>
                </View>
              )}
              <View style={styles.statusDot} />
            </View>

            <View style={styles.userInfo}>
              <Text style={styles.userName} numberOfLines={1}>
                {name || 'Member'}
              </Text>
              <Text style={styles.userRole}>
                {isSent ? 'Request Sent' : isIncoming ? 'Wants to Connect' : 'Connection Active'}
              </Text>
            </View>

            <View style={styles.cardActions}>
              {isIncoming ? (
                <View style={styles.dualActions}>
                  <TouchableOpacity
                    style={[styles.miniActionBtn, styles.declineBtn]}
                    onPress={() => handleDecline(item)}
                  >
                    <X size={16} color={colors.status.error} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.miniActionBtn, styles.acceptBtn]}
                    onPress={() => handleAccept(item)}
                  >
                    <Check size={16} color="white" />
                  </TouchableOpacity>
                </View>
              ) : isAccepted ? (
                <TouchableOpacity
                  style={styles.messagePrompt}
                  onPress={() =>
                    navigation.navigate('Chat', {
                      chatId: item.id,
                      otherUserName: name,
                      otherUserImage: image,
                    })
                  }
                >
                  <MessageSquare size={16} color="white" />
                </TouchableOpacity>
              ) : (
                <View style={styles.statusPill}>
                  <Text style={styles.statusPillText}>
                    {item.status.toUpperCase()}
                  </Text>
                </View>
              )}
            </View>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <UserHeader title="Networking" />

      {/* Modern Segmented Navigator */}
      <View style={styles.navContainer}>
        <View style={styles.segmentedControl}>
          <TouchableOpacity
            style={[
              styles.navTab,
              activeTab === 'incoming' && styles.navTabActive,
            ]}
            onPress={() => setActiveTab('incoming')}
          >
            <Text
              style={[
                styles.navTabText,
                activeTab === 'incoming' && styles.navTabTextActive,
              ]}
            >
              Incoming
            </Text>
            {incoming.length > 0 && (
              <View style={styles.countBadge}>
                <Text style={styles.countText}>{incoming.length}</Text>
              </View>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.navTab, activeTab === 'sent' && styles.navTabActive]}
            onPress={() => setActiveTab('sent')}
          >
            <Text
              style={[
                styles.navTabText,
                activeTab === 'sent' && styles.navTabTextActive,
              ]}
            >
              Sent
            </Text>
            {sent.length > 0 && (
              <View style={[styles.countBadge, styles.countBadgeMuted]}>
                <Text style={styles.countText}>{sent.length}</Text>
              </View>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.navTab,
              activeTab === 'accepted' && styles.navTabActive,
            ]}
            onPress={() => setActiveTab('accepted')}
          >
            <Text
              style={[
                styles.navTabText,
                activeTab === 'accepted' && styles.navTabTextActive,
              ]}
            >
              Accepted
            </Text>
            {accepted.length > 0 && (
              <View style={[styles.countBadge, styles.countBadgeSuccess]}>
                <Text style={styles.countText}>{accepted.length}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {loading ? (
        <CustomLoader
          message="Syncing Network..."
          overlay={false}
          style={{ flex: 1 }}
        />
      ) : (
        <FlatList
          data={
            activeTab === 'incoming'
              ? incoming
              : activeTab === 'sent'
                ? sent
                : accepted
          }
          keyExtractor={item => item.id}
          renderItem={renderRequestItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            !loading && !actionLoading ? (
              <View style={styles.emptyContainer}>
                <View style={styles.emptyIllustration}>
                  <View style={styles.illustrationCircle}>
                    <UserPlus size={32} color={colors.brand.primary} />
                  </View>
                  <View style={styles.illustrationRing} />
                </View>
                <Text style={styles.emptyTitle}>Expand Your Network</Text>
                <Text style={styles.emptyMessage}>
                  {activeTab === 'incoming'
                    ? 'No one has reached out yet. Why not start the conversation?'
                    : activeTab === 'sent'
                      ? 'Your sent requests will appear here. Start reaching out to peers!'
                      : 'Collaborations and established connections will sync here.'}
                </Text>
              </View>
            ) : null
          }
        />
      )}
      {actionLoading && (
        <CustomLoader overlay message="Updating Connection..." />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.layout.background,
  },
  navContainer: {
    backgroundColor: colors.layout.surface,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xs,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(241, 245, 249, 1)',
  },
  segmentedControl: {
    flexDirection: 'row',
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 6,
    borderWidth: 1,
    borderColor: 'rgba(241, 245, 249, 1)',
  },
  navTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 12,
    gap: 6,
  },
  navTabActive: {
    backgroundColor: 'white',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
      },
      android: { elevation: 2 },
    }),
  },
  navTabText: {
    fontFamily: typography.fontFamily,
    fontSize: 13,
    fontWeight: '700',
    color: colors.text.tertiary,
  },
  navTabTextActive: {
    color: colors.brand.primary,
  },
  countBadge: {
    backgroundColor: colors.brand.primary,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    minWidth: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  countBadgeMuted: {
    backgroundColor: colors.palette.slate.accent,
  },
  countBadgeSuccess: {
    backgroundColor: colors.status.success,
  },
  countText: {
    fontSize: 9,
    fontWeight: '900',
    color: 'white',
  },
  listContent: {
    padding: spacing.md,
    paddingBottom: 100,
  },
  cardWrapper: {
    marginBottom: 10,
  },
  bentoCard: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(241, 245, 249, 1)',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.03,
        shadowRadius: 10,
      },
      android: { elevation: 2 },
    }),
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarWrapper: {
    position: 'relative',
  },
  avatarImage: {
    width: 48,
    height: 48,
    borderRadius: 16,
  },
  initialsAvatar: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: colors.brand.primary + '10',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.brand.primary + '20',
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.brand.primary,
  },
  statusDot: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: colors.status.success,
    borderWidth: 2,
    borderColor: 'white',
  },
  userInfo: {
    flex: 1,
    marginLeft: 14,
  },
  userName: {
    fontFamily: typography.fontFamily,
    fontSize: 16,
    fontWeight: '800',
    color: colors.text.primary,
  },
  userRole: {
    fontFamily: typography.fontFamily,
    fontSize: 11,
    color: colors.text.tertiary,
    marginTop: 2,
  },
  cardActions: {
    marginLeft: 12,
  },
  dualActions: {
    flexDirection: 'row',
    gap: 8,
  },
  miniActionBtn: {
    width: 40,
    height: 40,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  acceptBtn: {
    backgroundColor: colors.brand.primary,
  },
  declineBtn: {
    backgroundColor: colors.status.error + '10',
  },
  messagePrompt: {
    backgroundColor: colors.brand.primary,
    width: 44,
    height: 44,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: colors.brand.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
      },
      android: { elevation: 4 },
    }),
  },
  statusPill: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  statusPillText: {
    fontSize: 9,
    fontWeight: '800',
    color: colors.text.tertiary,
    letterSpacing: 0.5,
  },
  emptyContainer: {
    marginTop: 80,
    alignItems: 'center',
    paddingHorizontal: spacing.xxl,
  },
  emptyIllustration: {
    position: 'relative',
    marginBottom: 24,
    width: 80,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
  },
  illustrationCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.brand.primary + '10',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },
  illustrationRing: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 1,
    borderColor: colors.brand.primary + '10',
    zIndex: 1,
  },
  emptyTitle: {
    fontFamily: typography.fontFamily,
    fontSize: 18,
    fontWeight: '800',
    color: colors.text.primary,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyMessage: {
    fontFamily: typography.fontFamily,
    fontSize: 14,
    lineHeight: 22,
    color: colors.text.tertiary,
    textAlign: 'center',
  },
});

export default ChatRequestsScreen;
