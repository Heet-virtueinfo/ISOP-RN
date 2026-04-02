import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, radius, typography } from '../theme';
import { Message } from '../types';

interface MessageBubbleProps {
  message: Message;
  isMe: boolean;
}

const MessageBubble = ({ message, isMe }: MessageBubbleProps) => {
  const formatTime = (timestamp: any) => {
    if (!timestamp) return '';
    const date =
      typeof timestamp.toDate === 'function'
        ? timestamp.toDate()
        : new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <View
      style={[
        styles.container,
        isMe ? styles.myContainer : styles.otherContainer,
      ]}
    >
      <View
        style={[styles.bubble, isMe ? styles.myBubble : styles.otherBubble]}
      >
        <Text style={[styles.text, isMe ? styles.myText : styles.otherText]}>
          {message.text}
        </Text>
      </View>
      <Text style={styles.time}>{formatTime(message.createdAt)}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: spacing.xs,
    maxWidth: '80%',
  },
  myContainer: {
    alignSelf: 'flex-end',
    alignItems: 'flex-end',
  },
  otherContainer: {
    alignSelf: 'flex-start',
    alignItems: 'flex-start',
  },
  bubble: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.lg,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  myBubble: {
    backgroundColor: colors.brand.primary,
    borderBottomRightRadius: 4,
  },
  otherBubble: {
    backgroundColor: '#F1F5F9', // Light Slate (layout divider/surface tint)
    borderBottomLeftRadius: 4,
  },
  text: {
    fontFamily: typography.fontFamily,
    fontSize: 14,
    lineHeight: 20,
  },
  myText: {
    color: 'white',
  },
  otherText: {
    color: colors.text.primary,
  },
  time: {
    fontSize: 9,
    color: colors.text.tertiary,
    marginTop: 4,
    marginHorizontal: 4,
  },
});

export default MessageBubble;
