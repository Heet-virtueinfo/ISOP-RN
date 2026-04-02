import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { MessageSquare, UserCheck } from 'lucide-react-native';
import { colors, spacing, typography, radius } from '../theme';
import { Enrollment, ChatRequest, UserProfile } from '../types';
import { getChatRequestStatus, sendChatRequest } from '../services/chatService';
import CustomLoader from './CustomLoader';

interface ParticipantCardProps {
  participant: Enrollment;
  currentUser: UserProfile;
  eventTitle: string;
  onChatPress: (chatId: string, name: string, image: string | null) => void;
}

const ParticipantCard = ({
  participant,
  currentUser,
  eventTitle,
  onChatPress,
}: ParticipantCardProps) => {
  const [request, setRequest] = useState<ChatRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const isMe = participant.uid === currentUser.uid;

  useEffect(() => {
    if (isMe) {
      setLoading(false);
      return;
    }

    const fetchStatus = async () => {
      const status = await getChatRequestStatus(
        currentUser.uid,
        participant.uid,
      );
      setRequest(status);
      setLoading(false);
    };

    fetchStatus();
  }, [currentUser.uid, participant.uid, isMe]);

  const handleSendRequest = async () => {
    setActionLoading(true);
    try {
      const result = await sendChatRequest(
        currentUser,
        participant,
        participant.eventId,
        eventTitle,
      );
      if (result.success && result.chatRequest) {
        setRequest(result.chatRequest);
      }
    } catch (error) {
      console.error('Action error:', error);
    } finally {
      setActionLoading(false);
    }
  };

  const renderAction = () => {
    if (isMe)
      return (
        <View style={styles.meBadge}>
          <Text style={styles.meText}>YOU</Text>
        </View>
      );
    if (loading) return null;

    if (!request) {
      return (
        <TouchableOpacity
          style={styles.actionBtn}
          onPress={handleSendRequest}
          disabled={actionLoading}
        >
          {actionLoading ? (
            <CustomLoader
              size={20}
              overlay={false}
              color={colors.brand.primary}
            />
          ) : (
            <>
              <MessageSquare size={14} color={colors.brand.primary} />
              <Text style={styles.actionBtnText}>Request</Text>
            </>
          )}
        </TouchableOpacity>
      );
    }

    if (request.status === 'pending') {
      const sentByMe = request.fromUid === currentUser.uid;
      return (
        <View style={[styles.statusBadge, styles.pendingBadge]}>
          <Text style={styles.statusText}>
            {sentByMe ? 'Pending' : 'Requested'}
          </Text>
        </View>
      );
    }

    if (request.status === 'accepted') {
      return (
        <TouchableOpacity
          style={[styles.actionBtn, styles.chatBtn]}
          onPress={() => onChatPress(request.id, participant.displayName, participant.profileImage || null)}
        >
          <UserCheck size={14} color="white" />
          <Text style={[styles.actionBtnText, styles.chatBtnText]}>Chat</Text>
        </TouchableOpacity>
      );
    }

    return null;
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <View style={styles.container}>
      <View style={styles.avatarContainer}>
        {participant.profileImage ? (
          <Image
            source={{ uri: participant.profileImage }}
            style={styles.avatar}
          />
        ) : (
          <View style={[styles.avatar, styles.initialsAvatar]}>
            <Text style={styles.initialsText}>
              {getInitials(participant.displayName)}
            </Text>
          </View>
        )}
      </View>

      <View style={styles.info}>
        <Text style={styles.name}>{participant.displayName}</Text>
        <Text style={styles.email}>{participant.email}</Text>
      </View>

      <View style={styles.actionArea}>{renderAction()}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: colors.layout.surface,
    borderRadius: radius.lg,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.layout.divider,
  },
  avatarContainer: {
    marginRight: spacing.md,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  initialsAvatar: {
    backgroundColor: 'rgba(79, 70, 229, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  initialsText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.brand.primary,
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text.primary,
    fontFamily: typography.fontFamily,
    marginBottom: 2,
  },
  email: {
    fontSize: 12,
    color: colors.text.tertiary,
    fontFamily: typography.fontFamily,
  },
  actionArea: {
    marginLeft: spacing.sm,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(79, 70, 229, 0.05)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 6,
    minWidth: 85,
    justifyContent: 'center',
  },
  actionBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.brand.primary,
    fontFamily: typography.fontFamily,
  },
  chatBtn: {
    backgroundColor: colors.brand.primary,
  },
  chatBtnText: {
    color: 'white',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  pendingBadge: {
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
  },
  statusText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#D97706',
    textTransform: 'uppercase',
  },
  meBadge: {
    backgroundColor: 'rgba(0,0,0,0.05)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  meText: {
    fontSize: 9,
    fontWeight: '800',
    color: colors.text.tertiary,
  },
});

export default ParticipantCard;
