import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Image,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  useRoute,
  useNavigation,
  useFocusEffect,
} from '@react-navigation/native';
import { ChevronLeft, Send, Image as ImageIcon } from 'lucide-react-native';
import { colors, spacing, typography } from '../../theme';
import { useAuth } from '../../contexts/AuthContext';
import {
  getMessages,
  sendMessage,
  markMessagesRead,
} from '../../services/chatService';
import { Message } from '../../types';
import MessageBubble from '../../components/MessageBubble';
import CustomLoader from '../../components/CustomLoader';
import { getEcho } from '../../services/echoService';
import { notificationService } from '../../services/notificationService';

const isSameDay = (date1: any, date2: any) => {
  if (!date1 || !date2) return false;
  const d1 = date1.toDate ? date1.toDate() : new Date(date1);
  const d2 = date2.toDate ? date2.toDate() : new Date(date2);
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
};

const formatSeparatorDate = (timestamp: any) => {
  if (!timestamp) return '';
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  const now = new Date();
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);

  if (isSameDay(date, now)) return 'Today';
  if (isSameDay(date, yesterday)) return 'Yesterday';

  return date.toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
};

const ChatScreen = () => {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { chatId, otherUserName, otherUserImage } = route.params;

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);
  const flatListRef = useRef<FlatList>(null);

  useFocusEffect(
    useCallback(() => {
      if (!chatId) return;
      notificationService.setActiveChatId(chatId);
      let isMounted = true;

      const fetchMessages = async () => {
        try {
          const data = await getMessages(chatId);
          if (isMounted) {
            setMessages(data);
            setLoading(false);
            // Only mark as read if there are unread messages from the other user
            const hasUnread = data.some(
              m => !m.read && m.senderId !== user?.uid,
            );
            if (user && hasUnread) {
              markMessagesRead(chatId, user.uid);
            }
          }
        } catch (error) {
          if (isMounted) setLoading(false);
        }
      };

      fetchMessages();

      const pusher = getEcho();
      if (!pusher) return;

      // In native Pusher, we manually join the private channel
      const channelName = `private-chat.${chatId}`;
      const eventName = 'App\\Events\\MessageSent';

      pusher.subscribe({
        channelName,
        onEvent: (event: any) => {
          if (event.eventName === eventName) {
            try {
              const data =
                typeof event.data === 'string'
                  ? JSON.parse(event.data)
                  : event.data;
              console.log('[ChatScreen] Real-Time Message Received:', data);

              const newMessage: Message = {
                id: String(data.id),
                senderId: String(data.sender_id || data.senderId),
                text: data.text || data.message || '',
                createdAt:
                  data.created_at || data.createdAt || new Date().toISOString(),
                read: false,
              };

              setMessages(prev => {
                // Prevent duplicates
                if (prev.some(m => m.id === newMessage.id)) return prev;
                return [newMessage, ...prev];
              });

              // Mark as read if it's from the other person
              if (user && newMessage.senderId !== user.uid) {
                markMessagesRead(chatId, user.uid);
              }
            } catch (e) {
              console.error('[ChatScreen] Error parsing Pusher event data:', e);
            }
          }
        },
      });

      return () => {
        notificationService.setActiveChatId(null);
        isMounted = false;
        pusher.unsubscribe({ channelName });
      };
    }, [chatId, user]),
  );

  const handleSend = async () => {
    if (!inputText.trim() || !user) return;

    const text = inputText.trim();
    setInputText(''); // Optimistic clear

    try {
      // The Pusher listener will catch the sent message instantly and push it to the screen.
      await sendMessage(chatId, user.uid, text);
    } catch (error) {
      console.error('Send message error:', error);
      // Optional: restore text on failure
      setInputText(text);
    }
  };

  const handleBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      // Fallback: Ensure user stays within the Chat feature if they arrived via a direct link
      navigation.navigate('ChatInbox');
    }
  };

  const renderHeader = () => (
    <View style={[styles.header, {paddingTop: insets.top}]}>
      <TouchableOpacity onPress={handleBack} style={styles.backBtn}>
        <ChevronLeft size={24} color={colors.text.primary} />
      </TouchableOpacity>

      <View style={styles.userInfo}>
        {otherUserImage ? (
          <Image source={{ uri: otherUserImage }} style={styles.headerAvatar} />
        ) : (
          <View style={styles.initialsAvatar}>
            <Text style={styles.initialsText}>{otherUserName[0]}</Text>
          </View>
        )}
        <Text style={styles.headerName}>{otherUserName}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {renderHeader()}

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        <View style={styles.messageArea}>
          {loading ? (
            <CustomLoader
              message="Loading encrypted messages..."
              overlay={false}
              style={{ flex: 1 }}
            />
          ) : (
            <FlatList
              ref={flatListRef}
              data={messages}
              keyExtractor={item => item.id}
              renderItem={({ item, index }) => {
                const messageDate = item.createdAt;
                const nextMessage = messages[index + 1];
                const showDateSeparator =
                  !nextMessage ||
                  !isSameDay(messageDate, nextMessage.createdAt);

                return (
                  <View>
                    {showDateSeparator && (
                      <View style={styles.dateSeparator}>
                        <View style={styles.dateLine} />
                        <View style={styles.dateCapsule}>
                          <Text style={styles.dateText}>
                            {formatSeparatorDate(messageDate)}
                          </Text>
                        </View>
                        <View style={styles.dateLine} />
                      </View>
                    )}
                    <MessageBubble
                      message={item}
                      isMe={item.senderId === user?.uid}
                    />
                  </View>
                );
              }}
              inverted
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
            />
          )}
        </View>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Write your message..."
            placeholderTextColor={colors.text.tertiary}
            value={inputText}
            onChangeText={setInputText}
            multiline
            maxLength={1000}
          />
          <TouchableOpacity
            style={[
              styles.sendBtn,
              !inputText.trim() && styles.sendBtnDisabled,
            ]}
            onPress={handleSend}
            disabled={!inputText.trim()}
          >
            <View
              style={{
                transform: [{ rotate: '45deg' }],
              }}
            >
              <Send size={20} color="white" />
            </View>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
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
    backgroundColor: colors.layout.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.layout.divider,
  },
  backBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 8,
  },
  headerAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  initialsAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(79, 70, 229, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  initialsText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.brand.primary,
  },
  headerName: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text.primary,
    marginLeft: 12,
  },
  messageArea: {
    flex: 1,
  },
  listContent: {
    padding: spacing.md,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.layout.surface,
    borderTopWidth: 1,
    borderTopColor: colors.layout.divider,
    gap: 12,
  },
  input: {
    flex: 1,
    minHeight: 44,
    maxHeight: 100,
    backgroundColor: colors.layout.background,
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 15,
    color: colors.text.primary,
    fontFamily: typography.fontFamily,
    borderWidth: 1,
    borderColor: colors.layout.divider,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.brand.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 0,
  },
  sendBtnDisabled: {
    backgroundColor: colors.text.tertiary,
    opacity: 0.5,
  },
  dateSeparator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 20,
    paddingHorizontal: spacing.md,
  },
  dateLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.layout.divider,
    opacity: 0.5,
  },
  dateCapsule: {
    backgroundColor: 'rgba(15, 23, 42, 0.05)',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    marginHorizontal: 12,
  },
  dateText: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.text.tertiary,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
});

export default ChatScreen;
