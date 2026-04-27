import React, { useEffect, useState } from 'react';
import { StyleSheet, Animated } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { getIncomingRequests } from '../services/chatService';

const ChatRequestBadge = () => {
  const { user } = useAuth();
  const [hasRequests, setHasRequests] = useState(false);
  const pulseAnim = new Animated.Value(1);

  useEffect(() => {
    if (!user) return;
    let isMounted = true;

    const fetchReqs = async () => {
      try {
        const requests = await getIncomingRequests();
        if (isMounted) {
          setHasRequests(requests.length > 0);
        }
      } catch (err) {}
    };

    fetchReqs();
    const interval = setInterval(fetchReqs, 15000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [user]);

  useEffect(() => {
    if (hasRequests) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ]),
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [hasRequests, pulseAnim]);

  if (!hasRequests) return null;

  return (
    <Animated.View
      style={[styles.badge, { transform: [{ scale: pulseAnim }] }]}
    />
  );
};

const styles = StyleSheet.create({
  badge: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#EF4444',
    borderWidth: 1.5,
    borderColor: 'white',
  },
});

export default ChatRequestBadge;
