import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  Dimensions,
  Animated,
} from 'react-native';
import { WifiOff, RefreshCcw } from 'lucide-react-native';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { spacing } from '../theme/spacing';
import Button from './Button';
import NetInfo from '@react-native-community/netinfo';

const { width } = Dimensions.get('window');

const NoInternetScreen = () => {
  const [checking, setChecking] = React.useState(false);
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const slideAnim = React.useRef(new Animated.Value(20)).current;

  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideAnim]);

  const handleRetry = async () => {
    setChecking(true);
    // Add a small delay for better UX feel
    await new Promise<void>(resolve => setTimeout(resolve, 800));
    const state = await NetInfo.refresh();
    setChecking(false);
  };

  return (
    <View style={styles.container}>
      
      <Animated.View 
        style={[
          styles.content,
          { 
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
          }
        ]}
      >
        <View style={styles.iconContainer}>
          <View style={styles.iconBackground}>
            <WifiOff size={48} color={colors.brand.primary} strokeWidth={1.5} />
          </View>
        </View>

        <Text style={styles.title}>Connection Lost</Text>
        <Text style={styles.description}>
          It seems you're offline. Please check your internet connection and try again to continue using the app.
        </Text>

        <Button
          title="Try Again"
          onPress={handleRetry}
          loading={checking}
          style={styles.button}
        />
        
        <View style={styles.footer}>
          <Text style={styles.footerText}>Automatically reconnecting when available...</Text>
        </View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.layout.background,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  content: {
    alignItems: 'center',
    width: '100%',
    maxWidth: 400,
  },
  iconContainer: {
    marginBottom: spacing.xxl,
  },
  iconBackground: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.brand.primary + '10', // 10% opacity
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.brand.primary + '20',
  },
  title: {
    fontFamily: typography.fontFamily,
    fontSize: typography.sizes.xxl,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  description: {
    fontFamily: typography.fontFamily,
    fontSize: typography.sizes.md,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: typography.lineHeights.md,
    marginBottom: spacing.xxl,
    paddingHorizontal: spacing.lg,
  },
  button: {
    width: '100%',
    height: 56,
  },
  footer: {
    marginTop: spacing.xxl,
  },
  footerText: {
    fontFamily: typography.fontFamily,
    fontSize: typography.sizes.xs,
    color: colors.text.tertiary,
    fontStyle: 'italic',
  },
});

export default NoInternetScreen;
